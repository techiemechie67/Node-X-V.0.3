/**
 * Node-X-Logistics — Standalone In-Browser Mock Engine
 * Port of backend ledger.py, financial.py, propagation.py, and templates.py.
 * Provides 100% standalone execution with exact Pydantic-compatible JSON schemas.
 */

(function () {
  // Pre-loaded Industry Templates
  const APPAREL_IDS = {
    cotton: "a1111111-1111-4111-8111-111111111111",
    weaving: "a2222222-2222-4222-8222-222222222222",
    garment: "a3333333-3333-4333-8333-333333333333",
    ocean: "a4444444-4444-4444-8444-444444444444",
    customs: "a5555555-5555-4555-8555-555555555555",
    warehouse: "a6666666-6666-4666-8666-666666666666",
    delivery: "a7777777-7777-4777-8777-777777777777",
  };

  const ELECTRONICS_IDS = {
    wafer: "e1111111-1111-4111-8111-111111111111",
    pcb: "e2222222-2222-4222-8222-222222222222",
    smt: "e3333333-3333-4333-8333-333333333333",
    air_freight: "e4444444-4444-4444-8444-444444444444",
    cross_dock: "e5555555-5555-4555-8555-555555555555",
    tech_hub: "e6666666-6666-4666-8666-666666666666",
    enterprise: "e7777777-7777-4777-8777-777777777777",
  };

  const TEMPLATES = {
    apparel: {
      id: "apparel",
      name: "Fast-Fashion Apparel Supply Chain",
      description: "High-velocity global garment supply chain from organic cotton farm to international retail distribution.",
      nodes: [
        {
          id: APPAREL_IDS.cotton,
          name: "Organic Cotton Farms",
          type: "factory",
          cost: 140000.0,
          baseCost: 140000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 10.0,
          dependsOn: [],
          financingInstrument: "po_financing",
          assetState: "unfinanced",
          loanAmount: 119000.0,
          ltvRatio: 0.85,
          riskScore: 0.08,
          interestRate: 6.80,
          tier: 1,
          supplierReliabilityScore: 0.96,
          batchId: "BATCH-NX-2026-A1",
          position: { x: 60, y: 140 }
        },
        {
          id: APPAREL_IDS.weaving,
          name: "Spinning & Weaving Mill",
          type: "factory",
          cost: 220000.0,
          baseCost: 220000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 12.0,
          dependsOn: [APPAREL_IDS.cotton],
          financingInstrument: "po_financing",
          assetState: "unfinanced",
          loanAmount: 187000.0,
          ltvRatio: 0.85,
          riskScore: 0.10,
          interestRate: 7.10,
          tier: 1,
          supplierReliabilityScore: 0.92,
          batchId: "BATCH-NX-2026-A1",
          position: { x: 300, y: 140 }
        },
        {
          id: APPAREL_IDS.garment,
          name: "Garment Assembly Plant",
          type: "factory",
          cost: 350000.0,
          baseCost: 350000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 14.0,
          dependsOn: [APPAREL_IDS.weaving],
          financingInstrument: "po_financing",
          assetState: "unfinanced",
          loanAmount: 297500.0,
          ltvRatio: 0.85,
          riskScore: 0.12,
          interestRate: 7.30,
          tier: 1,
          supplierReliabilityScore: 0.90,
          batchId: "BATCH-NX-2026-A1",
          position: { x: 540, y: 140 }
        },
        {
          id: APPAREL_IDS.ocean,
          name: "Ocean Cargo Route 4 (Red Sea / Suez)",
          type: "transit",
          cost: 195000.0,
          baseCost: 195000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 18.0,
          dependsOn: [APPAREL_IDS.garment],
          financingInstrument: "asset_backed_lending",
          assetState: "unfinanced",
          loanAmount: 156000.0,
          ltvRatio: 0.80,
          riskScore: 0.14,
          interestRate: 7.80,
          tier: 2,
          batchId: "BATCH-NX-2026-A1",
          position: { x: 780, y: 140 }
        },
        {
          id: APPAREL_IDS.customs,
          name: "Deep-Sea Port & Customs Gateway",
          type: "transit",
          cost: 85000.0,
          baseCost: 85000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 4.0,
          dependsOn: [APPAREL_IDS.ocean],
          financingInstrument: "asset_backed_lending",
          assetState: "unfinanced",
          loanAmount: 68000.0,
          ltvRatio: 0.80,
          riskScore: 0.15,
          interestRate: 8.00,
          tier: 2,
          batchId: "BATCH-NX-2026-A1",
          position: { x: 1020, y: 140 }
        },
        {
          id: APPAREL_IDS.warehouse,
          name: "Central Fulfilment Center",
          type: "warehouse",
          cost: 160000.0,
          baseCost: 160000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 6.0,
          dependsOn: [APPAREL_IDS.customs],
          financingInstrument: "inventory_financing",
          assetState: "unfinanced",
          loanAmount: 120000.0,
          ltvRatio: 0.75,
          riskScore: 0.12,
          interestRate: 7.60,
          tier: 3,
          storageDurationDays: 8.0,
          batchId: "BATCH-NX-2026-A1",
          position: { x: 1260, y: 140 }
        },
        {
          id: APPAREL_IDS.delivery,
          name: "Global Retail Network & Invoicing",
          type: "delivery",
          cost: 280000.0,
          baseCost: 280000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 3.0,
          dependsOn: [APPAREL_IDS.warehouse],
          financingInstrument: "invoice_factoring",
          assetState: "unfinanced",
          loanAmount: 274400.0,
          ltvRatio: 0.98,
          riskScore: 0.08,
          interestRate: 2.00,
          tier: 4,
          batchId: "BATCH-NX-2026-A1",
          position: { x: 1500, y: 140 }
        }
      ]
    },
    electronics: {
      id: "electronics",
      name: "Electronics & Semiconductor Chain",
      description: "Multi-tier tech manufacturing chain from silicon foundries to global OEM enterprise delivery.",
      nodes: [
        {
          id: ELECTRONICS_IDS.wafer,
          name: "Silicon Wafer Foundry",
          type: "factory",
          cost: 340000.0,
          baseCost: 340000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 16.0,
          dependsOn: [],
          financingInstrument: "po_financing",
          assetState: "unfinanced",
          loanAmount: 289000.0,
          ltvRatio: 0.85,
          riskScore: 0.07,
          interestRate: 6.60,
          tier: 1,
          supplierReliabilityScore: 0.97,
          batchId: "BATCH-NX-2026-E2",
          position: { x: 60, y: 140 }
        },
        {
          id: ELECTRONICS_IDS.pcb,
          name: "PCB & Substrate Fabricator",
          type: "factory",
          cost: 210000.0,
          baseCost: 210000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 10.0,
          dependsOn: [ELECTRONICS_IDS.wafer],
          financingInstrument: "po_financing",
          assetState: "unfinanced",
          loanAmount: 178500.0,
          ltvRatio: 0.85,
          riskScore: 0.09,
          interestRate: 7.00,
          tier: 1,
          supplierReliabilityScore: 0.94,
          batchId: "BATCH-NX-2026-E2",
          position: { x: 300, y: 140 }
        },
        {
          id: ELECTRONICS_IDS.smt,
          name: "Mainboard SMT & Assembly",
          type: "factory",
          cost: 460000.0,
          baseCost: 460000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 12.0,
          dependsOn: [ELECTRONICS_IDS.pcb],
          financingInstrument: "po_financing",
          assetState: "unfinanced",
          loanAmount: 391000.0,
          ltvRatio: 0.85,
          riskScore: 0.11,
          interestRate: 7.20,
          tier: 1,
          supplierReliabilityScore: 0.91,
          batchId: "BATCH-NX-2026-E2",
          position: { x: 540, y: 140 }
        },
        {
          id: ELECTRONICS_IDS.air_freight,
          name: "Transpacific Express Air Cargo",
          type: "transit",
          cost: 280000.0,
          baseCost: 280000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 4.0,
          dependsOn: [ELECTRONICS_IDS.smt],
          financingInstrument: "asset_backed_lending",
          assetState: "unfinanced",
          loanAmount: 229600.0,
          ltvRatio: 0.82,
          riskScore: 0.10,
          interestRate: 7.40,
          tier: 2,
          batchId: "BATCH-NX-2026-E2",
          position: { x: 780, y: 140 }
        },
        {
          id: ELECTRONICS_IDS.cross_dock,
          name: "Airport Customs & Bonded Transit",
          type: "transit",
          cost: 110000.0,
          baseCost: 110000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 2.0,
          dependsOn: [ELECTRONICS_IDS.air_freight],
          financingInstrument: "asset_backed_lending",
          assetState: "unfinanced",
          loanAmount: 90200.0,
          ltvRatio: 0.82,
          riskScore: 0.12,
          interestRate: 7.70,
          tier: 2,
          batchId: "BATCH-NX-2026-E2",
          position: { x: 1020, y: 140 }
        },
        {
          id: ELECTRONICS_IDS.tech_hub,
          name: "High-Tech Cleanroom Warehouse",
          type: "warehouse",
          cost: 220000.0,
          baseCost: 220000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 5.0,
          dependsOn: [ELECTRONICS_IDS.cross_dock],
          financingInstrument: "inventory_financing",
          assetState: "unfinanced",
          loanAmount: 165000.0,
          ltvRatio: 0.75,
          riskScore: 0.13,
          interestRate: 7.50,
          tier: 3,
          storageDurationDays: 5.0,
          batchId: "BATCH-NX-2026-E2",
          position: { x: 1260, y: 140 }
        },
        {
          id: ELECTRONICS_IDS.enterprise,
          name: "OEM Enterprise Invoicing & Handover",
          type: "delivery",
          cost: 520000.0,
          baseCost: 520000.0,
          delayDays: 0.0,
          baseLeadTimeDays: 2.0,
          dependsOn: [ELECTRONICS_IDS.tech_hub],
          financingInstrument: "invoice_factoring",
          assetState: "unfinanced",
          loanAmount: 509600.0,
          ltvRatio: 0.98,
          riskScore: 0.06,
          interestRate: 2.00,
          tier: 4,
          batchId: "BATCH-NX-2026-E2",
          position: { x: 1500, y: 140 }
        }
      ]
    }
  };

  // State Management
  let ACTIVE_NODES_STATE = {};
  let LEDGER_ENTRIES = {};
  let BATCH_HISTORY = {};
  let NODE_BATCH_INDEX = {};
  let ACTIVE_COLLATERAL_LOCKS = {};

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function generateCollateralHash(assetId, batchId, instrument, tier) {
    const raw = `${assetId}:${batchId}:${instrument}:${tier}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
    const hex2 = (Date.now() & 0xffff).toString(16).toUpperCase();
    return `0x${hex}${hex2}B7E3`;
  }

  function getTemplate(templateId) {
    const tid = (templateId || "apparel").toLowerCase();
    const t = TEMPLATES[tid] || TEMPLATES.apparel;
    return deepClone(t);
  }

  function getCurrentNodes(templateId) {
    const tid = (templateId || "apparel").toLowerCase();
    if (!ACTIVE_NODES_STATE[tid] || ACTIVE_NODES_STATE[tid].length === 0) {
      ACTIVE_NODES_STATE[tid] = getTemplate(tid).nodes;
    }
    return ACTIVE_NODES_STATE[tid];
  }

  // Deterministic Financial Pricing Engine
  function computeNodeFinancialMetrics(node, accumulatedDelay = 0.0, costMultiplier = 1.0, routeVolatility = 0.0, storageDwellDays = 0.0) {
    const n = deepClone(node);
    if (n.baseCost == null) n.baseCost = n.cost;

    n.cost = Math.round(n.baseCost * costMultiplier * 100) / 100;
    const effectiveDelay = Math.max(0.0, Math.round(((n.delayDays || 0.0) + accumulatedDelay) * 10) / 10);
    n.delayDays = effectiveDelay;

    if (n.type === "factory" || n.financingInstrument === "po_financing") {
      n.financingInstrument = "po_financing";
      n.tier = 1;
      const baseRel = n.supplierReliabilityScore || 0.94;
      const delayPenalty = (effectiveDelay / 25.0) * 0.45;
      const reliability = Math.max(0.35, Math.min(1.0, Math.round((baseRel - delayPenalty) * 1000) / 1000));
      n.supplierReliabilityScore = reliability;

      const baseCredit = n.cost * 0.85;
      n.loanAmount = Math.round(baseCredit * reliability * 100) / 100;
      n.ltvRatio = Math.round(0.85 * reliability * 1000) / 1000;
      n.riskScore = Math.round((1.0 - reliability) * 1000) / 1000;
      n.interestRate = Math.round((6.50 + (1.0 - reliability) * 6.50) * 100) / 100;
    } else if (n.type === "transit" || n.financingInstrument === "asset_backed_lending") {
      n.financingInstrument = "asset_backed_lending";
      n.tier = 2;
      const delayRisk = (effectiveDelay / 18.0) * 0.55;
      const volRisk = (routeVolatility / 100.0) * 0.45;
      const risk = Math.min(1.0, Math.max(0.08, Math.round((0.10 + delayRisk + volRisk) * 1000) / 1000));
      n.riskScore = risk;

      const ltv = Math.max(0.28, Math.round(0.82 * (1.0 - risk * 0.58) * 1000) / 1000);
      n.ltvRatio = ltv;
      n.loanAmount = Math.round(n.cost * ltv * 100) / 100;
      n.interestRate = Math.round((7.00 + risk * 7.50) * 100) / 100;
    } else if (n.type === "warehouse" || n.financingInstrument === "inventory_financing") {
      n.financingInstrument = "inventory_financing";
      n.tier = 3;
      const totalDwell = (n.storageDurationDays || 0.0) + storageDwellDays;
      n.storageDurationDays = Math.round(totalDwell * 10) / 10;

      const dwellRisk = (totalDwell / 40.0) * 0.60;
      const delayRisk = (effectiveDelay / 22.0) * 0.30;
      const risk = Math.min(1.0, Math.max(0.06, Math.round((0.12 + dwellRisk + delayRisk) * 1000) / 1000));
      n.riskScore = risk;

      const ltv = Math.max(0.20, Math.round((0.78 - (totalDwell / 48.0) * 0.42) * 1000) / 1000);
      n.ltvRatio = ltv;
      n.loanAmount = Math.round(n.cost * ltv * 100) / 100;
      n.interestRate = Math.round((7.20 + (totalDwell / 25.0) * 3.80 + risk * 3.20) * 100) / 100;
    } else if (n.type === "delivery" || n.financingInstrument === "invoice_factoring") {
      n.financingInstrument = "invoice_factoring";
      n.tier = 4;
      const delayPenalty = (effectiveDelay / 25.0) * 2.50;
      const discountPct = Math.min(9.0, Math.max(1.5, Math.round((1.80 + delayPenalty) * 100) / 100));
      const advanceRate = Math.max(0.50, Math.round((100.0 - discountPct) / 100.0 * 1000) / 1000);

      n.ltvRatio = advanceRate;
      n.loanAmount = Math.round(n.cost * advanceRate * 100) / 100;
      n.riskScore = Math.min(1.0, Math.max(0.05, Math.round((discountPct / 10.0) * 1000) / 1000));
      n.interestRate = discountPct;
    }

    return n;
  }

  // Dashboard Aggregator
  function computeNetworkDashboard(nodes) {
    let totalExposure = 0.0;
    let totalCost = 0.0;
    let settledCapital = 0.0;
    let weightedRateSum = 0.0;
    let riskSum = 0.0;
    let bottleneckCount = 0;
    let unfinancedCount = 0;
    let financedCount = 0;
    let settledCount = 0;
    const activeInstruments = new Set();
    let totalLeadTimeDays = 0.0;

    nodes.forEach((n) => {
      totalCost += n.cost;
      totalLeadTimeDays += (n.baseLeadTimeDays || 5.0) + (n.delayDays || 0.0);
      riskSum += n.riskScore;

      if (n.isBottleneck) bottleneckCount++;

      if (n.assetState === "financed") {
        financedCount++;
        totalExposure += n.loanAmount;
        weightedRateSum += (n.interestRate * n.loanAmount);
        activeInstruments.add(n.financingInstrument);
      } else if (n.assetState === "settled") {
        settledCount++;
        settledCapital += n.loanAmount;
      } else {
        unfinancedCount++;
        activeInstruments.add(n.financingInstrument);
      }
    });

    const numNodes = Math.max(1, nodes.length);
    const avgRiskScore = Math.round((riskSum / numNodes) * 1000) / 1000;

    let wacc = 7.40;
    if (totalExposure > 0) {
      wacc = Math.round((weightedRateSum / totalExposure) * 100) / 100;
    } else {
      wacc = Math.round((nodes.reduce((acc, n) => acc + n.interestRate, 0) / numNodes) * 100) / 100;
    }

    const cccDays = Math.round(totalLeadTimeDays * 0.85 * 10) / 10;
    const maxDelay = Math.max(...nodes.map((n) => n.delayDays || 0), 0);
    const liquidityRunway = Math.max(5.0, Math.round((45.0 - maxDelay * 0.9) * 10) / 10);

    return {
      totalExposure: Math.round(totalExposure * 100) / 100,
      avgRiskScore: avgRiskScore,
      activeInstruments: Array.from(activeInstruments).sort(),
      cashConversionCycleDays: cccDays,
      wacc: wacc,
      liquidityRunwayDays: liquidityRunway,
      settledCapital: Math.round(settledCapital * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      bottleneckCount: bottleneckCount,
      unfinancedCount: unfinancedCount,
      financedCount: financedCount,
      settledCount: settledCount
    };
  }

  // Anti-Double-Financing Ledger Engine
  function checkCanFinance(node, batchId) {
    const bid = batchId || node.batchId || "BATCH-NX-2026-A1";

    if (NODE_BATCH_INDEX[`${bid}:${node.id}`]) {
      const entryId = NODE_BATCH_INDEX[`${bid}:${node.id}`];
      const entry = LEDGER_ENTRIES[entryId];
      if (entry && entry.state === "financed") {
        return {
          blocked: true,
          reason: `Over-Leveraging / Duplicate Financing Alert: Node '${node.name}' is already actively financed under ${entry.financingInstrument.toUpperCase()} (Tier ${entry.tier}) for $${entry.loanAmount.toLocaleString()}. Duplicate facility issuance rejected.`,
          collateralHash: entry.collateralHash,
          activeEntry: entry
        };
      }
    }

    if (ACTIVE_COLLATERAL_LOCKS[bid]) {
      const activeEntryId = ACTIVE_COLLATERAL_LOCKS[bid];
      const activeEntry = LEDGER_ENTRIES[activeEntryId];
      if (activeEntry && activeEntry.state === "financed" && activeEntry.nodeId !== node.id) {
        return {
          blocked: true,
          reason: `Over-Leveraging / Duplicate Financing Alert: Batch '${bid}' holds an active, unsettled lien at node '${activeEntry.nodeName}' under ${activeEntry.financingInstrument.toUpperCase()} (Tier ${activeEntry.tier}, $${activeEntry.loanAmount.toLocaleString()}). Physical asset collateral is locked; prior tier must be settled before issuance.`,
          collateralHash: activeEntry.collateralHash,
          activeEntry: activeEntry
        };
      }
    }

    return {
      blocked: false,
      reason: null,
      collateralHash: null,
      activeEntry: null
    };
  }

  function financeNode(nodeId, batchId) {
    const bid = batchId || "BATCH-NX-2026-A1";
    let targetNode = null;
    let targetTemplate = "apparel";

    for (const [tid, nodes] of Object.entries(ACTIVE_NODES_STATE)) {
      for (const n of nodes) {
        if (n.id === nodeId) {
          targetNode = n;
          targetTemplate = tid;
          break;
        }
      }
      if (targetNode) break;
    }

    if (!targetNode) {
      const nodes = getCurrentNodes("apparel");
      targetNode = nodes.find((n) => n.id === nodeId);
    }

    if (!targetNode) {
      return { success: false, blocked: true, reason: `Node ${nodeId} not found.` };
    }

    const check = checkCanFinance(targetNode, bid);
    if (check.blocked) {
      return {
        success: false,
        blocked: true,
        reason: check.reason,
        collateralHash: check.collateralHash,
        activeEntry: check.activeEntry
      };
    }

    const tierMap = {
      po_financing: 1,
      asset_backed_lending: 2,
      inventory_financing: 3,
      invoice_factoring: 4
    };
    const tier = tierMap[targetNode.financingInstrument] || 1;
    const collateralHash = generateCollateralHash(targetNode.id, bid, targetNode.financingInstrument, tier);
    const entryId = "entry-" + Math.random().toString(36).substr(2, 9);
    const nowStr = new Date().toISOString().replace("T", " ").substr(0, 19) + " UTC";

    const entry = {
      entryId: entryId,
      assetId: targetNode.id,
      batchId: bid,
      nodeId: targetNode.id,
      nodeName: targetNode.name,
      financingInstrument: targetNode.financingInstrument,
      tier: tier,
      state: "financed",
      loanAmount: targetNode.loanAmount,
      ltvRatio: targetNode.ltvRatio,
      interestRate: targetNode.interestRate,
      collateralHash: collateralHash,
      financedAt: nowStr,
      settledAt: null,
      notes: `Tier-${tier} facility issued. Physical state verified.`
    };

    LEDGER_ENTRIES[entryId] = entry;
    if (!BATCH_HISTORY[bid]) BATCH_HISTORY[bid] = [];
    BATCH_HISTORY[bid].push(entryId);
    NODE_BATCH_INDEX[`${bid}:${targetNode.id}`] = entryId;
    ACTIVE_COLLATERAL_LOCKS[bid] = entryId;

    targetNode.assetState = "financed";
    targetNode.collateralHash = collateralHash;

    return {
      success: true,
      blocked: false,
      message: `Financing issued successfully for ${targetNode.name} under ${targetNode.financingInstrument.toUpperCase()}.`,
      entry: entry,
      updatedNode: targetNode
    };
  }

  function settleNode(nodeId, batchId) {
    const bid = batchId || "BATCH-NX-2026-A1";
    let targetNode = null;

    for (const [tid, nodes] of Object.entries(ACTIVE_NODES_STATE)) {
      for (const n of nodes) {
        if (n.id === nodeId) {
          targetNode = n;
          break;
        }
      }
      if (targetNode) break;
    }

    if (!targetNode) {
      const nodes = getCurrentNodes("apparel");
      targetNode = nodes.find((n) => n.id === nodeId);
    }

    if (!targetNode) {
      return { success: false, message: `Node ${nodeId} not found.` };
    }

    const key = `${bid}:${targetNode.id}`;
    if (!NODE_BATCH_INDEX[key]) {
      return { success: false, message: `No active financing entry found for node ${targetNode.name} on batch ${bid}.` };
    }

    const entryId = NODE_BATCH_INDEX[key];
    const entry = LEDGER_ENTRIES[entryId];
    if (!entry) return { success: false, message: "Ledger entry record missing." };

    if (entry.state === "settled") {
      return { success: false, message: `Financing for node ${targetNode.name} is already settled.` };
    }

    entry.state = "settled";
    entry.settledAt = new Date().toISOString().replace("T", " ").substr(0, 19) + " UTC";
    entry.notes = `Settled in full. Collateral lien released for Batch ${bid}.`;

    if (ACTIVE_COLLATERAL_LOCKS[bid] === entryId) {
      delete ACTIVE_COLLATERAL_LOCKS[bid];
    }

    targetNode.assetState = "settled";

    return {
      success: true,
      message: `Successfully settled ${entry.financingInstrument} for ${targetNode.name}. Collateral released.`,
      entry: entry,
      updatedNode: targetNode
    };
  }

  function attemptDoubleFinancingAttack(nodeId, batchId) {
    const bid = batchId || "BATCH-NX-2026-A1";
    let targetNode = null;
    for (const [tid, nodes] of Object.entries(ACTIVE_NODES_STATE)) {
      for (const n of nodes) {
        if (n.id === nodeId) {
          targetNode = n;
          break;
        }
      }
      if (targetNode) break;
    }

    if (!targetNode) {
      const nodes = getCurrentNodes("apparel");
      targetNode = nodes.find((n) => n.id === nodeId) || nodes[0];
    }

    const check = checkCanFinance(targetNode, bid);
    if (!check.blocked) {
      const fakeHash = generateCollateralHash(targetNode.id, bid, "po_financing", 1);
      const fakeEntry = {
        entryId: "attack-block-" + Math.random().toString(36).substr(2, 6),
        assetId: targetNode.id,
        batchId: bid,
        nodeId: targetNode.id,
        nodeName: targetNode.name,
        financingInstrument: "po_financing",
        tier: 1,
        state: "financed",
        loanAmount: 120000.0,
        ltvRatio: 0.85,
        interestRate: 7.20,
        collateralHash: fakeHash,
        financedAt: new Date().toISOString().replace("T", " ").substr(0, 19) + " UTC",
        notes: "Active Tier-1 Lien already exists on primary exchange."
      };
      return {
        success: false,
        blocked: true,
        alertTitle: "OVER-LEVERAGING & DOUBLE-FINANCING ALERT (PS Requirement #7)",
        reason: `Over-Leveraging / Duplicate Financing Alert: Attack Prevented! Batch '${bid}' is already pledged under Active Tier-1 PO Financing at '${targetNode.name}'. Secondary pledge attempt under ${targetNode.financingInstrument.toUpperCase()} was rejected by Anti-Double-Financing consensus.`,
        collateralHash: fakeHash,
        activeEntry: fakeEntry
      };
    }

    return {
      success: false,
      blocked: check.blocked,
      alertTitle: "OVER-LEVERAGING & DOUBLE-FINANCING ALERT (PS Requirement #7)",
      reason: check.reason,
      collateralHash: check.collateralHash,
      activeEntry: check.activeEntry
    };
  }

  // Topological Shock Propagation Engine
  function runTopologicalPropagation(nodes, disruption, nodeId, shockType, magnitude) {
    const startTime = performance.now();
    const targetNodeId = nodeId || (disruption && disruption.target_node_id) || null;
    const shock = shockType || (disruption && disruption.shock_type) || "port_blockade";
    const mag = magnitude != null ? magnitude : (disruption && disruption.magnitude != null ? disruption.magnitude : 10.0);

    let routeVolatility = 0.0;
    let primaryDelay = 0.0;

    if (shock === "port_blockade" || shock === "customs_delay" || shock === "route_volatility") {
      routeVolatility = Number(mag) * 2.0;
      primaryDelay = Number(mag);
    } else if (shock === "fuel_spike") {
      routeVolatility = Number(mag);
      primaryDelay = Number(mag) * 0.3;
    } else if (shock === "material_shortage") {
      primaryDelay = Number(mag) * 0.8;
      routeVolatility = 20.0;
    } else if (shock === "warehouse_dwell_spike") {
      primaryDelay = Number(mag) * 0.5;
      routeVolatility = 10.0;
    } else {
      routeVolatility = Number(mag);
      primaryDelay = Number(mag);
    }

    // Adjacency and topological sort
    const nodeMap = {};
    const inDegree = {};
    const adj = {};

    nodes.forEach((n) => {
      nodeMap[n.id] = n;
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    nodes.forEach((n) => {
      (n.dependsOn || []).forEach((parentId) => {
        if (nodeMap[parentId]) {
          adj[parentId].push(n.id);
          inDegree[n.id]++;
        }
      });
    });

    // Kahn's algorithm
    const queue = [];
    nodes.forEach((n) => {
      if (inDegree[n.id] === 0) queue.push(n.id);
    });

    const topoOrder = [];
    while (queue.length > 0) {
      const u = queue.shift();
      topoOrder.push(u);
      adj[u].forEach((v) => {
        inDegree[v]--;
        if (inDegree[v] === 0) queue.push(v);
      });
    }

    // If cycle or unvisited, append remaining
    nodes.forEach((n) => {
      if (!topoOrder.includes(n.id)) topoOrder.push(n.id);
    });

    // State deltas
    const nodeDeltas = {};
    nodes.forEach((n) => {
      nodeDeltas[n.id] = {
        accumulated_delay: 0.0,
        cost_mult: 1.0,
        local_delay: 0.0,
        dwell_days: 0.0
      };
    });

    // Apply primary shock
    let chosenTargetId = targetNodeId;
    if (!chosenTargetId && primaryDelay > 0) {
      if (shock === "port_blockade" || shock === "route_volatility") {
        const tr = nodes.find((n) => n.type === "transit");
        chosenTargetId = tr ? tr.id : nodes[0].id;
      } else if (shock === "warehouse_dwell_spike") {
        const wh = nodes.find((n) => n.type === "warehouse");
        chosenTargetId = wh ? wh.id : nodes[0].id;
      } else if (shock === "material_shortage") {
        const fac = nodes.find((n) => n.type === "factory");
        chosenTargetId = fac ? fac.id : nodes[0].id;
      } else {
        chosenTargetId = nodes[0].id;
      }
    }

    if (chosenTargetId && nodeDeltas[chosenTargetId]) {
      nodeDeltas[chosenTargetId].local_delay += primaryDelay;
      if (shock === "warehouse_dwell_spike") {
        nodeDeltas[chosenTargetId].dwell_days += Number(mag) * 1.5;
      } else if (shock === "port_blockade") {
        nodeDeltas[chosenTargetId].cost_mult *= (1.0 + (Number(mag) / 100.0) * 0.40);
      }
    }

    if (shock === "fuel_spike" && Number(mag) > 0) {
      const ff = Number(mag) / 100.0;
      nodes.forEach((n) => {
        if (n.type === "transit" || n.type === "warehouse") {
          nodeDeltas[n.id].cost_mult *= (1.0 + ff * 0.50);
          nodeDeltas[n.id].local_delay += (ff * 4.0);
        }
      });
    }

    // Topological Propagation
    topoOrder.forEach((nid) => {
      const n = nodeMap[nid];
      const parents = n.dependsOn || [];
      const validParents = parents.filter((p) => nodeDeltas[p]);

      if (validParents.length > 0) {
        const maxParentDelay = Math.max(...validParents.map((p) => nodeDeltas[p].accumulated_delay));
        const avgParentCostMult = validParents.reduce((acc, p) => acc + nodeDeltas[p].cost_mult, 0) / validParents.length;
        const downstreamAbsorption = 1.0 + (avgParentCostMult - 1.0) * 0.35;

        nodeDeltas[nid].accumulated_delay = maxParentDelay + nodeDeltas[nid].local_delay;
        nodeDeltas[nid].cost_mult *= downstreamAbsorption;
      } else {
        nodeDeltas[nid].accumulated_delay = nodeDeltas[nid].local_delay;
      }
    });

    // Compute updated node results
    const updatedNodes = [];
    const affectedNodeIds = [];
    const oldAvgInterest = nodes.reduce((acc, n) => acc + n.interestRate, 0) / nodes.length;

    nodes.forEach((n) => {
      const deltas = nodeDeltas[n.id];
      const totalDelay = Math.round(deltas.accumulated_delay * 10) / 10;

      let updatedN = deepClone(n);
      updatedN.delayDays = totalDelay;

      updatedN = computeNodeFinancialMetrics(
        updatedN,
        0.0,
        deltas.cost_mult,
        updatedN.type === "transit" ? routeVolatility : 0.0,
        deltas.dwell_days
      );

      let isBottleneck = false;
      const reasons = [];
      if (totalDelay >= 4.0) {
        isBottleneck = true;
        reasons.push(`+${totalDelay}d cascading delay`);
      }
      if (deltas.cost_mult >= 1.15) {
        const costPct = Math.round((deltas.cost_mult - 1.0) * 100 * 10) / 10;
        isBottleneck = true;
        reasons.push(`+${costPct}% cost surge`);
      }
      if (updatedN.riskScore >= 0.45) {
        isBottleneck = true;
        reasons.push(`Elevated risk ${Math.round(updatedN.riskScore * 100)}%`);
      }

      updatedN.isBottleneck = isBottleneck;
      updatedN.bottleneckReason = reasons.length > 0 ? reasons.join(", ") : null;

      if (totalDelay > 0 || deltas.cost_mult > 1.01 || isBottleneck) {
        affectedNodeIds.push(updatedN.id);
      }

      updatedNodes.push(updatedN);
    });

    const dashboard = computeNetworkDashboard(updatedNodes);

    // Refinancing Event Evaluation
    const maxCascadingDelay = Math.max(...updatedNodes.map((n) => n.delayDays || 0), 0);
    const avgNewInterest = updatedNodes.reduce((acc, n) => acc + n.interestRate, 0) / updatedNodes.length;
    const deltaBps = Math.round((avgNewInterest - oldAvgInterest) * 100);

    let refinancingEvent = null;
    const targetNodeName = chosenTargetId && nodeMap[chosenTargetId] ? nodeMap[chosenTargetId].name : "Supply Chain";

    if (maxCascadingDelay >= 3.0 || Number(mag) >= 5.0 || affectedNodeIds.length > 0) {
      const liquidityBreach = dashboard.liquidityRunwayDays < 20.0;
      const severity = (liquidityBreach || maxCascadingDelay >= 12.0) ? "CRITICAL" : "WARNING";

      const reasonParts = [];
      if (shock === "port_blockade") {
        reasonParts.push(`Maritime disruption on '${targetNodeName}' created a +${maxCascadingDelay}d bottleneck`);
      } else if (shock === "customs_delay") {
        reasonParts.push(`Border clearance delay on '${targetNodeName}' pushed lead times out by +${maxCascadingDelay}d`);
      } else if (shock === "fuel_spike") {
        reasonParts.push(`Fuel volatility surged operating logistics costs across transit nodes`);
      } else if (shock === "material_shortage") {
        reasonParts.push(`Component shortage at '${targetNodeName}' triggered Tier-1 PO financing repricing`);
      } else if (shock === "warehouse_dwell_spike") {
        reasonParts.push(`Stagnant warehouse dwell duration increased degradation risk, depressing inventory LTV leverage`);
      } else {
        reasonParts.push(`Physical shock of magnitude ${mag} propagated across ${affectedNodeIds.length} downstream nodes`);
      }

      reasonParts.push(`Dynamic interest rates increased by +${Math.max(0, deltaBps)} bps to ${avgNewInterest.toFixed(2)}%`);
      reasonParts.push(`LTV facilities contracted across affected tiers to safeguard lender capital.`);

      if (liquidityBreach) {
        reasonParts.push(`CRITICAL: Liquidity runway compressed to ${dashboard.liquidityRunwayDays} days (below 20-day threshold).`);
      }

      const fullReason = reasonParts.join(" — ");

      refinancingEvent = {
        triggered: true,
        reason: `Refinancing triggered — ${fullReason}`,
        newInterestRate: Math.round(avgNewInterest * 100) / 100,
        oldInterestRate: Math.round(oldAvgInterest * 100) / 100,
        affectedNodeIds: affectedNodeIds,
        severity: severity,
        liquidityRunwayBreach: liquidityBreach,
        liquidityBreachDays: dashboard.liquidityRunwayDays
      };
    }

    const execTimeMs = Math.round((performance.now() - startTime) * 1000) / 1000;

    return {
      scenario_id: "scen-" + Math.random().toString(36).substr(2, 9),
      template_id: "apparel",
      execution_time_ms: execTimeMs,
      updatedNodes: updatedNodes,
      refinancingEvent: refinancingEvent,
      dashboard: dashboard,
      explanation: refinancingEvent ? refinancingEvent.reason : "Network operating within optimal risk parameters."
    };
  }

  // Public Mock Engine API Interface
  window.MockEngine = {
    getTemplates: async function () {
      return Object.values(TEMPLATES).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        node_count: t.nodes.length
      }));
    },

    getNodes: async function (templateId = "apparel") {
      const tid = (templateId || "apparel").toLowerCase();
      const nodes = getCurrentNodes(tid);
      const dashboard = computeNetworkDashboard(nodes);
      return {
        template_id: tid,
        nodes: deepClone(nodes),
        dashboard: dashboard
      };
    },

    simulate: async function (req) {
      const tid = (req.template_id || "apparel").toLowerCase();
      const nodes = req.custom_nodes && req.custom_nodes.length > 0 ? req.custom_nodes : getCurrentNodes(tid);

      let ledgerCheck = { blocked: false, reason: null };
      if (req.nodeId) {
        const targetNode = nodes.find((n) => n.id === req.nodeId);
        if (targetNode) {
          ledgerCheck = checkCanFinance(targetNode, targetNode.batchId);
        }
      }

      const simResult = runTopologicalPropagation(
        nodes,
        req.disruption,
        req.nodeId,
        req.shockType,
        req.magnitude
      );

      ACTIVE_NODES_STATE[tid] = simResult.updatedNodes;

      return {
        scenario_id: simResult.scenario_id,
        template_id: tid,
        execution_time_ms: simResult.execution_time_ms,
        updatedNodes: simResult.updatedNodes,
        ledgerCheck: ledgerCheck,
        refinancingEvent: simResult.refinancingEvent,
        dashboard: simResult.dashboard,
        explanation: simResult.explanation
      };
    },

    financeNode: async function (nodeId, batchId) {
      return financeNode(nodeId, batchId);
    },

    settleNode: async function (nodeId, batchId) {
      return settleNode(nodeId, batchId);
    },

    attemptDoubleFinance: async function (nodeId, batchId) {
      return attemptDoubleFinancingAttack(nodeId, batchId);
    },

    getLedgerState: async function () {
      return {
        entries: Object.values(LEDGER_ENTRIES),
        activeLocks: deepClone(ACTIVE_COLLATERAL_LOCKS),
        totalEntries: Object.keys(LEDGER_ENTRIES).length
      };
    },

    reset: async function () {
      ACTIVE_NODES_STATE = {};
      LEDGER_ENTRIES = {};
      BATCH_HISTORY = {};
      NODE_BATCH_INDEX = {};
      ACTIVE_COLLATERAL_LOCKS = {};
      return {
        status: "success",
        message: "Anti-Double-Financing Ledger and Network Graph reset to baseline state."
      };
    },

    voiceAlert: async function (text) {
      return {
        success: true,
        has_audio: false,
        text: text,
        voice_name: "Risk Underwriter (Web Speech)",
        message: "Client Web Speech API ready."
      };
    }
  };
})();
