"""
Supply Chain Financing Intelligence Engine — Asset REST API Layer (Phase 2).
Exposes endpoints for Simple Mode, Complex Mode, Event Ingestion, and Hackathon Replay.
"""

import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
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
    ConflictStatus,
    DataConfidence
)
from app.engine.confidence_engine import ConfidenceEngine, TelemetryObservation
from app.engine.risk_engine import RiskEngine
from app.engine.exposure_engine import ExposureEngine
from app.engine.decision_engine import DecisionEngine
from app.engine.event_engine import EventEngine, MaterialEvent, EventType
from app.engine.ai_agent import generate_decision_explanation

asset_router = APIRouter(tags=["Asset Financing Intelligence"])

# In-Memory Active Asset Registry
ASSET_STORE: Dict[str, Asset] = {}


class CreateAssetRequest(BaseModel):
    name: Optional[str] = "Smart Mobility ECU Batch A1"
    batch_id: Optional[str] = "BATCH-NX-2026-A1"
    product_category: Optional[str] = "Electronics & High-Tech"
    lifecycle_stage: Optional[LifecycleStage] = LifecycleStage.PURCHASE_ORDER
    agreed_price: Optional[float] = 100000.0
    working_capital_need: Optional[float] = 80000.0
    target_ltv: Optional[float] = 0.80
    po_number: Optional[str] = "PO-2026-001"
    buyer_id: Optional[str] = "BUYER-GLOBAL-RETAIL"
    supplier_id: Optional[str] = "SUPPLIER-TIER1"
    initial_location: Optional[str] = "Origin Factory (Bangalore/Shenzhen)"


class IngestEventRequest(BaseModel):
    event_type: EventType
    source: Optional[DataSource] = DataSource.ERP
    description: Optional[str] = ""
    payload: Dict[str, Any] = Field(default_factory=dict)
    observations: List[Dict[str, Any]] = Field(default_factory=list)


class SimulateEventRequest(BaseModel):
    event_type: Optional[EventType] = EventType.TRANSIT_DELAY_SHOCK
    delay_days: Optional[float] = 10.0
    dwell_days: Optional[float] = 0.0
    route_risk_index: Optional[float] = 0.60
    location: Optional[str] = "Red Sea Shipping Corridor"
    target_stage: Optional[LifecycleStage] = None


@asset_router.post("", response_model=Asset, status_code=status.HTTP_201_CREATED)
def create_asset(req: CreateAssetRequest):
    """
    Initializes a new asset batch in the intelligence engine and triggers the initial decision cycle.
    """
    asset = Asset(
        name=req.name or "Asset Batch",
        batch_id=req.batch_id or "BATCH-001",
        product_category=req.product_category or "Electronics & High-Tech",
        lifecycle_stage=req.lifecycle_stage or LifecycleStage.PURCHASE_ORDER,
        physical_state=PhysicalState(location=req.initial_location or "Origin Factory"),
        financial_state=FinancialState(
            embodied_economic_value=(req.agreed_price or 100000.0) * 0.70,
            base_cost=(req.agreed_price or 100000.0) * 0.70,
            working_capital_need=req.working_capital_need or 80000.0,
            ltv_ratio=req.target_ltv or 0.80
        ),
        contractual_state=ContractualState(
            po_number=req.po_number or "PO-001",
            buyer_id=req.buyer_id or "BUYER-01",
            supplier_id=req.supplier_id or "SUPPLIER-01",
            agreed_price=req.agreed_price or 100000.0
        )
    )

    # Initial decision evaluation
    decision = DecisionEngine.evaluate_decision(asset)
    asset.decision_history.append(decision.model_dump())
    ASSET_STORE[asset.asset_id] = asset
    return asset


@asset_router.get("", response_model=List[Asset])
def list_assets():
    """Lists all active tracked asset digital twins."""
    return list(ASSET_STORE.values())


@asset_router.get("/{asset_id}", response_model=Asset)
def get_asset(asset_id: str):
    """Retrieves the full asset digital twin by UUID."""
    if asset_id not in ASSET_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{asset_id}' not found."
        )
    return ASSET_STORE[asset_id]


# ============================================================================
# SIMPLE MODE vs COMPLEX MODE ENDPOINTS
# ============================================================================

@asset_router.get("/{asset_id}/simple")
def get_asset_simple_mode(asset_id: str):
    """
    Simple Mode: Clean, streamlined summary of current stage, value, risk score,
    recommended instrument, approved financing amount, and high-level reasoning.
    """
    if asset_id not in ASSET_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{asset_id}' not found."
        )

    asset = ASSET_STORE[asset_id]
    decision = DecisionEngine.evaluate_decision(asset)
    risk_res = RiskEngine.evaluate_asset_risk(asset)

    return {
        "asset_id": asset.asset_id,
        "batch_id": asset.batch_id,
        "name": asset.name,
        "current_stage": asset.lifecycle_stage.value,
        "location": asset.physical_state.location,
        "embodied_value": asset.financial_state.embodied_economic_value,
        "working_capital_need": asset.financial_state.working_capital_need,
        "recommended_instrument": decision.recommended_instrument.value,
        "action": decision.action.value,
        "approved_amount": decision.approved_amount,
        "max_safe_capacity": decision.max_safe_amount,
        "dynamic_interest_rate": decision.dynamic_interest_rate,
        "risk_score_100": risk_res.composite_score_100,
        "risk_level": risk_res.risk_level,
        "reasoning": decision.reasoning
    }


@asset_router.get("/{asset_id}/complex")
def get_asset_complex_mode(asset_id: str):
    """
    Complex Mode: Comprehensive diagnostic exposure returning all 4 nested states,
    multi-source telemetry confidence scores, full 10-vector risk breakdown,
    cryptographic collateral liens, and historical audit trail.
    """
    if asset_id not in ASSET_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{asset_id}' not found."
        )

    asset = ASSET_STORE[asset_id]
    decision = DecisionEngine.evaluate_decision(asset)
    risk_res = RiskEngine.evaluate_asset_risk(asset)
    active_liens = ExposureEngine.get_active_liens_for_asset(asset.asset_id)

    return {
        "asset": asset.model_dump(),
        "decision": decision.model_dump(),
        "risk_diagnostics": risk_res.model_dump(),
        "exposure_ledger": {
            "existing_exposure": ExposureEngine.get_active_exposure(asset),
            "collateral_hash": ExposureEngine.generate_collateral_hash(asset),
            "active_liens": [lien.model_dump() for lien in active_liens]
        },
        "telemetry_confidences": {
            k: v.model_dump() for k, v in asset.physical_state.data_confidences.items()
        },
        "events_count": len(asset.event_history),
        "decisions_count": len(asset.decision_history)
    }


@asset_router.post("/{asset_id}/events", response_model=Decision)
async def append_asset_event(asset_id: str, req: IngestEventRequest):
    """
    Ingests a material event, executes the 10-step EventEngine pipeline,
    and returns the resulting Decision output with DeepSeek underwriter explanation.
    """
    if asset_id not in ASSET_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{asset_id}' not found."
        )

    asset = ASSET_STORE[asset_id]
    evt = MaterialEvent(
        event_type=req.event_type,
        asset_id=asset_id,
        source=req.source or DataSource.ERP,
        description=req.description or f"Event: {req.event_type.value}",
        payload=req.payload or {},
        observations=req.observations or []
    )

    updated_asset, decision, metadata = EventEngine.process_event(asset, evt)
    
    # Generate AI underwriter explanation via DeepSeek
    ai_reasoning = await generate_decision_explanation(updated_asset, decision)
    decision.reasoning = ai_reasoning
    if updated_asset.decision_history:
        updated_asset.decision_history[-1]["reasoning"] = ai_reasoning

    ASSET_STORE[asset_id] = updated_asset
    return decision


@asset_router.post("/{asset_id}/simulate")
async def simulate_event_before_after(asset_id: str, req: SimulateEventRequest):
    """
    Exposes a simulation endpoint that applies a hypothetical disruption (e.g. 10-day delay)
    and returns a BEFORE and AFTER decision state for frontend rendering.
    """
    if asset_id not in ASSET_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{asset_id}' not found."
        )

    asset = ASSET_STORE[asset_id]
    
    # Capture BEFORE state
    before_decision = DecisionEngine.evaluate_decision(asset)
    before_risk = RiskEngine.evaluate_asset_risk(asset)

    # Clone for simulation
    sim_asset = asset.model_copy(deep=True)
    
    sim_evt = MaterialEvent(
        event_type=req.event_type or EventType.TRANSIT_DELAY_SHOCK,
        asset_id=sim_asset.asset_id,
        source=DataSource.IOT_TELEMETRY,
        description=f"Simulation: {req.event_type.value} (+{req.delay_days}d delay)",
        payload={
            "delay_days": req.delay_days,
            "dwell_days": req.dwell_days,
            "route_risk_index": req.route_risk_index,
            "location": req.location,
            "target_stage": req.target_stage
        }
    )

    sim_asset, after_decision, meta = EventEngine.process_event(sim_asset, sim_evt)

    # Generate AI underwriter explanation via DeepSeek for after decision
    ai_reasoning = await generate_decision_explanation(sim_asset, after_decision)
    after_decision.reasoning = ai_reasoning

    return {
        "asset_id": asset_id,
        "event_simulated": sim_evt.description,
        "before": {
            "stage": asset.lifecycle_stage.value,
            "instrument": before_decision.recommended_instrument.value,
            "approved_amount": before_decision.approved_amount,
            "dynamic_rate": before_decision.dynamic_interest_rate,
            "risk_score_100": before_risk.composite_score_100,
            "risk_level": before_risk.risk_level,
            "action": before_decision.action.value,
            "reasoning": before_decision.reasoning
        },
        "after": {
            "stage": sim_asset.lifecycle_stage.value,
            "instrument": after_decision.recommended_instrument.value,
            "approved_amount": after_decision.approved_amount,
            "dynamic_rate": after_decision.dynamic_interest_rate,
            "risk_score_100": meta["risk_evaluation"]["composite_score_100"],
            "risk_level": meta["risk_evaluation"]["risk_level"],
            "action": after_decision.action.value,
            "reasoning": after_decision.reasoning
        },
        "pipeline_steps": meta["pipeline_steps"],
        "delta": {
            "rate_change_bps": round((after_decision.dynamic_interest_rate - before_decision.dynamic_interest_rate) * 100, 1),
            "amount_change": round(after_decision.approved_amount - before_decision.approved_amount, 2),
            "risk_score_change": round(meta["risk_evaluation"]["composite_score_100"] - before_risk.composite_score_100, 2)
        }
    }


@asset_router.post("/demo/hackathon-replay")
def run_demo_hackathon_replay(order_value_inr: float = 1_000_000.0):
    """
    Executes the canonical 8-step lifecycle replay on a mock ₹10,00,000 order.
    """
    return EventEngine.run_hackathon_lifecycle_demo(order_value_inr=order_value_inr)
