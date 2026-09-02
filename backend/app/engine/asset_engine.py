"""
Supply Chain Financing Intelligence Engine — Financing Decision Engine (Phase 2).
Implements the 9-step decision loop:
1. Track Asset
2. Verify Physical State (reconciliation & confidence)
3. Assess Value & Risk (10-component risk engine & stage-gating)
4. Identify Financing Need (working capital & gap analysis)
5. Select Instrument (lifecycle mapping & alternative rejections)
6. Determine Financing Amount (over-leverage & duplicate-financing guard)
7. Monitor Lifecycle (event-driven state progression)
8. Refinance / Transition (dynamic pricing & spread adjustments)
9. Settle (lien release & facility settlement)
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple

from app.asset_models import (
    Asset,
    DataPoint,
    DataSource,
    Decision,
    DecisionAction,
    Event,
    EventType,
    FinancingFacility,
    FinancingInstrument,
    LifecycleStage,
    RiskState,
)


# ==============================================================================
# 1. PHYSICAL STATE VERIFICATION (§8)
# ==============================================================================

def reconcile_data_point(
    existing: Optional[DataPoint],
    incoming: DataPoint,
    stale_hours_threshold: float = 72.0,
    conflict_confidence_gap: float = 0.15
) -> Tuple[DataPoint, str]:
    """
    Reconciles existing and incoming data points.
    - Resolves conflicts based on confidence score and timestamp freshness.
    - Flags status='CONFLICT' when two distinct sources disagree with a small confidence gap (<0.15).
    - Flags status='STALE' when data exceeds freshness threshold without corroboration.
    - Never silently overwrites — returns the resolved DataPoint + explainable resolution note.
    """
    if existing is None:
        note = f"Initial data point for field '{incoming.field}' recorded with confidence {incoming.confidence:.2f} via {incoming.source.value}."
        return incoming, note

    # Check value disagreement
    values_differ = False
    try:
        if isinstance(existing.value, (int, float)) and isinstance(incoming.value, (int, float)):
            max_v = max(abs(existing.value), abs(incoming.value), 1.0)
            values_differ = (abs(existing.value - incoming.value) / max_v) > 0.05
        else:
            values_differ = str(existing.value).strip().lower() != str(incoming.value).strip().lower()
    except Exception:
        values_differ = existing.value != incoming.value

    # Parse timestamps for staleness
    now = datetime.now(timezone.utc)
    try:
        in_time = datetime.fromisoformat(incoming.timestamp.replace("Z", "+00:00"))
        is_stale = (now - in_time) > timedelta(hours=stale_hours_threshold)
    except Exception:
        is_stale = False

    conf_gap = incoming.confidence - existing.confidence

    # A genuine multi-source conflict occurs when distinct sources report conflicting values simultaneously
    if values_differ and (existing.source != incoming.source) and abs(conf_gap) < conflict_confidence_gap:
        resolved = incoming if incoming.confidence >= existing.confidence else existing
        resolved_copy = resolved.model_copy(deep=True)
        resolved_copy.status = "CONFLICT"
        note = (
            f"Conflict detected on '{incoming.field}' between {existing.source.value} ({existing.value}) "
            f"and {incoming.source.value} ({incoming.value}). Confidence gap {abs(conf_gap):.2f} < {conflict_confidence_gap:.2f}. "
            f"Retained {resolved_copy.source.value} under CONFLICT status."
        )
        return resolved_copy, note

    if is_stale:
        resolved_copy = incoming.model_copy(deep=True)
        resolved_copy.status = "STALE"
        note = f"DataPoint '{incoming.field}' timestamp is older than {stale_hours_threshold}h without recent telemetry."
        return resolved_copy, note

    # Clear resolution: prefer higher confidence, tie-break by newer timestamp
    if conf_gap > 0:
        note = (
            f"Updated '{incoming.field}' from {existing.source.value} to {incoming.source.value} "
            f"(Confidence improved: {existing.confidence:.2f} -> {incoming.confidence:.2f})."
        )
        return incoming, note
    elif conf_gap < 0 and existing.source != incoming.source:
        note = (
            f"Retained existing '{existing.field}' from {existing.source.value} (Confidence {existing.confidence:.2f} "
            f"higher than incoming {incoming.source.value} {incoming.confidence:.2f})."
        )
        return existing, note
    else:
        note = f"Synchronized '{incoming.field}' to latest telemetry from {incoming.source.value}."
        return incoming, note


# ==============================================================================
# 2. RISK ASSESSMENT (§7)
# ==============================================================================

def compute_risk_state(asset: Asset) -> RiskState:
    """
    Computes 10-component RiskState with stage-gating.
    - Always-on components: buyerRisk, supplierRisk, marketRisk, paymentRisk, dataConfidence, duplicateFinancingRisk.
    - Stage-gated components:
      * productionRisk: active during PURCHASE_ORDER, RAW_MATERIAL, PRODUCTION.
      * logisticsRisk: active during IN_TRANSIT (scaled by route risk, port delays, shock magnitude).
      * inventoryRisk: active during RAW_MATERIAL, PRODUCTION, WAREHOUSE (scaled by dwell duration).
      * physicalAssetRisk: active across physical custody (RAW_MATERIAL -> DELIVERED).
    """
    stage = asset.lifecycleStage
    physical = asset.physicalState
    financial = asset.financialState
    contractual = asset.contractualState

    # Baseline always-on assessments
    buyer_risk = 0.10
    supplier_risk = 0.10
    market_risk = 0.08
    payment_risk = 0.08
    duplicate_risk = 1.0 if contractual.isEncumbered and asset.existingExposure > financial.estimatedValue else (
        0.85 if contractual.isEncumbered and not asset.activeFacility else 0.0
    )

    # 1. Physical Asset Risk (Condition / Spoilage / Damage)
    physical_asset_risk = 0.05
    if physical.condition == "DAMAGED":
        physical_asset_risk = 0.65
    elif physical.condition == "DEGRADED":
        physical_asset_risk = 0.35
    if physical.temperatureCelsius is not None and (physical.temperatureCelsius > 25.0 or physical.temperatureCelsius < -5.0):
        physical_asset_risk = min(1.0, physical_asset_risk + 0.25)

    # 2. Production Risk (Stage-Gated)
    active_production = stage in [LifecycleStage.PURCHASE_ORDER, LifecycleStage.RAW_MATERIAL, LifecycleStage.PRODUCTION]
    if active_production:
        production_risk = 0.10 if stage == LifecycleStage.PURCHASE_ORDER else (
            0.15 if stage == LifecycleStage.RAW_MATERIAL else 0.08
        )
        if physical.delayDays > 0 and stage == LifecycleStage.PRODUCTION:
            production_risk = min(1.0, production_risk + 0.02 * physical.delayDays)
    else:
        production_risk = 0.02

    # 3. Logistics Risk (Stage-Gated: IN_TRANSIT)
    active_logistics = stage == LifecycleStage.IN_TRANSIT
    if active_logistics:
        logistics_risk = 0.12 + (physical.routeRiskIndex * 0.35)
        if physical.delayDays > 0:
            logistics_risk = min(1.0, logistics_risk + min(0.55, physical.delayDays * 0.035))
    elif stage in [LifecycleStage.DELIVERED, LifecycleStage.INVOICED, LifecycleStage.RECEIVABLE, LifecycleStage.CASH]:
        logistics_risk = 0.02
    else:
        logistics_risk = 0.04

    # 4. Inventory / Dwell Risk (Stage-Gated: RAW_MATERIAL, PRODUCTION, WAREHOUSE)
    active_inventory = stage in [LifecycleStage.RAW_MATERIAL, LifecycleStage.PRODUCTION, LifecycleStage.WAREHOUSE]
    if active_inventory:
        inventory_risk = 0.08
        if physical.dwellDays > 7.0:
            inventory_risk = min(1.0, inventory_risk + min(0.60, (physical.dwellDays - 7.0) * 0.04))
    else:
        inventory_risk = 0.02

    # 5. Payment Risk (Active at DELIVERED / INVOICED / RECEIVABLE)
    if stage in [LifecycleStage.INVOICED, LifecycleStage.RECEIVABLE]:
        payment_risk = 0.10
        if physical.delayDays > 10.0:
            payment_risk += 0.08
    elif stage == LifecycleStage.CASH:
        payment_risk = 0.0
    else:
        payment_risk = 0.05

    # 6. Data Confidence Calculation
    all_points = list(physical.dataPoints.values()) + list(financial.dataPoints.values()) + list(contractual.dataPoints.values())
    if all_points:
        conf_sum = sum(dp.confidence for dp in all_points)
        conflict_penalty = sum(0.15 for dp in all_points if dp.status == "CONFLICT")
        stale_penalty = sum(0.10 for dp in all_points if dp.status == "STALE")
        data_confidence = max(0.40, min(1.0, (conf_sum / len(all_points)) - conflict_penalty - stale_penalty))
    else:
        data_confidence = 0.95

    # Active components tagging
    active_components = ["buyerRisk", "supplierRisk", "marketRisk", "dataConfidence", "duplicateFinancingRisk"]
    if active_production:
        active_components.append("productionRisk")
    if active_logistics:
        active_components.append("logisticsRisk")
    if active_inventory:
        active_components.append("inventoryRisk")
    if stage in [LifecycleStage.RAW_MATERIAL, LifecycleStage.PRODUCTION, LifecycleStage.IN_TRANSIT, LifecycleStage.WAREHOUSE, LifecycleStage.DELIVERED]:
        active_components.append("physicalAssetRisk")
    if stage in [LifecycleStage.DELIVERED, LifecycleStage.INVOICED, LifecycleStage.RECEIVABLE]:
        active_components.append("paymentRisk")

    # Weighted Composite Score
    weights = {
        "buyerRisk": 0.10,
        "supplierRisk": 0.10,
        "physicalAssetRisk": 0.12 if "physicalAssetRisk" in active_components else 0.02,
        "productionRisk": 0.15 if "productionRisk" in active_components else 0.02,
        "logisticsRisk": 0.20 if "logisticsRisk" in active_components else 0.02,
        "inventoryRisk": 0.15 if "inventoryRisk" in active_components else 0.02,
        "marketRisk": 0.08,
        "paymentRisk": 0.15 if "paymentRisk" in active_components else 0.04,
        "duplicateFinancingRisk": 0.20,
    }
    total_w = sum(weights.values())

    raw_score = (
        buyer_risk * weights["buyerRisk"] +
        supplier_risk * weights["supplierRisk"] +
        physical_asset_risk * weights["physicalAssetRisk"] +
        production_risk * weights["productionRisk"] +
        logistics_risk * weights["logisticsRisk"] +
        inventory_risk * weights["inventoryRisk"] +
        market_risk * weights["marketRisk"] +
        payment_risk * weights["paymentRisk"] +
        duplicate_risk * weights["duplicateFinancingRisk"]
    ) / total_w

    if data_confidence < 0.70:
        raw_score = min(1.0, raw_score + (0.70 - data_confidence) * 0.30)

    composite_score = round(max(0.02, min(1.0, raw_score)), 4)

    breakdown = {
        "buyerRisk": round(buyer_risk, 3),
        "supplierRisk": round(supplier_risk, 3),
        "physicalAssetRisk": round(physical_asset_risk, 3),
        "productionRisk": round(production_risk, 3),
        "logisticsRisk": round(logistics_risk, 3),
        "inventoryRisk": round(inventory_risk, 3),
        "marketRisk": round(market_risk, 3),
        "paymentRisk": round(payment_risk, 3),
        "dataConfidence": round(data_confidence, 3),
        "duplicateFinancingRisk": round(duplicate_risk, 3),
    }

    return RiskState(
        buyerRisk=buyer_risk,
        supplierRisk=supplier_risk,
        physicalAssetRisk=physical_asset_risk,
        productionRisk=production_risk,
        logisticsRisk=logistics_risk,
        inventoryRisk=inventory_risk,
        marketRisk=market_risk,
        paymentRisk=payment_risk,
        dataConfidence=data_confidence,
        duplicateFinancingRisk=duplicate_risk,
        compositeScore=composite_score,
        activeComponents=active_components,
        breakdown=breakdown
    )


# ==============================================================================
# 3. FINANCING NEED & MAXIMUM SAFE AMOUNT (§11 / §19)
# ==============================================================================

def assess_financing_need(asset: Asset) -> Tuple[bool, float]:
    """
    Evaluates whether the asset requires financing and the required working capital amount.
    """
    if asset.lifecycleStage == LifecycleStage.CASH:
        return False, 0.0

    working_capital_need = asset.financialState.workingCapitalNeed
    financing_required = working_capital_need > 0.0
    return financing_required, round(working_capital_need, 2)


def maximum_safe_amount(asset: Asset, risk: RiskState) -> float:
    """
    Caps the maximum safe financing capacity based on asset valuation, risk discount,
    and anti-double-financing invariant rules.
    """
    if risk.duplicateFinancingRisk >= 0.80:
        return 0.0  # Duplicate lien block

    estimated_value = asset.financialState.estimatedValue
    base_ltv = asset.financialState.targetLtv

    # Dynamic risk discount on LTV
    risk_discount = 1.0 - (0.45 * risk.compositeScore)
    dynamic_ltv = max(0.35, min(0.90, base_ltv * risk_discount))

    max_safe_capacity = estimated_value * dynamic_ltv
    return round(max_safe_capacity, 2)


# ==============================================================================
# 4. INSTRUMENT SELECTION (§4 / §6)
# ==============================================================================

def select_instrument(asset: Asset) -> Tuple[FinancingInstrument, List[Dict[str, Any]]]:
    """
    Maps LifecycleStage -> Default Recommended Financing Instrument.
    Generates structured list of rejected alternatives with rationales.
    """
    stage = asset.lifecycleStage
    mapping = {
        LifecycleStage.PURCHASE_ORDER: FinancingInstrument.PURCHASE_ORDER_FINANCING,
        LifecycleStage.RAW_MATERIAL: FinancingInstrument.PROCUREMENT_FINANCING,
        LifecycleStage.PRODUCTION: FinancingInstrument.INVENTORY_FINANCING,
        LifecycleStage.IN_TRANSIT: FinancingInstrument.IN_TRANSIT_FINANCING,
        LifecycleStage.WAREHOUSE: FinancingInstrument.WAREHOUSE_FINANCING,
        LifecycleStage.DELIVERED: FinancingInstrument.TRADE_FINANCING,
        LifecycleStage.INVOICED: FinancingInstrument.INVOICE_FINANCING,
        LifecycleStage.RECEIVABLE: FinancingInstrument.RECEIVABLES_FINANCING,
        LifecycleStage.CASH: FinancingInstrument.NONE,
    }

    selected = mapping.get(stage, FinancingInstrument.PURCHASE_ORDER_FINANCING)
    alternatives = []

    all_instruments = [
        FinancingInstrument.PURCHASE_ORDER_FINANCING,
        FinancingInstrument.PROCUREMENT_FINANCING,
        FinancingInstrument.INVENTORY_FINANCING,
        FinancingInstrument.IN_TRANSIT_FINANCING,
        FinancingInstrument.WAREHOUSE_FINANCING,
        FinancingInstrument.TRADE_FINANCING,
        FinancingInstrument.INVOICE_FINANCING,
        FinancingInstrument.RECEIVABLES_FINANCING,
    ]

    for inst in all_instruments:
        if inst == selected:
            continue
        reason = f"Incompatible with current physical lifecycle stage '{stage.value}'."
        if inst == FinancingInstrument.INVOICE_FINANCING and stage != LifecycleStage.INVOICED:
            reason = "Invoice factoring requires issued and verified commercial invoices."
        elif inst == FinancingInstrument.IN_TRANSIT_FINANCING and stage != LifecycleStage.IN_TRANSIT:
            reason = "In-transit ABL requires active carrier custody telemetry and Bill of Lading."
        elif inst == FinancingInstrument.PURCHASE_ORDER_FINANCING and stage != LifecycleStage.PURCHASE_ORDER:
            reason = "PO credit facility is reserved for pre-production raw procurement."
        elif inst == FinancingInstrument.RECEIVABLES_FINANCING and stage != LifecycleStage.RECEIVABLE:
            reason = "Receivables discounting requires verified delivery acceptance."

        alternatives.append({
            "instrument": inst.value,
            "status": "REJECTED",
            "reason": reason
        })

    return selected, alternatives


# ==============================================================================
# 5. DECISION ACTION SELECTION (§6)
# ==============================================================================

def determine_action(
    asset: Asset,
    prior_decision: Optional[Decision],
    recommended_amount: float,
    safe_amount: float
) -> DecisionAction:
    """
    Determines next state machine action:
    - INITIATE: No prior decision or brand new facility
    - TRANSITION: Lifecycle stage changed with active facility
    - REFINANCE: Material risk or interest rate repricing without stage change
    - REDUCE / INCREASE: Significant adjustment in financing ceiling
    - SETTLE: Final cash settlement & collateral release
    - REVIEW_REQUIRED: Low data confidence (<0.50) or severe unresolvable conflict
    - HOLD: Nominal state without material deviation
    """
    if asset.riskState.dataConfidence < 0.50:
        return DecisionAction.REVIEW_REQUIRED

    if asset.lifecycleStage == LifecycleStage.CASH:
        return DecisionAction.SETTLE

    if prior_decision is None:
        return DecisionAction.INITIATE

    # Lifecycle stage change -> Transition facility to next stage instrument
    if asset.lifecycleStage != prior_decision.lifecycleStage:
        if asset.existingExposure > 0 or asset.activeFacility is not None:
            return DecisionAction.TRANSITION
        return DecisionAction.INITIATE

    # Same stage: evaluate risk and amount delta
    risk_delta = asset.riskState.compositeScore - prior_decision.riskScore
    amount_delta = recommended_amount - prior_decision.recommendedAmount

    if amount_delta < -5000.0 or risk_delta >= 0.10:
        return DecisionAction.REDUCE

    if amount_delta > 5000.0 or risk_delta <= -0.10:
        return DecisionAction.INCREASE

    if abs(risk_delta) >= 0.04:
        return DecisionAction.REFINANCE

    return DecisionAction.HOLD


# ==============================================================================
# 6. DECISION CYCLE ORCHESTRATION (§19 / §20)
# ==============================================================================

def run_decision_cycle(asset: Asset, triggered_by_event: Optional[Event] = None) -> Decision:
    """
    Executes the full 9-step decision loop for an asset and returns an actionable Decision record.
    """
    # 1. Update Risk State
    risk_state = compute_risk_state(asset)
    asset.riskState = risk_state

    # 2. Assess Need and Maximum Safe Capacity
    financing_required, need_amount = assess_financing_need(asset)
    safe_cap = maximum_safe_amount(asset, risk_state)

    # 3. Select Instrument
    selected_instrument, alternatives = select_instrument(asset)

    # 4. Compute Dynamic Interest Rate & LTV
    base_rate = 6.50
    risk_spread = risk_state.compositeScore * 8.50
    dynamic_rate = round(base_rate + risk_spread, 2)
    approved_ltv = round(max(0.35, min(0.90, asset.financialState.targetLtv * (1.0 - 0.45 * risk_state.compositeScore))), 3)

    # 5. Recommended Amount
    if asset.lifecycleStage == LifecycleStage.CASH:
        recommended_amount = 0.0
    else:
        recommended_amount = min(need_amount if financing_required else asset.financialState.workingCapitalNeed, safe_cap)
    recommended_amount = round(recommended_amount, 2)

    # 6. Action Determination
    prior_decision = asset.decisions[-1] if asset.decisions else None
    action = determine_action(asset, prior_decision, recommended_amount, safe_cap)

    # 7. Generate Explainable Rationale
    rationale = (
        f"Stage '{asset.lifecycleStage.value}' evaluated under composite risk {risk_state.compositeScore:.2f} "
        f"(Data Confidence: {risk_state.dataConfidence:.2f}). Selected instrument {selected_instrument.value} "
        f"at dynamic rate {dynamic_rate:.2f}% (LTV: {approved_ltv*100:.1f}%). Safe borrowing ceiling: ${safe_cap:,.2f}. "
        f"Action: {action.value}."
    )

    # 8. Synchronize Facility State & Existing Exposure
    if action in [DecisionAction.INITIATE, DecisionAction.TRANSITION, DecisionAction.REFINANCE, DecisionAction.INCREASE, DecisionAction.REDUCE]:
        facility = FinancingFacility(
            instrument=selected_instrument,
            approvedAmount=recommended_amount,
            drawnAmount=recommended_amount,
            interestRate=dynamic_rate,
            ltvRatio=approved_ltv,
            status="ACTIVE",
            lienHash=asset.contractualState.collateralHash or f"LIEN-SHA256-{uuid.uuid4().hex[:12].upper()}",
            issuedAt=datetime.now(timezone.utc).isoformat()
        )
        asset.activeFacility = facility
        asset.facilities.append(facility)
        asset.existingExposure = recommended_amount
        asset.financialState.approvedAmount = recommended_amount
        asset.financialState.costOfCapital = dynamic_rate
        asset.contractualState.collateralHash = facility.lienHash
        asset.contractualState.isEncumbered = True
    elif action == DecisionAction.SETTLE:
        if asset.activeFacility:
            asset.activeFacility.status = "SETTLED"
            asset.activeFacility.settledAt = datetime.now(timezone.utc).isoformat()
        asset.existingExposure = 0.0
        asset.financialState.approvedAmount = 0.0
        asset.contractualState.isEncumbered = False

    decision = Decision(
        assetId=asset.assetId,
        timestamp=datetime.now(timezone.utc).isoformat(),
        lifecycleStage=asset.lifecycleStage,
        action=action,
        selectedInstrument=selected_instrument,
        recommendedAmount=recommended_amount,
        approvedLTV=approved_ltv,
        dynamicRate=dynamic_rate,
        riskScore=risk_state.compositeScore,
        maximumSafeAmount=safe_cap,
        workingCapitalNeed=asset.financialState.workingCapitalNeed,
        existingExposure=asset.existingExposure,
        rationale=rationale,
        alternativeInstruments=alternatives,
        triggeredByEventId=triggered_by_event.eventId if triggered_by_event else None,
        dataConfidence=risk_state.dataConfidence,
        requiresReview=(action == DecisionAction.REVIEW_REQUIRED)
    )

    asset.decisions.append(decision)
    return decision


# ==============================================================================
# 7. EVENT-DRIVEN REASSESSMENT (§10)
# ==============================================================================

def apply_event(asset: Asset, event: Event) -> Decision:
    """
    Single unified entry point for event processing:
    1. Reconciles all touched physical/financial/contractual data points.
    2. Advances lifecycle stage if dictated by event.
    3. Re-computes RiskState and triggers full decision loop.
    4. Marks event.triggeredRecalculation = True and logs resolution notes.
    """
    resolution_notes = []

    # Process payload fields into DataPoints
    for field, val in event.payload.items():
        incoming_dp = DataPoint(
            field=field,
            value=val,
            confidence=event.payload.get(f"{field}_confidence", 0.95),
            timestamp=event.timestamp,
            source=event.source
        )

        # Reconcile into target state container
        if field in ["location", "quantity", "condition", "temperatureCelsius", "delayDays", "dwellDays", "routeRiskIndex"]:
            existing_dp = asset.physicalState.dataPoints.get(field)
            resolved_dp, note = reconcile_data_point(existing_dp, incoming_dp)
            asset.physicalState.dataPoints[field] = resolved_dp
            setattr(asset.physicalState, field, resolved_dp.value)
            resolution_notes.append(note)
        elif field in ["estimatedValue", "workingCapitalNeed", "targetLtv", "currency"]:
            existing_dp = asset.financialState.dataPoints.get(field)
            resolved_dp, note = reconcile_data_point(existing_dp, incoming_dp)
            asset.financialState.dataPoints[field] = resolved_dp
            setattr(asset.financialState, field, resolved_dp.value)
            resolution_notes.append(note)
        elif field in ["poNumber", "buyerId", "supplierId", "incoterms", "paymentDueDays", "isEncumbered"]:
            existing_dp = asset.contractualState.dataPoints.get(field)
            resolved_dp, note = reconcile_data_point(existing_dp, incoming_dp)
            asset.contractualState.dataPoints[field] = resolved_dp
            setattr(asset.contractualState, field, resolved_dp.value)
            resolution_notes.append(note)

    # Handle Lifecycle Stage Transitions based on EventType
    stage_transitions = {
        EventType.PO_ISSUED: LifecycleStage.PURCHASE_ORDER,
        EventType.MATERIAL_RECEIVED: LifecycleStage.RAW_MATERIAL,
        EventType.PRODUCTION_STARTED: LifecycleStage.PRODUCTION,
        EventType.PRODUCTION_COMPLETED: LifecycleStage.PRODUCTION,
        EventType.DISPATCHED: LifecycleStage.IN_TRANSIT,
        EventType.TRANSIT_UPDATE: LifecycleStage.IN_TRANSIT,
        EventType.TRANSIT_DELAY: LifecycleStage.IN_TRANSIT,
        EventType.WAREHOUSE_CHECKIN: LifecycleStage.WAREHOUSE,
        EventType.WAREHOUSE_DWELL_SPIKE: LifecycleStage.WAREHOUSE,
        EventType.DELIVERY_COMPLETED: LifecycleStage.DELIVERED,
        EventType.INVOICE_ISSUED: LifecycleStage.INVOICED,
        EventType.PAYMENT_RECEIVED: LifecycleStage.CASH,
    }

    if event.eventType in stage_transitions:
        asset.lifecycleStage = stage_transitions[event.eventType]

    # Specific disruption shocks
    if event.eventType == EventType.DISRUPTION_SHOCK:
        if "delayDays" in event.payload:
            asset.physicalState.delayDays += float(event.payload["delayDays"])
        if "routeRiskIndex" in event.payload:
            asset.physicalState.routeRiskIndex = float(event.payload["routeRiskIndex"])
    elif event.eventType == EventType.TRANSIT_DELAY:
        delay = float(event.payload.get("delayDays", 5.0))
        asset.physicalState.delayDays += delay
        if "routeRiskIndex" in event.payload:
            asset.physicalState.routeRiskIndex = float(event.payload["routeRiskIndex"])
    elif event.eventType == EventType.WAREHOUSE_DWELL_SPIKE:
        dwell = float(event.payload.get("dwellDays", 14.0))
        asset.physicalState.dwellDays += dwell
    elif event.eventType == EventType.ATTEMPTED_DOUBLE_FINANCE:
        asset.contractualState.isEncumbered = True

    event.triggeredRecalculation = True
    event.resolvedNotes = " | ".join(resolution_notes) if resolution_notes else "State synchronized successfully."
    asset.events.append(event)

    # Run decision cycle
    decision = run_decision_cycle(asset, triggered_by_event=event)
    return decision
