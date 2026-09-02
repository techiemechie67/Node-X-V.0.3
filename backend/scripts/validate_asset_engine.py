#!/usr/bin/env python3
"""
Supply Chain Financing Intelligence Engine — Asset Engine Validation Script (Phase 2).
Replays the 8-step physical-to-financial lifecycle demo through the decision engine.
Asserts that stage transitions, instrument selections, and direction of change
(risk score, action, financing amounts) match physical reality.
"""

import os
import sys

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.asset_models import (
    Asset,
    DataSource,
    DecisionAction,
    Event,
    EventType,
    FinancingInstrument,
    LifecycleStage,
    PhysicalState,
    FinancialState,
    ContractualState,
)
from app.engine.asset_engine import apply_event, run_decision_cycle


def run_validation():
    print("=" * 80)
    print("RUNNING ASSET DECISION ENGINE 8-STEP LIFECYCLE REPLAY VALIDATION")
    print("=" * 80)

    # Initialize Asset
    asset = Asset(
        name="Electronics Telemetry Batch A1",
        batchId="BATCH-NX-2026-VAL1",
        lifecycleStage=LifecycleStage.PURCHASE_ORDER,
        physicalState=PhysicalState(location="Shenzhen High-Tech Industrial Zone"),
        financialState=FinancialState(estimatedValue=100000.0, workingCapitalNeed=80000.0, targetLtv=0.80),
        contractualState=ContractualState(poNumber="PO-2026-VAL1", buyerId="GLOBAL-RETAIL-EU", supplierId="CHIP-FAB-1")
    )

    steps_passed = 0
    total_steps = 8

    # -------------------------------------------------------------------------
    # STEP 1: PO Issued / Baseline Onboarding
    # -------------------------------------------------------------------------
    print("\n--- [STEP 1/8] PO Issued (Baseline Onboarding) ---")
    ev1 = Event(
        eventType=EventType.PO_ISSUED,
        source=DataSource.ERP,
        description="Purchase Order issued by Global Retail EU.",
        payload={"estimatedValue": 100000.0, "workingCapitalNeed": 80000.0, "poNumber": "PO-2026-VAL1"}
    )
    d1 = apply_event(asset, ev1)
    print(f"  Stage: {d1.lifecycleStage.value} | Instrument: {d1.selectedInstrument.value} | Action: {d1.action.value}")
    print(f"  Risk Score: {d1.riskScore:.3f} | Dynamic Rate: {d1.dynamicRate:.2f}% | Recommended Amount: ${d1.recommendedAmount:,.2f}")
    
    assert d1.lifecycleStage == LifecycleStage.PURCHASE_ORDER, "Step 1 Stage mismatch"
    assert d1.selectedInstrument == FinancingInstrument.PURCHASE_ORDER_FINANCING, "Step 1 Instrument mismatch"
    assert d1.action in [DecisionAction.INITIATE, DecisionAction.TRANSITION], "Step 1 Action mismatch"
    assert d1.recommendedAmount > 0, "Step 1 Amount must be positive"
    print("  ✓ STEP 1 PASS")
    steps_passed += 1

    # -------------------------------------------------------------------------
    # STEP 2: Raw Material Received at Assembly Plant
    # -------------------------------------------------------------------------
    print("\n--- [STEP 2/8] Raw Material Received ---")
    ev2 = Event(
        eventType=EventType.MATERIAL_RECEIVED,
        source=DataSource.ERP,
        description="Raw semiconductor wafers received at assembly plant.",
        payload={"location": "Assembly Plant Bay 3", "condition": "NOMINAL"}
    )
    d2 = apply_event(asset, ev2)
    print(f"  Stage: {d2.lifecycleStage.value} | Instrument: {d2.selectedInstrument.value} | Action: {d2.action.value}")
    print(f"  Risk Score: {d2.riskScore:.3f} | Dynamic Rate: {d2.dynamicRate:.2f}% | Recommended Amount: ${d2.recommendedAmount:,.2f}")

    assert d2.lifecycleStage == LifecycleStage.RAW_MATERIAL, "Step 2 Stage mismatch"
    assert d2.selectedInstrument == FinancingInstrument.PROCUREMENT_FINANCING, "Step 2 Instrument mismatch"
    assert d2.action == DecisionAction.TRANSITION, "Step 2 Action must be TRANSITION"
    print("  ✓ STEP 2 PASS")
    steps_passed += 1

    # -------------------------------------------------------------------------
    # STEP 3: Factory Production Completed / QC Signed Off
    # -------------------------------------------------------------------------
    print("\n--- [STEP 3/8] Production Completed ---")
    ev3 = Event(
        eventType=EventType.PRODUCTION_COMPLETED,
        source=DataSource.MANUAL_INSPECTION,
        description="Assembly and QC batch verification completed 100%.",
        payload={"condition": "NOMINAL", "quantity": 1000.0}
    )
    d3 = apply_event(asset, ev3)
    print(f"  Stage: {d3.lifecycleStage.value} | Instrument: {d3.selectedInstrument.value} | Action: {d3.action.value}")
    print(f"  Risk Score: {d3.riskScore:.3f} | Dynamic Rate: {d3.dynamicRate:.2f}% | Recommended Amount: ${d3.recommendedAmount:,.2f}")

    assert d3.lifecycleStage == LifecycleStage.PRODUCTION, "Step 3 Stage mismatch"
    assert d3.selectedInstrument == FinancingInstrument.INVENTORY_FINANCING, "Step 3 Instrument mismatch"
    print("  ✓ STEP 3 PASS")
    steps_passed += 1

    # -------------------------------------------------------------------------
    # STEP 4: Dispatched into Ocean Transit
    # -------------------------------------------------------------------------
    print("\n--- [STEP 4/8] Dispatched to Ocean Carrier ---")
    ev4 = Event(
        eventType=EventType.DISPATCHED,
        source=DataSource.CARRIER_API,
        description="Loaded into container aboard MSC OSCAR, Yantian to Rotterdam.",
        payload={"location": "Vessel MSC OSCAR", "routeRiskIndex": 0.10}
    )
    d4 = apply_event(asset, ev4)
    print(f"  Stage: {d4.lifecycleStage.value} | Instrument: {d4.selectedInstrument.value} | Action: {d4.action.value}")
    print(f"  Risk Score: {d4.riskScore:.3f} | Dynamic Rate: {d4.dynamicRate:.2f}% | Recommended Amount: ${d4.recommendedAmount:,.2f}")

    assert d4.lifecycleStage == LifecycleStage.IN_TRANSIT, "Step 4 Stage mismatch"
    assert d4.selectedInstrument == FinancingInstrument.IN_TRANSIT_FINANCING, "Step 4 Instrument mismatch"
    assert d4.action == DecisionAction.TRANSITION, "Step 4 Action must be TRANSITION"
    print("  ✓ STEP 4 PASS")
    steps_passed += 1

    # -------------------------------------------------------------------------
    # STEP 5: Disruption Shock / Severe Port Delay
    # -------------------------------------------------------------------------
    print("\n--- [STEP 5/8] Transit Disruption Shock ---")
    ev5 = Event(
        eventType=EventType.TRANSIT_DELAY,
        source=DataSource.IOT_TELEMETRY,
        description="Severe port congestion + canal detour adds 14 delay days.",
        payload={"delayDays": 14.0, "routeRiskIndex": 0.70}
    )
    d5 = apply_event(asset, ev5)
    print(f"  Stage: {d5.lifecycleStage.value} | Instrument: {d5.selectedInstrument.value} | Action: {d5.action.value}")
    print(f"  Risk Score: {d5.riskScore:.3f} (Prev: {d4.riskScore:.3f}) | Rate: {d5.dynamicRate:.2f}% (Prev: {d4.dynamicRate:.2f}%)")
    print(f"  Recommended Amount: ${d5.recommendedAmount:,.2f} (Prev: ${d4.recommendedAmount:,.2f})")

    # Assert direction of change
    assert d5.riskScore > d4.riskScore, "Step 5 Risk Score must increase upon disruption"
    assert d5.dynamicRate > d4.dynamicRate, "Step 5 Dynamic Interest Rate must reprice upwards"
    assert d5.action in [DecisionAction.REDUCE, DecisionAction.REFINANCE], "Step 5 Action must be REDUCE or REFINANCE"
    print("  ✓ STEP 5 PASS (Direction of change verified: Risk UP, Rate UP, Capacity REDUCED/REPRICED)")
    steps_passed += 1

    # -------------------------------------------------------------------------
    # STEP 6: Warehouse Check-in / Customs Clearance
    # -------------------------------------------------------------------------
    print("\n--- [STEP 6/8] Warehouse Check-in ---")
    ev6 = Event(
        eventType=EventType.WAREHOUSE_CHECKIN,
        source=DataSource.WAREHOUSE_WMS,
        description="Cargo offloaded and checked into bonded warehouse Rotterdam.",
        payload={"location": "Rotterdam Eurohub Warehouse", "dwellDays": 2.0, "delayDays": 0.0, "condition": "NOMINAL"}
    )
    d6 = apply_event(asset, ev6)
    print(f"  Stage: {d6.lifecycleStage.value} | Instrument: {d6.selectedInstrument.value} | Action: {d6.action.value}")
    print(f"  Risk Score: {d6.riskScore:.3f} (Prev: {d5.riskScore:.3f}) | Rate: {d6.dynamicRate:.2f}%")

    assert d6.lifecycleStage == LifecycleStage.WAREHOUSE, "Step 6 Stage mismatch"
    assert d6.selectedInstrument == FinancingInstrument.WAREHOUSE_FINANCING, "Step 6 Instrument mismatch"
    assert d6.action == DecisionAction.TRANSITION, "Step 6 Action must be TRANSITION"
    assert d6.riskScore < d5.riskScore, "Step 6 Risk Score must drop after clearing transit shock"
    print("  ✓ STEP 6 PASS (Direction of change verified: Risk DOWN after customs/warehouse intake)")
    steps_passed += 1

    # -------------------------------------------------------------------------
    # STEP 7: Commercial Invoice Issued & Factored
    # -------------------------------------------------------------------------
    print("\n--- [STEP 7/8] Invoice Issued ---")
    ev7 = Event(
        eventType=EventType.INVOICE_ISSUED,
        source=DataSource.ERP,
        description="Commercial invoice issued to buyer under 30-day payment term.",
        payload={"buyerId": "GLOBAL-RETAIL-EU", "paymentDueDays": 30}
    )
    d7 = apply_event(asset, ev7)
    print(f"  Stage: {d7.lifecycleStage.value} | Instrument: {d7.selectedInstrument.value} | Action: {d7.action.value}")
    print(f"  Risk Score: {d7.riskScore:.3f} | Dynamic Rate: {d7.dynamicRate:.2f}% | Recommended Amount: ${d7.recommendedAmount:,.2f}")

    assert d7.lifecycleStage == LifecycleStage.INVOICED, "Step 7 Stage mismatch"
    assert d7.selectedInstrument == FinancingInstrument.INVOICE_FINANCING, "Step 7 Instrument mismatch"
    assert d7.action == DecisionAction.TRANSITION, "Step 7 Action must be TRANSITION"
    print("  ✓ STEP 7 PASS")
    steps_passed += 1

    # -------------------------------------------------------------------------
    # STEP 8: Final Buyer Settlement & Collateral Release
    # -------------------------------------------------------------------------
    print("\n--- [STEP 8/8] Buyer Settlement (Cash / Settle) ---")
    ev8 = Event(
        eventType=EventType.PAYMENT_RECEIVED,
        source=DataSource.BANK_FEED,
        description="Full wire transfer payment received from buyer. Obligation cleared.",
        payload={"paymentReceived": True}
    )
    d8 = apply_event(asset, ev8)
    print(f"  Stage: {d8.lifecycleStage.value} | Instrument: {d8.selectedInstrument.value} | Action: {d8.action.value}")
    print(f"  Recommended Amount: ${d8.recommendedAmount:,.2f} | Existing Exposure: ${asset.existingExposure:,.2f}")

    assert d8.lifecycleStage == LifecycleStage.CASH, "Step 8 Stage mismatch"
    assert d8.action == DecisionAction.SETTLE, "Step 8 Action must be SETTLE"
    assert asset.existingExposure == 0.0, "Step 8 Existing exposure must settle to 0.0"
    assert d8.recommendedAmount == 0.0, "Step 8 Recommended amount must be 0.0"
    print("  ✓ STEP 8 PASS (Facility settled, lien released, exposure 0.0)")
    steps_passed += 1

    print("\n" + "=" * 80)
    print(f"VALIDATION SUMMARY: {steps_passed}/{total_steps} STEPS PASSED PERFECTLY!")
    print("=" * 80)
    return steps_passed == total_steps


if __name__ == "__main__":
    success = run_validation()
    sys.exit(0 if success else 1)
