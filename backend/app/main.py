import os
import uuid
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel

from app.models import (
    Node,
    NodeType,
    FinancingInstrument,
    AssetState,
    SimulationRequest,
    SimulationResponse,
    DisruptionPayload,
    LedgerEntry,
    LedgerCheckResult,
    RefinancingEvent,
    DashboardSummary,
    FinanceNodeRequest,
    SettleNodeRequest,
    AttemptDoubleFinanceRequest,
    asset_to_legacy_node,
    assets_to_legacy_nodes
)
from app.templates import TEMPLATES, get_template
from app.engine.propagation import run_topological_propagation
from app.engine.financial import compute_network_dashboard
from app.engine.ledger import GLOBAL_LEDGER
from app.engine.voice import generate_voice_alert

# In-memory active nodes state per session/network
ACTIVE_STATE: Dict[str, List[Node]] = {}

def get_current_nodes(template_id: str = "apparel") -> List[Node]:
    tid = (template_id or "apparel").lower()
    if tid not in ACTIVE_STATE or not ACTIVE_STATE[tid]:
        template = get_template(tid)
        ACTIVE_STATE[tid] = [n.model_copy(deep=True) for n in template["nodes"]]
    return ACTIVE_STATE[tid]

from app.asset_api import asset_router

# 1. Initialize SlowAPI Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# 2. Initialize FastAPI App (debug=False to avoid debug stack traces)
app = FastAPI(
    title="Node-X-Logistics Simulation Engine",
    description="Agentic Working-Capital Financing Engine for Supply Chains (IEEE HACKVERSE 2026 #6)",
    version="2.0.0",
    debug=False,
    docs_url="/docs",
    redoc_url=None
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.include_router(asset_router, prefix="/api/assets")

# 3. Security: CORS restriction
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# 4. Security: Global Exception Handlers to sanitize error responses
@app.exception_handler(Exception)
async def custom_global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Simulation Engine Error",
            "message": "An unexpected server error occurred during simulation execution. Parameters have been logged.",
            "status_code": 500
        }
    )

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "Request Error",
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

# 5. Core API Endpoints

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Node-X-Logistics Working Capital Engine",
        "version": "2.0.0",
        "problem_statement": "IEEE HACKVERSE 2026 #6 (Competitive Capital Market for Supply-Chain Working Capital)"
    }

@app.get("/api/templates")
def list_templates():
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "node_count": len(t["nodes"])
        }
        for t in TEMPLATES.values()
    ]

@app.get("/api/templates/{template_id}")
def get_template_by_id(template_id: str):
    try:
        return get_template(template_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/nodes")
def get_active_nodes(template_id: str = "apparel"):
    nodes = get_current_nodes(template_id)
    dashboard = compute_network_dashboard(nodes)
    return {
        "template_id": template_id,
        "nodes": nodes,
        "dashboard": dashboard
    }

def _execute_simulation_core(body: SimulationRequest) -> SimulationResponse:
    tid = (body.template_id or "apparel").lower()

    if body.custom_nodes and len(body.custom_nodes) > 0:
        target_nodes = [n.model_copy(deep=True) for n in body.custom_nodes]
    else:
        target_nodes = [n.model_copy(deep=True) for n in get_current_nodes(tid)]

    # Check Anti-Double-Financing ledger before applying shock
    ledger_check = LedgerCheckResult(blocked=False, reason=None)
    if body.nodeId:
        target_node = next((n for n in target_nodes if n.id == body.nodeId), None)
        if target_node:
            ledger_check = GLOBAL_LEDGER.check_can_finance(target_node, target_node.batchId)

    # Run Topological Shock Propagation & Auto-Refinancing
    updated_nodes, refinancing_event, dashboard, exec_time_ms = run_topological_propagation(
        nodes=target_nodes,
        disruption=body.disruption,
        node_id=body.nodeId,
        shock_type=body.shockType,
        magnitude=body.magnitude
    )

    # Persist updated nodes in active memory
    ACTIVE_STATE[tid] = updated_nodes

    return SimulationResponse(
        scenario_id=str(uuid.uuid4()),
        template_id=tid,
        execution_time_ms=exec_time_ms,
        updatedNodes=updated_nodes,
        ledgerCheck=ledger_check,
        refinancingEvent=refinancing_event,
        dashboard=dashboard,
        explanation=refinancing_event.reason if refinancing_event else "Network operating within optimal risk parameters."
    )

@app.post("/simulate", response_model=SimulationResponse)
@app.post("/api/simulate", response_model=SimulationResponse)
@limiter.limit("120/minute")
def run_simulation(request: Request, body: SimulationRequest):
    """
    Core API Endpoint matching the exact required contract:
    POST /simulate
    Request: { nodeId, shockType, magnitude } (or full template/disruption payload)
    Response: { updatedNodes, ledgerCheck, refinancingEvent, dashboard }
    """
    return _execute_simulation_core(body)

# 6. Anti-Double-Financing Ledger Endpoints (PS Requirement #7)

@app.post("/api/ledger/finance-node")
def finance_node_endpoint(body: FinanceNodeRequest):
    """
    Issues financing on a specific node after passing the Anti-Double-Financing ledger check.
    """
    for tid, nodes in ACTIVE_STATE.items():
        for n in nodes:
            if n.id == body.nodeId:
                success, check, entry = GLOBAL_LEDGER.finance_node(n, body.batchId)
                if not success:
                    return JSONResponse(
                        status_code=status.HTTP_409_CONFLICT,
                        content={
                            "success": False,
                            "blocked": True,
                            "reason": check.reason,
                            "collateralHash": check.collateralHash,
                            "activeEntry": check.activeEntry.model_dump() if check.activeEntry else None
                        }
                    )
                return {
                    "success": True,
                    "blocked": False,
                    "message": f"Financing issued successfully for {n.name} under {n.financingInstrument.value.upper()}.",
                    "entry": entry.model_dump() if entry else None,
                    "updatedNode": n.model_dump()
                }

    # If not found in active state, search default template
    template = get_template("apparel")
    for n in template["nodes"]:
        if n.id == body.nodeId:
            success, check, entry = GLOBAL_LEDGER.finance_node(n, body.batchId)
            if not success:
                return JSONResponse(
                    status_code=status.HTTP_409_CONFLICT,
                    content={
                        "success": False,
                        "blocked": True,
                        "reason": check.reason,
                        "collateralHash": check.collateralHash,
                        "activeEntry": check.activeEntry.model_dump() if check.activeEntry else None
                    }
                )
            return {
                "success": True,
                "blocked": False,
                "message": f"Financing issued successfully for {n.name}.",
                "entry": entry.model_dump() if entry else None,
                "updatedNode": n.model_dump()
            }

    raise HTTPException(status_code=404, detail=f"Node {body.nodeId} not found.")

@app.post("/api/ledger/settle-node")
def settle_node_endpoint(body: SettleNodeRequest):
    """
    Settles active financing on a node and releases the physical collateral lien.
    """
    for tid, nodes in ACTIVE_STATE.items():
        for n in nodes:
            if n.id == body.nodeId:
                success, msg, entry = GLOBAL_LEDGER.settle_node(n, body.batchId)
                if not success:
                    raise HTTPException(status_code=400, detail=msg)
                return {
                    "success": True,
                    "message": msg,
                    "entry": entry.model_dump() if entry else None,
                    "updatedNode": n.model_dump()
                }

    template = get_template("apparel")
    for n in template["nodes"]:
        if n.id == body.nodeId:
            success, msg, entry = GLOBAL_LEDGER.settle_node(n, body.batchId)
            if not success:
                raise HTTPException(status_code=400, detail=msg)
            return {
                "success": True,
                "message": msg,
                "entry": entry.model_dump() if entry else None,
                "updatedNode": n.model_dump()
            }

    raise HTTPException(status_code=404, detail=f"Node {body.nodeId} not found.")

@app.post("/api/ledger/attempt-double-finance")
def attempt_double_finance_endpoint(body: AttemptDoubleFinanceRequest):
    """
    Interactive test trigger for hackathon judges:
    Demonstrates the Anti-Double-Financing Ledger rejecting an illicit double-pledge attempt.
    """
    target_node = None
    for tid, nodes in ACTIVE_STATE.items():
        for n in nodes:
            if n.id == body.nodeId:
                target_node = n
                break
        if target_node:
            break

    if not target_node:
        template = get_template("apparel")
        target_node = next((n for n in template["nodes"] if n.id == body.nodeId), template["nodes"][0])

    check = GLOBAL_LEDGER.attempt_double_financing_attack(target_node, body.batchId)
    return {
        "success": False,
        "blocked": check.blocked,
        "alertTitle": "OVER-LEVERAGING & DOUBLE-FINANCING ALERT (PS Requirement #7)",
        "reason": check.reason,
        "collateralHash": check.collateralHash,
        "activeEntry": check.activeEntry.model_dump() if check.activeEntry else None
    }

@app.get("/api/ledger/state")
def get_ledger_state():
    return {
        "entries": [e.model_dump() for e in GLOBAL_LEDGER.get_all_entries()],
        "activeLocks": GLOBAL_LEDGER.active_collateral_locks,
        "totalEntries": len(GLOBAL_LEDGER.entries)
    }

@app.post("/api/ledger/reset")
def reset_network_and_ledger():
    GLOBAL_LEDGER.reset()
    ACTIVE_STATE.clear()
    return {
        "status": "success",
        "message": "Anti-Double-Financing Ledger and Network Graph reset to baseline state."
    }

# 7. AI Autonomous Underwriter & Route Advisor Endpoint

from app.engine.ai_agent import underwrite_supply_chain_agent

class AIAdvisorRequest(BaseModel):
    query: Optional[str] = None
    telemetry: Optional[Dict[str, Any]] = None
    node_id: Optional[str] = None
    template_id: Optional[str] = "apparel"
    api_key: Optional[str] = None

@app.post("/api/ai/advisor")
@app.post("/api/ai/underwrite")
async def ai_advisor_endpoint(body: AIAdvisorRequest):
    """
    Executes the DeepSeek Autonomous Supply-Chain Underwriter agent
    evaluating live network telemetry and generating structured underwriting decisions.
    """
    telemetry = body.telemetry
    if not telemetry:
        nodes = get_current_nodes(body.template_id or "apparel")
        target_node = next((n for n in nodes if n.id == body.node_id), nodes[0])
        telemetry = {
            "asset_id": target_node.batchId or "BATCH-NX-2026-A1",
            "current_node": {
                "node_id": target_node.id,
                "stage": target_node.type.value.upper(),
                "verified_quality_pct": target_node.supplierReliabilityScore * 100.0 if target_node.supplierReliabilityScore else 96.5
            },
            "route_parameters": {
                "transit_duration_days": (target_node.baseLeadTimeDays or 14.0) + target_node.delayDays,
                "carrying_cost_usd": round(target_node.cost * (target_node.interestRate / 100.0) * ((target_node.baseLeadTimeDays or 14.0) / 365.0), 2),
                "current_credit_limit_usd": round(target_node.cost * target_node.ltvRatio, 2)
            },
            "active_disruption": {
                "event": target_node.bottleneckReason if target_node.isBottleneck else None,
                "impact_days": target_node.delayDays
            },
            "current_financial_state": {
                "active_instrument": target_node.financingInstrument.value.upper(),
                "active_lien_detected": target_node.assetState == AssetState.FINANCED and target_node.collateralHash is None
            }
        }

    decision_result = await underwrite_supply_chain_agent(
        telemetry,
        query=body.query,
        api_key=body.api_key
    )
    return decision_result

# 8. Voice Risk Underwriter Endpoint (Stretch Feature)

class VoiceAlertRequest(BaseModel):
    text: str

@app.post("/api/voice-alert")
async def voice_alert_endpoint(body: VoiceAlertRequest):
    result = await generate_voice_alert(body.text)
    return result

# 9. Global Logistics Route Intelligence Endpoints (150-Node Network)
from app.engine.route_intelligence import (
    RAW_NODES_DATA,
    ALL_EDGES,
    analyze_global_logistics_route
)

class RouteAnalyzeRequest(BaseModel):
    from_node_id: str
    to_node_id: str
    problem: Optional[str] = ""

@app.post("/api/routes/analyze")
async def analyze_route_endpoint(body: RouteAnalyzeRequest):
    """
    Analyzes FROM node, TO node, and natural-language problem description.
    Executes hybrid AI disruption extraction + NetworkX multi-objective path optimization.
    """
    try:
        result = await analyze_global_logistics_route(
            from_node_id=body.from_node_id,
            to_node_id=body.to_node_id,
            problem_text=body.problem or ""
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/routes/nodes")
def get_route_nodes():
    """Returns all 150 logistics checkpoints (50 Sea, 50 Air, 50 Rail)."""
    return {
        "total": len(RAW_NODES_DATA),
        "sea_count": len([n for n in RAW_NODES_DATA if n["type"] == "SEA"]),
        "air_count": len([n for n in RAW_NODES_DATA if n["type"] == "AIR"]),
        "rail_count": len([n for n in RAW_NODES_DATA if n["type"] == "RAIL"]),
        "nodes": RAW_NODES_DATA
    }

@app.get("/api/routes/network")
def get_route_network():
    """Returns all 150 nodes and connected graph edges."""
    return {
        "nodes": RAW_NODES_DATA,
        "edges": ALL_EDGES
    }

@app.get("/api/routes/presets")
def get_route_presets():
    return [
        {
            "id": "hormuz_conflict",
            "title": "Strait of Hormuz Armed Conflict",
            "from_node_id": "sea_41",
            "to_node_id": "sea_33",
            "problem": "Oil shipment from India to Europe. Avoid the Strait of Hormuz and Persian Gulf conflict zone due to active naval engagements and elevated regional missile risk."
        },
        {
            "id": "suez_blockade",
            "title": "Red Sea & Suez Canal Blockade",
            "from_node_id": "sea_41",
            "to_node_id": "sea_33",
            "problem": "Red Sea and Bab-el-Mandeb are blocked due to missile strikes. Suez Canal impassable. Find alternative ocean or rail route from India to Western Europe."
        },
        {
            "id": "panama_drought",
            "title": "Panama Canal Severe Drought",
            "from_node_id": "sea_21",
            "to_node_id": "sea_45",
            "problem": "Panama Canal draft restrictions and 3-week vessel transit backlog due to Lake Gatun drought. Reroute cargo from Shanghai to New York via West Coast Intermodal rail land-bridge."
        },
        {
            "id": "eurasia_airspace",
            "title": "Eurasian Airspace Closure",
            "from_node_id": "air_03",
            "to_node_id": "air_11",
            "problem": "Trans-Siberian and Eastern European airspace closed due to armed conflict. Urgent semiconductor cargo from Shanghai to Frankfurt. Find optimal safe air corridor."
        },
        {
            "id": "malacca_piracy",
            "title": "Strait of Malacca Security Surge",
            "from_node_id": "sea_28",
            "to_node_id": "sea_40",
            "problem": "High piracy and naval drill alert in Strait of Malacca. Route maritime freight from Hong Kong to Colombo via Sunda or Lombok bypass corridors."
        },
        {
            "id": "urgent_velocity",
            "title": "Critical Cold-Chain Pharma Delivery",
            "from_node_id": "air_43",
            "to_node_id": "air_20",
            "problem": "Temperature-sensitive biologics from Mumbai to Paris. Maximize transit velocity and minimize handling dwell time."
        }
    ]

# 8. Frontend Static Files Mounting
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))

if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    css_dir = os.path.join(frontend_dir, "css")
    if os.path.exists(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")

    js_dir = os.path.join(frontend_dir, "js")
    if os.path.exists(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")

    assets_dir = os.path.join(frontend_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    components_dir = os.path.join(frontend_dir, "components")
    if os.path.exists(components_dir):
        app.mount("/components", StaticFiles(directory=components_dir), name="components")

    @app.get("/")
    def serve_frontend():
        index_file = os.path.join(frontend_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "Frontend not found, please build frontend/index.html"}

    @app.get("/simulator")
    @app.get("/simulator/")
    @app.get("/simulator.html")
    @app.get("/simulator/index.html")
    def serve_simulator_page():
        sim_file = os.path.join(frontend_dir, "simulator.html")
        if os.path.exists(sim_file):
            return FileResponse(sim_file)
        return {"status": "Simulator page not found"}

    @app.get("/problem")
    @app.get("/problem/")
    @app.get("/problem.html")
    @app.get("/problem/index.html")
    @app.get("/problem-statement")
    def serve_problem_page():
        prob_file = os.path.join(frontend_dir, "problem.html")
        if os.path.exists(prob_file):
            return FileResponse(prob_file)
        return {"status": "Problem page not found"}


    @app.get("/about")
    @app.get("/about/")
    def serve_about_page():
        about_file = os.path.join(frontend_dir, "about.html")
        if os.path.exists(about_file):
            return FileResponse(about_file)
        return {"status": "About page not found"}
