/**
 * NODE-X-LOGISTICS — LOGISTICS PATHWAY OPTIMIZER & SHIPPING METHOD ANALYZER
 * Live Triangulation Engine (Quality vs. Time vs. Cost). Zero Emojis.
 */

(function () {
  const SHIPPING_PATHWAYS = {
    ocean: {
      id: "ocean",
      name: "Maritime Ocean Corridor (Trans-Oceanic)",
      mode: "Ocean Bulk Container Vessel",
      code: "CORRIDOR // MARITIME-01",
      badge: "LOWEST DIRECT FREIGHT",
      badgeClass: "badge-cost",
      transitDays: 28.0,
      freightCost: 22500.0,
      customsClearanceDays: 4.0,
      qualityScore: 92.0,
      costScore: 94.0,
      timeScore: 42.0,
      baseRate: 7.45,
      targetLtv: 0.80,
      instrument: "asset_backed_lending",
      description: "Standard container vessel transit. Minimizes immediate carrier freight billing, but encumbers balance sheet working capital for 28-35 days."
    },
    air: {
      id: "air",
      name: "Expedited Dedicated Air Cargo Corridor",
      mode: "Dedicated Air Cargo Charter (777F)",
      code: "CORRIDOR // AIR-EXPEDITED-02",
      badge: "MAXIMUM VELOCITY",
      badgeClass: "badge-speed",
      transitDays: 4.0,
      freightCost: 64000.0,
      customsClearanceDays: 1.0,
      qualityScore: 99.5,
      costScore: 48.0,
      timeScore: 98.0,
      baseRate: 6.95,
      targetLtv: 0.85,
      instrument: "po_financing",
      description: "High-speed air freight corridor. Compresses lead time to 4.0 days, preserving asset integrity and accelerating conversion to accounts receivable."
    },
    rail: {
      id: "rail",
      name: "Trans-Eurasian Rail Intermodal Corridor",
      mode: "Electrified Rail Intermodal",
      code: "CORRIDOR // RAIL-INTERMODAL-03",
      badge: "PARETO-OPTIMAL EQUILIBRIUM",
      badgeClass: "badge-optimum",
      transitDays: 14.0,
      freightCost: 34500.0,
      customsClearanceDays: 2.0,
      qualityScore: 96.5,
      costScore: 82.0,
      timeScore: 78.0,
      baseRate: 7.20,
      targetLtv: 0.82,
      instrument: "asset_backed_lending",
      description: "High-capacity electrified intermodal rail. Optimal mathematical balance between freight budget, transit duration, and dynamic carrying costs."
    },
    feeder: {
      id: "feeder",
      name: "Short-Sea Feeder & Heavy Highway Fleet",
      mode: "Feeder Vessel & Trucking",
      code: "CORRIDOR // FEEDER-REGIONAL-04",
      badge: "REGIONAL ADAPTIVE",
      badgeClass: "badge-balanced",
      transitDays: 18.0,
      freightCost: 29000.0,
      customsClearanceDays: 3.0,
      qualityScore: 94.0,
      costScore: 86.0,
      timeScore: 68.0,
      baseRate: 7.35,
      targetLtv: 0.80,
      instrument: "inventory_financing",
      description: "Decentralized regional transit network bypassing major maritime choke points and primary terminal bottlenecks."
    }
  };

  let activePathwayId = "rail";
  let currentOrderValue = 350000.0;
  let customDays = 14.0;
  let customFreight = 34500.0;
  let customQuality = 96.5;

  function initPathwayOptimizer() {
    renderPathwayCards();
    updatePathwayAnalysis(activePathwayId);
  }

  function computePathwayMetrics(pathway, orderValue) {
    const val = orderValue || currentOrderValue;
    const transitDays = pathway.transitDays;
    const directFreight = pathway.freightCost;
    
    // Capital Carrying Cost = Embodied Value * (Dynamic Rate / 100) * (Transit Days / 365)
    const annualRate = pathway.baseRate / 100.0;
    const carryingCost = Math.round(val * annualRate * (transitDays / 365.0));
    const totalLandedCost = directFreight + carryingCost;
    const cccContribution = transitDays + pathway.customsClearanceDays;
    const riskFactor = Math.max(0.70, 1.0 - (transitDays * 0.005));
    const maxFinancing = Math.round(val * pathway.targetLtv * riskFactor);

    // Dynamic Time & Cost Scores for Triangulation
    const timeScore = Math.max(20, Math.min(100, Math.round(100 - (transitDays * 2.2))));
    const costScore = Math.max(20, Math.min(100, Math.round(100 - (totalLandedCost / 1000))));

    return {
      directFreight,
      carryingCost,
      totalLandedCost,
      cccContribution,
      maxFinancing,
      qualityScore: pathway.qualityScore,
      dynamicRate: pathway.baseRate,
      timeScore,
      costScore
    };
  }

  function renderPathwayCards() {
    const container = document.getElementById("pathwayCardsGrid");
    if (!container) return;

    container.innerHTML = Object.values(SHIPPING_PATHWAYS).map((p) => {
      const metrics = computePathwayMetrics(p, currentOrderValue);
      const isActive = p.id === activePathwayId;

      return `
        <div class="pathway-card ${isActive ? 'active' : ''}" id="pathwayCard_${p.id}" onclick="window.PathwayOptimizer.selectPathway('${p.id}')">
          <div>
            <div class="pathway-card-header">
              <span class="caption-uppercase" style="color: var(--muted); font-size: 9.5px;">${p.code}</span>
              <span class="pathway-tag-badge ${p.badgeClass}">${p.badge}</span>
            </div>
            <h4 class="pathway-title">${p.name}</h4>
            <p class="body-sm" style="font-size: 11.5px; color: var(--body); margin-top: 4px; min-height: 36px;">
              ${p.description}
            </p>
          </div>

          <div>
            <div class="pathway-specs-list">
              <div class="pathway-spec-item">
                <span class="pathway-spec-label">TRANSIT DURATION:</span>
                <span class="pathway-spec-val" style="color: #38bdf8;">${p.transitDays} DAYS</span>
              </div>
              <div class="pathway-spec-item">
                <span class="pathway-spec-label">DIRECT FREIGHT:</span>
                <span class="pathway-spec-val">$${metrics.directFreight.toLocaleString()}</span>
              </div>
              <div class="pathway-spec-item">
                <span class="pathway-spec-label">CARRYING COST:</span>
                <span class="pathway-spec-val" style="color: var(--warning);">$${metrics.carryingCost.toLocaleString()}</span>
              </div>
              <div class="pathway-spec-item">
                <span class="pathway-spec-label">QUALITY PRESERVATION:</span>
                <span class="pathway-spec-val" style="color: #10b981;">${p.qualityScore}%</span>
              </div>
            </div>

            <div class="pathway-cost-total-box">
              <div>
                <span class="pathway-total-label">TOTAL WORKING CAPITAL</span>
                <div style="font-size: 9px; color: var(--muted);">(DIRECT FREIGHT + CARRYING COST)</div>
              </div>
              <span class="pathway-total-val">$${metrics.totalLandedCost.toLocaleString()}</span>
            </div>

            <button class="pathway-select-btn">
              ${isActive ? '[ ACTIVE IN TRIANGULATION ]' : 'SELECT CORRIDOR'}
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  function selectPathway(pathwayId) {
    activePathwayId = pathwayId;
    const pathway = SHIPPING_PATHWAYS[pathwayId];
    if (!pathway) return;

    Object.keys(SHIPPING_PATHWAYS).forEach((id) => {
      const el = document.getElementById(`pathwayCard_${id}`);
      if (el) {
        if (id === pathwayId) el.classList.add("active");
        else el.classList.remove("active");
        const btn = el.querySelector(".pathway-select-btn");
        if (btn) btn.textContent = id === pathwayId ? "[ ACTIVE IN TRIANGULATION ]" : "SELECT CORRIDOR";
      }
    });

    customDays = pathway.transitDays;
    customFreight = pathway.freightCost;
    customQuality = pathway.qualityScore;

    const daysSlider = document.getElementById("pathwayDaysSlider");
    const freightSlider = document.getElementById("pathwayFreightSlider");
    const daysVal = document.getElementById("pathwayDaysVal");
    const freightVal = document.getElementById("pathwayFreightVal");

    if (daysSlider) daysSlider.value = customDays;
    if (freightSlider) freightSlider.value = customFreight;
    if (daysVal) daysVal.textContent = `${customDays} DAYS`;
    if (freightVal) freightVal.textContent = `$${customFreight.toLocaleString()}`;

    updatePathwayAnalysis(pathwayId);
    applySelectedPathwayToTriangulationGraph(false);
  }

  function onCustomSliderChange() {
    const daysSlider = document.getElementById("pathwayDaysSlider");
    const freightSlider = document.getElementById("pathwayFreightSlider");
    const daysVal = document.getElementById("pathwayDaysVal");
    const freightVal = document.getElementById("pathwayFreightVal");

    if (daysSlider) customDays = parseFloat(daysSlider.value);
    if (freightSlider) customFreight = parseFloat(freightSlider.value);

    if (daysVal) daysVal.textContent = `${customDays} DAYS`;
    if (freightVal) freightVal.textContent = `$${customFreight.toLocaleString()}`;

    updatePathwayAnalysis(activePathwayId);
    applySelectedPathwayToTriangulationGraph(false);
  }

  function updatePathwayAnalysis(pathwayId) {
    const pathway = SHIPPING_PATHWAYS[pathwayId];
    if (!pathway) return;

    const metrics = computePathwayMetrics({
      ...pathway,
      transitDays: customDays,
      freightCost: customFreight,
      qualityScore: customQuality
    }, currentOrderValue);

    const verdictTitle = document.getElementById("verdictTitle");
    const verdictExpl = document.getElementById("verdictExplanation");
    const verdictFreight = document.getElementById("vFreightVal");
    const verdictCarrying = document.getElementById("vCarryingVal");
    const verdictTotal = document.getElementById("vTotalVal");
    const verdictCcc = document.getElementById("vCccVal");
    const verdictRate = document.getElementById("vRateVal");
    const verdictLtv = document.getElementById("vLtvVal");

    if (verdictFreight) verdictFreight.textContent = `$${metrics.directFreight.toLocaleString()}`;
    if (verdictCarrying) verdictCarrying.textContent = `$${metrics.carryingCost.toLocaleString()}`;
    if (verdictTotal) verdictTotal.textContent = `$${metrics.totalLandedCost.toLocaleString()}`;
    if (verdictCcc) verdictCcc.textContent = `+${metrics.cccContribution} DAYS`;
    if (verdictRate) verdictRate.textContent = `${metrics.dynamicRate.toFixed(2)}%`;
    if (verdictLtv) verdictLtv.textContent = `$${metrics.maxFinancing.toLocaleString()}`;

    if (verdictTitle) {
      if (pathwayId === "rail") {
        verdictTitle.innerHTML = `<span style="color: #10b981;">PARETO-OPTIMAL:</span> ${pathway.name.toUpperCase()}`;
      } else if (pathwayId === "air") {
        verdictTitle.innerHTML = `<span style="color: #38bdf8;">VELOCITY MAXIMIZER:</span> ${pathway.name.toUpperCase()}`;
      } else if (pathwayId === "ocean") {
        verdictTitle.innerHTML = `<span style="color: #f59e0b;">COST-OPTIMIZED:</span> ${pathway.name.toUpperCase()}`;
      } else {
        verdictTitle.innerHTML = `<span style="color: #ffffff;">REGIONAL CORRIDOR:</span> ${pathway.name.toUpperCase()}`;
      }
    }

    if (verdictExpl) {
      if (pathwayId === "rail") {
        verdictExpl.textContent = `PARETO-OPTIMAL EQUILIBRIUM: Rail Intermodal (14d) saves $29,500 in direct freight compared to Air Cargo, while reducing working-capital transit drag by 14 days compared to Ocean freight. Triangulation balance: Quality 96.5%, Velocity 78.0%, Cost Efficiency 82.0%.`;
      } else if (pathwayId === "air") {
        verdictExpl.textContent = `VELOCITY-CRITICAL: Expedited Air Cargo compresses transit duration to 4.0 days, reducing working-capital carrying cost to $${metrics.carryingCost.toLocaleString()}. Triangulation profile: Quality 99.5%, Velocity 98.0%, Cost Efficiency 48.0%.`;
      } else if (pathwayId === "ocean") {
        verdictExpl.textContent = `DIRECT FREIGHT LEADER: Maritime Ocean delivers the lowest freight bill ($${metrics.directFreight.toLocaleString()}), but locks working capital for 28.0 days. Triangulation profile: Quality 92.0%, Velocity 42.0%, Cost Efficiency 94.0%.`;
      } else {
        verdictExpl.textContent = `REGIONAL ROUTING: Feeder vessel + highway trucking circumvents primary choke points. Triangulation profile: Quality 94.0%, Velocity 68.0%, Cost Efficiency 86.0%.`;
      }
    }
  }

  function applySelectedPathwayToTriangulationGraph(playVoice) {
    const pathway = SHIPPING_PATHWAYS[activePathwayId];
    if (!pathway) return;

    const metrics = computePathwayMetrics({
      ...pathway,
      transitDays: customDays,
      freightCost: customFreight,
      qualityScore: customQuality
    }, currentOrderValue);

    // Update active node transit values in graph
    if (window.activeNodes && window.activeNodes.length > 0) {
      const transitNodes = window.activeNodes.filter((n) => n.type === "transit" || n.type === "TRANSIT");
      if (transitNodes.length > 0) {
        const target = transitNodes[0];
        target.name = `${pathway.mode}`;
        target.cost = customFreight;
        target.baseLeadTimeDays = customDays;
        target.delayDays = 0;
        target.isBottleneck = false;
        target.interestRate = pathway.baseRate;
        target.supplierReliabilityScore = customQuality / 100.0;
        target.loanAmount = Math.round(customFreight * pathway.targetLtv);
      }
    }

    // Update Triangulation Graph Radar & Node chain
    if (window.graphInstance && typeof window.graphInstance.updateTriangulation === "function") {
      window.graphInstance.updateTriangulation({
        qualityScore: customQuality,
        timeScore: metrics.timeScore,
        costScore: metrics.costScore,
        transitDays: customDays,
        freightCost: customFreight,
        carryingCost: metrics.carryingCost,
        totalCost: metrics.totalLandedCost,
        activePathway: pathway.name
      });
    }

    if (playVoice && typeof window.triggerVoiceAlert === "function") {
      window.triggerVoiceAlert(`Triangulation Graph updated to ${pathway.name}. Quality index is ${customQuality} percent, transit lead time ${customDays} days, total working capital cost $${metrics.totalLandedCost.toLocaleString()}.`);
    }
  }

  window.PathwayOptimizer = {
    init: initPathwayOptimizer,
    selectPathway: selectPathway,
    onCustomSliderChange: onCustomSliderChange,
    applyPathway: () => applySelectedPathwayToTriangulationGraph(true)
  };

  document.addEventListener("DOMContentLoaded", () => {
    initPathwayOptimizer();
  });
})();
