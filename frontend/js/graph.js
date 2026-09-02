/**
 * NODE-X-LOGISTICS — MINIMAL FLOATING TOPOLOGY & TRIANGULATION GRAPH ENGINE
 * Quantitative Financial Architecture (IEEE HACKVERSE 2026 Problem Statement #6)
 * Sleek connected floating nodes on interactive DotGrid background with hover summary & click popup modal.
 */

class SupplyChainTriangulationGraph {
  constructor(containerId, radarSvgId, onNodeClickCallback) {
    this.containerId = containerId || "graphViewport";
    this.radarSvgId = radarSvgId || "radarSvg";
    this.onNodeClick = onNodeClickCallback;

    this.selectedNodeId = "node-4";
    this.activeModalNode = null;
    // Minimal node dimensions (40x40)
    this.nodeDimensions = { width: 40, height: 40 };

    // Standard 7-Section Supply Chain Pipeline Baseline
    this.nodes = [
      {
        id: "node-1",
        name: "Organic Cotton Farms",
        sectionIndex: "01",
        type: "ORIGIN",
        tier: 1,
        cost: 140000.0,
        baseLeadTimeDays: 8.0,
        delayDays: 0,
        qualityScore: 98.0,
        interestRate: 6.80,
        ltvRatio: 0.85,
        assetState: "unfinanced",
        financingInstrument: "po_financing",
        isBottleneck: false
      },
      {
        id: "node-2",
        name: "Spinning & Weaving Mill",
        sectionIndex: "02",
        type: "PROCESSING",
        tier: 2,
        cost: 220000.0,
        baseLeadTimeDays: 12.0,
        delayDays: 0,
        qualityScore: 95.0,
        interestRate: 7.10,
        ltvRatio: 0.82,
        assetState: "unfinanced",
        financingInstrument: "procurement_financing",
        isBottleneck: false
      },
      {
        id: "node-3",
        name: "Garment Assembly Hub",
        sectionIndex: "03",
        type: "ASSEMBLY",
        tier: 3,
        cost: 310000.0,
        baseLeadTimeDays: 10.0,
        delayDays: 0,
        qualityScore: 97.0,
        interestRate: 7.25,
        ltvRatio: 0.80,
        assetState: "unfinanced",
        financingInstrument: "inventory_financing",
        isBottleneck: false
      },
      {
        id: "node-4",
        name: "Trans-Eurasian Rail Intermodal",
        sectionIndex: "04",
        type: "TRANSIT",
        tier: 3,
        cost: 34500.0,
        baseLeadTimeDays: 14.0,
        delayDays: 0,
        qualityScore: 96.5,
        interestRate: 7.20,
        ltvRatio: 0.82,
        assetState: "financed",
        financingInstrument: "asset_backed_lending",
        isBottleneck: false
      },
      {
        id: "node-5",
        name: "Customs & Port Terminal",
        sectionIndex: "05",
        type: "CUSTOMS",
        tier: 4,
        cost: 390000.0,
        baseLeadTimeDays: 3.0,
        delayDays: 0,
        qualityScore: 99.0,
        interestRate: 6.95,
        ltvRatio: 0.85,
        assetState: "unfinanced",
        financingInstrument: "customs_guarantee",
        isBottleneck: false
      },
      {
        id: "node-6",
        name: "Automated Logistics Hub",
        sectionIndex: "06",
        type: "WAREHOUSE",
        tier: 4,
        cost: 440000.0,
        baseLeadTimeDays: 5.0,
        delayDays: 0,
        qualityScore: 98.0,
        interestRate: 7.05,
        ltvRatio: 0.85,
        assetState: "unfinanced",
        financingInstrument: "warehouse_financing",
        isBottleneck: false
      },
      {
        id: "node-7",
        name: "Consumer Distribution Point",
        sectionIndex: "07",
        type: "DISTRIBUTION",
        tier: 5,
        cost: 520000.0,
        baseLeadTimeDays: 2.0,
        delayDays: 0,
        qualityScore: 99.5,
        interestRate: 6.80,
        ltvRatio: 0.90,
        assetState: "settled",
        financingInstrument: "invoice_factoring",
        isBottleneck: false
      }
    ];

    // Global Triangulation State
    this.triangulationState = {
      qualityScore: 96.5,    // 0 to 100%
      timeScore: 78.0,       // 0 to 100% Velocity Efficiency
      costScore: 82.0,       // 0 to 100% Cost Efficiency
      transitDays: 14.0,
      freightCost: 34500.0,
      carryingCost: 7460.0,
      totalCost: 41960.0,
      activePathway: "Trans-Eurasian Rail Intermodal",
      activeCrisis: null
    };

    this.initEventListeners();
    this.deferredRender();
  }

  initEventListeners() {
    window.addEventListener("resize", () => {
      this.render();
      this.renderRadar();
    });

    // Close modal on Escape key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeNodeModal();
      }
    });
  }

  deferredRender() {
    const doRender = () => {
      this.render();
      this.renderRadar();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", doRender);
    } else {
      doRender();
    }
    setTimeout(doRender, 80);
    setTimeout(doRender, 350);
  }

  setNodes(nodes) {
    if (Array.isArray(nodes) && nodes.length > 0) {
      this.nodes = nodes.map((n, i) => ({
        id: n.id || `node-${i + 1}`,
        name: n.name || `Section ${i + 1}`,
        sectionIndex: String(i + 1).padStart(2, "0"),
        type: (n.type || "STAGE").toUpperCase(),
        tier: n.tier || Math.min(5, Math.floor(i / 2) + 1),
        cost: Number(n.cost || n.loanAmount || 100000),
        baseLeadTimeDays: Number(n.baseLeadTimeDays || (n.delayDays > 0 ? n.delayDays + 4 : 5)),
        delayDays: Number(n.delayDays || 0),
        qualityScore: n.qualityScore || (n.supplierReliabilityScore ? Math.round(n.supplierReliabilityScore * 100) : (n.isBottleneck ? 82 : 96)),
        interestRate: Number(n.interestRate || 7.2),
        ltvRatio: Number(n.ltvRatio || 0.80),
        assetState: n.assetState || (i === 3 ? "financed" : i === 6 ? "settled" : "unfinanced"),
        financingInstrument: n.financingInstrument || "po_financing",
        isBottleneck: Boolean(n.isBottleneck || n.delayDays > 0)
      }));
    }
    this.render();
    this.renderRadar();
  }

  updateTriangulation(stateUpdates) {
    this.triangulationState = { ...this.triangulationState, ...stateUpdates };
    this.render();
    this.renderRadar();
  }

  render() {
    const svg = document.getElementById("graphSvg");
    if (!svg) return;

    svg.innerHTML = "";

    const totalNodes = this.nodes.length;
    if (totalNodes === 0) return;

    // ViewBox dimensions
    const svgWidth = 1100;
    const svgHeight = 280;
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.overflow = "visible";

    const paddingX = 55;
    const availableWidth = svgWidth - paddingX * 2 - this.nodeDimensions.width;
    const spacingX = totalNodes > 1 ? availableWidth / (totalNodes - 1) : 0;
    const centerY = svgHeight / 2;

    const gEdges = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gEdges.setAttribute("class", "graph-edges-layer");
    const gParticles = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gParticles.setAttribute("class", "graph-particles-layer");
    const gNodes = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gNodes.setAttribute("class", "graph-nodes-layer");

    svg.appendChild(gEdges);
    svg.appendChild(gParticles);
    svg.appendChild(gNodes);

    const nodePositions = [];

    this.nodes.forEach((n, idx) => {
      const waveOffset = (idx % 2 === 0 ? -1 : 1) * 20;
      const x = paddingX + idx * spacingX;
      const y = centerY + waveOffset;
      nodePositions.push({ x, y });
    });

    // 1. Draw Connecting Curved Bezier Edges perfectly originating/terminating at node centers
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const pPos = nodePositions[i];
      const cPos = nodePositions[i + 1];
      const isTargetShocked = this.nodes[i + 1].isBottleneck || this.nodes[i + 1].delayDays > 0;
      this.drawCurvedEdge(gEdges, gParticles, pPos, cPos, isTargetShocked);
    }

    // 2. Draw Minimal Floating Nodes with Hover Summary & Click Details Modal
    this.nodes.forEach((node, idx) => {
      const pos = nodePositions[idx];
      this.drawNode(gNodes, node, pos.x, pos.y, idx);
    });
  }

  drawCurvedEdge(gEdges, gParticles, pPos, cPos, isShocked) {
    // Exact center coordinates of 40x40 minimal nodes
    const x1 = pPos.x + this.nodeDimensions.width / 2;
    const y1 = pPos.y + this.nodeDimensions.height / 2;
    const x2 = cPos.x + this.nodeDimensions.width / 2;
    const y2 = cPos.y + this.nodeDimensions.height / 2;

    const dx = x2 - x1;
    const cx1 = x1 + dx * 0.45;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.55;
    const cy2 = y2;

    const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", isShocked ? "#ef4444" : "rgba(255, 255, 255, 0.3)");
    path.setAttribute("stroke-width", isShocked ? "2.2" : "1.5");
    path.setAttribute("stroke-dasharray", isShocked ? "4 4" : "none");
    path.setAttribute("class", `svg-edge ${isShocked ? "shocked-edge" : ""}`);
    gEdges.appendChild(path);

    // Animated Flow Particle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("r", isShocked ? "3.2" : "2.4");
    circle.setAttribute("fill", isShocked ? "#ef4444" : "#ffffff");
    circle.setAttribute("opacity", "0.9");
    circle.setAttribute("class", `flow-particle ${isShocked ? "shocked-particle" : ""}`);

    const animMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
    animMotion.setAttribute("path", pathData);
    animMotion.setAttribute("dur", isShocked ? "1.6s" : "2.4s");
    animMotion.setAttribute("repeatCount", "indefinite");

    circle.appendChild(animMotion);
    gParticles.appendChild(circle);
  }

  drawNode(gNodes, node, x, y, idx) {
    const isSelected = this.selectedNodeId === node.id;
    const isBottleneck = node.isBottleneck || node.delayDays > 0;
    const isFinanced = node.assetState === "financed";
    const isSettled = node.assetState === "settled";

    // Primary State Color
    let stateColor = "#ffffff";
    let stateFill = "rgba(255, 255, 255, 0.15)";
    if (isBottleneck) {
      stateColor = "#ef4444";
      stateFill = "rgba(239, 68, 68, 0.3)";
    } else if (isFinanced) {
      stateColor = "#10b981";
      stateFill = "rgba(16, 185, 129, 0.25)";
    } else if (isSettled) {
      stateColor = "#9ca3af";
      stateFill = "rgba(156, 163, 175, 0.15)";
    }

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", `svg-node-minimal ${isBottleneck ? "bottleneck" : ""} ${isSelected ? "selected" : ""}`);
    g.setAttribute("transform", `translate(${x}, ${y})`);
    g.style.cursor = "pointer";
    g.style.animationDelay = `${(idx * 0.22).toFixed(2)}s`;

    // 1. BASE SLEEK MINIMAL SHAPE (Glowing Circle / Diamond)
    const cx = this.nodeDimensions.width / 2; // 20
    const cy = this.nodeDimensions.height / 2; // 20

    // Pulsing Outer Halo
    const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    halo.setAttribute("cx", cx);
    halo.setAttribute("cy", cy);
    halo.setAttribute("r", "17");
    halo.setAttribute("fill", stateFill);
    halo.setAttribute("stroke", stateColor);
    halo.setAttribute("stroke-width", "1");
    halo.setAttribute("stroke-opacity", "0.6");
    halo.setAttribute("class", "minimal-node-halo");
    g.appendChild(halo);

    // Inner Glowing Core
    const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    core.setAttribute("cx", cx);
    core.setAttribute("cy", cy);
    core.setAttribute("r", "10");
    core.setAttribute("fill", "#0c0c10");
    core.setAttribute("stroke", stateColor);
    core.setAttribute("stroke-width", isSelected ? "2.2" : "1.6");
    core.setAttribute("class", "minimal-node-core");
    g.appendChild(core);

    // Center Dot / Diamond
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", cy);
    dot.setAttribute("r", "3.5");
    dot.setAttribute("fill", stateColor);
    g.appendChild(dot);

    // Monospace Section Index Label Below Node
    const indexLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    indexLabel.setAttribute("x", cx);
    indexLabel.setAttribute("y", cy + 26);
    indexLabel.setAttribute("fill", stateColor);
    indexLabel.setAttribute("font-size", "9");
    indexLabel.setAttribute("font-weight", "600");
    indexLabel.setAttribute("letter-spacing", "1");
    indexLabel.setAttribute("font-family", "var(--font-mono, monospace)");
    indexLabel.setAttribute("text-anchor", "middle");
    indexLabel.textContent = node.sectionIndex;
    g.appendChild(indexLabel);

    // Hover Event Listeners (Triggers dynamic preview in the right Node Inspector)
    g.addEventListener("mouseenter", () => {
      halo.setAttribute("r", "22");
      halo.setAttribute("stroke-opacity", "1");
      core.setAttribute("stroke-width", "2.6");
      if (typeof window.onNodePreview === "function") {
        window.onNodePreview(node);
      }
    });

    g.addEventListener("mouseleave", () => {
      if (this.selectedNodeId !== node.id) {
        halo.setAttribute("r", "17");
        halo.setAttribute("stroke-opacity", "0.6");
        core.setAttribute("stroke-width", "1.6");
      }
      if (typeof window.onNodePreviewEnd === "function") {
        window.onNodePreviewEnd();
      }
    });

    // Click Event Listener: Permanently select & lock node in right Node Inspector
    g.addEventListener("click", () => {
      this.selectedNodeId = node.id;
      this.render();
      if (typeof window.onNodeSelected === "function") {
        window.onNodeSelected(node);
      }
      if (typeof this.onNodeClick === "function") {
        this.onNodeClick(node);
      }
    });

    gNodes.appendChild(g);
  }

  openNodeModal(node) {
    this.activeModalNode = node;
    const modal = document.getElementById("nodeDetailsModal");
    if (!modal) return;

    const modalSectionBadge = document.getElementById("modalSectionBadge");
    const modalStateBadge = document.getElementById("modalStateBadge");
    const modalNodeName = document.getElementById("modalNodeName");
    const modalLeadTime = document.getElementById("modalLeadTime");
    const modalDelay = document.getElementById("modalDelay");
    const modalQuality = document.getElementById("modalQuality");
    const modalBottleneck = document.getElementById("modalBottleneck");
    const modalCost = document.getElementById("modalCost");
    const modalRate = document.getElementById("modalRate");
    const modalLtv = document.getElementById("modalLtv");
    const modalInstrument = document.getElementById("modalInstrument");
    const modalActionBtn = document.getElementById("modalActionBtn");

    if (modalSectionBadge) modalSectionBadge.textContent = `SECTION ${node.sectionIndex} // ${node.type}`;
    if (modalNodeName) modalNodeName.textContent = node.name.toUpperCase();
    
    if (modalStateBadge) {
      modalStateBadge.textContent = (node.assetState || "NOMINAL").toUpperCase();
      if (node.isBottleneck || node.delayDays > 0) {
        modalStateBadge.style.color = "#ef4444";
        modalStateBadge.style.borderColor = "rgba(239, 68, 68, 0.4)";
      } else if (node.assetState === "financed") {
        modalStateBadge.style.color = "#10b981";
        modalStateBadge.style.borderColor = "rgba(16, 185, 129, 0.4)";
      } else if (node.assetState === "settled") {
        modalStateBadge.style.color = "#9ca3af";
        modalStateBadge.style.borderColor = "rgba(156, 163, 175, 0.4)";
      } else {
        modalStateBadge.style.color = "#ffffff";
        modalStateBadge.style.borderColor = "rgba(255, 255, 255, 0.4)";
      }
    }

    if (modalLeadTime) modalLeadTime.textContent = `${node.baseLeadTimeDays} DAYS`;
    if (modalDelay) {
      modalDelay.textContent = node.delayDays > 0 ? `+${node.delayDays} DAYS DELAY` : "0 DAYS (ON SCHEDULE)";
      modalDelay.style.color = node.delayDays > 0 ? "#ef4444" : "#10b981";
    }
    if (modalQuality) modalQuality.textContent = `${node.qualityScore.toFixed(1)}%`;
    if (modalBottleneck) {
      modalBottleneck.textContent = node.isBottleneck || node.delayDays > 0 ? "CHOKEPOINT ALERT" : "NOMINAL FLOW (NO)";
      modalBottleneck.style.color = node.isBottleneck || node.delayDays > 0 ? "#ef4444" : "#10b981";
    }

    if (modalCost) modalCost.textContent = `$${Math.round(node.cost).toLocaleString()}`;
    if (modalRate) modalRate.textContent = `${node.interestRate.toFixed(2)}% APR`;
    if (modalLtv) modalLtv.textContent = `${Math.round(node.ltvRatio * 100)}% ($${Math.round(node.cost * node.ltvRatio).toLocaleString()})`;
    if (modalInstrument) modalInstrument.textContent = (node.financingInstrument || "TRADE CREDIT").toUpperCase();

    if (modalActionBtn) {
      if (node.assetState === "financed") {
        modalActionBtn.textContent = "SETTLE FACILITY LIEN";
        modalActionBtn.onclick = () => window.settleCurrentModalNode();
      } else {
        modalActionBtn.textContent = "FINANCE FACILITY";
        modalActionBtn.onclick = () => window.financeCurrentModalNode();
      }
    }

    modal.classList.remove("hidden");
  }

  closeNodeModal() {
    const modal = document.getElementById("nodeDetailsModal");
    if (modal) modal.classList.add("hidden");
    this.activeModalNode = null;
  }

  renderRadar() {
    const radar = document.getElementById(this.radarSvgId || "radarSvg");
    if (!radar) return;

    radar.innerHTML = "";

    const size = 260;
    const cx = size / 2;
    const cy = size / 2;
    const r = 85;

    radar.setAttribute("viewBox", `0 0 ${size} ${size}`);

    // Concentric Level Grids (25%, 50%, 75%, 100%)
    [0.25, 0.5, 0.75, 1.0].forEach((scale) => {
      const gridPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const p1 = this.getTrianglePoint(cx, cy, r * scale, 0);       // Top (Quality)
      const p2 = this.getTrianglePoint(cx, cy, r * scale, 120);     // Bottom Right (Cost)
      const p3 = this.getTrianglePoint(cx, cy, r * scale, 240);     // Bottom Left (Time Velocity)
      gridPoly.setAttribute("points", `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`);
      gridPoly.setAttribute("fill", scale === 1.0 ? "rgba(255, 255, 255, 0.02)" : "none");
      gridPoly.setAttribute("stroke", "rgba(255, 255, 255, 0.14)");
      gridPoly.setAttribute("stroke-width", "1");
      radar.appendChild(gridPoly);
    });

    // 3 Axis Lines
    [0, 120, 240].forEach((angle) => {
      const p = this.getTrianglePoint(cx, cy, r, angle);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx);
      line.setAttribute("y1", cy);
      line.setAttribute("x2", p.x);
      line.setAttribute("y2", p.y);
      line.setAttribute("stroke", "rgba(255, 255, 255, 0.18)");
      line.setAttribute("stroke-dasharray", "2 2");
      radar.appendChild(line);
    });

    // Labels
    this.drawRadarLabel(radar, cx, cy - r - 12, "QUALITY RETENTION", "#10b981", `${this.triangulationState.qualityScore.toFixed(1)}%`);
    this.drawRadarLabel(radar, cx + r + 26, cy + (r * 0.55), "COST EFFICIENCY", "#f59e0b", `${Math.round(this.triangulationState.costScore)}%`);
    this.drawRadarLabel(radar, cx - r - 26, cy + (r * 0.55), "TRANSIT VELOCITY", "#38bdf8", `${Math.round(this.triangulationState.timeScore)}%`);

    // Live Dynamic Data Polygon
    const qNorm = Math.max(0.2, Math.min(1.0, this.triangulationState.qualityScore / 100));
    const cNorm = Math.max(0.2, Math.min(1.0, this.triangulationState.costScore / 100));
    const tNorm = Math.max(0.2, Math.min(1.0, this.triangulationState.timeScore / 100));

    const ptQuality = this.getTrianglePoint(cx, cy, r * qNorm, 0);
    const ptCost = this.getTrianglePoint(cx, cy, r * cNorm, 120);
    const ptTime = this.getTrianglePoint(cx, cy, r * tNorm, 240);

    const dataPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    dataPoly.setAttribute("points", `${ptQuality.x},${ptQuality.y} ${ptCost.x},${ptCost.y} ${ptTime.x},${ptTime.y}`);
    dataPoly.setAttribute("fill", "rgba(16, 185, 129, 0.22)");
    dataPoly.setAttribute("stroke", "#10b981");
    dataPoly.setAttribute("stroke-width", "2.0");
    radar.appendChild(dataPoly);

    // Vertex dots
    [ptQuality, ptCost, ptTime].forEach((pt) => {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
      dot.setAttribute("r", "3.5");
      dot.setAttribute("fill", "#ffffff");
      dot.setAttribute("stroke", "#10b981");
      dot.setAttribute("stroke-width", "1.5");
      radar.appendChild(dot);
    });

    // Synchronize HTML Labels
    const qEl = document.getElementById("radarQualityLabel");
    const tEl = document.getElementById("radarTimeLabel");
    const cEl = document.getElementById("radarCostLabel");
    if (qEl) qEl.textContent = `${this.triangulationState.qualityScore.toFixed(1)}%`;
    if (tEl) tEl.textContent = `${Math.round(this.triangulationState.timeScore)}% (${this.triangulationState.transitDays}d)`;
    if (cEl) cEl.textContent = `${Math.round(this.triangulationState.costScore)}% ($${(this.triangulationState.totalCost / 1000).toFixed(1)}k)`;
  }

  getTrianglePoint(cx, cy, radius, angleDeg) {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad)
    };
  }

  drawRadarLabel(radar, x, y, title, color, val) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${x}, ${y})`);
    g.setAttribute("text-anchor", "middle");

    const t1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t1.setAttribute("fill", color);
    t1.setAttribute("font-size", "8.5");
    t1.setAttribute("font-weight", "600");
    t1.setAttribute("letter-spacing", "1");
    t1.setAttribute("font-family", "var(--font-mono, monospace)");
    t1.textContent = title;
    g.appendChild(t1);

    const t2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t2.setAttribute("y", "12");
    t2.setAttribute("fill", "#ffffff");
    t2.setAttribute("font-size", "10");
    t2.setAttribute("font-weight", "500");
    t2.setAttribute("font-family", "var(--font-mono, monospace)");
    t2.textContent = val;
    g.appendChild(t2);

    radar.appendChild(g);
  }
}

// Global modal helper functions
window.closeNodeDetailsModal = function () {
  if (window.graphInstance) {
    window.graphInstance.closeNodeModal();
  } else {
    const m = document.getElementById("nodeDetailsModal");
    if (m) m.classList.add("hidden");
  }
};

window.financeCurrentModalNode = function () {
  if (window.graphInstance && window.graphInstance.activeModalNode) {
    const node = window.graphInstance.activeModalNode;
    if (typeof window.financeNode === "function") {
      window.financeNode(node.id);
    } else {
      node.assetState = "financed";
      window.graphInstance.render();
      window.graphInstance.openNodeModal(node);
    }
  }
};

window.settleCurrentModalNode = function () {
  if (window.graphInstance && window.graphInstance.activeModalNode) {
    const node = window.graphInstance.activeModalNode;
    if (typeof window.settleNode === "function") {
      window.settleNode(node.id);
    } else {
      node.assetState = "settled";
      window.graphInstance.render();
      window.graphInstance.openNodeModal(node);
    }
  }
};

// Global Export
window.SupplyChainTriangulationGraph = SupplyChainTriangulationGraph;
window.SupplyChainGraph = SupplyChainTriangulationGraph;
