/**
 * Node-X-Logistics — Anti-Double-Financing Ledger View (Bugatti Design System)
 * Requirement #7 (IEEE HACKVERSE 2026 Problem Statement #6)
 * Renders batch collateral liens using austere luxury-engineered cards.
 */

class LedgerView {
  constructor(listContainerId, locksContainerId, countBadgeId) {
    this.listContainer = document.getElementById(listContainerId);
    this.locksContainer = document.getElementById(locksContainerId);
    this.countBadge = document.getElementById(countBadgeId);
  }

  render(entries, activeLocks) {
    const list = entries || [];
    const locks = activeLocks || {};

    if (this.countBadge) {
      this.countBadge.textContent = `${list.length} ${list.length === 1 ? "ENTRY" : "ENTRIES"}`;
    }

    // 1. Render Ledger Entries
    if (!this.listContainer) return;

    if (list.length === 0) {
      this.listContainer.innerHTML = `
        <div style="text-align: center; padding: 36px 10px;">
          <p class="caption-uppercase">NO ACTIVE FINANCING ISSUED YET</p>
          <button class="button-primary button-primary-small" style="margin-top: 12px;" onclick="financeNextAvailableNode()">ISSUE TIER-1 PO LINE</button>
        </div>
      `;
    } else {
      this.listContainer.innerHTML = list
        .slice()
        .reverse()
        .map((entry) => {
          const isSettled = entry.state === "settled";

          return `
            <div class="ledger-card">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span class="caption-uppercase" style="color: #ffffff;">
                  TIER ${entry.tier} • ${entry.financingInstrument.toUpperCase()}
                </span>
                <span class="caption-uppercase" style="color: ${isSettled ? '#999999' : '#ffffff'};">
                  ${entry.state.toUpperCase()}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin: 4px 0;">
                <span class="title-sm">${entry.nodeName.toUpperCase()}</span>
                <span class="display-sm" style="font-size: 18px; color: #ffffff;">$${(entry.loanAmount || 0).toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between;" class="caption-uppercase">
                <span>BATCH: ${entry.batchId}</span>
                <span class="mono-text" style="color: var(--link);" title="SHA-256 Collateral Lien Hash">${entry.collateralHash || "0x..."}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 2px;" class="caption-uppercase">
                <span>ISSUED: ${entry.financedAt || "ACTIVE"}</span>
                <span>RATE: ${entry.interestRate}% • LTV: ${Math.round((entry.ltvRatio || 0.8) * 100)}%</span>
              </div>
            </div>
          `;
        })
        .join("");
    }

    // 2. Render Active Collateral Locks
    if (!this.locksContainer) return;

    const lockKeys = Object.keys(locks);
    if (lockKeys.length === 0) {
      this.locksContainer.innerHTML = `
        <span style="color: var(--muted-soft);">No active locks. System ready for Tier-1 issuance.</span>
      `;
    } else {
      this.locksContainer.innerHTML = lockKeys
        .map((batchId) => {
          const entryId = locks[batchId];
          const entry = list.find((e) => e.entryId === entryId);
          return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;" class="caption-uppercase">
              <span class="mono-text" style="color: #ffffff;">[LOCKED] ${batchId}</span>
              <span>${entry ? entry.nodeName.toUpperCase() : "LOCKED"} (${entry ? entry.collateralHash.substring(0, 10) + "..." : "0x..."})</span>
            </div>
          `;
        })
        .join("");
    }
  }

  showDoubleFinancingAlert(data) {
    const modal = document.getElementById("attackModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalReason = document.getElementById("modalReason");
    const modalBatchId = document.getElementById("modalBatchId");
    const modalActiveTier = document.getElementById("modalActiveTier");
    const modalCollateralHash = document.getElementById("modalCollateralHash");

    if (modalTitle) modalTitle.textContent = data.alertTitle || "OVER-LEVERAGING / DOUBLE-FINANCING DETECTED";
    if (modalReason) modalReason.textContent = data.reason || "Physical asset collateral lien conflict.";
    if (modalBatchId) modalBatchId.textContent = data.activeEntry ? data.activeEntry.batchId : "BATCH-NX-2026-A1";
    if (modalActiveTier) {
      if (data.activeEntry) {
        modalActiveTier.textContent = `TIER-${data.activeEntry.tier} ${data.activeEntry.financingInstrument.toUpperCase()} ($${(data.activeEntry.loanAmount || 0).toLocaleString()})`;
      } else {
        modalActiveTier.textContent = "ACTIVE ENCUMBRANCE ON EXCHANGE";
      }
    }
    if (modalCollateralHash) modalCollateralHash.textContent = data.collateralHash || "0x9F4C82A1B7E3";

    if (modal) modal.classList.remove("hidden");
  }

  hideDoubleFinancingAlert() {
    const modal = document.getElementById("attackModal");
    if (modal) modal.classList.add("hidden");
  }
}

// Attach to window
window.LedgerView = LedgerView;
