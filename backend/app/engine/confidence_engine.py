"""
Confidence Engine (IEEE HACKVERSE 2026 Problem Statement 6)
Reconciles heterogeneous, delayed, incomplete, or conflicting multi-source data.
Explicitly flags conflicts and penalizes uncertainty rather than blindly trusting single feeds.
"""

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple
from app.core_models import (
    DataSource,
    ConflictStatus,
    DataConfidence,
    DataPoint,
    PhysicalState
)


# Base trust weights for different data ingestion sources
SOURCE_BASE_WEIGHTS: Dict[DataSource, float] = {
    DataSource.CONSENSUS_ORACLE: 0.98,
    DataSource.IOT_TELEMETRY: 0.94,
    DataSource.CUSTOMS_PORTAL: 0.92,
    DataSource.CARRIER_API: 0.90,
    DataSource.WAREHOUSE_WMS: 0.88,
    DataSource.BANK_FEED: 0.95,
    DataSource.ERP: 0.85,
    DataSource.BUYER_PORTAL: 0.82,
    DataSource.SUPPLIER_PORTAL: 0.80,
    DataSource.MANUAL_INSPECTION: 0.75,
}

# Maximum allowed telemetry age before staleness decay triggers
STALENESS_THRESHOLDS_HOURS: Dict[DataSource, float] = {
    DataSource.IOT_TELEMETRY: 4.0,       # Sensor pings expected every few hours
    DataSource.CARRIER_API: 12.0,        # Carrier manifests updated twice daily
    DataSource.WAREHOUSE_WMS: 24.0,      # Daily dock updates
    DataSource.CUSTOMS_PORTAL: 48.0,     # Port customs filings
    DataSource.ERP: 48.0,                # Batch ERP synchronization
    DataSource.BANK_FEED: 24.0,          # Banking statement rails
    DataSource.CONSENSUS_ORACLE: 6.0,
    DataSource.MANUAL_INSPECTION: 168.0, # Weekly inspection certificate
    DataSource.BUYER_PORTAL: 72.0,
    DataSource.SUPPLIER_PORTAL: 72.0,
}


class TelemetryObservation:
    """Represents a single raw observation from an external source."""
    def __init__(
        self,
        source: DataSource,
        field_name: str,
        value: Any,
        timestamp: Optional[datetime] = None,
        source_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.source = source
        self.field_name = field_name
        self.value = value
        self.timestamp = timestamp or datetime.now(timezone.utc)
        self.source_id = source_id
        self.metadata = metadata or {}


class ReconciledFieldResult:
    """Output of multi-source reconciliation for a specific attribute."""
    def __init__(
        self,
        field_name: str,
        reconciled_value: Any,
        confidence: DataConfidence,
        all_observations: List[TelemetryObservation],
        has_conflict: bool,
        explanation: str
    ):
        self.field_name = field_name
        self.reconciled_value = reconciled_value
        self.confidence = confidence
        self.all_observations = all_observations
        self.has_conflict = has_conflict
        self.explanation = explanation

    def to_data_point(self) -> DataPoint:
        return DataPoint(
            field_name=self.field_name,
            value=self.reconciled_value,
            confidence=self.confidence
        )


class ConfidenceEngine:
    """
    Multi-source telemetry reconciliation and confidence evaluation engine.
    Ensures that uncertainty, stale feeds, and conflicting records transparently lower confidence scores.
    """

    @classmethod
    def reconcile_field(
        cls,
        field_name: str,
        observations: List[TelemetryObservation],
        now: Optional[datetime] = None
    ) -> ReconciledFieldResult:
        """
        Reconciles multiple incoming observations for a single field across sources.
        """
        if not observations:
            # Incomplete: No telemetry available
            conf = DataConfidence(
                source=DataSource.ERP,
                timestamp=now or datetime.now(timezone.utc),
                confidence_score=0.20,
                conflict_status=ConflictStatus.STALE,
                conflict_details="No telemetry feeds received for this field.",
                metadata={"incompleteness_penalty": 0.80}
            )
            return ReconciledFieldResult(
                field_name=field_name,
                reconciled_value=None,
                confidence=conf,
                all_observations=[],
                has_conflict=False,
                explanation="Incomplete data: zero observations available."
            )

        now_utc = now or datetime.now(timezone.utc)
        scored_obs: List[Tuple[TelemetryObservation, float]] = []

        for obs in observations:
            base_weight = SOURCE_BASE_WEIGHTS.get(obs.source, 0.70)
            
            # Check staleness
            threshold_hours = STALENESS_THRESHOLDS_HOURS.get(obs.source, 24.0)
            elapsed_hours = max(0.0, (now_utc - obs.timestamp).total_seconds() / 3600.0)
            
            staleness_decay = 0.0
            if elapsed_hours > threshold_hours:
                # Progressive exponential decay for delayed reports
                overage_days = (elapsed_hours - threshold_hours) / 24.0
                staleness_decay = min(0.40, overage_days * 0.10)
            
            effective_score = max(0.05, base_weight - staleness_decay)
            scored_obs.append((obs, effective_score))

        # Check for conflicts among distinct values
        unique_values = {}
        for obs, score in scored_obs:
            val_key = str(obs.value).strip().lower()
            if val_key not in unique_values:
                unique_values[val_key] = {"value": obs.value, "total_score": 0.0, "sources": []}
            unique_values[val_key]["total_score"] += score
            unique_values[val_key]["sources"].append(obs.source.value)

        has_conflict = len(unique_values) > 1
        
        # Sort by total evidence weight
        sorted_groups = sorted(unique_values.values(), key=lambda x: x["total_score"], reverse=True)
        winner = sorted_groups[0]
        reconciled_value = winner["value"]

        # Calculate final confidence score
        winning_obs = next(obs for obs, _ in scored_obs if str(obs.value).strip().lower() == str(reconciled_value).strip().lower())
        best_source_score = next(score for obs, score in scored_obs if obs is winning_obs)

        conflict_penalty = 0.0
        conflict_status = ConflictStatus.NO_CONFLICT
        conflict_details = None

        if has_conflict:
            # Disagreement between sources directly penalizes confidence
            conflict_status = ConflictStatus.CONFLICT_DETECTED
            conflicting_sources = [f"{g['sources']} -> {g['value']}" for g in sorted_groups]
            conflict_details = f"Conflicting values detected across sources: {'; '.join(conflicting_sources)}"
            conflict_penalty = 0.35  # Major uncertainty penalty

        final_confidence = max(0.10, min(1.0, best_source_score - conflict_penalty))

        explanation_parts = [
            f"Reconciled from {len(observations)} source(s).",
            f"Selected value '{reconciled_value}' from primary source {winning_obs.source.value} (base score: {best_source_score:.2f})."
        ]
        if has_conflict:
            explanation_parts.append(f"CONFLICT DETECTED: {conflict_details}. Applied -{conflict_penalty*100:.0f}% confidence penalty.")

        data_conf = DataConfidence(
            source=winning_obs.source,
            timestamp=winning_obs.timestamp,
            confidence_score=round(final_confidence, 4),
            conflict_status=conflict_status,
            conflict_details=conflict_details,
            raw_source_id=winning_obs.source_id,
            metadata={
                "total_observations": len(observations),
                "has_conflict": has_conflict,
                "conflict_penalty": conflict_penalty
            }
        )

        return ReconciledFieldResult(
            field_name=field_name,
            reconciled_value=reconciled_value,
            confidence=data_conf,
            all_observations=observations,
            has_conflict=has_conflict,
            explanation=" ".join(explanation_parts)
        )

    @classmethod
    def reconcile_physical_state(
        cls,
        current_state: PhysicalState,
        incoming_telemetry: List[TelemetryObservation],
        now: Optional[datetime] = None
    ) -> Tuple[PhysicalState, List[ReconciledFieldResult]]:
        """
        Reconciles an entire PhysicalState container with incoming telemetry observations.
        """
        now_utc = now or datetime.now(timezone.utc)
        results: List[ReconciledFieldResult] = []
        updated_state = current_state.model_copy(deep=True)

        # Group observations by field name
        by_field: Dict[str, List[TelemetryObservation]] = {}
        for obs in incoming_telemetry:
            by_field.setdefault(obs.field_name, []).append(obs)

        for field_name, obs_list in by_field.items():
            res = cls.reconcile_field(field_name, obs_list, now=now_utc)
            results.append(res)
            
            # Store confidence in state metadata
            updated_state.data_confidences[field_name] = res.confidence

            # Apply reconciled value to physical state attributes
            if field_name == "location" and res.reconciled_value:
                updated_state.location = str(res.reconciled_value)
            elif field_name == "quantity" and res.reconciled_value is not None:
                try:
                    updated_state.quantity = float(res.reconciled_value)
                except (ValueError, TypeError):
                    pass
            elif field_name == "condition" and res.reconciled_value:
                updated_state.condition = str(res.reconciled_value)
            elif field_name == "delay_days" and res.reconciled_value is not None:
                try:
                    updated_state.delay_days = float(res.reconciled_value)
                except (ValueError, TypeError):
                    pass
            elif field_name == "dwell_days" and res.reconciled_value is not None:
                try:
                    updated_state.dwell_days = float(res.reconciled_value)
                except (ValueError, TypeError):
                    pass
            elif field_name == "route_risk_index" and res.reconciled_value is not None:
                try:
                    updated_state.route_risk_index = float(res.reconciled_value)
                except (ValueError, TypeError):
                    pass

        return updated_state, results
