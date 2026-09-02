/**
 * Node-X-Logistics — Core Application State & Mock API Controller (Bugatti Design System)
 * Problem Statement #6 (IEEE HACKVERSE 2026)
 * Uses MockEngine for 100% standalone in-browser execution with Bugatti Typography Trinity & Full-Page Vanta 3D Waves.
 */

let currentTemplateId = "apparel";
let activeNodes = [];
let activeDashboard = null;
let graphInstance = null;
let ledgerViewInstance = null;
let lastVoiceAlertText = "Awaiting physical simulation event. Underwriting parameters nominal.";

// Initialization on DOM load
function initApp() {
  initGraph();
  if (typeof initLedger === "function") initLedger();
  loadTemplateNetwork(currentTemplateId);
  if (typeof fetchLedgerState === "function") fetchLedgerState();
  if (window.PathwayOptimizer && typeof window.PathwayOptimizer.init === "function") {
    window.PathwayOptimizer.init();
  }
  if (window.CrisisLab && typeof window.CrisisLab.init === "function") {
    window.CrisisLab.init();
  }
}
window.initApp = initApp;

document.addEventListener("DOMContentLoaded", () => {
  initApp();

  if (window.location.hash === "#simulator") {
    showView("simulator");
  }
});

// Navigation View Switcher
function showView(viewName) {
  const homeView = document.getElementById("homeView");
  const simView = document.getElementById("simView");
  const navHomeBtn = document.getElementById("navHomeBtn");
  const navSimBtn = document.getElementById("navSimBtn");

  if (viewName === "home") {
    if (homeView) homeView.classList.add("active");
    if (simView) simView.classList.remove("active");
    if (navHomeBtn) navHomeBtn.classList.add("active");
    if (navSimBtn) navSimBtn.classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    if (homeView) homeView.classList.remove("active");
    if (simView) simView.classList.add("active");
    if (navHomeBtn) navHomeBtn.classList.remove("active");
    if (navSimBtn) navSimBtn.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      if (graphInstance) graphInstance.render(activeNodes);
    }, 100);
  }
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

function switchStudioTab(tabKey) {
  const tabs = ["topology", "crises", "ai-advisor", "ledger"];
  tabs.forEach((key) => {
    const btn = document.getElementById(`studioTab_${key}`);
    const pane = document.getElementById(`studioPane_${key}`);
    if (btn) {
      if (key === tabKey) btn.classList.add("active");
      else btn.classList.remove("active");
    }
    if (pane) {
      if (key === tabKey) {
        pane.classList.add("active");
        pane.style.display = "block";
      } else {
        pane.classList.remove("active");
        pane.style.display = "none";
      }
    }
  });

  if (tabKey === "topology" && graphInstance) {
    setTimeout(() => {
      if (typeof graphInstance.render === "function") graphInstance.render(activeNodes);
    }, 50);
  }
}
window.switchStudioTab = switchStudioTab;

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize Visualizers
function initGraph() {
  graphInstance = new SupplyChainTriangulationGraph("graphViewport", "radarSvg", onNodeSelected);
  window.graphInstance = graphInstance;
}

function initLedger() {
  if (typeof LedgerView !== "undefined") {
    ledgerViewInstance = new LedgerView("ledgerEntriesList", "activeLocksList", "ledgerCountBadge");
  }
}

// Load Network Template (Standalone via MockEngine)
async function loadTemplateNetwork(templateId) {
  currentTemplateId = templateId;
  try {
    const data = await window.MockEngine.getNodes(templateId);
    activeNodes = data.nodes || [];
    activeDashboard = data.dashboard;

    if (graphInstance) graphInstance.setNodes(activeNodes);
    updateDashboardUI(activeDashboard);
    populateShockTargetDropdown(activeNodes);
    if (activeNodes.length > 0) {
      onNodeSelected(activeNodes[0]);
    }
  } catch (err) {
    console.error("Failed to load network template:", err);
  }
}

function onTemplateChange(newTemplateId) {
  loadTemplateNetwork(newTemplateId);
}

function populateShockTargetDropdown(nodes) {
  const select = document.getElementById("shockTargetNode");
  if (!select) return;

  select.innerHTML = nodes
    .map((n) => `<option value="${n.id}">${n.type.toUpperCase()}: ${n.name.toUpperCase()}</option>`)
    .join("");
}

function updateMagnitudeDisplay(val) {
  const span = document.getElementById("magnitudeVal");
  if (span) span.textContent = `${val} DAYS / %`;
}

let currentlyInspectedNode = null;
let lockedSelectedNode = null;

// Comprehensive Node Inspector & Live Preview Renderer
function renderNodeInspector(node, isPreview = false) {
  const emptyBox = document.getElementById("inspectorEmpty");
  const contentBox = document.getElementById("inspectorContent");
  const modeLabel = document.getElementById("inspectorModeLabel");
  if (!contentBox) return;

  if (!node) {
    if (emptyBox) emptyBox.classList.remove("hidden");
    contentBox.classList.add("hidden");
    return;
  }

  if (emptyBox) emptyBox.classList.add("hidden");
  contentBox.classList.remove("hidden");

  if (modeLabel) {
    modeLabel.textContent = isPreview ? "LIVE PREVIEW" : "ACTIVE ASSET";
    modeLabel.style.color = isPreview ? "#38bdf8" : "#ffffff";
  }

  const isBottleneck = Boolean(node.isBottleneck || (node.delayDays && node.delayDays > 0));
  const isFinanced = node.assetState === "financed";
  const isSettled = node.assetState === "settled";

  let statusColor = "#ffffff";
  let statusText = "NOMINAL";
  let statusBorder = "rgba(255, 255, 255, 0.3)";

  if (isBottleneck) {
    statusColor = "#ef4444";
    statusText = "CHOKEPOINT ALERT";
    statusBorder = "rgba(239, 68, 68, 0.4)";
  } else if (isFinanced) {
    statusColor = "#10b981";
    statusText = "FINANCED";
    statusBorder = "rgba(16, 185, 129, 0.4)";
  } else if (isSettled) {
    statusColor = "#9ca3af";
    statusText = "SETTLED";
    statusBorder = "rgba(156, 163, 175, 0.4)";
  } else {
    statusColor = "#ffffff";
    statusText = "UNFINANCED";
    statusBorder = "rgba(255, 255, 255, 0.3)";
  }

  const ltvPct = Math.round((node.ltvRatio || 0.8) * 100);
  const costVal = Number(node.cost || node.loanAmount || 100000);
  const loanVal = node.loanAmount ? Number(node.loanAmount) : Math.round(costVal * (node.ltvRatio || 0.8));
  const leverageFormatted = Math.round(loanVal).toLocaleString();
  const instrument = (node.financingInstrument || "TRADE CREDIT").replace(/_/g, " ").toUpperCase();
  const stage = (node.type || "STAGE").toUpperCase();
  const sectionIdx = node.sectionIndex || (activeNodes.findIndex((n) => n.id === node.id) >= 0 ? String(activeNodes.findIndex((n) => n.id === node.id) + 1).padStart(2, "0") : "01");
  const tier = node.tier || 1;
  const leadTime = node.baseLeadTimeDays || 5;
  const quality = node.qualityScore ? Number(node.qualityScore).toFixed(1) : (node.supplierReliabilityScore ? (Number(node.supplierReliabilityScore) * 100).toFixed(1) : "96.0");
  const rate = Number(node.interestRate || 7.2).toFixed(2);
  const delayDays = Number(node.delayDays || 0);

  contentBox.innerHTML = `
    <div class="inspector-card-wrap" style="display: flex; flex-direction: column; gap: 10px; font-family: var(--font-mono, monospace);">
      
      <!-- Top Title & Badge Header -->
      <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 9.5px; color: #888888; letter-spacing: 1px;">SECTION ${sectionIdx} // ${stage}</span>
          <span class="status-badge-mono" style="font-size: 8.5px; color: ${statusColor}; border-color: ${statusBorder}; padding: 2px 6px;">
            ${statusText}
          </span>
        </div>
        <div style="font-size: 13px; font-weight: 600; color: #ffffff; line-height: 1.3;">
          ${node.name.toUpperCase()}
        </div>
        <div style="font-size: 9px; color: #888888; margin-top: 2px;">
          FINANCING TIER ${tier} • ${instrument}
        </div>
      </div>

      <!-- Physical Telemetry Section -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 4px; padding: 8px 10px; display: flex; flex-direction: column; gap: 5px; font-size: 10.5px;">
        <div style="font-size: 9px; color: #888888; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 3px; margin-bottom: 2px;">
          PHYSICAL TELEMETRY
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888888;">LEAD TIME:</span>
          <span style="color: #38bdf8; font-weight: 500;">${leadTime} DAYS</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888888;">TRANSIT DELAY:</span>
          <span style="color: ${delayDays > 0 ? '#ef4444' : '#10b981'}; font-weight: 500;">
            ${delayDays > 0 ? `+${delayDays}d DELAY` : '0d (ON SCHEDULE)'}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888888;">QUALITY RETENTION:</span>
          <span style="color: #10b981; font-weight: 500;">${quality}%</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888888;">FLOW STATUS:</span>
          <span style="color: ${isBottleneck ? '#ef4444' : '#10b981'}; font-weight: 500;">
            ${isBottleneck ? 'CHOKEPOINT' : 'NOMINAL'}
          </span>
        </div>
      </div>

      <!-- Underwriting & Leverage Section -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 4px; padding: 8px 10px; display: flex; flex-direction: column; gap: 5px; font-size: 10.5px;">
        <div style="font-size: 9px; color: #888888; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 3px; margin-bottom: 2px;">
          WORKING CAPITAL TERMS
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888888;">CAPITAL NEED:</span>
          <span style="color: #ffffff; font-weight: 600;">$${Math.round(costVal).toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888888;">MAX SAFE LEVERAGE:</span>
          <span style="color: #10b981; font-weight: 500;">$${leverageFormatted} (${ltvPct}% LTV)</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888888;">DYNAMIC RATE:</span>
          <span style="color: #38bdf8; font-weight: 500;">${rate}% APR</span>
        </div>
      </div>

      <!-- Action Button -->
      <div style="margin-top: 2px;">
        ${
          node.assetState === "unfinanced"
            ? `<button class="button-primary button-primary-small" style="width: 100%; padding: 7px; font-size: 10px; letter-spacing: 1px;" onclick="financeSingleNode('${node.id}')">ISSUE FACILITY</button>`
            : node.assetState === "financed"
            ? `<button class="button-secondary button-secondary-small" style="width: 100%; padding: 7px; font-size: 10px; letter-spacing: 1px; color: #10b981; border-color: rgba(16,185,129,0.4);" onclick="settleSingleNode('${node.id}')">SETTLE FACILITY LIEN</button>`
            : `<span class="status-badge-mono" style="display: block; text-align: center; color: #9ca3af; border-color: #333333; padding: 6px; font-size: 9.5px;">SETTLED IN FULL</span>`
        }
      </div>

    </div>
  `;
}

function onNodeSelected(node) {
  lockedSelectedNode = node;
  currentlyInspectedNode = node;
  renderNodeInspector(node, false);
}

function onNodePreview(node) {
  currentlyInspectedNode = node;
  renderNodeInspector(node, true);
}

function onNodePreviewEnd() {
  if (lockedSelectedNode) {
    currentlyInspectedNode = lockedSelectedNode;
    renderNodeInspector(lockedSelectedNode, false);
  }
}

window.onNodeSelected = onNodeSelected;
window.onNodePreview = onNodePreview;
window.onNodePreviewEnd = onNodePreviewEnd;
window.financeSingleNode = financeSingleNode;
window.settleSingleNode = settleSingleNode;

// Preset Shock Runner
function applyPresetShock(shockType, magnitude) {
  const shockSelect = document.getElementById("shockTypeSelect");
  const slider = document.getElementById("magnitudeSlider");
  if (shockSelect) shockSelect.value = shockType;
  if (slider) {
    slider.value = magnitude;
    updateMagnitudeDisplay(magnitude);
  }
  executeCustomSimulation();
}

// Custom Simulation Execution (Standalone via MockEngine)
async function executeCustomSimulation() {
  const targetNodeId = document.getElementById("shockTargetNode")?.value;
  const shockType = document.getElementById("shockTypeSelect")?.value || "port_blockade";
  const magnitude = parseFloat(document.getElementById("magnitudeSlider")?.value || 12);

  const payload = {
    nodeId: targetNodeId,
    shockType: shockType,
    magnitude: magnitude,
    template_id: currentTemplateId
  };

  try {
    const data = await window.MockEngine.simulate(payload);
    activeNodes = data.updatedNodes || [];
    activeDashboard = data.dashboard;

    // Update Graph
    if (graphInstance) graphInstance.setNodes(activeNodes);

    // Update Dashboard
    updateDashboardUI(activeDashboard);

    // Handle Double Financing or Refinancing
    if (data.ledgerCheck && data.ledgerCheck.blocked) {
      showDoubleFinancingAlertBanner(data.ledgerCheck.reason);
    } else {
      hideAlertBanner();
    }

    if (data.refinancingEvent && data.refinancingEvent.triggered) {
      addRefinancingFeedCard(data.refinancingEvent);
      triggerVoiceAlert(data.refinancingEvent.reason);
    }

    // Re-fetch Ledger
    fetchLedgerState();
  } catch (err) {
    console.error("Simulation error:", err);
  }
}

// Live Dashboard UI Updater
function updateDashboardUI(dash) {
  if (!dash) return;

  const elExposure = document.getElementById("dashTotalExposure");
  const elWacc = document.getElementById("dashWacc");
  const elRisk = document.getElementById("dashRiskScore");
  const elRiskBar = document.getElementById("dashRiskBar");
  const elCcc = document.getElementById("dashCcc");
  const elRunway = document.getElementById("dashRunway");
  const elRunwayBar = document.getElementById("dashRunwayBar");
  const elRunwayNote = document.getElementById("dashRunwayNote");
  const elRatio = document.getElementById("dashFinancedRatio");

  if (elExposure) elExposure.textContent = `$${(dash.totalExposure || 0).toLocaleString()}`;
  if (elWacc) elWacc.textContent = `${dash.wacc}%`;
  if (elRisk) elRisk.textContent = `${dash.avgRiskScore}`;
  if (elRiskBar) elRiskBar.style.width = `${Math.min(100, Math.round(dash.avgRiskScore * 100))}%`;
  if (elCcc) elCcc.textContent = `${dash.cashConversionCycleDays} D`;
  if (elRunway) elRunway.textContent = `${dash.liquidityRunwayDays} DAYS`;
  if (elRatio) elRatio.textContent = `${dash.financedCount} / ${dash.totalCost > 0 ? activeNodes.length : 7} FINANCED`;

  if (elRunwayBar) {
    const pct = Math.max(10, Math.min(100, (dash.liquidityRunwayDays / 45) * 100));
    elRunwayBar.style.width = `${pct}%`;
    if (dash.liquidityRunwayDays < 20) {
      elRunwayBar.style.background = "var(--critical)";
      if (elRunwayNote) elRunwayNote.textContent = "CRITICAL: RUNWAY COMPRESSED BELOW 20 DAYS.";
    } else {
      elRunwayBar.style.background = "#ffffff";
      if (elRunwayNote) elRunwayNote.textContent = "NOMINAL BUFFER";
    }
  }

  // Update Homepage Hero numbers too
  const heroExp = document.getElementById("heroExposure");
  const heroWacc = document.getElementById("heroWacc");
  const heroCcc = document.getElementById("heroCcc");
  if (heroExp) heroExp.textContent = `$${(dash.totalExposure || 1184500).toLocaleString()}`;
  if (heroWacc) heroWacc.textContent = `${dash.wacc}%`;
  if (heroCcc) heroCcc.textContent = `${dash.cashConversionCycleDays} DAYS`;
}

// Refinancing Feed
function addRefinancingFeedCard(evt) {
  const feed = document.getElementById("refinancingFeedList");
  if (!feed) return;

  const nowStr = new Date().toLocaleTimeString();
  const isCrit = evt.severity === "CRITICAL";

  const cardHtml = `
    <div class="feed-entry-card ${isCrit ? "critical" : ""}">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="caption-uppercase ${isCrit ? "critical-text" : ""}" style="color: ${isCrit ? 'var(--critical)' : '#ffffff'};">${evt.severity}</span>
        <span class="caption-uppercase">${nowStr}</span>
      </div>
      <p class="body-md" style="margin: 4px 0;">${evt.reason}</p>
      <div class="caption-uppercase" style="display: flex; gap: 12px; color: var(--muted);">
        <span>RATE: ${evt.newInterestRate}%</span>
        <span>${evt.affectedNodeIds ? evt.affectedNodeIds.length : 1} NODES REPRICED</span>
      </div>
    </div>
  `;

  feed.insertAdjacentHTML("afterbegin", cardHtml);
}

function clearRefinancingFeed() {
  const feed = document.getElementById("refinancingFeedList");
  if (feed) {
    feed.innerHTML = `
      <div class="feed-entry-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="caption-uppercase" style="color: #ffffff;">BASELINE</span>
          <span class="caption-uppercase">RESET</span>
        </div>
        <p class="body-md" style="margin: 4px 0;">Feed cleared. Autonomous Agent ready for physical events.</p>
      </div>
    `;
  }
}

// Banner Helpers
function showDoubleFinancingAlertBanner(reason) {
  const banner = document.getElementById("graphAlertBanner");
  if (!banner) return;
  banner.classList.remove("hidden");
  banner.innerHTML = `
    <span class="caption-uppercase critical-text">⚠️ ${reason}</span>
    <button class="button-secondary button-secondary-small" onclick="hideAlertBanner()">DISMISS</button>
  `;
}

function hideAlertBanner() {
  const banner = document.getElementById("graphAlertBanner");
  if (banner) banner.classList.add("hidden");
}

// Anti-Double-Financing Ledger Client Operations (Standalone via MockEngine)
async function fetchLedgerState() {
  try {
    const data = await window.MockEngine.getLedgerState();
    if (ledgerViewInstance) {
      ledgerViewInstance.render(data.entries, data.activeLocks);
    }
  } catch (err) {
    console.error("Failed to fetch ledger state:", err);
  }
}

async function financeSingleNode(nodeId) {
  try {
    const data = await window.MockEngine.financeNode(nodeId);
    if (!data.success || data.blocked) {
      if (ledgerViewInstance) {
        ledgerViewInstance.showDoubleFinancingAlert(data);
      }
    } else {
      loadTemplateNetwork(currentTemplateId);
      fetchLedgerState();
      switchTab("ledger");
    }
  } catch (err) {
    console.error("Finance node error:", err);
  }
}

async function settleSingleNode(nodeId) {
  try {
    const res = await window.MockEngine.settleNode(nodeId);
    if (res.success) {
      loadTemplateNetwork(currentTemplateId);
      fetchLedgerState();
    }
  } catch (err) {
    console.error("Settle node error:", err);
  }
}

async function financeNextAvailableNode() {
  const unfinancedNode = activeNodes.find((n) => n.assetState === "unfinanced");
  if (unfinancedNode) {
    financeSingleNode(unfinancedNode.id);
  } else {
    alert("All nodes in the current network graph have already been financed or settled.");
  }
}

async function settleActiveBatch() {
  const financedNodes = activeNodes.filter((n) => n.assetState === "financed");
  if (financedNodes.length === 0) {
    alert("No active financed nodes to settle.");
    return;
  }

  for (const n of financedNodes) {
    await window.MockEngine.settleNode(n.id);
  }

  loadTemplateNetwork(currentTemplateId);
  fetchLedgerState();
  switchTab("ledger");
}

// Judge Demonstration: Trigger Double-Financing Attack Test
async function triggerDoubleFinancingAttackDemo() {
  const targetNode = activeNodes[0] || { id: "a1111111-1111-4111-8111-111111111111" };
  try {
    const data = await window.MockEngine.attemptDoubleFinance(targetNode.id, "BATCH-NX-2026-A1");
    if (ledgerViewInstance) {
      ledgerViewInstance.showDoubleFinancingAlert(data);
    }
    triggerVoiceAlert("Alert: Double-financing attempt detected on batch BATCH-NX-2026-A1. Facility issuance blocked by ledger invariant check.");
  } catch (err) {
    console.error("Attack test error:", err);
  }
}

function closeAttackModal() {
  if (ledgerViewInstance) {
    ledgerViewInstance.hideDoubleFinancingAlert();
  }
}

async function resetNetworkAndLedger() {
  try {
    await window.MockEngine.reset();
    loadTemplateNetwork(currentTemplateId);
    fetchLedgerState();
    clearRefinancingFeed();
    hideAlertBanner();
  } catch (err) {
    console.error("Reset error:", err);
  }
}

let voiceEnabled = true;
let voiceRunId = 0;

// Voice Underwriter Synthesizer (Chunked Web Speech Engine)
function onVoiceToggleChange(el) {
  voiceEnabled = Boolean(el && el.checked);
  voiceRunId++; // Invalidates any in-flight chunk loop

  if (!voiceEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  const audioMeta = document.getElementById("audioMetaTag");
  if (audioMeta) {
    audioMeta.textContent = voiceEnabled ? "READY" : "MUTED";
  }
}

function speakChunked(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const myRunId = ++voiceRunId;

  const words = (text || "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return;

  const chunks = [];
  for (let i = 0; i < words.length; i += 4) {
    chunks.push(words.slice(i, i + 4).join(" "));
  }

  function playChunk(index) {
    if (!voiceEnabled || myRunId !== voiceRunId || index >= chunks.length) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    utterance.onend = () => {
      if (voiceEnabled && myRunId === voiceRunId) {
        playChunk(index + 1);
      }
    };
    utterance.onerror = () => {
      if (voiceEnabled && myRunId === voiceRunId) {
        playChunk(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  playChunk(0);
}

async function triggerVoiceAlert(text) {
  lastVoiceAlertText = text;
  const audioText = document.getElementById("underwriterSpeechText");
  const audioMeta = document.getElementById("audioMetaTag");

  if (audioText) audioText.textContent = `"${text}"`;

  if (!voiceEnabled) {
    if (audioMeta) audioMeta.textContent = "MUTED";
    return;
  }

  if (audioMeta) audioMeta.textContent = "WEB SPEECH";
  speakChunked(text);
}

function replayLastVoiceAlert() {
  triggerVoiceAlert(lastVoiceAlertText);
}

// Attach all critical simulation functions to window for global access
window.triggerVoiceAlert = triggerVoiceAlert;
window.replayLastVoiceAlert = replayLastVoiceAlert;
window.onVoiceToggleChange = onVoiceToggleChange;
window.resetNetworkAndLedger = resetNetworkAndLedger;
window.triggerDoubleFinancingAttackDemo = triggerDoubleFinancingAttackDemo;
window.financeNextAvailableNode = financeNextAvailableNode;
window.settleActiveBatch = settleActiveBatch;
window.applyPresetShock = applyPresetShock;
window.executeCustomSimulation = executeCustomSimulation;
window.showView = showView;
window.scrollToSection = scrollToSection;
window.switchStudioTab = switchStudioTab;
window.onTemplateChange = onTemplateChange;
