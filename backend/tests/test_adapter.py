"""
Unit Tests for API Contract Adapter & Legacy Model Translations (Prompt 6)
"""

from fastapi.testclient import TestClient
from app.main import app
from app.models import (
    Node,
    NodeType,
    FinancingInstrument,
    AssetState,
    asset_to_legacy_node,
    assets_to_legacy_nodes
)
from app.core_models import (
    Asset as CoreAsset,
    PhysicalState as CorePhysicalState,
    FinancialState as CoreFinancialState,
    ContractualState as CoreContractualState,
    RiskState as CoreRiskState,
    LifecycleStage as CoreLifecycleStage
)

client = TestClient(app)


def test_asset_to_legacy_node_translation():
    """
    Test explicit mapping requirements:
    - Asset.physicalState.delayDays -> Node.delayDays
    - Asset.activeFacility.approvedAmount -> Node.loanAmount
    - Asset.activeFacility.interestRate -> Node.interestRate
    - Asset.riskState.compositeScore -> Node.riskScore
    """
    # Create Core Asset with specific values
    asset = CoreAsset(
        name="Microcontroller Batch 99",
        batch_id="BATCH-TEST-ADAPTER",
        lifecycle_stage=CoreLifecycleStage.IN_TRANSIT,
        physical_state=CorePhysicalState(
            delay_days=12.5,
            dwell_days=3.0,
            location="Red Sea Transit"
        ),
        financial_state=CoreFinancialState(
            embodied_economic_value=120000.0,
            approved_amount=85000.0,
            dynamic_interest_rate=8.25,
            ltv_ratio=0.80,
            collateral_lien_hash="0xABC123DEF456"
        ),
        risk_state=CoreRiskState(
            composite_risk_score=0.225
        )
    )

    base_node = Node(
        id="n_test",
        name="Base Node",
        type=NodeType.TRANSIT,
        cost=100000.0,
        delayDays=0.0,
        financingInstrument=FinancingInstrument.ASSET_BACKED_LENDING,
        assetState=AssetState.UNFINANCED,
        loanAmount=0.0,
        riskScore=0.10,
        interestRate=7.50,
        tier=2
    )

    legacy_node = asset_to_legacy_node(asset, base_node)

    # 1. Map delayDays
    assert legacy_node.delayDays == 12.5
    # 2. Map loanAmount
    assert legacy_node.loanAmount == 85000.0
    # 3. Map interestRate
    assert legacy_node.interestRate == 8.25
    # 4. Map riskScore
    assert legacy_node.riskScore == 0.225
    # 5. Map Collateral Hash & Batch ID
    assert legacy_node.collateralHash == "0xABC123DEF456"
    assert legacy_node.batchId == "BATCH-TEST-ADAPTER"
    assert legacy_node.assetState == AssetState.FINANCED

    print("✓ Translation Adapter Mapping Verified 100%!")


def test_api_nodes_contract():
    """Ensure /api/nodes strictly returns { 'template_id', 'nodes', 'dashboard' }."""
    res = client.get("/api/nodes?template_id=apparel")
    assert res.status_code == 200
    data = res.json()
    assert "template_id" in data
    assert "nodes" in data
    assert "dashboard" in data
    assert isinstance(data["nodes"], list)
    assert len(data["nodes"]) > 0
    first_node = data["nodes"][0]
    assert "id" in first_node
    assert "name" in first_node
    assert "loanAmount" in first_node
    assert "interestRate" in first_node
    assert "delayDays" in first_node
    assert "riskScore" in first_node
    print("✓ GET /api/nodes Contract Verified")


def test_simulate_endpoint_contract():
    """Ensure /simulate strictly returns legacy SimulationResponse structure."""
    req = {
        "nodeId": "n1",
        "shockType": "delay",
        "magnitude": 10.0
    }
    res = client.post("/simulate", json=req)
    assert res.status_code == 200
    data = res.json()
    assert "updatedNodes" in data
    assert "ledgerCheck" in data
    assert "refinancingEvent" in data
    assert "dashboard" in data
    assert "explanation" in data
    print("✓ POST /simulate Contract Verified")


def test_ledger_endpoints_contract():
    """Ensure /api/ledger/finance-node and /api/ledger/attempt-double-finance return expected JSON."""
    # Get first node ID from active nodes
    res_nodes = client.get("/api/nodes?template_id=apparel")
    node_id = res_nodes.json()["nodes"][0]["id"]

    # Settle first if encumbered
    client.post("/api/ledger/settle-node", json={"nodeId": node_id, "batchId": "BATCH-NX-2026-A1"})

    # 1. Finance Node (Success or 409 Conflict)
    res_fin = client.post("/api/ledger/finance-node", json={"nodeId": node_id, "batchId": "BATCH-NX-2026-A1"})
    assert res_fin.status_code in (200, 409)
    fin_data = res_fin.json()
    assert "success" in fin_data
    assert "blocked" in fin_data

    # 2. Attempt Double Finance (Blocked Demo Check)
    res_att = client.post("/api/ledger/attempt-double-finance", json={"nodeId": node_id, "batchId": "BATCH-NX-2026-A1"})
    assert res_att.status_code == 200
    att_data = res_att.json()
    assert att_data["blocked"] is True
    assert "collateralHash" in att_data
    assert "reason" in att_data
    print("✓ Ledger Endpoints Contract Verified")


if __name__ == "__main__":
    test_asset_to_legacy_node_translation()
    test_api_nodes_contract()
    test_simulate_endpoint_contract()
    test_ledger_endpoints_contract()
    print("\n=======================================================")
    print("ALL API CONTRACT ADAPTER TESTS PASSED 100%!")
    print("=======================================================")
