/**
 * NODE-X-LOGISTICS — BACKGROUND CONTROLLERS
 * 1. Global 3D Animated VANTA.NET Background across all platform pages (#siteBg).
 * 2. Ultra-Smooth 60FPS Physics Dotted Grid in the Supply Flow Node Sector (#supplyFlowDotBg).
 */

(function () {
  // =========================================================================
  // 1. GLOBAL 3D VANTA.NET ANIMATION (ALL WEBPAGES)
  // =========================================================================
  function initGlobalVanta() {
    const bgEl = document.getElementById("siteBg");
    if (!bgEl) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      console.info("[Background] prefers-reduced-motion active. Using static dark canvas.");
      return;
    }

    if (window.vantaEffect) return;

    function tryInit() {
      try {
        if (window.VANTA && window.VANTA.NET && window.THREE) {
          window.vantaEffect = window.VANTA.NET({
            el: "#siteBg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0xffffff,
            backgroundColor: 0x000000,
            points: 11.00,
            maxDistance: 22.00,
            spacing: 16.00,
            showDots: true
          });
          console.info("[Background] 3D VANTA.NET initialized successfully on #siteBg.");
          return true;
        }
      } catch (err) {
        console.warn("[Background] Vanta initialization error:", err);
      }
      return false;
    }

    if (!tryInit()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (tryInit() || attempts >= 15) {
          clearInterval(interval);
        }
      }, 150);
    }
  }

  // =========================================================================
  // 2. ULTRA-SMOOTH SPRING-PHYSICS DOTGRID (SUPPLY FLOW REGION)
  // =========================================================================
  function hexToRgb(hex) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 55, g: 55, b: 65 };
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16)
    };
  }

  class UltraSmoothSupplyFlowDotGrid {
    constructor(container, options = {}) {
      this.container = typeof container === "string" ? document.querySelector(container) : container;
      if (!this.container) return;

      this.dotSize = options.dotSize || 5;
      this.gap = options.gap || 18;
      this.baseColor = options.baseColor || "#383844";
      this.activeColor = options.activeColor || "#ffffff";
      this.proximity = options.proximity || 110;
      this.shockRadius = options.shockRadius || 180;
      this.shockStrength = options.shockStrength || 6;

      this.baseRgb = hexToRgb(this.baseColor);
      this.activeRgb = hexToRgb(this.activeColor);

      this.dots = [];
      this.pointer = { x: -9999, y: -9999 };
      this.animId = null;

      this.init();
    }

    init() {
      this.container.innerHTML = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "dot-grid__wrap";
      this.wrap.style.cssText = "width:100%;height:100%;position:absolute;inset:0;overflow:hidden;";

      this.canvas = document.createElement("canvas");
      this.canvas.className = "dot-grid__canvas";
      this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";

      this.wrap.appendChild(this.canvas);
      this.container.appendChild(this.wrap);

      this.ctx = this.canvas.getContext("2d");

      this.circlePath = new Path2D();
      this.circlePath.arc(0, 0, this.dotSize / 2, 0, Math.PI * 2);

      this.buildGrid();
      this.bindEvents();
      this.startRenderLoop();
    }

    buildGrid() {
      const rect = this.container.getBoundingClientRect();
      const width = Math.max(200, Math.floor(rect.width || this.container.clientWidth || 800));
      const height = Math.max(100, Math.floor(rect.height || this.container.clientHeight || 280));
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      this.width = width;
      this.height = height;

      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);
      this.canvas.style.width = width + "px";
      this.canvas.style.height = height + "px";

      if (this.ctx) {
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const cell = this.dotSize + this.gap;
      const cols = Math.floor((width + this.gap) / cell);
      const rows = Math.floor((height + this.gap) / cell);

      const gridW = cell * cols - this.gap;
      const gridH = cell * rows - this.gap;

      const extraX = width - gridW;
      const extraY = height - gridH;

      const startX = extraX / 2 + this.dotSize / 2;
      const startY = extraY / 2 + this.dotSize / 2;

      this.dots = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          this.dots.push({
            cx: startX + x * cell,
            cy: startY + y * cell,
            xOffset: 0,
            yOffset: 0,
            vx: 0,
            vy: 0
          });
        }
      }
    }

    bindEvents() {
      const targetEl = this.container.closest(".graph-viewport-wrap") || this.container;

      window.addEventListener("resize", () => this.buildGrid());

      targetEl.addEventListener("mousemove", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.pointer.x = e.clientX - rect.left;
        this.pointer.y = e.clientY - rect.top;

        const px = this.pointer.x;
        const py = this.pointer.y;

        for (let i = 0; i < this.dots.length; i++) {
          const dot = this.dots[i];
          const dx = dot.cx - px;
          const dy = dot.cy - py;
          const dist = Math.hypot(dx, dy);

          if (dist < this.proximity && dist > 0.01) {
            const force = (1 - dist / this.proximity) * 2.8;
            dot.vx += (dx / dist) * force;
            dot.vy += (dy / dist) * force;
          }
        }
      }, { passive: true });

      targetEl.addEventListener("mouseleave", () => {
        this.pointer.x = -9999;
        this.pointer.y = -9999;
      });

      targetEl.addEventListener("click", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        for (let i = 0; i < this.dots.length; i++) {
          const dot = this.dots[i];
          const dx = dot.cx - cx;
          const dy = dot.cy - cy;
          const dist = Math.hypot(dx, dy);

          if (dist < this.shockRadius && dist > 0.01) {
            const force = (1 - dist / this.shockRadius) * this.shockStrength;
            dot.vx += (dx / dist) * force;
            dot.vy += (dy / dist) * force;
          }
        }
      });
    }

    startRenderLoop() {
      const proxSq = this.proximity * this.proximity;
      const spring = 0.08;
      const damping = 0.86;

      const render = () => {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        const px = this.pointer.x;
        const py = this.pointer.y;

        for (let i = 0; i < this.dots.length; i++) {
          const dot = this.dots[i];

          // 1. Spring physics integration (smooth return, zero glitching)
          dot.vx += (0 - dot.xOffset) * spring;
          dot.vy += (0 - dot.yOffset) * spring;
          dot.vx *= damping;
          dot.vy *= damping;
          dot.xOffset += dot.vx;
          dot.yOffset += dot.vy;

          const drawX = dot.cx + dot.xOffset;
          const drawY = dot.cy + dot.yOffset;

          // 2. Dynamic proximity glow
          const dx = dot.cx - px;
          const dy = dot.cy - py;
          const dsq = dx * dx + dy * dy;

          let fillStyle = this.baseColor;
          if (dsq <= proxSq) {
            const dist = Math.sqrt(dsq);
            const t = 1 - dist / this.proximity;
            const r = Math.round(this.baseRgb.r + (this.activeRgb.r - this.baseRgb.r) * t);
            const g = Math.round(this.baseRgb.g + (this.activeRgb.g - this.baseRgb.g) * t);
            const b = Math.round(this.baseRgb.b + (this.activeRgb.b - this.baseRgb.b) * t);
            fillStyle = `rgb(${r},${g},${b})`;
          }

          this.ctx.save();
          this.ctx.translate(drawX, drawY);
          this.ctx.fillStyle = fillStyle;
          this.ctx.fill(this.circlePath);
          this.ctx.restore();
        }

        this.animId = requestAnimationFrame(render);
      };

      if (this.animId) cancelAnimationFrame(this.animId);
      this.animId = requestAnimationFrame(render);
    }
  }

  function initSupplyFlowDotGrid() {
    const supplyFlowDotBg = document.getElementById("supplyFlowDotBg");
    if (supplyFlowDotBg && !window.supplyFlowDotGridInstance) {
      window.supplyFlowDotGridInstance = new UltraSmoothSupplyFlowDotGrid(supplyFlowDotBg, {
        dotSize: 5,
        gap: 18,
        baseColor: "#32323c",
        activeColor: "#ffffff",
        proximity: 110,
        shockRadius: 180,
        shockStrength: 6.5
      });
      console.info("[Background] Ultra-smooth Physics DotGrid initialized on Supply Flow Region.");
    }
  }

  // =========================================================================
  // 3. ULTRA-SMOOTH LIGHTWEIGHT SCROLL ELEVATION CONTROLLER (ALL WEBPAGES)
  // =========================================================================
  function initScrollElevation() {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const TARGET_SELECTORS = [
      ".section-header-wrap",
      ".pathway-deck-header",
      ".step-row",
      ".quad-col",
      ".feature-card",
      ".reasoning-card",
      ".avoided-zones-card",
      ".route-kpi-cell",
      ".route-trail-section",
      ".preset-shocks-strip",
      ".hero-title-group",
      ".hero-summary-card",
      ".metric-card",
      ".pillar-card",
      ".spec-card",
      ".stack-inspiration-inner",
      ".problem-hero-wrap",
      ".problem-hero-title",
      ".problem-hero-lead",
      ".problem-card",
      ".market-grid",
      ".formula-card",
      ".about-hero-section",
      ".about-card",
      ".footer-columns > div",
      ".footer-legal-row"
    ];

    const elements = document.querySelectorAll(TARGET_SELECTORS.join(", "));
    if (!elements || elements.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.08
    });

    elements.forEach((el) => {
      // Do not attach to maps, controls, interactive inputs or Leaflet components
      if (
        el.closest(".map-viewport") ||
        el.closest("#worldMapContainer") ||
        el.closest(".leaflet-container") ||
        el.tagName === "INPUT" ||
        el.tagName === "SELECT" ||
        el.tagName === "BUTTON"
      ) {
        return;
      }
      el.classList.add("scroll-elevate");
      observer.observe(el);
    });
  }

  function initializeAll() {
    initGlobalVanta();
    initSupplyFlowDotGrid();
    initScrollElevation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAll);
  } else {
    initializeAll();
  }
  window.addEventListener("load", initializeAll);

  window.initBackgroundAnimation = initGlobalVanta;
  window.initSupplyFlowDotGrid = initSupplyFlowDotGrid;
  window.initScrollElevation = initScrollElevation;
})();
