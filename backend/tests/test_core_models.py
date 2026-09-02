"""
Unit Tests for Core Asset Data Models & Decision Output Models
(IEEE HACKVERSE 2026 Problem Statement 6)
"""

import uuid
from datetime import datetime, timezone
from app.core_models import (
    LifecycleStage,
    FinancingInstrument,
    DecisionAction,
    DataSource,
    ConflictStatus,
    DataConfidence,
    DataPoint,
    PhysicalState,
    FinancialState,
    ContractualState,
    RiskState,
    Asset,
    Decision
)


def test_lifecycle_stages_count():
    """Verify exactly 9 lifecycle stages from Purchase Order to Cash."""
    stages = [
        LifecycleStage.PURCHASE_ORDER,
        LifecycleStage.RAW_MATERIAL,
        LifecycleStage.PRODUCTION,
        LifecycleStage.FINISHED_GOODS,
        LifecycleStage.IN_TRANSIT,
        LifecycleStage.WAREHOUSE,
        LifecycleStage.DELIVERY,
        LifecycleStage.INVOICED,
        LifecycleStage.CASH
    ]
    assert len(stages) == 9
    assert len(LifecycleStage) == 9


def test_financing_instruments_count():
    """Verify the 8 core financing instruments from the Problem Statement."""
    instruments = [
        FinancingInstrument.PURCHASE_ORDER_FINANCING,
        FinancingInstrument.PROCUREMENT_FINANCING,
        FinancingInstrument.INVENTORY_FINANCING,
        FinancingInstrument.IN_TRANSIT_FINANCING,
        FinancingInstrument.WAREHOUSE_FINANCING,
        FinancingInstrument.TRADE_FINANCING,
        FinancingInstrument.INVOICE_FINANCING,
        FinancingInstrument.RECEIVABLES_FINANCING,
    ]
    assert len(instruments) == 8
    # Instrument NONE is also supported for settled/unfinanced states
    assert FinancingInstrument.NONE.value == "NONE"


def test_data_confidence_model():
    """Verify DataConfidence provenance, timestamp, and conflict status."""
    conf = DataConfidence(
        source=DataSource.IOT_TELEMETRY,
        confidence_score=0.98,
        conflict_status=ConflictStatus.NO_CONFLICT,
        raw_source_id="SENSOR-GPS-4412"
    )
    assert conf.confidence_score == 0.98
    assert conf.source == DataSource.IOT_TELEMETRY
    assert conf.conflict_status == ConflictStatus.NO_CONFLICT

    dp = DataPoint(
        field_name="location",
        value="Port of Singapore",
        confidence=conf
    )
    assert dp.field_name == "location"
    assert dp.value == "Port of Singapore"
    assert dp.confidence.confidence_score == 0.98


def test_central_asset_and_nested_states():
    """Verify central Asset instantiation with 4 nested state containers."""
    phys = PhysicalState(
        current_stage=LifecycleStage.IN_TRANSIT,
        location="Trans-Pacific Container Route",
        custody_holder="Ocean Carrier Line",
        quantity=5000,
        unit="units",
        delay_days=3.5,
        dwell_days=0.0
    )

    fin = FinancialState(
        embodied_economic_value=250000.0,
        base_cost=180000.0,
        working_capital_need=200000.0,
        active_instrument=FinancingInstrument.IN_TRANSIT_FINANCING,
        drawn_amount=160000.0,
        approved_amount=170000.0,
        dynamic_interest_rate=7.85,
        ltv_ratio=0.85,
        collateral_lien_hash="0x89ABCDEF12345678",
        is_encumbered=True
    )

    contract = ContractualState(
        po_number="PO-2026-X99",
        buyer_id="BUYER-TECH-CORP",
        supplier_id="SUPPLIER-SEMI-CORP",
        incoterms="CIF",
        agreed_price=250000.0,
        payment_terms_days=60,
        legal_title_holder="SUPPLIER-SEMI-CORP"
    )

    risk = RiskState(
        composite_risk_score=0.18,
        operational_risk=0.10,
        transit_logistics_risk=0.25,
        counterparty_buyer_risk=0.05,
        trend="INCREASING"
    )

    asset = Asset(
        batch_id="BATCH-NX-TEST-01",
        name="Microcontroller Batch 01",
        lifecycle_stage=LifecycleStage.IN_TRANSIT,
        physical_state=phys,
        financial_state=fin,
        contractual_state=contract,
        risk_state=risk
    )

    assert asset.batch_id == "BATCH-NX-TEST-01"
    assert asset.lifecycle_stage == LifecycleStage.IN_TRANSIT
    assert asset.physical_state.location == "Trans-Pacific Container Route"
    assert asset.financial_state.drawn_amount == 160000.0
    assert asset.financial_state.is_encumbered is True
    assert asset.contractual_state.incoterms == "CIF"
    assert asset.risk_state.composite_risk_score == 0.18

    # Serialization roundtrip
    dumped = asset.model_dump()
    reloaded = Asset.model_validate(dumped)
    assert reloaded.batch_id == asset.batch_id
    assert reloaded.financial_state.collateral_lien_hash == "0x89ABCDEF12345678"


def test_decision_output_model():
    """Verify Decision model output structure with required fields and reasoning."""
    decision = Decision(
        asset_id=str(uuid.uuid4()),
        batch_id="BATCH-NX-TEST-01",
        lifecycle_stage=LifecycleStage.IN_TRANSIT,
        action=DecisionAction.REDUCE,
        recommended_instrument=FinancingInstrument.IN_TRANSIT_FINANCING,
        required_financing=200000.0,
        max_safe_amount=170000.0,
        approved_amount=160000.0,
        ltv_ratio=0.80,
        dynamic_interest_rate=8.20,
        collateral_lien_hash="0x99FF88AA11223344",
        reasoning="Transit delay +3.5 days in Red Sea corridor elevated logistical risk index. Approved amount reduced to $160,000 to maintain conservative capital defense.",
        risk_summary={
            "composite_risk": 0.22,
            "transit_risk": 0.35,
            "rate_spread_bps": 70
        },
        validation_checks={
            "anti_double_financing_passed": True,
            "contractual_validity_passed": True,
            "custody_verified": True,
            "ltv_within_safe_bounds": True
        }
    )

    assert decision.action == DecisionAction.REDUCE
    assert decision.recommended_instrument == FinancingInstrument.IN_TRANSIT_FINANCING
    assert decision.required_financing == 200000.0
    assert decision.max_safe_amount == 170000.0
    assert decision.approved_amount == 160000.0
    assert "Transit delay" in decision.reasoning
    assert decision.validation_checks["anti_double_financing_passed"] is True

    # JSON serialization
    json_str = decision.model_dump_json()
    assert "BATCH-NX-TEST-01" in json_str


if __name__ == "__main__":
    test_lifecycle_stages_count()
    test_financing_instruments_count()
    test_data_confidence_model()
    test_central_asset_and_nested_states()
    test_decision_output_model()
    print("All core_models tests passed 100%!")
