from typing import List, Dict, Any, Tuple
from app.models import Node, NodeType, FinancingInstrument, AssetState, DashboardSummary

def compute_node_financial_metrics(
    node: Node,
    accumulated_delay: float = 0.0,
    cost_multiplier: float = 1.0,
    route_volatility: float = 0.0,
    storage_dwell_days: float = 0.0
) -> Node:
    """
    Deterministically computes financial pricing and risk metrics for a single node
    based strictly on its physical supply chain state.
    """
    updated_cost = round(node.cost * cost_multiplier, 2)
    effective_delay = max(0.0, round(node.delayDays + accumulated_delay, 1))

    # Base baseline cost if not already set
    if node.baseCost is None:
        node.baseCost = node.cost

    node.cost = updated_cost

    # 1. FACTORY NODE -> PO FINANCING
    if node.type == NodeType.FACTORY or node.financingInstrument == FinancingInstrument.PO_FINANCING:
        node.financingInstrument = FinancingInstrument.PO_FINANCING
        node.tier = 1

        # Reliability score derived from historical delay rate
        base_rel = getattr(node, "supplierReliabilityScore", 0.94) or 0.94
        delay_penalty = (effective_delay / 25.0) * 0.45
        reliability_score = max(0.35, min(1.0, round(base_rel - delay_penalty, 3)))
        node.supplierReliabilityScore = reliability_score

        # Rule: loanAmount = base_credit * supplier_reliability_score
        base_credit = updated_cost * 0.85
        node.loanAmount = round(base_credit * reliability_score, 2)
        node.ltvRatio = round(0.85 * reliability_score, 3)
        node.riskScore = round(1.0 - reliability_score, 3)
        node.interestRate = round(6.50 + (1.0 - reliability_score) * 6.50, 2)

    # 2. TRANSIT NODE -> ASSET-BACKED LENDING
    elif node.type == NodeType.TRANSIT or node.financingInstrument == FinancingInstrument.ASSET_BACKED_LENDING:
        node.financingInstrument = FinancingInstrument.ASSET_BACKED_LENDING
        node.tier = 2

        # Risk score recalculates as route volatility / transit delay increases
        delay_risk = (effective_delay / 18.0) * 0.55
        vol_risk = (route_volatility / 100.0) * 0.45
        risk_score = min(1.0, max(0.08, round(0.10 + delay_risk + vol_risk, 3)))
        node.riskScore = risk_score

        # LTV ratio shrinks as risk rises
        ltv = max(0.28, round(0.82 * (1.0 - risk_score * 0.58), 3))
        node.ltvRatio = ltv
        node.loanAmount = round(updated_cost * ltv, 2)
        node.interestRate = round(7.00 + risk_score * 7.50, 2)

    # 3. WAREHOUSE NODE -> INVENTORY FINANCING
    elif node.type == NodeType.WAREHOUSE or node.financingInstrument == FinancingInstrument.INVENTORY_FINANCING:
        node.financingInstrument = FinancingInstrument.INVENTORY_FINANCING
        node.tier = 3

        total_dwell = (node.storageDurationDays or 0.0) + storage_dwell_days
        node.storageDurationDays = round(total_dwell, 1)

        # Risk score increases with storage duration (degradation / obsolescence risk)
        dwell_risk = (total_dwell / 40.0) * 0.60
        delay_risk = (effective_delay / 22.0) * 0.30
        risk_score = min(1.0, max(0.06, round(0.12 + dwell_risk + delay_risk, 3)))
        node.riskScore = risk_score

        # Leverage recalculates downward the longer inventory sits
        ltv = max(0.20, round(0.78 - (total_dwell / 48.0) * 0.42, 3))
        node.ltvRatio = ltv
        node.loanAmount = round(updated_cost * ltv, 2)
        node.interestRate = round(7.20 + (total_dwell / 25.0) * 3.80 + risk_score * 3.20, 2)

    # 4. DELIVERY NODE -> INVOICE FACTORING
    elif node.type == NodeType.DELIVERY or node.financingInstrument == FinancingInstrument.INVOICE_FACTORING:
        node.financingInstrument = FinancingInstrument.INVOICE_FACTORING
        node.tier = 4

        # Settles prior financing tiers on cash realization; calculates final factoring discount
        delay_penalty = (effective_delay / 25.0) * 2.50
        discount_pct = min(9.0, max(1.5, round(1.80 + delay_penalty, 2)))
        advance_rate = max(0.50, round((100.0 - discount_pct) / 100.0, 3))

        node.ltvRatio = advance_rate
        node.loanAmount = round(updated_cost * advance_rate, 2)
        node.riskScore = min(1.0, max(0.05, round(discount_pct / 10.0, 3)))
        node.interestRate = discount_pct  # Factoring fee rate %

    return node

def compute_network_dashboard(nodes: List[Node]) -> DashboardSummary:
    """
    Computes aggregated capital exposure, weighted cost of capital, and risk metrics.
    """
    total_exposure = 0.0
    total_cost = 0.0
    settled_capital = 0.0
    weighted_rate_sum = 0.0
    risk_sum = 0.0
    bottleneck_count = 0
    unfinanced_count = 0
    financed_count = 0
    settled_count = 0
    active_instruments = set()
    total_lead_time_days = 0.0

    for n in nodes:
        total_cost += n.cost
        total_lead_time_days += (n.baseLeadTimeDays or 5.0) + n.delayDays
        risk_sum += n.riskScore

        if n.isBottleneck:
            bottleneck_count += 1

        if n.assetState == AssetState.FINANCED:
            financed_count += 1
            total_exposure += n.loanAmount
            weighted_rate_sum += (n.interestRate * n.loanAmount)
            active_instruments.add(n.financingInstrument.value)
        elif n.assetState == AssetState.SETTLED:
            settled_count += 1
            settled_capital += n.loanAmount
        else:
            unfinanced_count += 1
            # If not yet actively financed, potential exposure based on loanAmount
            active_instruments.add(n.financingInstrument.value)

    num_nodes = max(1, len(nodes))
    avg_risk_score = round(risk_sum / num_nodes, 3)

    # Weighted Average Cost of Capital (WACC) across active loans
    if total_exposure > 0:
        wacc = round(weighted_rate_sum / total_exposure, 2)
    else:
        # Benchmark baseline rate across instruments
        wacc = round(sum(n.interestRate for n in nodes) / num_nodes, 2)

    # Cash Conversion Cycle (CCC) in days
    ccc_days = round(total_lead_time_days * 0.85, 1)

    # Liquidity Runway: baseline 45 days minus cascading delay
    max_delay = max((n.delayDays for n in nodes), default=0.0)
    liquidity_runway = max(5.0, round(45.0 - max_delay * 0.9, 1))

    return DashboardSummary(
        totalExposure=round(total_exposure, 2),
        avgRiskScore=avg_risk_score,
        activeInstruments=sorted(list(active_instruments)),
        cashConversionCycleDays=ccc_days,
        wacc=wacc,
        liquidityRunwayDays=liquidity_runway,
        settledCapital=round(settled_capital, 2),
        totalCost=round(total_cost, 2),
        bottleneckCount=bottleneck_count,
        unfinancedCount=unfinanced_count,
        financedCount=financed_count,
        settledCount=settled_count
    )
