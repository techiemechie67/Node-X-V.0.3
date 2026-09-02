import uuid
from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, field_validator

class NodeType(str, Enum):
    FACTORY = "factory"
    TRANSIT = "transit"
    WAREHOUSE = "warehouse"
    DELIVERY = "delivery"

class FinancingInstrument(str, Enum):
    PO_FINANCING = "po_financing"
    ASSET_BACKED_LENDING = "asset_backed_lending"
    INVENTORY_FINANCING = "inventory_financing"
    INVOICE_FACTORING = "invoice_factoring"

class AssetState(str, Enum):
    UNFINANCED = "unfinanced"
    FINANCED = "financed"
    SETTLED = "settled"

class Node(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Node UUID")
    name: str = Field(..., description="Node name")
    type: NodeType = Field(..., description="factory | transit | warehouse | delivery")
    cost: float = Field(..., ge=0, description="Base operational/inventory cost in USD")
    delayDays: float = Field(default=0.0, ge=0, description="Current delay in days")
    dependsOn: List[str] = Field(default_factory=list, description="List of upstream node IDs")
    financingInstrument: FinancingInstrument = Field(
        ...,
        description="po_financing | asset_backed_lending | inventory_financing | invoice_factoring"
    )
    assetState: AssetState = Field(default=AssetState.UNFINANCED, description="unfinanced | financed | settled")
    loanAmount: float = Field(default=0.0, ge=0, description="Approved or active financing amount")
    ltvRatio: float = Field(default=0.80, ge=0.0, le=1.0, description="Loan-To-Value ratio")
    riskScore: float = Field(default=0.10, ge=0.0, le=1.0, description="Risk score (0.0 to 1.0)")
    interestRate: float = Field(default=7.50, ge=0.0, description="Annualized interest/discount rate %")
    
    # Extended operational and batch tracking fields
    batchId: str = Field(default="BATCH-NX-2026-A1", description="Physical asset batch identifier")
    collateralHash: Optional[str] = Field(default=None, description="Cryptographic SHA-256 collateral lien hash")
    tier: int = Field(default=1, description="Financing tier level (1 to 4)")
    storageDurationDays: float = Field(default=0.0, ge=0, description="Dwell time in warehouse (days)")
    supplierReliabilityScore: float = Field(default=0.92, ge=0.0, le=1.0, description="Historical supplier reliability")
    baseCost: Optional[float] = Field(default=None, description="Baseline baseline cost")
    baseLeadTimeDays: Optional[float] = Field(default=None, description="Baseline lead time")
    isBottleneck: bool = Field(default=False, description="True if marked as bottleneck")
    bottleneckReason: Optional[str] = Field(default=None, description="Bottleneck explanation")
    position: Optional[Dict[str, float]] = Field(default=None, description="Visualization (x, y) coordinates")

    @field_validator("id")
    def validate_uuid_or_str(cls, v):
        if not v:
            return str(uuid.uuid4())
        return str(v)

class DisruptionPayload(BaseModel):
    shock_type: Optional[str] = Field(default="port_blockade", description="Type of physical disruption")
    magnitude: Optional[float] = Field(default=10.0, ge=0.0, le=50.0, description="Disruption magnitude")
    target_node_id: Optional[str] = Field(default=None, description="Directly shocked node UUID")
    fuel_price_spike_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Fuel price spike %")
    supplier_delay_days: float = Field(default=0.0, ge=0.0, le=60.0, description="Direct supplier delay days")
    shortage_node_ids: List[str] = Field(default_factory=list, description="Node IDs with material shortage")

class SimulationRequest(BaseModel):
    nodeId: Optional[str] = Field(default=None, description="Direct node ID to shock (API Contract)")
    shockType: Optional[str] = Field(default=None, description="Disruption shock type")
    magnitude: Optional[float] = Field(default=None, description="Disruption magnitude (days / %)")
    template_id: Optional[str] = Field(default="apparel", description="Template network identifier")
    custom_nodes: Optional[List[Node]] = None
    disruption: Optional[DisruptionPayload] = None

class LedgerEntry(BaseModel):
    entryId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    assetId: str
    batchId: str
    nodeId: str
    nodeName: str
    financingInstrument: FinancingInstrument
    tier: int
    state: AssetState
    loanAmount: float
    ltvRatio: float
    interestRate: float
    collateralHash: str
    financedAt: str
    settledAt: Optional[str] = None
    notes: Optional[str] = None

class LedgerCheckResult(BaseModel):
    blocked: bool = Field(..., description="True if double financing or over-leveraging detected")
    reason: Optional[str] = Field(default=None, description="Explainable block reason")
    collateralHash: Optional[str] = Field(default=None, description="Collateral lien hash")
    activeEntry: Optional[LedgerEntry] = Field(default=None, description="Conflicting active ledger entry")

class RefinancingEvent(BaseModel):
    triggered: bool
    reason: str
    newInterestRate: float
    oldInterestRate: Optional[float] = None
    affectedNodeIds: List[str] = Field(default_factory=list)
    severity: str = "WARNING"  # INFO | WARNING | CRITICAL
    liquidityRunwayBreach: bool = False
    liquidityBreachDays: Optional[float] = None

class DashboardSummary(BaseModel):
    totalExposure: float
    avgRiskScore: float
    activeInstruments: List[str]
    cashConversionCycleDays: float
    wacc: float
    liquidityRunwayDays: float
    settledCapital: float
    totalCost: float
    bottleneckCount: int
    unfinancedCount: int
    financedCount: int
    settledCount: int

class SimulationResponse(BaseModel):
    scenario_id: str
    template_id: str
    execution_time_ms: float
    updatedNodes: List[Node]
    ledgerCheck: LedgerCheckResult
    refinancingEvent: Optional[RefinancingEvent] = None
    dashboard: DashboardSummary
    explanation: Optional[str] = None

class FinanceNodeRequest(BaseModel):
    nodeId: str
    batchId: Optional[str] = "BATCH-NX-2026-A1"

class SettleNodeRequest(BaseModel):
    nodeId: str
    batchId: Optional[str] = "BATCH-NX-2026-A1"

class AttemptDoubleFinanceRequest(BaseModel):
    nodeId: str
    batchId: str = "BATCH-NX-2026-A1"
    targetInstrument: Optional[FinancingInstrument] = None


# ============================================================================
# API CONTRACT ADAPTER: Asset -> Legacy Node Translator
# ============================================================================

def asset_to_legacy_node(asset: Any, base_node: Optional[Node] = None) -> Node:
    """
    Translates a rich Core Asset / Asset Model instance into the legacy Node format
    expected by the frontend visualization graph and dashboard controllers.
    """
    # 1. Map delayDays (from physical_state.delay_days or physicalState.delayDays)
    phys = getattr(asset, "physical_state", None) or getattr(asset, "physicalState", None)
    delay_days = getattr(phys, "delay_days", None)
    if delay_days is None:
        delay_days = getattr(phys, "delayDays", 0.0) if phys else 0.0

    # 2. Map loanAmount (from activeFacility.approvedAmount, financial_state.approved_amount, or financialState.approvedAmount)
    fin = getattr(asset, "financial_state", None) or getattr(asset, "financialState", None)
    facility = getattr(asset, "activeFacility", None)
    loan_amount = getattr(facility, "approvedAmount", None)
    if loan_amount is None:
        loan_amount = getattr(fin, "approved_amount", None)
    if loan_amount is None:
        loan_amount = getattr(fin, "approvedAmount", None)
    if loan_amount is None:
        loan_amount = base_node.loanAmount if base_node else 0.0

    # 3. Map interestRate (from activeFacility.interestRate, financial_state.dynamic_interest_rate, or financialState.costOfCapital)
    interest_rate = getattr(facility, "interestRate", None)
    if interest_rate is None:
        interest_rate = getattr(fin, "dynamic_interest_rate", None)
    if interest_rate is None:
        interest_rate = getattr(fin, "costOfCapital", None)
    if interest_rate is None:
        interest_rate = base_node.interestRate if base_node else 7.50

    # 4. Map riskScore (from risk_state.composite_risk_score or riskState.compositeScore)
    risk = getattr(asset, "risk_state", None) or getattr(asset, "riskState", None)
    risk_score = getattr(risk, "composite_risk_score", None)
    if risk_score is None:
        risk_score = getattr(risk, "compositeScore", None)
    if risk_score is None:
        risk_score = base_node.riskScore if base_node else 0.10

    # 5. Map Cost / Embodied Value
    cost = getattr(fin, "embodied_economic_value", None)
    if cost is None:
        cost = getattr(fin, "estimatedValue", None)
    if cost is None:
        cost = base_node.cost if base_node else 100000.0

    # 6. Map Financing Instrument
    instrument = base_node.financingInstrument if base_node else FinancingInstrument.PO_FINANCING
    active_inst = getattr(fin, "active_instrument", None) or (getattr(facility, "instrument", None) if facility else None)
    if active_inst:
        inst_str = str(active_inst).lower()
        if "purchase_order" in inst_str or "procurement" in inst_str or "po" in inst_str:
            instrument = FinancingInstrument.PO_FINANCING
        elif "in_transit" in inst_str or "asset_backed" in inst_str or "transit" in inst_str:
            instrument = FinancingInstrument.ASSET_BACKED_LENDING
        elif "warehouse" in inst_str or "inventory" in inst_str:
            instrument = FinancingInstrument.INVENTORY_FINANCING
        elif "invoice" in inst_str or "receivable" in inst_str:
            instrument = FinancingInstrument.INVOICE_FACTORING

    # 7. Map Asset State
    stage_str = str(getattr(asset, "lifecycle_stage", None) or getattr(asset, "lifecycleStage", "")).upper()
    if "CASH" in stage_str:
        asset_state = AssetState.SETTLED
    elif loan_amount > 0 or getattr(fin, "is_encumbered", False) or getattr(fin, "existing_exposure", 0.0) > 0:
        asset_state = AssetState.FINANCED
    else:
        asset_state = base_node.assetState if base_node else AssetState.UNFINANCED

    # 8. Map Collateral Hash
    collateral_hash = getattr(fin, "collateral_lien_hash", None)
    if collateral_hash is None:
        contract = getattr(asset, "contractual_state", None) or getattr(asset, "contractualState", None)
        collateral_hash = getattr(contract, "collateralHash", None)
    if collateral_hash is None and base_node:
        collateral_hash = base_node.collateralHash

    node_id = getattr(asset, "asset_id", None) or getattr(asset, "assetId", None) or (base_node.id if base_node else str(uuid.uuid4()))
    node_name = getattr(asset, "name", None) or (base_node.name if base_node else "Asset Node")
    batch_id = getattr(asset, "batch_id", None) or getattr(asset, "batchId", None) or (base_node.batchId if base_node else "BATCH-NX-2026-A1")
    dwell_days = getattr(phys, "dwell_days", None)
    if dwell_days is None:
        dwell_days = getattr(phys, "dwellDays", 0.0) if phys else 0.0

    return Node(
        id=node_id,
        name=node_name,
        type=base_node.type if base_node else NodeType.FACTORY,
        cost=cost,
        delayDays=float(delay_days),
        dependsOn=base_node.dependsOn if base_node else [],
        financingInstrument=instrument,
        assetState=asset_state,
        loanAmount=float(loan_amount),
        ltvRatio=float(getattr(fin, "ltv_ratio", None) or getattr(fin, "targetLtv", 0.80)),
        riskScore=float(risk_score),
        interestRate=float(interest_rate),
        batchId=batch_id,
        collateralHash=collateral_hash,
        tier=base_node.tier if base_node else 1,
        storageDurationDays=float(dwell_days),
        supplierReliabilityScore=base_node.supplierReliabilityScore if base_node else 0.92,
        baseCost=base_node.baseCost if base_node else cost,
        baseLeadTimeDays=base_node.baseLeadTimeDays if base_node else 5.0,
        isBottleneck=base_node.isBottleneck if base_node else False,
        bottleneckReason=base_node.bottleneckReason if base_node else None,
        position=base_node.position if base_node else None
    )


def assets_to_legacy_nodes(assets: List[Any], base_nodes: Optional[List[Node]] = None) -> List[Node]:
    """
    Translates a collection of Asset digital twins to legacy Nodes.
    """
    base_map = {n.id: n for n in (base_nodes or [])}
    result: List[Node] = []
    for asset in assets:
        asset_id = getattr(asset, "asset_id", None) or getattr(asset, "assetId", None)
        base_node = base_map.get(asset_id)
        result.append(asset_to_legacy_node(asset, base_node))
    return result
