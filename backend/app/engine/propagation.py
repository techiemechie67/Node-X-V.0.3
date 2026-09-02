import time
import networkx as nx
import numpy as np
from typing import List, Dict, Tuple, Any, Optional

from app.models import (
    Node,
    NodeType,
    FinancingInstrument,
    AssetState,
    DisruptionPayload,
    RefinancingEvent,
    DashboardSummary
)
from app.engine.financial import compute_node_financial_metrics, compute_network_dashboard

def run_topological_propagation(
    nodes: List[Node],
    disruption: Optional[DisruptionPayload] = None,
    node_id: Optional[str] = None,
    shock_type: Optional[str] = None,
    magnitude: Optional[float] = None
) -> Tuple[List[Node], Optional[RefinancingEvent], DashboardSummary, float]:
    """
    Applies disruption shocks, cascades delays down the NetworkX DAG in strict
    topological order, and triggers autonomous refinancing events with explainability.
    """
    start_time = time.perf_counter()

    # 1. Normalize Disruption Parameters
    target_node_id = node_id or (disruption.target_node_id if disruption else None)
    shock = shock_type or (disruption.shock_type if disruption else "port_blockade")
    mag = magnitude if magnitude is not None else (disruption.magnitude if disruption else 10.0)

    fuel_spike = (disruption.fuel_price_spike_pct if disruption else 0.0)
    supplier_delay = (disruption.supplier_delay_days if disruption else 0.0)
    shortage_ids = (disruption.shortage_node_ids if disruption else [])

    # If direct shock magnitude provided, map to specific shock parameters
    if shock == "port_blockade" or shock == "customs_delay" or shock == "route_volatility":
        route_volatility = float(mag) * 2.0
        primary_delay = float(mag)
    elif shock == "fuel_spike":
        fuel_spike = float(mag)
        route_volatility = float(mag)
        primary_delay = float(mag) * 0.3
    elif shock == "material_shortage":
        primary_delay = float(mag) * 0.8
        route_volatility = 20.0
    elif shock == "warehouse_dwell_spike":
        primary_delay = float(mag) * 0.5
        route_volatility = 10.0
    else:
        route_volatility = float(mag)
        primary_delay = float(mag)

    # 2. Build DAG
    G = nx.DiGraph()
    node_map: Dict[str, Node] = {n.id: n for n in nodes}

    for n in nodes:
        G.add_node(n.id)

    for n in nodes:
        for parent_id in n.dependsOn:
            if parent_id in node_map:
                G.add_edge(parent_id, n.id)

    # Cycle breaking safety
    if not nx.is_directed_acyclic_graph(G):
        cycles = list(nx.simple_cycles(G))
        for cycle in cycles:
            for i in range(len(cycle)):
                u, v = cycle[i], cycle[(i + 1) % len(cycle)]
                if G.has_edge(u, v):
                    G.remove_edge(u, v)

    topo_order = list(nx.topological_sort(G))

    # 3. Initialize Node State Trackers
    # node_id -> { 'accumulated_delay': float, 'cost_mult': float, 'local_delay': float, 'dwell_days': float }
    node_deltas: Dict[str, Dict[str, float]] = {
        n.id: {
            "accumulated_delay": 0.0,
            "cost_mult": 1.0,
            "local_delay": 0.0,
            "dwell_days": 0.0
        }
        for n in nodes
    }

    # Apply Initial Shocks
    # Determine target node
    if not target_node_id and primary_delay > 0:
        # Pick relevant node by shock type
        if shock in ("port_blockade", "route_volatility"):
            transit_nodes = [n for n in nodes if n.type == NodeType.TRANSIT]
            target_node_id = transit_nodes[0].id if transit_nodes else nodes[0].id
        elif shock == "warehouse_dwell_spike":
            wh_nodes = [n for n in nodes if n.type == NodeType.WAREHOUSE]
            target_node_id = wh_nodes[0].id if wh_nodes else nodes[0].id
        elif shock == "material_shortage":
            fact_nodes = [n for n in nodes if n.type == NodeType.FACTORY]
            target_node_id = fact_nodes[0].id if fact_nodes else nodes[0].id
        else:
            target_node_id = nodes[0].id

    if target_node_id and target_node_id in node_deltas:
        node_deltas[target_node_id]["local_delay"] += primary_delay
        if shock == "warehouse_dwell_spike":
            node_deltas[target_node_id]["dwell_days"] += float(mag) * 1.5
        elif shock == "port_blockade":
            node_deltas[target_node_id]["cost_mult"] *= (1.0 + (mag / 100.0) * 0.40)

    # Supplier delay override
    if supplier_delay > 0:
        for n in nodes:
            if n.type == NodeType.FACTORY:
                node_deltas[n.id]["local_delay"] += supplier_delay
                break

    # Shortage IDs
    for sid in shortage_ids:
        if sid in node_deltas:
            node_deltas[sid]["cost_mult"] *= 1.30
            node_deltas[sid]["local_delay"] += 8.0

    # Fuel price spike
    if fuel_spike > 0:
        ff = fuel_spike / 100.0
        for n in nodes:
            if n.type in (NodeType.TRANSIT, NodeType.WAREHOUSE):
                node_deltas[n.id]["cost_mult"] *= (1.0 + ff * 0.50)
                node_deltas[n.id]["local_delay"] += (ff * 4.0)

    # 4. Propagate Downstream in Topological Order
    for nid in topo_order:
        parents = list(G.predecessors(nid))
        if parents:
            max_parent_delay = max(node_deltas[p]["accumulated_delay"] for p in parents)
            # Partial upstream cost friction pass-through
            avg_parent_cost_mult = np.mean([node_deltas[p]["cost_mult"] for p in parents])
            downstream_cost_absorption = 1.0 + (avg_parent_cost_mult - 1.0) * 0.35

            node_deltas[nid]["accumulated_delay"] = max_parent_delay + node_deltas[nid]["local_delay"]
            node_deltas[nid]["cost_mult"] *= downstream_cost_absorption
        else:
            node_deltas[nid]["accumulated_delay"] = node_deltas[nid]["local_delay"]

    # 5. Compute Updated Node Metrics & Bottlenecks
    updated_nodes: List[Node] = []
    affected_node_ids: List[str] = []
    old_interest_rates = [n.interestRate for n in nodes]
    initial_avg_interest = np.mean(old_interest_rates) if old_interest_rates else 7.5

    for n in nodes:
        deltas = node_deltas[n.id]
        total_delay = round(deltas["accumulated_delay"], 1)

        # Baseline clone
        updated_n = n.model_copy()
        updated_n.delayDays = total_delay

        # Recompute physical -> financial model
        updated_n = compute_node_financial_metrics(
            node=updated_n,
            accumulated_delay=0.0,
            cost_multiplier=deltas["cost_mult"],
            route_volatility=route_volatility if updated_n.type == NodeType.TRANSIT else 0.0,
            storage_dwell_days=deltas["dwell_days"]
        )

        # Bottleneck detection
        is_bottleneck = False
        reasons = []
        if total_delay >= 4.0:
            is_bottleneck = True
            reasons.append(f"+{total_delay}d cascading delay")
        if deltas["cost_mult"] >= 1.15:
            cost_pct = round((deltas["cost_mult"] - 1.0) * 100, 1)
            is_bottleneck = True
            reasons.append(f"+{cost_pct}% cost surge")
        if updated_n.riskScore >= 0.45:
            is_bottleneck = True
            reasons.append(f"Elevated risk {round(updated_n.riskScore*100)}%")

        updated_n.isBottleneck = is_bottleneck
        updated_n.bottleneckReason = ", ".join(reasons) if reasons else None

        if total_delay > 0 or deltas["cost_mult"] > 1.01 or is_bottleneck:
            affected_node_ids.append(updated_n.id)

        updated_nodes.append(updated_n)

    # 6. Compute Network Dashboard
    dashboard = compute_network_dashboard(updated_nodes)

    # 7. Evaluate Autonomous Refinancing Event
    max_cascading_delay = max((n.delayDays for n in updated_nodes), default=0.0)
    avg_new_interest = np.mean([n.interestRate for n in updated_nodes]) if updated_nodes else 7.5
    interest_rate_delta_bps = round((avg_new_interest - initial_avg_interest) * 100)

    refinancing_event: Optional[RefinancingEvent] = None
    target_node_name = node_map[target_node_id].name if (target_node_id and target_node_id in node_map) else "Supply Chain"

    if max_cascading_delay >= 3.0 or mag >= 5.0 or len(affected_node_ids) > 0:
        # Check liquidity runway breach
        liquidity_breach = dashboard.liquidityRunwayDays < 20.0
        severity = "CRITICAL" if (liquidity_breach or max_cascading_delay >= 12.0) else "WARNING"

        reason_parts = []
        if shock == "port_blockade":
            reason_parts.append(f"Maritime disruption on '{target_node_name}' created a +{max_cascading_delay}d bottleneck")
        elif shock == "customs_delay":
            reason_parts.append(f"Border clearance delay on '{target_node_name}' pushed lead times out by +{max_cascading_delay}d")
        elif shock == "fuel_spike":
            reason_parts.append(f"Fuel volatility surged operating logistics costs across transit nodes")
        elif shock == "material_shortage":
            reason_parts.append(f"Component shortage at '{target_node_name}' triggered Tier-1 PO financing repricing")
        elif shock == "warehouse_dwell_spike":
            reason_parts.append(f"Stagnant warehouse dwell duration increased degradation risk, depressing inventory LTV leverage")
        else:
            reason_parts.append(f"Physical shock of magnitude {mag} propagated across {len(affected_node_ids)} downstream nodes")

        reason_parts.append(f"Dynamic interest rates increased by +{max(0, interest_rate_delta_bps)} bps to {avg_new_interest:.2f}%")
        reason_parts.append(f"LTV facilities contracted across affected tiers to safeguard lender capital.")

        if liquidity_breach:
            reason_parts.append(f"CRITICAL: Liquidity runway compressed to {dashboard.liquidityRunwayDays} days (below 20-day threshold).")

        full_reason = " — ".join(reason_parts)

        refinancing_event = RefinancingEvent(
            triggered=True,
            reason=f"Refinancing triggered — {full_reason}",
            newInterestRate=round(avg_new_interest, 2),
            oldInterestRate=round(initial_avg_interest, 2),
            affectedNodeIds=affected_node_ids,
            severity=severity,
            liquidityRunwayBreach=liquidity_breach,
            liquidityBreachDays=dashboard.liquidityRunwayDays
        )

    exec_time_ms = round((time.perf_counter() - start_time) * 1000.0, 3)

    return updated_nodes, refinancing_event, dashboard, exec_time_ms
