import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
import uuid
from app.models import (
    Node,
    NodeType,
    FinancingInstrument,
    AssetState,
    SimulationRequest,
    DisruptionPayload
)
from app.templates import get_template
from app.engine.financial import compute_node_financial_metrics, compute_network_dashboard
from app.engine.propagation import run_topological_propagation
from app.engine.ledger import AntiDoubleFinancingLedger

def test_node_to_instrument_pricing():
    # 1. Factory -> PO Financing
    factory_node = Node(
        id=str(uuid.uuid4()),
        name="Test Cotton Farm",
        type=NodeType.FACTORY,
        cost=100000.0,
        delayDays=0.0,
        dependsOn=[],
        financingInstrument=FinancingInstrument.PO_FINANCING,
        supplierReliabilityScore=0.95
    )
    res = compute_node_financial_metrics(factory_node)
    assert res.financingInstrument == FinancingInstrument.PO_FINANCING
    assert res.tier == 1
    assert res.loanAmount == 100000.0 * 0.85 * 0.95
    assert res.ltvRatio > 0.70

    # 2. Transit -> Asset Backed Lending with route delay
    transit_node = Node(
        id=str(uuid.uuid4()),
        name="Test Ocean Route",
        type=NodeType.TRANSIT,
        cost=200000.0,
        delayDays=10.0,
        dependsOn=[],
        financingInstrument=FinancingInstrument.ASSET_BACKED_LENDING
    )
    res_transit = compute_node_financial_metrics(transit_node, route_volatility=40.0)
    assert res_transit.financingInstrument == FinancingInstrument.ASSET_BACKED_LENDING
    assert res_transit.tier == 2
    assert res_transit.riskScore > 0.20
    assert res_transit.ltvRatio < 0.80  # LTV shrinks as risk rises
    assert res_transit.interestRate > 7.5

    # 3. Warehouse -> Inventory Financing with storage dwell
    wh_node = Node(
        id=str(uuid.uuid4()),
        name="Test Central Warehouse",
        type=NodeType.WAREHOUSE,
        cost=150000.0,
        delayDays=0.0,
        storageDurationDays=30.0,
        dependsOn=[],
        financingInstrument=FinancingInstrument.INVENTORY_FINANCING
    )
    res_wh = compute_node_financial_metrics(wh_node, storage_dwell_days=15.0)
    assert res_wh.financingInstrument == FinancingInstrument.INVENTORY_FINANCING
    assert res_wh.tier == 3
    assert res_wh.riskScore > 0.30
    assert res_wh.ltvRatio < 0.60  # Leverage recalculates downward the longer inventory sits

    # 4. Delivery -> Invoice Factoring
    deliv_node = Node(
        id=str(uuid.uuid4()),
        name="Test Retail Handover",
        type=NodeType.DELIVERY,
        cost=300000.0,
        delayDays=5.0,
        dependsOn=[],
        financingInstrument=FinancingInstrument.INVOICE_FACTORING
    )
    res_deliv = compute_node_financial_metrics(deliv_node)
    assert res_deliv.financingInstrument == FinancingInstrument.INVOICE_FACTORING
    assert res_deliv.tier == 4
    assert res_deliv.interestRate >= 1.5  # Factoring discount

def test_topological_propagation_and_refinancing():
    template = get_template("apparel")
    nodes = template["nodes"]
    
    # Apply 12-day shock to Ocean Transit node
    ocean_node = next(n for n in nodes if n.type == NodeType.TRANSIT)
    
    updated_nodes, ref_event, dashboard, exec_time = run_topological_propagation(
        nodes=nodes,
        node_id=ocean_node.id,
        shock_type="port_blockade",
        magnitude=12.0
    )
    
    # Downstream warehouse and delivery nodes must have accumulated cascading delay
    wh_node = next(n for n in updated_nodes if n.type == NodeType.WAREHOUSE)
    assert wh_node.delayDays >= 12.0
    
    # Auto-refinancing event must have triggered
    assert ref_event is not None
    assert ref_event.triggered is True
    assert "Refinancing triggered —" in ref_event.reason
    assert ref_event.newInterestRate > 0
    assert len(ref_event.affectedNodeIds) > 0
    assert exec_time < 200.0  # Sub-200ms latency requirement

def test_anti_double_financing_ledger():
    ledger = AntiDoubleFinancingLedger()
    node_a = Node(
        id=str(uuid.uuid4()),
        name="Cotton Farm Node A",
        type=NodeType.FACTORY,
        cost=120000.0,
        financingInstrument=FinancingInstrument.PO_FINANCING,
        batchId="BATCH-TEST-01",
        loanAmount=100000.0
    )
    
    node_b = Node(
        id=str(uuid.uuid4()),
        name="Spinning Mill Node B",
        type=NodeType.FACTORY,
        cost=180000.0,
        financingInstrument=FinancingInstrument.PO_FINANCING,
        batchId="BATCH-TEST-01",
        loanAmount=150000.0
    )

    # 1. Finance Node A -> Success
    success, check, entry = ledger.finance_node(node_a, "BATCH-TEST-01")
    assert success is True
    assert check.blocked is False
    assert entry.collateralHash.startswith("0x")

    # 2. Attempt to Finance Node A again with same batch -> BLOCKED
    success2, check2, entry2 = ledger.finance_node(node_a, "BATCH-TEST-01")
    assert success2 is False
    assert check2.blocked is True
    assert "Duplicate Financing Alert" in check2.reason

    # 3. Attempt to Finance Node B on the same batch before settling Node A -> BLOCKED
    success3, check3, entry3 = ledger.finance_node(node_b, "BATCH-TEST-01")
    assert success3 is False
    assert check3.blocked is True
    assert "holds an active, unsettled lien" in check3.reason

    # 4. Settle Node A
    settle_success, msg, settled_entry = ledger.settle_node(node_a, "BATCH-TEST-01")
    assert settle_success is True
    assert settled_entry.state == AssetState.SETTLED

    # 5. Now Finance Node B on Batch-TEST-01 -> SUCCESS (lien released)
    success4, check4, entry4 = ledger.finance_node(node_b, "BATCH-TEST-01")
    assert success4 is True
    assert check4.blocked is False

def test_attempt_double_financing_attack():
    ledger = AntiDoubleFinancingLedger()
    node = Node(
        id=str(uuid.uuid4()),
        name="Test Node",
        type=NodeType.FACTORY,
        cost=100000.0,
        financingInstrument=FinancingInstrument.PO_FINANCING,
        batchId="BATCH-ATTACK-01"
    )
    
    # Trigger attack check
    attack_check = ledger.attempt_double_financing_attack(node, "BATCH-ATTACK-01")
    assert attack_check.blocked is True
    assert "Attack Prevented" in attack_check.reason
