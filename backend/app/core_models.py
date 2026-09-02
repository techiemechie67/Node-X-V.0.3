"""
IEEE HACKVERSE 2026 — Problem Statement 6:
Building a Competitive Capital Market for Supply-Chain Working Capital

Core Data Models:
1. Core Asset Data Model (Asset, PhysicalState, FinancialState, ContractualState, RiskState, DataConfidence)
2. Decision Output Data Model (Decision, DecisionAction, FinancingInstrument, LifecycleStage)
"""

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


# ============================================================================
# 1. LIFECYCLE STAGES ENUM (9 Stages from Purchase Order to Cash)
# ============================================================================

class LifecycleStage(str, Enum):
    """
    The 9 discrete physical-economic lifecycle stages of a supply-chain asset.
    Physical progress is continuous; financial eligibility evolves across these states.
    """
    PURCHASE_ORDER = "PURCHASE_ORDER"
    RAW_MATERIAL = "RAW_MATERIAL"
    PRODUCTION = "PRODUCTION"
    FINISHED_GOODS = "FINISHED_GOODS"
    IN_TRANSIT = "IN_TRANSIT"
    WAREHOUSE = "WAREHOUSE"
    DELIVERY = "DELIVERY"
    INVOICED = "INVOICED"
    CASH = "CASH"


# ============================================================================
# 2. FINANCING INSTRUMENTS ENUM (8 Specialized Working-Capital Instruments)
# ============================================================================

class FinancingInstrument(str, Enum):
    """
    The 8 financing instruments defined in Problem Statement 6,
    dynamically mapped to custody, risk, and asset lifecycle progression.
    """
    PURCHASE_ORDER_FINANCING = "PURCHASE_ORDER_FINANCING"
    PROCUREMENT_FINANCING = "PROCUREMENT_FINANCING"
    INVENTORY_FINANCING = "INVENTORY_FINANCING"
    IN_TRANSIT_FINANCING = "IN_TRANSIT_FINANCING"
    WAREHOUSE_FINANCING = "WAREHOUSE_FINANCING"
    TRADE_FINANCING = "TRADE_FINANCING"
    INVOICE_FINANCING = "INVOICE_FINANCING"
    RECEIVABLES_FINANCING = "RECEIVABLES_FINANCING"
    NONE = "NONE"


# ============================================================================
# 3. DECISION ACTIONS ENUM
# ============================================================================

class DecisionAction(str, Enum):
    """
    Autonomous actions output by the Decision Engine.
    """
    INITIATE = "INITIATE"
    MAINTAIN = "MAINTAIN"
    INCREASE = "INCREASE"
    REDUCE = "REDUCE"
    TRANSITION = "TRANSITION"
    REFINANCE = "REFINANCE"
    HOLD = "HOLD"
    SETTLE = "SETTLE"
    REJECT = "REJECT"
    FLAG_FRAUD = "FLAG_FRAUD"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    NO_ACTION = "NO_ACTION"


# ============================================================================
# 4. DATA TELEMETRY & CONFIDENCE RECONCILIATION
# ============================================================================

class DataSource(str, Enum):
    """
    Heterogeneous data sources supplying telemetry, records, and attestations.
    """
    ERP = "ERP"
    IOT_TELEMETRY = "IOT_TELEMETRY"
    CUSTOMS_PORTAL = "CUSTOMS_PORTAL"
    CARRIER_API = "CARRIER_API"
    WAREHOUSE_WMS = "WAREHOUSE_WMS"
    BANK_FEED = "BANK_FEED"
    MANUAL_INSPECTION = "MANUAL_INSPECTION"
    SUPPLIER_PORTAL = "SUPPLIER_PORTAL"
    BUYER_PORTAL = "BUYER_PORTAL"
    CONSENSUS_ORACLE = "CONSENSUS_ORACLE"


class ConflictStatus(str, Enum):
    """
    Status of multi-source data reconciliation.
    """
    NO_CONFLICT = "NO_CONFLICT"
    CONFLICT_DETECTED = "CONFLICT_DETECTED"
    RESOLVED = "RESOLVED"
    STALE = "STALE"


class DataConfidence(BaseModel):
    """
    Tracks provenance, timestamp, confidence score (0.0 to 1.0), and conflict status
    for every telemetry data point ingested by the engine.
    """
    source: DataSource = DataSource.ERP
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    conflict_status: ConflictStatus = Field(default=ConflictStatus.NO_CONFLICT)
    conflict_details: Optional[str] = Field(default=None, description="Details if multiple conflicting feeds occurred")
    raw_source_id: Optional[str] = Field(default=None, description="External transaction ID or sensor serial number")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DataPoint(BaseModel):
    """
    Typed envelope binding any field value to its DataConfidence attestation.
    """
    field_name: str
    value: Any
    confidence: DataConfidence = Field(default_factory=DataConfidence)


# ============================================================================
# 5. NESTED STATE CONTAINERS
# ============================================================================

class PhysicalState(BaseModel):
    """
    Represents the real-world physical location, custody, condition, and progress of the asset.
    """
    current_stage: LifecycleStage = LifecycleStage.PURCHASE_ORDER
    location: str = Field(default="Origin Factory / Supplier Dock", description="Current physical location or port")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    custody_holder: str = Field(default="Tier-1 Supplier", description="Entity currently in physical possession")
    quantity: float = Field(default=1000.0, ge=0.0)
    unit: str = Field(default="units", description="units | kg | pallets | metric_tons | containers")
    condition: str = Field(default="NOMINAL", description="NOMINAL | INSPECTED | DAMAGED | DEGRADED | QUARANTINED")
    temperature_celsius: Optional[float] = None
    delay_days: float = Field(default=0.0, ge=0.0, description="Accumulated operational delay beyond baseline SLA")
    dwell_days: float = Field(default=0.0, ge=0.0, description="Storage dwell duration in warehouse or port dock")
    route_risk_index: float = Field(default=0.0, ge=0.0, le=1.0, description="Environmental/chokepoint route volatility")
    last_inspection_timestamp: Optional[datetime] = None
    provenance_trail: List[str] = Field(default_factory=list, description="Ordered history of custody checkpoints")
    data_confidences: Dict[str, DataConfidence] = Field(default_factory=dict)


class FinancialState(BaseModel):
    """
    Represents economic value, existing debt exposures, collateral liens, and credit limits.
    """
    embodied_economic_value: float = Field(default=100000.0, ge=0.0, description="Estimated economic value of the goods")
    base_cost: float = Field(default=75000.0, ge=0.0, description="Baseline production/acquisition cost")
    accumulated_carrying_cost: float = Field(default=0.0, ge=0.0, description="Tariffs, freight fees, and dwell charges")
    working_capital_need: float = Field(default=80000.0, ge=0.0, description="Capital required by the asset at current stage")
    currency: str = Field(default="USD", max_length=3)
    active_facility_id: Optional[str] = Field(default=None, description="Active financing facility UUID")
    active_instrument: FinancingInstrument = Field(default=FinancingInstrument.NONE)
    existing_exposure: float = Field(default=0.0, ge=0.0, description="Cumulative outstanding drawn financing across tiers")
    drawn_amount: float = Field(default=0.0, ge=0.0, description="Amount drawn under current active facility")
    approved_amount: float = Field(default=0.0, ge=0.0, description="Approved credit limit under current active facility")
    dynamic_interest_rate: float = Field(default=7.50, ge=0.0, description="Annualized dynamic interest or discount rate %")
    ltv_ratio: float = Field(default=0.80, ge=0.0, le=1.0, description="Approved Loan-To-Value ratio")
    collateral_lien_hash: Optional[str] = Field(default=None, description="SHA-256 cryptographic collateral lien hash")
    is_encumbered: bool = Field(default=False, description="True if locked under an active financing facility")
    senior_lien_holder: Optional[str] = Field(default=None, description="Lending institution holding senior claim")
    data_confidences: Dict[str, DataConfidence] = Field(default_factory=dict)


class ContractualState(BaseModel):
    """
    Represents legally binding commitments, purchase orders, ownership titles, and commercial invoices.
    """
    po_number: str = Field(default="PO-2026-001", description="Purchase Order identifier")
    po_line_item: Optional[str] = Field(default="LINE-1", description="Line item number")
    buyer_id: str = Field(default="BUYER-GLOBAL-RETAIL", description="Buyer / Consignee entity ID")
    supplier_id: str = Field(default="SUPPLIER-TIER1", description="Seller / Supplier entity ID")
    incoterms: str = Field(default="FOB", description="Incoterms: FOB | CIF | DDP | EXW | CFR")
    agreed_price: float = Field(default=100000.0, ge=0.0, description="Agreed purchase price on PO")
    payment_terms_days: int = Field(default=60, ge=0, description="Buyer payment terms window (e.g. Net-60)")
    invoice_number: Optional[str] = Field(default=None, description="Approved commercial invoice ID")
    invoice_approved: bool = Field(default=False, description="True if buyer accounts payable has approved invoice")
    invoice_due_date: Optional[datetime] = None
    legal_title_holder: str = Field(default="SUPPLIER-TIER1", description="Entity holding legal title under Incoterms")
    covenants: List[str] = Field(default_factory=list, description="Contractual conditions or default triggers")
    data_confidences: Dict[str, DataConfidence] = Field(default_factory=dict)


class RiskState(BaseModel):
    """
    Multi-factor risk assessment combining operational, logistical, counterparty, and fraud vectors.
    """
    composite_risk_score: float = Field(default=0.15, ge=0.0, le=1.0, description="Composite risk metric (0.0=min, 1.0=max)")
    operational_risk: float = Field(default=0.10, ge=0.0, le=1.0, description="Machine breakdown, yield failure, labor strike")
    transit_logistics_risk: float = Field(default=0.05, ge=0.0, le=1.0, description="Port bottlenecks, customs holds, weather storms")
    inventory_dwell_risk: float = Field(default=0.05, ge=0.0, le=1.0, description="Warehouse dwell depreciation and spoilage")
    counterparty_buyer_risk: float = Field(default=0.10, ge=0.0, le=1.0, description="Buyer default / insolvency probability")
    counterparty_supplier_risk: float = Field(default=0.08, ge=0.0, le=1.0, description="Supplier reliability & on-time track record")
    market_price_risk: float = Field(default=0.05, ge=0.0, le=1.0, description="Underlying commodity/product price volatility")
    duplicate_financing_risk: float = Field(default=0.0, ge=0.0, le=1.0, description="Probability of double-pledged collateral")
    data_confidence_score: float = Field(default=0.95, ge=0.0, le=1.0, description="Quality and consistency of ingested data")
    active_risk_factors: List[str] = Field(default_factory=list, description="List of active risk flags triggering rate surcharges")
    risk_breakdown: Dict[str, float] = Field(default_factory=dict, description="Factor-by-factor weight contribution")
    trend: str = Field(default="STABLE", description="STABLE | INCREASING | DECREASING")


# ============================================================================
# 6. CENTRAL ASSET OBJECT
# ============================================================================

class Asset(BaseModel):
    """
    Central Asset Object (Digital Twin of physical-financial supply chain batch).
    Maintains unified awareness of Physical, Financial, Contractual, and Risk states.
    """
    asset_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique Asset UUID")
    batch_id: str = Field(default="BATCH-NX-2026-A1", description="Physical asset batch identifier")
    name: str = Field(default="Electronics Semiconductor Sub-Assembly Batch A1", description="Human-readable asset title")
    sku: Optional[str] = Field(default="SKU-SEMI-2026", description="Stock Keeping Unit / Catalog ID")
    product_category: str = Field(default="Electronics & High-Tech", description="Apparel | Electronics | Industrial | Pharma")
    lifecycle_stage: LifecycleStage = Field(default=LifecycleStage.PURCHASE_ORDER)
    
    # 4 Nested State Containers
    physical_state: PhysicalState = Field(default_factory=PhysicalState)
    financial_state: FinancialState = Field(default_factory=FinancialState)
    contractual_state: ContractualState = Field(default_factory=ContractualState)
    risk_state: RiskState = Field(default_factory=RiskState)
    
    # Historical Tracking
    event_history: List[Dict[str, Any]] = Field(default_factory=list)
    decision_history: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("asset_id")
    def validate_asset_id(cls, v):
        return v or str(uuid.uuid4())


# ============================================================================
# 7. DECISION OUTPUT DATA MODEL
# ============================================================================

class Decision(BaseModel):
    """
    Decision Output Data Model.
    Emitted by the Agentic Decision Engine to guide working-capital deployment,
    risk repricing, collateral transitions, and waterfall settlements.
    """
    decision_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Decision UUID")
    asset_id: str = Field(..., description="Target Asset UUID")
    batch_id: str = Field(default="BATCH-NX-2026-A1", description="Physical asset batch identifier")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Core Decision Outputs
    lifecycle_stage: LifecycleStage = Field(..., description="Current physical lifecycle stage")
    action: DecisionAction = Field(..., description="INITIATE | REDUCE | TRANSITION | SETTLE | REJECT | etc.")
    recommended_instrument: FinancingInstrument = Field(..., description="Selected financing instrument")
    
    # Financial Sizing & Pricing
    required_financing: float = Field(..., ge=0.0, description="Working capital capital needed at this stage")
    max_safe_amount: float = Field(..., ge=0.0, description="Maximum safe deployable capital under current risk & LTV")
    approved_amount: float = Field(..., ge=0.0, description="Final recommended/approved financing amount")
    ltv_ratio: float = Field(default=0.80, ge=0.0, le=1.0, description="Approved Loan-To-Value ratio")
    dynamic_interest_rate: float = Field(default=7.50, ge=0.0, description="Dynamic annualized interest or discount rate %")
    collateral_lien_hash: Optional[str] = Field(default=None, description="SHA-256 cryptographic collateral lien hash")
    
    # Explainability & Governance
    reasoning: str = Field(..., description="Human-readable explanation detailing triggers, risk factors, and policy rules")
    risk_summary: Dict[str, Any] = Field(default_factory=dict, description="Summary of risk score components driving pricing")
    validation_checks: Dict[str, bool] = Field(
        default_factory=lambda: {
            "anti_double_financing_passed": True,
            "contractual_validity_passed": True,
            "custody_verified": True,
            "ltv_within_safe_bounds": True
        }
    )
    alternative_instruments: List[Dict[str, Any]] = Field(default_factory=list)
    requires_human_review: bool = Field(default=False, description="True if anomaly or fraud risk threshold is breached")
    metadata: Dict[str, Any] = Field(default_factory=dict)
