import sys
sys.path.insert(0, "backend")

from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_api_flow():
    # 1. Health Check
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    print("✓ Health Check: 200 OK")

    # 2. Get Nodes
    res = client.get("/api/nodes?template_id=apparel")
    assert res.status_code == 200
    data = res.json()
    nodes = data["nodes"]
    assert len(nodes) == 7
    first_node_id = nodes[0]["id"]
    print(f"✓ /api/nodes: Loaded {len(nodes)} nodes across 4 financing instruments.")

    # 3. Direct API Contract POST /simulate ({ nodeId, shockType, magnitude })
    sim_res = client.post("/simulate", json={
        "nodeId": first_node_id,
        "shockType": "material_shortage",
        "magnitude": 15.0
    })
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "updatedNodes" in sim_data
    assert "ledgerCheck" in sim_data
    assert "dashboard" in sim_data
    assert sim_data["refinancingEvent"]["triggered"] is True
    print(f"✓ POST /simulate: Executed in {sim_data['execution_time_ms']}ms.")
    print(f"  Refinancing Reason: {sim_data['refinancingEvent']['reason'][:80]}...")

    import uuid
    test_batch_id = f"BATCH-NX-API-{uuid.uuid4().hex[:6]}"

    # 4. Anti-Double-Financing Ledger: Issue Tier-1 PO Financing
    fin_res = client.post("/api/ledger/finance-node", json={
        "nodeId": first_node_id,
        "batchId": test_batch_id
    })
    assert fin_res.status_code == 200
    fin_data = fin_res.json()
    assert fin_data["success"] is True
    collateral_hash = fin_data["entry"]["collateralHash"]
    assert collateral_hash.startswith("0x")
    print(f"✓ /api/ledger/finance-node: Issued Tier-1. Collateral Hash = {collateral_hash}")

    # 5. Anti-Double-Financing Ledger: Attempt Duplicate Issuance (MUST BLOCK)
    dup_res = client.post("/api/ledger/finance-node", json={
        "nodeId": first_node_id,
        "batchId": test_batch_id
    })
    assert dup_res.status_code == 409
    dup_data = dup_res.json()
    assert dup_data["blocked"] is True
    assert "Duplicate Financing Alert" in dup_data["reason"]
    print("✓ /api/ledger/finance-node (Duplicate): Correctly blocked with 409 Conflict!")
    print(f"  Reason: {dup_data['reason'][:80]}...")

    # 6. Judge Attack Test: /api/ledger/attempt-double-finance
    att_res = client.post("/api/ledger/attempt-double-finance", json={
        "nodeId": first_node_id,
        "batchId": test_batch_id
    })
    assert att_res.status_code == 200
    att_data = att_res.json()
    assert att_data["blocked"] is True
    assert "OVER-LEVERAGING" in att_data["alertTitle"]
    print("✓ /api/ledger/attempt-double-finance: Judge demo check confirmed blocked.")

    # 7. Settle Node
    settle_res = client.post("/api/ledger/settle-node", json={
        "nodeId": first_node_id,
        "batchId": test_batch_id
    })
    assert settle_res.status_code == 200
    settle_data = settle_res.json()
    assert settle_data["success"] is True
    print("✓ /api/ledger/settle-node: Settled lien and released collateral.")


    # 8. Voice Underwriter API
    v_res = client.post("/api/voice-alert", json={
        "text": "Warning: Route 4 exhibits elevated default risk."
    })
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["success"] is True
    print(f"✓ /api/voice-alert: Synthesizer ready ({v_data['voice_name']}).")

    # 9. Frontend Static Serving
    front_res = client.get("/")
    assert front_res.status_code == 200
    assert "NODE-X-LOGISTICS" in front_res.text.upper()
    print(f"✓ GET /: Static frontend served successfully ({len(front_res.text)} bytes).")

    print("\n=======================================================")
    print("ALL 9 CRITICAL API & END-TO-END TEST CASES PASSED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    test_full_api_flow()
