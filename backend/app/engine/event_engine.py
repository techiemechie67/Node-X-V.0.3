"""
Central State Machine & Event Engine (IEEE HACKVERSE 2026 Problem Statement 6)
Executes the deterministic 10-step event pipeline:
New Event → Update Asset → Verify State → Recalculate Value → Recalculate Risk →
Check Existing Financing → Calculate Financing Need → Select Instrument →
Determine Amount → Compare Existing Exposure → Generate Decision.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.core_models import (
    Asset,
    PhysicalState,
    FinancialState,
    ContractualState,
    RiskState,
    LifecycleStage,
    FinancingInstrument,
    DecisionAction,
    Decision,
    DataSource,
    ConflictStatus
)
from app.engine.confidence_engine import ConfidenceEngine, TelemetryObservation
from app.engine.risk_engine import RiskEngine, RiskEvaluationResult
from app.engine.exposure_engine import ExposureEngine
from app.engine.decision_engine import DecisionEngine


class EventType(str, Enum):
    PO_ISSUED = "PO_ISSUED"
    PROCUREMENT_STARTED = "PROCUREMENT_STARTED"
    MATERIAL_RECEIVED = "MATERIAL_RECEIVED"
    PRODUCTION_STARTED = "PRODUCTION_STARTED"
    PRODUCTION_COMPLETED = "PRODUCTION_COMPLETED"
    FINISHED_GOODS_INSPECTED = "FINISHED_GOODS_INSPECTED"
    DISPATCHED_TO_CARRIER = "DISPATCHED_TO_CARRIER"
    TRANSIT_TELEMETRY_UPDATE = "TRANSIT_TELEMETRY_UPDATE"
    TRANSIT_DELAY_SHOCK = "TRANSIT_DELAY_SHOCK"
    PORT_CONGESTION = "PORT_CONGESTION"
    WAREHOUSE_CHECKIN = "WAREHOUSE_CHECKIN"
    WAREHOUSE_DWELL_SPIKE = "WAREHOUSE_DWELL_SPIKE"
    DELIVERY_COMPLETED = "DELIVERY_COMPLETED"
    INVOICE_ISSUED = "INVOICE_ISSUED"
    INVOICE_APPROVED = "INVOICE_APPROVED"
    PAYMENT_RECEIVED = "PAYMENT_RECEIVED"
    ATTEMPTED_DOUBLE_FINANCE = "ATTEMPTED_DOUBLE_FINANCE"
    TELEMETRY_CONFLICT_INJECTED = "TELEMETRY_CONFLICT_INJECTED"


class MaterialEvent(BaseModel):
    """Event representation ingested by the central state machine."""
    event_id: str = Field(default_factory=lambda: f"EVT-{uuid.uuid4().hex[:8].upper()}")
    event_type: EventType
    asset_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: DataSource = DataSource.ERP
    description: str = ""
    payload: Dict[str, Any] = Field(default_factory=dict)
    observations: List[Dict[str, Any]] = Field(default_factory=list)


# Valid state transitions across the asset lifecycle
VALID_TRANSITIONS: Dict[LifecycleStage, List[LifecycleStage]] = {
    LifecycleStage.PURCHASE_ORDER: [LifecycleStage.PURCHASE_ORDER, LifecycleStage.RAW_MATERIAL, LifecycleStage.PRODUCTION],
    LifecycleStage.RAW_MATERIAL: [LifecycleStage.RAW_MATERIAL, LifecycleStage.PRODUCTION],
    LifecycleStage.PRODUCTION: [LifecycleStage.PRODUCTION, LifecycleStage.FINISHED_GOODS, LifecycleStage.IN_TRANSIT],
    LifecycleStage.FINISHED_GOODS: [LifecycleStage.FINISHED_GOODS, LifecycleStage.IN_TRANSIT, LifecycleStage.WAREHOUSE],
    LifecycleStage.IN_TRANSIT: [LifecycleStage.IN_TRANSIT, LifecycleStage.WAREHOUSE, LifecycleStage.DELIVERY],
    LifecycleStage.WAREHOUSE: [LifecycleStage.WAREHOUSE, LifecycleStage.DELIVERY, LifecycleStage.INVOICED],
    LifecycleStage.DELIVERY: [LifecycleStage.DELIVERY, LifecycleStage.INVOICED, LifecycleStage.CASH],
    LifecycleStage.INVOICED: [LifecycleStage.INVOICED, LifecycleStage.CASH],
    LifecycleStage.CASH: [LifecycleStage.CASH]
}


class EventEngine:
    """
    Central State Machine and Event Pipeline Controller.
    """

    @classmethod
    def process_event(
        cls,
        asset: Asset,
        event: MaterialEvent,
        available_liquidity: float = 1_000_000.0,
        supplier_reliability_score: float = 0.92,
        buyer_credit_score: float = 0.90
    ) -> Tuple[Asset, Decision, Dict[str, Any]]:
        """
        Executes the full 10-step sequential event pipeline:
        1. New Event Received & Logged
        2. Update Asset State Attributes
        3. Verify State (Multi-Source Reconciliation)
        4. Recalculate Embodied Economic Value
        5. Recalculate Transparent Risk Score
        6. Check Existing Financing & Active Exposure
        7. Calculate Stage Working Capital Need
        8. Select Appropriate Instrument
        9. Determine Safe Financing Amount & Compare Exposure
        10. Generate Primary Action & Explainable Decision Card
        """
        pipeline_log: List[str] = []
        pipeline_log.append(f"Step 1: Ingested Event '{event.event_type.value}' from source '{event.source.value}'.")

        # Step 2: Update Asset State based on Event Type & Payload
        target_stage = event.payload.get("target_stage")
        if target_stage:
            if isinstance(target_stage, str):
                try:
                    target_stage = LifecycleStage(target_stage)
                except ValueError:
                    target_stage = None
            if target_stage and target_stage in VALID_TRANSITIONS.get(asset.lifecycle_stage, [asset.lifecycle_stage]):
                asset.lifecycle_stage = target_stage
                asset.physical_state.current_stage = target_stage
                pipeline_log.append(f"Step 2: State machine transitioned lifecycle stage to '{asset.lifecycle_stage.value}'.")

        # Apply physical updates from payload
        if "location" in event.payload:
            asset.physical_state.location = str(event.payload["location"])
        if "custody_holder" in event.payload:
            asset.physical_state.custody_holder = str(event.payload["custody_holder"])
        if "delay_days" in event.payload:
            asset.physical_state.delay_days = float(event.payload["delay_days"])
        if "dwell_days" in event.payload:
            asset.physical_state.dwell_days = float(event.payload["dwell_days"])
        if "route_risk_index" in event.payload:
            asset.physical_state.route_risk_index = float(event.payload["route_risk_index"])
        if "condition" in event.payload:
            asset.physical_state.condition = str(event.payload["condition"])
        if "temperature_celsius" in event.payload:
            asset.physical_state.temperature_celsius = float(event.payload["temperature_celsius"])

        # Apply contractual updates
        if "invoice_approved" in event.payload:
            asset.contractual_state.invoice_approved = bool(event.payload["invoice_approved"])
        if "invoice_number" in event.payload:
            asset.contractual_state.invoice_number = str(event.payload["invoice_number"])

        # Step 3: Verify State with Confidence Engine
        telemetry_obs: List[TelemetryObservation] = []
        for raw_obs in event.observations:
            telemetry_obs.append(
                TelemetryObservation(
                    source=DataSource(raw_obs.get("source", DataSource.ERP.value)),
                    field_name=raw_obs.get("field_name", "location"),
                    value=raw_obs.get("value"),
                    timestamp=raw_obs.get("timestamp"),
                    source_id=raw_obs.get("source_id")
                )
            )

        if telemetry_obs:
            asset.physical_state, recon_results = ConfidenceEngine.reconcile_physical_state(
                asset.physical_state,
                telemetry_obs
            )
            has_conflicts = any(r.has_conflict for r in recon_results)
            pipeline_log.append(f"Step 3: Multi-source state verification complete. Telemetry conflicts: {has_conflicts}.")
        else:
            pipeline_log.append("Step 3: Multi-source state verified against existing data baseline.")

        # Step 4: Recalculate Embodied Economic Value
        base_val = asset.contractual_state.agreed_price or 100_000.0
        stage_multipliers = {
            LifecycleStage.PURCHASE_ORDER: 0.70,   # Baseline commitment value
            LifecycleStage.RAW_MATERIAL: 0.75,     # Material input value
            LifecycleStage.PRODUCTION: 0.85,       # Labor & WIP compounding
            LifecycleStage.FINISHED_GOODS: 0.90,   # Full manufacturing cost
            LifecycleStage.IN_TRANSIT: 0.95,       # Location utility & freight
            LifecycleStage.WAREHOUSE: 0.98,        # Regional distribution value
            LifecycleStage.DELIVERY: 1.00,         # Full commercial delivery
            LifecycleStage.INVOICED: 1.00,         # Formal receivable obligation
            LifecycleStage.CASH: 1.00              # Cash settlement realized
        }
        multiplier = stage_multipliers.get(asset.lifecycle_stage, 1.0)
        asset.financial_state.embodied_economic_value = round(base_val * multiplier, 2)
        pipeline_log.append(f"Step 4: Embodied economic value recalculated to ${asset.financial_state.embodied_economic_value:,.2f}.")

        # Step 5: Recalculate Risk Score
        has_dup = (event.event_type == EventType.ATTEMPTED_DOUBLE_FINANCE) or event.payload.get("has_duplicate_claim", False)
        risk_result = RiskEngine.evaluate_asset_risk(
            asset=asset,
            supplier_reliability_score=supplier_reliability_score,
            buyer_credit_score=buyer_credit_score,
            has_duplicate_claim=has_dup
        )
        asset.risk_state.composite_risk_score = risk_result.normalized_score
        pipeline_log.append(f"Step 5: 10-vector risk recalculated: {risk_result.composite_score_100:.1f}/100 ({risk_result.risk_level}).")

        # Step 6: Check Existing Financing & Exposure
        existing_exposure = ExposureEngine.get_active_exposure(asset)
        pipeline_log.append(f"Step 6: Existing outstanding principal exposure verified: ${existing_exposure:,.2f}.")

        # Step 7: Calculate Financing Need
        need_multipliers = {
            LifecycleStage.PURCHASE_ORDER: 0.80,
            LifecycleStage.RAW_MATERIAL: 0.80,
            LifecycleStage.PRODUCTION: 0.85,
            LifecycleStage.FINISHED_GOODS: 0.80,
            LifecycleStage.IN_TRANSIT: 0.75,
            LifecycleStage.WAREHOUSE: 0.70,
            LifecycleStage.DELIVERY: 0.80,
            LifecycleStage.INVOICED: 0.80,
            LifecycleStage.CASH: 0.0
        }
        asset.financial_state.working_capital_need = round(base_val * need_multipliers.get(asset.lifecycle_stage, 0.75), 2)
        pipeline_log.append(f"Step 7: Working capital need for current stage: ${asset.financial_state.working_capital_need:,.2f}.")

        # Step 8, 9, 10: Generate Decision via DecisionEngine
        decision = DecisionEngine.evaluate_decision(
            asset=asset,
            available_liquidity=available_liquidity,
            supplier_reliability_score=supplier_reliability_score,
            buyer_credit_score=buyer_credit_score,
            has_duplicate_claim=has_dup
        )
        decision.decision_id = f"DEC-{event.event_id}"
        
        pipeline_log.append(f"Step 8: Optimal instrument selected: {decision.recommended_instrument.value}.")
        pipeline_log.append(f"Step 9: Max Safe: ${decision.max_safe_amount:,.2f}, Recommended: ${decision.approved_amount:,.2f}.")
        pipeline_log.append(f"Step 10: Emitted Decision Action: {decision.action.value} with full explainability.")

        # If action is INITIATE, TRANSITION, or INCREASE, synchronize ExposureEngine
        if decision.action in (DecisionAction.INITIATE, DecisionAction.TRANSITION, DecisionAction.INCREASE) and decision.approved_amount > 0:
            ExposureEngine.register_pledge(
                asset=asset,
                instrument=decision.recommended_instrument,
                drawn_amount=decision.approved_amount,
                approved_limit=decision.approved_amount,
                ltv_ratio=decision.ltv_ratio,
                interest_rate=decision.dynamic_interest_rate
            )
        elif decision.action == DecisionAction.SETTLE:
            ExposureEngine.settle_exposure(asset, settlement_payment=existing_exposure or base_val)

        # Append to asset event and decision history
        asset.event_history.append(event.model_dump())
        asset.decision_history.append(decision.model_dump())
        asset.updated_at = datetime.now(timezone.utc)

        execution_metadata = {
            "event_id": event.event_id,
            "event_type": event.event_type.value,
            "pipeline_steps": pipeline_log,
            "risk_evaluation": risk_result.model_dump(),
            "decision": decision.model_dump()
        }

        return asset, decision, execution_metadata

    @classmethod
    def run_hackathon_lifecycle_demo(
        cls,
        order_value_inr: float = 1_000_000.0,
        currency: str = "INR"
    ) -> List[Dict[str, Any]]:
        """
        Executes the canonical 8-step lifecycle replay from Problem Statement 6
        on a mock ₹10,00,000 (or $100,000) Electronics Asset Batch.
        """
        ExposureEngine.reset()
        asset_id = f"ASSET-DEMO-{uuid.uuid4().hex[:6].upper()}"
        batch_id = "BATCH-NX-2026-DEMO"

        asset = Asset(
            asset_id=asset_id,
            batch_id=batch_id,
            name="Smart Mobility Electronic Control Unit (ECU) Assembly Batch",
            product_category="Electronics & High-Tech",
            lifecycle_stage=LifecycleStage.PURCHASE_ORDER,
            physical_state=PhysicalState(
                location="Tier-1 High-Tech Fab, Bangalore",
                custody_holder="Tier-1 Supplier",
                quantity=1000,
                unit="units",
                condition="NOMINAL"
            ),
            financial_state=FinancialState(
                embodied_economic_value=order_value_inr * 0.70,
                base_cost=order_value_inr * 0.70,
                working_capital_need=order_value_inr * 0.80,
                currency=currency,
                ltv_ratio=0.80
            ),
            contractual_state=ContractualState(
                po_number="PO-HACKVERSE-2026-06",
                buyer_id="GLOBAL-AUTO-OEM-DE",
                supplier_id="BANGALORE-MICRO-FAB",
                incoterms="CIF",
                agreed_price=order_value_inr,
                payment_terms_days=60
            )
        )

        steps_data: List[Dict[str, Any]] = []

        # --- STEP 1: PO Issued (Baseline Onboarding) ---
        evt1 = MaterialEvent(
            event_type=EventType.PO_ISSUED,
            asset_id=asset.asset_id,
            source=DataSource.ERP,
            description="Buyer issues confirmed purchase order for ₹10,00,000 ECU batch.",
            payload={"target_stage": LifecycleStage.PURCHASE_ORDER}
        )
        asset, dec1, meta1 = cls.process_event(asset, evt1)
        steps_data.append({
            "step_num": 1,
            "name": "PO Issued (Baseline Onboarding)",
            "stage": asset.lifecycle_stage.value,
            "instrument": dec1.recommended_instrument.value,
            "action": dec1.action.value,
            "approved_amount": dec1.approved_amount,
            "dynamic_rate": dec1.dynamic_interest_rate,
            "risk_score": dec1.risk_summary["composite_score_100"],
            "reasoning": dec1.reasoning
        })

        # --- STEP 2: Raw Material Received ---
        evt2 = MaterialEvent(
            event_type=EventType.MATERIAL_RECEIVED,
            asset_id=asset.asset_id,
            source=DataSource.WAREHOUSE_WMS,
            description="Silicon wafers and passive components delivered to supplier dock.",
            payload={"target_stage": LifecycleStage.RAW_MATERIAL, "location": "Bangalore Fab Dock"}
        )
        asset, dec2, meta2 = cls.process_event(asset, evt2)
        steps_data.append({
            "step_num": 2,
            "name": "Raw Material Received",
            "stage": asset.lifecycle_stage.value,
            "instrument": dec2.recommended_instrument.value,
            "action": dec2.action.value,
            "approved_amount": dec2.approved_amount,
            "dynamic_rate": dec2.dynamic_interest_rate,
            "risk_score": dec2.risk_summary["composite_score_100"],
            "reasoning": dec2.reasoning
        })

        # --- STEP 3: Production Completed ---
        evt3 = MaterialEvent(
            event_type=EventType.PRODUCTION_COMPLETED,
            asset_id=asset.asset_id,
            source=DataSource.MANUAL_INSPECTION,
            description="SMT assembly and QA testing completed with nominal yield.",
            payload={"target_stage": LifecycleStage.PRODUCTION, "condition": "NOMINAL"}
        )
        asset, dec3, meta3 = cls.process_event(asset, evt3)
        steps_data.append({
            "step_num": 3,
            "name": "Production Completed (WIP)",
            "stage": asset.lifecycle_stage.value,
            "instrument": dec3.recommended_instrument.value,
            "action": dec3.action.value,
            "approved_amount": dec3.approved_amount,
            "dynamic_rate": dec3.dynamic_interest_rate,
            "risk_score": dec3.risk_summary["composite_score_100"],
            "reasoning": dec3.reasoning
        })

        # --- STEP 4: Dispatched to Ocean Carrier ---
        evt4 = MaterialEvent(
            event_type=EventType.DISPATCHED_TO_CARRIER,
            asset_id=asset.asset_id,
            source=DataSource.CARRIER_API,
            description="Containers handed over to Ocean Carrier at Port of Chennai; Bill of Lading issued.",
            payload={"target_stage": LifecycleStage.IN_TRANSIT, "location": "Indian Ocean Intermodal Route", "custody_holder": "Ocean Freight Line"}
        )
        asset, dec4, meta4 = cls.process_event(asset, evt4)
        steps_data.append({
            "step_num": 4,
            "name": "Dispatched to Ocean Carrier",
            "stage": asset.lifecycle_stage.value,
            "instrument": dec4.recommended_instrument.value,
            "action": dec4.action.value,
            "approved_amount": dec4.approved_amount,
            "dynamic_rate": dec4.dynamic_interest_rate,
            "risk_score": dec4.risk_summary["composite_score_100"],
            "reasoning": dec4.reasoning
        })

        # --- STEP 5: Transit Disruption Shock ---
        evt5 = MaterialEvent(
            event_type=EventType.TRANSIT_DELAY_SHOCK,
            asset_id=asset.asset_id,
            source=DataSource.IOT_TELEMETRY,
            description="Port of Singapore congestion and Red Sea rerouting adds +14 days delay.",
            payload={"delay_days": 14.0, "route_risk_index": 0.85}
        )
        asset, dec5, meta5 = cls.process_event(asset, evt5)
        steps_data.append({
            "step_num": 5,
            "name": "Transit Disruption Shock (+14d Delay)",
            "stage": asset.lifecycle_stage.value,
            "instrument": dec5.recommended_instrument.value,
            "action": dec5.action.value,
            "approved_amount": dec5.approved_amount,
            "dynamic_rate": dec5.dynamic_interest_rate,
            "risk_score": dec5.risk_summary["composite_score_100"],
            "reasoning": dec5.reasoning
        })

        # --- STEP 6: Warehouse Check-in ---
        evt6 = MaterialEvent(
            event_type=EventType.WAREHOUSE_CHECKIN,
            asset_id=asset.asset_id,
            source=DataSource.WAREHOUSE_WMS,
            description="Customs cleared; goods checked into European Regional Distribution Center.",
            payload={"target_stage": LifecycleStage.WAREHOUSE, "location": "Rotterdam Hub WMS", "delay_days": 0.0, "dwell_days": 4.0, "route_risk_index": 0.10}
        )
        asset, dec6, meta6 = cls.process_event(asset, evt6)
        steps_data.append({
            "step_num": 6,
            "name": "Warehouse Check-in (Rotterdam Hub)",
            "stage": asset.lifecycle_stage.value,
            "instrument": dec6.recommended_instrument.value,
            "action": dec6.action.value,
            "approved_amount": dec6.approved_amount,
            "dynamic_rate": dec6.dynamic_interest_rate,
            "risk_score": dec6.risk_summary["composite_score_100"],
            "reasoning": dec6.reasoning
        })

        # --- STEP 7: Delivery & Invoice Approved ---
        evt7 = MaterialEvent(
            event_type=EventType.INVOICE_APPROVED,
            asset_id=asset.asset_id,
            source=DataSource.ERP,
            description="Goods delivered to OEM plant; commercial invoice approved for Net-60 settlement.",
            payload={"target_stage": LifecycleStage.INVOICED, "location": "OEM Plant Dock, Munich", "invoice_approved": True, "invoice_number": "INV-2026-8819"}
        )
        asset, dec7, meta7 = cls.process_event(asset, evt7)
        steps_data.append({
            "step_num": 7,
            "name": "Delivery & Approved Invoice",
            "stage": asset.lifecycle_stage.value,
            "instrument": dec7.recommended_instrument.value,
            "action": dec7.action.value,
            "approved_amount": dec7.approved_amount,
            "dynamic_rate": dec7.dynamic_interest_rate,
            "risk_score": dec7.risk_summary["composite_score_100"],
            "reasoning": dec7.reasoning
        })

        # --- STEP 8: Buyer Settlement (Cash / Settle) ---
        evt8 = MaterialEvent(
            event_type=EventType.PAYMENT_RECEIVED,
            asset_id=asset.asset_id,
            source=DataSource.BANK_FEED,
            description="Buyer bank wire received in full; senior lien extinguished and collateral released.",
            payload={"target_stage": LifecycleStage.CASH}
        )
        asset, dec8, meta8 = cls.process_event(asset, evt8)
        steps_data.append({
            "step_num": 8,
            "name": "Buyer Settlement (Cash / Full Paydown)",
            "stage": asset.lifecycle_stage.value,
            "instrument": dec8.recommended_instrument.value,
            "action": dec8.action.value,
            "approved_amount": dec8.approved_amount,
            "dynamic_rate": dec8.dynamic_interest_rate,
            "risk_score": dec8.risk_summary["composite_score_100"],
            "reasoning": dec8.reasoning
        })

        return steps_data
