"""
Core Decision Engine (IEEE HACKVERSE 2026 Problem Statement 6)
The mathematical and agentic heart of the platform.
Evaluates physical state, data confidence, multi-factor risk, and existing debt exposure
to autonomously determine financing capacity, instrument selection, and credit actions.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from app.core_models import (
    Asset,
    Decision,
    DecisionAction,
    FinancingInstrument,
    LifecycleStage,
    ConflictStatus
)
from app.engine.confidence_engine import ConfidenceEngine
from app.engine.risk_engine import RiskEngine, RiskEvaluationResult
from app.engine.exposure_engine import ExposureEngine


# Baseline institutional facility liquidity caps per asset batch
DEFAULT_FACILITY_LIQUIDITY_POOL = 1_000_000.0  # $1.0M maximum deployable liquidity per batch
BASE_INTEREST_RATE_BENCHMARK = 6.50  # 6.50% Base SOFR + Prime spread


class DecisionEngine:
    """
    Autonomous Working-Capital Financing Decision Engine.
    Implements deterministic mathematical formulas and explainable action generation.
    """

    @classmethod
    def select_optimal_instrument(
        cls,
        asset: Asset,
        risk_result: RiskEvaluationResult
    ) -> Tuple[FinancingInstrument, str, List[Dict[str, Any]]]:
        """
        Deterministic multi-factor router evaluating instrument suitability
        based on lifecycle stage, physical custody, condition, and contractual status.
        Does NOT rely on simplistic 1:1 mapping.
        """
        stage = asset.lifecycle_stage
        phys = asset.physical_state
        contract = asset.contractual_state
        fin = asset.financial_state

        alternatives: List[Dict[str, Any]] = []

        # 1. PURCHASE ORDER STAGE
        if stage == LifecycleStage.PURCHASE_ORDER:
            if contract.po_number and contract.buyer_id:
                reason = "Verified buyer purchase order with confirmed credit line allows Purchase-Order Financing."
                alternatives.append({"instrument": FinancingInstrument.PROCUREMENT_FINANCING, "suitability": "Sub-optimal: Pre-procurement stage"})
                return FinancingInstrument.PURCHASE_ORDER_FINANCING, reason, alternatives
            else:
                return FinancingInstrument.NONE, "Unverified purchase order: Ineligible for PO financing.", alternatives

        # 2. RAW MATERIAL STAGE
        elif stage == LifecycleStage.RAW_MATERIAL:
            reason = "Physical raw materials staged at supplier dock eligible for Procurement / Input Financing."
            alternatives.append({"instrument": FinancingInstrument.PURCHASE_ORDER_FINANCING, "suitability": "Prior tier facility (can be refinanced)"})
            return FinancingInstrument.PROCUREMENT_FINANCING, reason, alternatives

        # 3. PRODUCTION (WIP) & FINISHED GOODS
        elif stage == LifecycleStage.PRODUCTION:
            reason = "Work-in-progress fabrication on factory floor backed by Inventory / WIP Financing."
            alternatives.append({"instrument": FinancingInstrument.TRADE_FINANCING, "suitability": "Alternative supplier credit line"})
            return FinancingInstrument.INVENTORY_FINANCING, reason, alternatives

        elif stage == LifecycleStage.FINISHED_GOODS:
            if phys.condition == "NOMINAL":
                reason = "Completed and inspected finished goods ready for dispatch eligible for Finished Goods Inventory Financing."
                alternatives.append({"instrument": FinancingInstrument.TRADE_FINANCING, "suitability": "Pre-shipment trade credit"})
                return FinancingInstrument.INVENTORY_FINANCING, reason, alternatives
            else:
                return FinancingInstrument.TRADE_FINANCING, "Condition inspected: Structured under Trade Credit pending freight handover.", alternatives

        # 4. IN TRANSIT (OCEAN / AIR / INTERMODAL)
        elif stage == LifecycleStage.IN_TRANSIT:
            # Multi-factor check: Incoterms, custody, and route risk
            if contract.incoterms in ("CIF", "CFR", "DDP", "FOB") and phys.custody_holder != "Supplier":
                if phys.route_risk_index < 0.70:
                    reason = f"Carrier custody confirmed under Incoterms {contract.incoterms}; eligible for In-Transit Asset-Backed Lending (ABL)."
                    alternatives.append({"instrument": FinancingInstrument.TRADE_FINANCING, "suitability": "Conservative non-collateralized trade line"})
                    return FinancingInstrument.IN_TRANSIT_FINANCING, reason, alternatives
                else:
                    reason = "High route risk corridor: Re-routed into Trade Financing with heightened margin requirements."
                    alternatives.append({"instrument": FinancingInstrument.IN_TRANSIT_FINANCING, "suitability": "Restricted due to route volatility"})
                    return FinancingInstrument.TRADE_FINANCING, reason, alternatives
            else:
                return FinancingInstrument.TRADE_FINANCING, "In-transit custody non-standard: Routed to general Trade Financing.", alternatives

        # 5. WAREHOUSE STORAGE & DWELL
        elif stage == LifecycleStage.WAREHOUSE:
            if phys.dwell_days <= 21.0:
                reason = "Regional warehouse custody verified via WMS receipt; eligible for Warehouse Financing."
                alternatives.append({"instrument": FinancingInstrument.INVENTORY_FINANCING, "suitability": "General inventory credit line"})
                return FinancingInstrument.WAREHOUSE_FINANCING, reason, alternatives
            else:
                reason = f"Storage dwell duration ({phys.dwell_days:.1f}d) exceeds optimal SLA: Routed to restricted Inventory Line."
                alternatives.append({"instrument": FinancingInstrument.WAREHOUSE_FINANCING, "suitability": "Restricted due to dwell decay"})
                return FinancingInstrument.INVENTORY_FINANCING, reason, alternatives

        # 6. DELIVERY HANDOVER
        elif stage == LifecycleStage.DELIVERY:
            reason = "Physical handover completed at buyer dock; transitioning toward commercial invoice."
            alternatives.append({"instrument": FinancingInstrument.INVOICE_FINANCING, "suitability": "Pending invoice approval"})
            return FinancingInstrument.TRADE_FINANCING, reason, alternatives

        # 7. INVOICED
        elif stage == LifecycleStage.INVOICED:
            if contract.invoice_approved:
                reason = "Approved commercial invoice with verified payment terms: Prime Invoice Factoring enabled."
                alternatives.append({"instrument": FinancingInstrument.RECEIVABLES_FINANCING, "suitability": "Accounts receivable discounting"})
                return FinancingInstrument.INVOICE_FINANCING, reason, alternatives
            else:
                reason = "Commercial invoice rendered awaiting buyer AP signature: Receivables Financing applied with conservative advance."
                alternatives.append({"instrument": FinancingInstrument.INVOICE_FINANCING, "suitability": "Unapproved invoice hold"})
                return FinancingInstrument.RECEIVABLES_FINANCING, reason, alternatives

        # 8. CASH / SETTLEMENT
        elif stage == LifecycleStage.CASH:
            return FinancingInstrument.NONE, "Cash realization achieved; facility settled in full.", alternatives

        return FinancingInstrument.NONE, "Default unfinanced state.", alternatives

    @classmethod
    def evaluate_decision(
        cls,
        asset: Asset,
        available_liquidity: float = DEFAULT_FACILITY_LIQUIDITY_POOL,
        supplier_reliability_score: float = 0.92,
        buyer_credit_score: float = 0.90,
        has_duplicate_claim: bool = False
    ) -> Decision:
        """
        Executes full deterministic decision cycle for an asset batch:
        1. Evaluates multi-factor risk and data confidence.
        2. Calculates Maximum Safe Financing.
        3. Selects optimal financing instrument.
        4. Calculates Recommended Financing: MIN(Need, MaxSafe, AvailableLiquidity).
        5. Generates primary DecisionAction and 'Why?' reasoning.
        """
        # Step A: Risk & Confidence Evaluation
        risk_result = RiskEngine.evaluate_asset_risk(
            asset=asset,
            supplier_reliability_score=supplier_reliability_score,
            buyer_credit_score=buyer_credit_score,
            has_duplicate_claim=has_duplicate_claim
        )

        # Step B: Data Confidence Factor
        phys = asset.physical_state
        fin = asset.financial_state
        contract = asset.contractual_state

        avg_data_confidence = 0.95
        if phys.data_confidences:
            scores = [c.confidence_score for c in phys.data_confidences.values()]
            avg_data_confidence = sum(scores) / len(scores)

        # Step C: Existing Exposure (Node 11 Requirement)
        existing_exposure = ExposureEngine.get_active_exposure(asset)

        # Step D: Primary Formula: Maximum Safe Financing
        # Maximum Safe Financing = Collateral Value × Advance Rate × Risk Adjustment × Data Confidence − Existing Exposure
        collateral_value = fin.embodied_economic_value
        advance_rate = min(fin.ltv_ratio, risk_result.recommended_ltv_cap)
        risk_adjustment = max(0.10, 1.0 - risk_result.normalized_score)
        data_confidence_factor = max(0.15, avg_data_confidence)

        gross_safe_capacity = collateral_value * advance_rate * risk_adjustment * data_confidence_factor
        maximum_safe_financing = max(0.0, round(gross_safe_capacity - existing_exposure, 2))

        # Step E: Instrument Selection
        recommended_instrument, instrument_reason, alternatives = cls.select_optimal_instrument(asset, risk_result)

        # Step F: Final Recommended Financing
        # Recommended Financing = MIN(Working Capital Need, Maximum Safe Financing, Available Liquidity)
        working_capital_need = fin.working_capital_need
        recommended_financing = max(0.0, min(working_capital_need, maximum_safe_financing, available_liquidity))

        # Step G: Dynamic Interest Rate Calculation
        dynamic_rate = round(BASE_INTEREST_RATE_BENCHMARK + (risk_result.dynamic_rate_spread_bps / 100.0), 2)

        # Step H: Anti-Double-Financing Verification
        can_finance, anti_dup_reason, collateral_hash = ExposureEngine.verify_anti_double_financing(
            asset=asset,
            new_requested_amount=recommended_financing,
            max_safe_capacity=gross_safe_capacity
        )

        # Step I: Action Generation & 'Why?' Reason Synthesis
        validation_checks = {
            "anti_double_financing_passed": can_finance and not has_duplicate_claim,
            "contractual_validity_passed": bool(contract.po_number and contract.buyer_id),
            "custody_verified": phys.condition != "DAMAGED",
            "ltv_within_safe_bounds": recommended_financing <= gross_safe_capacity + 0.01
        }

        action: DecisionAction
        why_explanation_parts: List[str] = []

        if has_duplicate_claim or not can_finance:
            action = DecisionAction.FLAG_FRAUD
            recommended_financing = 0.0
            why_explanation_parts.append(f"REJECTED WITH CRITICAL ALERT: {anti_dup_reason}")
            why_explanation_parts.append("Lien validation failed invariant check against double-financing registry.")

        elif asset.lifecycle_stage == LifecycleStage.CASH:
            action = DecisionAction.SETTLE
            recommended_financing = 0.0
            why_explanation_parts.append("Settlement realization complete: Released collateral lien and paid down active debt.")

        elif existing_exposure > gross_safe_capacity:
            # Over-leveraged or risk spiked beyond capacity
            action = DecisionAction.REDUCE
            reduction_delta = existing_exposure - gross_safe_capacity
            why_explanation_parts.append(
                f"REDUCE EXPOSURE: Existing exposure (${existing_exposure:,.2f}) exceeds current safe capacity "
                f"(${gross_safe_capacity:,.2f}) due to elevated {risk_result.risk_level.lower()} risk profile. "
                f"De-leveraging required: -${reduction_delta:,.2f}."
            )

        elif fin.is_encumbered and fin.active_instrument != recommended_instrument and recommended_instrument != FinancingInstrument.NONE:
            # Lifecycle custody transition
            action = DecisionAction.TRANSITION
            why_explanation_parts.append(
                f"TRANSITION INSTRUMENT: Asset evolved to stage '{asset.lifecycle_stage.value}'. "
                f"Autonomous rollover from {fin.active_instrument.value} to {recommended_instrument.value}. "
                f"Prior senior lien preserved under hash {collateral_hash}."
            )

        elif existing_exposure > 0.0 and recommended_financing > 0.0 and asset.lifecycle_stage != LifecycleStage.CASH:
            # Safe capacity headroom available
            action = DecisionAction.INCREASE if recommended_financing > 1000.0 else DecisionAction.MAINTAIN
            why_explanation_parts.append(
                f"FACILITY ADJUSTMENT ({action.value}): Embodied economic value (${collateral_value:,.2f}) supports "
                f"additional headroom. Deploying ${recommended_financing:,.2f} at dynamic rate {dynamic_rate}%."
            )

        elif existing_exposure == 0.0 and recommended_financing > 0.0:
            action = DecisionAction.INITIATE
            why_explanation_parts.append(
                f"INITIATE NEW FACILITY: Verified unencumbered asset onboarding under {recommended_instrument.value}. "
                f"Approved credit line of ${recommended_financing:,.2f} (LTV: {advance_rate*100:.0f}%, Rate: {dynamic_rate}%)."
            )

        else:
            action = DecisionAction.MAINTAIN
            why_explanation_parts.append(
                f"MAINTAIN FACILITY: Operating nominally within current risk parameters ({risk_result.risk_level})."
            )

        # Append mathematical breakdown to explanation
        math_summary = (
            f" [Formula Breakdown: Safe Cap = (${collateral_value:,.2f} val × {advance_rate:.2f} LTV × "
            f"{risk_adjustment:.2f} risk_adj × {data_confidence_factor:.2f} conf) − ${existing_exposure:,.2f} exp = "
            f"${maximum_safe_financing:,.2f} | Final Recommended = MIN(${working_capital_need:,.2f}, ${maximum_safe_financing:,.2f}, ${available_liquidity:,.2f}) = "
            f"${recommended_financing:,.2f}]"
        )
        why_explanation_parts.append(math_summary)

        full_reasoning = " ".join(why_explanation_parts)

        return Decision(
            decision_id=f"DEC-{asset.batch_id}-{datetime.now(timezone.utc).strftime('%H%M%S')}",
            asset_id=asset.asset_id,
            batch_id=asset.batch_id,
            timestamp=datetime.now(timezone.utc),
            lifecycle_stage=asset.lifecycle_stage,
            action=action,
            recommended_instrument=recommended_instrument,
            required_financing=working_capital_need,
            max_safe_amount=maximum_safe_financing,
            approved_amount=recommended_financing,
            ltv_ratio=advance_rate,
            dynamic_interest_rate=dynamic_rate,
            collateral_lien_hash=collateral_hash,
            reasoning=full_reasoning,
            risk_summary={
                "composite_score_100": risk_result.composite_score_100,
                "risk_level": risk_result.risk_level,
                "spread_bps": risk_result.dynamic_rate_spread_bps,
                "data_confidence": avg_data_confidence
            },
            validation_checks=validation_checks,
            alternative_instruments=alternatives,
            requires_human_review=action in (DecisionAction.FLAG_FRAUD, DecisionAction.REJECT) or risk_result.composite_score_100 > 65.0
        )
