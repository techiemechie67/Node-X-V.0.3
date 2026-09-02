"""
Supply Chain Financing Intelligence Engine — Asset Domain Models (Phase 1).
Defines core lifecycle stages, instruments, decision actions, and typed state containers
for real-time physical-financial asset coupling and risk assessment.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class LifecycleStage(str, Enum):
    PURCHASE_ORDER = "PURCHASE_ORDER"
    RAW_MATERIAL = "RAW_MATERIAL"
    PRODUCTION = "PRODUCTION"
    IN_TRANSIT = "IN_TRANSIT"
    WAREHOUSE = "WAREHOUSE"
    DELIVERED = "DELIVERED"
    INVOICED = "INVOICED"
    RECEIVABLE = "RECEIVABLE"
    CASH = "CASH"


class FinancingInstrument(str, Enum):
    PURCHASE_ORDER_FINANCING = "PURCHASE_ORDER_FINANCING"
    PROCUREMENT_FINANCING = "PROCUREMENT_FINANCING"
    INVENTORY_FINANCING = "INVENTORY_FINANCING"
    IN_TRANSIT_FINANCING = "IN_TRANSIT_FINANCING"
    WAREHOUSE_FINANCING = "WAREHOUSE_FINANCING"
    TRADE_FINANCING = "TRADE_FINANCING"
    INVOICE_FINANCING = "INVOICE_FINANCING"
    RECEIVABLES_FINANCING = "RECEIVABLES_FINANCING"
    NONE = "NONE"


class DecisionAction(str, Enum):
    INITIATE = "INITIATE"
    TRANSITION = "TRANSITION"
    REFINANCE = "REFINANCE"
    REDUCE = "REDUCE"
    INCREASE = "INCREASE"
    HOLD = "HOLD"
    SETTLE = "SETTLE"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    NO_ACTION = "NO_ACTION"


class EventType(str, Enum):
    PO_ISSUED = "PO_ISSUED"
    MATERIAL_RECEIVED = "MATERIAL_RECEIVED"
    PRODUCTION_STARTED = "PRODUCTION_STARTED"
    PRODUCTION_COMPLETED = "PRODUCTION_COMPLETED"
    DISPATCHED = "DISPATCHED"
    TRANSIT_UPDATE = "TRANSIT_UPDATE"
    TRANSIT_DELAY = "TRANSIT_DELAY"
    WAREHOUSE_CHECKIN = "WAREHOUSE_CHECKIN"
    WAREHOUSE_DWELL_SPIKE = "WAREHOUSE_DWELL_SPIKE"
    DELIVERY_COMPLETED = "DELIVERY_COMPLETED"
    INVOICE_ISSUED = "INVOICE_ISSUED"
    PAYMENT_RECEIVED = "PAYMENT_RECEIVED"
    DISRUPTION_SHOCK = "DISRUPTION_SHOCK"
    DATA_UPDATE = "DATA_UPDATE"
    ATTEMPTED_DOUBLE_FINANCE = "ATTEMPTED_DOUBLE_FINANCE"


class DataSource(str, Enum):
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


class DataPoint(BaseModel):
    field: str
    value: Any
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: DataSource = DataSource.ERP
    status: str = Field(default="VALID", description="VALID | CONFLICT | STALE")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PhysicalState(BaseModel):
    location: str = "Origin Factory"
    quantity: float = 1000.0
    unit: str = "units"
    condition: str = "NOMINAL"
    temperatureCelsius: Optional[float] = None
    delayDays: float = 0.0
    dwellDays: float = 0.0
    routeRiskIndex: float = 0.0
    dataPoints: Dict[str, DataPoint] = Field(default_factory=dict)


class FinancialState(BaseModel):
    estimatedValue: float = 100000.0
    workingCapitalNeed: float = 80000.0
    currency: str = "USD"
    existingExposure: float = 0.0
    approvedAmount: float = 0.0
    costOfCapital: float = 7.50
    targetLtv: float = 0.80
    dataPoints: Dict[str, DataPoint] = Field(default_factory=dict)


class ContractualState(BaseModel):
    poNumber: str = "PO-2026-001"
    buyerId: str = "BUYER-GLOBAL-RETAIL"
    supplierId: str = "SUPPLIER-TIER1"
    incoterms: str = "FOB"
    paymentDueDays: int = 45
    lienHolder: Optional[str] = None
    collateralHash: Optional[str] = None
    isEncumbered: bool = False
    dataPoints: Dict[str, DataPoint] = Field(default_factory=dict)


class RiskState(BaseModel):
    buyerRisk: float = Field(default=0.10, ge=0.0, le=1.0)
    supplierRisk: float = Field(default=0.10, ge=0.0, le=1.0)
    physicalAssetRisk: float = Field(default=0.05, ge=0.0, le=1.0)
    productionRisk: float = Field(default=0.05, ge=0.0, le=1.0)
    logisticsRisk: float = Field(default=0.05, ge=0.0, le=1.0)
    inventoryRisk: float = Field(default=0.05, ge=0.0, le=1.0)
    marketRisk: float = Field(default=0.05, ge=0.0, le=1.0)
    paymentRisk: float = Field(default=0.08, ge=0.0, le=1.0)
    dataConfidence: float = Field(default=0.95, ge=0.0, le=1.0)
    duplicateFinancingRisk: float = Field(default=0.0, ge=0.0, le=1.0)
    compositeScore: float = Field(default=0.15, ge=0.0, le=1.0)
    activeComponents: List[str] = Field(default_factory=list)
    breakdown: Dict[str, float] = Field(default_factory=dict)


class FinancingFacility(BaseModel):
    facilityId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    instrument: FinancingInstrument
    approvedAmount: float
    drawnAmount: float = 0.0
    interestRate: float = 7.50
    ltvRatio: float = 0.80
    status: str = "ACTIVE"  # ACTIVE | REFINANCED | REDUCED | SETTLED | CANCELLED
    lienHash: Optional[str] = None
    issuedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    maturesAt: Optional[str] = None
    settledAt: Optional[str] = None


class Event(BaseModel):
    eventId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    eventType: EventType
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: DataSource = DataSource.ERP
    description: str = ""
    payload: Dict[str, Any] = Field(default_factory=dict)
    triggeredRecalculation: bool = False
    resolvedNotes: Optional[str] = None


class Decision(BaseModel):
    decisionId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    assetId: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    lifecycleStage: LifecycleStage
    action: DecisionAction
    selectedInstrument: FinancingInstrument
    recommendedAmount: float
    approvedLTV: float
    dynamicRate: float
    riskScore: float
    maximumSafeAmount: float
    workingCapitalNeed: float
    existingExposure: float
    rationale: str
    alternativeInstruments: List[Dict[str, Any]] = Field(default_factory=list)
    triggeredByEventId: Optional[str] = None
    dataConfidence: float = 1.0
    requiresReview: bool = False


class Asset(BaseModel):
    assetId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batchId: str = "BATCH-NX-2026-A1"
    name: str = "Electronics Assembly Batch A1"
    lifecycleStage: LifecycleStage = LifecycleStage.PURCHASE_ORDER
    physicalState: PhysicalState = Field(default_factory=PhysicalState)
    financialState: FinancialState = Field(default_factory=FinancialState)
    contractualState: ContractualState = Field(default_factory=ContractualState)
    riskState: RiskState = Field(default_factory=RiskState)
    activeFacility: Optional[FinancingFacility] = None
    facilities: List[FinancingFacility] = Field(default_factory=list)
    existingExposure: float = 0.0
    events: List[Event] = Field(default_factory=list)
    decisions: List[Decision] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
