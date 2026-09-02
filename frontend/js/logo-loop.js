/**
 * TechieMechie & Node-X-Logistics — LogoLoop Engine (React Bits Port)
 * Continuous infinite ticker with smooth sub-pixel velocity physics,
 * exponential tau easing, ResizeObserver dynamic copy budgeting, hover deceleration,
 * and seamless dual-sector tab switching (TECH vs COMPANIES).
 */

class VanillaLogoLoop {
  constructor(container, options = {}) {
    this.container = typeof container === "string" ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = Object.assign(
      {
        logos: [],
        speed: 80,
        direction: "left",
        width: "100%",
        logoHeight: 32,
        gap: 36,
        pauseOnHover: true,
        hoverSpeed: 0,
        fadeOut: true,
        fadeOutColor: "#000000",
        scaleOnHover: true,
        ariaLabel: "Technologies and partner logos ticker"
      },
      options
    );

    this.SMOOTH_TAU = 0.25;
    this.MIN_COPIES = 2;
    this.COPY_HEADROOM = 2;

    this.offset = 0;
    this.velocity = 0;
    this.lastTimestamp = null;
    this.rafId = null;
    this.isHovered = false;
    this.seqWidth = 0;
    this.copyCount = this.MIN_COPIES;

    this.init();
  }

  init() {
    this.isVertical = this.options.direction === "up" || this.options.direction === "down";
    const magnitude = Math.abs(this.options.speed);
    const dirMultiplier = this.options.direction === "left" || this.options.direction === "up" ? 1 : -1;
    this.targetVelocity = magnitude * dirMultiplier;

    this.effectiveHoverSpeed =
      this.options.hoverSpeed !== undefined
        ? this.options.hoverSpeed
        : this.options.pauseOnHover
        ? 0
        : undefined;

    // Root element setup
    this.root = document.createElement("div");
    this.root.className = [
      "logoloop",
      this.isVertical ? "logoloop--vertical" : "logoloop--horizontal",
      this.options.fadeOut ? "logoloop--fade" : "",
      this.options.scaleOnHover ? "logoloop--scale-hover" : ""
    ]
      .filter(Boolean)
      .join(" ");

    this.root.setAttribute("role", "region");
    this.root.setAttribute("aria-label", this.options.ariaLabel);
    this.root.style.setProperty("--logoloop-gap", `${this.options.gap}px`);
    this.root.style.setProperty("--logoloop-logoHeight", `${this.options.logoHeight}px`);
    if (this.options.fadeOutColor) {
      this.root.style.setProperty("--logoloop-fadeColor", this.options.fadeOutColor);
    }
    if (this.options.width) {
      this.root.style.width = typeof this.options.width === "number" ? `${this.options.width}px` : this.options.width;
    }

    // Track
    this.track = document.createElement("div");
    this.track.className = "logoloop__track";

    // Initial sequence list
    this.seqList = this.createLogoList(0);
    this.track.appendChild(this.seqList);
    this.root.appendChild(this.track);

    this.container.innerHTML = "";
    this.container.appendChild(this.root);

    // Event listeners
    if (this.effectiveHoverSpeed !== undefined) {
      this.track.addEventListener("mouseenter", () => {
        this.isHovered = true;
      });
      this.track.addEventListener("mouseleave", () => {
        this.isHovered = false;
      });
    }

    // Measure & calculate copies
    this.updateDimensions();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
      this.resizeObserver.observe(this.root);
      this.resizeObserver.observe(this.seqList);
    } else {
      window.addEventListener("resize", () => this.updateDimensions());
    }

    // Start RAF loop
    this.startAnimation();
  }

  resolveAssetUrl(src) {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) return src;
    if (src.startsWith("/")) return src;
    // Normalize relative paths
    const clean = src.replace(/^\.\//, "");
    return "/" + clean;
  }

  createLogoList(copyIndex) {
    const ul = document.createElement("ul");
    ul.className = "logoloop__list";
    ul.setAttribute("role", "list");
    if (copyIndex > 0) {
      ul.setAttribute("aria-hidden", "true");
    }

    this.options.logos.forEach(item => {
      const li = document.createElement("li");
      li.className = "logoloop__item";
      li.setAttribute("role", "listitem");

      let contentEl;
      if (item.node) {
        if (typeof item.node === "string") {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = item.node.trim();
          contentEl = wrapper.firstElementChild || wrapper;
        } else if (item.node instanceof HTMLElement) {
          contentEl = item.node.cloneNode(true);
        }
      } else if (item.src) {
        const chip = document.createElement("div");
        chip.className = "stack-logo-chip";
        chip.setAttribute("title", item.title || item.alt || "");
        
        const img = document.createElement("img");
        img.className = "stack-logo-img";
        img.src = this.resolveAssetUrl(item.src);
        img.alt = item.alt || item.title || "";
        img.title = item.title || "";
        img.loading = "eager";
        img.draggable = false;
        chip.appendChild(img);

        contentEl = chip;
      }

      if (item.href && contentEl) {
        const link = document.createElement("a");
        link.className = "logoloop__link";
        link.href = item.href;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        link.setAttribute("aria-label", item.title || item.alt || "link");
        link.appendChild(contentEl);
        li.appendChild(link);
      } else if (contentEl) {
        li.appendChild(contentEl);
      }

      ul.appendChild(li);
    });

    return ul;
  }

  updateDimensions() {
    const containerWidth = this.root.clientWidth || this.container.clientWidth || 1200;
    const rect = this.seqList.getBoundingClientRect();
    const sequenceWidth = rect.width || 0;

    if (sequenceWidth > 0) {
      this.seqWidth = Math.ceil(sequenceWidth);
      const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + this.COPY_HEADROOM;
      const targetCopies = Math.max(this.MIN_COPIES, copiesNeeded);

      if (targetCopies !== this.copyCount) {
        this.copyCount = targetCopies;
        this.rebuildCopies();
      }
    }
  }

  rebuildCopies() {
    this.track.innerHTML = "";
    this.seqList = this.createLogoList(0);
    this.track.appendChild(this.seqList);

    for (let i = 1; i < this.copyCount; i++) {
      this.track.appendChild(this.createLogoList(i));
    }
  }

  setLogos(newLogos, ariaLabel) {
    this.options.logos = newLogos;
    if (ariaLabel) {
      this.options.ariaLabel = ariaLabel;
      this.root.setAttribute("aria-label", ariaLabel);
    }
    this.offset = 0;
    this.rebuildCopies();
    this.updateDimensions();
  }

  startAnimation() {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      this.track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const animate = timestamp => {
      if (this.lastTimestamp === null) {
        this.lastTimestamp = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      const target = this.isHovered && this.effectiveHoverSpeed !== undefined ? this.effectiveHoverSpeed : this.targetVelocity;

      const easingFactor = 1 - Math.exp(-deltaTime / this.SMOOTH_TAU);
      this.velocity += (target - this.velocity) * easingFactor;

      if (this.seqWidth > 0) {
        let nextOffset = this.offset + this.velocity * deltaTime;
        nextOffset = ((nextOffset % this.seqWidth) + this.seqWidth) % this.seqWidth;
        this.offset = nextOffset;

        this.track.style.transform = `translate3d(${-this.offset}px, 0, 0)`;
      }

      this.rafId = requestAnimationFrame(animate);
    };

    this.rafId = requestAnimationFrame(animate);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// ==============================================================================
// SECTOR DATASETS (TECH vs COMPANIES) — FULL INLINE VECTOR EMBEDS
// ==============================================================================

const TECH_LOGOS = [
  {
    title: "ChatGPT",
    alt: "ChatGPT",
    src: "/assets/tech/chatgpt.svg",
    href: "https://chatgpt.com/"
  },
  {
    title: "Claude",
    alt: "Claude",
    src: "/assets/tech/claude.svg",
    href: "https://claude.ai/"
  },
  {
    title: "Antigravity",
    alt: "Antigravity",
    src: "/assets/tech/antigravity.svg",
    href: "https://github.com/google/antigravity"
  },
  {
    title: "ElevenLabs",
    alt: "ElevenLabs",
    src: "/assets/tech/elevenlabs.svg",
    href: "https://elevenlabs.io/"
  },
  {
    title: "Google Gemini",
    alt: "Google Gemini",
    src: "/assets/tech/gemini.svg",
    href: "https://gemini.google.com/"
  },
  {
    title: "GitHub",
    alt: "GitHub",
    src: "/assets/tech/github.svg",
    href: "https://github.com/"
  },
  {
    title: "React",
    alt: "React",
    src: "/assets/tech/react.svg",
    href: "https://react.dev/"
  },
  {
    title: "Vite",
    alt: "Vite",
    src: "/assets/tech/vite.svg",
    href: "https://vite.dev/"
  },
  {
    title: "Three.js",
    alt: "Three.js",
    src: "/assets/tech/threejs.svg",
    href: "https://threejs.org/"
  },
  {
    title: "FastAPI / Python",
    alt: "FastAPI / Python",
    src: "/assets/tech/python.svg",
    href: "https://fastapi.tiangolo.com/"
  },
  {
    title: "TypeScript",
    alt: "TypeScript",
    src: "/assets/tech/typescript.svg",
    href: "https://www.typescriptlang.org/"
  }
];

const COMPANY_LOGOS = [
  {
    title: "Classic Shipping",
    alt: "Classic Shipping Co.",
    node: `<div class="stack-logo-chip" title="Classic Shipping Co."><span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 1px; display: flex; align-items: center; gap: 6px;">⚓ CLASSIC SHIPPING</span></div>`,
    href: "https://www.classicshipping.in/index.php"
  },
  {
    title: "J.P. Morgan",
    alt: "J.P. Morgan",
    node: `<div class="stack-logo-chip" title="J.P. Morgan"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 36" style="width: 110px; height: 26px;" fill="none"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="'Times New Roman', Georgia, serif" font-size="20" font-weight="bold" letter-spacing="1">J.P. Morgan</text></svg></div>`,
    href: "https://www.jpmorgan.com/"
  },
  {
    title: "Apple",
    alt: "Apple",
    node: `<div class="stack-logo-chip" title="Apple"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" style="width: 24px; height: 24px;" fill="#FFFFFF"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.35.24-10.31-1.93-14.87-6.52-3.34-3.16-7.3-8.03-11.87-14.61s-8.4-14.48-11.48-23.72c-3.08-9.23-4.62-18.24-4.62-27.02 0-11.75 3.03-21.67 9.09-29.76 6.06-8.08 13.78-12.24 23.16-12.48 4.82-.12 10.03 1.15 15.63 3.81 5.6 2.66 9.38 4.05 11.34 4.17 1.57-.24 5.66-1.78 12.28-4.63 6.62-2.85 12.39-3.99 17.3-3.41 12.44 1.25 21.94 6.23 28.51 14.94-10.96 6.64-16.32 15.65-16.08 27.02.24 8.79 3.63 16.08 10.18 21.87 6.55 5.79 14.28 9.01 23.19 9.67-1.92 5.86-4.22 11.73-6.9 17.61zM119.22 31.02c0-7.39 2.66-14.29 7.97-20.7 5.31-6.41 11.75-10.32 19.32-11.73.48 1.45.72 2.91.72 4.39 0 7.39-2.73 14.39-8.19 21.01-5.46 6.62-12.06 10.51-19.82 11.66z"/></svg></div>`,
    href: "https://www.apple.com/"
  },
  {
    title: "Maersk",
    alt: "Maersk",
    node: `<div class="stack-logo-chip" title="Maersk"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 36" style="width: 100px; height: 26px;" fill="none"><rect x="2" y="3" width="30" height="30" rx="3" fill="#42B0D5"/><polygon points="17,8 19.5,13.5 25.5,12.5 22,17.5 25,23 19,21.5 17,27 15,21.5 9,23 12,17.5 8.5,12.5 14.5,13.5" fill="#FFFFFF"/><text x="40" y="24" fill="#FFFFFF" font-family="'Arial Black', sans-serif" font-size="14" font-weight="900" letter-spacing="1.5">MAERSK</text></svg></div>`,
    href: "https://www.maersk.com/"
  },
  {
    title: "FedEx",
    alt: "FedEx",
    node: `<div class="stack-logo-chip" title="FedEx"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 36" style="width: 80px; height: 26px;" fill="none"><text x="5" y="26" fill="#8b5cf6" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" letter-spacing="-1">Fed</text><text x="52" y="26" fill="#FF6600" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" letter-spacing="-1">Ex</text></svg></div>`,
    href: "https://www.fedex.com/"
  },
  {
    title: "MSC",
    alt: "MSC",
    node: `<div class="stack-logo-chip" title="MSC"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 36" style="width: 85px; height: 26px;" fill="none"><text x="6" y="26" fill="#FFFFFF" font-family="'Arial Black', sans-serif" font-size="20" font-weight="900" letter-spacing="2">msc</text><circle cx="85" cy="18" r="11" stroke="#FDB913" stroke-width="2" fill="none"/><path d="M78 18 Q85 11 92 18 Q85 25 78 18" fill="#FDB913"/><line x1="85" y1="5" x2="85" y2="31" stroke="#FDB913" stroke-width="1.5"/></svg></div>`,
    href: "https://www.msc.com/"
  },
  {
    title: "Citi",
    alt: "Citi",
    node: `<div class="stack-logo-chip" title="Citi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 36" style="width: 70px; height: 26px;" fill="none"><path d="M32 14 C40 5 58 5 66 14" stroke="#ED1C24" stroke-width="3.5" stroke-linecap="round" fill="none"/><text x="50%" y="27" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="'Arial', sans-serif" font-size="20" font-weight="700">citi</text></svg></div>`,
    href: "https://www.citi.com/"
  },
  {
    title: "Standard Chartered",
    alt: "Standard Chartered",
    node: `<div class="stack-logo-chip" title="Standard Chartered"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 36" style="width: 110px; height: 26px;" fill="none"><path d="M12 10 C6 10 3 14 3 18 C3 22 6 26 12 26 C18 26 21 18 25 18 C29 18 32 22 32 25" stroke="#00965E" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M23 26 C29 26 32 22 32 18 C32 14 29 10 23 10 C17 10 14 18 10 18 C6 18 3 14 3 11" stroke="#0072CE" stroke-width="3" stroke-linecap="round" fill="none"/><text x="40" y="16" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9.5" font-weight="700">Standard</text><text x="40" y="27" fill="#00965E" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9.5" font-weight="700">Chartered</text></svg></div>`,
    href: "https://www.sc.com/"
  }
];

// Global Instances
let stackLogoLoopInstance = null;

function switchStackTab(tabKey) {
  const techTabBtn = document.getElementById("tabBtnTech");
  const compTabBtn = document.getElementById("tabBtnCompanies");
  const subHeading = document.getElementById("stackSubHeading");

  if (!techTabBtn || !compTabBtn || !stackLogoLoopInstance) return;

  if (tabKey === "tech") {
    techTabBtn.classList.add("active");
    techTabBtn.setAttribute("aria-selected", "true");
    compTabBtn.classList.remove("active");
    compTabBtn.setAttribute("aria-selected", "false");
    
    if (subHeading) {
      subHeading.style.opacity = "0";
      setTimeout(() => {
        subHeading.textContent = "TECH WE USE";
        subHeading.style.opacity = "1";
      }, 150);
    }

    stackLogoLoopInstance.setLogos(TECH_LOGOS, "Technologies and tools we use");
  } else {
    compTabBtn.classList.add("active");
    compTabBtn.setAttribute("aria-selected", "true");
    techTabBtn.classList.remove("active");
    techTabBtn.setAttribute("aria-selected", "false");

    if (subHeading) {
      subHeading.style.opacity = "0";
      setTimeout(() => {
        subHeading.textContent = "COMPANIES THAT INSPIRE US";
        subHeading.style.opacity = "1";
      }, 150);
    }

    stackLogoLoopInstance.setLogos(COMPANY_LOGOS, "Companies that inspire us");
  }
}

// Auto-Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const stackContainer = document.getElementById("stackLogoLoopContainer");
  if (stackContainer) {
    stackLogoLoopInstance = new VanillaLogoLoop(stackContainer, {
      logos: TECH_LOGOS,
      speed: 75,
      direction: "left",
      logoHeight: 68,
      gap: 20,
      fadeOut: true,
      fadeOutColor: "#000000",
      scaleOnHover: true,
      pauseOnHover: true,
      ariaLabel: "Technologies we use"
    });
  }

  const partnerContainer = document.getElementById("partnerLogoLoop");
  if (partnerContainer) {
    new VanillaLogoLoop(partnerContainer, {
      logos: COMPANY_LOGOS,
      speed: 80,
      direction: "left",
      logoHeight: 68,
      gap: 20,
      fadeOut: true,
      fadeOutColor: "#000000",
      scaleOnHover: true,
      pauseOnHover: true,
      ariaLabel: "Institutional Partners and Ecosystem"
    });
  }
});
