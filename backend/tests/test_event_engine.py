"""
Unit Tests for Event Engine & Central State Machine
(IEEE HACKVERSE 2026 Problem Statement 6 - Step 4)
"""

from app.core_models import (
    Asset,
    PhysicalState,
    FinancialState,
    ContractualState,
    LifecycleStage,
    FinancingInstrument,
    DecisionAction,
    DataSource
)
from app.engine.event_engine import (
    EventEngine,
    MaterialEvent,
    EventType
)


def test_10_step_pipeline_execution():
    """Verify that EventEngine executes all 10 sequential pipeline steps."""
    asset = Asset(
        batch_id="BATCH-TEST-EVT-01",
        lifecycle_stage=LifecycleStage.PURCHASE_ORDER,
        financial_state=FinancialState(
            embodied_economic_value=100000.0,
            base_cost=75000.0,
            working_capital_need=80000.0,
            ltv_ratio=0.80
        ),
        contractual_state=ContractualState(
            po_number="PO-HACKVERSE-99",
            buyer_id="BUYER-TECH",
            supplier_id="SUPPLIER-FAB"
        )
    )

    evt = MaterialEvent(
        event_type=EventType.PO_ISSUED,
        asset_id=asset.asset_id,
        source=DataSource.ERP,
        description="PO issued for evaluation",
        payload={"target_stage": LifecycleStage.PURCHASE_ORDER}
    )

    updated_asset, decision, metadata = EventEngine.process_event(asset, evt)

    # Verify 10 steps were logged in pipeline log
    assert len(metadata["pipeline_steps"]) == 10
    assert "Step 1: Ingested Event" in metadata["pipeline_steps"][0]
    assert "Step 10: Emitted Decision Action" in metadata["pipeline_steps"][9]
    assert decision.action == DecisionAction.INITIATE
    assert decision.approved_amount > 0.0
    print("✓ 10-Step Sequential Pipeline Execution Verified")


def test_hackathon_demo_8_steps_end_to_end():
    """Verify that run_hackathon_lifecycle_demo runs the full 8-step replay flawlessly."""
    demo_results = EventEngine.run_hackathon_lifecycle_demo(order_value_inr=1_000_000.0)

    assert len(demo_results) == 8

    # Step 1: PO Issued
    s1 = demo_results[0]
    assert s1["step_num"] == 1
    assert s1["instrument"] == "PURCHASE_ORDER_FINANCING"
    assert s1["action"] == "INITIATE"
    assert s1["approved_amount"] > 0

    # Step 2: Raw Material Received
    s2 = demo_results[1]
    assert s2["step_num"] == 2
    assert s2["instrument"] == "PROCUREMENT_FINANCING"
    assert s2["action"] == "TRANSITION"

    # Step 3: Production Completed
    s3 = demo_results[2]
    assert s3["step_num"] == 3
    assert s3["instrument"] == "INVENTORY_FINANCING"
    assert s3["action"] == "TRANSITION"

    # Step 4: Dispatched to Ocean Carrier
    s4 = demo_results[3]
    assert s4["step_num"] == 4
    assert s4["instrument"] == "IN_TRANSIT_FINANCING"
    assert s4["action"] == "TRANSITION"

    # Step 5: Transit Disruption Shock
    s5 = demo_results[4]
    assert s5["step_num"] == 5
    assert s5["risk_score"] > s4["risk_score"]
    assert s5["dynamic_rate"] > s4["dynamic_rate"]

    # Step 6: Warehouse Check-in
    s6 = demo_results[5]
    assert s6["step_num"] == 6
    assert s6["instrument"] == "WAREHOUSE_FINANCING"
    assert s6["risk_score"] < s5["risk_score"]  # Risk recovers after port clearance

    # Step 7: Delivery & Invoice Approved
    s7 = demo_results[6]
    assert s7["step_num"] == 7
    assert s7["instrument"] == "INVOICE_FINANCING"
    assert s7["action"] == "TRANSITION"

    # Step 8: Buyer Settlement
    s8 = demo_results[7]
    assert s8["step_num"] == 8
    assert s8["instrument"] == "NONE"
    assert s8["action"] == "SETTLE"
    assert s8["approved_amount"] == 0.0

    print("✓ Hackathon 8-Step Lifecycle Replay Passed 100%!")


if __name__ == "__main__":
    test_10_step_pipeline_execution()
    test_hackathon_demo_8_steps_end_to_end()
    print("\n=======================================================")
    print("ALL EVENT ENGINE TEST CASES PASSED 100%!")
    print("=======================================================")
