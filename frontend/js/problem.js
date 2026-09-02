/**
 * NODE-X-LOGISTICS — PROBLEM EXPLORER INTERACTIVE CONTROLLER
 * IEEE HACKVERSE 2026 #6: "Building a Competitive Capital Market for Supply-Chain Working Capital"
 * 100% faithful to the official Problem Statement specification.
 */

// 1. DATA: 9-Stage Asset Lifecycle Matrix
const LIFECYCLE_STAGES = [
  {
    id: "po",
    name: "Purchase Order",
    step: "01",
    isMilestone: true,
    physical: "Buyer issues formal purchase specification; supplier reserves factory capacity and schedules raw inputs.",
    financial: "Zero cash flow realized; working capital obligation incurred by supplier.",
    contractual: "Legally binding procurement agreement specifying delivery terms, price, and specs.",
    value: "Initial Economic Commitment",
    riskLevel: "High Operational Uncertainty",
    liquidityNeed: "High (Material Procurement & Tooling)",
    financingPotential: "Purchase-Order Financing (PO Credit Line)",
    traditionalStatus: "Active Financial Milestone",
    riskQualitative: { value: "Low", risk: "High", liquidity: "High", potential: "Moderate" }
  },
  {
    id: "raw_material",
    name: "Raw Material",
    step: "02",
    isMilestone: false,
    physical: "Raw commodities (cotton, silicon wafers, steel) delivered to supplier docks and inspected.",
    financial: "Supplier capital consumed in purchasing and holding raw inventory.",
    contractual: "Supplier-to-subtier invoices, bills of lading, and material test certificates.",
    value: "Material Cost Embodied in Inventory",
    riskLevel: "Supplier Execution & Quality Risk",
    liquidityNeed: "High (Working Capital Tied in Inputs)",
    financingPotential: "Procurement / Raw Material Financing",
    traditionalStatus: "Financial Blind Spot (Trapped Capital)",
    riskQualitative: { value: "Low-Med", risk: "High", liquidity: "High", potential: "Emerging" }
  },
  {
    id: "production",
    name: "Production",
    step: "03",
    isMilestone: false,
    physical: "Manufacturing, fabrication, assembly, and quality verification on factory line.",
    financial: "Operational expenses accumulate (labor, power, equipment depreciation).",
    contractual: "Work-in-progress (WIP) logs, production milestones, yield verification.",
    value: "Value-Add Compounding in Real Time",
    riskLevel: "Yield Defect, Machinery Failure, Power Delays",
    liquidityNeed: "Peak (Operational Payroll & Overhead)",
    financingPotential: "Inventory / WIP Financing",
    traditionalStatus: "Financial Blind Spot (Trapped Capital)",
    riskQualitative: { value: "Medium", risk: "Medium-High", liquidity: "Peak", potential: "Expanding" }
  },
  {
    id: "finished_goods",
    name: "Finished Goods",
    step: "04",
    isMilestone: false,
    physical: "Units assembled, packaged, palletized, and marked ready for dispatch.",
    financial: "Full production cost absorbed; capital remains unliquidated awaiting freight.",
    contractual: "Certificate of Origin, Packing List, Pre-shipment Inspection Certificate.",
    value: "Complete Manufactured Economic Value",
    riskLevel: "Holding Storage Deterioration & Transit Delays",
    liquidityNeed: "High (Carrying Holding Costs)",
    financingPotential: "Finished Goods Inventory Financing",
    traditionalStatus: "Financial Blind Spot (Trapped Capital)",
    riskQualitative: { value: "Medium-High", risk: "Medium", liquidity: "High", potential: "Strong" }
  },
  {
    id: "shipment",
    name: "Shipment",
    step: "05",
    isMilestone: false,
    physical: "Ocean container vessel, air cargo, or intermodal freight transit across borders.",
    financial: "Freight tariffs, insurance, and customs duties incurred.",
    contractual: "Ocean Bill of Lading (B/L), Air Waybill, Carrier Telematics Manifest.",
    value: "Asset Location Value & In-Transit Utility",
    riskLevel: "Route Bottlenecks, Port Congestion, Weather Storms",
    liquidityNeed: "Medium (Freight Payments & Margin)",
    financingPotential: "In-Transit Asset-Backed Financing (ABL)",
    traditionalStatus: "Financial Blind Spot (Trapped Capital)",
    riskQualitative: { value: "High", risk: "Medium", liquidity: "Medium", potential: "High" }
  },
  {
    id: "warehouse",
    name: "Warehouse",
    step: "06",
    isMilestone: false,
    physical: "Customs cleared; goods stored in regional distribution center awaiting fulfillment.",
    financial: "Storage dwell fees accrue; inventory collateral monitored.",
    contractual: "Warehouse Receipt, Dock Intake Warrant, Custody Transfer Log.",
    value: "Localized Stock Ready for Instant Fulfillment",
    riskLevel: "Dwell Degradation, Demand Fluctuations",
    liquidityNeed: "Medium (Storage & Distribution Costs)",
    financingPotential: "Warehouse Receipts / Storage Inventory ABL",
    traditionalStatus: "Financial Blind Spot (Trapped Capital)",
    riskQualitative: { value: "High", risk: "Low-Medium", liquidity: "Medium", potential: "High" }
  },
  {
    id: "delivery",
    name: "Delivery",
    step: "07",
    isMilestone: false,
    physical: "Final mile dispatch and physical handover to buyer receiving dock.",
    financial: "Physical performance obligation completed; payment term clock starts.",
    contractual: "Proof of Delivery (POD), Consignee Acceptance Signature.",
    value: "Fully Realized Physical Value",
    riskLevel: "Rejection on Intake, Discrepancy Claims",
    liquidityNeed: "Medium (Transition to Accounts Receivable)",
    financingPotential: "Trade Financing / Post-Delivery Credit",
    traditionalStatus: "Financial Blind Spot (Trapped Capital)",
    riskQualitative: { value: "High", risk: "Low", liquidity: "Medium", potential: "Very High" }
  },
  {
    id: "invoice",
    name: "Invoice",
    step: "08",
    isMilestone: true,
    physical: "Goods accepted and integrated into buyer inventory.",
    financial: "Commercial invoice rendered with credit payment terms (e.g. Net-60/90).",
    contractual: "Approved Commercial Invoice & Accounts Payable Ledger Entry.",
    value: "Formalized Commercial Debt Obligation",
    riskLevel: "Buyer Credit Risk & Payment Lag",
    liquidityNeed: "High (Supplier Awaiting 60-90 Day Terms)",
    financingPotential: "Invoice Financing / Factoring",
    traditionalStatus: "Active Financial Milestone",
    riskQualitative: { value: "High", risk: "Low", liquidity: "High", potential: "Peak" }
  },
  {
    id: "receivable",
    name: "Receivable",
    step: "09",
    isMilestone: true,
    physical: "Goods sold or consumed in buyer's downstream retail/distribution.",
    financial: "Cash settlement disbursed via banking rails, extinguishing facility lien.",
    contractual: "Bank Remittance Advice, Lien Release & Settlement Receipt.",
    value: "100% Cash Realization",
    riskLevel: "Settlement Nominal Risk",
    liquidityNeed: "Zero (Working Capital Restored)",
    financingPotential: "Full Facility Settlement & Collateral Release",
    traditionalStatus: "Active Financial Milestone",
    riskQualitative: { value: "Peak", risk: "Nominal", liquidity: "Zero", potential: "Settled" }
  }
];

// 2. DATA: Agentic Decision Loop Steps
const AGENTIC_STEPS = [
  {
    num: "01",
    name: "Track Asset",
    summary: "Maintain a continuously evolving representation of the underlying asset.",
    detail: "Ingests continuous telematics and records across supply-chain nodes to build an immutable digital twin of the physical batch."
  },
  {
    num: "02",
    name: "Verify Physical State",
    summary: "Reconcile evidence from ERP, logistics, warehouse, IoT and other sources.",
    detail: "Cross-checks conflicting telemetry, sensor logs, and shipping manifests to certify true ground reality without trusting single points of failure."
  },
  {
    num: "03",
    name: "Assess Value & Risk",
    summary: "Reassess value and risk as the physical state changes.",
    detail: "Computes dynamic risk coefficients based on dwell time, route disruptions, and operational milestones achieved."
  },
  {
    num: "04",
    name: "Identify Financing Need",
    summary: "Determine whether capital is required at the current stage.",
    detail: "Evaluates the stakeholder's working capital runway and identifies trapped capital constraints along the supply pipeline."
  },
  {
    num: "05",
    name: "Select Instrument",
    summary: "Evaluate the financing mechanism appropriate to the lifecycle stage.",
    detail: "Selects between PO Financing, In-Transit ABL, Warehouse Receipts, or Factoring depending on physical collateral custody."
  },
  {
    num: "06",
    name: "Determine Amount",
    summary: "Determine how much capital can safely be deployed.",
    detail: "Calculates conservative Loan-To-Value (LTV) limits that protect capital providers against downstream shrinkage or default."
  },
  {
    num: "07",
    name: "Monitor Lifecycle",
    summary: "Continuously monitor changes and events.",
    detail: "Listens for real-time telemetry events like port blockades, customs holds, or accelerated deliveries to trigger immediate repricing."
  },
  {
    num: "08",
    name: "Refinance / Transition",
    summary: "Transition the financing arrangement as the asset evolves.",
    detail: "Autonomously rolls over pre-shipment PO debt into in-transit ABL, and in-transit debt into warehouse leverage without balance-sheet friction."
  },
  {
    num: "09",
    name: "Settle",
    summary: "Move toward cash realisation and settlement.",
    detail: "Disburses factoring funds upon delivery verification, pays down senior lien claims in full, and releases cryptographic collateral locks."
  }
];

// 3. DATA: Event Scenarios
const EVENT_SCENARIOS = {
  port_blockade: {
    name: "Shipment Interruption (Port Blockade)",
    stage: "Shipment (In-Transit)",
    event: "Port of Singapore congestion adds +14 days to sea voyage.",
    assetUpdate: "Physical state updated: In-Transit (Delay +14d, Routing Rerouted).",
    riskReassess: "Risk score increases (Medium → High); CCC increases by 14 days.",
    decision: "REPRICE / CONTRACT LTV: Dynamic interest spread +85 bps, credit capacity adjusted to maintain capital safety.",
    actionType: "REPRICE & DEFEND"
  },
  prod_delay: {
    name: "Production Delay (Machinery Failure)",
    stage: "Production (Assembly)",
    event: "CNC fabrication spindle outage halts line for +8 days.",
    assetUpdate: "Physical state updated: WIP Dwell extended; raw material staging backlog.",
    riskReassess: "Operational uncertainty spikes; delivery timeline compression.",
    decision: "REPRICE FACILITY: PO Credit Line margin adjusted; supplier reliability score updated.",
    actionType: "REVISE TERMS"
  },
  dwell_decay: {
    name: "Inventory Deterioration (Dwell Decay)",
    stage: "Warehouse Storage",
    event: "Goods exceed optimal dwell threshold by 21 days in regional hub.",
    assetUpdate: "Physical state updated: Storage duration 35 days (Exceeds 14-day SLA).",
    riskReassess: "Inventory collateral value depreciated; obsolescence factor triggered.",
    decision: "CONTRACT BORROWING BASE: LTV reduced from 80% to 65%; liquidity buffer alert issued.",
    actionType: "DECREASE EXPOSURE"
  },
  delivery_confirm: {
    name: "Delivery Milestone Confirmed",
    stage: "Delivery → Invoiced",
    event: "Buyer electronic dock signature confirmed; physical goods accepted.",
    assetUpdate: "Physical state updated: Delivered; Invoice rendered with Net-60 terms.",
    riskReassess: "Physical risk collapses to near-zero; transition to commercial credit risk.",
    decision: "TRANSITION INSTRUMENT: Roll in-transit ABL into Invoice Factoring at prime discount rate.",
    actionType: "AUTONOMOUS TRANSITION"
  }
};

// Current active state tracker
let activeLifecycleIndex = 0;
let activeLoopIndex = 0;
let isLayersMerged = false;

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  renderLifecycleStream();
  selectLifecycleStage(0);
  renderAgenticLoop();
  selectAgenticStep(0);
  selectEventScenario("port_blockade");
  setupScrollSpy();
});

// Render the 9-stage horizontal stream
function renderLifecycleStream() {
  const container = document.getElementById("streamNodesRow");
  if (!container) return;

  container.innerHTML = LIFECYCLE_STAGES.map((s, idx) => `
    <div class="stream-node-chip ${idx === 0 ? 'active' : ''} ${s.isMilestone ? 'traditional-milestone' : ''}" 
         id="streamChip_${idx}" onclick="selectLifecycleStage(${idx})">
      <span class="node-step-num">STAGE ${s.step}</span>
      <h4 class="node-step-title">${s.name}</h4>
      <span class="node-step-badge">${s.isMilestone ? 'FINANCIAL MILESTONE' : 'PHYSICAL STATE'}</span>
    </div>
  `).join("");
}

// Select lifecycle stage and update all inspector cards
function selectLifecycleStage(idx) {
  activeLifecycleIndex = idx;
  const stage = LIFECYCLE_STAGES[idx];

  // Update chip highlights
  LIFECYCLE_STAGES.forEach((_, i) => {
    const chip = document.getElementById(`streamChip_${i}`);
    if (chip) {
      if (i === idx) chip.classList.add("active");
      else chip.classList.remove("active");
    }
  });

  // Update Section 3 / 4 Inspector Displays
  const inspTitle = document.getElementById("inspStageTitle");
  const inspStep = document.getElementById("inspStageStep");
  const inspPhysical = document.getElementById("inspPhysicalText");
  const inspFinancial = document.getElementById("inspFinancialText");
  const inspContractual = document.getElementById("inspContractualText");
  const inspValue = document.getElementById("inspValueText");
  const inspRisk = document.getElementById("inspRiskText");
  const inspLiquidity = document.getElementById("inspLiquidityText");
  const inspFinancing = document.getElementById("inspFinancingText");
  const inspTraditional = document.getElementById("inspTraditionalText");

  if (inspTitle) inspTitle.textContent = stage.name;
  if (inspStep) inspStep.textContent = `LIFECYCLE STAGE ${stage.step} OF 09`;
  if (inspPhysical) inspPhysical.textContent = stage.physical;
  if (inspFinancial) inspFinancial.textContent = stage.financial;
  if (inspContractual) inspContractual.textContent = stage.contractual;
  if (inspValue) inspValue.textContent = stage.value;
  if (inspRisk) inspRisk.textContent = stage.riskLevel;
  if (inspLiquidity) inspLiquidity.textContent = stage.liquidityNeed;
  if (inspFinancing) inspFinancing.textContent = stage.financingPotential;
  if (inspTraditional) inspTraditional.textContent = stage.traditionalStatus;

  // Also update Section 7 Risk Matrix if present
  updateRiskMatrix(idx);
}

// Update qualitative risk matrix (Section 7)
function updateRiskMatrix(idx) {
  const stage = LIFECYCLE_STAGES[idx];
  const stageBtns = document.querySelectorAll(".risk-stage-btn");
  stageBtns.forEach((btn, i) => {
    if (i === idx) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  const valBadge = document.getElementById("riskMeterValue");
  const riskBadge = document.getElementById("riskMeterRisk");
  const liqBadge = document.getElementById("riskMeterLiq");
  const potBadge = document.getElementById("riskMeterPot");
  const descEl = document.getElementById("riskStageExpl");

  if (valBadge) valBadge.textContent = stage.riskQualitative.value;
  if (riskBadge) riskBadge.textContent = stage.riskQualitative.risk;
  if (liqBadge) liqBadge.textContent = stage.riskQualitative.liquidity;
  if (potBadge) potBadge.textContent = stage.riskQualitative.potential;

  if (descEl) {
    descEl.textContent = `At the ${stage.name.toUpperCase()} stage, the underlying asset has accumulated ${stage.value.toLowerCase()}. Operational risk is characterized by "${stage.riskLevel}", requiring "${stage.financingPotential}".`;
  }
}

// 3-Layer Merging Animation (Section 8)
function toggleLayerMerge() {
  isLayersMerged = !isLayersMerged;
  const layers = document.querySelectorAll(".state-layer-box");
  const mergeBtn = document.getElementById("mergeLayersBtn");
  const mergeResult = document.getElementById("mergedResultCard");

  layers.forEach(layer => {
    if (isLayersMerged) {
      layer.classList.add("merged");
    } else {
      layer.classList.remove("merged");
    }
  });

  if (mergeBtn) {
    mergeBtn.textContent = isLayersMerged ? "SEPARATE 3 INDEPENDENT LAYERS" : "MERGE INTO UNIFIED ASSET STATE";
  }

  if (mergeResult) {
    if (isLayersMerged) {
      mergeResult.style.display = "block";
      mergeResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      mergeResult.style.display = "none";
    }
  }
}

// Render Agentic Decision Loop (Section 9)
function renderAgenticLoop() {
  const container = document.getElementById("agenticLoopGrid");
  if (!container) return;

  container.innerHTML = AGENTIC_STEPS.map((s, idx) => `
    <div class="loop-step-card ${idx === 0 ? 'active' : ''}" id="loopCard_${idx}" onclick="selectAgenticStep(${idx})">
      <span class="loop-step-num">STEP ${s.num}</span>
      <h4 class="loop-step-name">${s.name}</h4>
      <p class="body-sm" style="color: var(--body);">${s.summary}</p>
    </div>
  `).join("");
}

// Select Agentic Step
function selectAgenticStep(idx) {
  activeLoopIndex = idx;
  const step = AGENTIC_STEPS[idx];

  AGENTIC_STEPS.forEach((_, i) => {
    const card = document.getElementById(`loopCard_${i}`);
    if (card) {
      if (i === idx) card.classList.add("active");
      else card.classList.remove("active");
    }
  });

  const detailTitle = document.getElementById("loopDetailTitle");
  const detailText = document.getElementById("loopDetailText");
  const detailStep = document.getElementById("loopDetailStep");

  if (detailTitle) detailTitle.textContent = step.name;
  if (detailText) detailText.textContent = step.detail;
  if (detailStep) detailStep.textContent = `DECISION NODE ${step.num} OF 09`;
}

// Select Event Simulation Scenario (Section 12)
function selectEventScenario(key) {
  const scenario = EVENT_SCENARIOS[key];
  if (!scenario) return;

  const buttons = document.querySelectorAll(".event-chip-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("data-event") === key) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  const pipeTitle = document.getElementById("eventPipeTitle");
  const pipeStage = document.getElementById("eventPipeStage");
  const pipeEvent = document.getElementById("eventPipeEvent");
  const pipeAsset = document.getElementById("eventPipeAsset");
  const pipeRisk = document.getElementById("eventPipeRisk");
  const pipeDecision = document.getElementById("eventPipeDecision");
  const pipeAction = document.getElementById("eventPipeAction");

  if (pipeTitle) pipeTitle.textContent = scenario.name;
  if (pipeStage) pipeStage.textContent = scenario.stage;
  if (pipeEvent) pipeEvent.textContent = scenario.event;
  if (pipeAsset) pipeAsset.textContent = scenario.assetUpdate;
  if (pipeRisk) pipeRisk.textContent = scenario.riskReassess;
  if (pipeDecision) pipeDecision.textContent = scenario.decision;
  if (pipeAction) pipeAction.textContent = scenario.actionType;
}

// Scrollspy for Subnav
function setupScrollSpy() {
  const sections = document.querySelectorAll(".problem-section, .problem-hero-wrap");
  const navLinks = document.querySelectorAll(".subnav-link");

  window.addEventListener("scroll", () => {
    let currentId = "";
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) {
        currentId = sec.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (currentId && link.getAttribute("href") === `#${currentId}`) {
        link.classList.add("active");
      }
    });
  });
}
