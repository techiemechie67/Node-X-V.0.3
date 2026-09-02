"""
Unit Tests for Confidence Engine and Risk Engine
(IEEE HACKVERSE 2026 Problem Statement 6)
"""

from datetime import datetime, timezone, timedelta
from app.core_models import (
    Asset,
    PhysicalState,
    FinancialState,
    ContractualState,
    RiskState,
    LifecycleStage,
    FinancingInstrument,
    DataSource,
    ConflictStatus
)
from app.engine.confidence_engine import (
    ConfidenceEngine,
    TelemetryObservation,
    ReconciledFieldResult
)
from app.engine.risk_engine import (
    RiskEngine,
    RiskEvaluationResult
)


def test_confidence_engine_nominal_agreement():
    """Test telemetry reconciliation when multiple sources agree on location."""
    now = datetime.now(timezone.utc)
    obs = [
        TelemetryObservation(
            source=DataSource.IOT_TELEMETRY,
            field_name="location",
            value="Port of Singapore",
            timestamp=now,
            source_id="GPS-CONTAINER-991"
        ),
        TelemetryObservation(
            source=DataSource.CARRIER_API,
            field_name="location",
            value="Port of Singapore",
            timestamp=now - timedelta(minutes=15),
            source_id="CARRIER-MANIFEST-SG"
        ),
        TelemetryObservation(
            source=DataSource.ERP,
            field_name="location",
            value="Port of Singapore",
            timestamp=now - timedelta(hours=1),
            source_id="SAP-DOC-1102"
        )
    ]

    res = ConfidenceEngine.reconcile_field("location", obs, now=now)
    assert res.reconciled_value == "Port of Singapore"
    assert res.has_conflict is False
    assert res.confidence.conflict_status == ConflictStatus.NO_CONFLICT
    assert res.confidence.confidence_score >= 0.90
    print("✓ Confidence Engine Agreement Test Passed (Score:", res.confidence.confidence_score, ")")


def test_confidence_engine_conflict_flagging():
    """Test that conflicting observations explicitly flag conflict and penalize confidence."""
    now = datetime.now(timezone.utc)
    obs = [
        TelemetryObservation(
            source=DataSource.IOT_TELEMETRY,
            field_name="location",
            value="Red Sea Corridor (Vessel In Transit)",
            timestamp=now,
            source_id="GPS-SATELLITE"
        ),
        TelemetryObservation(
            source=DataSource.ERP,
            field_name="location",
            value="Warehouse Rotterdam",  # Out-of-sync ERP record
            timestamp=now - timedelta(hours=2),
            source_id="ERP-LEGACY"
        )
    ]

    res = ConfidenceEngine.reconcile_field("location", obs, now=now)
    assert res.has_conflict is True
    assert res.confidence.conflict_status == ConflictStatus.CONFLICT_DETECTED
    assert "Conflicting values detected" in res.confidence.conflict_details
    # Uncertainty must directly lower the confidence score
    assert res.confidence.confidence_score <= 0.65
    print("✓ Confidence Engine Conflict Flagging Test Passed (Penalized Score:", res.confidence.confidence_score, ")")


def test_confidence_engine_staleness_penalty():
    """Test that delayed/stale telemetry feeds receive a decay penalty."""
    now = datetime.now(timezone.utc)
    stale_time = now - timedelta(hours=48)  # 48 hours old for IoT sensor (threshold 4h)
    obs = [
        TelemetryObservation(
            source=DataSource.IOT_TELEMETRY,
            field_name="temperature_celsius",
            value=4.2,
            timestamp=stale_time,
            source_id="COLD-CHAIN-SENSOR"
        )
    ]

    res = ConfidenceEngine.reconcile_field("temperature_celsius", obs, now=now)
    assert res.confidence.confidence_score < 0.85
    print("✓ Confidence Engine Staleness Decay Test Passed (Score:", res.confidence.confidence_score, ")")


def test_risk_engine_deterministic_baseline():
    """Test transparent 10-vector risk engine on a nominal baseline asset."""
    asset = Asset(
        batch_id="BATCH-TEST-NOMINAL",
        name="Nominal Apparel Batch",
        lifecycle_stage=LifecycleStage.IN_TRANSIT,
        physical_state=PhysicalState(
            current_stage=LifecycleStage.IN_TRANSIT,
            location="Suez Canal Route",
            delay_days=0.0,
            dwell_days=0.0,
            condition="NOMINAL"
        ),
        contractual_state=ContractualState(
            buyer_id="BUYER-WALMART",
            supplier_id="SUPPLIER-TIER1",
            payment_terms_days=30
        )
    )

    eval_res = RiskEngine.evaluate_asset_risk(
        asset=asset,
        supplier_reliability_score=0.95,
        buyer_credit_score=0.92,
        has_duplicate_claim=False
    )

    assert eval_res.composite_score_100 < 35.0
    assert eval_res.risk_level in ("LOW", "MODERATE")
    assert len(eval_res.component_breakdown) == 10
    assert len(eval_res.positive_factors) >= 3
    assert eval_res.recommended_ltv_cap >= 0.78
    print("✓ Risk Engine Baseline Test Passed (Score:", eval_res.composite_score_100, "/ 100, Band:", eval_res.risk_level, ")")


def test_risk_engine_disruption_shock_repricing():
    """Test that physical transit delay and route volatility elevate risk and reprice spreads."""
    asset = Asset(
        batch_id="BATCH-TEST-DISRUPTED",
        name="Disrupted Semiconductor Shipment",
        lifecycle_stage=LifecycleStage.IN_TRANSIT,
        physical_state=PhysicalState(
            current_stage=LifecycleStage.IN_TRANSIT,
            location="Red Sea Blockade Corridor",
            delay_days=14.0,  # 14 days delay
            route_risk_index=0.85,  # Chokepoint risk
            condition="NOMINAL"
        ),
        contractual_state=ContractualState(
            buyer_id="BUYER-AUTO",
            supplier_id="SUPPLIER-SEMI",
            payment_terms_days=60
        )
    )

    eval_res = RiskEngine.evaluate_asset_risk(
        asset=asset,
        supplier_reliability_score=0.82,
        buyer_credit_score=0.85,
        has_duplicate_claim=False
    )

    # Disruption must elevate risk and spread
    assert eval_res.composite_score_100 > 30.0
    assert eval_res.component_breakdown["logistics_risk"].raw_score >= 0.60
    assert any("Logistics bottleneck" in w for w in eval_res.warnings)
    assert eval_res.dynamic_rate_spread_bps > 100.0
    print("✓ Risk Engine Disruption Shock Test Passed (Score:", eval_res.composite_score_100, ", Spread:", eval_res.dynamic_rate_spread_bps, "bps)")


def test_risk_engine_duplicate_financing_attack():
    """Test that a duplicate financing / double-pledged collateral claim triggers critical alerts."""
    asset = Asset(
        batch_id="BATCH-TEST-ATTACK",
        name="Collateral Fraud Test Batch",
        lifecycle_stage=LifecycleStage.PURCHASE_ORDER,
        physical_state=PhysicalState(
            current_stage=LifecycleStage.PURCHASE_ORDER,
            delay_days=0.0
        ),
        financial_state=FinancialState(
            is_encumbered=True,
            collateral_lien_hash=None  # Encumbered without verified hash
        )
    )

    eval_res = RiskEngine.evaluate_asset_risk(
        asset=asset,
        supplier_reliability_score=0.90,
        buyer_credit_score=0.90,
        has_duplicate_claim=True
    )

    assert eval_res.component_breakdown["duplicate_financing_risk"].raw_score >= 0.85
    assert any("SECURITY ALERT" in w for w in eval_res.warnings)
    print("✓ Risk Engine Duplicate Financing Attack Defense Test Passed (Duplicate Risk:", eval_res.component_breakdown["duplicate_financing_risk"].raw_score, ")")


if __name__ == "__main__":
    test_confidence_engine_nominal_agreement()
    test_confidence_engine_conflict_flagging()
    test_confidence_engine_staleness_penalty()
    test_risk_engine_deterministic_baseline()
    test_risk_engine_disruption_shock_repricing()
    test_risk_engine_duplicate_financing_attack()
    print("\n=======================================================")
    print("ALL CONFIDENCE & RISK ENGINE TEST CASES PASSED 100%!")
    print("=======================================================")
