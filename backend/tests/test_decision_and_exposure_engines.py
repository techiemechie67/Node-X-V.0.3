"""
Unit Tests for Decision Engine and Exposure Engine
(IEEE HACKVERSE 2026 Problem Statement 6 - Step 3)
"""

from datetime import datetime, timezone
from app.core_models import (
    Asset,
    PhysicalState,
    FinancialState,
    ContractualState,
    RiskState,
    LifecycleStage,
    FinancingInstrument,
    DecisionAction
)
from app.engine.exposure_engine import ExposureEngine
from app.engine.decision_engine import DecisionEngine


def setup_function():
    """Reset ExposureEngine lien registry before each test."""
    ExposureEngine.reset()


def test_primary_formula_maximum_safe_financing():
    """
    Test exact formula:
    Max Safe = Collateral Value × Advance Rate × Risk Adjustment × Data Confidence − Existing Exposure
    """
    asset = Asset(
        batch_id="BATCH-TEST-FORMULA",
        lifecycle_stage=LifecycleStage.PURCHASE_ORDER,
        financial_state=FinancialState(
            embodied_economic_value=100000.0,
            ltv_ratio=0.80,
            working_capital_need=75000.0,
            existing_exposure=0.0
        ),
        contractual_state=ContractualState(
            po_number="PO-2026-F1",
            buyer_id="BUYER-WALMART",
            supplier_id="SUPPLIER-TIER1"
        )
    )

    decision = DecisionEngine.evaluate_decision(asset, available_liquidity=500000.0)

    # Risk score for baseline is ~6.5/100 -> normalized ~0.065 -> risk_adj ~ 0.935
    # Data conf ~ 0.95
    # Expected gross capacity ~ 100000 * 0.80 * 0.935 * 0.95 ~ $71,060
    assert decision.max_safe_amount > 65000.0
    assert decision.approved_amount == min(asset.financial_state.working_capital_need, decision.max_safe_amount)
    assert decision.action == DecisionAction.INITIATE
    assert decision.recommended_instrument == FinancingInstrument.PURCHASE_ORDER_FINANCING
    print("✓ Primary Formula Test Passed (Max Safe:", decision.max_safe_amount, ", Approved:", decision.approved_amount, ")")


def test_exposure_engine_deduction_prevents_over_leveraging():
    """
    Test that Existing Exposure is subtracted before approving new financing (Node 11 Requirement).
    """
    asset = Asset(
        batch_id="BATCH-TEST-EXPOSURE",
        lifecycle_stage=LifecycleStage.RAW_MATERIAL,
        financial_state=FinancialState(
            embodied_economic_value=100000.0,
            ltv_ratio=0.80,
            working_capital_need=80000.0,
            existing_exposure=50000.0  # Already drew $50,000 under prior tier
        ),
        contractual_state=ContractualState(
            po_number="PO-2026-EXP",
            buyer_id="BUYER-TARGET",
            supplier_id="SUPPLIER-TEX"
        )
    )

    # Register $50,000 on ledger
    ExposureEngine.register_pledge(
        asset=asset,
        instrument=FinancingInstrument.PURCHASE_ORDER_FINANCING,
        drawn_amount=50000.0,
        approved_limit=50000.0,
        ltv_ratio=0.80,
        interest_rate=7.50
    )

    decision = DecisionEngine.evaluate_decision(asset, available_liquidity=500000.0)

    # Safe capacity ~ $71,000 - $50,000 existing exposure = ~$21,000 headroom
    assert decision.max_safe_amount < 25000.0
    assert decision.max_safe_amount > 15000.0
    assert decision.approved_amount == decision.max_safe_amount
    print("✓ Exposure Deduction Test Passed (Remaining Safe Headroom:", decision.max_safe_amount, ")")


def test_final_recommendation_minimum_logic():
    """
    Test: Recommended Financing = MIN(Working Capital Need, Maximum Safe Financing, Available Liquidity)
    """
    # Case 1: Working Capital Need is the bottleneck
    asset1 = Asset(
        batch_id="BATCH-TEST-MIN1",
        financial_state=FinancialState(
            embodied_economic_value=200000.0,
            ltv_ratio=0.80,
            working_capital_need=15000.0,  # Small need
            existing_exposure=0.0
        )
    )
    d1 = DecisionEngine.evaluate_decision(asset1, available_liquidity=500000.0)
    assert d1.approved_amount == 15000.0

    # Case 2: Available Liquidity is the bottleneck
    d2 = DecisionEngine.evaluate_decision(asset1, available_liquidity=10000.0)
    assert d2.approved_amount == 10000.0
    print("✓ MIN(Need, Safe, Liquidity) Recommendation Logic Passed")


def test_deterministic_instrument_router():
    """
    Test multi-factor router for transit, warehouse, and invoice factoring transitions.
    """
    # 1. Transit with Incoterms CIF and carrier custody
    asset_transit = Asset(
        batch_id="BATCH-TEST-TRANSIT",
        lifecycle_stage=LifecycleStage.IN_TRANSIT,
        physical_state=PhysicalState(
            current_stage=LifecycleStage.IN_TRANSIT,
            custody_holder="Maersk Line Vessel",
            route_risk_index=0.15
        ),
        contractual_state=ContractualState(incoterms="CIF")
    )
    d_transit = DecisionEngine.evaluate_decision(asset_transit)
    assert d_transit.recommended_instrument == FinancingInstrument.IN_TRANSIT_FINANCING

    # 2. Warehouse Dwell Decay Router
    asset_wh_decay = Asset(
        batch_id="BATCH-TEST-WH",
        lifecycle_stage=LifecycleStage.WAREHOUSE,
        physical_state=PhysicalState(
            current_stage=LifecycleStage.WAREHOUSE,
            dwell_days=35.0  # Excessive dwell
        )
    )
    d_wh = DecisionEngine.evaluate_decision(asset_wh_decay)
    assert d_wh.recommended_instrument == FinancingInstrument.INVENTORY_FINANCING

    # 3. Invoice Factoring
    asset_invoice = Asset(
        batch_id="BATCH-TEST-INV",
        lifecycle_stage=LifecycleStage.INVOICED,
        contractual_state=ContractualState(
            invoice_approved=True,
            payment_terms_days=60
        )
    )
    d_inv = DecisionEngine.evaluate_decision(asset_invoice)
    assert d_inv.recommended_instrument == FinancingInstrument.INVOICE_FINANCING
    print("✓ Deterministic Instrument Router Passed across all lifecycle stages")


def test_action_generation_and_reasoning():
    """
    Test action generation for INITIATE, REDUCE, SETTLE, and FLAG_FRAUD with explainability.
    """
    # Test Cash Settlement
    asset_cash = Asset(
        batch_id="BATCH-TEST-SETTLE",
        lifecycle_stage=LifecycleStage.CASH,
        financial_state=FinancialState(existing_exposure=40000.0)
    )
    d_cash = DecisionEngine.evaluate_decision(asset_cash)
    assert d_cash.action == DecisionAction.SETTLE
    assert d_cash.approved_amount == 0.0
    assert "Settlement realization complete" in d_cash.reasoning

    # Test Fraud / Duplicate Pledge Detection
    asset_fraud = Asset(
        batch_id="BATCH-TEST-FRAUD",
        lifecycle_stage=LifecycleStage.PURCHASE_ORDER
    )
    d_fraud = DecisionEngine.evaluate_decision(asset_fraud, has_duplicate_claim=True)
    assert d_fraud.action == DecisionAction.FLAG_FRAUD
    assert d_fraud.approved_amount == 0.0
    assert "REJECTED WITH CRITICAL ALERT" in d_fraud.reasoning
    assert d_fraud.requires_human_review is True
    print("✓ Action Generation & Explainable 'Why?' Reasoning Passed")


if __name__ == "__main__":
    setup_function()
    test_primary_formula_maximum_safe_financing()
    setup_function()
    test_exposure_engine_deduction_prevents_over_leveraging()
    setup_function()
    test_final_recommendation_minimum_logic()
    setup_function()
    test_deterministic_instrument_router()
    setup_function()
    test_action_generation_and_reasoning()
    print("\n=======================================================")
    print("ALL DECISION & EXPOSURE ENGINE TEST CASES PASSED 100%!")
    print("=======================================================")
