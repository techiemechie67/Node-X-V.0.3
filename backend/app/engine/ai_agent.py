import os
from pathlib import Path
from typing import Any, Dict, Optional

# Load environment variables from backend/.env if available
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    # Fallback if python-dotenv is not yet installed
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip().strip("'\""))
        except Exception:
            pass

# Import AsyncOpenAI client
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

# Initialize DeepSeek Async Client via OpenAI client SDK
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_BASE_URL = os.getenv(
    "GROQ_BASE_URL",
    "https://api.groq.com/openai/v1"
).strip()

client: Optional[Any] = None

if AsyncOpenAI is not None and GROQ_API_KEY:
    client = AsyncOpenAI(
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL
    )


def _extract_field(obj: Any, field_names: list, default: Any = "N/A") -> Any:
    """Helper to safely extract attributes across Pydantic models or dictionaries."""
    for name in field_names:
        if isinstance(obj, dict) and name in obj and obj[name] is not None:
            val = obj[name]
            return val.value if hasattr(val, "value") else val
        if hasattr(obj, name) and getattr(obj, name) is not None:
            val = getattr(obj, name)
            return val.value if hasattr(val, "value") else val
    return default


async def generate_decision_explanation(asset_state: Any, deterministic_decision: Any) -> str:
    """
    Generates a concise, 2-sentence professional underwriter summary explaining why
    the financing decision was made based on deterministic asset telemetry, risk vectors,
    and facility constraints using DeepSeek (deepseek-chat).
    
    Falls back gracefully to the deterministic reasoning string if the API call fails or times out.
    """
    # 1. Capture original deterministic reasoning for safe fallback
    fallback_reasoning = _extract_field(
        deterministic_decision,
        ["reasoning", "rationale", "summary_reasoning"],
        default="Working capital financing evaluated under deterministic risk and facility constraints."
    )

    # 2. Extract deterministic data points
    stage = _extract_field(deterministic_decision, ["lifecycle_stage", "lifecycleStage"])
    if stage == "N/A":
        stage = _extract_field(asset_state, ["lifecycle_stage", "lifecycleStage"])

    instrument = _extract_field(
        deterministic_decision,
        ["recommended_instrument", "selectedInstrument", "instrument"]
    )
    
    approved_amount = _extract_field(
        deterministic_decision,
        ["approved_amount", "recommendedAmount", "approvedAmount"],
        default=0.0
    )
    
    action = _extract_field(
        deterministic_decision,
        ["action"],
        default="MAINTAIN"
    )

    # Extract risk score
    risk_score = "N/A"
    risk_summary = getattr(deterministic_decision, "risk_summary", None)
    if isinstance(risk_summary, dict) and "composite_score_100" in risk_summary:
        risk_score = f"{risk_summary['composite_score_100']:.1f}/100"
    elif hasattr(deterministic_decision, "riskScore"):
        risk_score = f"{deterministic_decision.riskScore:.2f}"
    elif hasattr(asset_state, "risk_state") and hasattr(asset_state.risk_state, "composite_risk_score"):
        risk_score = f"{asset_state.risk_state.composite_risk_score * 100:.1f}/100"
    elif hasattr(asset_state, "riskState") and hasattr(asset_state.riskState, "compositeScore"):
        risk_score = f"{asset_state.riskState.compositeScore * 100:.1f}/100"

    # Format approved amount
    try:
        amount_formatted = f"${float(approved_amount):,.2f}"
    except (ValueError, TypeError):
        amount_formatted = str(approved_amount)

    # 3. Check client readiness and execute Groq completion
    primary_key = os.getenv("GROQ_API_KEY", "").strip()
    failover_key = os.getenv("GROQ_API_KEY_1", "").strip()
    base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip()
    model_name = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

    keys_to_try = []
    if primary_key and primary_key != "your_key_here":
        keys_to_try.append(("PRIMARY", primary_key))
    if failover_key and failover_key != "your_key_here" and failover_key != primary_key:
        keys_to_try.append(("FAILOVER", failover_key))

    if not keys_to_try or AsyncOpenAI is None:
        return fallback_reasoning  
 
    system_prompt = (
        "You are an autonomous institutional credit and supply-chain risk underwriter. "
        "Return a concise, exactly 2-sentence professional underwriter summary explaining why this "
        "financing decision was made based on the provided asset telemetry, risk metrics, and credit facility constraints. "
        "Do not include bullet points, markdown headers, or introductory phrases."
    )

    user_prompt = (
        f"Underwriting Parameters:\n"
        f"- Physical Lifecycle Stage: {stage}\n"
        f"- Financing Action: {action}\n"
        f"- Selected Instrument: {instrument}\n"
        f"- Approved Facility Amount: {amount_formatted}\n"
        f"- Risk Score: {risk_score}\n"
        f"- Baseline Deterministic Reasoning: {fallback_reasoning}\n\n"
        f"Provide a concise, 2-sentence professional underwriter summary explaining why this financing decision was made."
    )

    for key_label, eff_key in keys_to_try:
        for try_model in [model_name, "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]:
            try:
                live_client = AsyncOpenAI(api_key=eff_key, base_url=base_url)
                response = await live_client.chat.completions.create(
                    model=try_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=1024,
                    timeout=15.0
                )
                content = (response.choices[0].message.content or "").strip()
                if content:
                    return content
            except Exception as e:
                print(f"[Groq Explanation Notice] {key_label} with {try_model} failed: {e}")

    return fallback_reasoning


UNDERWRITER_SYSTEM_PROMPT = """You are the Autonomous Supply-Chain Underwriter AI for Node-X-Logistics. Your objective is to track the economic lifecycle of physical supply-chain assets and dynamically determine how those assets should be financed as their physical, financial, and contractual states evolve.

Core Directives:
1. State Reconciliation: Analyze incoming telemetry to verify physical and contractual state before authorizing capital.
2. Dynamic Instrument Selection: Autonomously transition the active financial instrument as the asset clears physical nodes across Purchase Order, In-Transit, Warehouse, and Invoice Factoring stages.
3. Disruption Response: Reassess value and risk based on material supply-chain events (delays, cost spikes) and dynamically recalculate working capital limits and carrying costs.
4. Fraud Prevention: Cross-reference active liens to maintain awareness of financing already associated with the underlying asset. If active_lien_detected is true, or if risk is Critical, you MUST set action to "Reject". Populate the webhook_trigger object to alert external Compliance/Fraud APIs.

Output Constraints:
Respond ONLY with a valid JSON object matching the exact schema below. Do not include conversational text, markdown formatting blocks, or explanations outside the JSON structure:
{
  "underwriting_decision": {
    "action": "Initiate | Refinance | Transition | Settle | Reject",
    "recommended_instrument": "string or null",
    "revised_carrying_cost": 0.0,
    "revised_credit_limit": 0.0,
    "risk_score": "Low | Moderate | High | Critical",
    "auto_reasoning": "string"
  },
  "webhook_trigger": {
    "execute": false,
    "target_system": "FRAUD_OPS | RISK_MANAGEMENT | NONE",
    "alert_reason": "string or null"
  }
}"""


async def underwrite_supply_chain_agent(
    telemetry_payload: Dict[str, Any],
    query: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the Autonomous Supply-Chain Underwriter AI agent using Groq LLM.
    Evaluates physical state, routes, active disruptions, and active lien encumbrances,
    returning structured underwriting actions and automated compliance webhook triggers.
    """
    import json
    import re

    primary_key = (api_key or os.getenv("GROQ_API_KEY", "")).strip()
    failover_key = os.getenv("GROQ_API_KEY_1", "").strip()
    base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip()
    model_name = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

    keys_to_try = []
    if primary_key and primary_key != "your_key_here":
        keys_to_try.append(("PRIMARY", primary_key))
    if failover_key and failover_key != "your_key_here" and failover_key != primary_key:
        keys_to_try.append(("FAILOVER", failover_key))

    last_api_error = None
    # 1. Attempt live AI Chat Completion with JSON extraction across keys and candidate models
    if keys_to_try and AsyncOpenAI is not None:
        user_content = json.dumps(telemetry_payload, indent=2)
        if query:
            user_content = f"User Strategic Query / Parameter Override: \"{query}\"\n\nLive Supply Chain Telemetry Payload:\n{user_content}"

        for key_label, eff_key in keys_to_try:
            for try_model in [model_name, "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]:
                try:
                    live_client = AsyncOpenAI(api_key=eff_key, base_url=base_url)
                    response = await live_client.chat.completions.create(
                        model=try_model,
                        messages=[
                            {"role": "system", "content": UNDERWRITER_SYSTEM_PROMPT},
                            {"role": "user", "content": user_content}
                        ],
                        temperature=0.1,
                        max_tokens=1500,
                        timeout=15.0
                    )
                    raw_json = (response.choices[0].message.content or "").strip()
                    if raw_json.startswith("```"):
                        raw_json = re.sub(r"^```[a-z]*\s*", "", raw_json, flags=re.MULTILINE)
                        raw_json = re.sub(r"```\s*$", "", raw_json, flags=re.MULTILINE).strip()
                    match = re.search(r'\{.*\}', raw_json, re.DOTALL)
                    if match:
                        raw_json = match.group(0)
                    parsed = json.loads(raw_json)
                    if "underwriting_decision" in parsed:
                        parsed["engine_source"] = f"GROQ_{key_label}_{try_model.upper().replace('/', '_')}"
                        return parsed
                except Exception as e:
                    last_api_error = str(e)
                    print(f"[Groq Live Underwriter Notice] {key_label} key with model {try_model} failed ({e})")

    # 2. Deterministic Fallback Logic (Matching exact schema specifications)
    current_node = telemetry_payload.get("current_node", {})
    route_params = telemetry_payload.get("route_parameters", {})
    disruption = telemetry_payload.get("active_disruption", {})
    fin_state = telemetry_payload.get("current_financial_state", {})

    stage = (current_node.get("stage") or "TRANSIT").upper()
    quality = float(current_node.get("verified_quality_pct") or 96.5)
    transit_days = float(route_params.get("transit_duration_days") or 14.0)
    current_limit = float(route_params.get("current_credit_limit_usd") or 160000.0)
    current_carrying = float(route_params.get("carrying_cost_usd") or 7460.0)

    has_active_lien = bool(fin_state.get("active_lien_detected", False))
    disruption_event = disruption.get("event")
    impact_days = float(disruption.get("impact_days") or 0.0)

    # Instrument mapping by stage
    instrument_map = {
        "ORIGIN": "Purchase Order Financing",
        "PROCESSING": "Procurement Financing",
        "ASSEMBLY": "Inventory Financing",
        "TRANSIT": "In-Transit Asset-Backed Lending",
        "CUSTOMS": "Trade Financing Guarantee",
        "WAREHOUSE": "Warehouse Financing",
        "DISTRIBUTION": "Invoice Factoring",
        "DELIVERY": "Receivables Factoring",
        "CASH": None
    }
    recommended_instrument = instrument_map.get(stage, "In-Transit Asset-Backed Lending")

    if has_active_lien:
        return {
            "engine_source": "DETERMINISTIC_FALLBACK",
            "api_notice": last_api_error,
            "underwriting_decision": {
                "action": "Reject",
                "recommended_instrument": None,
                "revised_carrying_cost": 0.0,
                "revised_credit_limit": 0.0,
                "risk_score": "Critical",
                "auto_reasoning": "Duplicate collateral lien detected on asset registry; financing rejected to prevent over-leveraging."
            },
            "webhook_trigger": {
                "execute": True,
                "target_system": "FRAUD_OPS",
                "alert_reason": "DUPLICATE_LIEN_DETECTED"
            }
        }

    if stage == "CASH":
        return {
            "engine_source": "DETERMINISTIC_FALLBACK",
            "api_notice": last_api_error,
            "underwriting_decision": {
                "action": "Settle",
                "recommended_instrument": None,
                "revised_carrying_cost": 0.0,
                "revised_credit_limit": 0.0,
                "risk_score": "Low",
                "auto_reasoning": "Cash realization completed at destination dock; active collateral lien extinguished."
            },
            "webhook_trigger": {
                "execute": False,
                "target_system": "NONE",
                "alert_reason": None
            }
        }

    if disruption_event or impact_days > 5.0 or quality < 90.0:
        revised_carrying = round(current_carrying * (1.0 + (impact_days / 15.0) * 0.4), 2)
        revised_limit = round(max(20000.0, current_limit * (1.0 - min(0.45, impact_days * 0.03))), 2)
        risk_score = "High" if impact_days > 12.0 else "Moderate"

        return {
            "engine_source": "DETERMINISTIC_FALLBACK",
            "api_notice": last_api_error,
            "underwriting_decision": {
                "action": "Refinance",
                "recommended_instrument": recommended_instrument,
                "revised_carrying_cost": revised_carrying,
                "revised_credit_limit": revised_limit,
                "risk_score": risk_score,
                "auto_reasoning": f"Disruption '{disruption_event or 'Transit Delay'}' added +{impact_days}d delay, recalculating dynamic carrying cost and LTV capacity."
            },
            "webhook_trigger": {
                "execute": impact_days > 12.0,
                "target_system": "RISK_MANAGEMENT" if impact_days > 12.0 else "NONE",
                "alert_reason": "SUPPLY_CHAIN_BOTTLENECK_SHOCK" if impact_days > 12.0 else None
            }
        }

    # Nominal Stage Transition or Initiation
    return {
        "engine_source": "DETERMINISTIC_FALLBACK",
        "api_notice": last_api_error,
        "underwriting_decision": {
            "action": "Transition" if fin_state.get("active_instrument") else "Initiate",
            "recommended_instrument": recommended_instrument,
            "revised_carrying_cost": current_carrying,
            "revised_credit_limit": current_limit,
            "risk_score": "Low",
            "auto_reasoning": f"Asset physical custody verified at stage '{stage}' with {quality:.1f}% quality preservation, authorizing {recommended_instrument}."
        },
        "webhook_trigger": {
            "execute": False,
            "target_system": "NONE",
            "alert_reason": None
        }
    }
