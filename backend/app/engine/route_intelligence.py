"""
Node-X-Logistics — Global Route Intelligence Engine
150 Logistics Checkpoints (50 Maritime Sea Nodes, 50 Air Cargo Hubs, 50 Rail Freight Hubs)
Hybrid AI Disruption Extractor + NetworkX Deterministic Path Optimizer
IEEE HACKVERSE 2026 #6
"""

import os
import json
import math
import re
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import networkx as nx

# 1. Load environment variables
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except Exception:
    pass

try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

# Primary and failover API keys + model loaded from .env
GROQ_API_KEY   = os.getenv("GROQ_API_KEY",   "").strip()
GROQ_API_KEY_1 = os.getenv("GROQ_API_KEY_1", "").strip()
GROQ_BASE_URL  = os.getenv("GROQ_BASE_URL",  "https://api.groq.com/openai/v1").strip()
GROQ_MODEL     = os.getenv("GROQ_MODEL",     "openai/gpt-oss-120b").strip()

print(f"[Route AI] Primary key loaded: {bool(GROQ_API_KEY)} | Failover key loaded: {bool(GROQ_API_KEY_1)} | Model: {GROQ_MODEL}")

# ==============================================================================
# THE 150 LOGISTICS CHECKPOINTS DATASET
# 50 MARITIME SHIPPING + 50 AIR CARGO + 50 RAIL FREIGHT = 150 NODES
# ==============================================================================

RAW_NODES_DATA: List[Dict[str, Any]] = [
    # --------------------------------------------------------------------------
    # MARITIME SHIPPING — 50 NODES
    # --------------------------------------------------------------------------
    {
        "id": "sea_01",
        "num": 1,
        "name": "Strait of Malacca",
        "type": "SEA",
        "location": "Malaysia / Singapore / Indonesia",
        "region": "Southeast Asia",
        "lat": 1.43,
        "lng": 102.89,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 11,
        "expected_loss_usd": 2203,
        "chokepoint": True
    },
    {
        "id": "sea_02",
        "num": 2,
        "name": "Suez Canal",
        "type": "SEA",
        "location": "Egypt",
        "region": "Middle East / North Africa",
        "lat": 30.58,
        "lng": 32.56,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 30,
        "expected_loss_usd": 6800,
        "chokepoint": True
    },
    {
        "id": "sea_03",
        "num": 3,
        "name": "Panama Canal",
        "type": "SEA",
        "location": "Panama",
        "region": "Central America",
        "lat": 9.10,
        "lng": -79.69,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 23,
        "expected_loss_usd": 4607,
        "chokepoint": True
    },
    {
        "id": "sea_04",
        "num": 4,
        "name": "Strait of Hormuz",
        "type": "SEA",
        "location": "Oman / Iran",
        "region": "Middle East",
        "lat": 26.56,
        "lng": 56.25,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 21,
        "expected_loss_usd": 3658,
        "chokepoint": True
    },
    {
        "id": "sea_05",
        "num": 5,
        "name": "Bab-el-Mandeb Strait",
        "type": "SEA",
        "location": "Djibouti / Yemen",
        "region": "Red Sea / Middle East",
        "lat": 12.58,
        "lng": 43.33,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 19,
        "expected_loss_usd": 4807,
        "chokepoint": True
    },
    {
        "id": "sea_06",
        "num": 6,
        "name": "Strait of Gibraltar",
        "type": "SEA",
        "location": "Spain / Morocco",
        "region": "Mediterranean / Europe",
        "lat": 35.96,
        "lng": -5.60,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190,
        "chokepoint": True
    },
    {
        "id": "sea_07",
        "num": 7,
        "name": "Bosphorus & Dardanelles",
        "type": "SEA",
        "location": "Turkey",
        "region": "Black Sea / Europe",
        "lat": 41.12,
        "lng": 29.08,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 18,
        "expected_loss_usd": 3605,
        "chokepoint": True
    },
    {
        "id": "sea_08",
        "num": 8,
        "name": "English Channel",
        "type": "SEA",
        "location": "UK / France",
        "region": "North Europe",
        "lat": 50.18,
        "lng": -0.53,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 17,
        "expected_loss_usd": 2962,
        "chokepoint": True
    },
    {
        "id": "sea_09",
        "num": 9,
        "name": "Danish Straits",
        "type": "SEA",
        "location": "Denmark / Sweden",
        "region": "Baltic / Europe",
        "lat": 55.58,
        "lng": 11.08,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "HIGH",
        "expected_delay_hours": 4,
        "expected_loss_usd": 590,
        "chokepoint": True
    },
    {
        "id": "sea_10",
        "num": 10,
        "name": "Cape of Good Hope",
        "type": "SEA",
        "location": "South Africa",
        "region": "Southern Africa",
        "lat": -34.35,
        "lng": 18.47,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "HIGH",
        "expected_delay_hours": 16,
        "expected_loss_usd": 3626,
        "chokepoint": True
    },
    {
        "id": "sea_11",
        "num": 11,
        "name": "Sunda Strait",
        "type": "SEA",
        "location": "Indonesia",
        "region": "Southeast Asia",
        "lat": -5.98,
        "lng": 105.77,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358,
        "chokepoint": True
    },
    {
        "id": "sea_12",
        "num": 12,
        "name": "Lombok Strait",
        "type": "SEA",
        "location": "Indonesia",
        "region": "Southeast Asia",
        "lat": -8.54,
        "lng": 115.72,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024,
        "chokepoint": True
    },
    {
        "id": "sea_13",
        "num": 13,
        "name": "Makassar Strait",
        "type": "SEA",
        "location": "Indonesia",
        "region": "Southeast Asia",
        "lat": -0.80,
        "lng": 118.60,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358,
        "chokepoint": True
    },
    {
        "id": "sea_14",
        "num": 14,
        "name": "Strait of Magellan",
        "type": "SEA",
        "location": "Chile",
        "region": "South America",
        "lat": -53.48,
        "lng": -70.78,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024,
        "chokepoint": True
    },
    {
        "id": "sea_15",
        "num": 15,
        "name": "Drake Passage / Cape Horn",
        "type": "SEA",
        "location": "Chile / Antarctica",
        "region": "South America",
        "lat": -56.50,
        "lng": -67.27,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024,
        "chokepoint": True
    },
    {
        "id": "sea_16",
        "num": 16,
        "name": "Kiel Canal",
        "type": "SEA",
        "location": "Germany",
        "region": "North Europe",
        "lat": 54.26,
        "lng": 9.59,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024,
        "chokepoint": True
    },
    {
        "id": "sea_17",
        "num": 17,
        "name": "Saint Lawrence Seaway",
        "type": "SEA",
        "location": "Canada / USA",
        "region": "North America",
        "lat": 44.97,
        "lng": -74.90,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875,
        "chokepoint": True
    },
    {
        "id": "sea_18",
        "num": 18,
        "name": "Torres Strait",
        "type": "SEA",
        "location": "Australia / Papua New Guinea",
        "region": "Oceania",
        "lat": -10.25,
        "lng": 142.17,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581,
        "chokepoint": True
    },
    {
        "id": "sea_19",
        "num": 19,
        "name": "Cook Strait",
        "type": "SEA",
        "location": "New Zealand",
        "region": "Oceania",
        "lat": -41.23,
        "lng": 174.55,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358,
        "chokepoint": True
    },
    {
        "id": "sea_20",
        "num": 20,
        "name": "Strait of Messina",
        "type": "SEA",
        "location": "Italy",
        "region": "Mediterranean / Europe",
        "lat": 38.22,
        "lng": 15.63,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024,
        "chokepoint": True
    },
    {
        "id": "sea_21",
        "num": 21,
        "name": "Port of Shanghai (Yangshan)",
        "type": "SEA",
        "location": "China",
        "region": "East Asia",
        "lat": 30.63,
        "lng": 122.06,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 20,
        "expected_loss_usd": 3479,
        "chokepoint": False
    },
    {
        "id": "sea_22",
        "num": 22,
        "name": "Port of Singapore",
        "type": "SEA",
        "location": "Singapore",
        "region": "Southeast Asia",
        "lat": 1.26,
        "lng": 103.82,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 29,
        "expected_loss_usd": 2751,
        "chokepoint": False
    },
    {
        "id": "sea_23",
        "num": 23,
        "name": "Port of Ningbo-Zhoushan",
        "type": "SEA",
        "location": "China",
        "region": "East Asia",
        "lat": 29.89,
        "lng": 121.84,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 21,
        "expected_loss_usd": 2551,
        "chokepoint": False
    },
    {
        "id": "sea_24",
        "num": 24,
        "name": "Port of Shenzhen (Yantian/Shekou)",
        "type": "SEA",
        "location": "China",
        "region": "East Asia",
        "lat": 22.58,
        "lng": 114.28,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 25,
        "expected_loss_usd": 5672,
        "chokepoint": False
    },
    {
        "id": "sea_25",
        "num": 25,
        "name": "Port of Guangzhou (Nansha)",
        "type": "SEA",
        "location": "China",
        "region": "East Asia",
        "lat": 22.75,
        "lng": 113.62,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875,
        "chokepoint": False
    },
    {
        "id": "sea_26",
        "num": 26,
        "name": "Port of Busan",
        "type": "SEA",
        "location": "South Korea",
        "region": "East Asia",
        "lat": 35.10,
        "lng": 129.04,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024,
        "chokepoint": False
    },
    {
        "id": "sea_27",
        "num": 27,
        "name": "Port of Qingdao",
        "type": "SEA",
        "location": "China",
        "region": "East Asia",
        "lat": 36.06,
        "lng": 120.32,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190,
        "chokepoint": False
    },
    {
        "id": "sea_28",
        "num": 28,
        "name": "Port of Hong Kong (Kwai Tsing)",
        "type": "SEA",
        "location": "Hong Kong",
        "region": "East Asia",
        "lat": 22.34,
        "lng": 114.12,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024,
        "chokepoint": False
    },
    {
        "id": "sea_29",
        "num": 29,
        "name": "Port of Tianjin",
        "type": "SEA",
        "location": "China",
        "region": "East Asia",
        "lat": 38.98,
        "lng": 117.75,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358,
        "chokepoint": False
    },
    {
        "id": "sea_30",
        "num": 30,
        "name": "Port of Kaohsiung",
        "type": "SEA",
        "location": "Taiwan",
        "region": "East Asia",
        "lat": 22.61,
        "lng": 120.28,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024,
        "chokepoint": False
    },
    {
        "id": "sea_31",
        "num": 31,
        "name": "Port of Tanjung Pelepas (PTP)",
        "type": "SEA",
        "location": "Malaysia",
        "region": "Southeast Asia",
        "lat": 1.36,
        "lng": 103.55,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "HIGH",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875,
        "chokepoint": False
    },
    {
        "id": "sea_32",
        "num": 32,
        "name": "Port Klang",
        "type": "SEA",
        "location": "Malaysia",
        "region": "Southeast Asia",
        "lat": 3.00,
        "lng": 101.40,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 14,
        "expected_loss_usd": 3173,
        "chokepoint": False
    },
    {
        "id": "sea_33",
        "num": 33,
        "name": "Port of Rotterdam",
        "type": "SEA",
        "location": "Netherlands",
        "region": "North Europe",
        "lat": 51.95,
        "lng": 4.13,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 23,
        "expected_loss_usd": 2783,
        "chokepoint": False
    },
    {
        "id": "sea_34",
        "num": 34,
        "name": "Port of Antwerp-Bruges",
        "type": "SEA",
        "location": "Belgium",
        "region": "North Europe",
        "lat": 51.28,
        "lng": 4.34,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 14,
        "expected_loss_usd": 1328,
        "chokepoint": False
    },
    {
        "id": "sea_35",
        "num": 35,
        "name": "Port of Hamburg",
        "type": "SEA",
        "location": "Germany",
        "region": "North Europe",
        "lat": 53.53,
        "lng": 9.97,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 7,
        "expected_loss_usd": 843,
        "chokepoint": False
    },
    {
        "id": "sea_36",
        "num": 36,
        "name": "Port of Valencia",
        "type": "SEA",
        "location": "Spain",
        "region": "Mediterranean / Europe",
        "lat": 39.45,
        "lng": -0.32,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "HIGH",
        "expected_delay_hours": 17,
        "expected_loss_usd": 2962,
        "chokepoint": False
    },
    {
        "id": "sea_37",
        "num": 37,
        "name": "Port of Piraeus",
        "type": "SEA",
        "location": "Greece",
        "region": "Mediterranean / Europe",
        "lat": 37.94,
        "lng": 23.63,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 15,
        "expected_loss_usd": 2614,
        "chokepoint": False
    },
    {
        "id": "sea_38",
        "num": 38,
        "name": "Port of Jebel Ali (Dubai)",
        "type": "SEA",
        "location": "UAE",
        "region": "Middle East",
        "lat": 25.01,
        "lng": 55.06,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 31,
        "expected_loss_usd": 7843,
        "chokepoint": False
    },
    {
        "id": "sea_39",
        "num": 39,
        "name": "Port of Salalah",
        "type": "SEA",
        "location": "Oman",
        "region": "Middle East / Indian Ocean",
        "lat": 16.94,
        "lng": 54.00,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "HIGH",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358,
        "chokepoint": False
    },
    {
        "id": "sea_40",
        "num": 40,
        "name": "Port of Colombo",
        "type": "SEA",
        "location": "Sri Lanka",
        "region": "South Asia / Indian Ocean",
        "lat": 6.95,
        "lng": 79.85,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 18,
        "expected_loss_usd": 2182,
        "chokepoint": False
    },
    {
        "id": "sea_41",
        "num": 41,
        "name": "Jawaharlal Nehru Port (JNPT / Nhava Sheva)",
        "type": "SEA",
        "location": "India",
        "region": "South Asia",
        "lat": 18.95,
        "lng": 72.95,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202,
        "chokepoint": False
    },
    {
        "id": "sea_42",
        "num": 42,
        "name": "Mundra Port",
        "type": "SEA",
        "location": "India",
        "region": "South Asia",
        "lat": 22.74,
        "lng": 69.70,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190,
        "chokepoint": False
    },
    {
        "id": "sea_43",
        "num": 43,
        "name": "Port of Los Angeles",
        "type": "SEA",
        "location": "USA",
        "region": "North America",
        "lat": 33.74,
        "lng": -118.27,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 27,
        "expected_loss_usd": 3268,
        "chokepoint": False
    },
    {
        "id": "sea_44",
        "num": 44,
        "name": "Port of Long Beach",
        "type": "SEA",
        "location": "USA",
        "region": "North America",
        "lat": 33.76,
        "lng": -118.20,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 26,
        "expected_loss_usd": 6578,
        "chokepoint": False
    },
    {
        "id": "sea_45",
        "num": 45,
        "name": "Port of New York & New Jersey",
        "type": "SEA",
        "location": "USA",
        "region": "North America",
        "lat": 40.67,
        "lng": -74.12,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202,
        "chokepoint": False
    },
    {
        "id": "sea_46",
        "num": 46,
        "name": "Port of Houston",
        "type": "SEA",
        "location": "USA",
        "region": "North America",
        "lat": 29.73,
        "lng": -95.27,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 16,
        "expected_loss_usd": 3626,
        "chokepoint": False
    },
    {
        "id": "sea_47",
        "num": 47,
        "name": "Port of Santos",
        "type": "SEA",
        "location": "Brazil",
        "region": "South America",
        "lat": -23.96,
        "lng": -46.30,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 24,
        "expected_loss_usd": 4807,
        "chokepoint": False
    },
    {
        "id": "sea_48",
        "num": 48,
        "name": "Port of Colon / Balboa",
        "type": "SEA",
        "location": "Panama",
        "region": "Central America",
        "lat": 9.36,
        "lng": -79.90,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190,
        "chokepoint": False
    },
    {
        "id": "sea_49",
        "num": 49,
        "name": "Port of Manzanillo",
        "type": "SEA",
        "location": "Mexico",
        "region": "North America",
        "lat": 19.05,
        "lng": -104.32,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 13,
        "expected_loss_usd": 2604,
        "chokepoint": False
    },
    {
        "id": "sea_50",
        "num": 50,
        "name": "Port of Durban",
        "type": "SEA",
        "location": "South Africa",
        "region": "Southern Africa",
        "lat": -29.87,
        "lng": 31.02,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 17,
        "expected_loss_usd": 2509,
        "chokepoint": False
    },

    # --------------------------------------------------------------------------
    # AIR CARGO — 50 NODES
    # --------------------------------------------------------------------------
    {
        "id": "air_01",
        "num": 1,
        "name": "Hong Kong International",
        "iata": "HKG",
        "type": "AIR",
        "location": "Hong Kong (HKG)",
        "region": "East Asia",
        "lat": 22.31,
        "lng": 113.91,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 19,
        "expected_loss_usd": 2804
    },
    {
        "id": "air_02",
        "num": 2,
        "name": "Memphis International",
        "iata": "MEM",
        "type": "AIR",
        "location": "USA (MEM)",
        "region": "North America",
        "lat": 35.04,
        "lng": -89.98,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "air_03",
        "num": 3,
        "name": "Shanghai Pudong International",
        "iata": "PVG",
        "type": "AIR",
        "location": "China (PVG)",
        "region": "East Asia",
        "lat": 31.14,
        "lng": 121.81,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 24,
        "expected_loss_usd": 6072
    },
    {
        "id": "air_04",
        "num": 4,
        "name": "Ted Stevens Anchorage International",
        "iata": "ANC",
        "type": "AIR",
        "location": "USA (ANC)",
        "region": "North America",
        "lat": 61.17,
        "lng": -149.99,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "air_05",
        "num": 5,
        "name": "Incheon International",
        "iata": "ICN",
        "type": "AIR",
        "location": "South Korea (ICN)",
        "region": "East Asia",
        "lat": 37.46,
        "lng": 126.44,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 9,
        "expected_loss_usd": 1086
    },
    {
        "id": "air_06",
        "num": 6,
        "name": "Louisville Muhammad Ali",
        "iata": "SDF",
        "type": "AIR",
        "location": "USA (SDF)",
        "region": "North America",
        "lat": 38.17,
        "lng": -85.74,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875
    },
    {
        "id": "air_07",
        "num": 7,
        "name": "Miami International",
        "iata": "MIA",
        "type": "AIR",
        "location": "USA (MIA)",
        "region": "North America",
        "lat": 25.80,
        "lng": -80.29,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "air_08",
        "num": 8,
        "name": "Taiwan Taoyuan International",
        "iata": "TPE",
        "type": "AIR",
        "location": "Taiwan (TPE)",
        "region": "East Asia",
        "lat": 25.08,
        "lng": 121.23,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 4,
        "expected_loss_usd": 590
    },
    {
        "id": "air_09",
        "num": 9,
        "name": "Los Angeles International",
        "iata": "LAX",
        "type": "AIR",
        "location": "USA (LAX)",
        "region": "North America",
        "lat": 33.94,
        "lng": -118.41,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 11,
        "expected_loss_usd": 2488
    },
    {
        "id": "air_10",
        "num": 10,
        "name": "Tokyo Narita International",
        "iata": "NRT",
        "type": "AIR",
        "location": "Japan (NRT)",
        "region": "East Asia",
        "lat": 35.76,
        "lng": 140.39,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "air_11",
        "num": 11,
        "name": "Frankfurt Airport",
        "iata": "FRA",
        "type": "AIR",
        "location": "Germany (FRA)",
        "region": "Europe",
        "lat": 50.03,
        "lng": 8.57,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 11,
        "expected_loss_usd": 1044
    },
    {
        "id": "air_12",
        "num": 12,
        "name": "Doha Hamad International",
        "iata": "DOH",
        "type": "AIR",
        "location": "Qatar (DOH)",
        "region": "Middle East",
        "lat": 25.26,
        "lng": 51.57,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 31,
        "expected_loss_usd": 3753
    },
    {
        "id": "air_13",
        "num": 13,
        "name": "Dubai International / Al Maktoum",
        "iata": "DXB",
        "type": "AIR",
        "location": "UAE (DXB / DWC)",
        "region": "Middle East",
        "lat": 25.25,
        "lng": 55.36,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 14,
        "expected_loss_usd": 2066
    },
    {
        "id": "air_14",
        "num": 14,
        "name": "Chicago O'Hare International",
        "iata": "ORD",
        "type": "AIR",
        "location": "USA (ORD)",
        "region": "North America",
        "lat": 41.97,
        "lng": -87.90,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "air_15",
        "num": 15,
        "name": "Amsterdam Airport Schiphol",
        "iata": "AMS",
        "type": "AIR",
        "location": "Netherlands (AMS)",
        "region": "Europe",
        "lat": 52.31,
        "lng": 4.76,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875
    },
    {
        "id": "air_16",
        "num": 16,
        "name": "Guangzhou Baiyun International",
        "iata": "CAN",
        "type": "AIR",
        "location": "China (CAN)",
        "region": "East Asia",
        "lat": 23.39,
        "lng": 113.30,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875
    },
    {
        "id": "air_17",
        "num": 17,
        "name": "Shenzhen Bao'an International",
        "iata": "SZX",
        "type": "AIR",
        "location": "China (SZX)",
        "region": "East Asia",
        "lat": 22.64,
        "lng": 113.81,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "air_18",
        "num": 18,
        "name": "Cincinnati/Northern Kentucky",
        "iata": "CVG",
        "type": "AIR",
        "location": "USA (CVG)",
        "region": "North America",
        "lat": 39.05,
        "lng": -84.67,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "air_19",
        "num": 19,
        "name": "Leipzig/Halle Airport",
        "iata": "LEJ",
        "type": "AIR",
        "location": "Germany (LEJ)",
        "region": "Europe",
        "lat": 51.42,
        "lng": 12.24,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "air_20",
        "num": 20,
        "name": "Paris Charles de Gaulle",
        "iata": "CDG",
        "type": "AIR",
        "location": "France (CDG)",
        "region": "Europe",
        "lat": 49.01,
        "lng": 2.55,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "air_21",
        "num": 21,
        "name": "Singapore Changi Airport",
        "iata": "SIN",
        "type": "AIR",
        "location": "Singapore (SIN)",
        "region": "Southeast Asia",
        "lat": 1.36,
        "lng": 103.99,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 12,
        "expected_loss_usd": 2720
    },
    {
        "id": "air_22",
        "num": 22,
        "name": "Beijing Capital / Daxing",
        "iata": "PEK",
        "type": "AIR",
        "location": "China (PEK / PKX)",
        "region": "East Asia",
        "lat": 40.08,
        "lng": 116.58,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "air_23",
        "num": 23,
        "name": "London Heathrow",
        "iata": "LHR",
        "type": "AIR",
        "location": "UK (LHR)",
        "region": "Europe",
        "lat": 51.47,
        "lng": -0.45,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 10,
        "expected_loss_usd": 1212
    },
    {
        "id": "air_24",
        "num": 24,
        "name": "Luxembourg Findel Airport",
        "iata": "LUX",
        "type": "AIR",
        "location": "Luxembourg (LUX)",
        "region": "Europe",
        "lat": 49.63,
        "lng": 6.22,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "air_25",
        "num": 25,
        "name": "Liege Airport",
        "iata": "LGG",
        "type": "AIR",
        "location": "Belgium (LGG)",
        "region": "Europe",
        "lat": 50.64,
        "lng": 5.44,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "air_26",
        "num": 26,
        "name": "Tokyo Haneda Airport",
        "iata": "HND",
        "type": "AIR",
        "location": "Japan (HND)",
        "region": "East Asia",
        "lat": 35.55,
        "lng": 139.78,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "HIGH",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875
    },
    {
        "id": "air_27",
        "num": 27,
        "name": "Kansai International",
        "iata": "KIX",
        "type": "AIR",
        "location": "Japan (KIX)",
        "region": "East Asia",
        "lat": 34.43,
        "lng": 135.23,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "air_28",
        "num": 28,
        "name": "Abu Dhabi International",
        "iata": "AUH",
        "type": "AIR",
        "location": "UAE (AUH)",
        "region": "Middle East",
        "lat": 24.43,
        "lng": 54.65,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 30,
        "expected_loss_usd": 6800
    },
    {
        "id": "air_29",
        "num": 29,
        "name": "Istanbul Airport",
        "iata": "IST",
        "type": "AIR",
        "location": "Turkey (IST)",
        "region": "Europe / Middle East",
        "lat": 41.28,
        "lng": 28.75,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 26,
        "expected_loss_usd": 4522
    },
    {
        "id": "air_30",
        "num": 30,
        "name": "John F. Kennedy International",
        "iata": "JFK",
        "type": "AIR",
        "location": "USA (JFK)",
        "region": "North America",
        "lat": 40.64,
        "lng": -73.78,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "air_31",
        "num": 31,
        "name": "Atlanta Hartsfield-Jackson",
        "iata": "ATL",
        "type": "AIR",
        "location": "USA (ATL)",
        "region": "North America",
        "lat": 33.64,
        "lng": -84.43,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 4,
        "expected_loss_usd": 590
    },
    {
        "id": "air_32",
        "num": 32,
        "name": "Dallas/Fort Worth International",
        "iata": "DFW",
        "type": "AIR",
        "location": "USA (DFW)",
        "region": "North America",
        "lat": 32.90,
        "lng": -97.04,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "air_33",
        "num": 33,
        "name": "Indianapolis International",
        "iata": "IND",
        "type": "AIR",
        "location": "USA (IND)",
        "region": "North America",
        "lat": 39.72,
        "lng": -86.29,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "air_34",
        "num": 34,
        "name": "Ontario International",
        "iata": "ONT",
        "type": "AIR",
        "location": "USA (ONT)",
        "region": "North America",
        "lat": 34.06,
        "lng": -117.60,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "air_35",
        "num": 35,
        "name": "Milan Malpensa Airport",
        "iata": "MXP",
        "type": "AIR",
        "location": "Italy (MXP)",
        "region": "Europe",
        "lat": 45.63,
        "lng": 8.72,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "air_36",
        "num": 36,
        "name": "Madrid-Barajas Airport",
        "iata": "MAD",
        "type": "AIR",
        "location": "Spain (MAD)",
        "region": "Europe",
        "lat": 40.48,
        "lng": -3.57,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "HIGH",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "air_37",
        "num": 37,
        "name": "Brussels Airport",
        "iata": "BRU",
        "type": "AIR",
        "location": "Belgium (BRU)",
        "region": "Europe",
        "lat": 50.90,
        "lng": 4.48,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "air_38",
        "num": 38,
        "name": "Bangkok Suvarnabhumi",
        "iata": "BKK",
        "type": "AIR",
        "location": "Thailand (BKK)",
        "region": "Southeast Asia",
        "lat": 13.69,
        "lng": 100.75,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "air_39",
        "num": 39,
        "name": "Kuala Lumpur International",
        "iata": "KUL",
        "type": "AIR",
        "location": "Malaysia (KUL)",
        "region": "Southeast Asia",
        "lat": 2.75,
        "lng": 101.71,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 10,
        "expected_loss_usd": 2530
    },
    {
        "id": "air_40",
        "num": 40,
        "name": "Hanoi Noi Bai International",
        "iata": "HAN",
        "type": "AIR",
        "location": "Vietnam (HAN)",
        "region": "Southeast Asia",
        "lat": 21.22,
        "lng": 105.81,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "air_41",
        "num": 41,
        "name": "Ho Chi Minh City Tan Son Nhat",
        "iata": "SGN",
        "type": "AIR",
        "location": "Vietnam (SGN)",
        "region": "Southeast Asia",
        "lat": 10.82,
        "lng": 106.65,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "air_42",
        "num": 42,
        "name": "Indira Gandhi International (Delhi)",
        "iata": "DEL",
        "type": "AIR",
        "location": "India (DEL)",
        "region": "South Asia",
        "lat": 28.56,
        "lng": 77.10,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 15,
        "expected_loss_usd": 2614
    },
    {
        "id": "air_43",
        "num": 43,
        "name": "Chhatrapati Shivaji Maharaj (Mumbai)",
        "iata": "BOM",
        "type": "AIR",
        "location": "India (BOM)",
        "region": "South Asia",
        "lat": 19.09,
        "lng": 72.87,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 13,
        "expected_loss_usd": 1919
    },
    {
        "id": "air_44",
        "num": 44,
        "name": "Kempegowda International (Bengaluru)",
        "iata": "BLR",
        "type": "AIR",
        "location": "India (BLR)",
        "region": "South Asia",
        "lat": 13.20,
        "lng": 77.71,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875
    },
    {
        "id": "air_45",
        "num": 45,
        "name": "São Paulo/Guarulhos International",
        "iata": "GRU",
        "type": "AIR",
        "location": "Brazil (GRU)",
        "region": "South America",
        "lat": -23.43,
        "lng": -46.47,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "air_46",
        "num": 46,
        "name": "Bogotá El Dorado International",
        "iata": "BOG",
        "type": "AIR",
        "location": "Colombia (BOG)",
        "region": "South America",
        "lat": 4.70,
        "lng": -74.15,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "air_47",
        "num": 47,
        "name": "Santiago Arturo Merino Benítez",
        "iata": "SCL",
        "type": "AIR",
        "location": "Chile (SCL)",
        "region": "South America",
        "lat": -33.39,
        "lng": -70.79,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "air_48",
        "num": 48,
        "name": "Johannesburg O.R. Tambo",
        "iata": "JNB",
        "type": "AIR",
        "location": "South Africa (JNB)",
        "region": "Southern Africa",
        "lat": -26.13,
        "lng": 28.24,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "air_49",
        "num": 49,
        "name": "Nairobi Jomo Kenyatta",
        "iata": "NBO",
        "type": "AIR",
        "location": "Kenya (NBO)",
        "region": "East Africa",
        "lat": -1.32,
        "lng": 36.93,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "air_50",
        "num": 50,
        "name": "Cairo International Airport",
        "iata": "CAI",
        "type": "AIR",
        "location": "Egypt (CAI)",
        "region": "Middle East / North Africa",
        "lat": 30.12,
        "lng": 31.41,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 26,
        "expected_loss_usd": 5208
    },

    # --------------------------------------------------------------------------
    # RAIL FREIGHT — 50 NODES
    # --------------------------------------------------------------------------
    {
        "id": "rail_01",
        "num": 1,
        "name": "Malaszewicze / Brest Gateway",
        "type": "RAIL",
        "location": "Poland / Belarus",
        "region": "Eastern Europe",
        "lat": 52.01,
        "lng": 23.53,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 22,
        "expected_loss_usd": 4407
    },
    {
        "id": "rail_02",
        "num": 2,
        "name": "Khorgos / Altynkol Gateway",
        "type": "RAIL",
        "location": "China / Kazakhstan",
        "region": "Central Asia",
        "lat": 44.13,
        "lng": 80.40,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 27,
        "expected_loss_usd": 6114
    },
    {
        "id": "rail_03",
        "num": 3,
        "name": "Dostyk / Alashankou Gateway",
        "type": "RAIL",
        "location": "China / Kazakhstan",
        "region": "Central Asia",
        "lat": 45.25,
        "lng": 82.48,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 20,
        "expected_loss_usd": 4006
    },
    {
        "id": "rail_04",
        "num": 4,
        "name": "Manzhouli / Zabaikalsk Gateway",
        "type": "RAIL",
        "location": "China / Russia",
        "region": "East Asia / Russia",
        "lat": 49.59,
        "lng": 117.43,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_05",
        "num": 5,
        "name": "Erenhot / Zamyn-Uud Gateway",
        "type": "RAIL",
        "location": "China / Mongolia",
        "region": "East Asia",
        "lat": 43.65,
        "lng": 111.98,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "rail_06",
        "num": 6,
        "name": "Duisburg Intermodal Terminal (Duisport)",
        "type": "RAIL",
        "location": "Germany",
        "region": "Western Europe",
        "lat": 51.44,
        "lng": 6.74,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "HIGH",
        "expected_delay_hours": 9,
        "expected_loss_usd": 1803
    },
    {
        "id": "rail_07",
        "num": 7,
        "name": "Hamburg Billwerder Terminal",
        "type": "RAIL",
        "location": "Germany",
        "region": "Western Europe",
        "lat": 53.51,
        "lng": 10.12,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 14,
        "expected_loss_usd": 3173
    },
    {
        "id": "rail_08",
        "num": 8,
        "name": "Chengdu International Railway Port",
        "type": "RAIL",
        "location": "China",
        "region": "East Asia",
        "lat": 30.79,
        "lng": 104.25,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 7,
        "expected_loss_usd": 664
    },
    {
        "id": "rail_09",
        "num": 9,
        "name": "Chongqing Tuanjiecun Rail Hub",
        "type": "RAIL",
        "location": "China",
        "region": "East Asia",
        "lat": 29.62,
        "lng": 106.35,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "rail_10",
        "num": 10,
        "name": "Xi'an International Trade & Logistics Park",
        "type": "RAIL",
        "location": "China",
        "region": "East Asia",
        "lat": 34.37,
        "lng": 109.05,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 11,
        "expected_loss_usd": 1623
    },
    {
        "id": "rail_11",
        "num": 11,
        "name": "Lodz Freight Terminal",
        "type": "RAIL",
        "location": "Poland",
        "region": "Eastern Europe",
        "lat": 51.76,
        "lng": 19.46,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 4,
        "expected_loss_usd": 590
    },
    {
        "id": "rail_12",
        "num": 12,
        "name": "Baku / Port of Alat Rail Interchange",
        "type": "RAIL",
        "location": "Azerbaijan",
        "region": "Caucasus / Middle Corridor",
        "lat": 39.99,
        "lng": 49.41,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 20,
        "expected_loss_usd": 3479
    },
    {
        "id": "rail_13",
        "num": 13,
        "name": "Poti / Batumi Rail Terminals",
        "type": "RAIL",
        "location": "Georgia",
        "region": "Caucasus / Black Sea",
        "lat": 42.15,
        "lng": 41.67,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "rail_14",
        "num": 14,
        "name": "Kars Rail Hub",
        "type": "RAIL",
        "location": "Turkey",
        "region": "Middle East / Europe",
        "lat": 40.60,
        "lng": 43.10,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "rail_15",
        "num": 15,
        "name": "Gotthard Base Tunnel Corridor",
        "type": "RAIL",
        "location": "Switzerland",
        "region": "Western Europe",
        "lat": 46.52,
        "lng": 8.79,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 4,
        "expected_loss_usd": 590
    },
    {
        "id": "rail_16",
        "num": 16,
        "name": "Brenner Pass Rail Corridor",
        "type": "RAIL",
        "location": "Austria / Italy",
        "region": "Western Europe",
        "lat": 47.01,
        "lng": 11.51,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "HIGH",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_17",
        "num": 17,
        "name": "Lötschberg Base Tunnel Corridor",
        "type": "RAIL",
        "location": "Switzerland",
        "region": "Western Europe",
        "lat": 46.38,
        "lng": 7.75,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "HIGH",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "rail_18",
        "num": 18,
        "name": "Channel Tunnel (Eurotunnel Freight)",
        "type": "RAIL",
        "location": "UK / France",
        "region": "Western Europe",
        "lat": 51.02,
        "lng": 1.45,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 15,
        "expected_loss_usd": 2614
    },
    {
        "id": "rail_19",
        "num": 19,
        "name": "Betuweroute",
        "type": "RAIL",
        "location": "Netherlands / Germany",
        "region": "Western Europe",
        "lat": 51.87,
        "lng": 5.25,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 16,
        "expected_loss_usd": 3626
    },
    {
        "id": "rail_20",
        "num": 20,
        "name": "Port of Koper / Divača Rail Line",
        "type": "RAIL",
        "location": "Slovenia",
        "region": "Southern / Central Europe",
        "lat": 45.68,
        "lng": 13.97,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_21",
        "num": 21,
        "name": "Verona Quadrante Europa",
        "type": "RAIL",
        "location": "Italy",
        "region": "Southern Europe",
        "lat": 45.41,
        "lng": 10.92,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "rail_22",
        "num": 22,
        "name": "Vienna South Freight Terminal (Wien Süd)",
        "type": "RAIL",
        "location": "Austria",
        "region": "Central Europe",
        "lat": 48.14,
        "lng": 16.36,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "rail_23",
        "num": 23,
        "name": "Metrans Hub Terminal Ceska Trebova",
        "type": "RAIL",
        "location": "Czech Republic",
        "region": "Central Europe",
        "lat": 49.90,
        "lng": 16.44,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "HIGH",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "rail_24",
        "num": 24,
        "name": "Frankfurt (Oder) Rail Terminal",
        "type": "RAIL",
        "location": "Germany / Poland",
        "region": "Central Europe",
        "lat": 52.34,
        "lng": 14.53,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_25",
        "num": 25,
        "name": "Boten / Mohan Gateway",
        "type": "RAIL",
        "location": "Laos / China",
        "region": "Southeast Asia",
        "lat": 21.18,
        "lng": 101.69,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875
    },
    {
        "id": "rail_26",
        "num": 26,
        "name": "Thanaleng Dry Port (Vientiane)",
        "type": "RAIL",
        "location": "Laos / Thailand",
        "region": "Southeast Asia",
        "lat": 17.91,
        "lng": 102.72,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_27",
        "num": 27,
        "name": "Padang Besar Railway Station",
        "type": "RAIL",
        "location": "Malaysia / Thailand",
        "region": "Southeast Asia",
        "lat": 6.66,
        "lng": 100.32,
        "congestion": "MODERATE",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_28",
        "num": 28,
        "name": "Chicago Rail Terminal Complex",
        "type": "RAIL",
        "location": "USA (Illinois)",
        "region": "North America",
        "lat": 41.87,
        "lng": -87.63,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 15,
        "expected_loss_usd": 2614
    },
    {
        "id": "rail_29",
        "num": 29,
        "name": "Laredo / Nuevo Laredo Rail Crossing",
        "type": "RAIL",
        "location": "USA / Mexico",
        "region": "North America",
        "lat": 27.50,
        "lng": -99.50,
        "congestion": "HIGH",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 31,
        "expected_loss_usd": 4575
    },
    {
        "id": "rail_30",
        "num": 30,
        "name": "Eagle Pass Rail Gateway",
        "type": "RAIL",
        "location": "USA / Mexico",
        "region": "North America",
        "lat": 28.71,
        "lng": -100.50,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "rail_31",
        "num": 31,
        "name": "Kansas City SmartPort",
        "type": "RAIL",
        "location": "USA (Missouri)",
        "region": "North America",
        "lat": 39.10,
        "lng": -94.58,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "rail_32",
        "num": 32,
        "name": "Alliance Texas Intermodal Facility",
        "type": "RAIL",
        "location": "USA (Texas)",
        "region": "North America",
        "lat": 32.98,
        "lng": -97.32,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 10,
        "expected_loss_usd": 1212
    },
    {
        "id": "rail_33",
        "num": 33,
        "name": "BNSF Hobart Yard (Los Angeles)",
        "type": "RAIL",
        "location": "USA (California)",
        "region": "North America",
        "lat": 34.00,
        "lng": -118.19,
        "congestion": "HIGH",
        "weather": "LOW",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 25,
        "expected_loss_usd": 5672
    },
    {
        "id": "rail_34",
        "num": 34,
        "name": "Memphis Intermodal Terminals",
        "type": "RAIL",
        "location": "USA (Tennessee)",
        "region": "North America",
        "lat": 35.14,
        "lng": -90.05,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "HIGH",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "rail_35",
        "num": 35,
        "name": "Detroit / Windsor Rail Tunnel",
        "type": "RAIL",
        "location": "USA / Canada",
        "region": "North America",
        "lat": 42.33,
        "lng": -83.04,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "rail_36",
        "num": 36,
        "name": "International Falls / Fort Frances",
        "type": "RAIL",
        "location": "USA / Canada",
        "region": "North America",
        "lat": 48.60,
        "lng": -93.40,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_37",
        "num": 37,
        "name": "Dadri ICD (Western & Eastern DFC Junction)",
        "type": "RAIL",
        "location": "India",
        "region": "South Asia",
        "lat": 28.55,
        "lng": 77.55,
        "congestion": "HIGH",
        "weather": "MODERATE",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 8,
        "expected_loss_usd": 1602
    },
    {
        "id": "rail_38",
        "num": 38,
        "name": "Rewari–Madar DFC Corridor",
        "type": "RAIL",
        "location": "India",
        "region": "South Asia",
        "lat": 27.50,
        "lng": 75.80,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 3,
        "expected_loss_usd": 358
    },
    {
        "id": "rail_39",
        "num": 39,
        "name": "Sanand Multimodal Logistics Park",
        "type": "RAIL",
        "location": "India (Gujarat)",
        "region": "South Asia",
        "lat": 22.98,
        "lng": 72.38,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "rail_40",
        "num": 40,
        "name": "Khatuwas Intermodal Logistics Park",
        "type": "RAIL",
        "location": "India (Rajasthan)",
        "region": "South Asia",
        "lat": 28.12,
        "lng": 76.22,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    },
    {
        "id": "rail_41",
        "num": 41,
        "name": "Dankuni Freight Terminal",
        "type": "RAIL",
        "location": "India (West Bengal)",
        "region": "South Asia",
        "lat": 22.68,
        "lng": 88.29,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "LOW",
        "expected_delay_hours": 15,
        "expected_loss_usd": 3405
    },
    {
        "id": "rail_42",
        "num": 42,
        "name": "New Deen Dayal Upadhyaya (Mughalsarai) Yard",
        "type": "RAIL",
        "location": "India (Uttar Pradesh)",
        "region": "South Asia",
        "lat": 25.28,
        "lng": 83.12,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "HIGH",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "rail_43",
        "num": 43,
        "name": "Trans-Siberian Railway Trunk",
        "type": "RAIL",
        "location": "Russia",
        "region": "Eurasia / Russia",
        "lat": 55.00,
        "lng": 82.93,
        "congestion": "LOW",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875
    },
    {
        "id": "rail_44",
        "num": 44,
        "name": "Baikal-Amur Mainline (BAM)",
        "type": "RAIL",
        "location": "Russia",
        "region": "Eurasia / Russia",
        "lat": 56.50,
        "lng": 119.50,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "LOW",
        "currency_risk": "HIGH",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "rail_45",
        "num": 45,
        "name": "Pilbara Heavy Haul Rail Network",
        "type": "RAIL",
        "location": "Australia (Western Australia)",
        "region": "Oceania",
        "lat": -21.50,
        "lng": 118.50,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "HIGH",
        "currency_risk": "LOW",
        "expected_delay_hours": 7,
        "expected_loss_usd": 1581
    },
    {
        "id": "rail_46",
        "num": 46,
        "name": "Parkes National Logistics Hub",
        "type": "RAIL",
        "location": "Australia (New South Wales)",
        "region": "Oceania",
        "lat": -33.14,
        "lng": 148.18,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 8,
        "expected_loss_usd": 2024
    },
    {
        "id": "rail_47",
        "num": 47,
        "name": "Mombasa–Nairobi Standard Gauge Railway (SGR)",
        "type": "RAIL",
        "location": "Kenya",
        "region": "East Africa",
        "lat": -3.50,
        "lng": 39.00,
        "congestion": "MODERATE",
        "weather": "HIGH",
        "network_risk": "MODERATE",
        "currency_risk": "LOW",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_48",
        "num": 48,
        "name": "Sishen–Saldanha Iron Ore Line",
        "type": "RAIL",
        "location": "South Africa",
        "region": "Southern Africa",
        "lat": -31.00,
        "lng": 20.00,
        "congestion": "LOW",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 5,
        "expected_loss_usd": 875
    },
    {
        "id": "rail_49",
        "num": 49,
        "name": "Carajás Railway (EFC)",
        "type": "RAIL",
        "location": "Brazil",
        "region": "South America",
        "lat": -4.00,
        "lng": -48.00,
        "congestion": "LOW",
        "weather": "LOW",
        "network_risk": "HIGH",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 6,
        "expected_loss_usd": 1202
    },
    {
        "id": "rail_50",
        "num": 50,
        "name": "TAZARA Railway (Tanzania–Zambia)",
        "type": "RAIL",
        "location": "Tanzania / Zambia",
        "region": "East / Central Africa",
        "lat": -9.00,
        "lng": 33.00,
        "congestion": "MODERATE",
        "weather": "MODERATE",
        "network_risk": "MODERATE",
        "currency_risk": "MODERATE",
        "expected_delay_hours": 2,
        "expected_loss_usd": 190
    }
]

# Map index by node ID
NODES_BY_ID: Dict[str, Dict[str, Any]] = {n["id"]: n for n in RAW_NODES_DATA}

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)

def _generate_realistic_network_edges() -> List[Dict[str, Any]]:
    edges = []

    def add_edge(u, v, mode, name, cost_rate, speed_kmh, base_risk=0.05, bidir=True):
        nu = NODES_BY_ID.get(u)
        nv = NODES_BY_ID.get(v)
        if not nu or not nv:
            return
        dist = haversine_km(nu["lat"], nu["lng"], nv["lat"], nv["lng"])
        t_days = round(max(0.2, dist / (speed_kmh * 24.0)), 1)
        if mode == "SEA":
            base_fee = 600.0
        elif mode == "RAIL":
            base_fee = 1200.0
        elif mode == "AIR":
            base_fee = 3500.0
        else: # INTERMODAL
            base_fee = 800.0
        cost = round(dist * cost_rate + base_fee, 2)
        edges.append({"u": u, "v": v, "mode": mode, "name": name, "distance_km": dist, "transit_days": t_days, "freight_cost_usd": cost, "base_risk": base_risk})
        if bidir:
            edges.append({"u": v, "v": u, "mode": mode, "name": name, "distance_km": dist, "transit_days": t_days, "freight_cost_usd": cost, "base_risk": base_risk})

    # =========================================================================
    # 1. MARITIME CORRIDORS (50 SEA HUBS) - 100% REALISTIC NAUTICAL SEA LANES
    # =========================================================================
    # East Asia Maritime
    add_edge("sea_21", "sea_23", "SEA", "East China Coastal Corridor", 0.06, 35, 0.04) # Shanghai -> Ningbo
    add_edge("sea_23", "sea_27", "SEA", "Yellow Sea Shipping Lane", 0.06, 35, 0.04) # Ningbo -> Qingdao
    add_edge("sea_27", "sea_29", "SEA", "Bohai Gulf Maritime Lane", 0.06, 35, 0.04) # Qingdao -> Tianjin
    add_edge("sea_27", "sea_26", "SEA", "Korea Strait Crossing", 0.06, 35, 0.04) # Qingdao -> Busan
    add_edge("sea_21", "sea_26", "SEA", "East China Sea - Busan Trunk", 0.06, 35, 0.04) # Shanghai -> Busan
    add_edge("sea_21", "sea_30", "SEA", "Taiwan Strait Maritime Route", 0.07, 35, 0.05) # Shanghai -> Kaohsiung
    add_edge("sea_30", "sea_28", "SEA", "South China Sea Fast Route", 0.06, 35, 0.04) # Kaohsiung -> Hong Kong
    add_edge("sea_28", "sea_24", "SEA", "Greater Bay Feeder Lane", 0.05, 30, 0.02) # HK -> Shenzhen
    add_edge("sea_24", "sea_25", "SEA", "Pearl River Estuary Feeder", 0.05, 30, 0.02) # Shenzhen -> Guangzhou
    add_edge("sea_28", "sea_01", "SEA", "South China Sea - Malacca Arterial", 0.07, 38, 0.07) # HK -> Malacca
    add_edge("sea_24", "sea_01", "SEA", "Shenzhen - Malacca Trunk", 0.07, 38, 0.07) # Shenzhen -> Malacca
    add_edge("sea_25", "sea_01", "SEA", "Guangzhou - Malacca Direct", 0.07, 38, 0.07) # Guangzhou -> Malacca

    # Southeast Asia & Australasia
    add_edge("sea_01", "sea_22", "SEA", "Singapore Strait Transit", 0.05, 25, 0.08) # Malacca -> Singapore
    add_edge("sea_22", "sea_31", "SEA", "Johor Strait Connector", 0.05, 25, 0.03) # Singapore -> PTP
    add_edge("sea_31", "sea_32", "SEA", "Malacca Strait Westbound Trunk", 0.06, 35, 0.05) # PTP -> Port Klang
    add_edge("sea_01", "sea_11", "SEA", "Sunda Strait Bypass Lane", 0.07, 36, 0.05) # Malacca -> Sunda
    add_edge("sea_22", "sea_12", "SEA", "Lombok Strait Deep-Sea Bypass", 0.08, 38, 0.05) # Singapore -> Lombok
    add_edge("sea_12", "sea_13", "SEA", "Makassar Strait Inter-Island Lane", 0.07, 36, 0.04) # Lombok -> Makassar
    add_edge("sea_13", "sea_18", "SEA", "Arafura - Torres Strait Passage", 0.08, 36, 0.06) # Makassar -> Torres
    add_edge("sea_18", "sea_19", "SEA", "Tasman Sea - Cook Strait Crossing", 0.07, 35, 0.05) # Torres -> Cook Strait
    add_edge("sea_18", "sea_22", "SEA", "Oceania - Singapore Maritime Arterial", 0.08, 38, 0.06) # Torres -> Singapore

    # Indian Ocean & Middle East
    add_edge("sea_01", "sea_40", "SEA", "Bay of Bengal - Colombo Super-Corridor", 0.07, 38, 0.06) # Malacca -> Colombo
    add_edge("sea_32", "sea_40", "SEA", "Port Klang - Colombo Shipping Lane", 0.07, 38, 0.06) # Port Klang -> Colombo
    add_edge("sea_40", "sea_41", "SEA", "Arabian Sea India West Coast Trunk", 0.07, 36, 0.04) # Colombo -> JNPT Mumbai
    add_edge("sea_41", "sea_42", "SEA", "Gujarat Coast Maritime Corridor", 0.05, 35, 0.03) # JNPT -> Mundra
    add_edge("sea_40", "sea_39", "SEA", "Indian Ocean - Salalah Direct Corridor", 0.07, 38, 0.06) # Colombo -> Salalah
    add_edge("sea_41", "sea_39", "SEA", "Mumbai - Salalah Express Lane", 0.07, 38, 0.06) # JNPT -> Salalah
    add_edge("sea_42", "sea_39", "SEA", "Mundra - Salalah Direct", 0.07, 38, 0.06) # Mundra -> Salalah
    add_edge("sea_42", "sea_04", "SEA", "Gulf of Oman - Hormuz Entrance", 0.09, 36, 0.22) # Mundra -> Hormuz
    add_edge("sea_41", "sea_04", "SEA", "Mumbai - Strait of Hormuz Energy Lane", 0.09, 36, 0.22) # JNPT -> Hormuz
    add_edge("sea_04", "sea_38", "SEA", "Persian Gulf Jebel Ali Approach", 0.08, 30, 0.18) # Hormuz -> Jebel Ali Dubai
    add_edge("sea_38", "sea_39", "SEA", "Arabian Peninsula Coastal Route", 0.08, 35, 0.08) # Jebel Ali -> Salalah

    # Red Sea & Suez Canal
    add_edge("sea_39", "sea_05", "SEA", "Gulf of Aden - Bab-el-Mandeb Corridor", 0.09, 36, 0.25) # Salalah -> Bab-el-Mandeb
    add_edge("sea_41", "sea_05", "SEA", "Mumbai - Bab-el-Mandeb Red Sea Route", 0.09, 38, 0.24) # JNPT -> Bab-el-Mandeb
    add_edge("sea_42", "sea_05", "SEA", "Mundra - Bab-el-Mandeb Red Sea Route", 0.09, 38, 0.24) # Mundra -> Bab-el-Mandeb
    add_edge("sea_05", "sea_02", "SEA", "Red Sea - Suez Transit Corridor", 0.12, 36, 0.28) # Bab-el-Mandeb -> Suez Canal

    # Mediterranean Sea
    add_edge("sea_02", "sea_37", "SEA", "Eastern Mediterranean - Piraeus Lane", 0.07, 36, 0.08) # Suez -> Piraeus
    add_edge("sea_37", "sea_07", "SEA", "Aegean - Bosphorus & Dardanelles Lane", 0.07, 34, 0.09) # Piraeus -> Bosphorus
    add_edge("sea_37", "sea_20", "SEA", "Ionian Sea - Strait of Messina Lane", 0.07, 35, 0.05) # Piraeus -> Messina
    add_edge("sea_20", "sea_36", "SEA", "Tyrrhenian - Valencia Corridor", 0.07, 36, 0.05) # Messina -> Valencia
    add_edge("sea_36", "sea_06", "SEA", "Alboran Sea - Strait of Gibraltar Lane", 0.07, 36, 0.04) # Valencia -> Gibraltar
    add_edge("sea_02", "sea_06", "SEA", "Trans-Mediterranean Express Route", 0.08, 38, 0.07) # Suez -> Gibraltar

    # North Europe & Baltic
    add_edge("sea_06", "sea_08", "SEA", "Bay of Biscay - English Channel Route", 0.08, 38, 0.06) # Gibraltar -> English Channel
    add_edge("sea_08", "sea_33", "SEA", "English Channel - Rotterdam Gateway", 0.06, 34, 0.05) # Channel -> Rotterdam
    add_edge("sea_33", "sea_34", "SEA", "Rhine-Scheldt Delta Coastal Connector", 0.04, 28, 0.02) # Rotterdam -> Antwerp
    add_edge("sea_33", "sea_35", "SEA", "North Sea - Hamburg Maritime Lane", 0.06, 35, 0.04) # Rotterdam -> Hamburg
    add_edge("sea_34", "sea_35", "SEA", "Antwerp to Hamburg North Sea Lane", 0.05, 32, 0.03) # Antwerp -> Hamburg
    add_edge("sea_35", "sea_16", "SEA", "Elbe - Kiel Canal Inland Shortcut", 0.05, 25, 0.03) # Hamburg -> Kiel Canal
    add_edge("sea_16", "sea_09", "SEA", "Baltic Approach - Danish Straits", 0.06, 30, 0.04) # Kiel Canal -> Danish Straits
    add_edge("sea_08", "sea_09", "SEA", "North Sea - Danish Straits Direct", 0.07, 34, 0.04) # Channel -> Danish Straits

    # Cape of Good Hope & Africa / South Atlantic (AUTHENTIC WATER ROUTE AROUND AFRICA)
    add_edge("sea_40", "sea_50", "SEA", "Indian Ocean - Durban Trans-Oceanic", 0.08, 38, 0.06) # Colombo -> Durban
    add_edge("sea_41", "sea_50", "SEA", "India West Coast - Durban Direct", 0.08, 38, 0.06) # JNPT -> Durban
    add_edge("sea_42", "sea_50", "SEA", "Mundra - Durban Direct Lane", 0.08, 38, 0.06) # Mundra -> Durban
    add_edge("sea_39", "sea_50", "SEA", "East Africa - Durban Coastal Route", 0.07, 36, 0.05) # Salalah -> Durban
    add_edge("sea_50", "sea_10", "SEA", "Agulhas Current - Cape of Good Hope Route", 0.07, 36, 0.08) # Durban -> Cape of Good Hope
    add_edge("sea_10", "sea_06", "SEA", "West Africa Atlantic - Gibraltar Arterial", 0.08, 38, 0.07) # Cape -> Gibraltar (SAILS AROUND WEST AFRICA)
    add_edge("sea_10", "sea_08", "SEA", "Cape of Good Hope to English Channel Express", 0.08, 38, 0.07) # Cape -> English Channel (NAUTICAL WATER ROUTE)
    add_edge("sea_10", "sea_47", "SEA", "South Atlantic Trans-Oceanic Lane", 0.08, 38, 0.06) # Cape -> Santos Brazil

    # Americas Maritime, Panama Canal, Transatlantic & Transpacific
    add_edge("sea_06", "sea_45", "SEA", "North Atlantic Express (Gibraltar to NY/NJ)", 0.08, 38, 0.05) # Gibraltar -> NY/NJ
    add_edge("sea_08", "sea_45", "SEA", "Transatlantic Gateway (Channel to NY/NJ)", 0.08, 38, 0.05) # English Channel -> NY/NJ
    add_edge("sea_33", "sea_45", "SEA", "Rotterdam to New York Direct Transatlantic", 0.08, 38, 0.05) # Rotterdam -> NY/NJ
    add_edge("sea_45", "sea_17", "SEA", "Atlantic Seaboard - St Lawrence Seaway", 0.06, 32, 0.04) # NY/NJ -> St Lawrence
    add_edge("sea_45", "sea_46", "SEA", "US East Coast - Gulf of Mexico (Houston)", 0.06, 34, 0.04) # NY/NJ -> Houston
    add_edge("sea_46", "sea_48", "SEA", "Gulf of Mexico - Colon Panama", 0.07, 36, 0.05) # Houston -> Colon Panama
    add_edge("sea_45", "sea_48", "SEA", "US East Coast - Colon Panama Direct", 0.07, 36, 0.05) # NY/NJ -> Colon Panama
    add_edge("sea_48", "sea_03", "SEA", "Panama Canal Transit Corridor", 0.15, 15, 0.22) # Colon -> Panama Canal
    add_edge("sea_03", "sea_49", "SEA", "Pacific Central America - Manzanillo", 0.07, 36, 0.06) # Panama -> Manzanillo
    add_edge("sea_49", "sea_44", "SEA", "Pacific Coast - Long Beach", 0.06, 36, 0.05) # Manzanillo -> Long Beach
    add_edge("sea_44", "sea_43", "SEA", "San Pedro Bay Harbor Connector", 0.02, 20, 0.02) # Long Beach -> Los Angeles
    add_edge("sea_43", "sea_21", "SEA", "Transpacific Northern Trunk (LA to Shanghai)", 0.09, 38, 0.07) # LA -> Shanghai
    add_edge("sea_44", "sea_26", "SEA", "Transpacific Express (Long Beach to Busan)", 0.09, 38, 0.07) # Long Beach -> Busan
    add_edge("sea_43", "sea_28", "SEA", "LA to Hong Kong Transpacific Lane", 0.09, 38, 0.07) # LA -> Hong Kong
    add_edge("sea_03", "sea_47", "SEA", "Caribbean - Santos Brazil Lane", 0.08, 36, 0.06) # Panama -> Santos
    add_edge("sea_47", "sea_45", "SEA", "Santos Brazil to New York Atlantic Trunk", 0.08, 38, 0.05) # Santos -> NY/NJ
    add_edge("sea_47", "sea_14", "SEA", "South American Atlantic - Strait of Magellan", 0.07, 35, 0.07) # Santos -> Magellan
    add_edge("sea_14", "sea_15", "SEA", "Cape Horn / Drake Passage Extremity Route", 0.12, 30, 0.14) # Magellan -> Drake
    add_edge("sea_14", "sea_49", "SEA", "South American Pacific - Manzanillo", 0.08, 36, 0.07) # Magellan -> Manzanillo
    add_edge("sea_19", "sea_14", "SEA", "Cook Strait to Strait of Magellan South Pacific", 0.09, 38, 0.08) # Cook Strait -> Magellan

    # =========================================================================
    # 2. AIR CARGO CORRIDORS (50 AIR HUBS) - GLOBAL SKY-WAY
    # =========================================================================
    # Transpacific Sky-Bridge (via Anchorage ANC)
    add_edge("air_01", "air_04", "AIR", "Polar Air Route (HKG to ANC)", 0.55, 850, 0.03) # HKG -> Anchorage
    add_edge("air_03", "air_04", "AIR", "Transpacific Express (PVG to ANC)", 0.55, 850, 0.03) # PVG -> Anchorage
    add_edge("air_05", "air_04", "AIR", "North Pacific Air Corridor (ICN to ANC)", 0.52, 850, 0.03) # ICN -> Anchorage
    add_edge("air_10", "air_04", "AIR", "Japan-Alaska Air Bridge (NRT to ANC)", 0.50, 850, 0.03) # NRT -> Anchorage
    add_edge("air_08", "air_04", "AIR", "Taoyuan Air Express (TPE to ANC)", 0.54, 850, 0.03) # TPE -> Anchorage

    # US Domestic Air Cargo Backbone
    add_edge("air_04", "air_02", "AIR", "Anchorage-Memphis FedEx Superhub Route", 0.48, 850, 0.03) # ANC -> Memphis
    add_edge("air_04", "air_06", "AIR", "Anchorage-Louisville UPS Worldport Route", 0.48, 850, 0.03) # ANC -> Louisville
    add_edge("air_04", "air_14", "AIR", "Anchorage-Chicago O'Hare Cargo Trunk", 0.46, 850, 0.03) # ANC -> Chicago
    add_edge("air_04", "air_09", "AIR", "Anchorage-LAX Pacific West Corridor", 0.48, 850, 0.03) # ANC -> LAX
    add_edge("air_02", "air_06", "AIR", "Midwest Cargo Feeder (MEM to SDF)", 0.35, 750, 0.02) # Memphis -> Louisville
    add_edge("air_02", "air_07", "AIR", "Southeast Air Artery (MEM to MIA)", 0.38, 800, 0.02) # Memphis -> Miami
    add_edge("air_02", "air_30", "AIR", "East Coast Air Express (MEM to JFK)", 0.40, 820, 0.02) # Memphis -> JFK
    add_edge("air_06", "air_18", "AIR", "DHL Americas Artery (SDF to CVG)", 0.30, 750, 0.02) # Louisville -> Cincinnati
    add_edge("air_18", "air_14", "AIR", "Great Lakes Cargo Shuttle (CVG to ORD)", 0.32, 750, 0.02) # Cincinnati -> Chicago
    add_edge("air_18", "air_33", "AIR", "Midwest Regional Cargo (CVG to IND)", 0.28, 700, 0.02) # Cincinnati -> Indianapolis
    add_edge("air_14", "air_31", "AIR", "Inland-Southeast Air Route (ORD to ATL)", 0.35, 800, 0.02) # Chicago -> Atlanta
    add_edge("air_31", "air_32", "AIR", "Southern Cross Air Corridor (ATL to DFW)", 0.35, 820, 0.02) # Atlanta -> Dallas
    add_edge("air_32", "air_09", "AIR", "Southwest Air Corridor (DFW to LAX)", 0.40, 840, 0.02) # Dallas -> LAX
    add_edge("air_09", "air_34", "AIR", "Southern California Cargo Shuttle (LAX to ONT)", 0.20, 450, 0.01) # LAX -> Ontario

    # Transatlantic Aviation Trunk
    add_edge("air_30", "air_11", "AIR", "Transatlantic Gateway (JFK to FRA)", 0.58, 880, 0.03) # JFK -> Frankfurt
    add_edge("air_30", "air_23", "AIR", "North Atlantic Prime (JFK to LHR)", 0.55, 880, 0.03) # JFK -> London Heathrow
    add_edge("air_14", "air_11", "AIR", "Midwest-Europe Air Trunk (ORD to FRA)", 0.60, 880, 0.03) # Chicago -> Frankfurt
    add_edge("air_02", "air_19", "AIR", "FedEx Transatlantic Bridge (MEM to LEJ)", 0.62, 880, 0.03) # Memphis -> Leipzig
    add_edge("air_06", "air_25", "AIR", "UPS European Air Bridge (SDF to LGG)", 0.62, 880, 0.03) # Louisville -> Liege

    # European Air Cargo Hubs
    add_edge("air_11", "air_19", "AIR", "German Air Cargo Backbone (FRA to LEJ)", 0.28, 700, 0.02) # Frankfurt -> Leipzig
    add_edge("air_11", "air_15", "AIR", "Benelux Air Connector (FRA to AMS)", 0.30, 720, 0.02) # Frankfurt -> Amsterdam
    add_edge("air_11", "air_20", "AIR", "Central Europe Express (FRA to CDG)", 0.32, 750, 0.02) # Frankfurt -> Paris CDG
    add_edge("air_15", "air_24", "AIR", "Cargolux Hub Route (AMS to LUX)", 0.25, 680, 0.02) # Amsterdam -> Luxembourg
    add_edge("air_24", "air_25", "AIR", "Liege-Luxembourg Cargo Shuttle (LUX to LGG)", 0.20, 600, 0.01) # Luxembourg -> Liege
    add_edge("air_25", "air_37", "AIR", "Belgium Air Cargo Link (LGG to BRU)", 0.18, 550, 0.01) # Liege -> Brussels
    add_edge("air_20", "air_35", "AIR", "Alpine Air Route (CDG to MXP)", 0.35, 780, 0.02) # Paris -> Milan
    add_edge("air_20", "air_36", "AIR", "Iberian Air Artery (CDG to MAD)", 0.38, 800, 0.02) # Paris -> Madrid
    add_edge("air_23", "air_20", "AIR", "Channel Air Shuttle (LHR to CDG)", 0.25, 650, 0.02) # London -> Paris
    add_edge("air_35", "air_11", "AIR", "Milan to Frankfurt Cargo Shuttle", 0.30, 700, 0.02) # Milan -> Frankfurt
    add_edge("air_36", "air_11", "AIR", "Madrid to Frankfurt Air Trunk", 0.35, 780, 0.02) # Madrid -> Frankfurt
    add_edge("air_37", "air_15", "AIR", "Brussels to Amsterdam Air Connector", 0.20, 550, 0.01) # Brussels -> Amsterdam

    # Middle East Crossroads
    add_edge("air_11", "air_13", "AIR", "Europe-Gulf Super-Highway (FRA to DXB)", 0.55, 880, 0.05) # Frankfurt -> Dubai
    add_edge("air_20", "air_12", "AIR", "Qatar Airways Cargo Link (CDG to DOH)", 0.55, 880, 0.05) # Paris -> Doha
    add_edge("air_23", "air_29", "AIR", "Turkish Cargo Silk Route (LHR to IST)", 0.48, 860, 0.04) # London -> Istanbul
    add_edge("air_29", "air_13", "AIR", "Levant Air Corridor (IST to DXB)", 0.42, 850, 0.04) # Istanbul -> Dubai
    add_edge("air_13", "air_28", "AIR", "Emirates Air Shuttle (DXB to AUH)", 0.15, 450, 0.01) # Dubai -> Abu Dhabi
    add_edge("air_13", "air_12", "AIR", "Gulf Inter-Hub Shuttles (DXB to DOH)", 0.22, 600, 0.03) # Dubai -> Doha
    add_edge("air_29", "air_50", "AIR", "Eastern Med Air Trunk (IST to CAI)", 0.35, 800, 0.04) # Istanbul -> Cairo

    # South Asia Aviation Artery (DEL / BOM / BLR)
    add_edge("air_13", "air_43", "AIR", "Gulf-India Financial Route (DXB to BOM)", 0.45, 860, 0.04) # Dubai -> Mumbai
    add_edge("air_13", "air_42", "AIR", "Gulf-North India Express (DXB to DEL)", 0.45, 860, 0.04) # Dubai -> Delhi
    add_edge("air_12", "air_44", "AIR", "Doha-Bengaluru Tech Express (DOH to BLR)", 0.48, 860, 0.04) # Doha -> Bengaluru
    add_edge("air_42", "air_43", "AIR", "India Golden Quad Air Route (DEL to BOM)", 0.35, 800, 0.02) # Delhi -> Mumbai
    add_edge("air_43", "air_44", "AIR", "India South Cargo Link (BOM to BLR)", 0.30, 780, 0.02) # Mumbai -> Bengaluru
    add_edge("air_11", "air_42", "AIR", "Frankfurt to Delhi Cargo Express", 0.58, 880, 0.03) # Frankfurt -> Delhi
    add_edge("air_23", "air_43", "AIR", "London Heathrow to Mumbai Air Trunk", 0.58, 880, 0.03) # London -> Mumbai

    # Southeast & East Asia Aviation
    add_edge("air_43", "air_21", "AIR", "India-Singapore Air Corridor (BOM to SIN)", 0.52, 870, 0.04) # Mumbai -> Singapore
    add_edge("air_42", "air_38", "AIR", "Delhi-Bangkok Air Route (DEL to BKK)", 0.48, 860, 0.03) # Delhi -> Bangkok
    add_edge("air_21", "air_39", "AIR", "Malaysian Strait Air Shuttle (SIN to KUL)", 0.20, 600, 0.01) # Singapore -> KL
    add_edge("air_39", "air_38", "AIR", "ASEAN Air Corridor (KUL to BKK)", 0.35, 800, 0.02) # KL -> Bangkok
    add_edge("air_38", "air_41", "AIR", "Indochina Air Link (BKK to SGN)", 0.30, 750, 0.02) # Bangkok -> Ho Chi Minh
    add_edge("air_41", "air_40", "AIR", "Vietnam North-South Artery (SGN to HAN)", 0.35, 800, 0.02) # Ho Chi Minh -> Hanoi
    add_edge("air_40", "air_16", "AIR", "Vietnam-China Cargo Express (HAN to CAN)", 0.32, 780, 0.02) # Hanoi -> Guangzhou
    add_edge("air_16", "air_17", "AIR", "Pearl River Aviation Shuttles (CAN to SZX)", 0.15, 450, 0.01) # Guangzhou -> Shenzhen
    add_edge("air_17", "air_01", "AIR", "Greater Bay Air Corridor (SZX to HKG)", 0.12, 400, 0.01) # Shenzhen -> HKG
    add_edge("air_01", "air_03", "AIR", "Hong Kong - Shanghai Cargo Expressway (HKG to PVG)", 0.38, 820, 0.02) # HKG -> Shanghai
    add_edge("air_03", "air_22", "AIR", "China North-South Air Artery (PVG to PEK)", 0.38, 820, 0.02) # Shanghai -> Beijing
    add_edge("air_03", "air_05", "AIR", "Yellow Sea Air Express (PVG to ICN)", 0.35, 800, 0.02) # Shanghai -> Incheon
    add_edge("air_05", "air_26", "AIR", "Seoul-Tokyo Air Shuttle (ICN to HND)", 0.35, 800, 0.02) # Incheon -> Haneda
    add_edge("air_26", "air_10", "AIR", "Tokyo Cargo Gateways (HND to NRT)", 0.10, 350, 0.01) # Haneda -> Narita
    add_edge("air_10", "air_27", "AIR", "Japan Kansai Cargo Corridor (NRT to KIX)", 0.28, 700, 0.02) # Narita -> Kansai
    add_edge("air_08", "air_01", "AIR", "Taiwan Strait Air Route (TPE to HKG)", 0.30, 750, 0.02) # Taoyuan -> HKG
    add_edge("air_22", "air_01", "AIR", "Beijing to Hong Kong Air Corridor", 0.38, 820, 0.02) # Beijing -> HKG

    # South America & Africa Intercontinental
    add_edge("air_07", "air_46", "AIR", "Caribbean Cargo Trunk (MIA to BOG)", 0.48, 850, 0.03) # Miami -> Bogota
    add_edge("air_46", "air_45", "AIR", "Amazon Cargo Artery (BOG to GRU)", 0.54, 860, 0.03) # Bogota -> Sao Paulo
    add_edge("air_45", "air_47", "AIR", "Southern Cone Cargo Expressway (GRU to SCL)", 0.45, 840, 0.03) # Sao Paulo -> Santiago
    add_edge("air_46", "air_47", "AIR", "Andean Air Route (BOG to SCL)", 0.48, 850, 0.03) # Bogota -> Santiago
    add_edge("air_50", "air_49", "AIR", "Nile-Rift Air Corridor (CAI to NBO)", 0.48, 850, 0.04) # Cairo -> Nairobi
    add_edge("air_49", "air_48", "AIR", "Sub-Saharan Air Artery (NBO to JNB)", 0.50, 850, 0.04) # Nairobi -> Johannesburg
    add_edge("air_13", "air_48", "AIR", "Middle East - Africa Express (DXB to JNB)", 0.58, 880, 0.04) # Dubai -> Johannesburg
    add_edge("air_11", "air_50", "AIR", "Europe to North Africa Trunk (FRA to CAI)", 0.45, 840, 0.03) # Frankfurt -> Cairo

    # =========================================================================
    # 3. RAIL FREIGHT CORRIDORS (50 RAIL HUBS)
    # =========================================================================
    # China Belt & Road Landbridge Network
    add_edge("rail_09", "rail_08", "RAIL", "Sichuan-Chongqing Intermodal Spur", 0.12, 100, 0.03) # Chongqing -> Chengdu
    add_edge("rail_08", "rail_10", "RAIL", "Xi'an Inland Rail Arterial", 0.12, 110, 0.03) # Chengdu -> Xi'an
    add_edge("rail_10", "rail_02", "RAIL", "Northern Silk Rail Corridor (Xi'an to Khorgos)", 0.15, 90, 0.06) # Xi'an -> Khorgos
    add_edge("rail_10", "rail_03", "RAIL", "Dostyk Alashankou Gateway Line", 0.15, 90, 0.06) # Xi'an -> Dostyk
    add_edge("rail_10", "rail_05", "RAIL", "Erenhot Mongolian Landbridge Trunk", 0.14, 85, 0.04) # Xi'an -> Erenhot
    add_edge("rail_05", "rail_04", "RAIL", "Manzhouli Far East Link", 0.14, 85, 0.04) # Erenhot -> Manzhouli
    add_edge("rail_04", "rail_44", "RAIL", "Baikal-Amur Mainline Link", 0.16, 75, 0.07) # Manzhouli -> BAM
    add_edge("rail_44", "rail_43", "RAIL", "Trans-Siberian Trunk Line", 0.17, 80, 0.08) # BAM -> Trans-Siberian

    # Trans-Eurasian Northern Corridor (via Malaszewicze)
    add_edge("rail_02", "rail_01", "RAIL", "Eurasian Northern Landbridge (Khorgos to Malaszewicze)", 0.18, 85, 0.09) # Khorgos -> Malaszewicze
    add_edge("rail_03", "rail_01", "RAIL", "Dostyk-Brest Gateway Corridor", 0.18, 85, 0.09) # Dostyk -> Malaszewicze
    add_edge("rail_43", "rail_01", "RAIL", "Trans-Siberian to Malaszewicze Express", 0.18, 85, 0.08) # Trans-Siberian -> Malaszewicze

    # Middle Corridor / Caucasus Rail (Baku - Poti - Kars - Istanbul)
    add_edge("rail_02", "rail_12", "RAIL", "Trans-Caspian Rail Route (Khorgos to Baku)", 0.16, 85, 0.07) # Khorgos -> Baku
    add_edge("rail_12", "rail_13", "RAIL", "Baku-Tbilisi-Poti Rail Corridor", 0.14, 90, 0.04) # Baku -> Poti
    add_edge("rail_13", "rail_14", "RAIL", "BTK Railway Corridor (Poti to Kars)", 0.14, 90, 0.04) # Poti -> Kars
    add_edge("rail_14", "rail_20", "RAIL", "Anatolian Rail to Balkan Corridor", 0.15, 95, 0.05) # Kars -> Koper

    # Southeast Asia Rail (Laos-China Railway & Pan-Asian Rail)
    add_edge("rail_08", "rail_25", "RAIL", "Kunming-Mohan Southward Rail Spine", 0.12, 100, 0.03) # Chengdu -> Boten/Mohan
    add_edge("rail_25", "rail_26", "RAIL", "Boten-Vientiane Railway (Laos-China Rail)", 0.10, 110, 0.02) # Boten -> Vientiane Thanaleng
    add_edge("rail_26", "rail_27", "RAIL", "Thailand-Malaysia Rail Link (Vientiane to Padang Besar)", 0.12, 95, 0.03) # Vientiane -> Padang Besar
    add_edge("rail_27", "sea_31", "INTERMODAL", "Padang Besar to Tanjung Pelepas Railhead", 0.06, 60, 0.02) # Padang Besar -> PTP Port

    # European Rail Freight Network
    add_edge("rail_01", "rail_11", "RAIL", "Polish Rail Artery (Malaszewicze to Lodz)", 0.10, 95, 0.02) # Malaszewicze -> Lodz
    add_edge("rail_11", "rail_24", "RAIL", "Poland-Germany Border Corridor (Lodz to Frankfurt Oder)", 0.10, 100, 0.02) # Lodz -> Frankfurt Oder
    add_edge("rail_24", "rail_07", "RAIL", "North German Rail Trunk (Frankfurt Oder to Hamburg Billwerder)", 0.10, 110, 0.02) # Frankfurt Oder -> Hamburg
    add_edge("rail_07", "rail_06", "RAIL", "Hamburg to Duisburg Ruhr Artery", 0.10, 110, 0.02) # Hamburg -> Duisburg
    add_edge("rail_06", "rail_19", "RAIL", "Betuweroute Cross-Border Rail Link", 0.09, 105, 0.02) # Duisburg -> Betuweroute
    add_edge("rail_19", "rail_18", "RAIL", "Channel Tunnel Freight Corridor", 0.12, 95, 0.03) # Betuweroute -> Eurotunnel
    add_edge("rail_06", "rail_15", "RAIL", "Rhine-Alpine Rail Corridor (Gotthard)", 0.12, 100, 0.03) # Duisburg -> Gotthard
    add_edge("rail_15", "rail_17", "RAIL", "Swiss Alpine Base Tunnel Interconnect", 0.12, 100, 0.03) # Gotthard -> Lotschberg
    add_edge("rail_15", "rail_16", "RAIL", "Gotthard to Brenner Pass Alpine Rail Link", 0.11, 100, 0.02) # Gotthard -> Brenner Pass
    add_edge("rail_16", "rail_21", "RAIL", "Brenner Pass to Verona Quadrante Europa", 0.11, 100, 0.02) # Brenner -> Verona
    add_edge("rail_21", "rail_20", "RAIL", "Verona to Port of Koper Freight Corridor", 0.11, 95, 0.02) # Verona -> Koper
    add_edge("rail_20", "rail_22", "RAIL", "Adriatic to Vienna Rail Trunk", 0.11, 95, 0.02) # Koper -> Vienna
    add_edge("rail_22", "rail_23", "RAIL", "Vienna to Ceska Trebova Rail Corridor", 0.10, 100, 0.02) # Vienna -> Ceska Trebova
    add_edge("rail_23", "rail_24", "RAIL", "Ceska Trebova to Frankfurt Oder Link", 0.10, 100, 0.02) # Ceska Trebova -> Frankfurt Oder

    # Indian Dedicated Freight Corridors (DFCs)
    add_edge("rail_37", "rail_38", "RAIL", "Dadri to Rewari-Madar DFC Spine", 0.08, 100, 0.02) # Dadri -> Rewari-Madar
    add_edge("rail_38", "rail_40", "RAIL", "Rewari to Khatuwas Intermodal DFC", 0.08, 100, 0.02) # Rewari -> Khatuwas
    add_edge("rail_40", "rail_39", "RAIL", "Khatuwas to Sanand Gujarat DFC Trunk", 0.09, 100, 0.02) # Khatuwas -> Sanand
    add_edge("rail_39", "sea_42", "INTERMODAL", "Sanand to Mundra Port Rail Corridor", 0.05, 60, 0.01) # Sanand -> Mundra Port
    add_edge("rail_39", "sea_41", "INTERMODAL", "Sanand to JNPT Mumbai DFC Terminal", 0.06, 70, 0.01) # Sanand -> JNPT Port
    add_edge("rail_37", "rail_42", "RAIL", "Eastern DFC Northern Leg (Dadri to Mughalsarai)", 0.09, 100, 0.03) # Dadri -> Mughalsarai
    add_edge("rail_42", "rail_41", "RAIL", "Eastern DFC Mainline (Mughalsarai to Dankuni)", 0.09, 100, 0.03) # Mughalsarai -> Dankuni
    add_edge("rail_41", "sea_41", "INTERMODAL", "Trans-India Freight Spine (Dankuni to JNPT)", 0.10, 85, 0.03) # Dankuni -> JNPT Port

    # North American Rail Intermodal (Class 1s: BNSF, UP, CN, CPKC, FXE)
    add_edge("rail_28", "rail_31", "RAIL", "Transcon Mainline (Chicago to Kansas City)", 0.11, 100, 0.02) # Chicago -> KC
    add_edge("rail_31", "rail_32", "RAIL", "Mid-America Rail Corridor (KC to Alliance TX)", 0.11, 100, 0.02) # KC -> Alliance TX
    add_edge("rail_32", "rail_29", "RAIL", "Texas Border Rail Gateway (Alliance to Laredo)", 0.10, 95, 0.02) # Alliance TX -> Laredo
    add_edge("rail_29", "rail_30", "RAIL", "Border Twin Intermodal Connector (Laredo to Eagle Pass)", 0.05, 80, 0.01) # Laredo -> Eagle Pass
    add_edge("rail_30", "rail_32", "RAIL", "Eagle Pass to Alliance TX Direct Line", 0.10, 95, 0.02) # Eagle Pass -> Alliance TX
    add_edge("rail_28", "rail_34", "RAIL", "Illinois Central Corridor (Chicago to Memphis)", 0.10, 95, 0.02) # Chicago -> Memphis
    add_edge("rail_31", "rail_33", "RAIL", "BNSF Southern Transcon (KC to LA Hobart)", 0.12, 105, 0.02) # KC -> LA Hobart
    add_edge("rail_28", "rail_35", "RAIL", "Great Lakes Rail Corridor (Chicago to Detroit/Windsor)", 0.09, 95, 0.02) # Chicago -> Detroit Tunnel
    add_edge("rail_28", "rail_36", "RAIL", "Midwest to Canada Link (Chicago to Int Falls)", 0.11, 95, 0.02) # Chicago -> Int Falls
    add_edge("rail_35", "sea_45", "INTERMODAL", "Detroit Tunnel to NY/NJ Port Intermodal", 0.08, 80, 0.02) # Detroit -> NY/NJ Port

    # Australia, Africa & South America Rail Networks
    add_edge("rail_45", "rail_46", "RAIL", "Trans-Australian Freight Corridor (Pilbara to Parkes)", 0.14, 90, 0.04) # Pilbara -> Parkes
    add_edge("rail_47", "rail_50", "RAIL", "East African Inter-Railway (Mombasa to TAZARA)", 0.14, 80, 0.04) # Mombasa SGR -> TAZARA
    add_edge("rail_50", "rail_48", "RAIL", "Southern African Rail Corridor (TAZARA to Sishen)", 0.14, 85, 0.04) # TAZARA -> Sishen
    add_edge("rail_49", "sea_47", "INTERMODAL", "Carajás Heavy Rail to Port of Santos", 0.10, 80, 0.02) # Carajas -> Santos Port

    # =========================================================================
    # 4. COMPREHENSIVE INTERMODAL TRANSFER CONNECTORS (SEA <-> AIR <-> RAIL)
    # =========================================================================
    # South Asia Intermodal
    add_edge("sea_41", "air_43", "INTERMODAL", "Mumbai Port-Airport Air-Sea Link", 0.05, 40, 0.01) # JNPT Sea -> Mumbai Air
    add_edge("rail_37", "air_42", "INTERMODAL", "Delhi NCR Multimodal Logistics Airhead", 0.04, 40, 0.01) # Dadri -> Delhi Air
    add_edge("rail_41", "air_44", "INTERMODAL", "India East-South Multimodal Bridge", 0.08, 60, 0.02) # Dankuni -> Bengaluru Air

    # East Asia Intermodal
    add_edge("sea_21", "air_03", "INTERMODAL", "Shanghai Yangshan-Pudong Air-Sea Bridge", 0.05, 40, 0.01) # Shanghai Sea -> PVG Air
    add_edge("sea_28", "air_01", "INTERMODAL", "Hong Kong Maritime-Aviation Gateway", 0.04, 40, 0.01) # HK Sea -> HKG Air
    add_edge("sea_24", "air_17", "INTERMODAL", "Shenzhen Yantian-Bao'an Logistics Link", 0.04, 40, 0.01) # Shenzhen Sea -> Shenzhen Air
    add_edge("sea_22", "air_21", "INTERMODAL", "Singapore Changi-Jurong Multimodal Hub", 0.04, 40, 0.01) # Singapore Sea -> SIN Air
    add_edge("sea_26", "air_05", "INTERMODAL", "Busan-Incheon Transshipment Shuttle", 0.06, 60, 0.02) # Busan Sea -> ICN Air
    add_edge("sea_21", "rail_08", "INTERMODAL", "Shanghai Port to Chengdu Rail Link", 0.10, 80, 0.02) # Shanghai Sea -> Chengdu Rail
    add_edge("sea_28", "rail_09", "INTERMODAL", "Hong Kong to Chongqing Rail Corridor", 0.10, 80, 0.02) # HK Sea -> Chongqing Rail

    # North America Intermodal
    add_edge("sea_43", "rail_33", "INTERMODAL", "Port of LA to Hobart Yard Intermodal Transfer", 0.03, 30, 0.01) # LA Port -> LA Hobart Rail
    add_edge("sea_44", "rail_33", "INTERMODAL", "Port of Long Beach to Hobart Yard Transfer", 0.03, 30, 0.01) # Long Beach Port -> LA Hobart Rail
    add_edge("sea_43", "air_09", "INTERMODAL", "LAX Air-Sea Transfer Corridor", 0.04, 35, 0.01) # LA Port -> LAX Air
    add_edge("sea_45", "air_30", "INTERMODAL", "New York Harbor to JFK Air Cargo Gateway", 0.04, 35, 0.01) # NY/NJ Port -> JFK Air
    add_edge("sea_46", "rail_32", "INTERMODAL", "Port of Houston to Alliance Texas Rail", 0.08, 70, 0.02) # Houston Port -> Alliance TX Rail
    add_edge("sea_48", "air_07", "INTERMODAL", "Panama Colon to Miami Air-Sea Fastbridge", 0.15, 250, 0.03) # Colon Panama -> Miami Air
    add_edge("rail_28", "air_14", "INTERMODAL", "Chicago Rail Complex to O'Hare Cargo Hub", 0.03, 40, 0.01) # Chicago Rail -> ORD Air
    add_edge("rail_34", "air_02", "INTERMODAL", "Memphis Rail Intermodal to FedEx World Hub", 0.03, 35, 0.01) # Memphis Rail -> Memphis Air

    # Europe Intermodal
    add_edge("sea_33", "rail_06", "INTERMODAL", "Port of Rotterdam to Duisport Rail Hub", 0.05, 50, 0.01) # Rotterdam Sea -> Duisburg Rail
    add_edge("sea_34", "rail_06", "INTERMODAL", "Port of Antwerp to Duisport Rail Link", 0.05, 50, 0.01) # Antwerp Sea -> Duisburg Rail
    add_edge("sea_35", "rail_07", "INTERMODAL", "Port of Hamburg to Billwerder Terminal", 0.03, 35, 0.01) # Hamburg Sea -> Hamburg Rail
    add_edge("sea_33", "air_15", "INTERMODAL", "Rotterdam Port to Schiphol Air Cargo", 0.04, 40, 0.01) # Rotterdam Sea -> AMS Air
    add_edge("sea_36", "air_36", "INTERMODAL", "Valencia Port to Madrid Barajas Air Link", 0.06, 60, 0.02) # Valencia Sea -> Madrid Air
    add_edge("sea_37", "air_29", "INTERMODAL", "Piraeus Port to Istanbul Air Corridor", 0.08, 80, 0.02) # Piraeus Sea -> Istanbul Air
    add_edge("rail_06", "air_11", "INTERMODAL", "Duisport Rail to Frankfurt Airport Shuttle", 0.05, 60, 0.01) # Duisburg Rail -> Frankfurt Air
    add_edge("rail_07", "air_19", "INTERMODAL", "Hamburg Rail to Leipzig DHL Superhub", 0.06, 65, 0.01) # Hamburg Rail -> Leipzig Air
    add_edge("rail_18", "air_23", "INTERMODAL", "Eurotunnel to London Heathrow Cargo Link", 0.04, 45, 0.01) # Eurotunnel Rail -> LHR Air

    # Middle East Intermodal
    add_edge("sea_38", "air_13", "INTERMODAL", "Jebel Ali Port to Dubai World Central Air Link", 0.03, 35, 0.01) # Jebel Ali Sea -> DXB Air
    add_edge("sea_39", "air_12", "INTERMODAL", "Salalah Port to Doha Hamad Air-Sea Link", 0.08, 90, 0.02) # Salalah Sea -> Doha Air

    # South America, Africa & Oceania Intermodal
    add_edge("sea_47", "air_45", "INTERMODAL", "Port of Santos to Sao Paulo Guarulhos", 0.04, 40, 0.01) # Santos Sea -> Sao Paulo Air
    add_edge("sea_50", "rail_48", "INTERMODAL", "Port of Durban to Sishen Rail Line", 0.08, 70, 0.02) # Durban Sea -> Sishen Rail
    add_edge("sea_50", "air_48", "INTERMODAL", "Port of Durban to Johannesburg Airport", 0.07, 70, 0.02) # Durban Sea -> JNB Air
    add_edge("rail_47", "air_49", "INTERMODAL", "Mombasa SGR to Nairobi Cargo Terminal", 0.05, 50, 0.01) # Mombasa Rail -> Nairobi Air
    add_edge("rail_45", "sea_18", "INTERMODAL", "Pilbara Rail to Torres Strait Maritime Gateway", 0.10, 80, 0.02) # Pilbara Rail -> Torres Sea
    add_edge("rail_46", "air_21", "INTERMODAL", "Parkes Logistics Hub to Singapore Air-Sea Bridge", 0.20, 250, 0.03) # Parkes Rail -> Singapore Air
    add_edge("rail_46", "sea_19", "INTERMODAL", "Parkes Logistics Hub to Cook Strait Maritime", 0.10, 80, 0.02) # Parkes Rail -> Cook Strait Sea

    return edges


ALL_EDGES = _generate_realistic_network_edges()

def build_base_graph() -> nx.DiGraph:
    G = nx.DiGraph()
    for n in RAW_NODES_DATA:
        G.add_node(
            n["id"],
            name=n["name"],
            type=n["type"],
            location=n["location"],
            region=n.get("region", ""),
            lat=n["lat"],
            lng=n["lng"],
            congestion=n["congestion"],
            weather=n["weather"],
            network_risk=n["network_risk"],
            expected_delay_hours=n["expected_delay_hours"],
            expected_loss_usd=n["expected_loss_usd"]
        )

    for e in ALL_EDGES:
        G.add_edge(
            e["u"],
            e["v"],
            mode=e["mode"],
            name=e["name"],
            distance_km=e["distance_km"],
            transit_days=e["transit_days"],
            freight_cost_usd=e["freight_cost_usd"],
            base_risk=e["base_risk"]
        )
    return G

BASE_GRAPH = build_base_graph()

# ==============================================================================
# AI DISRUPTION CONSTRAINT EXTRACTOR (Hybrid: Groq LLM + NLP Fallback)
# Groq Model: openai/gpt-oss-120b (primary) | Failover: GROQ_API_KEY_1
# ==============================================================================

AI_CONSTRAINT_EXTRACTION_PROMPT = """Analyze this logistics disruption and return ONLY a JSON object.

ORIGIN: {from_name} ({from_type}) in {from_loc}
DESTINATION: {to_name} ({to_type}) in {to_loc}
DISRUPTION: "{problem_text}"

Rules:
- Identify ALL blocked oceans/seas/straits/regions/airspace
- If any ocean/sea is blocked by war: add "SEA" to blocked_transport_modes, set preferred_transport_mode to "RAIL" or "AIR"
- keyword_identifiers = lowercase location names in the blocked zones

Return ONLY this JSON (no other text):
{{"disruption_type":"MILITARY_CONFLICT|WEATHER_DROUGHT|CANAL_BLOCKADE|AIRSPACE_CLOSURE|PORT_STRIKE|PIRACY|GENERAL_RISK","severity":"CRITICAL|HIGH|MODERATE|LOW","affected_regions":["..."],"blocked_straits_or_chokepoints":["..."],"blocked_transport_modes":["SEA"|"AIR"|"RAIL"],"preferred_transport_mode":"SEA|RAIL|AIR|ANY","keyword_identifiers":["..."],"user_routing_preference":"FASTEST|CHEAPEST|SAFEST|BALANCED","ai_threat_summary":"..."}}"""

def extract_constraints_deterministic_nlp(problem_text: str) -> Dict[str, Any]:
    """
    Expanded NLP fallback — covers all major global oceans, seas, straits, and conflict types.
    Used when Groq API is unavailable or both keys are exhausted.
    """
    text = (problem_text or "").lower()

    affected_regions: List[str] = []
    blocked_straits: List[str] = []
    blocked_modes: List[str] = []
    preferred_mode = "ANY"
    keywords: List[str] = []
    severity = "HIGH"
    disruption_type = "GENERAL_RISK"
    preference = "BALANCED"

    # ── INDIAN OCEAN / ARABIAN SEA / BAY OF BENGAL ──────────────────────────
    if any(k in text for k in ["indian ocean", "arabian sea", "bay of bengal", "laccadive sea"]):
        affected_regions.extend(["Indian Ocean", "Arabian Sea", "Bay of Bengal"])
        blocked_straits.extend(["Strait of Hormuz", "Bab-el-Mandeb Strait", "Strait of Malacca"])
        keywords.extend(["indian ocean", "arabian sea", "bay of bengal", "india", "mumbai",
                         "colombo", "maldives", "oman", "hormuz", "malacca", "singapore",
                         "sri lanka", "chennai", "karachi", "chittagong", "myanmar", "yangon"])
        disruption_type = "MILITARY_CONFLICT"
        severity = "CRITICAL"
        preferred_mode = "RAIL"  # Sea entirely blocked — reroute overland or air
        preference = "SAFEST"

    # ── SOUTH CHINA SEA / TAIWAN STRAIT / EAST ASIA ─────────────────────────
    if any(k in text for k in ["south china sea", "taiwan strait", "east china sea", "yellow sea",
                                "south china", "taiwan", "philippines sea"]):
        affected_regions.extend(["South China Sea", "Taiwan Strait", "East China Sea"])
        blocked_straits.extend(["Taiwan Strait", "Luzon Strait"])
        keywords.extend(["south china sea", "taiwan", "manila", "hong kong", "shanghai",
                         "korea", "japan", "philippines", "luzon", "kaohsiung", "busan"])
        disruption_type = "MILITARY_CONFLICT"
        severity = "CRITICAL"
        preferred_mode = "AIR"
        preference = "SAFEST"

    # ── STRAIT OF HORMUZ / PERSIAN GULF ─────────────────────────────────────
    if any(k in text for k in ["hormuz", "persian gulf", "gulf of oman", "iran", "iraq",
                                "kuwait", "bahrain", "qatar"]):
        affected_regions.extend(["Strait of Hormuz", "Persian Gulf", "Gulf of Oman"])
        blocked_straits.append("Strait of Hormuz")
        keywords.extend(["hormuz", "persian gulf", "iran", "gulf", "jebel ali", "dubai",
                         "abu dhabi", "muscat", "salalah", "bandar", "mundra", "karachi"])
        disruption_type = "MILITARY_CONFLICT"
        severity = "CRITICAL"

    # ── SUEZ CANAL / RED SEA / BAB-EL-MANDEB ────────────────────────────────
    if any(k in text for k in ["suez", "red sea", "bab-el-mandeb", "bab el mandeb",
                                "yemen", "houthi", "djibouti", "egypt", "aden"]):
        affected_regions.extend(["Suez Canal", "Red Sea", "Bab-el-Mandeb Strait", "Gulf of Aden"])
        blocked_straits.extend(["Suez Canal", "Bab-el-Mandeb Strait"])
        keywords.extend(["suez", "red sea", "bab-el-mandeb", "djibouti", "aden",
                         "jeddah", "port sudan", "eritrea", "egypt"])
        disruption_type = "CANAL_BLOCKADE" if any(k in text for k in ["block", "drought"]) else "MILITARY_CONFLICT"
        severity = "CRITICAL"

    # ── PANAMA CANAL / CENTRAL AMERICA ──────────────────────────────────────
    if any(k in text for k in ["panama", "gatun", "canal draft", "central america"]):
        affected_regions.extend(["Panama Canal", "Caribbean Sea"])
        blocked_straits.append("Panama Canal")
        keywords.extend(["panama", "colon", "gatun", "central america"])
        disruption_type = "WEATHER_DROUGHT" if "drought" in text else "CANAL_BLOCKADE"
        severity = "HIGH"

    # ── STRAIT OF MALACCA / SINGAPORE / SOUTHEAST ASIA ──────────────────────
    if any(k in text for k in ["malacca", "singapore strait", "piracy", "lombok strait",
                                "sunda strait", "banda sea", "indonesia"]):
        affected_regions.extend(["Strait of Malacca", "Southeast Asia Maritime"])
        blocked_straits.extend(["Strait of Malacca", "Singapore Strait"])
        keywords.extend(["malacca", "singapore", "indonesia", "piracy", "port klang",
                         "batam", "medan", "penang", "lombok", "sunda"])
        disruption_type = "PIRACY"
        severity = "HIGH"

    # ── MEDITERRANEAN SEA / BOSPHORUS / BLACK SEA ────────────────────────────
    if any(k in text for k in ["mediterranean", "bosphorus", "black sea", "aegean",
                                "dardanelles", "sicily", "gibraltar", "italy", "greece",
                                "turkey", "ukraine", "russia war"]):
        affected_regions.extend(["Mediterranean Sea", "Black Sea", "Bosphorus Strait"])
        blocked_straits.extend(["Bosphorus Strait", "Strait of Gibraltar"])
        keywords.extend(["mediterranean", "bosphorus", "black sea", "istanbul", "athens",
                         "piraeus", "genoa", "barcelona", "marseille", "naples", "valencia",
                         "constanta", "odessa", "ukraine", "novorossiysk"])
        disruption_type = "MILITARY_CONFLICT"
        severity = "CRITICAL"

    # ── PACIFIC OCEAN ────────────────────────────────────────────────────────
    if any(k in text for k in ["pacific ocean", "north pacific", "south pacific",
                                "transpacific", "pacific war"]):
        affected_regions.extend(["Pacific Ocean", "North Pacific", "South Pacific"])
        blocked_straits.extend(["Taiwan Strait", "Luzon Strait", "Torres Strait"])
        keywords.extend(["pacific", "honolulu", "guam", "anchorage", "tokyo",
                         "yokohama", "busan", "shanghai", "los angeles", "long beach",
                         "seattle", "vancouver", "sydney", "auckland", "singapore"])
        disruption_type = "MILITARY_CONFLICT"
        severity = "CRITICAL"
        preferred_mode = "RAIL"

    # ── ATLANTIC OCEAN ───────────────────────────────────────────────────────
    if any(k in text for k in ["atlantic ocean", "north atlantic", "south atlantic",
                                "transatlantic", "atlantic war", "gulf of mexico"]):
        affected_regions.extend(["Atlantic Ocean", "North Atlantic", "South Atlantic"])
        blocked_straits.extend(["Strait of Gibraltar", "English Channel", "Drake Passage"])
        keywords.extend(["atlantic", "rotterdam", "hamburg", "antwerp", "london",
                         "new york", "baltimore", "houston", "santos", "buenos aires",
                         "durban", "cape town", "dakar", "casablanca", "canary"])
        disruption_type = "MILITARY_CONFLICT"
        severity = "CRITICAL"
        preferred_mode = "AIR"

    # ── NORTH SEA / ENGLISH CHANNEL / EUROPE ─────────────────────────────────
    if any(k in text for k in ["north sea", "english channel", "channel tunnel",
                                "ireland", "scotland", "norway", "denmark"]):
        affected_regions.extend(["North Sea", "English Channel"])
        blocked_straits.extend(["English Channel", "Dover Strait"])
        keywords.extend(["north sea", "rotterdam", "hamburg", "antwerp", "felixstowe",
                         "le havre", "bremerhaven", "london", "oslo"])
        disruption_type = "MILITARY_CONFLICT"
        severity = "HIGH"

    # ── AIRSPACE CLOSURES / EURASIAN / RUSSIA ────────────────────────────────
    if any(k in text for k in ["airspace", "air space", "no fly zone", "fly zone",
                                "siberia", "russian airspace", "ukraine war", "nato"]):
        affected_regions.extend(["Eurasian Airspace", "Trans-Siberian Corridor"])
        keywords.extend(["airspace", "russia", "siberia", "ukraine", "closure", "ban"])
        disruption_type = "AIRSPACE_CLOSURE"
        blocked_modes.append("AIR")
        preferred_mode = "RAIL" if preferred_mode == "ANY" else preferred_mode
        severity = "CRITICAL"

    # ── PORT STRIKES / CONGESTION ────────────────────────────────────────────
    if any(k in text for k in ["strike", "port strike", "labor strike", "dockworker",
                                "congestion", "gridlock", "covid", "lockdown", "customs hold"]):
        affected_regions.append("Major Container Terminals — Strike Action")
        disruption_type = "PORT_STRIKE"
        keywords.extend(["strike", "congestion", "delay", "lockdown"])
        preference = "SAFEST"

    # ── EXPLICIT MODAL PREFERENCE DETECTION ──────────────────────────────────
    if any(k in text for k in ["air cargo", "air freight", "aviation", "aircraft",
                                "fly", "flight", "charter"]):
        preferred_mode = "AIR"
    elif any(k in text for k in ["rail", "railway", "train", "landbridge",
                                  "silk road", "belt and road"]):
        preferred_mode = "RAIL"
    elif any(k in text for k in ["vessel", "ship", "container ship", "bulk carrier",
                                  "oil tanker", "cargo ship"]) and not blocked_modes:
        preferred_mode = "SEA"

    # ── SPEED / COST PREFERENCE ───────────────────────────────────────────────
    if any(k in text for k in ["urgent", "fastest", "asap", "emergency", "express",
                                "perishable", "cold chain", "pharma", "medicine"]):
        preference = "FASTEST"
    elif any(k in text for k in ["cheapest", "budget", "economy", "low cost",
                                  "minimize cost", "cost effective"]):
        preference = "CHEAPEST"
    elif any(k in text for k in ["safest", "safe", "secure", "avoid", "protection",
                                  "war zone", "conflict", "war"]):
        preference = "SAFEST"

    # ── If SEA is blocked, do not prefer SEA ─────────────────────────────────
    if "SEA" in blocked_modes and preferred_mode == "SEA":
        preferred_mode = "RAIL"

    if not affected_regions:
        affected_regions = ["General Risk Corridor"]

    ai_threat_summary = (
        f"NLP threat detection identified {disruption_type.replace('_', ' ')} "
        f"affecting: {', '.join(affected_regions[:3])}. "
        f"Blocking affected corridors and computing Pareto-optimal reroute via {preferred_mode}."
    )

    return {
        "disruption_type": disruption_type,
        "severity": severity,
        "affected_regions": affected_regions,
        "blocked_straits_or_chokepoints": blocked_straits,
        "blocked_transport_modes": blocked_modes,
        "preferred_transport_mode": preferred_mode,
        "keyword_identifiers": keywords,
        "user_routing_preference": preference,
        "ai_threat_summary": ai_threat_summary
    }

async def _call_groq_llm(api_key: str, prompt: str, model_name: Optional[str] = None) -> Dict[str, Any]:
    """Call Groq LLM. Returns parsed constraint dict or raises on failure."""
    if not api_key:
        raise ValueError("Empty Groq API key")
    
    client = AsyncOpenAI(api_key=api_key, base_url=GROQ_BASE_URL)
    model_to_use = model_name or GROQ_MODEL
    
    response = await client.chat.completions.create(
        model=model_to_use,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a geopolitical logistics risk analyst. "
                    "You MUST respond with ONLY a raw JSON object — no markdown fences, no explanation, no extra text. "
                    "Start your response directly with '{' and end with '}'."
                )
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.0,
        max_tokens=1500,
        timeout=15.0
    )
    raw = (response.choices[0].message.content or "").strip()
    if not raw:
        raise ValueError("Empty LLM response received from Groq API")
        
    # Strip markdown code fences if wrapped
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-z]*\s*", "", raw, flags=re.MULTILINE)
        raw = re.sub(r"```\s*$", "", raw, flags=re.MULTILINE).strip()
    
    # Extract first JSON object from text if needed
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        raw = match.group(0)
    
    parsed = json.loads(raw)
    if not isinstance(parsed, dict):
        raise ValueError("LLM response is not a valid JSON dictionary")
    return parsed


async def extract_constraints_with_ai(from_node: Dict[str, Any], to_node: Dict[str, Any], problem_text: str) -> Dict[str, Any]:
    """
    Primary AI constraint extractor:
    1. Try GROQ_API_KEY (primary) with model candidate list
    2. On failure -> try GROQ_API_KEY_1 (failover backup) with model candidates
    3. On both failing -> return deterministic NLP fallback
    """
    # Always compute NLP fallback first (instant, zero network dependency)
    fallback = extract_constraints_deterministic_nlp(problem_text)

    if AsyncOpenAI is None:
        print("[Route AI] [INFO] openai package not installed - using NLP fallback.")
        return fallback

    prompt = AI_CONSTRAINT_EXTRACTION_PROMPT.format(
        from_name=from_node.get("name", "Origin"),
        from_type=from_node.get("type", "SEA"),
        from_loc=from_node.get("location", "N/A"),
        to_name=to_node.get("name", "Destination"),
        to_type=to_node.get("type", "SEA"),
        to_loc=to_node.get("location", "N/A"),
        problem_text=problem_text
    )

    def _apply_quality_gate(parsed: Dict[str, Any], nlp: Dict[str, Any]) -> Dict[str, Any]:
        """Merge NLP results into LLM output. If LLM returned GENERAL_RISK but NLP found something specific, override."""
        # Override GENERAL_RISK with NLP's specific finding
        if parsed.get("disruption_type") == "GENERAL_RISK" and nlp.get("disruption_type") != "GENERAL_RISK":
            parsed["disruption_type"] = nlp["disruption_type"]
            parsed["severity"] = nlp["severity"]
            parsed["user_routing_preference"] = nlp["user_routing_preference"]

        # Merge affected regions (union of LLM + NLP)
        ai_regions = [r for r in (parsed.get("affected_regions") or []) if r and r != "General Risk Corridor"]
        nlp_regions = nlp.get("affected_regions") or []
        parsed["affected_regions"] = list(dict.fromkeys(ai_regions + nlp_regions)) or nlp_regions

        # Merge blocked straits (union)
        ai_straits = parsed.get("blocked_straits_or_chokepoints") or []
        nlp_straits = nlp.get("blocked_straits_or_chokepoints") or []
        parsed["blocked_straits_or_chokepoints"] = list(dict.fromkeys(ai_straits + nlp_straits))

        # Merge blocked modes (union)
        ai_modes = parsed.get("blocked_transport_modes") or []
        nlp_modes = nlp.get("blocked_transport_modes") or []
        parsed["blocked_transport_modes"] = list(dict.fromkeys(ai_modes + nlp_modes))

        # Preferred mode: if LLM says ANY but NLP is specific, use NLP
        if parsed.get("preferred_transport_mode") in ("ANY", None, "") and nlp.get("preferred_transport_mode") not in ("ANY", None, ""):
            parsed["preferred_transport_mode"] = nlp["preferred_transport_mode"]

        # Always merge keyword_identifiers (union)
        ai_kw = parsed.get("keyword_identifiers") or []
        nlp_kw = nlp.get("keyword_identifiers") or []
        parsed["keyword_identifiers"] = list(dict.fromkeys(ai_kw + nlp_kw))

        return parsed

    candidate_models = [GROQ_MODEL, "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "qwen/qwen3.6-27b", "groq/compound"]
    seen_models = []
    for m in candidate_models:
        if m and m not in seen_models:
            seen_models.append(m)

    # ── Attempt 1: Primary API Key ────────────────────────────────────────────
    if GROQ_API_KEY and GROQ_API_KEY != "your_key_here":
        for model in seen_models:
            try:
                parsed = await _call_groq_llm(GROQ_API_KEY, prompt, model_name=model)
                if parsed and parsed.get("disruption_type"):
                    parsed = _apply_quality_gate(parsed, fallback)
                    parsed["ai_engine_source"] = f"GROQ_LIVE_{model.upper().replace('/', '_')}"
                    print(f"[Route AI] [OK] Primary key | Model: {model} | Disruption: {parsed.get('disruption_type')} | Regions: {parsed.get('affected_regions', [])[:2]}")
                    return parsed
            except Exception as e1:
                print(f"[Route AI] [WARN] Primary key with {model} failed: {e1}")

    # ── Attempt 2: Failover API Key ───────────────────────────────────────────
    if GROQ_API_KEY_1 and GROQ_API_KEY_1 != "your_key_here":
        for model in seen_models:
            try:
                parsed = await _call_groq_llm(GROQ_API_KEY_1, prompt, model_name=model)
                if parsed and parsed.get("disruption_type"):
                    parsed = _apply_quality_gate(parsed, fallback)
                    parsed["ai_engine_source"] = f"GROQ_FAILOVER_{model.upper().replace('/', '_')}"
                    print(f"[Route AI] [OK] Failover key | Model: {model} | Disruption: {parsed.get('disruption_type')} | Regions: {parsed.get('affected_regions', [])[:2]}")
                    return parsed
            except Exception as e2:
                print(f"[Route AI] [WARN] Failover key with {model} failed: {e2}")

    # ── Attempt 3: NLP Fallback (always works, zero network dependency) ───────
    fallback["ai_engine_source"] = "DETERMINISTIC_NLP_FALLBACK"
    print(f"[Route AI] [INFO] Using NLP fallback | Disruption: {fallback.get('disruption_type')} | Regions: {fallback.get('affected_regions', [])[:2]}")
    return fallback



# ==============================================================================
# NETWORKX MULTI-OBJECTIVE PATH OPTIMIZER
# ==============================================================================

def optimize_logistics_route(
    from_node_id: str,
    to_node_id: str,
    ai_constraints: Dict[str, Any]
) -> Dict[str, Any]:
    from_node = NODES_BY_ID.get(from_node_id)
    to_node = NODES_BY_ID.get(to_node_id)

    if not from_node or not to_node:
        raise ValueError(f"Invalid FROM or TO node: {from_node_id} -> {to_node_id}")

    if from_node_id == to_node_id:
        return {
            "from_node": from_node,
            "to_node": to_node,
            "optimal_path": [from_node],
            "path_node_ids": [from_node_id],
            "path_edges": [],
            "blocked_nodes": [],
            "blocked_edges": [],
            "affected_regions": [],
            "disruption_type": "NONE",
            "transport_modes": [from_node["type"]],
            "total_distance_km": 0,
            "estimated_transit_time_days": 0.0,
            "estimated_cost_usd": 0.0,
            "carrying_cost_usd": 0.0,
            "risk_score": 0.05,
            "risk_level": "LOW",
            "ai_analysis": "Origin and destination are identical. Zero transit required.",
            "ai_constraints": ai_constraints
        }

    if isinstance(ai_constraints, str):
        ai_constraints = extract_constraints_deterministic_nlp(ai_constraints)
    elif not isinstance(ai_constraints, dict):
        ai_constraints = {}

    # 1. Identify Affected / Blocked Nodes & Edges from AI Constraints
    blocked_straits = [s.lower() for s in ai_constraints.get("blocked_straits_or_chokepoints", [])]
    affected_regions = [r.lower() for r in ai_constraints.get("affected_regions", [])]
    blocked_modes = ai_constraints.get("blocked_transport_modes", [])
    preferred_mode = ai_constraints.get("preferred_transport_mode", "ANY")
    keywords = [k.lower() for k in ai_constraints.get("keyword_identifiers", [])]


    blocked_nodes: List[Dict[str, Any]] = []
    blocked_node_ids: set = set()

    for node in RAW_NODES_DATA:
        if node["id"] in (from_node_id, to_node_id):
            continue

        n_name = node["name"].lower()
        n_loc = node["location"].lower()
        n_reg = node.get("region", "").lower()

        is_blocked = False

        for strait in blocked_straits:
            if strait in n_name or strait in n_loc:
                is_blocked = True
                break

        if not is_blocked:
            for kw in keywords:
                if len(kw) > 2 and (kw in n_name or kw in n_loc or kw in n_reg):
                    is_blocked = True
                    break

        if not is_blocked and any("hormuz" in k for k in (blocked_straits + keywords + affected_regions)):
            if node["id"] in ("sea_04", "sea_38"): # Strait of Hormuz, Jebel Ali
                is_blocked = True

        if not is_blocked and any("suez" in k or "red sea" in k or "bab-el-mandeb" in k for k in (blocked_straits + keywords + affected_regions)):
            if node["id"] in ("sea_02", "sea_05"): # Suez Canal, Bab-el-Mandeb
                is_blocked = True

        if not is_blocked and any("panama" in k for k in (blocked_straits + keywords + affected_regions)):
            if node["id"] in ("sea_03", "sea_48"): # Panama Canal, Colon
                is_blocked = True

        if not is_blocked and any("malacca" in k for k in (blocked_straits + keywords + affected_regions)):
            if node["id"] in ("sea_01",):
                is_blocked = True

        if is_blocked:
            blocked_nodes.append(node)
            blocked_node_ids.add(node["id"])

    # 2. Objective Weights Tuning & Intelligent Modal Preference
    pref = ai_constraints.get("user_routing_preference", "BALANCED")
    origin_type = from_node.get("type", "SEA")
    dest_type = to_node.get("type", "SEA")

    # If user did not force a specific mode, inherit natural mode from endpoints
    if preferred_mode == "ANY":
        if origin_type == "SEA" and dest_type == "SEA":
            preferred_mode = "SEA"
        elif origin_type == "AIR" and dest_type == "AIR":
            preferred_mode = "AIR"
        elif origin_type == "RAIL" and dest_type == "RAIL":
            preferred_mode = "RAIL"

    if pref == "FASTEST":
        w_time, w_cost, w_risk = 0.70, 0.15, 0.15
    elif pref == "CHEAPEST":
        w_time, w_cost, w_risk = 0.10, 0.80, 0.10
    elif pref == "SAFEST":
        w_time, w_cost, w_risk = 0.15, 0.15, 0.70
    else: # BALANCED
        if preferred_mode == "SEA":
            w_time, w_cost, w_risk = 0.30, 0.50, 0.20
        elif preferred_mode == "AIR":
            w_time, w_cost, w_risk = 0.60, 0.20, 0.20
        elif preferred_mode == "RAIL":
            w_time, w_cost, w_risk = 0.35, 0.40, 0.25
        else:
            w_time, w_cost, w_risk = 0.35, 0.35, 0.30

    # 3. Build Penalized Weighted Working Graph
    W = nx.DiGraph()
    for n in RAW_NODES_DATA:
        W.add_node(n["id"], **n)

    blocked_edges: List[Dict[str, Any]] = []

    for e in ALL_EDGES:
        u, v = e["u"], e["v"]
        e_mode = e["mode"]
        e_name = e["name"].lower()

        edge_is_blocked = (u in blocked_node_ids or v in blocked_node_ids)

        if not edge_is_blocked:
            for strait in blocked_straits:
                if strait in e_name:
                    edge_is_blocked = True
                    break

        if not edge_is_blocked and "hormuz" in e_name and any("hormuz" in k for k in (blocked_straits + keywords)):
            edge_is_blocked = True
        if not edge_is_blocked and ("suez" in e_name or "red sea" in e_name or "bab-el-mandeb" in e_name) and any("suez" in k or "red sea" in k or "bab-el-mandeb" in k for k in (blocked_straits + keywords)):
            edge_is_blocked = True
        if not edge_is_blocked and "panama" in e_name and any("panama" in k for k in (blocked_straits + keywords)):
            edge_is_blocked = True

        if edge_is_blocked:
            blocked_edges.append(e)
            penalty_multiplier = 300.0
            effective_risk = 0.98
        else:
            penalty_multiplier = 1.0
            effective_risk = e["base_risk"]

        if e_mode in blocked_modes:
            penalty_multiplier *= 100.0
            effective_risk = 0.95

        # Mode alignment bonus
        mode_pref_factor = 1.0
        if preferred_mode != "ANY" and e_mode != preferred_mode and e_mode != "INTERMODAL":
            mode_pref_factor = 3.5
            
        # Modal change / intermodal transshipment cost
        is_intermodal = (e_mode == "INTERMODAL")
        intermodal_penalty = 2.0 if is_intermodal else 1.0

        # Weighted composite edge cost
        norm_cost = (e["freight_cost_usd"] / 10000.0)
        norm_time = (e["transit_days"] / 7.0)
        norm_risk = (effective_risk * 15.0)

        composite_weight = (
            w_cost * norm_cost +
            w_time * norm_time +
            w_risk * norm_risk
        ) * penalty_multiplier * mode_pref_factor * intermodal_penalty

        W.add_edge(
            u, v,
            weight=composite_weight,
            distance_km=e["distance_km"],
            transit_days=e["transit_days"],
            freight_cost_usd=e["freight_cost_usd"],
            risk=effective_risk,
            mode=e_mode,
            name=e["name"],
            is_penalized=edge_is_blocked
        )

    # 4. Calculate Shortest Path using Dijkstra with Multi-Objective Weights
    try:
        path_ids = nx.shortest_path(W, source=from_node_id, target=to_node_id, weight="weight")
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        try:
            path_ids = nx.shortest_path(BASE_GRAPH, source=from_node_id, target=to_node_id, weight="freight_cost_usd")
        except Exception:
            path_ids = [from_node_id, to_node_id]

    # 5. Extract Optimal Path Attributes
    optimal_nodes = [NODES_BY_ID[nid] for nid in path_ids if nid in NODES_BY_ID]
    path_edges: List[Dict[str, Any]] = []
    total_dist = 0.0
    total_time = 0.0
    total_cost = 0.0
    risk_accum = 0.0
    modes_seen: List[str] = []

    for i in range(len(path_ids) - 1):
        u_id = path_ids[i]
        v_id = path_ids[i + 1]
        edge_data = W.get_edge_data(u_id, v_id) or {}

        dist = edge_data.get("distance_km", haversine_km(NODES_BY_ID[u_id]["lat"], NODES_BY_ID[u_id]["lng"], NODES_BY_ID[v_id]["lat"], NODES_BY_ID[v_id]["lng"]))
        t_days = edge_data.get("transit_days", 2.0)
        c_usd = edge_data.get("freight_cost_usd", 4500.0)
        r_val = edge_data.get("risk", 0.05)
        m_mode = edge_data.get("mode", NODES_BY_ID[v_id]["type"])
        e_name = edge_data.get("name", f"{NODES_BY_ID[u_id]['name']} to {NODES_BY_ID[v_id]['name']}")

        total_dist += dist
        total_time += t_days
        total_cost += c_usd
        risk_accum += r_val

        actual_mode = NODES_BY_ID[v_id]["type"] if m_mode == "INTERMODAL" else m_mode
        if not modes_seen or modes_seen[-1] != actual_mode:
            modes_seen.append(actual_mode)

        path_edges.append({
            "u": u_id,
            "v": v_id,
            "from_name": NODES_BY_ID[u_id]["name"],
            "to_name": NODES_BY_ID[v_id]["name"],
            "mode": m_mode,
            "name": e_name,
            "distance_km": round(dist, 1),
            "transit_days": round(t_days, 1),
            "freight_cost_usd": round(c_usd, 2),
            "risk": round(r_val, 2)
        })

    num_hops = max(1, len(path_edges))
    composite_risk_val = min(0.95, round(risk_accum / num_hops + (0.01 * num_hops), 2))

    if composite_risk_val < 0.25:
        risk_level = "LOW"
    elif composite_risk_val < 0.55:
        risk_level = "MODERATE"
    elif composite_risk_val < 0.75:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    order_value = 350000.0
    carrying_cost_usd = round(order_value * 0.072 * (total_time / 365.0), 2)

    # 6. Generate Context-Aware AI Intelligence Explanation
    avoided_names = [n["name"] for n in blocked_nodes[:4]]
    path_summary_str = " -> ".join([n["name"] for n in optimal_nodes])

    threat_summary = ai_constraints.get("ai_threat_summary", "")
    disruption_type = ai_constraints.get("disruption_type", "GENERAL_RISK").replace("_", " ")

    if blocked_nodes:
        ai_reasoning = (
            f"STRATEGIC UNDERWRITING VERDICT: Successfully circumvented active {disruption_type} "
            f"impacting {', '.join(ai_constraints.get('affected_regions', ['disrupted zone'])[:2])}. "
            f"The deterministic routing engine excluded high-risk checkpoints ({', '.join(avoided_names)}) "
            f"and calculated the Pareto-optimal alternative via {path_summary_str}. "
            f"Landed freight is locked at ${total_cost:,.2f} with transit duration of {total_time:.1f} days "
            f"and an estimated capital carrying cost of ${carrying_cost_usd:,.2f} ({risk_level} Risk Profile)."
        )
    else:
        ai_reasoning = (
            f"OPTIMAL ROUTE COMPUTED: Operating along nominal global logistics corridors. "
            f"The selected pathway ({path_summary_str}) achieves an optimal equilibrium between "
            f"transit velocity ({total_time:.1f} days) and capital efficiency (${total_cost:,.2f} freight). "
            f"Network exposure remains within safe operational bounds ({risk_level} Risk)."
        )

    return {
        "from_node": from_node,
        "to_node": to_node,
        "optimal_path": optimal_nodes,
        "path_node_ids": path_ids,
        "path_edges": path_edges,
        "blocked_nodes": blocked_nodes,
        "blocked_edges": blocked_edges,
        "affected_regions": ai_constraints.get("affected_regions", []),
        "disruption_type": ai_constraints.get("disruption_type", "GENERAL_RISK"),
        "transport_modes": modes_seen if modes_seen else [from_node["type"]],
        "total_distance_km": round(total_dist, 1),
        "estimated_transit_time_days": round(total_time, 1),
        "estimated_cost_usd": round(total_cost, 2),
        "carrying_cost_usd": carrying_cost_usd,
        "risk_score": composite_risk_val,
        "risk_level": risk_level,
        "ai_analysis": ai_reasoning,
        "ai_constraints": ai_constraints
    }


# ==============================================================================
# HIGH-LEVEL ASYNC PIPELINE CONTROLLER
# ==============================================================================

async def analyze_global_logistics_route(
    from_node_id: str,
    to_node_id: str,
    problem_text: str
) -> Dict[str, Any]:
    from_node = NODES_BY_ID.get(from_node_id)
    to_node = NODES_BY_ID.get(to_node_id)

    if not from_node:
        raise ValueError(f"Origin node '{from_node_id}' not found in 150-node dataset.")
    if not to_node:
        raise ValueError(f"Destination node '{to_node_id}' not found in 150-node dataset.")

    # AI Extraction
    ai_constraints = await extract_constraints_with_ai(from_node, to_node, problem_text)

    # Deterministic Optimization
    result = optimize_logistics_route(from_node_id, to_node_id, ai_constraints)
    return result
