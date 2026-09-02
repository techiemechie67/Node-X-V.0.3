/**
 * NODE-X-LOGISTICS — QUANTITATIVE AI ROUTE & WORKING CAPITAL ADVISOR
 * Advanced Multi-Dimensional NLP Engine & Dynamic Pareto Frontier Underwriter.
 * Zero emojis. Institutional mathematical precision.
 */

(function () {
  // Comprehensive Knowledge Matrix for Multi-Dimensional Matching
  const CARGO_PROFILES = {
    electronics: {
      name: "High-Value Micro-Electronics & Semiconductors",
      embodiedValue: 850000,
      qualitySensitivity: 0.98,
      leadTimeSensitivity: 0.95,
      preferredMode: "Expedited Bonded Air Freight & Armored Direct Dispatch",
      transitDays: 4.0,
      baseFreight: 62000,
      rate: 6.90,
      instrument: "Tier-1 Micro-Electronic In-Transit ABL (LTV 85%)",
      rationale: "High capital embodiment ($850k) creates severe carrying cost drag (~$640/day). Rapid 4-day transit minimizes working-capital lockup and mitigates component price obsolescence."
    },
    pharma: {
      name: "Cold-Chain Pharmaceuticals & Biologics",
      embodiedValue: 620000,
      qualitySensitivity: 0.999,
      leadTimeSensitivity: 0.90,
      preferredMode: "Active IoT Temperature-Controlled Air Cargo",
      transitDays: 3.0,
      baseFreight: 72000,
      rate: 6.85,
      instrument: "Cold-Chain Guaranteed Trade Facility (LTV 85%)",
      rationale: "Perishable biologics risk total spoilage under delays. 3-day IoT monitored express maintains 99.9% quality preservation, preventing multi-million dollar batch write-offs."
    },
    apparel: {
      name: "Fast-Fashion Apparel & Seasonal Textiles",
      embodiedValue: 240000,
      qualitySensitivity: 0.88,
      leadTimeSensitivity: 0.75,
      preferredMode: "Trans-Eurasian Rail Intermodal Corridor",
      transitDays: 14.0,
      baseFreight: 34500,
      rate: 7.20,
      instrument: "Multi-Modal Purchase Order Financing (LTV 82%)",
      rationale: "Balanced between freight expense and shelf-life season deadlines. Cuts 14 days vs maritime ocean while saving $28k vs air cargo."
    },
    automotive: {
      name: "Automotive Components & EV Battery Packs",
      embodiedValue: 480000,
      qualitySensitivity: 0.94,
      leadTimeSensitivity: 0.82,
      preferredMode: "Scheduled Ro-Ro Vessel + Dedicated Rail Land-Bridge",
      transitDays: 12.0,
      baseFreight: 38000,
      rate: 7.05,
      instrument: "Automotive Just-In-Time Floor Plan Line (LTV 80%)",
      rationale: "Heavy battery packs require specialized hazmat handling. Intermodal rail land-bridge prevents assembly plant line-stoppages with manageable carrying costs."
    },
    machinery: {
      name: "Heavy Industrial Equipment & Capital Goods",
      embodiedValue: 520000,
      qualitySensitivity: 0.92,
      leadTimeSensitivity: 0.50,
      preferredMode: "Maritime Ocean Breakbulk (Suez / Panama Optimized)",
      transitDays: 26.0,
      baseFreight: 24000,
      rate: 7.35,
      instrument: "Heavy Capital Equipment Staged Facility (LTV 75%)",
      rationale: "Lower inventory holding cost sensitivity allows economical deep-sea maritime transport, maximizing freight capital efficiency."
    },
    chemicals: {
      name: "Specialty Chemicals & Bonded Industrial Fluids",
      embodiedValue: 310000,
      qualitySensitivity: 0.96,
      leadTimeSensitivity: 0.65,
      preferredMode: "ISO Tank Container Intermodal Rail Feeder",
      transitDays: 15.0,
      baseFreight: 32000,
      rate: 7.15,
      instrument: "Specialty Materials Secured Credit Line",
      rationale: "Standardized ISO tank rail routing avoids congested port customs holds and eliminates demurrage penalties on tank equipment."
    },
    solar: {
      name: "Solar PV Modules & Clean-Tech Hardware",
      embodiedValue: 360000,
      qualitySensitivity: 0.90,
      leadTimeSensitivity: 0.60,
      preferredMode: "Regional Ocean Feeder + Inland Direct Trucking",
      transitDays: 18.0,
      baseFreight: 28500,
      rate: 7.25,
      instrument: "Renewable Infrastructure PO Facility",
      rationale: "Predictable project installation schedules allow multimodal ocean-truck routing with early supplier discounting."
    }
  };

  const CRISIS_MODIFIERS = {
    "red sea": {
      name: "Red Sea / Suez Bab el-Mandeb Conflict",
      routeAdvice: "Reroute via Trans-Eurasian Rail (Middle Corridor) or Cape Air-Sea",
      transitDelta: +2.0,
      freightDelta: +6500,
      qualityImpact: -1.5,
      verdict: "Circumvents the 16-day Cape of Good Hope maritime detour, avoiding $8,200 in war-risk surcharges and reducing CCC by 14 days."
    },
    "suez": {
      name: "Suez Canal Transit Restriction",
      routeAdvice: "Trans-Eurasian Rail Intermodal via Baku-Tbilisi-Kars",
      transitDelta: +1.5,
      freightDelta: +5500,
      qualityImpact: -1.0,
      verdict: "Rail corridor delivers predictable 14-day schedule without anchor congestion queue delays at Port Said."
    },
    "hormuz": {
      name: "Strait of Hormuz Geopolitical Blockade",
      routeAdvice: "Trans-Caspian International Transport Route (TITR)",
      transitDelta: +3.0,
      freightDelta: +7200,
      qualityImpact: -2.0,
      verdict: "Overland northern Caspian rail bypasses Persian Gulf chokepoints and eliminates extreme tanker/container war insurance levies."
    },
    "covid": {
      name: "Pandemic Port Gridlock & Quarantine Dwell",
      routeAdvice: "Chartered Air Freight + Secondary Feeder Ports",
      transitDelta: -18.0,
      freightDelta: +28000,
      qualityImpact: +4.0,
      verdict: "Avoids 35-day container dwell time at primary hub ports, freeing working capital 3 weeks earlier than maritime competitors."
    },
    "lockdown": {
      name: "Regional Manufacturing Lockdown",
      routeAdvice: "Multi-Sourced Supplier Network + Fast Intermodal Dispatch",
      transitDelta: +4.0,
      freightDelta: +9000,
      qualityImpact: -2.5,
      verdict: "Dynamically shifts procurement allocation to alternate Tier-2 suppliers with expedited inland transit."
    },
    "war": {
      name: "Eurasian Airspace Closure & War Corridors",
      routeAdvice: "Southern Caucasus & Central Asian Rail Land-Bridge",
      transitDelta: +2.5,
      freightDelta: +8000,
      qualityImpact: -2.0,
      verdict: "Navigates neutral southern rail corridors, maintaining steady supply flow without war-zone transit risks."
    },
    "airspace": {
      name: "Closed Airspace Rerouting",
      routeAdvice: "Polar Route Air Cargo or High-Speed Rail Intermodal",
      transitDelta: +1.0,
      freightDelta: +11000,
      qualityImpact: +1.0,
      verdict: "Slight flight path lengthening is managed through high-velocity trade factoring."
    },
    "panama": {
      name: "Panama Canal Gatun Lake Drought Slot Rationing",
      routeAdvice: "US West Coast Intermodal Rail Land-Bridge (Discharge at LA/Long Beach)",
      transitDelta: -10.0,
      freightDelta: +9500,
      qualityImpact: +2.0,
      verdict: "Discharging at Pacific ports and using transcontinental double-stack rail bypasses 20-day canal anchor queues and auction premiums."
    },
    "drought": {
      name: "Canal Draft Depth & Slot Curtailment",
      routeAdvice: "Intermodal Transcontinental Land-Bridge",
      transitDelta: -8.0,
      freightDelta: +8500,
      qualityImpact: +1.5,
      verdict: "Rail bridge avoids vessel light-loading penalties and delivers scheduled inland delivery."
    },
    "fuel": {
      name: "Bunker Fuel & Energy Price Shock ($950/ton)",
      routeAdvice: "Eco-Speed Slow Steaming with Dynamic Capital Carrying Buffer",
      transitDelta: +4.0,
      freightDelta: -14000,
      qualityImpact: -1.0,
      verdict: "Slow-steaming cuts bunker consumption by 42%. The carrying cost increase (+$1,800) is far outweighed by $14,000 in fuel savings."
    },
    "strike": {
      name: "Port & Rail Labor Strike",
      routeAdvice: "Inland Bonded Dry Port Rerouting + Direct Truck Fleet",
      transitDelta: +2.0,
      freightDelta: +6000,
      qualityImpact: -1.0,
      verdict: "Diversion to non-union regional feeder terminals bypasses dock lockouts."
    },
    "tariff": {
      name: "Regulatory Tariff Shock & Customs Scrutiny",
      routeAdvice: "Automated Bonded Warehouse Staging with Deferred Customs Facility",
      transitDelta: +1.0,
      freightDelta: +3500,
      qualityImpact: +0.5,
      verdict: "Bonded staging defers customs duty cash-flow impact until final consumer distribution."
    }
  };

  let lastAiResult = null;

  function analyzeQuery(query) {
    const q = query.toLowerCase().trim();

    // 1. Match Cargo Profile
    let matchedCargo = CARGO_PROFILES.apparel; // baseline default
    if (q.includes("semi") || q.includes("chip") || q.includes("electronic") || q.includes("gpu") || q.includes("micro") || q.includes("computer") || q.includes("phone")) {
      matchedCargo = CARGO_PROFILES.electronics;
    } else if (q.includes("pharma") || q.includes("medicine") || q.includes("vaccine") || q.includes("drug") || q.includes("cold") || q.includes("perish") || q.includes("bio")) {
      matchedCargo = CARGO_PROFILES.pharma;
    } else if (q.includes("car") || q.includes("auto") || q.includes("battery") || q.includes("ev") || q.includes("motor") || q.includes("vehicle")) {
      matchedCargo = CARGO_PROFILES.automotive;
    } else if (q.includes("machin") || q.includes("heavy") || q.includes("equipment") || q.includes("metal") || q.includes("steel") || q.includes("engine")) {
      matchedCargo = CARGO_PROFILES.machinery;
    } else if (q.includes("chem") || q.includes("fluid") || q.includes("oil") || q.includes("gas") || q.includes("petro")) {
      matchedCargo = CARGO_PROFILES.chemicals;
    } else if (q.includes("solar") || q.includes("clean") || q.includes("panel") || q.includes("energy") || q.includes("green")) {
      matchedCargo = CARGO_PROFILES.solar;
    } else if (q.includes("cloth") || q.includes("fashion") || q.includes("garment") || q.includes("textile") || q.includes("cotton") || q.includes("apparel")) {
      matchedCargo = CARGO_PROFILES.apparel;
    }

    // 2. Match Crisis / Disruption
    let matchedCrisis = null;
    for (const [kw, cData] of Object.entries(CRISIS_MODIFIERS)) {
      if (q.includes(kw)) {
        matchedCrisis = cData;
        break;
      }
    }

    // 3. Match Strategic Goal Modifiers (fast vs cheap vs safe)
    let isUrgent = q.includes("fast") || q.includes("urgent") || q.includes("emergency") || q.includes("asap") || q.includes("quick") || q.includes("air");
    let isBudget = q.includes("cheap") || q.includes("lowest cost") || q.includes("budget") || q.includes("economical") || q.includes("save money");

    // 4. Compute Dynamic Quantitative Vectors
    let transitDays = matchedCargo.transitDays;
    let freightCost = matchedCargo.baseFreight;
    let qualityScore = matchedCargo.qualitySensitivity * 100;
    let rate = matchedCargo.rate;
    let mode = matchedCargo.preferredMode;
    let routeTitle = matchedCargo.name;
    let customVerdict = matchedCargo.rationale;

    if (matchedCrisis) {
      transitDays = Math.max(2, transitDays + matchedCrisis.transitDelta);
      freightCost = Math.max(12000, freightCost + matchedCrisis.freightDelta);
      qualityScore = Math.max(65, Math.min(99.9, qualityScore + matchedCrisis.qualityImpact));
      mode = matchedCrisis.routeAdvice;
      customVerdict = `[${matchedCrisis.name.toUpperCase()}]: ${matchedCrisis.verdict} ${matchedCargo.rationale}`;
    }

    if (isUrgent) {
      transitDays = Math.max(2.5, Math.min(5.0, transitDays * 0.4));
      freightCost = Math.round(freightCost * 1.6);
      qualityScore = Math.min(99.9, qualityScore + 2.5);
      mode = "Expedited Dedicated Air Charter & Priority Line";
      customVerdict = `Emergency priority velocity protocol activated. Transit compressed to ${transitDays} days. ` + customVerdict;
    } else if (isBudget) {
      transitDays = Math.round(transitDays * 1.35);
      freightCost = Math.round(freightCost * 0.72);
      qualityScore = Math.max(82, qualityScore - 3.5);
      mode = "Economical Slow-Steaming Maritime & Consolidation Rail";
      customVerdict = `Cost minimization protocol activated. Direct freight reduced to $${freightCost.toLocaleString()}. ` + customVerdict;
    }

    // Capital Carrying Cost Formula: Value * (Rate / 100) * (TransitDays / 365)
    const carryingCost = Math.round(matchedCargo.embodiedValue * (rate / 100) * (transitDays / 365));
    const totalWorkingCapital = freightCost + carryingCost;

    // Derived Triangulation Scores (0 to 100)
    const timeScore = Math.max(15, Math.min(99, Math.round(100 - (transitDays / 35) * 65)));
    const costScore = Math.max(20, Math.min(98, Math.round(100 - (totalWorkingCapital / 110000) * 70)));

    return {
      query: query,
      cargoName: matchedCargo.name,
      route: routeTitle,
      mode: mode,
      transitDays: transitDays,
      directFreight: `$${freightCost.toLocaleString()}`,
      carryingCost: `$${carryingCost.toLocaleString()}`,
      totalCost: `$${totalWorkingCapital.toLocaleString()}`,
      numericFreight: freightCost,
      numericCarrying: carryingCost,
      numericTotal: totalWorkingCapital,
      qualityScore: parseFloat(qualityScore.toFixed(1)),
      timeScore: timeScore,
      costScore: costScore,
      rate: `${rate.toFixed(2)}%`,
      instrument: matchedCargo.instrument,
      verdict: customVerdict
    };
  }

  async function askAiRouteAdvisor(customQuery) {
    const inputEl = document.getElementById("aiQueryInput");
    const query = customQuery || (inputEl ? inputEl.value.trim() : "");
    if (!query) {
      if (inputEl) inputEl.focus();
      return;
    }

    if (inputEl && customQuery) {
      inputEl.value = customQuery;
    }

    const outputContainer = document.getElementById("aiResponseArea");
    if (!outputContainer) return;

    outputContainer.innerHTML = `
      <div class="ai-thinking-card">
        <div class="ai-pulse-dot"></div>
        <div>
          <span class="caption-uppercase" style="color: #38bdf8; letter-spacing: 1.5px;">AUTONOMOUS AI UNDERWRITER COMPUTING PARETO-OPTIMAL ROUTE & CAPITAL ALLOCATION...</span>
          <p class="body-sm" style="color: var(--muted); margin-top: 4px;">Evaluating multi-modal transit days, quality preservation index, and DeepSeek autonomous underwriting decision for "${query.slice(0, 45)}".</p>
        </div>
      </div>
    `;

    // 1. Compute Base Quantitative Analysis
    const baseResult = analyzeQuery(query);

    // 2. Build live telemetry payload for Autonomous Underwriter Agent
    const activeNode = (window.currentlyInspectedNode || (window.activeNodes && window.activeNodes[0]) || {
      id: "node-04",
      type: "TRANSIT",
      qualityScore: baseResult.qualityScore,
      cost: baseResult.numericFreight,
      loanAmount: baseResult.numericTotal,
      interestRate: parseFloat(baseResult.rate) || 7.2,
      baseLeadTimeDays: baseResult.transitDays,
      delayDays: 0,
      financingInstrument: "in_transit_financing"
    });

    const isBottleneck = activeNode.isBottleneck || (activeNode.delayDays > 0);
    const cost = Number(activeNode.cost || activeNode.loanAmount || baseResult.numericFreight);
    const ltv = Number(activeNode.ltvRatio || 0.80);
    const carryingCost = baseResult.numericCarrying;

    const telemetryPayload = {
      asset_id: activeNode.batchId || "BATCH-NX-2026-A1",
      current_node: {
        node_id: activeNode.id || "node-04",
        stage: (activeNode.type || "TRANSIT").toUpperCase(),
        verified_quality_pct: Number(baseResult.qualityScore || 96.5)
      },
      route_parameters: {
        transit_duration_days: baseResult.transitDays,
        carrying_cost_usd: carryingCost,
        current_credit_limit_usd: Math.round(cost * ltv)
      },
      active_disruption: {
        event: isBottleneck ? (activeNode.bottleneckReason || "Transit Delay Shock") : null,
        impact_days: Number(activeNode.delayDays || 0)
      },
      current_financial_state: {
        active_instrument: (activeNode.financingInstrument || "in_transit_financing").toUpperCase(),
        active_lien_detected: Boolean(activeNode.hasDuplicateLien || false)
      }
    };

    // 3. Obtain API Key if available
    const apiKeyInput = document.getElementById("deepseekApiKeyInput");
    const storedApiKey = localStorage.getItem("deepseek_api_key") || "";
    const effectiveApiKey = (apiKeyInput && apiKeyInput.value.trim()) || storedApiKey || "";

    // 4. Query Backend AI Underwriter Agent Endpoint OR Direct DeepSeek API
    let aiDecisionAcquired = false;

    // First attempt: Backend endpoint
    try {
      const resp = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          telemetry: telemetryPayload,
          api_key: effectiveApiKey
        })
      });

      if (resp.ok) {
        const aiData = await resp.json();
        if (aiData && aiData.underwriting_decision) {
          const dec = aiData.underwriting_decision;
          baseResult.action = dec.action || "Transition";
          baseResult.instrument = dec.recommended_instrument || baseResult.instrument;
          baseResult.riskScoreLevel = dec.risk_score || "Low";
          baseResult.autoReasoning = dec.auto_reasoning || baseResult.verdict;
          baseResult.revisedCarrying = dec.revised_carrying_cost;
          baseResult.revisedLimit = dec.revised_credit_limit;
          baseResult.webhookTrigger = aiData.webhook_trigger;
          baseResult.engineSource = aiData.engine_source || "DEEPSEEK_LIVE";
          baseResult.apiNotice = aiData.api_notice;
          aiDecisionAcquired = true;
        }
      }
    } catch (backendErr) {
      console.warn("Backend /api/ai/advisor query failed, attempting direct client fetch:", backendErr);
    }

    // Direct Browser Fetch to DeepSeek if backend was offline and client key is present
    if (!aiDecisionAcquired && effectiveApiKey && effectiveApiKey.startsWith("sk-")) {
      try {
        const directResp = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            response_format: { type: "json_object" },
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content: `You are the Autonomous Supply-Chain Underwriter AI for Node-X-Logistics. Track physical assets and dynamically determine financing. Respond ONLY with a valid JSON object matching this schema:
{
  "underwriting_decision": {
    "action": "Initiate | Refinance | Transition | Settle | Reject",
    "recommended_instrument": "string or null",
    "revised_carrying_cost": 0.0,
    "revised_credit_limit": 0.0,
    "risk_score": "Low | Moderate | High | Critical",
    "auto_reasoning": "string"
  },
  "webhook_trigger": {
    "execute": false,
    "target_system": "FRAUD_OPS | RISK_MANAGEMENT | NONE",
    "alert_reason": "string or null"
  }
}`
              },
              {
                role: "user",
                content: `User query: "${query}"\n\nLive Telemetry:\n${JSON.stringify(telemetryPayload, null, 2)}`
              }
            ]
          })
        });

        if (directResp.ok) {
          const directData = await directResp.json();
          const parsed = JSON.parse(directData.choices[0].message.content);
          if (parsed && parsed.underwriting_decision) {
            const dec = parsed.underwriting_decision;
            baseResult.action = dec.action || "Transition";
            baseResult.instrument = dec.recommended_instrument || baseResult.instrument;
            baseResult.riskScoreLevel = dec.risk_score || "Low";
            baseResult.autoReasoning = dec.auto_reasoning || baseResult.verdict;
            baseResult.revisedCarrying = dec.revised_carrying_cost;
            baseResult.revisedLimit = dec.revised_credit_limit;
            baseResult.webhookTrigger = parsed.webhook_trigger;
            baseResult.engineSource = "DEEPSEEK_LIVE";
            aiDecisionAcquired = true;
          }
        }
      } catch (directErr) {
        console.warn("Direct DeepSeek client call failed:", directErr);
      }
    }

    lastAiResult = baseResult;
    renderAiResponse(baseResult);
  }

  function renderAiResponse(res) {
    const outputContainer = document.getElementById("aiResponseArea");
    if (!outputContainer) return;

    // SVG inline radar geometry
    const size = 180;
    const cx = size / 2;
    const cy = size / 2;
    const r = 58;

    const qN = Math.max(0.2, Math.min(1.0, res.qualityScore / 100.0));
    const cN = Math.max(0.2, Math.min(1.0, res.costScore / 100.0));
    const tN = Math.max(0.2, Math.min(1.0, res.timeScore / 100.0));

    const pQ = getTrianglePoint(cx, cy, r * qN, 0);
    const pC = getTrianglePoint(cx, cy, r * cN, 120);
    const pT = getTrianglePoint(cx, cy, r * tN, 240);

    const gQ = getTrianglePoint(cx, cy, r, 0);
    const gC = getTrianglePoint(cx, cy, r, 120);
    const gT = getTrianglePoint(cx, cy, r, 240);

    const action = res.action || "Transition";
    const riskLevel = res.riskScoreLevel || (res.qualityScore < 90 ? "Moderate" : "Low");
    const reasoning = res.autoReasoning || res.verdict;
    const isLiveDeepSeek = res.engineSource === "DEEPSEEK_LIVE";

    let actionColor = "#10b981";
    if (action === "Reject") actionColor = "#ef4444";
    else if (action === "Refinance") actionColor = "#f59e0b";
    else if (action === "Initiate") actionColor = "#38bdf8";

    outputContainer.innerHTML = `
      <div class="ai-result-card liquid-glass" style="animation: fadeIn 0.3s ease;">
        <div style="display: grid; grid-template-columns: 1fr 200px; gap: 20px; align-items: center;">
          <div>
            <div class="ai-result-header" style="padding-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="status-badge-mono" style="color: ${actionColor}; border-color: ${actionColor}66;">
                  DECISION: ${action.toUpperCase()}
                </span>
                <span class="status-badge-mono" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
                  RISK: ${riskLevel.toUpperCase()}
                </span>
                <span class="status-badge-mono" style="color: ${isLiveDeepSeek ? '#10b981' : '#a0a0a0'}; border-color: ${isLiveDeepSeek ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.2)'};">
                  ${isLiveDeepSeek ? 'DEEPSEEK V3 LIVE' : 'UNDERWRITER ENGINE'}
                </span>
                ${
                  res.webhookTrigger && res.webhookTrigger.execute
                    ? `<span class="status-badge-mono" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.4);">WEBHOOK ALERT: ${res.webhookTrigger.target_system}</span>`
                    : ''
                }
              </div>
            </div>

            <h3 class="title-md" style="color: #ffffff; margin: 8px 0 4px;">
              ${res.cargoName.toUpperCase()}
            </h3>
            <span class="caption-uppercase" style="color: #38bdf8; font-size: 11px; display: block; margin-bottom: 6px;">
              RECOMMENDED CORRIDOR: ${res.mode.toUpperCase()}
            </span>

            <p class="body-md" style="margin: 8px 0 12px; font-size: 12.5px; line-height: 1.55; color: #ffffff;">
              ${reasoning}
            </p>

            ${
              res.apiNotice && res.apiNotice.includes("Insufficient Balance")
                ? `<div style="font-size: 10px; color: #f59e0b; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 3px; padding: 5px 8px; margin-bottom: 8px; font-family: var(--font-mono, monospace);">
                    Note: DeepSeek API returned 402 (Insufficient Account Balance). Operating on verified deterministic Underwriter engine.
                  </div>`
                : ''
            }

            <div style="font-size: 11px; font-family: var(--font-mono, monospace); color: var(--muted-soft);">
              FINANCING FACILITY: <span style="color: #ffffff;">${res.instrument}</span> | BASE RATE: <span style="color: #38bdf8;">${res.rate}</span>
            </div>
          </div>

          <!-- Inline Triangulation Radar Box -->
          <div style="background: rgba(8, 8, 12, 0.75); border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; padding: 12px; text-align: center;">
            <span class="caption-uppercase" style="font-size: 8.5px; color: var(--muted-soft); display: block; margin-bottom: 4px;">TRIANGULATION RADAR</span>
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              <!-- Concentric Background Triangle -->
              <polygon points="${gQ.x},${gQ.y} ${gC.x},${gC.y} ${gT.x},${gT.y}" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
              <line x1="${cx}" y1="${cy}" x2="${gQ.x}" y2="${gQ.y}" stroke="rgba(255,255,255,0.15)" stroke-dasharray="2 2"/>
              <line x1="${cx}" y1="${cy}" x2="${gC.x}" y2="${gC.y}" stroke="rgba(255,255,255,0.15)" stroke-dasharray="2 2"/>
              <line x1="${cx}" y1="${cy}" x2="${gT.x}" y2="${gT.y}" stroke="rgba(255,255,255,0.15)" stroke-dasharray="2 2"/>
              <!-- Data Poly -->
              <polygon points="${pQ.x},${pQ.y} ${pC.x},${pC.y} ${pT.x},${pT.y}" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="1.8"/>
              <circle cx="${pQ.x}" cy="${pQ.y}" r="3" fill="#ffffff" stroke="#10b981"/>
              <circle cx="${pC.x}" cy="${pC.y}" r="3" fill="#ffffff" stroke="#10b981"/>
              <circle cx="${pT.x}" cy="${pT.y}" r="3" fill="#ffffff" stroke="#10b981"/>
              <!-- Labels -->
              <text x="${cx}" y="${cy - r - 4}" fill="#10b981" font-size="8" font-family="var(--font-mono, monospace)" text-anchor="middle">QUAL ${res.qualityScore}%</text>
              <text x="${gC.x + 6}" y="${gC.y + 4}" fill="#f59e0b" font-size="8" font-family="var(--font-mono, monospace)" text-anchor="start">COST ${res.costScore}%</text>
              <text x="${gT.x - 6}" y="${gT.y + 4}" fill="#38bdf8" font-size="8" font-family="var(--font-mono, monospace)" text-anchor="end">TIME ${res.transitDays}d</text>
            </svg>
          </div>
        </div>

        <!-- 4-Pillar Metric Grid -->
        <div class="ai-metric-pills-grid" style="margin: 14px 0 10px;">
          <div class="ai-pill-card">
            <span class="caption-uppercase">TRANSIT DURATION</span>
            <div class="ai-pill-val" style="color: #38bdf8;">${res.transitDays} DAYS</div>
          </div>
          <div class="ai-pill-card">
            <span class="caption-uppercase">DIRECT FREIGHT</span>
            <div class="ai-pill-val">${res.directFreight}</div>
          </div>
          <div class="ai-pill-card">
            <span class="caption-uppercase">CAPITAL CARRYING COST</span>
            <div class="ai-pill-val" style="color: var(--warning);">${res.carryingCost}</div>
          </div>
          <div class="ai-pill-card">
            <span class="caption-uppercase">TOTAL WORKING CAPITAL</span>
            <div class="ai-pill-val" style="color: #ffffff; font-weight: 600;">${res.totalCost}</div>
          </div>
        </div>

        <!-- Apply Button -->
        <button class="button-primary" style="width: 100%; margin-top: 6px; padding: 12px;" onclick="window.AiRouteAdvisor.applyAiToSimulator()">
          APPLY AI OPTIMAL ROUTE TO TRIANGULATION GRAPH
        </button>
      </div>
    `;

    if (typeof window.triggerVoiceAlert === "function") {
      window.triggerVoiceAlert(`Autonomous AI Underwriter recommends ${action} under ${res.mode}. Total landed capital is ${res.totalCost}.`);
    }
  }

  function getTrianglePoint(cx, cy, radius, angleDeg) {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad)
    };
  }

  function applyAiToSimulator() {
    if (!lastAiResult) return;

    // 1. Update active transit node in graph
    if (window.activeNodes && window.activeNodes.length > 0) {
      const transitNode = window.activeNodes.find((n) => n.type === "transit" || n.type === "TRANSIT") || window.activeNodes[0];
      transitNode.name = lastAiResult.mode.length > 25 ? lastAiResult.mode.substring(0, 24) + "..." : lastAiResult.mode;
      transitNode.cost = lastAiResult.numericFreight;
      transitNode.baseLeadTimeDays = lastAiResult.transitDays;
      transitNode.delayDays = 0;
      transitNode.isBottleneck = false;
      transitNode.qualityScore = lastAiResult.qualityScore;
      transitNode.supplierReliabilityScore = lastAiResult.qualityScore / 100.0;
    }

    // 2. Synchronize main graph triangulation and radar
    if (window.graphInstance && typeof window.graphInstance.updateTriangulation === "function") {
      window.graphInstance.updateTriangulation({
        qualityScore: lastAiResult.qualityScore,
        timeScore: lastAiResult.timeScore,
        costScore: lastAiResult.costScore,
        transitDays: lastAiResult.transitDays,
        freightCost: lastAiResult.numericFreight,
        carryingCost: lastAiResult.numericCarrying,
        totalCost: lastAiResult.numericTotal,
        activePathway: lastAiResult.mode
      });
    }

    // 3. Switch smoothly to Tab 1 (Triangulation Graph) so user immediately sees the change
    if (typeof window.switchStudioTab === "function") {
      window.switchStudioTab("topology");
    }
  }

  function saveApiKey(key) {
    const trimmed = (key || "").trim();
    localStorage.setItem("deepseek_api_key", trimmed);
    const badge = document.getElementById("apiKeyStatusBadge");
    if (badge) {
      badge.textContent = trimmed ? "API KEY SAVED" : "AUTONOMOUS AGENT ACTIVE";
      badge.style.color = "#10b981";
    }
  }

  function init() {
    const stored = localStorage.getItem("deepseek_api_key") || "";
    const inp = document.getElementById("deepseekApiKeyInput");
    if (inp && stored) {
      inp.value = stored;
      const badge = document.getElementById("apiKeyStatusBadge");
      if (badge) {
        badge.textContent = "API KEY CONFIGURED";
        badge.style.color = "#10b981";
      }
    }
  }

  window.AiRouteAdvisor = {
    init: init,
    ask: askAiRouteAdvisor,
    analyzeQuery: analyzeQuery,
    applyAiToSimulator: applyAiToSimulator,
    saveApiKey: saveApiKey
  };

  // Auto-run init on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
