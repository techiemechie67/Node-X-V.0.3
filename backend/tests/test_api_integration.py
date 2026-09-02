"""
API Integration & Contract Tests (Step 5)
Verifies Simple Mode, Complex Mode, Before/After Simulation, Hackathon Replay,
and backward compatibility of POST /simulate for the visual frontend.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_health():
    """Verify health endpoint."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    print("✓ GET /health: 200 OK")


def test_asset_lifecycle_api_and_modes():
    """Verify asset creation, Simple Mode, Complex Mode, and Event Ingestion."""
    # 1. Create Asset
    create_payload = {
        "name": "Semiconductor Fab Batch 01",
        "batch_id": "BATCH-API-TEST-01",
        "agreed_price": 500000.0,
        "working_capital_need": 400000.0,
        "target_ltv": 0.80,
        "po_number": "PO-API-2026-X",
        "buyer_id": "GLOBAL-OEM",
        "supplier_id": "FAB-TECH",
        "initial_location": "Bangalore Fab Docks"
    }
    res_create = client.post("/api/assets", json=create_payload)
    assert res_create.status_code == 201
    asset_data = res_create.json()
    asset_id = asset_data["asset_id"]
    assert asset_data["batch_id"] == "BATCH-API-TEST-01"
    print("✓ POST /api/assets: 201 Created (Asset ID:", asset_id, ")")

    # 2. Simple Mode Endpoint
    res_simple = client.get(f"/api/assets/{asset_id}/simple")
    assert res_simple.status_code == 200
    simple_data = res_simple.json()
    assert "current_stage" in simple_data
    assert "recommended_instrument" in simple_data
    assert "approved_amount" in simple_data
    assert "dynamic_interest_rate" in simple_data
    assert "risk_score_100" in simple_data
    assert "reasoning" in simple_data
    print("✓ GET /api/assets/{id}/simple: 200 OK (Instrument:", simple_data["recommended_instrument"], ")")

    # 3. Complex Mode Endpoint
    res_complex = client.get(f"/api/assets/{asset_id}/complex")
    assert res_complex.status_code == 200
    complex_data = res_complex.json()
    assert "risk_diagnostics" in complex_data
    assert "exposure_ledger" in complex_data
    assert "component_breakdown" in complex_data["risk_diagnostics"]
    assert len(complex_data["risk_diagnostics"]["component_breakdown"]) == 10
    print("✓ GET /api/assets/{id}/complex: 200 OK (10 Risk Vectors Verified)")

    # 4. Ingest Event
    event_payload = {
        "event_type": "PRODUCTION_COMPLETED",
        "source": "MANUAL_INSPECTION",
        "description": "QA inspection passed",
        "payload": {
            "target_stage": "PRODUCTION",
            "condition": "NOMINAL"
        }
    }
    res_event = client.post(f"/api/assets/{asset_id}/events", json=event_payload)
    assert res_event.status_code == 200
    dec_data = res_event.json()
    assert dec_data["action"] in ("TRANSITION", "INITIATE", "MAINTAIN", "INCREASE")
    print("✓ POST /api/assets/{id}/events: 200 OK (Action:", dec_data["action"], ")")

    # 5. Before & After Simulation Endpoint
    sim_payload = {
        "event_type": "TRANSIT_DELAY_SHOCK",
        "delay_days": 10.0,
        "route_risk_index": 0.75,
        "location": "Red Sea Shipping Route"
    }
    res_sim = client.post(f"/api/assets/{asset_id}/simulate", json=sim_payload)
    assert res_sim.status_code == 200
    sim_data = res_sim.json()
    assert "before" in sim_data
    assert "after" in sim_data
    assert "delta" in sim_data
    assert sim_data["after"]["dynamic_rate"] >= sim_data["before"]["dynamic_rate"]
    print("✓ POST /api/assets/{id}/simulate: 200 OK (Before/After Rate Delta:", sim_data["delta"]["rate_change_bps"], "bps)")

    # 6. Hackathon Replay Demo Endpoint
    res_demo = client.post("/api/assets/demo/hackathon-replay?order_value_inr=1000000.0")
    assert res_demo.status_code == 200
    demo_steps = res_demo.json()
    assert len(demo_steps) == 8
    assert demo_steps[7]["action"] == "SETTLE"
    print("✓ POST /api/assets/demo/hackathon-replay: 200 OK (8/8 Steps Verified)")


def test_legacy_visual_contracts_preservation():
    """Verify that existing POST /simulate and GET /api/nodes contracts remain 100% intact."""
    # 1. GET /api/nodes
    res_nodes = client.get("/api/nodes?template_id=apparel")
    assert res_nodes.status_code == 200
    nodes_data = res_nodes.json()
    assert "nodes" in nodes_data
    assert "dashboard" in nodes_data
    assert len(nodes_data["nodes"]) >= 5
    print("✓ GET /api/nodes: 200 OK (Nodes count:", len(nodes_data["nodes"]), ")")

    # 2. POST /simulate (Frontend Shock Propagation Contract)
    sim_req = {
        "nodeId": "n1",
        "shockType": "delay",
        "magnitude": 14.0
    }
    res_sim = client.post("/simulate", json=sim_req)
    assert res_sim.status_code == 200
    sim_res = res_sim.json()
    assert "updatedNodes" in sim_res
    assert "ledgerCheck" in sim_res
    assert "refinancingEvent" in sim_res
    assert "dashboard" in sim_res
    assert "explanation" in sim_res
    print("✓ POST /simulate: 200 OK (Simulation Contract Intact)")


if __name__ == "__main__":
    test_api_health()
    test_asset_lifecycle_api_and_modes()
    test_legacy_visual_contracts_preservation()
    print("\n=======================================================")
    print("ALL API INTEGRATION & CONTRACT TESTS PASSED 100%!")
    print("=======================================================")
