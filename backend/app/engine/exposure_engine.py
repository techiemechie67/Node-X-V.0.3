"""
Exposure Engine (IEEE HACKVERSE 2026 Problem Statement 6 - Node 11)
Maintains transparent awareness of existing debt obligations, senior encumbrances,
and outstanding principal attached to each asset batch to prevent over-leveraging and double-financing.
"""

import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field
from app.core_models import (
    Asset,
    FinancialState,
    FinancingInstrument,
    LifecycleStage
)


class CollateralLienRecord(BaseModel):
    """Immutable ledger record representing an active collateral pledge."""
    lien_hash: str
    asset_id: str
    batch_id: str
    lender_id: str
    instrument: FinancingInstrument
    principal_drawn: float
    approved_limit: float
    ltv_ratio: float
    interest_rate: float
    registered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    settled_at: Optional[datetime] = None


class ExposureEngine:
    """
    Tracks and enforces collateral lien integrity and active financial exposure.
    Enforces the fundamental requirement that outstanding principal must always
    be subtracted before approving or deploying new capital.
    """

    # In-memory global lien registry indexed by lien_hash and asset_id
    _LIEN_REGISTRY: Dict[str, CollateralLienRecord] = {}
    _ASSET_LIEN_MAP: Dict[str, List[str]] = {}

    @classmethod
    def generate_collateral_hash(cls, asset: Asset, lender_id: str = "INSTITUTIONAL-LENDER-01") -> str:
        """
        Generates a deterministic SHA-256 cryptographic collateral hash
        binding the batch ID, PO number, buyer ID, and supplier ID.
        """
        batch_id = asset.batch_id or "BATCH-DEFAULT"
        po_num = asset.contractual_state.po_number or "PO-DEFAULT"
        buyer = asset.contractual_state.buyer_id or "BUYER-DEFAULT"
        supplier = asset.contractual_state.supplier_id or "SUPPLIER-DEFAULT"
        
        raw_seed = f"COLLATERAL::{batch_id}::{po_num}::{buyer}::{supplier}::{lender_id}"
        full_hash = hashlib.sha256(raw_seed.encode("utf-8")).hexdigest().upper()
        return f"0x{full_hash[:16]}"

    @classmethod
    def get_active_exposure(cls, asset: Asset) -> float:
        """
        Returns the total outstanding drawn principal currently encumbering this asset ID.
        Always inspects both the in-memory ledger and the asset's financial state.
        """
        active_liens = cls.get_active_liens_for_asset(asset.asset_id)
        ledger_exposure = sum(lien.principal_drawn for lien in active_liens if lien.is_active)
        state_exposure = asset.financial_state.existing_exposure or asset.financial_state.drawn_amount
        return max(ledger_exposure, state_exposure)

    @classmethod
    def get_active_liens_for_asset(cls, asset_id: str) -> List[CollateralLienRecord]:
        """Returns all active collateral lien records for a specific asset UUID."""
        lien_hashes = cls._ASSET_LIEN_MAP.get(asset_id, [])
        return [cls._LIEN_REGISTRY[h] for h in lien_hashes if h in cls._LIEN_REGISTRY and cls._LIEN_REGISTRY[h].is_active]

    @classmethod
    def verify_anti_double_financing(
        cls,
        asset: Asset,
        new_requested_amount: float,
        max_safe_capacity: float,
        lender_id: str = "INSTITUTIONAL-LENDER-01"
    ) -> Tuple[bool, str, Optional[str]]:
        """
        Enforces Anti-Double-Financing consensus checks:
        1. Checks if asset is already pledged under another conflicting senior facility.
        2. Ensures new requested amount does not cause over-leveraging beyond maximum safe capacity.
        """
        existing_exposure = cls.get_active_exposure(asset)
        collateral_hash = cls.generate_collateral_hash(asset, lender_id)

        # Check existing active liens from different lenders
        for lien in cls.get_active_liens_for_asset(asset.asset_id):
            if lien.is_active and lien.lender_id != lender_id:
                reason = (
                    f"OVER-LEVERAGING / DOUBLE-FINANCING REJECTED: Asset batch '{asset.batch_id}' is already "
                    f"encumbered by senior lender '{lien.lender_id}' under {lien.instrument.value} "
                    f"(Drawn: ${lien.principal_drawn:,.2f}, Lien: {lien.lien_hash})."
                )
                return False, reason, lien.lien_hash

        # Check over-leveraging constraint
        if (existing_exposure + new_requested_amount) > (max_safe_capacity + 0.01) and max_safe_capacity > 0:
            reason = (
                f"OVER-LEVERAGING DETECTED: Total exposure (${existing_exposure + new_requested_amount:,.2f}) "
                f"would exceed maximum safe borrowing capacity (${max_safe_capacity:,.2f})."
            )
            return False, reason, collateral_hash

        return True, "Collateral verification passed. Zero duplicate claims detected.", collateral_hash

    @classmethod
    def register_pledge(
        cls,
        asset: Asset,
        instrument: FinancingInstrument,
        drawn_amount: float,
        approved_limit: float,
        ltv_ratio: float,
        interest_rate: float,
        lender_id: str = "INSTITUTIONAL-LENDER-01"
    ) -> Tuple[bool, str, Optional[CollateralLienRecord]]:
        """
        Registers an active collateral lien on the cryptographic ledger.
        """
        collateral_hash = cls.generate_collateral_hash(asset, lender_id)

        # Check for conflict
        if collateral_hash in cls._LIEN_REGISTRY and cls._LIEN_REGISTRY[collateral_hash].is_active:
            existing = cls._LIEN_REGISTRY[collateral_hash]
            if existing.lender_id != lender_id:
                return False, f"Duplicate pledge error: Collateral hash {collateral_hash} is already locked.", None

        record = CollateralLienRecord(
            lien_hash=collateral_hash,
            asset_id=asset.asset_id,
            batch_id=asset.batch_id,
            lender_id=lender_id,
            instrument=instrument,
            principal_drawn=drawn_amount,
            approved_limit=approved_limit,
            ltv_ratio=ltv_ratio,
            interest_rate=interest_rate,
            is_active=True
        )

        cls._LIEN_REGISTRY[collateral_hash] = record
        cls._ASSET_LIEN_MAP.setdefault(asset.asset_id, [])
        if collateral_hash not in cls._ASSET_LIEN_MAP[asset.asset_id]:
            cls._ASSET_LIEN_MAP[asset.asset_id].append(collateral_hash)

        # Synchronize asset financial state
        asset.financial_state.collateral_lien_hash = collateral_hash
        asset.financial_state.is_encumbered = True
        asset.financial_state.active_instrument = instrument
        asset.financial_state.drawn_amount = drawn_amount
        asset.financial_state.approved_amount = approved_limit
        asset.financial_state.existing_exposure = drawn_amount
        asset.financial_state.senior_lien_holder = lender_id

        return True, f"Lien {collateral_hash} registered successfully.", record

    @classmethod
    def settle_exposure(
        cls,
        asset: Asset,
        settlement_payment: float
    ) -> Tuple[float, float, str]:
        """
        Applies settlement funds to pay down active principal and releases the collateral lien.
        Returns: (remaining_exposure, surplus_cash, status_message)
        """
        current_exp = cls.get_active_exposure(asset)
        if current_exp <= 0.0:
            return 0.0, settlement_payment, "Asset has zero outstanding debt exposure."

        if settlement_payment >= current_exp:
            surplus = settlement_payment - current_exp
            
            # Deactivate all active liens
            for lien in cls.get_active_liens_for_asset(asset.asset_id):
                lien.is_active = False
                lien.settled_at = datetime.now(timezone.utc)

            asset.financial_state.existing_exposure = 0.0
            asset.financial_state.drawn_amount = 0.0
            asset.financial_state.is_encumbered = False
            asset.financial_state.active_instrument = FinancingInstrument.NONE
            
            return 0.0, surplus, f"Full settlement achieved. Paid down ${current_exp:,.2f} debt. Released lien."
        else:
            remaining = current_exp - settlement_payment
            asset.financial_state.existing_exposure = remaining
            asset.financial_state.drawn_amount = remaining
            
            # Update lien record
            for lien in cls.get_active_liens_for_asset(asset.asset_id):
                lien.principal_drawn = remaining

            return remaining, 0.0, f"Partial paydown of ${settlement_payment:,.2f}. Remaining debt: ${remaining:,.2f}."

    @classmethod
    def reset(cls):
        """Clears in-memory lien registry for test isolation."""
        cls._LIEN_REGISTRY.clear()
        cls._ASSET_LIEN_MAP.clear()
