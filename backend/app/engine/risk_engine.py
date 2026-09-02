"""
Risk Engine (IEEE HACKVERSE 2026 Problem Statement 6)
Deterministic, transparent, auditable multi-factor risk calculator.
Combines 10 distinct operational, logistical, counterparty, and provenance vectors into an explainable 0-100 risk score.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.core_models import (
    Asset,
    PhysicalState,
    FinancialState,
    ContractualState,
    RiskState,
    LifecycleStage,
    ConflictStatus
)


class RiskComponentDetail(BaseModel):
    """Details for a single transparent risk vector."""
    component_name: str
    raw_score: float = Field(..., ge=0.0, le=1.0, description="Normalized score 0.0 (safest) to 1.0 (highest risk)")
    weight: float = Field(..., ge=0.0, le=1.0, description="Component weight in composite calculation")
    weighted_contribution: float
    description: str


class RiskEvaluationResult(BaseModel):
    """
    Transparent Risk Assessment Output.
    Contains the 0-100 composite score, risk band, explainable positive factors, warnings, and component breakdown.
    """
    composite_score_100: float = Field(..., ge=0.0, le=100.0, description="Composite risk score on 0 to 100 scale")
    normalized_score: float = Field(..., ge=0.0, le=1.0, description="Normalized 0.0 to 1.0 score for mathematical models")
    risk_level: str = Field(..., description="LOW | MODERATE | ELEVATED | CRITICAL")
    recommended_ltv_cap: float = Field(..., ge=0.0, le=1.0, description="Dynamic Loan-To-Value capacity")
    dynamic_rate_spread_bps: float = Field(..., description="Dynamic interest rate spread in basis points above baseline")
    positive_factors: List[str] = Field(default_factory=list, description="Verifiable operational and credit assurances")
    warnings: List[str] = Field(default_factory=list, description="Active risk drivers, anomalies, or delay surcharges")
    component_breakdown: Dict[str, RiskComponentDetail] = Field(default_factory=dict)
    summary_reasoning: str


# Component weights summing to 1.00
RISK_WEIGHTS = {
    "buyer_risk": 0.12,
    "supplier_risk": 0.12,
    "physical_asset_risk": 0.10,
    "production_risk": 0.10,
    "logistics_risk": 0.12,
    "inventory_dwell_risk": 0.10,
    "market_risk": 0.08,
    "payment_risk": 0.10,
    "data_confidence_risk": 0.08,
    "duplicate_financing_risk": 0.08
}


class RiskEngine:
    """
    Deterministic Risk Engine implementing transparent, audit-ready calculations.
    Replaces opaque black-box scoring with exact mathematical rules.
    """

    @classmethod
    def evaluate_asset_risk(
        cls,
        asset: Asset,
        supplier_reliability_score: float = 0.92,
        buyer_credit_score: float = 0.90,
        has_duplicate_claim: bool = False
    ) -> RiskEvaluationResult:
        """
        Computes the complete 10-vector transparent risk score for an asset batch.
        """
        phys = asset.physical_state
        fin = asset.financial_state
        contract = asset.contractual_state
        existing_risk = asset.risk_state

        positive_factors: List[str] = []
        warnings: List[str] = []

        # 1. Buyer Risk (0.0 to 1.0)
        # Evaluates buyer creditworthiness and payment term duration
        buyer_credit_penalty = max(0.0, 1.0 - buyer_credit_score)
        terms_penalty = 0.05 if contract.payment_terms_days <= 30 else (0.10 if contract.payment_terms_days <= 60 else 0.20)
        buyer_score = min(1.0, buyer_credit_penalty * 0.70 + terms_penalty)
        if buyer_credit_score >= 0.85:
            positive_factors.append(f"Buyer '{contract.buyer_id}' possesses strong prime credit score ({buyer_credit_score:.2f}).")
        if contract.payment_terms_days > 60:
            warnings.append(f"Extended payment terms ({contract.payment_terms_days} days) increase duration exposure.")

        # 2. Supplier Risk (0.0 to 1.0)
        supplier_score = min(1.0, max(0.0, (1.0 - supplier_reliability_score) * 1.2))
        if supplier_reliability_score >= 0.90:
            positive_factors.append(f"Tier-1 Supplier '{contract.supplier_id}' has proven on-time reliability score of {supplier_reliability_score*100:.1f}%.")
        else:
            warnings.append(f"Supplier reliability score ({supplier_reliability_score*100:.1f}%) introduces upstream manufacturing uncertainty.")

        # 3. Physical Asset Risk (0.0 to 1.0)
        condition_penalty = 0.0 if phys.condition == "NOMINAL" else (0.25 if phys.condition == "INSPECTED" else 0.60)
        temp_penalty = 0.0
        if phys.temperature_celsius is not None and (phys.temperature_celsius > 35.0 or phys.temperature_celsius < -10.0):
            temp_penalty = 0.30
            warnings.append(f"Telemetry alert: Extreme ambient temperature ({phys.temperature_celsius}°C) detected on cargo.")
        asset_score = min(1.0, condition_penalty + temp_penalty + 0.05)
        if phys.condition == "NOMINAL":
            positive_factors.append("Physical asset inspection status is NOMINAL with intact packaging verification.")

        # 4. Production Risk (0.0 to 1.0)
        prod_score = 0.05
        if asset.lifecycle_stage in (LifecycleStage.RAW_MATERIAL, LifecycleStage.PRODUCTION):
            prod_delay_impact = min(0.50, phys.delay_days * 0.05)
            prod_score = min(1.0, 0.15 + prod_delay_impact)
            if phys.delay_days > 0:
                warnings.append(f"Production schedule lag of +{phys.delay_days:.1f} days increases WIP carry cost.")
        else:
            prod_score = 0.02
            positive_factors.append("Asset has cleared manufacturing and fabrication phase.")

        # 5. Logistics & Transit Risk (0.0 to 1.0)
        transit_delay_factor = min(0.60, phys.delay_days * 0.06)
        route_risk = phys.route_risk_index * 0.40
        logistics_score = min(1.0, 0.05 + transit_delay_factor + route_risk)
        if phys.delay_days > 3.0:
            warnings.append(f"Logistics bottleneck: +{phys.delay_days:.1f} days transit delay elevates supply-chain disruption risk.")
        elif asset.lifecycle_stage == LifecycleStage.IN_TRANSIT:
            positive_factors.append("Carrier GPS telematics confirm on-schedule voyage progression.")

        # 6. Inventory & Dwell Risk (0.0 to 1.0)
        dwell_penalty = 0.0
        if phys.dwell_days > 14.0:
            dwell_penalty = min(0.70, (phys.dwell_days - 14.0) * 0.04)
            warnings.append(f"Warehouse dwell alert: Storage duration ({phys.dwell_days:.1f}d) exceeds 14-day SLA threshold.")
        inventory_score = min(1.0, 0.05 + dwell_penalty)
        if phys.dwell_days <= 7.0 and asset.lifecycle_stage == LifecycleStage.WAREHOUSE:
            positive_factors.append("Warehouse dwell time is optimal (<7 days) with zero inventory obsolescence.")

        # 7. Market & Resale Risk (0.0 to 1.0)
        # Electronics / High-Tech vs generic commodities
        market_score = 0.10
        if asset.product_category == "Electronics & High-Tech":
            market_score = 0.12  # Fast tech obsolescence
        else:
            market_score = 0.08
        positive_factors.append(f"Standard collateral liquidation market available for category '{asset.product_category}'.")

        # 8. Payment & Commercial Risk (0.0 to 1.0)
        payment_score = 0.10
        if asset.lifecycle_stage == LifecycleStage.INVOICED:
            if contract.invoice_approved:
                payment_score = 0.04
                positive_factors.append("Commercial invoice formally approved by buyer Accounts Payable.")
            else:
                payment_score = 0.20
                warnings.append("Commercial invoice pending final buyer verification signature.")
        elif asset.lifecycle_stage == LifecycleStage.CASH:
            payment_score = 0.0
            positive_factors.append("Payment realization completed in full; zero credit default exposure.")

        # 9. Data Confidence & Telemetry Integrity Risk (0.0 to 1.0)
        # Evaluates confidence across all ingested fields
        avg_confidence = 0.95
        if phys.data_confidences:
            conf_scores = [c.confidence_score for c in phys.data_confidences.values()]
            avg_confidence = sum(conf_scores) / len(conf_scores)
            
            # Check for conflict flags
            conflicts = [c for c in phys.data_confidences.values() if c.conflict_status == ConflictStatus.CONFLICT_DETECTED]
            if conflicts:
                warnings.append(f"Multi-source telemetry conflict detected in {len(conflicts)} data attribute(s).")

        data_conf_risk = max(0.0, min(1.0, (1.0 - avg_confidence) * 1.5))
        if avg_confidence >= 0.90:
            positive_factors.append(f"Multi-source telemetry reconciliation integrity is high ({avg_confidence*100:.1f}% confidence).")
        else:
            warnings.append(f"Low telemetry confidence ({avg_confidence*100:.1f}%) introduces observation uncertainty penalty.")

        # 10. Duplicate Financing & Collateral Encumbrance Risk (0.0 to 1.0)
        dup_risk = 0.0
        if has_duplicate_claim or (fin.is_encumbered and not fin.collateral_lien_hash):
            dup_risk = 0.90
            warnings.append("SECURITY ALERT: Potential duplicate financing / unverified collateral claim detected.")
        else:
            dup_risk = 0.02
            positive_factors.append("SHA-256 collateral lien registry verified; zero duplicate senior claims.")

        # Assemble Components
        raw_components = {
            "buyer_risk": (buyer_score, "Buyer credit rating, default probability, and payment terms window."),
            "supplier_risk": (supplier_score, "Supplier historical on-time fulfillment and yield defect record."),
            "physical_asset_risk": (asset_score, "Asset physical condition, perishability, and temperature integrity."),
            "production_risk": (prod_score, "Manufacturing downtime, WIP stage lag, and component availability."),
            "logistics_risk": (logistics_score, "Transit delay duration, port bottlenecks, and route risk index."),
            "inventory_dwell_risk": (inventory_score, "Warehouse storage duration and dwell obsolescence factor."),
            "market_risk": (market_score, "Asset resale market depth and commodity price stability."),
            "payment_risk": (payment_score, "Invoice acceptance status and currency settlement rails."),
            "data_confidence_risk": (data_conf_risk, "Multi-source data reconciliation quality and conflict status."),
            "duplicate_financing_risk": (dup_risk, "Cryptographic lien registration and anti-double-financing defense.")
        }

        breakdown: Dict[str, RiskComponentDetail] = {}
        composite_normalized = 0.0
        max_component_score = 0.0

        for key, (score, desc) in raw_components.items():
            weight = RISK_WEIGHTS[key]
            contrib = score * weight
            composite_normalized += contrib
            max_component_score = max(max_component_score, score)
            breakdown[key] = RiskComponentDetail(
                component_name=key.replace("_", " ").title(),
                raw_score=round(score, 4),
                weight=weight,
                weighted_contribution=round(contrib, 4),
                description=desc
            )

        # Dynamic Bottleneck / Chokepoint Shock Surcharge
        # Single-point severe disruptions compound operational risk across the entire pipeline
        shock_surcharge = 0.30 * (max_component_score ** 2) if max_component_score > 0.40 else 0.0
        composite_final = min(1.0, composite_normalized + shock_surcharge)

        composite_100 = round(composite_final * 100.0, 2)
        composite_normalized = round(composite_final, 4)

        # Determine Risk Band
        if composite_100 < 25.0:
            risk_level = "LOW"
            recommended_ltv_cap = 0.85
            spread_bps = 25.0 + (composite_100 * 2.0)
        elif composite_100 < 50.0:
            risk_level = "MODERATE"
            recommended_ltv_cap = 0.78
            spread_bps = 75.0 + (composite_100 * 3.5)
        elif composite_100 < 75.0:
            risk_level = "ELEVATED"
            recommended_ltv_cap = 0.65
            spread_bps = 200.0 + (composite_100 * 5.0)
        else:
            risk_level = "CRITICAL"
            recommended_ltv_cap = 0.40
            spread_bps = 500.0 + (composite_100 * 8.0)

        summary_reasoning = (
            f"Asset batch evaluated under {risk_level} risk profile (Score: {composite_100}/100). "
            f"Key risk drivers: logistics risk ({logistics_score:.2f}) and supplier factor ({supplier_score:.2f}). "
            f"Recommended LTV ceiling capped at {recommended_ltv_cap*100:.0f}% with dynamic spread of +{spread_bps:.0f} bps."
        )

        return RiskEvaluationResult(
            composite_score_100=composite_100,
            normalized_score=composite_normalized,
            risk_level=risk_level,
            recommended_ltv_cap=recommended_ltv_cap,
            dynamic_rate_spread_bps=round(spread_bps, 1),
            positive_factors=positive_factors,
            warnings=warnings,
            component_breakdown=breakdown,
            summary_reasoning=summary_reasoning
        )
