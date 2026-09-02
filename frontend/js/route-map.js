/**
 * NODE-X-LOGISTICS — ADVANCED GLOBAL ROUTE INTELLIGENCE WORLD MAP
 * High-Performance Interactive Map Engine (Leaflet 1.9.4 + CartoDB Dark Matter + Geodesic Vectors)
 * 150 Logistics Checkpoints (50 Maritime Sea Nodes, 50 Air Cargo Hubs, 50 Rail Freight Hubs)
 * Real-Time Hybrid AI Disruption Extractor & Deterministic Graph Routing
 * IEEE HACKVERSE 2026 #6
 */

(function () {
  "use strict";

  // --- 1. THE 150 CHECKPOINTS DATASET ---
  const RAW_150_NODES = [
    // MARITIME SHIPPING (50)
    { id: "sea_01", num: 1, name: "Strait of Malacca", type: "SEA", location: "Malaysia / Singapore / Indonesia", region: "Southeast Asia", lat: 1.43, lng: 102.89, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 11, expected_loss_usd: 2203, chokepoint: true },
    { id: "sea_02", num: 2, name: "Suez Canal", type: "SEA", location: "Egypt", region: "Middle East / North Africa", lat: 30.58, lng: 32.56, congestion: "HIGH", weather: "MODERATE", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 30, expected_loss_usd: 6800, chokepoint: true },
    { id: "sea_03", num: 3, name: "Panama Canal", type: "SEA", location: "Panama", region: "Central America", lat: 9.10, lng: -79.69, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 23, expected_loss_usd: 4607, chokepoint: true },
    { id: "sea_04", num: 4, name: "Strait of Hormuz", type: "SEA", location: "Oman / Iran", region: "Middle East", lat: 26.56, lng: 56.25, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 21, expected_loss_usd: 3658, chokepoint: true },
    { id: "sea_05", num: 5, name: "Bab-el-Mandeb Strait", type: "SEA", location: "Djibouti / Yemen", region: "Red Sea / Middle East", lat: 12.58, lng: 43.33, congestion: "HIGH", weather: "MODERATE", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 19, expected_loss_usd: 4807, chokepoint: true },
    { id: "sea_06", num: 6, name: "Strait of Gibraltar", type: "SEA", location: "Spain / Morocco", region: "Mediterranean / Europe", lat: 35.96, lng: -5.60, congestion: "LOW", weather: "MODERATE", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190, chokepoint: true },
    { id: "sea_07", num: 7, name: "Bosphorus & Dardanelles", type: "SEA", location: "Turkey", region: "Black Sea / Europe", lat: 41.12, lng: 29.08, congestion: "HIGH", weather: "HIGH", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 18, expected_loss_usd: 3605, chokepoint: true },
    { id: "sea_08", num: 8, name: "English Channel", type: "SEA", location: "UK / France", region: "North Europe", lat: 50.18, lng: -0.53, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 17, expected_loss_usd: 2962, chokepoint: true },
    { id: "sea_09", num: 9, name: "Danish Straits", type: "SEA", location: "Denmark / Sweden", region: "Baltic / Europe", lat: 55.58, lng: 11.08, congestion: "LOW", weather: "MODERATE", network_risk: "LOW", currency_risk: "HIGH", expected_delay_hours: 4, expected_loss_usd: 590, chokepoint: true },
    { id: "sea_10", num: 10, name: "Cape of Good Hope", type: "SEA", location: "South Africa", region: "Southern Africa", lat: -34.35, lng: 18.47, congestion: "HIGH", weather: "LOW", network_risk: "MODERATE", currency_risk: "HIGH", expected_delay_hours: 16, expected_loss_usd: 3626, chokepoint: true },
    { id: "sea_11", num: 11, name: "Sunda Strait", type: "SEA", location: "Indonesia", region: "Southeast Asia", lat: -5.98, lng: 105.77, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 3, expected_loss_usd: 358, chokepoint: true },
    { id: "sea_12", num: 12, name: "Lombok Strait", type: "SEA", location: "Indonesia", region: "Southeast Asia", lat: -8.54, lng: 115.72, congestion: "MODERATE", weather: "MODERATE", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024, chokepoint: true },
    { id: "sea_13", num: 13, name: "Makassar Strait", type: "SEA", location: "Indonesia", region: "Southeast Asia", lat: -0.80, lng: 118.60, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 3, expected_loss_usd: 358, chokepoint: true },
    { id: "sea_14", num: 14, name: "Strait of Magellan", type: "SEA", location: "Chile", region: "South America", lat: -53.48, lng: -70.78, congestion: "MODERATE", weather: "MODERATE", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024, chokepoint: true },
    { id: "sea_15", num: 15, name: "Drake Passage / Cape Horn", type: "SEA", location: "Chile / Antarctica", region: "South America", lat: -56.50, lng: -67.27, congestion: "LOW", weather: "MODERATE", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 8, expected_loss_usd: 2024, chokepoint: true },
    { id: "sea_16", num: 16, name: "Kiel Canal", type: "SEA", location: "Germany", region: "North Europe", lat: 54.26, lng: 9.59, congestion: "LOW", weather: "HIGH", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024, chokepoint: true },
    { id: "sea_17", num: 17, name: "Saint Lawrence Seaway", type: "SEA", location: "Canada / USA", region: "North America", lat: 44.97, lng: -74.90, congestion: "LOW", weather: "HIGH", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 5, expected_loss_usd: 875, chokepoint: true },
    { id: "sea_18", num: 18, name: "Torres Strait", type: "SEA", location: "Australia / Papua New Guinea", region: "Oceania", lat: -10.25, lng: 142.17, congestion: "MODERATE", weather: "HIGH", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 7, expected_loss_usd: 1581, chokepoint: true },
    { id: "sea_19", num: 19, name: "Cook Strait", type: "SEA", location: "New Zealand", region: "Oceania", lat: -41.23, lng: 174.55, congestion: "MODERATE", weather: "HIGH", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 3, expected_loss_usd: 358, chokepoint: true },
    { id: "sea_20", num: 20, name: "Strait of Messina", type: "SEA", location: "Italy", region: "Mediterranean / Europe", lat: 38.22, lng: 15.63, congestion: "LOW", weather: "HIGH", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024, chokepoint: true },
    { id: "sea_21", num: 21, name: "Port of Shanghai (Yangshan)", type: "SEA", location: "China", region: "East Asia", lat: 30.63, lng: 122.06, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 20, expected_loss_usd: 3479 },
    { id: "sea_22", num: 22, name: "Port of Singapore", type: "SEA", location: "Singapore", region: "Southeast Asia", lat: 1.26, lng: 103.82, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 29, expected_loss_usd: 2751 },
    { id: "sea_23", num: 23, name: "Port of Ningbo-Zhoushan", type: "SEA", location: "China", region: "East Asia", lat: 29.89, lng: 121.84, congestion: "HIGH", weather: "LOW", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 21, expected_loss_usd: 2551 },
    { id: "sea_24", num: 24, name: "Port of Shenzhen (Yantian/Shekou)", type: "SEA", location: "China", region: "East Asia", lat: 22.58, lng: 114.28, congestion: "HIGH", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 25, expected_loss_usd: 5672 },
    { id: "sea_25", num: 25, name: "Port of Guangzhou (Nansha)", type: "SEA", location: "China", region: "East Asia", lat: 22.75, lng: 113.62, congestion: "MODERATE", weather: "HIGH", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "sea_26", num: 26, name: "Port of Busan", type: "SEA", location: "South Korea", region: "East Asia", lat: 35.10, lng: 129.04, congestion: "LOW", weather: "HIGH", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "sea_27", num: 27, name: "Port of Qingdao", type: "SEA", location: "China", region: "East Asia", lat: 36.06, lng: 120.32, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "sea_28", num: 28, name: "Port of Hong Kong (Kwai Tsing)", type: "SEA", location: "Hong Kong", region: "East Asia", lat: 22.34, lng: 114.12, congestion: "MODERATE", weather: "MODERATE", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "sea_29", num: 29, name: "Port of Tianjin", type: "SEA", location: "China", region: "East Asia", lat: 38.98, lng: 117.75, congestion: "MODERATE", weather: "MODERATE", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "sea_30", num: 30, name: "Port of Kaohsiung", type: "SEA", location: "Taiwan", region: "East Asia", lat: 22.61, lng: 120.28, congestion: "MODERATE", weather: "HIGH", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "sea_31", num: 31, name: "Port of Tanjung Pelepas (PTP)", type: "SEA", location: "Malaysia", region: "Southeast Asia", lat: 1.36, lng: 103.55, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "HIGH", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "sea_32", num: 32, name: "Port Klang", type: "SEA", location: "Malaysia", region: "Southeast Asia", lat: 3.00, lng: 101.40, congestion: "HIGH", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 14, expected_loss_usd: 3173 },
    { id: "sea_33", num: 33, name: "Port of Rotterdam", type: "SEA", location: "Netherlands", region: "North Europe", lat: 51.95, lng: 4.13, congestion: "HIGH", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 23, expected_loss_usd: 2783 },
    { id: "sea_34", num: 34, name: "Port of Antwerp-Bruges", type: "SEA", location: "Belgium", region: "North Europe", lat: 51.28, lng: 4.34, congestion: "HIGH", weather: "LOW", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 14, expected_loss_usd: 1328 },
    { id: "sea_35", num: 35, name: "Port of Hamburg", type: "SEA", location: "Germany", region: "North Europe", lat: 53.53, lng: 9.97, congestion: "MODERATE", weather: "LOW", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 7, expected_loss_usd: 843 },
    { id: "sea_36", num: 36, name: "Port of Valencia", type: "SEA", location: "Spain", region: "Mediterranean / Europe", lat: 39.45, lng: -0.32, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "HIGH", expected_delay_hours: 17, expected_loss_usd: 2962 },
    { id: "sea_37", num: 37, name: "Port of Piraeus", type: "SEA", location: "Greece", region: "Mediterranean / Europe", lat: 37.94, lng: 23.63, congestion: "HIGH", weather: "MODERATE", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 15, expected_loss_usd: 2614 },
    { id: "sea_38", num: 38, name: "Port of Jebel Ali (Dubai)", type: "SEA", location: "UAE", region: "Middle East", lat: 25.01, lng: 55.06, congestion: "HIGH", weather: "MODERATE", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 31, expected_loss_usd: 7843 },
    { id: "sea_39", num: 39, name: "Port of Salalah", type: "SEA", location: "Oman", region: "Middle East / Indian Ocean", lat: 16.94, lng: 54.00, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "HIGH", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "sea_40", num: 40, name: "Port of Colombo", type: "SEA", location: "Sri Lanka", region: "South Asia / Indian Ocean", lat: 6.95, lng: 79.85, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 18, expected_loss_usd: 2182 },
    { id: "sea_41", num: 41, name: "Jawaharlal Nehru Port (JNPT / Nhava Sheva)", type: "SEA", location: "India", region: "South Asia", lat: 18.95, lng: 72.95, congestion: "LOW", weather: "HIGH", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "sea_42", num: 42, name: "Mundra Port", type: "SEA", location: "India", region: "South Asia", lat: 22.74, lng: 69.70, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "sea_43", num: 43, name: "Port of Los Angeles", type: "SEA", location: "USA", region: "North America", lat: 33.74, lng: -118.27, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 27, expected_loss_usd: 3268 },
    { id: "sea_44", num: 44, name: "Port of Long Beach", type: "SEA", location: "USA", region: "North America", lat: 33.76, lng: -118.20, congestion: "HIGH", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 26, expected_loss_usd: 6578 },
    { id: "sea_45", num: 45, name: "Port of New York & New Jersey", type: "SEA", location: "USA", region: "North America", lat: 40.67, lng: -74.12, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "sea_46", num: 46, name: "Port of Houston", type: "SEA", location: "USA", region: "North America", lat: 29.73, lng: -95.27, congestion: "HIGH", weather: "LOW", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 16, expected_loss_usd: 3626 },
    { id: "sea_47", num: 47, name: "Port of Santos", type: "SEA", location: "Brazil", region: "South America", lat: -23.96, lng: -46.30, congestion: "HIGH", weather: "LOW", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 24, expected_loss_usd: 4807 },
    { id: "sea_48", num: 48, name: "Port of Colon / Balboa", type: "SEA", location: "Panama", region: "Central America", lat: 9.36, lng: -79.90, congestion: "LOW", weather: "MODERATE", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "sea_49", num: 49, name: "Port of Manzanillo", type: "SEA", location: "Mexico", region: "North America", lat: 19.05, lng: -104.32, congestion: "MODERATE", weather: "LOW", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 13, expected_loss_usd: 2604 },
    { id: "sea_50", num: 50, name: "Port of Durban", type: "SEA", location: "South Africa", region: "Southern Africa", lat: -29.87, lng: 31.02, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 17, expected_loss_usd: 2509 },

    // AIR CARGO (50)
    { id: "air_01", num: 1, name: "Hong Kong International", iata: "HKG", type: "AIR", location: "Hong Kong (HKG)", region: "East Asia", lat: 22.31, lng: 113.91, congestion: "HIGH", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 19, expected_loss_usd: 2804 },
    { id: "air_02", num: 2, name: "Memphis International", iata: "MEM", type: "AIR", location: "USA (MEM)", region: "North America", lat: 35.04, lng: -89.98, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "air_03", num: 3, name: "Shanghai Pudong International", iata: "PVG", type: "AIR", location: "China (PVG)", region: "East Asia", lat: 31.14, lng: 121.81, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 24, expected_loss_usd: 6072 },
    { id: "air_04", num: 4, name: "Ted Stevens Anchorage International", iata: "ANC", type: "AIR", location: "USA (ANC)", region: "North America", lat: 61.17, lng: -149.99, congestion: "LOW", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "air_05", num: 5, name: "Incheon International", iata: "ICN", type: "AIR", location: "South Korea (ICN)", region: "East Asia", lat: 37.46, lng: 126.44, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 9, expected_loss_usd: 1086 },
    { id: "air_06", num: 6, name: "Louisville Muhammad Ali", iata: "SDF", type: "AIR", location: "USA (SDF)", region: "North America", lat: 38.17, lng: -85.74, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "air_07", num: 7, name: "Miami International", iata: "MIA", type: "AIR", location: "USA (MIA)", region: "North America", lat: 25.80, lng: -80.29, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "air_08", num: 8, name: "Taiwan Taoyuan International", iata: "TPE", type: "AIR", location: "Taiwan (TPE)", region: "East Asia", lat: 25.08, lng: 121.23, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 4, expected_loss_usd: 590 },
    { id: "air_09", num: 9, name: "Los Angeles International", iata: "LAX", type: "AIR", location: "USA (LAX)", region: "North America", lat: 33.94, lng: -118.41, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 11, expected_loss_usd: 2488 },
    { id: "air_10", num: 10, name: "Tokyo Narita International", iata: "NRT", type: "AIR", location: "Japan (NRT)", region: "East Asia", lat: 35.76, lng: 140.39, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "air_11", num: 11, name: "Frankfurt Airport", iata: "FRA", type: "AIR", location: "Germany (FRA)", region: "Europe", lat: 50.03, lng: 8.57, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 11, expected_loss_usd: 1044 },
    { id: "air_12", num: 12, name: "Doha Hamad International", iata: "DOH", type: "AIR", location: "Qatar (DOH)", region: "Middle East", lat: 25.26, lng: 51.57, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 31, expected_loss_usd: 3753 },
    { id: "air_13", num: 13, name: "Dubai International / Al Maktoum", iata: "DXB", type: "AIR", location: "UAE (DXB / DWC)", region: "Middle East", lat: 25.25, lng: 55.36, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 14, expected_loss_usd: 2066 },
    { id: "air_14", num: 14, name: "Chicago O'Hare International", iata: "ORD", type: "AIR", location: "USA (ORD)", region: "North America", lat: 41.97, lng: -87.90, congestion: "LOW", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "air_15", num: 15, name: "Amsterdam Airport Schiphol", iata: "AMS", type: "AIR", location: "Netherlands (AMS)", region: "Europe", lat: 52.31, lng: 4.76, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "air_16", num: 16, name: "Guangzhou Baiyun International", iata: "CAN", type: "AIR", location: "China (CAN)", region: "East Asia", lat: 23.39, lng: 113.30, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "air_17", num: 17, name: "Shenzhen Bao'an International", iata: "SZX", type: "AIR", location: "China (SZX)", region: "East Asia", lat: 22.64, lng: 113.81, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "air_18", num: 18, name: "Cincinnati/Northern Kentucky", iata: "CVG", type: "AIR", location: "USA (CVG)", region: "North America", lat: 39.05, lng: -84.67, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "air_19", num: 19, name: "Leipzig/Halle Airport", iata: "LEJ", type: "AIR", location: "Germany (LEJ)", region: "Europe", lat: 51.42, lng: 12.24, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "air_20", num: 20, name: "Paris Charles de Gaulle", iata: "CDG", type: "AIR", location: "France (CDG)", region: "Europe", lat: 49.01, lng: 2.55, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "air_21", num: 21, name: "Singapore Changi Airport", iata: "SIN", type: "AIR", location: "Singapore (SIN)", region: "Southeast Asia", lat: 1.36, lng: 103.99, congestion: "HIGH", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 12, expected_loss_usd: 2720 },
    { id: "air_22", num: 22, name: "Beijing Capital / Daxing", iata: "PEK", type: "AIR", location: "China (PEK / PKX)", region: "East Asia", lat: 40.08, lng: 116.58, congestion: "LOW", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "air_23", num: 23, name: "London Heathrow", iata: "LHR", type: "AIR", location: "UK (LHR)", region: "Europe", lat: 51.47, lng: -0.45, congestion: "HIGH", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 10, expected_loss_usd: 1212 },
    { id: "air_24", num: 24, name: "Luxembourg Findel Airport", iata: "LUX", type: "AIR", location: "Luxembourg (LUX)", region: "Europe", lat: 49.63, lng: 6.22, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "air_25", num: 25, name: "Liege Airport", iata: "LGG", type: "AIR", location: "Belgium (LGG)", region: "Europe", lat: 50.64, lng: 5.44, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "air_26", num: 26, name: "Tokyo Haneda Airport", iata: "HND", type: "AIR", location: "Japan (HND)", region: "East Asia", lat: 35.55, lng: 139.78, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "HIGH", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "air_27", num: 27, name: "Kansai International", iata: "KIX", type: "AIR", location: "Japan (KIX)", region: "East Asia", lat: 34.43, lng: 135.23, congestion: "LOW", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "air_28", num: 28, name: "Abu Dhabi International", iata: "AUH", type: "AIR", location: "UAE (AUH)", region: "Middle East", lat: 24.43, lng: 54.65, congestion: "HIGH", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 30, expected_loss_usd: 6800 },
    { id: "air_29", num: 29, name: "Istanbul Airport", iata: "IST", type: "AIR", location: "Turkey (IST)", region: "Europe / Middle East", lat: 41.28, lng: 28.75, congestion: "HIGH", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 26, expected_loss_usd: 4522 },
    { id: "air_30", num: 30, name: "John F. Kennedy International", iata: "JFK", type: "AIR", location: "USA (JFK)", region: "North America", lat: 40.64, lng: -73.78, congestion: "LOW", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "air_31", num: 31, name: "Atlanta Hartsfield-Jackson", iata: "ATL", type: "AIR", location: "USA (ATL)", region: "North America", lat: 33.64, lng: -84.43, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 4, expected_loss_usd: 590 },
    { id: "air_32", num: 32, name: "Dallas/Fort Worth International", iata: "DFW", type: "AIR", location: "USA (DFW)", region: "North America", lat: 32.90, lng: -97.04, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "air_33", num: 33, name: "Indianapolis International", iata: "IND", type: "AIR", location: "USA (IND)", region: "North America", lat: 39.72, lng: -86.29, congestion: "LOW", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "air_34", num: 34, name: "Ontario International", iata: "ONT", type: "AIR", location: "USA (ONT)", region: "North America", lat: 34.06, lng: -117.60, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "air_35", num: 35, name: "Milan Malpensa Airport", iata: "MXP", type: "AIR", location: "Italy (MXP)", region: "Europe", lat: 45.63, lng: 8.72, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "air_36", num: 36, name: "Madrid-Barajas Airport", iata: "MAD", type: "AIR", location: "Spain (MAD)", region: "Europe", lat: 40.48, lng: -3.57, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "HIGH", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "air_37", num: 37, name: "Brussels Airport", iata: "BRU", type: "AIR", location: "Belgium (BRU)", region: "Europe", lat: 50.90, lng: 4.48, congestion: "LOW", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "air_38", num: 38, name: "Bangkok Suvarnabhumi", iata: "BKK", type: "AIR", location: "Thailand (BKK)", region: "Southeast Asia", lat: 13.69, lng: 100.75, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "air_39", num: 39, name: "Kuala Lumpur International", iata: "KUL", type: "AIR", location: "Malaysia (KUL)", region: "Southeast Asia", lat: 2.75, lng: 101.71, congestion: "HIGH", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 10, expected_loss_usd: 2530 },
    { id: "air_40", num: 40, name: "Hanoi Noi Bai International", iata: "HAN", type: "AIR", location: "Vietnam (HAN)", region: "Southeast Asia", lat: 21.22, lng: 105.81, congestion: "LOW", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "air_41", num: 41, name: "Ho Chi Minh City Tan Son Nhat", iata: "SGN", type: "AIR", location: "Vietnam (SGN)", region: "Southeast Asia", lat: 10.82, lng: 106.65, congestion: "LOW", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "air_42", num: 42, name: "Indira Gandhi International (Delhi)", iata: "DEL", type: "AIR", location: "India (DEL)", region: "South Asia", lat: 28.56, lng: 77.10, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 15, expected_loss_usd: 2614 },
    { id: "air_43", num: 43, name: "Chhatrapati Shivaji Maharaj (Mumbai)", iata: "BOM", type: "AIR", location: "India (BOM)", region: "South Asia", lat: 19.09, lng: 72.87, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 13, expected_loss_usd: 1919 },
    { id: "air_44", num: 44, name: "Kempegowda International (Bengaluru)", iata: "BLR", type: "AIR", location: "India (BLR)", region: "South Asia", lat: 13.20, lng: 77.71, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "air_45", num: 45, name: "São Paulo/Guarulhos International", iata: "GRU", type: "AIR", location: "Brazil (GRU)", region: "South America", lat: -23.43, lng: -46.47, congestion: "LOW", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "air_46", num: 46, name: "Bogotá El Dorado International", iata: "BOG", type: "AIR", location: "Colombia (BOG)", region: "South America", lat: 4.70, lng: -74.15, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "air_47", num: 47, name: "Santiago Arturo Merino Benítez", iata: "SCL", type: "AIR", location: "Chile (SCL)", region: "South America", lat: -33.39, lng: -70.79, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "air_48", num: 48, name: "Johannesburg O.R. Tambo", iata: "JNB", type: "AIR", location: "South Africa (JNB)", region: "Southern Africa", lat: -26.13, lng: 28.24, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "air_49", num: 49, name: "Nairobi Jomo Kenyatta", iata: "NBO", type: "AIR", location: "Kenya (NBO)", region: "East Africa", lat: -1.32, lng: 36.93, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "air_50", num: 50, name: "Cairo International Airport", iata: "CAI", type: "AIR", location: "Egypt (CAI)", region: "Middle East / North Africa", lat: 30.12, lng: 31.41, congestion: "HIGH", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 26, expected_loss_usd: 5208 },

    // RAIL FREIGHT (50)
    { id: "rail_01", num: 1, name: "Malaszewicze / Brest Gateway", type: "RAIL", location: "Poland / Belarus", region: "Eastern Europe", lat: 52.01, lng: 23.53, congestion: "HIGH", weather: "MODERATE", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 22, expected_loss_usd: 4407 },
    { id: "rail_02", num: 2, name: "Khorgos / Altynkol Gateway", type: "RAIL", location: "China / Kazakhstan", region: "Central Asia", lat: 44.13, lng: 80.40, congestion: "HIGH", weather: "HIGH", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 27, expected_loss_usd: 6114 },
    { id: "rail_03", num: 3, name: "Dostyk / Alashankou Gateway", type: "RAIL", location: "China / Kazakhstan", region: "Central Asia", lat: 45.25, lng: 82.48, congestion: "HIGH", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 20, expected_loss_usd: 4006 },
    { id: "rail_04", num: 4, name: "Manzhouli / Zabaikalsk Gateway", type: "RAIL", location: "China / Russia", region: "East Asia / Russia", lat: 49.59, lng: 117.43, congestion: "LOW", weather: "HIGH", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_05", num: 5, name: "Erenhot / Zamyn-Uud Gateway", type: "RAIL", location: "China / Mongolia", region: "East Asia", lat: 43.65, lng: 111.98, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "rail_06", num: 6, name: "Duisburg Intermodal Terminal (Duisport)", type: "RAIL", location: "Germany", region: "Western Europe", lat: 51.44, lng: 6.74, congestion: "MODERATE", weather: "HIGH", network_risk: "MODERATE", currency_risk: "HIGH", expected_delay_hours: 9, expected_loss_usd: 1803 },
    { id: "rail_07", num: 7, name: "Hamburg Billwerder Terminal", type: "RAIL", location: "Germany", region: "Western Europe", lat: 53.51, lng: 10.12, congestion: "HIGH", weather: "MODERATE", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 14, expected_loss_usd: 3173 },
    { id: "rail_08", num: 8, name: "Chengdu International Railway Port", type: "RAIL", location: "China", region: "East Asia", lat: 30.79, lng: 104.25, congestion: "MODERATE", weather: "LOW", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 7, expected_loss_usd: 664 },
    { id: "rail_09", num: 9, name: "Chongqing Tuanjiecun Rail Hub", type: "RAIL", location: "China", region: "East Asia", lat: 29.62, lng: 106.35, congestion: "MODERATE", weather: "LOW", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "rail_10", num: 10, name: "Xi'an International Trade & Logistics Park", type: "RAIL", location: "China", region: "East Asia", lat: 34.37, lng: 109.05, congestion: "MODERATE", weather: "MODERATE", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 11, expected_loss_usd: 1623 },
    { id: "rail_11", num: 11, name: "Lodz Freight Terminal", type: "RAIL", location: "Poland", region: "Eastern Europe", lat: 51.76, lng: 19.46, congestion: "LOW", weather: "MODERATE", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 4, expected_loss_usd: 590 },
    { id: "rail_12", num: 12, name: "Baku / Port of Alat Rail Interchange", type: "RAIL", location: "Azerbaijan", region: "Caucasus / Middle Corridor", lat: 39.99, lng: 49.41, congestion: "HIGH", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 20, expected_loss_usd: 3479 },
    { id: "rail_13", num: 13, name: "Poti / Batumi Rail Terminals", type: "RAIL", location: "Georgia", region: "Caucasus / Black Sea", lat: 42.15, lng: 41.67, congestion: "LOW", weather: "LOW", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "rail_14", num: 14, name: "Kars Rail Hub", type: "RAIL", location: "Turkey", region: "Middle East / Europe", lat: 40.60, lng: 43.10, congestion: "MODERATE", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "rail_15", num: 15, name: "Gotthard Base Tunnel Corridor", type: "RAIL", location: "Switzerland", region: "Western Europe", lat: 46.52, lng: 8.79, congestion: "LOW", weather: "MODERATE", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 4, expected_loss_usd: 590 },
    { id: "rail_16", num: 16, name: "Brenner Pass Rail Corridor", type: "RAIL", location: "Austria / Italy", region: "Western Europe", lat: 47.01, lng: 11.51, congestion: "LOW", weather: "MODERATE", network_risk: "LOW", currency_risk: "HIGH", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_17", num: 17, name: "Lötschberg Base Tunnel Corridor", type: "RAIL", location: "Switzerland", region: "Western Europe", lat: 46.38, lng: 7.75, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "HIGH", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "rail_18", num: 18, name: "Channel Tunnel (Eurotunnel Freight)", type: "RAIL", location: "UK / France", region: "Western Europe", lat: 51.02, lng: 1.45, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 15, expected_loss_usd: 2614 },
    { id: "rail_19", num: 19, name: "Betuweroute", type: "RAIL", location: "Netherlands / Germany", region: "Western Europe", lat: 51.87, lng: 5.25, congestion: "HIGH", weather: "LOW", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 16, expected_loss_usd: 3626 },
    { id: "rail_20", num: 20, name: "Port of Koper / Divača Rail Line", type: "RAIL", location: "Slovenia", region: "Southern / Central Europe", lat: 45.68, lng: 13.97, congestion: "LOW", weather: "HIGH", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_21", num: 21, name: "Verona Quadrante Europa", type: "RAIL", location: "Italy", region: "Southern Europe", lat: 45.41, lng: 10.92, congestion: "LOW", weather: "LOW", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "rail_22", num: 22, name: "Vienna South Freight Terminal (Wien Süd)", type: "RAIL", location: "Austria", region: "Central Europe", lat: 48.14, lng: 16.36, congestion: "LOW", weather: "HIGH", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "rail_23", num: 23, name: "Metrans Hub Terminal Ceska Trebova", type: "RAIL", location: "Czech Republic", region: "Central Europe", lat: 49.90, lng: 16.44, congestion: "MODERATE", weather: "LOW", network_risk: "MODERATE", currency_risk: "HIGH", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "rail_24", num: 24, name: "Frankfurt (Oder) Rail Terminal", type: "RAIL", location: "Germany / Poland", region: "Central Europe", lat: 52.34, lng: 14.53, congestion: "LOW", weather: "HIGH", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_25", num: 25, name: "Boten / Mohan Gateway", type: "RAIL", location: "Laos / China", region: "Southeast Asia", lat: 21.18, lng: 101.69, congestion: "LOW", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "rail_26", num: 26, name: "Thanaleng Dry Port (Vientiane)", type: "RAIL", location: "Laos / Thailand", region: "Southeast Asia", lat: 17.91, lng: 102.72, congestion: "MODERATE", weather: "HIGH", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_27", num: 27, name: "Padang Besar Railway Station", type: "RAIL", location: "Malaysia / Thailand", region: "Southeast Asia", lat: 6.66, lng: 100.32, congestion: "MODERATE", weather: "LOW", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_28", num: 28, name: "Chicago Rail Terminal Complex", type: "RAIL", location: "USA (Illinois)", region: "North America", lat: 41.87, lng: -87.63, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 15, expected_loss_usd: 2614 },
    { id: "rail_29", num: 29, name: "Laredo / Nuevo Laredo Rail Crossing", type: "RAIL", location: "USA / Mexico", region: "North America", lat: 27.50, lng: -99.50, congestion: "HIGH", weather: "HIGH", network_risk: "LOW", currency_risk: "MODERATE", expected_delay_hours: 31, expected_loss_usd: 4575 },
    { id: "rail_30", num: 30, name: "Eagle Pass Rail Gateway", type: "RAIL", location: "USA / Mexico", region: "North America", lat: 28.71, lng: -100.50, congestion: "LOW", weather: "HIGH", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "rail_31", num: 31, name: "Kansas City SmartPort", type: "RAIL", location: "USA (Missouri)", region: "North America", lat: 39.10, lng: -94.58, congestion: "LOW", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "rail_32", num: 32, name: "Alliance Texas Intermodal Facility", type: "RAIL", location: "USA (Texas)", region: "North America", lat: 32.98, lng: -97.32, congestion: "HIGH", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 10, expected_loss_usd: 1212 },
    { id: "rail_33", num: 33, name: "BNSF Hobart Yard (Los Angeles)", type: "RAIL", location: "USA (California)", region: "North America", lat: 34.00, lng: -118.19, congestion: "HIGH", weather: "LOW", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 25, expected_loss_usd: 5672 },
    { id: "rail_34", num: 34, name: "Memphis Intermodal Terminals", type: "RAIL", location: "USA (Tennessee)", region: "North America", lat: 35.14, lng: -90.05, congestion: "MODERATE", weather: "HIGH", network_risk: "MODERATE", currency_risk: "HIGH", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "rail_35", num: 35, name: "Detroit / Windsor Rail Tunnel", type: "RAIL", location: "USA / Canada", region: "North America", lat: 42.33, lng: -83.04, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "rail_36", num: 36, name: "International Falls / Fort Frances", type: "RAIL", location: "USA / Canada", region: "North America", lat: 48.60, lng: -93.40, congestion: "LOW", weather: "LOW", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_37", num: 37, name: "Dadri ICD (Western & Eastern DFC Junction)", type: "RAIL", location: "India", region: "South Asia", lat: 28.55, lng: 77.55, congestion: "HIGH", weather: "MODERATE", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 8, expected_loss_usd: 1602 },
    { id: "rail_38", num: 38, name: "Rewari–Madar DFC Corridor", type: "RAIL", location: "India", region: "South Asia", lat: 27.50, lng: 75.80, congestion: "LOW", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 3, expected_loss_usd: 358 },
    { id: "rail_39", num: 39, name: "Sanand Multimodal Logistics Park", type: "RAIL", location: "India (Gujarat)", region: "South Asia", lat: 22.98, lng: 72.38, congestion: "LOW", weather: "LOW", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "rail_40", num: 40, name: "Khatuwas Intermodal Logistics Park", type: "RAIL", location: "India (Rajasthan)", region: "South Asia", lat: 28.12, lng: 76.22, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190 },
    { id: "rail_41", num: 41, name: "Dankuni Freight Terminal", type: "RAIL", location: "India (West Bengal)", region: "South Asia", lat: 22.68, lng: 88.29, congestion: "MODERATE", weather: "HIGH", network_risk: "LOW", currency_risk: "LOW", expected_delay_hours: 15, expected_loss_usd: 3405 },
    { id: "rail_42", num: 42, name: "New Deen Dayal Upadhyaya (Mughalsarai) Yard", type: "RAIL", location: "India (Uttar Pradesh)", region: "South Asia", lat: 25.28, lng: 83.12, congestion: "MODERATE", weather: "HIGH", network_risk: "LOW", currency_risk: "HIGH", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "rail_43", num: 43, name: "Trans-Siberian Railway Trunk", type: "RAIL", location: "Russia", region: "Eurasia / Russia", lat: 55.00, lng: 82.93, congestion: "LOW", weather: "HIGH", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "rail_44", num: 44, name: "Baikal-Amur Mainline (BAM)", type: "RAIL", location: "Russia", region: "Eurasia / Russia", lat: 56.50, lng: 119.50, congestion: "MODERATE", weather: "HIGH", network_risk: "LOW", currency_risk: "HIGH", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "rail_45", num: 45, name: "Pilbara Heavy Haul Rail Network", type: "RAIL", location: "Australia (Western Australia)", region: "Oceania", lat: -21.50, lng: 118.50, congestion: "LOW", weather: "MODERATE", network_risk: "HIGH", currency_risk: "LOW", expected_delay_hours: 7, expected_loss_usd: 1581 },
    { id: "rail_46", num: 46, name: "Parkes National Logistics Hub", type: "RAIL", location: "Australia (New South Wales)", region: "Oceania", lat: -33.14, lng: 148.18, congestion: "MODERATE", weather: "HIGH", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 8, expected_loss_usd: 2024 },
    { id: "rail_47", num: 47, name: "Mombasa–Nairobi Standard Gauge Railway (SGR)", type: "RAIL", location: "Kenya", region: "East Africa", lat: -3.50, lng: 39.00, congestion: "MODERATE", weather: "HIGH", network_risk: "MODERATE", currency_risk: "LOW", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_48", num: 48, name: "Sishen–Saldanha Iron Ore Line", type: "RAIL", location: "South Africa", region: "Southern Africa", lat: -31.00, lng: 20.00, congestion: "LOW", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 5, expected_loss_usd: 875 },
    { id: "rail_49", num: 49, name: "Carajás Railway (EFC)", type: "RAIL", location: "Brazil", region: "South America", lat: -4.00, lng: -48.00, congestion: "LOW", weather: "LOW", network_risk: "HIGH", currency_risk: "MODERATE", expected_delay_hours: 6, expected_loss_usd: 1202 },
    { id: "rail_50", num: 50, name: "TAZARA Railway (Tanzania–Zambia)", type: "RAIL", location: "Tanzania / Zambia", region: "East / Central Africa", lat: -9.00, lng: 33.00, congestion: "MODERATE", weather: "MODERATE", network_risk: "MODERATE", currency_risk: "MODERATE", expected_delay_hours: 2, expected_loss_usd: 190 }
  ];

  // Map index

  // --- 1.1 GLOBAL MULTI-MODAL 488 EDGES NETWORK ---
  const ALL_EDGES = [
    {
      "u": "sea_21",
      "v": "sea_23",
      "mode": "SEA",
      "name": "East China Coastal Corridor",
      "distance_km": 85.0,
      "transit_days": 0.2,
      "freight_cost_usd": 605.1,
      "base_risk": 0.04
    },
    {
      "u": "sea_23",
      "v": "sea_21",
      "mode": "SEA",
      "name": "East China Coastal Corridor",
      "distance_km": 85.0,
      "transit_days": 0.2,
      "freight_cost_usd": 605.1,
      "base_risk": 0.04
    },
    {
      "u": "sea_23",
      "v": "sea_27",
      "mode": "SEA",
      "name": "Yellow Sea Shipping Lane",
      "distance_km": 700.5,
      "transit_days": 0.8,
      "freight_cost_usd": 642.03,
      "base_risk": 0.04
    },
    {
      "u": "sea_27",
      "v": "sea_23",
      "mode": "SEA",
      "name": "Yellow Sea Shipping Lane",
      "distance_km": 700.5,
      "transit_days": 0.8,
      "freight_cost_usd": 642.03,
      "base_risk": 0.04
    },
    {
      "u": "sea_27",
      "v": "sea_29",
      "mode": "SEA",
      "name": "Bohai Gulf Maritime Lane",
      "distance_km": 395.9,
      "transit_days": 0.5,
      "freight_cost_usd": 623.75,
      "base_risk": 0.04
    },
    {
      "u": "sea_29",
      "v": "sea_27",
      "mode": "SEA",
      "name": "Bohai Gulf Maritime Lane",
      "distance_km": 395.9,
      "transit_days": 0.5,
      "freight_cost_usd": 623.75,
      "base_risk": 0.04
    },
    {
      "u": "sea_27",
      "v": "sea_26",
      "mode": "SEA",
      "name": "Korea Strait Crossing",
      "distance_km": 795.5,
      "transit_days": 0.9,
      "freight_cost_usd": 647.73,
      "base_risk": 0.04
    },
    {
      "u": "sea_26",
      "v": "sea_27",
      "mode": "SEA",
      "name": "Korea Strait Crossing",
      "distance_km": 795.5,
      "transit_days": 0.9,
      "freight_cost_usd": 647.73,
      "base_risk": 0.04
    },
    {
      "u": "sea_21",
      "v": "sea_26",
      "mode": "SEA",
      "name": "East China Sea - Busan Trunk",
      "distance_km": 819.4,
      "transit_days": 1.0,
      "freight_cost_usd": 649.16,
      "base_risk": 0.04
    },
    {
      "u": "sea_26",
      "v": "sea_21",
      "mode": "SEA",
      "name": "East China Sea - Busan Trunk",
      "distance_km": 819.4,
      "transit_days": 1.0,
      "freight_cost_usd": 649.16,
      "base_risk": 0.04
    },
    {
      "u": "sea_21",
      "v": "sea_30",
      "mode": "SEA",
      "name": "Taiwan Strait Maritime Route",
      "distance_km": 909.1,
      "transit_days": 1.1,
      "freight_cost_usd": 663.64,
      "base_risk": 0.05
    },
    {
      "u": "sea_30",
      "v": "sea_21",
      "mode": "SEA",
      "name": "Taiwan Strait Maritime Route",
      "distance_km": 909.1,
      "transit_days": 1.1,
      "freight_cost_usd": 663.64,
      "base_risk": 0.05
    },
    {
      "u": "sea_30",
      "v": "sea_28",
      "mode": "SEA",
      "name": "South China Sea Fast Route",
      "distance_km": 633.6,
      "transit_days": 0.8,
      "freight_cost_usd": 638.02,
      "base_risk": 0.04
    },
    {
      "u": "sea_28",
      "v": "sea_30",
      "mode": "SEA",
      "name": "South China Sea Fast Route",
      "distance_km": 633.6,
      "transit_days": 0.8,
      "freight_cost_usd": 638.02,
      "base_risk": 0.04
    },
    {
      "u": "sea_28",
      "v": "sea_24",
      "mode": "SEA",
      "name": "Greater Bay Feeder Lane",
      "distance_km": 31.3,
      "transit_days": 0.2,
      "freight_cost_usd": 601.57,
      "base_risk": 0.02
    },
    {
      "u": "sea_24",
      "v": "sea_28",
      "mode": "SEA",
      "name": "Greater Bay Feeder Lane",
      "distance_km": 31.3,
      "transit_days": 0.2,
      "freight_cost_usd": 601.57,
      "base_risk": 0.02
    },
    {
      "u": "sea_24",
      "v": "sea_25",
      "mode": "SEA",
      "name": "Pearl River Estuary Feeder",
      "distance_km": 70.3,
      "transit_days": 0.2,
      "freight_cost_usd": 603.51,
      "base_risk": 0.02
    },
    {
      "u": "sea_25",
      "v": "sea_24",
      "mode": "SEA",
      "name": "Pearl River Estuary Feeder",
      "distance_km": 70.3,
      "transit_days": 0.2,
      "freight_cost_usd": 603.51,
      "base_risk": 0.02
    },
    {
      "u": "sea_28",
      "v": "sea_01",
      "mode": "SEA",
      "name": "South China Sea - Malacca Arterial",
      "distance_km": 2623.0,
      "transit_days": 2.9,
      "freight_cost_usd": 783.61,
      "base_risk": 0.07
    },
    {
      "u": "sea_01",
      "v": "sea_28",
      "mode": "SEA",
      "name": "South China Sea - Malacca Arterial",
      "distance_km": 2623.0,
      "transit_days": 2.9,
      "freight_cost_usd": 783.61,
      "base_risk": 0.07
    },
    {
      "u": "sea_24",
      "v": "sea_01",
      "mode": "SEA",
      "name": "Shenzhen - Malacca Trunk",
      "distance_km": 2654.3,
      "transit_days": 2.9,
      "freight_cost_usd": 785.8,
      "base_risk": 0.07
    },
    {
      "u": "sea_01",
      "v": "sea_24",
      "mode": "SEA",
      "name": "Shenzhen - Malacca Trunk",
      "distance_km": 2654.3,
      "transit_days": 2.9,
      "freight_cost_usd": 785.8,
      "base_risk": 0.07
    },
    {
      "u": "sea_25",
      "v": "sea_01",
      "mode": "SEA",
      "name": "Guangzhou - Malacca Direct",
      "distance_km": 2638.8,
      "transit_days": 2.9,
      "freight_cost_usd": 784.72,
      "base_risk": 0.07
    },
    {
      "u": "sea_01",
      "v": "sea_25",
      "mode": "SEA",
      "name": "Guangzhou - Malacca Direct",
      "distance_km": 2638.8,
      "transit_days": 2.9,
      "freight_cost_usd": 784.72,
      "base_risk": 0.07
    },
    {
      "u": "sea_01",
      "v": "sea_22",
      "mode": "SEA",
      "name": "Singapore Strait Transit",
      "distance_km": 105.1,
      "transit_days": 0.2,
      "freight_cost_usd": 605.25,
      "base_risk": 0.08
    },
    {
      "u": "sea_22",
      "v": "sea_01",
      "mode": "SEA",
      "name": "Singapore Strait Transit",
      "distance_km": 105.1,
      "transit_days": 0.2,
      "freight_cost_usd": 605.25,
      "base_risk": 0.08
    },
    {
      "u": "sea_22",
      "v": "sea_31",
      "mode": "SEA",
      "name": "Johor Strait Connector",
      "distance_km": 32.0,
      "transit_days": 0.2,
      "freight_cost_usd": 601.6,
      "base_risk": 0.03
    },
    {
      "u": "sea_31",
      "v": "sea_22",
      "mode": "SEA",
      "name": "Johor Strait Connector",
      "distance_km": 32.0,
      "transit_days": 0.2,
      "freight_cost_usd": 601.6,
      "base_risk": 0.03
    },
    {
      "u": "sea_31",
      "v": "sea_32",
      "mode": "SEA",
      "name": "Malacca Strait Westbound Trunk",
      "distance_km": 300.5,
      "transit_days": 0.4,
      "freight_cost_usd": 618.03,
      "base_risk": 0.05
    },
    {
      "u": "sea_32",
      "v": "sea_31",
      "mode": "SEA",
      "name": "Malacca Strait Westbound Trunk",
      "distance_km": 300.5,
      "transit_days": 0.4,
      "freight_cost_usd": 618.03,
      "base_risk": 0.05
    },
    {
      "u": "sea_01",
      "v": "sea_11",
      "mode": "SEA",
      "name": "Sunda Strait Bypass Lane",
      "distance_km": 883.8,
      "transit_days": 1.0,
      "freight_cost_usd": 661.87,
      "base_risk": 0.05
    },
    {
      "u": "sea_11",
      "v": "sea_01",
      "mode": "SEA",
      "name": "Sunda Strait Bypass Lane",
      "distance_km": 883.8,
      "transit_days": 1.0,
      "freight_cost_usd": 661.87,
      "base_risk": 0.05
    },
    {
      "u": "sea_22",
      "v": "sea_12",
      "mode": "SEA",
      "name": "Lombok Strait Deep-Sea Bypass",
      "distance_km": 1710.8,
      "transit_days": 1.9,
      "freight_cost_usd": 736.86,
      "base_risk": 0.05
    },
    {
      "u": "sea_12",
      "v": "sea_22",
      "mode": "SEA",
      "name": "Lombok Strait Deep-Sea Bypass",
      "distance_km": 1710.8,
      "transit_days": 1.9,
      "freight_cost_usd": 736.86,
      "base_risk": 0.05
    },
    {
      "u": "sea_12",
      "v": "sea_13",
      "mode": "SEA",
      "name": "Makassar Strait Inter-Island Lane",
      "distance_km": 917.8,
      "transit_days": 1.1,
      "freight_cost_usd": 664.25,
      "base_risk": 0.04
    },
    {
      "u": "sea_13",
      "v": "sea_12",
      "mode": "SEA",
      "name": "Makassar Strait Inter-Island Lane",
      "distance_km": 917.8,
      "transit_days": 1.1,
      "freight_cost_usd": 664.25,
      "base_risk": 0.04
    },
    {
      "u": "sea_13",
      "v": "sea_18",
      "mode": "SEA",
      "name": "Arafura - Torres Strait Passage",
      "distance_km": 2809.4,
      "transit_days": 3.3,
      "freight_cost_usd": 824.75,
      "base_risk": 0.06
    },
    {
      "u": "sea_18",
      "v": "sea_13",
      "mode": "SEA",
      "name": "Arafura - Torres Strait Passage",
      "distance_km": 2809.4,
      "transit_days": 3.3,
      "freight_cost_usd": 824.75,
      "base_risk": 0.06
    },
    {
      "u": "sea_18",
      "v": "sea_19",
      "mode": "SEA",
      "name": "Tasman Sea - Cook Strait Crossing",
      "distance_km": 4678.4,
      "transit_days": 5.6,
      "freight_cost_usd": 927.49,
      "base_risk": 0.05
    },
    {
      "u": "sea_19",
      "v": "sea_18",
      "mode": "SEA",
      "name": "Tasman Sea - Cook Strait Crossing",
      "distance_km": 4678.4,
      "transit_days": 5.6,
      "freight_cost_usd": 927.49,
      "base_risk": 0.05
    },
    {
      "u": "sea_18",
      "v": "sea_22",
      "mode": "SEA",
      "name": "Oceania - Singapore Maritime Arterial",
      "distance_km": 4432.2,
      "transit_days": 4.9,
      "freight_cost_usd": 954.58,
      "base_risk": 0.06
    },
    {
      "u": "sea_22",
      "v": "sea_18",
      "mode": "SEA",
      "name": "Oceania - Singapore Maritime Arterial",
      "distance_km": 4432.2,
      "transit_days": 4.9,
      "freight_cost_usd": 954.58,
      "base_risk": 0.06
    },
    {
      "u": "sea_01",
      "v": "sea_40",
      "mode": "SEA",
      "name": "Bay of Bengal - Colombo Super-Corridor",
      "distance_km": 2626.7,
      "transit_days": 2.9,
      "freight_cost_usd": 783.87,
      "base_risk": 0.06
    },
    {
      "u": "sea_40",
      "v": "sea_01",
      "mode": "SEA",
      "name": "Bay of Bengal - Colombo Super-Corridor",
      "distance_km": 2626.7,
      "transit_days": 2.9,
      "freight_cost_usd": 783.87,
      "base_risk": 0.06
    },
    {
      "u": "sea_32",
      "v": "sea_40",
      "mode": "SEA",
      "name": "Port Klang - Colombo Shipping Lane",
      "distance_km": 2426.7,
      "transit_days": 2.7,
      "freight_cost_usd": 769.87,
      "base_risk": 0.06
    },
    {
      "u": "sea_40",
      "v": "sea_32",
      "mode": "SEA",
      "name": "Port Klang - Colombo Shipping Lane",
      "distance_km": 2426.7,
      "transit_days": 2.7,
      "freight_cost_usd": 769.87,
      "base_risk": 0.06
    },
    {
      "u": "sea_40",
      "v": "sea_41",
      "mode": "SEA",
      "name": "Arabian Sea India West Coast Trunk",
      "distance_km": 1528.8,
      "transit_days": 1.8,
      "freight_cost_usd": 707.02,
      "base_risk": 0.04
    },
    {
      "u": "sea_41",
      "v": "sea_40",
      "mode": "SEA",
      "name": "Arabian Sea India West Coast Trunk",
      "distance_km": 1528.8,
      "transit_days": 1.8,
      "freight_cost_usd": 707.02,
      "base_risk": 0.04
    },
    {
      "u": "sea_41",
      "v": "sea_42",
      "mode": "SEA",
      "name": "Gujarat Coast Maritime Corridor",
      "distance_km": 540.0,
      "transit_days": 0.6,
      "freight_cost_usd": 627.0,
      "base_risk": 0.03
    },
    {
      "u": "sea_42",
      "v": "sea_41",
      "mode": "SEA",
      "name": "Gujarat Coast Maritime Corridor",
      "distance_km": 540.0,
      "transit_days": 0.6,
      "freight_cost_usd": 627.0,
      "base_risk": 0.03
    },
    {
      "u": "sea_40",
      "v": "sea_39",
      "mode": "SEA",
      "name": "Indian Ocean - Salalah Direct Corridor",
      "distance_km": 3018.8,
      "transit_days": 3.3,
      "freight_cost_usd": 811.32,
      "base_risk": 0.06
    },
    {
      "u": "sea_39",
      "v": "sea_40",
      "mode": "SEA",
      "name": "Indian Ocean - Salalah Direct Corridor",
      "distance_km": 3018.8,
      "transit_days": 3.3,
      "freight_cost_usd": 811.32,
      "base_risk": 0.06
    },
    {
      "u": "sea_41",
      "v": "sea_39",
      "mode": "SEA",
      "name": "Mumbai - Salalah Express Lane",
      "distance_km": 2016.1,
      "transit_days": 2.2,
      "freight_cost_usd": 741.13,
      "base_risk": 0.06
    },
    {
      "u": "sea_39",
      "v": "sea_41",
      "mode": "SEA",
      "name": "Mumbai - Salalah Express Lane",
      "distance_km": 2016.1,
      "transit_days": 2.2,
      "freight_cost_usd": 741.13,
      "base_risk": 0.06
    },
    {
      "u": "sea_42",
      "v": "sea_39",
      "mode": "SEA",
      "name": "Mundra - Salalah Direct",
      "distance_km": 1762.8,
      "transit_days": 1.9,
      "freight_cost_usd": 723.4,
      "base_risk": 0.06
    },
    {
      "u": "sea_39",
      "v": "sea_42",
      "mode": "SEA",
      "name": "Mundra - Salalah Direct",
      "distance_km": 1762.8,
      "transit_days": 1.9,
      "freight_cost_usd": 723.4,
      "base_risk": 0.06
    },
    {
      "u": "sea_42",
      "v": "sea_04",
      "mode": "SEA",
      "name": "Gulf of Oman - Hormuz Entrance",
      "distance_km": 1423.2,
      "transit_days": 1.6,
      "freight_cost_usd": 728.09,
      "base_risk": 0.22
    },
    {
      "u": "sea_04",
      "v": "sea_42",
      "mode": "SEA",
      "name": "Gulf of Oman - Hormuz Entrance",
      "distance_km": 1423.2,
      "transit_days": 1.6,
      "freight_cost_usd": 728.09,
      "base_risk": 0.22
    },
    {
      "u": "sea_41",
      "v": "sea_04",
      "mode": "SEA",
      "name": "Mumbai - Strait of Hormuz Energy Lane",
      "distance_km": 1907.5,
      "transit_days": 2.2,
      "freight_cost_usd": 771.67,
      "base_risk": 0.22
    },
    {
      "u": "sea_04",
      "v": "sea_41",
      "mode": "SEA",
      "name": "Mumbai - Strait of Hormuz Energy Lane",
      "distance_km": 1907.5,
      "transit_days": 2.2,
      "freight_cost_usd": 771.67,
      "base_risk": 0.22
    },
    {
      "u": "sea_04",
      "v": "sea_38",
      "mode": "SEA",
      "name": "Persian Gulf Jebel Ali Approach",
      "distance_km": 209.5,
      "transit_days": 0.3,
      "freight_cost_usd": 616.76,
      "base_risk": 0.18
    },
    {
      "u": "sea_38",
      "v": "sea_04",
      "mode": "SEA",
      "name": "Persian Gulf Jebel Ali Approach",
      "distance_km": 209.5,
      "transit_days": 0.3,
      "freight_cost_usd": 616.76,
      "base_risk": 0.18
    },
    {
      "u": "sea_38",
      "v": "sea_39",
      "mode": "SEA",
      "name": "Arabian Peninsula Coastal Route",
      "distance_km": 904.1,
      "transit_days": 1.1,
      "freight_cost_usd": 672.33,
      "base_risk": 0.08
    },
    {
      "u": "sea_39",
      "v": "sea_38",
      "mode": "SEA",
      "name": "Arabian Peninsula Coastal Route",
      "distance_km": 904.1,
      "transit_days": 1.1,
      "freight_cost_usd": 672.33,
      "base_risk": 0.08
    },
    {
      "u": "sea_39",
      "v": "sea_05",
      "mode": "SEA",
      "name": "Gulf of Aden - Bab-el-Mandeb Corridor",
      "distance_km": 1245.1,
      "transit_days": 1.4,
      "freight_cost_usd": 712.06,
      "base_risk": 0.25
    },
    {
      "u": "sea_05",
      "v": "sea_39",
      "mode": "SEA",
      "name": "Gulf of Aden - Bab-el-Mandeb Corridor",
      "distance_km": 1245.1,
      "transit_days": 1.4,
      "freight_cost_usd": 712.06,
      "base_risk": 0.25
    },
    {
      "u": "sea_41",
      "v": "sea_05",
      "mode": "SEA",
      "name": "Mumbai - Bab-el-Mandeb Red Sea Route",
      "distance_km": 3243.3,
      "transit_days": 3.6,
      "freight_cost_usd": 891.9,
      "base_risk": 0.24
    },
    {
      "u": "sea_05",
      "v": "sea_41",
      "mode": "SEA",
      "name": "Mumbai - Bab-el-Mandeb Red Sea Route",
      "distance_km": 3243.3,
      "transit_days": 3.6,
      "freight_cost_usd": 891.9,
      "base_risk": 0.24
    },
    {
      "u": "sea_42",
      "v": "sea_05",
      "mode": "SEA",
      "name": "Mundra - Bab-el-Mandeb Red Sea Route",
      "distance_km": 3007.2,
      "transit_days": 3.3,
      "freight_cost_usd": 870.65,
      "base_risk": 0.24
    },
    {
      "u": "sea_05",
      "v": "sea_42",
      "mode": "SEA",
      "name": "Mundra - Bab-el-Mandeb Red Sea Route",
      "distance_km": 3007.2,
      "transit_days": 3.3,
      "freight_cost_usd": 870.65,
      "base_risk": 0.24
    },
    {
      "u": "sea_05",
      "v": "sea_02",
      "mode": "SEA",
      "name": "Red Sea - Suez Transit Corridor",
      "distance_km": 2287.1,
      "transit_days": 2.6,
      "freight_cost_usd": 874.45,
      "base_risk": 0.28
    },
    {
      "u": "sea_02",
      "v": "sea_05",
      "mode": "SEA",
      "name": "Red Sea - Suez Transit Corridor",
      "distance_km": 2287.1,
      "transit_days": 2.6,
      "freight_cost_usd": 874.45,
      "base_risk": 0.28
    },
    {
      "u": "sea_02",
      "v": "sea_37",
      "mode": "SEA",
      "name": "Eastern Mediterranean - Piraeus Lane",
      "distance_km": 1157.9,
      "transit_days": 1.3,
      "freight_cost_usd": 681.05,
      "base_risk": 0.08
    },
    {
      "u": "sea_37",
      "v": "sea_02",
      "mode": "SEA",
      "name": "Eastern Mediterranean - Piraeus Lane",
      "distance_km": 1157.9,
      "transit_days": 1.3,
      "freight_cost_usd": 681.05,
      "base_risk": 0.08
    },
    {
      "u": "sea_37",
      "v": "sea_07",
      "mode": "SEA",
      "name": "Aegean - Bosphorus & Dardanelles Lane",
      "distance_km": 585.9,
      "transit_days": 0.7,
      "freight_cost_usd": 641.01,
      "base_risk": 0.09
    },
    {
      "u": "sea_07",
      "v": "sea_37",
      "mode": "SEA",
      "name": "Aegean - Bosphorus & Dardanelles Lane",
      "distance_km": 585.9,
      "transit_days": 0.7,
      "freight_cost_usd": 641.01,
      "base_risk": 0.09
    },
    {
      "u": "sea_37",
      "v": "sea_20",
      "mode": "SEA",
      "name": "Ionian Sea - Strait of Messina Lane",
      "distance_km": 700.7,
      "transit_days": 0.8,
      "freight_cost_usd": 649.05,
      "base_risk": 0.05
    },
    {
      "u": "sea_20",
      "v": "sea_37",
      "mode": "SEA",
      "name": "Ionian Sea - Strait of Messina Lane",
      "distance_km": 700.7,
      "transit_days": 0.8,
      "freight_cost_usd": 649.05,
      "base_risk": 0.05
    },
    {
      "u": "sea_20",
      "v": "sea_36",
      "mode": "SEA",
      "name": "Tyrrhenian - Valencia Corridor",
      "distance_km": 1386.4,
      "transit_days": 1.6,
      "freight_cost_usd": 697.05,
      "base_risk": 0.05
    },
    {
      "u": "sea_36",
      "v": "sea_20",
      "mode": "SEA",
      "name": "Tyrrhenian - Valencia Corridor",
      "distance_km": 1386.4,
      "transit_days": 1.6,
      "freight_cost_usd": 697.05,
      "base_risk": 0.05
    },
    {
      "u": "sea_36",
      "v": "sea_06",
      "mode": "SEA",
      "name": "Alboran Sea - Strait of Gibraltar Lane",
      "distance_km": 605.1,
      "transit_days": 0.7,
      "freight_cost_usd": 642.36,
      "base_risk": 0.04
    },
    {
      "u": "sea_06",
      "v": "sea_36",
      "mode": "SEA",
      "name": "Alboran Sea - Strait of Gibraltar Lane",
      "distance_km": 605.1,
      "transit_days": 0.7,
      "freight_cost_usd": 642.36,
      "base_risk": 0.04
    },
    {
      "u": "sea_02",
      "v": "sea_06",
      "mode": "SEA",
      "name": "Trans-Mediterranean Express Route",
      "distance_km": 3574.8,
      "transit_days": 3.9,
      "freight_cost_usd": 885.98,
      "base_risk": 0.07
    },
    {
      "u": "sea_06",
      "v": "sea_02",
      "mode": "SEA",
      "name": "Trans-Mediterranean Express Route",
      "distance_km": 3574.8,
      "transit_days": 3.9,
      "freight_cost_usd": 885.98,
      "base_risk": 0.07
    },
    {
      "u": "sea_06",
      "v": "sea_08",
      "mode": "SEA",
      "name": "Bay of Biscay - English Channel Route",
      "distance_km": 1633.0,
      "transit_days": 1.8,
      "freight_cost_usd": 730.64,
      "base_risk": 0.06
    },
    {
      "u": "sea_08",
      "v": "sea_06",
      "mode": "SEA",
      "name": "Bay of Biscay - English Channel Route",
      "distance_km": 1633.0,
      "transit_days": 1.8,
      "freight_cost_usd": 730.64,
      "base_risk": 0.06
    },
    {
      "u": "sea_08",
      "v": "sea_33",
      "mode": "SEA",
      "name": "English Channel - Rotterdam Gateway",
      "distance_km": 380.4,
      "transit_days": 0.5,
      "freight_cost_usd": 622.82,
      "base_risk": 0.05
    },
    {
      "u": "sea_33",
      "v": "sea_08",
      "mode": "SEA",
      "name": "English Channel - Rotterdam Gateway",
      "distance_km": 380.4,
      "transit_days": 0.5,
      "freight_cost_usd": 622.82,
      "base_risk": 0.05
    },
    {
      "u": "sea_33",
      "v": "sea_34",
      "mode": "SEA",
      "name": "Rhine-Scheldt Delta Coastal Connector",
      "distance_km": 75.9,
      "transit_days": 0.2,
      "freight_cost_usd": 603.04,
      "base_risk": 0.02
    },
    {
      "u": "sea_34",
      "v": "sea_33",
      "mode": "SEA",
      "name": "Rhine-Scheldt Delta Coastal Connector",
      "distance_km": 75.9,
      "transit_days": 0.2,
      "freight_cost_usd": 603.04,
      "base_risk": 0.02
    },
    {
      "u": "sea_33",
      "v": "sea_35",
      "mode": "SEA",
      "name": "North Sea - Hamburg Maritime Lane",
      "distance_km": 430.5,
      "transit_days": 0.5,
      "freight_cost_usd": 625.83,
      "base_risk": 0.04
    },
    {
      "u": "sea_35",
      "v": "sea_33",
      "mode": "SEA",
      "name": "North Sea - Hamburg Maritime Lane",
      "distance_km": 430.5,
      "transit_days": 0.5,
      "freight_cost_usd": 625.83,
      "base_risk": 0.04
    },
    {
      "u": "sea_34",
      "v": "sea_35",
      "mode": "SEA",
      "name": "Antwerp to Hamburg North Sea Lane",
      "distance_km": 456.4,
      "transit_days": 0.6,
      "freight_cost_usd": 622.82,
      "base_risk": 0.03
    },
    {
      "u": "sea_35",
      "v": "sea_34",
      "mode": "SEA",
      "name": "Antwerp to Hamburg North Sea Lane",
      "distance_km": 456.4,
      "transit_days": 0.6,
      "freight_cost_usd": 622.82,
      "base_risk": 0.03
    },
    {
      "u": "sea_35",
      "v": "sea_16",
      "mode": "SEA",
      "name": "Elbe - Kiel Canal Inland Shortcut",
      "distance_km": 84.9,
      "transit_days": 0.2,
      "freight_cost_usd": 604.25,
      "base_risk": 0.03
    },
    {
      "u": "sea_16",
      "v": "sea_35",
      "mode": "SEA",
      "name": "Elbe - Kiel Canal Inland Shortcut",
      "distance_km": 84.9,
      "transit_days": 0.2,
      "freight_cost_usd": 604.25,
      "base_risk": 0.03
    },
    {
      "u": "sea_16",
      "v": "sea_09",
      "mode": "SEA",
      "name": "Baltic Approach - Danish Straits",
      "distance_km": 174.9,
      "transit_days": 0.2,
      "freight_cost_usd": 610.49,
      "base_risk": 0.04
    },
    {
      "u": "sea_09",
      "v": "sea_16",
      "mode": "SEA",
      "name": "Baltic Approach - Danish Straits",
      "distance_km": 174.9,
      "transit_days": 0.2,
      "freight_cost_usd": 610.49,
      "base_risk": 0.04
    },
    {
      "u": "sea_08",
      "v": "sea_09",
      "mode": "SEA",
      "name": "North Sea - Danish Straits Direct",
      "distance_km": 981.5,
      "transit_days": 1.2,
      "freight_cost_usd": 668.71,
      "base_risk": 0.04
    },
    {
      "u": "sea_09",
      "v": "sea_08",
      "mode": "SEA",
      "name": "North Sea - Danish Straits Direct",
      "distance_km": 981.5,
      "transit_days": 1.2,
      "freight_cost_usd": 668.71,
      "base_risk": 0.04
    },
    {
      "u": "sea_40",
      "v": "sea_50",
      "mode": "SEA",
      "name": "Indian Ocean - Durban Trans-Oceanic",
      "distance_km": 6624.6,
      "transit_days": 7.3,
      "freight_cost_usd": 1129.97,
      "base_risk": 0.06
    },
    {
      "u": "sea_50",
      "v": "sea_40",
      "mode": "SEA",
      "name": "Indian Ocean - Durban Trans-Oceanic",
      "distance_km": 6624.6,
      "transit_days": 7.3,
      "freight_cost_usd": 1129.97,
      "base_risk": 0.06
    },
    {
      "u": "sea_41",
      "v": "sea_50",
      "mode": "SEA",
      "name": "India West Coast - Durban Direct",
      "distance_km": 7044.9,
      "transit_days": 7.7,
      "freight_cost_usd": 1163.59,
      "base_risk": 0.06
    },
    {
      "u": "sea_50",
      "v": "sea_41",
      "mode": "SEA",
      "name": "India West Coast - Durban Direct",
      "distance_km": 7044.9,
      "transit_days": 7.7,
      "freight_cost_usd": 1163.59,
      "base_risk": 0.06
    },
    {
      "u": "sea_42",
      "v": "sea_50",
      "mode": "SEA",
      "name": "Mundra - Durban Direct Lane",
      "distance_km": 7162.9,
      "transit_days": 7.9,
      "freight_cost_usd": 1173.03,
      "base_risk": 0.06
    },
    {
      "u": "sea_50",
      "v": "sea_42",
      "mode": "SEA",
      "name": "Mundra - Durban Direct Lane",
      "distance_km": 7162.9,
      "transit_days": 7.9,
      "freight_cost_usd": 1173.03,
      "base_risk": 0.06
    },
    {
      "u": "sea_39",
      "v": "sea_50",
      "mode": "SEA",
      "name": "East Africa - Durban Coastal Route",
      "distance_km": 5758.4,
      "transit_days": 6.7,
      "freight_cost_usd": 1003.09,
      "base_risk": 0.05
    },
    {
      "u": "sea_50",
      "v": "sea_39",
      "mode": "SEA",
      "name": "East Africa - Durban Coastal Route",
      "distance_km": 5758.4,
      "transit_days": 6.7,
      "freight_cost_usd": 1003.09,
      "base_risk": 0.05
    },
    {
      "u": "sea_50",
      "v": "sea_10",
      "mode": "SEA",
      "name": "Agulhas Current - Cape of Good Hope Route",
      "distance_km": 1281.5,
      "transit_days": 1.5,
      "freight_cost_usd": 689.71,
      "base_risk": 0.08
    },
    {
      "u": "sea_10",
      "v": "sea_50",
      "mode": "SEA",
      "name": "Agulhas Current - Cape of Good Hope Route",
      "distance_km": 1281.5,
      "transit_days": 1.5,
      "freight_cost_usd": 689.71,
      "base_risk": 0.08
    },
    {
      "u": "sea_10",
      "v": "sea_06",
      "mode": "SEA",
      "name": "West Africa Atlantic - Gibraltar Arterial",
      "distance_km": 8207.3,
      "transit_days": 9.0,
      "freight_cost_usd": 1256.58,
      "base_risk": 0.07
    },
    {
      "u": "sea_06",
      "v": "sea_10",
      "mode": "SEA",
      "name": "West Africa Atlantic - Gibraltar Arterial",
      "distance_km": 8207.3,
      "transit_days": 9.0,
      "freight_cost_usd": 1256.58,
      "base_risk": 0.07
    },
    {
      "u": "sea_10",
      "v": "sea_08",
      "mode": "SEA",
      "name": "Cape of Good Hope to English Channel Express",
      "distance_km": 9583.4,
      "transit_days": 10.5,
      "freight_cost_usd": 1366.67,
      "base_risk": 0.07
    },
    {
      "u": "sea_08",
      "v": "sea_10",
      "mode": "SEA",
      "name": "Cape of Good Hope to English Channel Express",
      "distance_km": 9583.4,
      "transit_days": 10.5,
      "freight_cost_usd": 1366.67,
      "base_risk": 0.07
    },
    {
      "u": "sea_10",
      "v": "sea_47",
      "mode": "SEA",
      "name": "South Atlantic Trans-Oceanic Lane",
      "distance_km": 6291.7,
      "transit_days": 6.9,
      "freight_cost_usd": 1103.34,
      "base_risk": 0.06
    },
    {
      "u": "sea_47",
      "v": "sea_10",
      "mode": "SEA",
      "name": "South Atlantic Trans-Oceanic Lane",
      "distance_km": 6291.7,
      "transit_days": 6.9,
      "freight_cost_usd": 1103.34,
      "base_risk": 0.06
    },
    {
      "u": "sea_06",
      "v": "sea_45",
      "mode": "SEA",
      "name": "North Atlantic Express (Gibraltar to NY/NJ)",
      "distance_km": 5847.9,
      "transit_days": 6.4,
      "freight_cost_usd": 1067.83,
      "base_risk": 0.05
    },
    {
      "u": "sea_45",
      "v": "sea_06",
      "mode": "SEA",
      "name": "North Atlantic Express (Gibraltar to NY/NJ)",
      "distance_km": 5847.9,
      "transit_days": 6.4,
      "freight_cost_usd": 1067.83,
      "base_risk": 0.05
    },
    {
      "u": "sea_08",
      "v": "sea_45",
      "mode": "SEA",
      "name": "Transatlantic Gateway (Channel to NY/NJ)",
      "distance_km": 5601.4,
      "transit_days": 6.1,
      "freight_cost_usd": 1048.11,
      "base_risk": 0.05
    },
    {
      "u": "sea_45",
      "v": "sea_08",
      "mode": "SEA",
      "name": "Transatlantic Gateway (Channel to NY/NJ)",
      "distance_km": 5601.4,
      "transit_days": 6.1,
      "freight_cost_usd": 1048.11,
      "base_risk": 0.05
    },
    {
      "u": "sea_33",
      "v": "sea_45",
      "mode": "SEA",
      "name": "Rotterdam to New York Direct Transatlantic",
      "distance_km": 5840.7,
      "transit_days": 6.4,
      "freight_cost_usd": 1067.26,
      "base_risk": 0.05
    },
    {
      "u": "sea_45",
      "v": "sea_33",
      "mode": "SEA",
      "name": "Rotterdam to New York Direct Transatlantic",
      "distance_km": 5840.7,
      "transit_days": 6.4,
      "freight_cost_usd": 1067.26,
      "base_risk": 0.05
    },
    {
      "u": "sea_45",
      "v": "sea_17",
      "mode": "SEA",
      "name": "Atlantic Seaboard - St Lawrence Seaway",
      "distance_km": 482.3,
      "transit_days": 0.6,
      "freight_cost_usd": 628.94,
      "base_risk": 0.04
    },
    {
      "u": "sea_17",
      "v": "sea_45",
      "mode": "SEA",
      "name": "Atlantic Seaboard - St Lawrence Seaway",
      "distance_km": 482.3,
      "transit_days": 0.6,
      "freight_cost_usd": 628.94,
      "base_risk": 0.04
    },
    {
      "u": "sea_45",
      "v": "sea_46",
      "mode": "SEA",
      "name": "US East Coast - Gulf of Mexico (Houston)",
      "distance_km": 2265.1,
      "transit_days": 2.8,
      "freight_cost_usd": 735.91,
      "base_risk": 0.04
    },
    {
      "u": "sea_46",
      "v": "sea_45",
      "mode": "SEA",
      "name": "US East Coast - Gulf of Mexico (Houston)",
      "distance_km": 2265.1,
      "transit_days": 2.8,
      "freight_cost_usd": 735.91,
      "base_risk": 0.04
    },
    {
      "u": "sea_46",
      "v": "sea_48",
      "mode": "SEA",
      "name": "Gulf of Mexico - Colon Panama",
      "distance_km": 2772.1,
      "transit_days": 3.2,
      "freight_cost_usd": 794.05,
      "base_risk": 0.05
    },
    {
      "u": "sea_48",
      "v": "sea_46",
      "mode": "SEA",
      "name": "Gulf of Mexico - Colon Panama",
      "distance_km": 2772.1,
      "transit_days": 3.2,
      "freight_cost_usd": 794.05,
      "base_risk": 0.05
    },
    {
      "u": "sea_45",
      "v": "sea_48",
      "mode": "SEA",
      "name": "US East Coast - Colon Panama Direct",
      "distance_km": 3527.9,
      "transit_days": 4.1,
      "freight_cost_usd": 846.95,
      "base_risk": 0.05
    },
    {
      "u": "sea_48",
      "v": "sea_45",
      "mode": "SEA",
      "name": "US East Coast - Colon Panama Direct",
      "distance_km": 3527.9,
      "transit_days": 4.1,
      "freight_cost_usd": 846.95,
      "base_risk": 0.05
    },
    {
      "u": "sea_48",
      "v": "sea_03",
      "mode": "SEA",
      "name": "Panama Canal Transit Corridor",
      "distance_km": 37.0,
      "transit_days": 0.2,
      "freight_cost_usd": 605.55,
      "base_risk": 0.22
    },
    {
      "u": "sea_03",
      "v": "sea_48",
      "mode": "SEA",
      "name": "Panama Canal Transit Corridor",
      "distance_km": 37.0,
      "transit_days": 0.2,
      "freight_cost_usd": 605.55,
      "base_risk": 0.22
    },
    {
      "u": "sea_03",
      "v": "sea_49",
      "mode": "SEA",
      "name": "Pacific Central America - Manzanillo",
      "distance_km": 2872.9,
      "transit_days": 3.3,
      "freight_cost_usd": 801.1,
      "base_risk": 0.06
    },
    {
      "u": "sea_49",
      "v": "sea_03",
      "mode": "SEA",
      "name": "Pacific Central America - Manzanillo",
      "distance_km": 2872.9,
      "transit_days": 3.3,
      "freight_cost_usd": 801.1,
      "base_risk": 0.06
    },
    {
      "u": "sea_49",
      "v": "sea_44",
      "mode": "SEA",
      "name": "Pacific Coast - Long Beach",
      "distance_km": 2136.9,
      "transit_days": 2.5,
      "freight_cost_usd": 728.21,
      "base_risk": 0.05
    },
    {
      "u": "sea_44",
      "v": "sea_49",
      "mode": "SEA",
      "name": "Pacific Coast - Long Beach",
      "distance_km": 2136.9,
      "transit_days": 2.5,
      "freight_cost_usd": 728.21,
      "base_risk": 0.05
    },
    {
      "u": "sea_44",
      "v": "sea_43",
      "mode": "SEA",
      "name": "San Pedro Bay Harbor Connector",
      "distance_km": 6.8,
      "transit_days": 0.2,
      "freight_cost_usd": 600.14,
      "base_risk": 0.02
    },
    {
      "u": "sea_43",
      "v": "sea_44",
      "mode": "SEA",
      "name": "San Pedro Bay Harbor Connector",
      "distance_km": 6.8,
      "transit_days": 0.2,
      "freight_cost_usd": 600.14,
      "base_risk": 0.02
    },
    {
      "u": "sea_43",
      "v": "sea_21",
      "mode": "SEA",
      "name": "Transpacific Northern Trunk (LA to Shanghai)",
      "distance_km": 10461.6,
      "transit_days": 11.5,
      "freight_cost_usd": 1541.54,
      "base_risk": 0.07
    },
    {
      "u": "sea_21",
      "v": "sea_43",
      "mode": "SEA",
      "name": "Transpacific Northern Trunk (LA to Shanghai)",
      "distance_km": 10461.6,
      "transit_days": 11.5,
      "freight_cost_usd": 1541.54,
      "base_risk": 0.07
    },
    {
      "u": "sea_44",
      "v": "sea_26",
      "mode": "SEA",
      "name": "Transpacific Express (Long Beach to Busan)",
      "distance_km": 9648.1,
      "transit_days": 10.6,
      "freight_cost_usd": 1468.33,
      "base_risk": 0.07
    },
    {
      "u": "sea_26",
      "v": "sea_44",
      "mode": "SEA",
      "name": "Transpacific Express (Long Beach to Busan)",
      "distance_km": 9648.1,
      "transit_days": 10.6,
      "freight_cost_usd": 1468.33,
      "base_risk": 0.07
    },
    {
      "u": "sea_43",
      "v": "sea_28",
      "mode": "SEA",
      "name": "LA to Hong Kong Transpacific Lane",
      "distance_km": 11671.9,
      "transit_days": 12.8,
      "freight_cost_usd": 1650.47,
      "base_risk": 0.07
    },
    {
      "u": "sea_28",
      "v": "sea_43",
      "mode": "SEA",
      "name": "LA to Hong Kong Transpacific Lane",
      "distance_km": 11671.9,
      "transit_days": 12.8,
      "freight_cost_usd": 1650.47,
      "base_risk": 0.07
    },
    {
      "u": "sea_03",
      "v": "sea_47",
      "mode": "SEA",
      "name": "Caribbean - Santos Brazil Lane",
      "distance_km": 5163.4,
      "transit_days": 6.0,
      "freight_cost_usd": 1013.07,
      "base_risk": 0.06
    },
    {
      "u": "sea_47",
      "v": "sea_03",
      "mode": "SEA",
      "name": "Caribbean - Santos Brazil Lane",
      "distance_km": 5163.4,
      "transit_days": 6.0,
      "freight_cost_usd": 1013.07,
      "base_risk": 0.06
    },
    {
      "u": "sea_47",
      "v": "sea_45",
      "mode": "SEA",
      "name": "Santos Brazil to New York Atlantic Trunk",
      "distance_km": 7740.7,
      "transit_days": 8.5,
      "freight_cost_usd": 1219.26,
      "base_risk": 0.05
    },
    {
      "u": "sea_45",
      "v": "sea_47",
      "mode": "SEA",
      "name": "Santos Brazil to New York Atlantic Trunk",
      "distance_km": 7740.7,
      "transit_days": 8.5,
      "freight_cost_usd": 1219.26,
      "base_risk": 0.05
    },
    {
      "u": "sea_47",
      "v": "sea_14",
      "mode": "SEA",
      "name": "South American Atlantic - Strait of Magellan",
      "distance_km": 3867.9,
      "transit_days": 4.6,
      "freight_cost_usd": 870.75,
      "base_risk": 0.07
    },
    {
      "u": "sea_14",
      "v": "sea_47",
      "mode": "SEA",
      "name": "South American Atlantic - Strait of Magellan",
      "distance_km": 3867.9,
      "transit_days": 4.6,
      "freight_cost_usd": 870.75,
      "base_risk": 0.07
    },
    {
      "u": "sea_14",
      "v": "sea_15",
      "mode": "SEA",
      "name": "Cape Horn / Drake Passage Extremity Route",
      "distance_km": 403.5,
      "transit_days": 0.6,
      "freight_cost_usd": 648.42,
      "base_risk": 0.14
    },
    {
      "u": "sea_15",
      "v": "sea_14",
      "mode": "SEA",
      "name": "Cape Horn / Drake Passage Extremity Route",
      "distance_km": 403.5,
      "transit_days": 0.6,
      "freight_cost_usd": 648.42,
      "base_risk": 0.14
    },
    {
      "u": "sea_14",
      "v": "sea_49",
      "mode": "SEA",
      "name": "South American Pacific - Manzanillo",
      "distance_km": 8682.1,
      "transit_days": 10.0,
      "freight_cost_usd": 1294.57,
      "base_risk": 0.07
    },
    {
      "u": "sea_49",
      "v": "sea_14",
      "mode": "SEA",
      "name": "South American Pacific - Manzanillo",
      "distance_km": 8682.1,
      "transit_days": 10.0,
      "freight_cost_usd": 1294.57,
      "base_risk": 0.07
    },
    {
      "u": "sea_19",
      "v": "sea_14",
      "mode": "SEA",
      "name": "Cook Strait to Strait of Magellan South Pacific",
      "distance_km": 7777.9,
      "transit_days": 8.5,
      "freight_cost_usd": 1300.01,
      "base_risk": 0.08
    },
    {
      "u": "sea_14",
      "v": "sea_19",
      "mode": "SEA",
      "name": "Cook Strait to Strait of Magellan South Pacific",
      "distance_km": 7777.9,
      "transit_days": 8.5,
      "freight_cost_usd": 1300.01,
      "base_risk": 0.08
    },
    {
      "u": "air_01",
      "v": "air_04",
      "mode": "AIR",
      "name": "Polar Air Route (HKG to ANC)",
      "distance_km": 8165.2,
      "transit_days": 0.4,
      "freight_cost_usd": 7990.86,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_01",
      "mode": "AIR",
      "name": "Polar Air Route (HKG to ANC)",
      "distance_km": 8165.2,
      "transit_days": 0.4,
      "freight_cost_usd": 7990.86,
      "base_risk": 0.03
    },
    {
      "u": "air_03",
      "v": "air_04",
      "mode": "AIR",
      "name": "Transpacific Express (PVG to ANC)",
      "distance_km": 6919.1,
      "transit_days": 0.3,
      "freight_cost_usd": 7305.51,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_03",
      "mode": "AIR",
      "name": "Transpacific Express (PVG to ANC)",
      "distance_km": 6919.1,
      "transit_days": 0.3,
      "freight_cost_usd": 7305.51,
      "base_risk": 0.03
    },
    {
      "u": "air_05",
      "v": "air_04",
      "mode": "AIR",
      "name": "North Pacific Air Corridor (ICN to ANC)",
      "distance_km": 6099.3,
      "transit_days": 0.3,
      "freight_cost_usd": 6671.64,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_05",
      "mode": "AIR",
      "name": "North Pacific Air Corridor (ICN to ANC)",
      "distance_km": 6099.3,
      "transit_days": 0.3,
      "freight_cost_usd": 6671.64,
      "base_risk": 0.03
    },
    {
      "u": "air_10",
      "v": "air_04",
      "mode": "AIR",
      "name": "Japan-Alaska Air Bridge (NRT to ANC)",
      "distance_km": 5514.4,
      "transit_days": 0.3,
      "freight_cost_usd": 6257.2,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_10",
      "mode": "AIR",
      "name": "Japan-Alaska Air Bridge (NRT to ANC)",
      "distance_km": 5514.4,
      "transit_days": 0.3,
      "freight_cost_usd": 6257.2,
      "base_risk": 0.03
    },
    {
      "u": "air_08",
      "v": "air_04",
      "mode": "AIR",
      "name": "Taoyuan Air Express (TPE to ANC)",
      "distance_km": 7519.7,
      "transit_days": 0.4,
      "freight_cost_usd": 7560.64,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_08",
      "mode": "AIR",
      "name": "Taoyuan Air Express (TPE to ANC)",
      "distance_km": 7519.7,
      "transit_days": 0.4,
      "freight_cost_usd": 7560.64,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_02",
      "mode": "AIR",
      "name": "Anchorage-Memphis FedEx Superhub Route",
      "distance_km": 5064.5,
      "transit_days": 0.2,
      "freight_cost_usd": 5930.96,
      "base_risk": 0.03
    },
    {
      "u": "air_02",
      "v": "air_04",
      "mode": "AIR",
      "name": "Anchorage-Memphis FedEx Superhub Route",
      "distance_km": 5064.5,
      "transit_days": 0.2,
      "freight_cost_usd": 5930.96,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_06",
      "mode": "AIR",
      "name": "Anchorage-Louisville UPS Worldport Route",
      "distance_km": 5012.8,
      "transit_days": 0.2,
      "freight_cost_usd": 5906.14,
      "base_risk": 0.03
    },
    {
      "u": "air_06",
      "v": "air_04",
      "mode": "AIR",
      "name": "Anchorage-Louisville UPS Worldport Route",
      "distance_km": 5012.8,
      "transit_days": 0.2,
      "freight_cost_usd": 5906.14,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_14",
      "mode": "AIR",
      "name": "Anchorage-Chicago O'Hare Cargo Trunk",
      "distance_km": 4569.1,
      "transit_days": 0.2,
      "freight_cost_usd": 5601.79,
      "base_risk": 0.03
    },
    {
      "u": "air_14",
      "v": "air_04",
      "mode": "AIR",
      "name": "Anchorage-Chicago O'Hare Cargo Trunk",
      "distance_km": 4569.1,
      "transit_days": 0.2,
      "freight_cost_usd": 5601.79,
      "base_risk": 0.03
    },
    {
      "u": "air_04",
      "v": "air_09",
      "mode": "AIR",
      "name": "Anchorage-LAX Pacific West Corridor",
      "distance_km": 3770.4,
      "transit_days": 0.2,
      "freight_cost_usd": 5309.79,
      "base_risk": 0.03
    },
    {
      "u": "air_09",
      "v": "air_04",
      "mode": "AIR",
      "name": "Anchorage-LAX Pacific West Corridor",
      "distance_km": 3770.4,
      "transit_days": 0.2,
      "freight_cost_usd": 5309.79,
      "base_risk": 0.03
    },
    {
      "u": "air_02",
      "v": "air_06",
      "mode": "AIR",
      "name": "Midwest Cargo Feeder (MEM to SDF)",
      "distance_km": 514.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3679.93,
      "base_risk": 0.02
    },
    {
      "u": "air_06",
      "v": "air_02",
      "mode": "AIR",
      "name": "Midwest Cargo Feeder (MEM to SDF)",
      "distance_km": 514.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3679.93,
      "base_risk": 0.02
    },
    {
      "u": "air_02",
      "v": "air_07",
      "mode": "AIR",
      "name": "Southeast Air Artery (MEM to MIA)",
      "distance_km": 1383.7,
      "transit_days": 0.2,
      "freight_cost_usd": 4025.81,
      "base_risk": 0.02
    },
    {
      "u": "air_07",
      "v": "air_02",
      "mode": "AIR",
      "name": "Southeast Air Artery (MEM to MIA)",
      "distance_km": 1383.7,
      "transit_days": 0.2,
      "freight_cost_usd": 4025.81,
      "base_risk": 0.02
    },
    {
      "u": "air_02",
      "v": "air_30",
      "mode": "AIR",
      "name": "East Coast Air Express (MEM to JFK)",
      "distance_km": 1549.8,
      "transit_days": 0.2,
      "freight_cost_usd": 4119.92,
      "base_risk": 0.02
    },
    {
      "u": "air_30",
      "v": "air_02",
      "mode": "AIR",
      "name": "East Coast Air Express (MEM to JFK)",
      "distance_km": 1549.8,
      "transit_days": 0.2,
      "freight_cost_usd": 4119.92,
      "base_risk": 0.02
    },
    {
      "u": "air_06",
      "v": "air_18",
      "mode": "AIR",
      "name": "DHL Americas Artery (SDF to CVG)",
      "distance_km": 135.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3540.5,
      "base_risk": 0.02
    },
    {
      "u": "air_18",
      "v": "air_06",
      "mode": "AIR",
      "name": "DHL Americas Artery (SDF to CVG)",
      "distance_km": 135.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3540.5,
      "base_risk": 0.02
    },
    {
      "u": "air_18",
      "v": "air_14",
      "mode": "AIR",
      "name": "Great Lakes Cargo Shuttle (CVG to ORD)",
      "distance_km": 424.2,
      "transit_days": 0.2,
      "freight_cost_usd": 3635.74,
      "base_risk": 0.02
    },
    {
      "u": "air_14",
      "v": "air_18",
      "mode": "AIR",
      "name": "Great Lakes Cargo Shuttle (CVG to ORD)",
      "distance_km": 424.2,
      "transit_days": 0.2,
      "freight_cost_usd": 3635.74,
      "base_risk": 0.02
    },
    {
      "u": "air_18",
      "v": "air_33",
      "mode": "AIR",
      "name": "Midwest Regional Cargo (CVG to IND)",
      "distance_km": 157.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3544.21,
      "base_risk": 0.02
    },
    {
      "u": "air_33",
      "v": "air_18",
      "mode": "AIR",
      "name": "Midwest Regional Cargo (CVG to IND)",
      "distance_km": 157.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3544.21,
      "base_risk": 0.02
    },
    {
      "u": "air_14",
      "v": "air_31",
      "mode": "AIR",
      "name": "Inland-Southeast Air Route (ORD to ATL)",
      "distance_km": 974.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3841.22,
      "base_risk": 0.02
    },
    {
      "u": "air_31",
      "v": "air_14",
      "mode": "AIR",
      "name": "Inland-Southeast Air Route (ORD to ATL)",
      "distance_km": 974.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3841.22,
      "base_risk": 0.02
    },
    {
      "u": "air_31",
      "v": "air_32",
      "mode": "AIR",
      "name": "Southern Cross Air Corridor (ATL to DFW)",
      "distance_km": 1174.5,
      "transit_days": 0.2,
      "freight_cost_usd": 3911.07,
      "base_risk": 0.02
    },
    {
      "u": "air_32",
      "v": "air_31",
      "mode": "AIR",
      "name": "Southern Cross Air Corridor (ATL to DFW)",
      "distance_km": 1174.5,
      "transit_days": 0.2,
      "freight_cost_usd": 3911.07,
      "base_risk": 0.02
    },
    {
      "u": "air_32",
      "v": "air_09",
      "mode": "AIR",
      "name": "Southwest Air Corridor (DFW to LAX)",
      "distance_km": 1983.1,
      "transit_days": 0.2,
      "freight_cost_usd": 4293.24,
      "base_risk": 0.02
    },
    {
      "u": "air_09",
      "v": "air_32",
      "mode": "AIR",
      "name": "Southwest Air Corridor (DFW to LAX)",
      "distance_km": 1983.1,
      "transit_days": 0.2,
      "freight_cost_usd": 4293.24,
      "base_risk": 0.02
    },
    {
      "u": "air_09",
      "v": "air_34",
      "mode": "AIR",
      "name": "Southern California Cargo Shuttle (LAX to ONT)",
      "distance_km": 75.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3515.18,
      "base_risk": 0.01
    },
    {
      "u": "air_34",
      "v": "air_09",
      "mode": "AIR",
      "name": "Southern California Cargo Shuttle (LAX to ONT)",
      "distance_km": 75.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3515.18,
      "base_risk": 0.01
    },
    {
      "u": "air_30",
      "v": "air_11",
      "mode": "AIR",
      "name": "Transatlantic Gateway (JFK to FRA)",
      "distance_km": 6189.6,
      "transit_days": 0.3,
      "freight_cost_usd": 7089.97,
      "base_risk": 0.03
    },
    {
      "u": "air_11",
      "v": "air_30",
      "mode": "AIR",
      "name": "Transatlantic Gateway (JFK to FRA)",
      "distance_km": 6189.6,
      "transit_days": 0.3,
      "freight_cost_usd": 7089.97,
      "base_risk": 0.03
    },
    {
      "u": "air_30",
      "v": "air_23",
      "mode": "AIR",
      "name": "North Atlantic Prime (JFK to LHR)",
      "distance_km": 5540.5,
      "transit_days": 0.3,
      "freight_cost_usd": 6547.27,
      "base_risk": 0.03
    },
    {
      "u": "air_23",
      "v": "air_30",
      "mode": "AIR",
      "name": "North Atlantic Prime (JFK to LHR)",
      "distance_km": 5540.5,
      "transit_days": 0.3,
      "freight_cost_usd": 6547.27,
      "base_risk": 0.03
    },
    {
      "u": "air_14",
      "v": "air_11",
      "mode": "AIR",
      "name": "Midwest-Europe Air Trunk (ORD to FRA)",
      "distance_km": 6971.6,
      "transit_days": 0.3,
      "freight_cost_usd": 7682.96,
      "base_risk": 0.03
    },
    {
      "u": "air_11",
      "v": "air_14",
      "mode": "AIR",
      "name": "Midwest-Europe Air Trunk (ORD to FRA)",
      "distance_km": 6971.6,
      "transit_days": 0.3,
      "freight_cost_usd": 7682.96,
      "base_risk": 0.03
    },
    {
      "u": "air_02",
      "v": "air_19",
      "mode": "AIR",
      "name": "FedEx Transatlantic Bridge (MEM to LEJ)",
      "distance_km": 7792.2,
      "transit_days": 0.4,
      "freight_cost_usd": 8331.16,
      "base_risk": 0.03
    },
    {
      "u": "air_19",
      "v": "air_02",
      "mode": "AIR",
      "name": "FedEx Transatlantic Bridge (MEM to LEJ)",
      "distance_km": 7792.2,
      "transit_days": 0.4,
      "freight_cost_usd": 8331.16,
      "base_risk": 0.03
    },
    {
      "u": "air_06",
      "v": "air_25",
      "mode": "AIR",
      "name": "UPS European Air Bridge (SDF to LGG)",
      "distance_km": 6907.9,
      "transit_days": 0.3,
      "freight_cost_usd": 7782.9,
      "base_risk": 0.03
    },
    {
      "u": "air_25",
      "v": "air_06",
      "mode": "AIR",
      "name": "UPS European Air Bridge (SDF to LGG)",
      "distance_km": 6907.9,
      "transit_days": 0.3,
      "freight_cost_usd": 7782.9,
      "base_risk": 0.03
    },
    {
      "u": "air_11",
      "v": "air_19",
      "mode": "AIR",
      "name": "German Air Cargo Backbone (FRA to LEJ)",
      "distance_km": 301.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3584.28,
      "base_risk": 0.02
    },
    {
      "u": "air_19",
      "v": "air_11",
      "mode": "AIR",
      "name": "German Air Cargo Backbone (FRA to LEJ)",
      "distance_km": 301.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3584.28,
      "base_risk": 0.02
    },
    {
      "u": "air_11",
      "v": "air_15",
      "mode": "AIR",
      "name": "Benelux Air Connector (FRA to AMS)",
      "distance_km": 367.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3610.13,
      "base_risk": 0.02
    },
    {
      "u": "air_15",
      "v": "air_11",
      "mode": "AIR",
      "name": "Benelux Air Connector (FRA to AMS)",
      "distance_km": 367.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3610.13,
      "base_risk": 0.02
    },
    {
      "u": "air_11",
      "v": "air_20",
      "mode": "AIR",
      "name": "Central Europe Express (FRA to CDG)",
      "distance_km": 449.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3643.68,
      "base_risk": 0.02
    },
    {
      "u": "air_20",
      "v": "air_11",
      "mode": "AIR",
      "name": "Central Europe Express (FRA to CDG)",
      "distance_km": 449.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3643.68,
      "base_risk": 0.02
    },
    {
      "u": "air_15",
      "v": "air_24",
      "mode": "AIR",
      "name": "Cargolux Hub Route (AMS to LUX)",
      "distance_km": 315.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3578.75,
      "base_risk": 0.02
    },
    {
      "u": "air_24",
      "v": "air_15",
      "mode": "AIR",
      "name": "Cargolux Hub Route (AMS to LUX)",
      "distance_km": 315.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3578.75,
      "base_risk": 0.02
    },
    {
      "u": "air_24",
      "v": "air_25",
      "mode": "AIR",
      "name": "Liege-Luxembourg Cargo Shuttle (LUX to LGG)",
      "distance_km": 125.3,
      "transit_days": 0.2,
      "freight_cost_usd": 3525.06,
      "base_risk": 0.01
    },
    {
      "u": "air_25",
      "v": "air_24",
      "mode": "AIR",
      "name": "Liege-Luxembourg Cargo Shuttle (LUX to LGG)",
      "distance_km": 125.3,
      "transit_days": 0.2,
      "freight_cost_usd": 3525.06,
      "base_risk": 0.01
    },
    {
      "u": "air_25",
      "v": "air_37",
      "mode": "AIR",
      "name": "Belgium Air Cargo Link (LGG to BRU)",
      "distance_km": 73.4,
      "transit_days": 0.2,
      "freight_cost_usd": 3513.21,
      "base_risk": 0.01
    },
    {
      "u": "air_37",
      "v": "air_25",
      "mode": "AIR",
      "name": "Belgium Air Cargo Link (LGG to BRU)",
      "distance_km": 73.4,
      "transit_days": 0.2,
      "freight_cost_usd": 3513.21,
      "base_risk": 0.01
    },
    {
      "u": "air_20",
      "v": "air_35",
      "mode": "AIR",
      "name": "Alpine Air Route (CDG to MXP)",
      "distance_km": 597.6,
      "transit_days": 0.2,
      "freight_cost_usd": 3709.16,
      "base_risk": 0.02
    },
    {
      "u": "air_35",
      "v": "air_20",
      "mode": "AIR",
      "name": "Alpine Air Route (CDG to MXP)",
      "distance_km": 597.6,
      "transit_days": 0.2,
      "freight_cost_usd": 3709.16,
      "base_risk": 0.02
    },
    {
      "u": "air_20",
      "v": "air_36",
      "mode": "AIR",
      "name": "Iberian Air Artery (CDG to MAD)",
      "distance_km": 1063.7,
      "transit_days": 0.2,
      "freight_cost_usd": 3904.21,
      "base_risk": 0.02
    },
    {
      "u": "air_36",
      "v": "air_20",
      "mode": "AIR",
      "name": "Iberian Air Artery (CDG to MAD)",
      "distance_km": 1063.7,
      "transit_days": 0.2,
      "freight_cost_usd": 3904.21,
      "base_risk": 0.02
    },
    {
      "u": "air_23",
      "v": "air_20",
      "mode": "AIR",
      "name": "Channel Air Shuttle (LHR to CDG)",
      "distance_km": 346.8,
      "transit_days": 0.2,
      "freight_cost_usd": 3586.7,
      "base_risk": 0.02
    },
    {
      "u": "air_20",
      "v": "air_23",
      "mode": "AIR",
      "name": "Channel Air Shuttle (LHR to CDG)",
      "distance_km": 346.8,
      "transit_days": 0.2,
      "freight_cost_usd": 3586.7,
      "base_risk": 0.02
    },
    {
      "u": "air_35",
      "v": "air_11",
      "mode": "AIR",
      "name": "Milan to Frankfurt Cargo Shuttle",
      "distance_km": 489.4,
      "transit_days": 0.2,
      "freight_cost_usd": 3646.82,
      "base_risk": 0.02
    },
    {
      "u": "air_11",
      "v": "air_35",
      "mode": "AIR",
      "name": "Milan to Frankfurt Cargo Shuttle",
      "distance_km": 489.4,
      "transit_days": 0.2,
      "freight_cost_usd": 3646.82,
      "base_risk": 0.02
    },
    {
      "u": "air_36",
      "v": "air_11",
      "mode": "AIR",
      "name": "Madrid to Frankfurt Air Trunk",
      "distance_km": 1421.4,
      "transit_days": 0.2,
      "freight_cost_usd": 3997.49,
      "base_risk": 0.02
    },
    {
      "u": "air_11",
      "v": "air_36",
      "mode": "AIR",
      "name": "Madrid to Frankfurt Air Trunk",
      "distance_km": 1421.4,
      "transit_days": 0.2,
      "freight_cost_usd": 3997.49,
      "base_risk": 0.02
    },
    {
      "u": "air_37",
      "v": "air_15",
      "mode": "AIR",
      "name": "Brussels to Amsterdam Air Connector",
      "distance_km": 158.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3531.6,
      "base_risk": 0.01
    },
    {
      "u": "air_15",
      "v": "air_37",
      "mode": "AIR",
      "name": "Brussels to Amsterdam Air Connector",
      "distance_km": 158.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3531.6,
      "base_risk": 0.01
    },
    {
      "u": "air_11",
      "v": "air_13",
      "mode": "AIR",
      "name": "Europe-Gulf Super-Highway (FRA to DXB)",
      "distance_km": 4843.1,
      "transit_days": 0.2,
      "freight_cost_usd": 6163.7,
      "base_risk": 0.05
    },
    {
      "u": "air_13",
      "v": "air_11",
      "mode": "AIR",
      "name": "Europe-Gulf Super-Highway (FRA to DXB)",
      "distance_km": 4843.1,
      "transit_days": 0.2,
      "freight_cost_usd": 6163.7,
      "base_risk": 0.05
    },
    {
      "u": "air_20",
      "v": "air_12",
      "mode": "AIR",
      "name": "Qatar Airways Cargo Link (CDG to DOH)",
      "distance_km": 4967.4,
      "transit_days": 0.2,
      "freight_cost_usd": 6232.07,
      "base_risk": 0.05
    },
    {
      "u": "air_12",
      "v": "air_20",
      "mode": "AIR",
      "name": "Qatar Airways Cargo Link (CDG to DOH)",
      "distance_km": 4967.4,
      "transit_days": 0.2,
      "freight_cost_usd": 6232.07,
      "base_risk": 0.05
    },
    {
      "u": "air_23",
      "v": "air_29",
      "mode": "AIR",
      "name": "Turkish Cargo Silk Route (LHR to IST)",
      "distance_km": 2487.6,
      "transit_days": 0.2,
      "freight_cost_usd": 4694.05,
      "base_risk": 0.04
    },
    {
      "u": "air_29",
      "v": "air_23",
      "mode": "AIR",
      "name": "Turkish Cargo Silk Route (LHR to IST)",
      "distance_km": 2487.6,
      "transit_days": 0.2,
      "freight_cost_usd": 4694.05,
      "base_risk": 0.04
    },
    {
      "u": "air_29",
      "v": "air_13",
      "mode": "AIR",
      "name": "Levant Air Corridor (IST to DXB)",
      "distance_km": 3028.6,
      "transit_days": 0.2,
      "freight_cost_usd": 4772.01,
      "base_risk": 0.04
    },
    {
      "u": "air_13",
      "v": "air_29",
      "mode": "AIR",
      "name": "Levant Air Corridor (IST to DXB)",
      "distance_km": 3028.6,
      "transit_days": 0.2,
      "freight_cost_usd": 4772.01,
      "base_risk": 0.04
    },
    {
      "u": "air_13",
      "v": "air_28",
      "mode": "AIR",
      "name": "Emirates Air Shuttle (DXB to AUH)",
      "distance_km": 116.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3517.4,
      "base_risk": 0.01
    },
    {
      "u": "air_28",
      "v": "air_13",
      "mode": "AIR",
      "name": "Emirates Air Shuttle (DXB to AUH)",
      "distance_km": 116.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3517.4,
      "base_risk": 0.01
    },
    {
      "u": "air_13",
      "v": "air_12",
      "mode": "AIR",
      "name": "Gulf Inter-Hub Shuttles (DXB to DOH)",
      "distance_km": 381.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3583.84,
      "base_risk": 0.03
    },
    {
      "u": "air_12",
      "v": "air_13",
      "mode": "AIR",
      "name": "Gulf Inter-Hub Shuttles (DXB to DOH)",
      "distance_km": 381.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3583.84,
      "base_risk": 0.03
    },
    {
      "u": "air_29",
      "v": "air_50",
      "mode": "AIR",
      "name": "Eastern Med Air Trunk (IST to CAI)",
      "distance_km": 1263.8,
      "transit_days": 0.2,
      "freight_cost_usd": 3942.33,
      "base_risk": 0.04
    },
    {
      "u": "air_50",
      "v": "air_29",
      "mode": "AIR",
      "name": "Eastern Med Air Trunk (IST to CAI)",
      "distance_km": 1263.8,
      "transit_days": 0.2,
      "freight_cost_usd": 3942.33,
      "base_risk": 0.04
    },
    {
      "u": "air_13",
      "v": "air_43",
      "mode": "AIR",
      "name": "Gulf-India Financial Route (DXB to BOM)",
      "distance_km": 1926.6,
      "transit_days": 0.2,
      "freight_cost_usd": 4366.97,
      "base_risk": 0.04
    },
    {
      "u": "air_43",
      "v": "air_13",
      "mode": "AIR",
      "name": "Gulf-India Financial Route (DXB to BOM)",
      "distance_km": 1926.6,
      "transit_days": 0.2,
      "freight_cost_usd": 4366.97,
      "base_risk": 0.04
    },
    {
      "u": "air_13",
      "v": "air_42",
      "mode": "AIR",
      "name": "Gulf-North India Express (DXB to DEL)",
      "distance_km": 2183.7,
      "transit_days": 0.2,
      "freight_cost_usd": 4482.66,
      "base_risk": 0.04
    },
    {
      "u": "air_42",
      "v": "air_13",
      "mode": "AIR",
      "name": "Gulf-North India Express (DXB to DEL)",
      "distance_km": 2183.7,
      "transit_days": 0.2,
      "freight_cost_usd": 4482.66,
      "base_risk": 0.04
    },
    {
      "u": "air_12",
      "v": "air_44",
      "mode": "AIR",
      "name": "Doha-Bengaluru Tech Express (DOH to BLR)",
      "distance_km": 3045.9,
      "transit_days": 0.2,
      "freight_cost_usd": 4962.03,
      "base_risk": 0.04
    },
    {
      "u": "air_44",
      "v": "air_12",
      "mode": "AIR",
      "name": "Doha-Bengaluru Tech Express (DOH to BLR)",
      "distance_km": 3045.9,
      "transit_days": 0.2,
      "freight_cost_usd": 4962.03,
      "base_risk": 0.04
    },
    {
      "u": "air_42",
      "v": "air_43",
      "mode": "AIR",
      "name": "India Golden Quad Air Route (DEL to BOM)",
      "distance_km": 1137.2,
      "transit_days": 0.2,
      "freight_cost_usd": 3898.02,
      "base_risk": 0.02
    },
    {
      "u": "air_43",
      "v": "air_42",
      "mode": "AIR",
      "name": "India Golden Quad Air Route (DEL to BOM)",
      "distance_km": 1137.2,
      "transit_days": 0.2,
      "freight_cost_usd": 3898.02,
      "base_risk": 0.02
    },
    {
      "u": "air_43",
      "v": "air_44",
      "mode": "AIR",
      "name": "India South Cargo Link (BOM to BLR)",
      "distance_km": 834.2,
      "transit_days": 0.2,
      "freight_cost_usd": 3750.26,
      "base_risk": 0.02
    },
    {
      "u": "air_44",
      "v": "air_43",
      "mode": "AIR",
      "name": "India South Cargo Link (BOM to BLR)",
      "distance_km": 834.2,
      "transit_days": 0.2,
      "freight_cost_usd": 3750.26,
      "base_risk": 0.02
    },
    {
      "u": "air_11",
      "v": "air_42",
      "mode": "AIR",
      "name": "Frankfurt to Delhi Cargo Express",
      "distance_km": 6121.0,
      "transit_days": 0.3,
      "freight_cost_usd": 7050.18,
      "base_risk": 0.03
    },
    {
      "u": "air_42",
      "v": "air_11",
      "mode": "AIR",
      "name": "Frankfurt to Delhi Cargo Express",
      "distance_km": 6121.0,
      "transit_days": 0.3,
      "freight_cost_usd": 7050.18,
      "base_risk": 0.03
    },
    {
      "u": "air_23",
      "v": "air_43",
      "mode": "AIR",
      "name": "London Heathrow to Mumbai Air Trunk",
      "distance_km": 7212.3,
      "transit_days": 0.3,
      "freight_cost_usd": 7683.13,
      "base_risk": 0.03
    },
    {
      "u": "air_43",
      "v": "air_23",
      "mode": "AIR",
      "name": "London Heathrow to Mumbai Air Trunk",
      "distance_km": 7212.3,
      "transit_days": 0.3,
      "freight_cost_usd": 7683.13,
      "base_risk": 0.03
    },
    {
      "u": "air_43",
      "v": "air_21",
      "mode": "AIR",
      "name": "India-Singapore Air Corridor (BOM to SIN)",
      "distance_km": 3920.7,
      "transit_days": 0.2,
      "freight_cost_usd": 5538.76,
      "base_risk": 0.04
    },
    {
      "u": "air_21",
      "v": "air_43",
      "mode": "AIR",
      "name": "India-Singapore Air Corridor (BOM to SIN)",
      "distance_km": 3920.7,
      "transit_days": 0.2,
      "freight_cost_usd": 5538.76,
      "base_risk": 0.04
    },
    {
      "u": "air_42",
      "v": "air_38",
      "mode": "AIR",
      "name": "Delhi-Bangkok Air Route (DEL to BKK)",
      "distance_km": 2948.0,
      "transit_days": 0.2,
      "freight_cost_usd": 4915.04,
      "base_risk": 0.03
    },
    {
      "u": "air_38",
      "v": "air_42",
      "mode": "AIR",
      "name": "Delhi-Bangkok Air Route (DEL to BKK)",
      "distance_km": 2948.0,
      "transit_days": 0.2,
      "freight_cost_usd": 4915.04,
      "base_risk": 0.03
    },
    {
      "u": "air_21",
      "v": "air_39",
      "mode": "AIR",
      "name": "Malaysian Strait Air Shuttle (SIN to KUL)",
      "distance_km": 296.8,
      "transit_days": 0.2,
      "freight_cost_usd": 3559.36,
      "base_risk": 0.01
    },
    {
      "u": "air_39",
      "v": "air_21",
      "mode": "AIR",
      "name": "Malaysian Strait Air Shuttle (SIN to KUL)",
      "distance_km": 296.8,
      "transit_days": 0.2,
      "freight_cost_usd": 3559.36,
      "base_risk": 0.01
    },
    {
      "u": "air_39",
      "v": "air_38",
      "mode": "AIR",
      "name": "ASEAN Air Corridor (KUL to BKK)",
      "distance_km": 1221.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3927.35,
      "base_risk": 0.02
    },
    {
      "u": "air_38",
      "v": "air_39",
      "mode": "AIR",
      "name": "ASEAN Air Corridor (KUL to BKK)",
      "distance_km": 1221.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3927.35,
      "base_risk": 0.02
    },
    {
      "u": "air_38",
      "v": "air_41",
      "mode": "AIR",
      "name": "Indochina Air Link (BKK to SGN)",
      "distance_km": 716.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3714.83,
      "base_risk": 0.02
    },
    {
      "u": "air_41",
      "v": "air_38",
      "mode": "AIR",
      "name": "Indochina Air Link (BKK to SGN)",
      "distance_km": 716.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3714.83,
      "base_risk": 0.02
    },
    {
      "u": "air_41",
      "v": "air_40",
      "mode": "AIR",
      "name": "Vietnam North-South Artery (SGN to HAN)",
      "distance_km": 1159.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3905.97,
      "base_risk": 0.02
    },
    {
      "u": "air_40",
      "v": "air_41",
      "mode": "AIR",
      "name": "Vietnam North-South Artery (SGN to HAN)",
      "distance_km": 1159.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3905.97,
      "base_risk": 0.02
    },
    {
      "u": "air_40",
      "v": "air_16",
      "mode": "AIR",
      "name": "Vietnam-China Cargo Express (HAN to CAN)",
      "distance_km": 807.3,
      "transit_days": 0.2,
      "freight_cost_usd": 3758.34,
      "base_risk": 0.02
    },
    {
      "u": "air_16",
      "v": "air_40",
      "mode": "AIR",
      "name": "Vietnam-China Cargo Express (HAN to CAN)",
      "distance_km": 807.3,
      "transit_days": 0.2,
      "freight_cost_usd": 3758.34,
      "base_risk": 0.02
    },
    {
      "u": "air_16",
      "v": "air_17",
      "mode": "AIR",
      "name": "Pearl River Aviation Shuttles (CAN to SZX)",
      "distance_km": 98.4,
      "transit_days": 0.2,
      "freight_cost_usd": 3514.76,
      "base_risk": 0.01
    },
    {
      "u": "air_17",
      "v": "air_16",
      "mode": "AIR",
      "name": "Pearl River Aviation Shuttles (CAN to SZX)",
      "distance_km": 98.4,
      "transit_days": 0.2,
      "freight_cost_usd": 3514.76,
      "base_risk": 0.01
    },
    {
      "u": "air_17",
      "v": "air_01",
      "mode": "AIR",
      "name": "Greater Bay Air Corridor (SZX to HKG)",
      "distance_km": 38.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3504.57,
      "base_risk": 0.01
    },
    {
      "u": "air_01",
      "v": "air_17",
      "mode": "AIR",
      "name": "Greater Bay Air Corridor (SZX to HKG)",
      "distance_km": 38.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3504.57,
      "base_risk": 0.01
    },
    {
      "u": "air_01",
      "v": "air_03",
      "mode": "AIR",
      "name": "Hong Kong - Shanghai Cargo Expressway (HKG to PVG)",
      "distance_km": 1255.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3977.24,
      "base_risk": 0.02
    },
    {
      "u": "air_03",
      "v": "air_01",
      "mode": "AIR",
      "name": "Hong Kong - Shanghai Cargo Expressway (HKG to PVG)",
      "distance_km": 1255.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3977.24,
      "base_risk": 0.02
    },
    {
      "u": "air_03",
      "v": "air_22",
      "mode": "AIR",
      "name": "China North-South Air Artery (PVG to PEK)",
      "distance_km": 1100.2,
      "transit_days": 0.2,
      "freight_cost_usd": 3918.08,
      "base_risk": 0.02
    },
    {
      "u": "air_22",
      "v": "air_03",
      "mode": "AIR",
      "name": "China North-South Air Artery (PVG to PEK)",
      "distance_km": 1100.2,
      "transit_days": 0.2,
      "freight_cost_usd": 3918.08,
      "base_risk": 0.02
    },
    {
      "u": "air_03",
      "v": "air_05",
      "mode": "AIR",
      "name": "Yellow Sea Air Express (PVG to ICN)",
      "distance_km": 821.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3787.39,
      "base_risk": 0.02
    },
    {
      "u": "air_05",
      "v": "air_03",
      "mode": "AIR",
      "name": "Yellow Sea Air Express (PVG to ICN)",
      "distance_km": 821.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3787.39,
      "base_risk": 0.02
    },
    {
      "u": "air_05",
      "v": "air_26",
      "mode": "AIR",
      "name": "Seoul-Tokyo Air Shuttle (ICN to HND)",
      "distance_km": 1210.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3923.5,
      "base_risk": 0.02
    },
    {
      "u": "air_26",
      "v": "air_05",
      "mode": "AIR",
      "name": "Seoul-Tokyo Air Shuttle (ICN to HND)",
      "distance_km": 1210.0,
      "transit_days": 0.2,
      "freight_cost_usd": 3923.5,
      "base_risk": 0.02
    },
    {
      "u": "air_26",
      "v": "air_10",
      "mode": "AIR",
      "name": "Tokyo Cargo Gateways (HND to NRT)",
      "distance_km": 59.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3505.99,
      "base_risk": 0.01
    },
    {
      "u": "air_10",
      "v": "air_26",
      "mode": "AIR",
      "name": "Tokyo Cargo Gateways (HND to NRT)",
      "distance_km": 59.9,
      "transit_days": 0.2,
      "freight_cost_usd": 3505.99,
      "base_risk": 0.01
    },
    {
      "u": "air_10",
      "v": "air_27",
      "mode": "AIR",
      "name": "Japan Kansai Cargo Corridor (NRT to KIX)",
      "distance_km": 492.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3637.79,
      "base_risk": 0.02
    },
    {
      "u": "air_27",
      "v": "air_10",
      "mode": "AIR",
      "name": "Japan Kansai Cargo Corridor (NRT to KIX)",
      "distance_km": 492.1,
      "transit_days": 0.2,
      "freight_cost_usd": 3637.79,
      "base_risk": 0.02
    },
    {
      "u": "air_08",
      "v": "air_01",
      "mode": "AIR",
      "name": "Taiwan Strait Air Route (TPE to HKG)",
      "distance_km": 806.3,
      "transit_days": 0.2,
      "freight_cost_usd": 3741.89,
      "base_risk": 0.02
    },
    {
      "u": "air_01",
      "v": "air_08",
      "mode": "AIR",
      "name": "Taiwan Strait Air Route (TPE to HKG)",
      "distance_km": 806.3,
      "transit_days": 0.2,
      "freight_cost_usd": 3741.89,
      "base_risk": 0.02
    },
    {
      "u": "air_22",
      "v": "air_01",
      "mode": "AIR",
      "name": "Beijing to Hong Kong Air Corridor",
      "distance_km": 1991.9,
      "transit_days": 0.2,
      "freight_cost_usd": 4256.92,
      "base_risk": 0.02
    },
    {
      "u": "air_01",
      "v": "air_22",
      "mode": "AIR",
      "name": "Beijing to Hong Kong Air Corridor",
      "distance_km": 1991.9,
      "transit_days": 0.2,
      "freight_cost_usd": 4256.92,
      "base_risk": 0.02
    },
    {
      "u": "air_07",
      "v": "air_46",
      "mode": "AIR",
      "name": "Caribbean Cargo Trunk (MIA to BOG)",
      "distance_km": 2435.7,
      "transit_days": 0.2,
      "freight_cost_usd": 4669.14,
      "base_risk": 0.03
    },
    {
      "u": "air_46",
      "v": "air_07",
      "mode": "AIR",
      "name": "Caribbean Cargo Trunk (MIA to BOG)",
      "distance_km": 2435.7,
      "transit_days": 0.2,
      "freight_cost_usd": 4669.14,
      "base_risk": 0.03
    },
    {
      "u": "air_46",
      "v": "air_45",
      "mode": "AIR",
      "name": "Amazon Cargo Artery (BOG to GRU)",
      "distance_km": 4335.8,
      "transit_days": 0.2,
      "freight_cost_usd": 5841.33,
      "base_risk": 0.03
    },
    {
      "u": "air_45",
      "v": "air_46",
      "mode": "AIR",
      "name": "Amazon Cargo Artery (BOG to GRU)",
      "distance_km": 4335.8,
      "transit_days": 0.2,
      "freight_cost_usd": 5841.33,
      "base_risk": 0.03
    },
    {
      "u": "air_45",
      "v": "air_47",
      "mode": "AIR",
      "name": "Southern Cone Cargo Expressway (GRU to SCL)",
      "distance_km": 2614.9,
      "transit_days": 0.2,
      "freight_cost_usd": 4676.7,
      "base_risk": 0.03
    },
    {
      "u": "air_47",
      "v": "air_45",
      "mode": "AIR",
      "name": "Southern Cone Cargo Expressway (GRU to SCL)",
      "distance_km": 2614.9,
      "transit_days": 0.2,
      "freight_cost_usd": 4676.7,
      "base_risk": 0.03
    },
    {
      "u": "air_46",
      "v": "air_47",
      "mode": "AIR",
      "name": "Andean Air Route (BOG to SCL)",
      "distance_km": 4250.2,
      "transit_days": 0.2,
      "freight_cost_usd": 5540.1,
      "base_risk": 0.03
    },
    {
      "u": "air_47",
      "v": "air_46",
      "mode": "AIR",
      "name": "Andean Air Route (BOG to SCL)",
      "distance_km": 4250.2,
      "transit_days": 0.2,
      "freight_cost_usd": 5540.1,
      "base_risk": 0.03
    },
    {
      "u": "air_50",
      "v": "air_49",
      "mode": "AIR",
      "name": "Nile-Rift Air Corridor (CAI to NBO)",
      "distance_km": 3544.6,
      "transit_days": 0.2,
      "freight_cost_usd": 5201.41,
      "base_risk": 0.04
    },
    {
      "u": "air_49",
      "v": "air_50",
      "mode": "AIR",
      "name": "Nile-Rift Air Corridor (CAI to NBO)",
      "distance_km": 3544.6,
      "transit_days": 0.2,
      "freight_cost_usd": 5201.41,
      "base_risk": 0.04
    },
    {
      "u": "air_49",
      "v": "air_48",
      "mode": "AIR",
      "name": "Sub-Saharan Air Artery (NBO to JNB)",
      "distance_km": 2911.3,
      "transit_days": 0.2,
      "freight_cost_usd": 4955.65,
      "base_risk": 0.04
    },
    {
      "u": "air_48",
      "v": "air_49",
      "mode": "AIR",
      "name": "Sub-Saharan Air Artery (NBO to JNB)",
      "distance_km": 2911.3,
      "transit_days": 0.2,
      "freight_cost_usd": 4955.65,
      "base_risk": 0.04
    },
    {
      "u": "air_13",
      "v": "air_48",
      "mode": "AIR",
      "name": "Middle East - Africa Express (DXB to JNB)",
      "distance_km": 6412.0,
      "transit_days": 0.3,
      "freight_cost_usd": 7218.96,
      "base_risk": 0.04
    },
    {
      "u": "air_48",
      "v": "air_13",
      "mode": "AIR",
      "name": "Middle East - Africa Express (DXB to JNB)",
      "distance_km": 6412.0,
      "transit_days": 0.3,
      "freight_cost_usd": 7218.96,
      "base_risk": 0.04
    },
    {
      "u": "air_11",
      "v": "air_50",
      "mode": "AIR",
      "name": "Europe to North Africa Trunk (FRA to CAI)",
      "distance_km": 2921.9,
      "transit_days": 0.2,
      "freight_cost_usd": 4814.85,
      "base_risk": 0.03
    },
    {
      "u": "air_50",
      "v": "air_11",
      "mode": "AIR",
      "name": "Europe to North Africa Trunk (FRA to CAI)",
      "distance_km": 2921.9,
      "transit_days": 0.2,
      "freight_cost_usd": 4814.85,
      "base_risk": 0.03
    },
    {
      "u": "rail_09",
      "v": "rail_08",
      "mode": "RAIL",
      "name": "Sichuan-Chongqing Intermodal Spur",
      "distance_km": 240.1,
      "transit_days": 0.2,
      "freight_cost_usd": 1228.81,
      "base_risk": 0.03
    },
    {
      "u": "rail_08",
      "v": "rail_09",
      "mode": "RAIL",
      "name": "Sichuan-Chongqing Intermodal Spur",
      "distance_km": 240.1,
      "transit_days": 0.2,
      "freight_cost_usd": 1228.81,
      "base_risk": 0.03
    },
    {
      "u": "rail_08",
      "v": "rail_10",
      "mode": "RAIL",
      "name": "Xi'an Inland Rail Arterial",
      "distance_km": 600.5,
      "transit_days": 0.2,
      "freight_cost_usd": 1272.06,
      "base_risk": 0.03
    },
    {
      "u": "rail_10",
      "v": "rail_08",
      "mode": "RAIL",
      "name": "Xi'an Inland Rail Arterial",
      "distance_km": 600.5,
      "transit_days": 0.2,
      "freight_cost_usd": 1272.06,
      "base_risk": 0.03
    },
    {
      "u": "rail_10",
      "v": "rail_02",
      "mode": "RAIL",
      "name": "Northern Silk Rail Corridor (Xi'an to Khorgos)",
      "distance_km": 2677.4,
      "transit_days": 1.2,
      "freight_cost_usd": 1601.61,
      "base_risk": 0.06
    },
    {
      "u": "rail_02",
      "v": "rail_10",
      "mode": "RAIL",
      "name": "Northern Silk Rail Corridor (Xi'an to Khorgos)",
      "distance_km": 2677.4,
      "transit_days": 1.2,
      "freight_cost_usd": 1601.61,
      "base_risk": 0.06
    },
    {
      "u": "rail_10",
      "v": "rail_03",
      "mode": "RAIL",
      "name": "Dostyk Alashankou Gateway Line",
      "distance_km": 2555.1,
      "transit_days": 1.2,
      "freight_cost_usd": 1583.26,
      "base_risk": 0.06
    },
    {
      "u": "rail_03",
      "v": "rail_10",
      "mode": "RAIL",
      "name": "Dostyk Alashankou Gateway Line",
      "distance_km": 2555.1,
      "transit_days": 1.2,
      "freight_cost_usd": 1583.26,
      "base_risk": 0.06
    },
    {
      "u": "rail_10",
      "v": "rail_05",
      "mode": "RAIL",
      "name": "Erenhot Mongolian Landbridge Trunk",
      "distance_km": 1062.3,
      "transit_days": 0.5,
      "freight_cost_usd": 1348.72,
      "base_risk": 0.04
    },
    {
      "u": "rail_05",
      "v": "rail_10",
      "mode": "RAIL",
      "name": "Erenhot Mongolian Landbridge Trunk",
      "distance_km": 1062.3,
      "transit_days": 0.5,
      "freight_cost_usd": 1348.72,
      "base_risk": 0.04
    },
    {
      "u": "rail_05",
      "v": "rail_04",
      "mode": "RAIL",
      "name": "Manzhouli Far East Link",
      "distance_km": 780.2,
      "transit_days": 0.4,
      "freight_cost_usd": 1309.23,
      "base_risk": 0.04
    },
    {
      "u": "rail_04",
      "v": "rail_05",
      "mode": "RAIL",
      "name": "Manzhouli Far East Link",
      "distance_km": 780.2,
      "transit_days": 0.4,
      "freight_cost_usd": 1309.23,
      "base_risk": 0.04
    },
    {
      "u": "rail_04",
      "v": "rail_44",
      "mode": "RAIL",
      "name": "Baikal-Amur Mainline Link",
      "distance_km": 780.6,
      "transit_days": 0.4,
      "freight_cost_usd": 1324.9,
      "base_risk": 0.07
    },
    {
      "u": "rail_44",
      "v": "rail_04",
      "mode": "RAIL",
      "name": "Baikal-Amur Mainline Link",
      "distance_km": 780.6,
      "transit_days": 0.4,
      "freight_cost_usd": 1324.9,
      "base_risk": 0.07
    },
    {
      "u": "rail_44",
      "v": "rail_43",
      "mode": "RAIL",
      "name": "Trans-Siberian Trunk Line",
      "distance_km": 2267.5,
      "transit_days": 1.2,
      "freight_cost_usd": 1585.47,
      "base_risk": 0.08
    },
    {
      "u": "rail_43",
      "v": "rail_44",
      "mode": "RAIL",
      "name": "Trans-Siberian Trunk Line",
      "distance_km": 2267.5,
      "transit_days": 1.2,
      "freight_cost_usd": 1585.47,
      "base_risk": 0.08
    },
    {
      "u": "rail_02",
      "v": "rail_01",
      "mode": "RAIL",
      "name": "Eurasian Northern Landbridge (Khorgos to Malaszewicze)",
      "distance_km": 4202.5,
      "transit_days": 2.1,
      "freight_cost_usd": 1956.45,
      "base_risk": 0.09
    },
    {
      "u": "rail_01",
      "v": "rail_02",
      "mode": "RAIL",
      "name": "Eurasian Northern Landbridge (Khorgos to Malaszewicze)",
      "distance_km": 4202.5,
      "transit_days": 2.1,
      "freight_cost_usd": 1956.45,
      "base_risk": 0.09
    },
    {
      "u": "rail_03",
      "v": "rail_01",
      "mode": "RAIL",
      "name": "Dostyk-Brest Gateway Corridor",
      "distance_km": 4274.7,
      "transit_days": 2.1,
      "freight_cost_usd": 1969.45,
      "base_risk": 0.09
    },
    {
      "u": "rail_01",
      "v": "rail_03",
      "mode": "RAIL",
      "name": "Dostyk-Brest Gateway Corridor",
      "distance_km": 4274.7,
      "transit_days": 2.1,
      "freight_cost_usd": 1969.45,
      "base_risk": 0.09
    },
    {
      "u": "rail_43",
      "v": "rail_01",
      "mode": "RAIL",
      "name": "Trans-Siberian to Malaszewicze Express",
      "distance_km": 3822.9,
      "transit_days": 1.9,
      "freight_cost_usd": 1888.12,
      "base_risk": 0.08
    },
    {
      "u": "rail_01",
      "v": "rail_43",
      "mode": "RAIL",
      "name": "Trans-Siberian to Malaszewicze Express",
      "distance_km": 3822.9,
      "transit_days": 1.9,
      "freight_cost_usd": 1888.12,
      "base_risk": 0.08
    },
    {
      "u": "rail_02",
      "v": "rail_12",
      "mode": "RAIL",
      "name": "Trans-Caspian Rail Route (Khorgos to Baku)",
      "distance_km": 2583.6,
      "transit_days": 1.3,
      "freight_cost_usd": 1613.38,
      "base_risk": 0.07
    },
    {
      "u": "rail_12",
      "v": "rail_02",
      "mode": "RAIL",
      "name": "Trans-Caspian Rail Route (Khorgos to Baku)",
      "distance_km": 2583.6,
      "transit_days": 1.3,
      "freight_cost_usd": 1613.38,
      "base_risk": 0.07
    },
    {
      "u": "rail_12",
      "v": "rail_13",
      "mode": "RAIL",
      "name": "Baku-Tbilisi-Poti Rail Corridor",
      "distance_km": 691.6,
      "transit_days": 0.3,
      "freight_cost_usd": 1296.82,
      "base_risk": 0.04
    },
    {
      "u": "rail_13",
      "v": "rail_12",
      "mode": "RAIL",
      "name": "Baku-Tbilisi-Poti Rail Corridor",
      "distance_km": 691.6,
      "transit_days": 0.3,
      "freight_cost_usd": 1296.82,
      "base_risk": 0.04
    },
    {
      "u": "rail_13",
      "v": "rail_14",
      "mode": "RAIL",
      "name": "BTK Railway Corridor (Poti to Kars)",
      "distance_km": 209.6,
      "transit_days": 0.2,
      "freight_cost_usd": 1229.34,
      "base_risk": 0.04
    },
    {
      "u": "rail_14",
      "v": "rail_13",
      "mode": "RAIL",
      "name": "BTK Railway Corridor (Poti to Kars)",
      "distance_km": 209.6,
      "transit_days": 0.2,
      "freight_cost_usd": 1229.34,
      "base_risk": 0.04
    },
    {
      "u": "rail_14",
      "v": "rail_20",
      "mode": "RAIL",
      "name": "Anatolian Rail to Balkan Corridor",
      "distance_km": 2415.6,
      "transit_days": 1.1,
      "freight_cost_usd": 1562.34,
      "base_risk": 0.05
    },
    {
      "u": "rail_20",
      "v": "rail_14",
      "mode": "RAIL",
      "name": "Anatolian Rail to Balkan Corridor",
      "distance_km": 2415.6,
      "transit_days": 1.1,
      "freight_cost_usd": 1562.34,
      "base_risk": 0.05
    },
    {
      "u": "rail_08",
      "v": "rail_25",
      "mode": "RAIL",
      "name": "Kunming-Mohan Southward Rail Spine",
      "distance_km": 1098.7,
      "transit_days": 0.5,
      "freight_cost_usd": 1331.84,
      "base_risk": 0.03
    },
    {
      "u": "rail_25",
      "v": "rail_08",
      "mode": "RAIL",
      "name": "Kunming-Mohan Southward Rail Spine",
      "distance_km": 1098.7,
      "transit_days": 0.5,
      "freight_cost_usd": 1331.84,
      "base_risk": 0.03
    },
    {
      "u": "rail_25",
      "v": "rail_26",
      "mode": "RAIL",
      "name": "Boten-Vientiane Railway (Laos-China Rail)",
      "distance_km": 379.3,
      "transit_days": 0.2,
      "freight_cost_usd": 1237.93,
      "base_risk": 0.02
    },
    {
      "u": "rail_26",
      "v": "rail_25",
      "mode": "RAIL",
      "name": "Boten-Vientiane Railway (Laos-China Rail)",
      "distance_km": 379.3,
      "transit_days": 0.2,
      "freight_cost_usd": 1237.93,
      "base_risk": 0.02
    },
    {
      "u": "rail_26",
      "v": "rail_27",
      "mode": "RAIL",
      "name": "Thailand-Malaysia Rail Link (Vientiane to Padang Besar)",
      "distance_km": 1277.7,
      "transit_days": 0.6,
      "freight_cost_usd": 1353.32,
      "base_risk": 0.03
    },
    {
      "u": "rail_27",
      "v": "rail_26",
      "mode": "RAIL",
      "name": "Thailand-Malaysia Rail Link (Vientiane to Padang Besar)",
      "distance_km": 1277.7,
      "transit_days": 0.6,
      "freight_cost_usd": 1353.32,
      "base_risk": 0.03
    },
    {
      "u": "rail_27",
      "v": "sea_31",
      "mode": "INTERMODAL",
      "name": "Padang Besar to Tanjung Pelepas Railhead",
      "distance_km": 689.6,
      "transit_days": 0.5,
      "freight_cost_usd": 841.38,
      "base_risk": 0.02
    },
    {
      "u": "sea_31",
      "v": "rail_27",
      "mode": "INTERMODAL",
      "name": "Padang Besar to Tanjung Pelepas Railhead",
      "distance_km": 689.6,
      "transit_days": 0.5,
      "freight_cost_usd": 841.38,
      "base_risk": 0.02
    },
    {
      "u": "rail_01",
      "v": "rail_11",
      "mode": "RAIL",
      "name": "Polish Rail Artery (Malaszewicze to Lodz)",
      "distance_km": 280.7,
      "transit_days": 0.2,
      "freight_cost_usd": 1228.07,
      "base_risk": 0.02
    },
    {
      "u": "rail_11",
      "v": "rail_01",
      "mode": "RAIL",
      "name": "Polish Rail Artery (Malaszewicze to Lodz)",
      "distance_km": 280.7,
      "transit_days": 0.2,
      "freight_cost_usd": 1228.07,
      "base_risk": 0.02
    },
    {
      "u": "rail_11",
      "v": "rail_24",
      "mode": "RAIL",
      "name": "Poland-Germany Border Corridor (Lodz to Frankfurt Oder)",
      "distance_km": 343.2,
      "transit_days": 0.2,
      "freight_cost_usd": 1234.32,
      "base_risk": 0.02
    },
    {
      "u": "rail_24",
      "v": "rail_11",
      "mode": "RAIL",
      "name": "Poland-Germany Border Corridor (Lodz to Frankfurt Oder)",
      "distance_km": 343.2,
      "transit_days": 0.2,
      "freight_cost_usd": 1234.32,
      "base_risk": 0.02
    },
    {
      "u": "rail_24",
      "v": "rail_07",
      "mode": "RAIL",
      "name": "North German Rail Trunk (Frankfurt Oder to Hamburg Billwerder)",
      "distance_km": 322.9,
      "transit_days": 0.2,
      "freight_cost_usd": 1232.29,
      "base_risk": 0.02
    },
    {
      "u": "rail_07",
      "v": "rail_24",
      "mode": "RAIL",
      "name": "North German Rail Trunk (Frankfurt Oder to Hamburg Billwerder)",
      "distance_km": 322.9,
      "transit_days": 0.2,
      "freight_cost_usd": 1232.29,
      "base_risk": 0.02
    },
    {
      "u": "rail_07",
      "v": "rail_06",
      "mode": "RAIL",
      "name": "Hamburg to Duisburg Ruhr Artery",
      "distance_km": 324.6,
      "transit_days": 0.2,
      "freight_cost_usd": 1232.46,
      "base_risk": 0.02
    },
    {
      "u": "rail_06",
      "v": "rail_07",
      "mode": "RAIL",
      "name": "Hamburg to Duisburg Ruhr Artery",
      "distance_km": 324.6,
      "transit_days": 0.2,
      "freight_cost_usd": 1232.46,
      "base_risk": 0.02
    },
    {
      "u": "rail_06",
      "v": "rail_19",
      "mode": "RAIL",
      "name": "Betuweroute Cross-Border Rail Link",
      "distance_km": 113.4,
      "transit_days": 0.2,
      "freight_cost_usd": 1210.21,
      "base_risk": 0.02
    },
    {
      "u": "rail_19",
      "v": "rail_06",
      "mode": "RAIL",
      "name": "Betuweroute Cross-Border Rail Link",
      "distance_km": 113.4,
      "transit_days": 0.2,
      "freight_cost_usd": 1210.21,
      "base_risk": 0.02
    },
    {
      "u": "rail_19",
      "v": "rail_18",
      "mode": "RAIL",
      "name": "Channel Tunnel Freight Corridor",
      "distance_km": 279.8,
      "transit_days": 0.2,
      "freight_cost_usd": 1233.58,
      "base_risk": 0.03
    },
    {
      "u": "rail_18",
      "v": "rail_19",
      "mode": "RAIL",
      "name": "Channel Tunnel Freight Corridor",
      "distance_km": 279.8,
      "transit_days": 0.2,
      "freight_cost_usd": 1233.58,
      "base_risk": 0.03
    },
    {
      "u": "rail_06",
      "v": "rail_15",
      "mode": "RAIL",
      "name": "Rhine-Alpine Rail Corridor (Gotthard)",
      "distance_km": 567.1,
      "transit_days": 0.2,
      "freight_cost_usd": 1268.05,
      "base_risk": 0.03
    },
    {
      "u": "rail_15",
      "v": "rail_06",
      "mode": "RAIL",
      "name": "Rhine-Alpine Rail Corridor (Gotthard)",
      "distance_km": 567.1,
      "transit_days": 0.2,
      "freight_cost_usd": 1268.05,
      "base_risk": 0.03
    },
    {
      "u": "rail_15",
      "v": "rail_17",
      "mode": "RAIL",
      "name": "Swiss Alpine Base Tunnel Interconnect",
      "distance_km": 81.2,
      "transit_days": 0.2,
      "freight_cost_usd": 1209.74,
      "base_risk": 0.03
    },
    {
      "u": "rail_17",
      "v": "rail_15",
      "mode": "RAIL",
      "name": "Swiss Alpine Base Tunnel Interconnect",
      "distance_km": 81.2,
      "transit_days": 0.2,
      "freight_cost_usd": 1209.74,
      "base_risk": 0.03
    },
    {
      "u": "rail_15",
      "v": "rail_16",
      "mode": "RAIL",
      "name": "Gotthard to Brenner Pass Alpine Rail Link",
      "distance_km": 214.2,
      "transit_days": 0.2,
      "freight_cost_usd": 1223.56,
      "base_risk": 0.02
    },
    {
      "u": "rail_16",
      "v": "rail_15",
      "mode": "RAIL",
      "name": "Gotthard to Brenner Pass Alpine Rail Link",
      "distance_km": 214.2,
      "transit_days": 0.2,
      "freight_cost_usd": 1223.56,
      "base_risk": 0.02
    },
    {
      "u": "rail_16",
      "v": "rail_21",
      "mode": "RAIL",
      "name": "Brenner Pass to Verona Quadrante Europa",
      "distance_km": 183.6,
      "transit_days": 0.2,
      "freight_cost_usd": 1220.2,
      "base_risk": 0.02
    },
    {
      "u": "rail_21",
      "v": "rail_16",
      "mode": "RAIL",
      "name": "Brenner Pass to Verona Quadrante Europa",
      "distance_km": 183.6,
      "transit_days": 0.2,
      "freight_cost_usd": 1220.2,
      "base_risk": 0.02
    },
    {
      "u": "rail_21",
      "v": "rail_20",
      "mode": "RAIL",
      "name": "Verona to Port of Koper Freight Corridor",
      "distance_km": 239.4,
      "transit_days": 0.2,
      "freight_cost_usd": 1226.33,
      "base_risk": 0.02
    },
    {
      "u": "rail_20",
      "v": "rail_21",
      "mode": "RAIL",
      "name": "Verona to Port of Koper Freight Corridor",
      "distance_km": 239.4,
      "transit_days": 0.2,
      "freight_cost_usd": 1226.33,
      "base_risk": 0.02
    },
    {
      "u": "rail_20",
      "v": "rail_22",
      "mode": "RAIL",
      "name": "Adriatic to Vienna Rail Trunk",
      "distance_km": 328.3,
      "transit_days": 0.2,
      "freight_cost_usd": 1236.11,
      "base_risk": 0.02
    },
    {
      "u": "rail_22",
      "v": "rail_20",
      "mode": "RAIL",
      "name": "Adriatic to Vienna Rail Trunk",
      "distance_km": 328.3,
      "transit_days": 0.2,
      "freight_cost_usd": 1236.11,
      "base_risk": 0.02
    },
    {
      "u": "rail_22",
      "v": "rail_23",
      "mode": "RAIL",
      "name": "Vienna to Ceska Trebova Rail Corridor",
      "distance_km": 195.8,
      "transit_days": 0.2,
      "freight_cost_usd": 1219.58,
      "base_risk": 0.02
    },
    {
      "u": "rail_23",
      "v": "rail_22",
      "mode": "RAIL",
      "name": "Vienna to Ceska Trebova Rail Corridor",
      "distance_km": 195.8,
      "transit_days": 0.2,
      "freight_cost_usd": 1219.58,
      "base_risk": 0.02
    },
    {
      "u": "rail_23",
      "v": "rail_24",
      "mode": "RAIL",
      "name": "Ceska Trebova to Frankfurt Oder Link",
      "distance_km": 302.3,
      "transit_days": 0.2,
      "freight_cost_usd": 1230.23,
      "base_risk": 0.02
    },
    {
      "u": "rail_24",
      "v": "rail_23",
      "mode": "RAIL",
      "name": "Ceska Trebova to Frankfurt Oder Link",
      "distance_km": 302.3,
      "transit_days": 0.2,
      "freight_cost_usd": 1230.23,
      "base_risk": 0.02
    },
    {
      "u": "rail_37",
      "v": "rail_38",
      "mode": "RAIL",
      "name": "Dadri to Rewari-Madar DFC Spine",
      "distance_km": 207.7,
      "transit_days": 0.2,
      "freight_cost_usd": 1216.62,
      "base_risk": 0.02
    },
    {
      "u": "rail_38",
      "v": "rail_37",
      "mode": "RAIL",
      "name": "Dadri to Rewari-Madar DFC Spine",
      "distance_km": 207.7,
      "transit_days": 0.2,
      "freight_cost_usd": 1216.62,
      "base_risk": 0.02
    },
    {
      "u": "rail_38",
      "v": "rail_40",
      "mode": "RAIL",
      "name": "Rewari to Khatuwas Intermodal DFC",
      "distance_km": 80.4,
      "transit_days": 0.2,
      "freight_cost_usd": 1206.43,
      "base_risk": 0.02
    },
    {
      "u": "rail_40",
      "v": "rail_38",
      "mode": "RAIL",
      "name": "Rewari to Khatuwas Intermodal DFC",
      "distance_km": 80.4,
      "transit_days": 0.2,
      "freight_cost_usd": 1206.43,
      "base_risk": 0.02
    },
    {
      "u": "rail_40",
      "v": "rail_39",
      "mode": "RAIL",
      "name": "Khatuwas to Sanand Gujarat DFC Trunk",
      "distance_km": 689.1,
      "transit_days": 0.3,
      "freight_cost_usd": 1262.02,
      "base_risk": 0.02
    },
    {
      "u": "rail_39",
      "v": "rail_40",
      "mode": "RAIL",
      "name": "Khatuwas to Sanand Gujarat DFC Trunk",
      "distance_km": 689.1,
      "transit_days": 0.3,
      "freight_cost_usd": 1262.02,
      "base_risk": 0.02
    },
    {
      "u": "rail_39",
      "v": "sea_42",
      "mode": "INTERMODAL",
      "name": "Sanand to Mundra Port Rail Corridor",
      "distance_km": 275.9,
      "transit_days": 0.2,
      "freight_cost_usd": 813.79,
      "base_risk": 0.01
    },
    {
      "u": "sea_42",
      "v": "rail_39",
      "mode": "INTERMODAL",
      "name": "Sanand to Mundra Port Rail Corridor",
      "distance_km": 275.9,
      "transit_days": 0.2,
      "freight_cost_usd": 813.79,
      "base_risk": 0.01
    },
    {
      "u": "rail_39",
      "v": "sea_41",
      "mode": "INTERMODAL",
      "name": "Sanand to JNPT Mumbai DFC Terminal",
      "distance_km": 452.0,
      "transit_days": 0.3,
      "freight_cost_usd": 827.12,
      "base_risk": 0.01
    },
    {
      "u": "sea_41",
      "v": "rail_39",
      "mode": "INTERMODAL",
      "name": "Sanand to JNPT Mumbai DFC Terminal",
      "distance_km": 452.0,
      "transit_days": 0.3,
      "freight_cost_usd": 827.12,
      "base_risk": 0.01
    },
    {
      "u": "rail_37",
      "v": "rail_42",
      "mode": "RAIL",
      "name": "Eastern DFC Northern Leg (Dadri to Mughalsarai)",
      "distance_km": 661.1,
      "transit_days": 0.3,
      "freight_cost_usd": 1259.5,
      "base_risk": 0.03
    },
    {
      "u": "rail_42",
      "v": "rail_37",
      "mode": "RAIL",
      "name": "Eastern DFC Northern Leg (Dadri to Mughalsarai)",
      "distance_km": 661.1,
      "transit_days": 0.3,
      "freight_cost_usd": 1259.5,
      "base_risk": 0.03
    },
    {
      "u": "rail_42",
      "v": "rail_41",
      "mode": "RAIL",
      "name": "Eastern DFC Mainline (Mughalsarai to Dankuni)",
      "distance_km": 599.5,
      "transit_days": 0.2,
      "freight_cost_usd": 1253.95,
      "base_risk": 0.03
    },
    {
      "u": "rail_41",
      "v": "rail_42",
      "mode": "RAIL",
      "name": "Eastern DFC Mainline (Mughalsarai to Dankuni)",
      "distance_km": 599.5,
      "transit_days": 0.2,
      "freight_cost_usd": 1253.95,
      "base_risk": 0.03
    },
    {
      "u": "rail_41",
      "v": "sea_41",
      "mode": "INTERMODAL",
      "name": "Trans-India Freight Spine (Dankuni to JNPT)",
      "distance_km": 1646.5,
      "transit_days": 0.8,
      "freight_cost_usd": 964.65,
      "base_risk": 0.03
    },
    {
      "u": "sea_41",
      "v": "rail_41",
      "mode": "INTERMODAL",
      "name": "Trans-India Freight Spine (Dankuni to JNPT)",
      "distance_km": 1646.5,
      "transit_days": 0.8,
      "freight_cost_usd": 964.65,
      "base_risk": 0.03
    },
    {
      "u": "rail_28",
      "v": "rail_31",
      "mode": "RAIL",
      "name": "Transcon Mainline (Chicago to Kansas City)",
      "distance_km": 663.3,
      "transit_days": 0.3,
      "freight_cost_usd": 1272.96,
      "base_risk": 0.02
    },
    {
      "u": "rail_31",
      "v": "rail_28",
      "mode": "RAIL",
      "name": "Transcon Mainline (Chicago to Kansas City)",
      "distance_km": 663.3,
      "transit_days": 0.3,
      "freight_cost_usd": 1272.96,
      "base_risk": 0.02
    },
    {
      "u": "rail_31",
      "v": "rail_32",
      "mode": "RAIL",
      "name": "Mid-America Rail Corridor (KC to Alliance TX)",
      "distance_km": 723.6,
      "transit_days": 0.3,
      "freight_cost_usd": 1279.6,
      "base_risk": 0.02
    },
    {
      "u": "rail_32",
      "v": "rail_31",
      "mode": "RAIL",
      "name": "Mid-America Rail Corridor (KC to Alliance TX)",
      "distance_km": 723.6,
      "transit_days": 0.3,
      "freight_cost_usd": 1279.6,
      "base_risk": 0.02
    },
    {
      "u": "rail_32",
      "v": "rail_29",
      "mode": "RAIL",
      "name": "Texas Border Rail Gateway (Alliance to Laredo)",
      "distance_km": 644.3,
      "transit_days": 0.3,
      "freight_cost_usd": 1264.43,
      "base_risk": 0.02
    },
    {
      "u": "rail_29",
      "v": "rail_32",
      "mode": "RAIL",
      "name": "Texas Border Rail Gateway (Alliance to Laredo)",
      "distance_km": 644.3,
      "transit_days": 0.3,
      "freight_cost_usd": 1264.43,
      "base_risk": 0.02
    },
    {
      "u": "rail_29",
      "v": "rail_30",
      "mode": "RAIL",
      "name": "Border Twin Intermodal Connector (Laredo to Eagle Pass)",
      "distance_km": 166.5,
      "transit_days": 0.2,
      "freight_cost_usd": 1208.33,
      "base_risk": 0.01
    },
    {
      "u": "rail_30",
      "v": "rail_29",
      "mode": "RAIL",
      "name": "Border Twin Intermodal Connector (Laredo to Eagle Pass)",
      "distance_km": 166.5,
      "transit_days": 0.2,
      "freight_cost_usd": 1208.33,
      "base_risk": 0.01
    },
    {
      "u": "rail_30",
      "v": "rail_32",
      "mode": "RAIL",
      "name": "Eagle Pass to Alliance TX Direct Line",
      "distance_km": 563.5,
      "transit_days": 0.2,
      "freight_cost_usd": 1256.35,
      "base_risk": 0.02
    },
    {
      "u": "rail_32",
      "v": "rail_30",
      "mode": "RAIL",
      "name": "Eagle Pass to Alliance TX Direct Line",
      "distance_km": 563.5,
      "transit_days": 0.2,
      "freight_cost_usd": 1256.35,
      "base_risk": 0.02
    },
    {
      "u": "rail_28",
      "v": "rail_34",
      "mode": "RAIL",
      "name": "Illinois Central Corridor (Chicago to Memphis)",
      "distance_km": 777.3,
      "transit_days": 0.3,
      "freight_cost_usd": 1277.73,
      "base_risk": 0.02
    },
    {
      "u": "rail_34",
      "v": "rail_28",
      "mode": "RAIL",
      "name": "Illinois Central Corridor (Chicago to Memphis)",
      "distance_km": 777.3,
      "transit_days": 0.3,
      "freight_cost_usd": 1277.73,
      "base_risk": 0.02
    },
    {
      "u": "rail_31",
      "v": "rail_33",
      "mode": "RAIL",
      "name": "BNSF Southern Transcon (KC to LA Hobart)",
      "distance_km": 2177.0,
      "transit_days": 0.9,
      "freight_cost_usd": 1461.24,
      "base_risk": 0.02
    },
    {
      "u": "rail_33",
      "v": "rail_31",
      "mode": "RAIL",
      "name": "BNSF Southern Transcon (KC to LA Hobart)",
      "distance_km": 2177.0,
      "transit_days": 0.9,
      "freight_cost_usd": 1461.24,
      "base_risk": 0.02
    },
    {
      "u": "rail_28",
      "v": "rail_35",
      "mode": "RAIL",
      "name": "Great Lakes Rail Corridor (Chicago to Detroit/Windsor)",
      "distance_km": 382.1,
      "transit_days": 0.2,
      "freight_cost_usd": 1234.39,
      "base_risk": 0.02
    },
    {
      "u": "rail_35",
      "v": "rail_28",
      "mode": "RAIL",
      "name": "Great Lakes Rail Corridor (Chicago to Detroit/Windsor)",
      "distance_km": 382.1,
      "transit_days": 0.2,
      "freight_cost_usd": 1234.39,
      "base_risk": 0.02
    },
    {
      "u": "rail_28",
      "v": "rail_36",
      "mode": "RAIL",
      "name": "Midwest to Canada Link (Chicago to Int Falls)",
      "distance_km": 873.6,
      "transit_days": 0.4,
      "freight_cost_usd": 1296.1,
      "base_risk": 0.02
    },
    {
      "u": "rail_36",
      "v": "rail_28",
      "mode": "RAIL",
      "name": "Midwest to Canada Link (Chicago to Int Falls)",
      "distance_km": 873.6,
      "transit_days": 0.4,
      "freight_cost_usd": 1296.1,
      "base_risk": 0.02
    },
    {
      "u": "rail_35",
      "v": "sea_45",
      "mode": "INTERMODAL",
      "name": "Detroit Tunnel to NY/NJ Port Intermodal",
      "distance_km": 765.0,
      "transit_days": 0.4,
      "freight_cost_usd": 861.2,
      "base_risk": 0.02
    },
    {
      "u": "sea_45",
      "v": "rail_35",
      "mode": "INTERMODAL",
      "name": "Detroit Tunnel to NY/NJ Port Intermodal",
      "distance_km": 765.0,
      "transit_days": 0.4,
      "freight_cost_usd": 861.2,
      "base_risk": 0.02
    },
    {
      "u": "rail_45",
      "v": "rail_46",
      "mode": "RAIL",
      "name": "Trans-Australian Freight Corridor (Pilbara to Parkes)",
      "distance_km": 3190.3,
      "transit_days": 1.5,
      "freight_cost_usd": 1646.64,
      "base_risk": 0.04
    },
    {
      "u": "rail_46",
      "v": "rail_45",
      "mode": "RAIL",
      "name": "Trans-Australian Freight Corridor (Pilbara to Parkes)",
      "distance_km": 3190.3,
      "transit_days": 1.5,
      "freight_cost_usd": 1646.64,
      "base_risk": 0.04
    },
    {
      "u": "rail_47",
      "v": "rail_50",
      "mode": "RAIL",
      "name": "East African Inter-Railway (Mombasa to TAZARA)",
      "distance_km": 901.9,
      "transit_days": 0.5,
      "freight_cost_usd": 1326.27,
      "base_risk": 0.04
    },
    {
      "u": "rail_50",
      "v": "rail_47",
      "mode": "RAIL",
      "name": "East African Inter-Railway (Mombasa to TAZARA)",
      "distance_km": 901.9,
      "transit_days": 0.5,
      "freight_cost_usd": 1326.27,
      "base_risk": 0.04
    },
    {
      "u": "rail_50",
      "v": "rail_48",
      "mode": "RAIL",
      "name": "Southern African Rail Corridor (TAZARA to Sishen)",
      "distance_km": 2792.2,
      "transit_days": 1.4,
      "freight_cost_usd": 1590.91,
      "base_risk": 0.04
    },
    {
      "u": "rail_48",
      "v": "rail_50",
      "mode": "RAIL",
      "name": "Southern African Rail Corridor (TAZARA to Sishen)",
      "distance_km": 2792.2,
      "transit_days": 1.4,
      "freight_cost_usd": 1590.91,
      "base_risk": 0.04
    },
    {
      "u": "rail_49",
      "v": "sea_47",
      "mode": "INTERMODAL",
      "name": "Caraj\u00e1s Heavy Rail to Port of Santos",
      "distance_km": 2226.9,
      "transit_days": 1.2,
      "freight_cost_usd": 1022.69,
      "base_risk": 0.02
    },
    {
      "u": "sea_47",
      "v": "rail_49",
      "mode": "INTERMODAL",
      "name": "Caraj\u00e1s Heavy Rail to Port of Santos",
      "distance_km": 2226.9,
      "transit_days": 1.2,
      "freight_cost_usd": 1022.69,
      "base_risk": 0.02
    },
    {
      "u": "sea_41",
      "v": "air_43",
      "mode": "INTERMODAL",
      "name": "Mumbai Port-Airport Air-Sea Link",
      "distance_km": 17.7,
      "transit_days": 0.2,
      "freight_cost_usd": 800.88,
      "base_risk": 0.01
    },
    {
      "u": "air_43",
      "v": "sea_41",
      "mode": "INTERMODAL",
      "name": "Mumbai Port-Airport Air-Sea Link",
      "distance_km": 17.7,
      "transit_days": 0.2,
      "freight_cost_usd": 800.88,
      "base_risk": 0.01
    },
    {
      "u": "rail_37",
      "v": "air_42",
      "mode": "INTERMODAL",
      "name": "Delhi NCR Multimodal Logistics Airhead",
      "distance_km": 44.0,
      "transit_days": 0.2,
      "freight_cost_usd": 801.76,
      "base_risk": 0.01
    },
    {
      "u": "air_42",
      "v": "rail_37",
      "mode": "INTERMODAL",
      "name": "Delhi NCR Multimodal Logistics Airhead",
      "distance_km": 44.0,
      "transit_days": 0.2,
      "freight_cost_usd": 801.76,
      "base_risk": 0.01
    },
    {
      "u": "rail_41",
      "v": "air_44",
      "mode": "INTERMODAL",
      "name": "India East-South Multimodal Bridge",
      "distance_km": 1536.2,
      "transit_days": 1.1,
      "freight_cost_usd": 922.9,
      "base_risk": 0.02
    },
    {
      "u": "air_44",
      "v": "rail_41",
      "mode": "INTERMODAL",
      "name": "India East-South Multimodal Bridge",
      "distance_km": 1536.2,
      "transit_days": 1.1,
      "freight_cost_usd": 922.9,
      "base_risk": 0.02
    },
    {
      "u": "sea_21",
      "v": "air_03",
      "mode": "INTERMODAL",
      "name": "Shanghai Yangshan-Pudong Air-Sea Bridge",
      "distance_km": 61.5,
      "transit_days": 0.2,
      "freight_cost_usd": 803.08,
      "base_risk": 0.01
    },
    {
      "u": "air_03",
      "v": "sea_21",
      "mode": "INTERMODAL",
      "name": "Shanghai Yangshan-Pudong Air-Sea Bridge",
      "distance_km": 61.5,
      "transit_days": 0.2,
      "freight_cost_usd": 803.08,
      "base_risk": 0.01
    },
    {
      "u": "sea_28",
      "v": "air_01",
      "mode": "INTERMODAL",
      "name": "Hong Kong Maritime-Aviation Gateway",
      "distance_km": 21.9,
      "transit_days": 0.2,
      "freight_cost_usd": 800.88,
      "base_risk": 0.01
    },
    {
      "u": "air_01",
      "v": "sea_28",
      "mode": "INTERMODAL",
      "name": "Hong Kong Maritime-Aviation Gateway",
      "distance_km": 21.9,
      "transit_days": 0.2,
      "freight_cost_usd": 800.88,
      "base_risk": 0.01
    },
    {
      "u": "sea_24",
      "v": "air_17",
      "mode": "INTERMODAL",
      "name": "Shenzhen Yantian-Bao'an Logistics Link",
      "distance_km": 48.7,
      "transit_days": 0.2,
      "freight_cost_usd": 801.95,
      "base_risk": 0.01
    },
    {
      "u": "air_17",
      "v": "sea_24",
      "mode": "INTERMODAL",
      "name": "Shenzhen Yantian-Bao'an Logistics Link",
      "distance_km": 48.7,
      "transit_days": 0.2,
      "freight_cost_usd": 801.95,
      "base_risk": 0.01
    },
    {
      "u": "sea_22",
      "v": "air_21",
      "mode": "INTERMODAL",
      "name": "Singapore Changi-Jurong Multimodal Hub",
      "distance_km": 21.9,
      "transit_days": 0.2,
      "freight_cost_usd": 800.88,
      "base_risk": 0.01
    },
    {
      "u": "air_21",
      "v": "sea_22",
      "mode": "INTERMODAL",
      "name": "Singapore Changi-Jurong Multimodal Hub",
      "distance_km": 21.9,
      "transit_days": 0.2,
      "freight_cost_usd": 800.88,
      "base_risk": 0.01
    },
    {
      "u": "sea_26",
      "v": "air_05",
      "mode": "INTERMODAL",
      "name": "Busan-Incheon Transshipment Shuttle",
      "distance_km": 350.9,
      "transit_days": 0.2,
      "freight_cost_usd": 821.05,
      "base_risk": 0.02
    },
    {
      "u": "air_05",
      "v": "sea_26",
      "mode": "INTERMODAL",
      "name": "Busan-Incheon Transshipment Shuttle",
      "distance_km": 350.9,
      "transit_days": 0.2,
      "freight_cost_usd": 821.05,
      "base_risk": 0.02
    },
    {
      "u": "sea_21",
      "v": "rail_08",
      "mode": "INTERMODAL",
      "name": "Shanghai Port to Chengdu Rail Link",
      "distance_km": 1701.0,
      "transit_days": 0.9,
      "freight_cost_usd": 970.1,
      "base_risk": 0.02
    },
    {
      "u": "rail_08",
      "v": "sea_21",
      "mode": "INTERMODAL",
      "name": "Shanghai Port to Chengdu Rail Link",
      "distance_km": 1701.0,
      "transit_days": 0.9,
      "freight_cost_usd": 970.1,
      "base_risk": 0.02
    },
    {
      "u": "sea_28",
      "v": "rail_09",
      "mode": "INTERMODAL",
      "name": "Hong Kong to Chongqing Rail Corridor",
      "distance_km": 1121.1,
      "transit_days": 0.6,
      "freight_cost_usd": 912.11,
      "base_risk": 0.02
    },
    {
      "u": "rail_09",
      "v": "sea_28",
      "mode": "INTERMODAL",
      "name": "Hong Kong to Chongqing Rail Corridor",
      "distance_km": 1121.1,
      "transit_days": 0.6,
      "freight_cost_usd": 912.11,
      "base_risk": 0.02
    },
    {
      "u": "sea_43",
      "v": "rail_33",
      "mode": "INTERMODAL",
      "name": "Port of LA to Hobart Yard Intermodal Transfer",
      "distance_km": 29.8,
      "transit_days": 0.2,
      "freight_cost_usd": 800.89,
      "base_risk": 0.01
    },
    {
      "u": "rail_33",
      "v": "sea_43",
      "mode": "INTERMODAL",
      "name": "Port of LA to Hobart Yard Intermodal Transfer",
      "distance_km": 29.8,
      "transit_days": 0.2,
      "freight_cost_usd": 800.89,
      "base_risk": 0.01
    },
    {
      "u": "sea_44",
      "v": "rail_33",
      "mode": "INTERMODAL",
      "name": "Port of Long Beach to Hobart Yard Transfer",
      "distance_km": 26.7,
      "transit_days": 0.2,
      "freight_cost_usd": 800.8,
      "base_risk": 0.01
    },
    {
      "u": "rail_33",
      "v": "sea_44",
      "mode": "INTERMODAL",
      "name": "Port of Long Beach to Hobart Yard Transfer",
      "distance_km": 26.7,
      "transit_days": 0.2,
      "freight_cost_usd": 800.8,
      "base_risk": 0.01
    },
    {
      "u": "sea_43",
      "v": "air_09",
      "mode": "INTERMODAL",
      "name": "LAX Air-Sea Transfer Corridor",
      "distance_km": 25.7,
      "transit_days": 0.2,
      "freight_cost_usd": 801.03,
      "base_risk": 0.01
    },
    {
      "u": "air_09",
      "v": "sea_43",
      "mode": "INTERMODAL",
      "name": "LAX Air-Sea Transfer Corridor",
      "distance_km": 25.7,
      "transit_days": 0.2,
      "freight_cost_usd": 801.03,
      "base_risk": 0.01
    },
    {
      "u": "sea_45",
      "v": "air_30",
      "mode": "INTERMODAL",
      "name": "New York Harbor to JFK Air Cargo Gateway",
      "distance_km": 28.9,
      "transit_days": 0.2,
      "freight_cost_usd": 801.16,
      "base_risk": 0.01
    },
    {
      "u": "air_30",
      "v": "sea_45",
      "mode": "INTERMODAL",
      "name": "New York Harbor to JFK Air Cargo Gateway",
      "distance_km": 28.9,
      "transit_days": 0.2,
      "freight_cost_usd": 801.16,
      "base_risk": 0.01
    },
    {
      "u": "sea_46",
      "v": "rail_32",
      "mode": "INTERMODAL",
      "name": "Port of Houston to Alliance Texas Rail",
      "distance_km": 410.4,
      "transit_days": 0.2,
      "freight_cost_usd": 832.83,
      "base_risk": 0.02
    },
    {
      "u": "rail_32",
      "v": "sea_46",
      "mode": "INTERMODAL",
      "name": "Port of Houston to Alliance Texas Rail",
      "distance_km": 410.4,
      "transit_days": 0.2,
      "freight_cost_usd": 832.83,
      "base_risk": 0.02
    },
    {
      "u": "sea_48",
      "v": "air_07",
      "mode": "INTERMODAL",
      "name": "Panama Colon to Miami Air-Sea Fastbridge",
      "distance_km": 1828.5,
      "transit_days": 0.3,
      "freight_cost_usd": 1074.28,
      "base_risk": 0.03
    },
    {
      "u": "air_07",
      "v": "sea_48",
      "mode": "INTERMODAL",
      "name": "Panama Colon to Miami Air-Sea Fastbridge",
      "distance_km": 1828.5,
      "transit_days": 0.3,
      "freight_cost_usd": 1074.28,
      "base_risk": 0.03
    },
    {
      "u": "rail_28",
      "v": "air_14",
      "mode": "INTERMODAL",
      "name": "Chicago Rail Complex to O'Hare Cargo Hub",
      "distance_km": 25.0,
      "transit_days": 0.2,
      "freight_cost_usd": 800.75,
      "base_risk": 0.01
    },
    {
      "u": "air_14",
      "v": "rail_28",
      "mode": "INTERMODAL",
      "name": "Chicago Rail Complex to O'Hare Cargo Hub",
      "distance_km": 25.0,
      "transit_days": 0.2,
      "freight_cost_usd": 800.75,
      "base_risk": 0.01
    },
    {
      "u": "rail_34",
      "v": "air_02",
      "mode": "INTERMODAL",
      "name": "Memphis Rail Intermodal to FedEx World Hub",
      "distance_km": 12.8,
      "transit_days": 0.2,
      "freight_cost_usd": 800.38,
      "base_risk": 0.01
    },
    {
      "u": "air_02",
      "v": "rail_34",
      "mode": "INTERMODAL",
      "name": "Memphis Rail Intermodal to FedEx World Hub",
      "distance_km": 12.8,
      "transit_days": 0.2,
      "freight_cost_usd": 800.38,
      "base_risk": 0.01
    },
    {
      "u": "sea_33",
      "v": "rail_06",
      "mode": "INTERMODAL",
      "name": "Port of Rotterdam to Duisport Rail Hub",
      "distance_km": 188.6,
      "transit_days": 0.2,
      "freight_cost_usd": 809.43,
      "base_risk": 0.01
    },
    {
      "u": "rail_06",
      "v": "sea_33",
      "mode": "INTERMODAL",
      "name": "Port of Rotterdam to Duisport Rail Hub",
      "distance_km": 188.6,
      "transit_days": 0.2,
      "freight_cost_usd": 809.43,
      "base_risk": 0.01
    },
    {
      "u": "sea_34",
      "v": "rail_06",
      "mode": "INTERMODAL",
      "name": "Port of Antwerp to Duisport Rail Link",
      "distance_km": 167.6,
      "transit_days": 0.2,
      "freight_cost_usd": 808.38,
      "base_risk": 0.01
    },
    {
      "u": "rail_06",
      "v": "sea_34",
      "mode": "INTERMODAL",
      "name": "Port of Antwerp to Duisport Rail Link",
      "distance_km": 167.6,
      "transit_days": 0.2,
      "freight_cost_usd": 808.38,
      "base_risk": 0.01
    },
    {
      "u": "sea_35",
      "v": "rail_07",
      "mode": "INTERMODAL",
      "name": "Port of Hamburg to Billwerder Terminal",
      "distance_km": 10.2,
      "transit_days": 0.2,
      "freight_cost_usd": 800.31,
      "base_risk": 0.01
    },
    {
      "u": "rail_07",
      "v": "sea_35",
      "mode": "INTERMODAL",
      "name": "Port of Hamburg to Billwerder Terminal",
      "distance_km": 10.2,
      "transit_days": 0.2,
      "freight_cost_usd": 800.31,
      "base_risk": 0.01
    },
    {
      "u": "sea_33",
      "v": "air_15",
      "mode": "INTERMODAL",
      "name": "Rotterdam Port to Schiphol Air Cargo",
      "distance_km": 58.8,
      "transit_days": 0.2,
      "freight_cost_usd": 802.35,
      "base_risk": 0.01
    },
    {
      "u": "air_15",
      "v": "sea_33",
      "mode": "INTERMODAL",
      "name": "Rotterdam Port to Schiphol Air Cargo",
      "distance_km": 58.8,
      "transit_days": 0.2,
      "freight_cost_usd": 802.35,
      "base_risk": 0.01
    },
    {
      "u": "sea_36",
      "v": "air_36",
      "mode": "INTERMODAL",
      "name": "Valencia Port to Madrid Barajas Air Link",
      "distance_km": 299.7,
      "transit_days": 0.2,
      "freight_cost_usd": 817.98,
      "base_risk": 0.02
    },
    {
      "u": "air_36",
      "v": "sea_36",
      "mode": "INTERMODAL",
      "name": "Valencia Port to Madrid Barajas Air Link",
      "distance_km": 299.7,
      "transit_days": 0.2,
      "freight_cost_usd": 817.98,
      "base_risk": 0.02
    },
    {
      "u": "sea_37",
      "v": "air_29",
      "mode": "INTERMODAL",
      "name": "Piraeus Port to Istanbul Air Corridor",
      "distance_km": 574.5,
      "transit_days": 0.3,
      "freight_cost_usd": 845.96,
      "base_risk": 0.02
    },
    {
      "u": "air_29",
      "v": "sea_37",
      "mode": "INTERMODAL",
      "name": "Piraeus Port to Istanbul Air Corridor",
      "distance_km": 574.5,
      "transit_days": 0.3,
      "freight_cost_usd": 845.96,
      "base_risk": 0.02
    },
    {
      "u": "rail_06",
      "v": "air_11",
      "mode": "INTERMODAL",
      "name": "Duisport Rail to Frankfurt Airport Shuttle",
      "distance_km": 202.9,
      "transit_days": 0.2,
      "freight_cost_usd": 810.14,
      "base_risk": 0.01
    },
    {
      "u": "air_11",
      "v": "rail_06",
      "mode": "INTERMODAL",
      "name": "Duisport Rail to Frankfurt Airport Shuttle",
      "distance_km": 202.9,
      "transit_days": 0.2,
      "freight_cost_usd": 810.14,
      "base_risk": 0.01
    },
    {
      "u": "rail_07",
      "v": "air_19",
      "mode": "INTERMODAL",
      "name": "Hamburg Rail to Leipzig DHL Superhub",
      "distance_km": 273.2,
      "transit_days": 0.2,
      "freight_cost_usd": 816.39,
      "base_risk": 0.01
    },
    {
      "u": "air_19",
      "v": "rail_07",
      "mode": "INTERMODAL",
      "name": "Hamburg Rail to Leipzig DHL Superhub",
      "distance_km": 273.2,
      "transit_days": 0.2,
      "freight_cost_usd": 816.39,
      "base_risk": 0.01
    },
    {
      "u": "rail_18",
      "v": "air_23",
      "mode": "INTERMODAL",
      "name": "Eurotunnel to London Heathrow Cargo Link",
      "distance_km": 141.4,
      "transit_days": 0.2,
      "freight_cost_usd": 805.66,
      "base_risk": 0.01
    },
    {
      "u": "air_23",
      "v": "rail_18",
      "mode": "INTERMODAL",
      "name": "Eurotunnel to London Heathrow Cargo Link",
      "distance_km": 141.4,
      "transit_days": 0.2,
      "freight_cost_usd": 805.66,
      "base_risk": 0.01
    },
    {
      "u": "sea_38",
      "v": "air_13",
      "mode": "INTERMODAL",
      "name": "Jebel Ali Port to Dubai World Central Air Link",
      "distance_km": 40.3,
      "transit_days": 0.2,
      "freight_cost_usd": 801.21,
      "base_risk": 0.01
    },
    {
      "u": "air_13",
      "v": "sea_38",
      "mode": "INTERMODAL",
      "name": "Jebel Ali Port to Dubai World Central Air Link",
      "distance_km": 40.3,
      "transit_days": 0.2,
      "freight_cost_usd": 801.21,
      "base_risk": 0.01
    },
    {
      "u": "sea_39",
      "v": "air_12",
      "mode": "INTERMODAL",
      "name": "Salalah Port to Doha Hamad Air-Sea Link",
      "distance_km": 958.8,
      "transit_days": 0.4,
      "freight_cost_usd": 876.7,
      "base_risk": 0.02
    },
    {
      "u": "air_12",
      "v": "sea_39",
      "mode": "INTERMODAL",
      "name": "Salalah Port to Doha Hamad Air-Sea Link",
      "distance_km": 958.8,
      "transit_days": 0.4,
      "freight_cost_usd": 876.7,
      "base_risk": 0.02
    },
    {
      "u": "sea_47",
      "v": "air_45",
      "mode": "INTERMODAL",
      "name": "Port of Santos to Sao Paulo Guarulhos",
      "distance_km": 61.4,
      "transit_days": 0.2,
      "freight_cost_usd": 802.46,
      "base_risk": 0.01
    },
    {
      "u": "air_45",
      "v": "sea_47",
      "mode": "INTERMODAL",
      "name": "Port of Santos to Sao Paulo Guarulhos",
      "distance_km": 61.4,
      "transit_days": 0.2,
      "freight_cost_usd": 802.46,
      "base_risk": 0.01
    },
    {
      "u": "sea_50",
      "v": "rail_48",
      "mode": "INTERMODAL",
      "name": "Port of Durban to Sishen Rail Line",
      "distance_km": 1063.5,
      "transit_days": 0.6,
      "freight_cost_usd": 885.08,
      "base_risk": 0.02
    },
    {
      "u": "rail_48",
      "v": "sea_50",
      "mode": "INTERMODAL",
      "name": "Port of Durban to Sishen Rail Line",
      "distance_km": 1063.5,
      "transit_days": 0.6,
      "freight_cost_usd": 885.08,
      "base_risk": 0.02
    },
    {
      "u": "sea_50",
      "v": "air_48",
      "mode": "INTERMODAL",
      "name": "Port of Durban to Johannesburg Airport",
      "distance_km": 497.4,
      "transit_days": 0.3,
      "freight_cost_usd": 834.82,
      "base_risk": 0.02
    },
    {
      "u": "air_48",
      "v": "sea_50",
      "mode": "INTERMODAL",
      "name": "Port of Durban to Johannesburg Airport",
      "distance_km": 497.4,
      "transit_days": 0.3,
      "freight_cost_usd": 834.82,
      "base_risk": 0.02
    },
    {
      "u": "rail_47",
      "v": "air_49",
      "mode": "INTERMODAL",
      "name": "Mombasa SGR to Nairobi Cargo Terminal",
      "distance_km": 334.1,
      "transit_days": 0.3,
      "freight_cost_usd": 816.71,
      "base_risk": 0.01
    },
    {
      "u": "air_49",
      "v": "rail_47",
      "mode": "INTERMODAL",
      "name": "Mombasa SGR to Nairobi Cargo Terminal",
      "distance_km": 334.1,
      "transit_days": 0.3,
      "freight_cost_usd": 816.71,
      "base_risk": 0.01
    },
    {
      "u": "rail_45",
      "v": "sea_18",
      "mode": "INTERMODAL",
      "name": "Pilbara Rail to Torres Strait Maritime Gateway",
      "distance_km": 2818.0,
      "transit_days": 1.5,
      "freight_cost_usd": 1081.8,
      "base_risk": 0.02
    },
    {
      "u": "sea_18",
      "v": "rail_45",
      "mode": "INTERMODAL",
      "name": "Pilbara Rail to Torres Strait Maritime Gateway",
      "distance_km": 2818.0,
      "transit_days": 1.5,
      "freight_cost_usd": 1081.8,
      "base_risk": 0.02
    },
    {
      "u": "rail_46",
      "v": "air_21",
      "mode": "INTERMODAL",
      "name": "Parkes Logistics Hub to Singapore Air-Sea Bridge",
      "distance_km": 6008.7,
      "transit_days": 1.0,
      "freight_cost_usd": 2001.74,
      "base_risk": 0.03
    },
    {
      "u": "air_21",
      "v": "rail_46",
      "mode": "INTERMODAL",
      "name": "Parkes Logistics Hub to Singapore Air-Sea Bridge",
      "distance_km": 6008.7,
      "transit_days": 1.0,
      "freight_cost_usd": 2001.74,
      "base_risk": 0.03
    },
    {
      "u": "rail_46",
      "v": "sea_19",
      "mode": "INTERMODAL",
      "name": "Parkes Logistics Hub to Cook Strait Maritime",
      "distance_km": 2491.2,
      "transit_days": 1.3,
      "freight_cost_usd": 1049.12,
      "base_risk": 0.02
    },
    {
      "u": "sea_19",
      "v": "rail_46",
      "mode": "INTERMODAL",
      "name": "Parkes Logistics Hub to Cook Strait Maritime",
      "distance_km": 2491.2,
      "transit_days": 1.3,
      "freight_cost_usd": 1049.12,
      "base_risk": 0.02
    }
  ];


  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2.0) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) ** 2;
    const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    return Math.round(R * c * 10) / 10;
  }

  const NODES_MAP = {};
  RAW_150_NODES.forEach((n) => {
    NODES_MAP[n.id] = n;
  });

  // State Management
  let activeFilter = "ALL"; // ALL | SEA | RAIL | AIR
  let currentFromId = "sea_41"; // JNPT default
  let currentToId = "sea_33"; // Rotterdam default
  let currentAnalysisResult = null;
  let isAnalyzing = false;
  let currentBasemapType = "dark"; // dark | satellite

  // Leaflet Map & Layer References
  let leafletMap = null;
  let tileLayerDark = null;
  let tileLayerSatellite = null;
  let markersLayerGroup = null;
  let routeLinesLayerGroup = null;
  let blockedMarkersLayerGroup = null;
  let markerInstances = {};

  // --- 2. INITIALIZATION ---
  function initRouteMap() {
    buildMapDOM();
    populateDropdowns();
    initLeafletInstance();
    setupEventListeners();

    // Auto-run baseline route on startup reading problem input value
    setTimeout(() => {
      const problemInput = document.getElementById("routeProblemInput");
      const initialProblem = problemInput ? problemInput.value : "Oil shipment from India to Europe. Avoid Strait of Hormuz and Persian Gulf conflict zone.";
      analyzeRoute(currentFromId, currentToId, initialProblem);
    }, 300);
  }

  // --- 3. BUILD MAP DOM ---
  function buildMapDOM() {
    const container = document.getElementById("worldMapContainer");
    if (!container) return;

    container.innerHTML = `
      <!-- Map Header HUD Controls -->
      <div class="map-hud-header">
        <div class="hud-title-group">
          <span class="hud-tag">GLOBAL LOGISTICS RADAR // 150 NODES</span>
          <span class="hud-status" id="mapStatusBadge">SYSTEM ONLINE — 150 CHECKPOINTS LOADED</span>
        </div>

        <!-- Filter Segmented Control -->
        <div class="map-filter-group" role="group" aria-label="Map Mode Filters">
          <button class="map-filter-btn active" data-filter="ALL" onclick="window.RouteMap.setFilter('ALL')">
            ALL (150)
          </button>
          <button class="map-filter-btn btn-sea" data-filter="SEA" onclick="window.RouteMap.setFilter('SEA')">
            <span class="dot-indicator dot-sea"></span> SEA (50)
          </button>
          <button class="map-filter-btn btn-rail" data-filter="RAIL" onclick="window.RouteMap.setFilter('RAIL')">
            <span class="dot-indicator dot-rail"></span> RAIL (50)
          </button>
          <button class="map-filter-btn btn-air" data-filter="AIR" onclick="window.RouteMap.setFilter('AIR')">
            <span class="dot-indicator dot-air"></span> AIR (50)
          </button>
        </div>

        <!-- Camera Controls -->
        <div class="map-zoom-group">
          <button class="map-ctrl-btn" title="Focus Active Route" onclick="window.RouteMap.focusRoute()">🎯 FOCUS ROUTE</button>
          <button class="map-ctrl-btn" title="Reset Global View" onclick="window.RouteMap.resetView()">🌍 GLOBAL VIEW</button>
          <button class="map-ctrl-btn" title="Toggle Dark/Satellite Map" id="btnToggleBasemap" onclick="window.RouteMap.toggleBasemap()">🛰️ SATELLITE</button>
        </div>
      </div>

      <!-- Leaflet Interactive Canvas Container -->
      <div class="map-viewport" id="leafletMapCanvas" style="width: 100%; height: 500px; background: #030407; position: relative;">
        <!-- Scanning Radar Sweep Line -->
        <div id="radarSweepLine" class="radar-sweep-line"></div>
      </div>
    `;
  }

  // --- 4. INITIALIZE LEAFLET INSTANCE ---
  function initLeafletInstance() {
    const mapDiv = document.getElementById("leafletMapCanvas");
    if (!mapDiv) return;

    if (typeof L === "undefined") {
      console.warn("[Leaflet Notice] Leaflet JS library not yet loaded, retrying...");
      setTimeout(initLeafletInstance, 200);
      return;
    }

    // Initialize Leaflet Map
    leafletMap = L.map("leafletMapCanvas", {
      center: [24.0, 30.0],
      zoom: 2.2,
      minZoom: 1.8,
      maxZoom: 12,
      zoomControl: true,
      attributionControl: false,
      worldCopyJump: true
    });

    // High-Performance Watermark-Free Dark Basemap (ESRI World Dark Gray Base + Reference Labels - 100% Watermark-Free)
    tileLayerDark = L.layerGroup([
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16
      }),
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16,
        opacity: 0.75
      })
    ]).addTo(leafletMap);

    // Satellite Basemap (ESRI World Imagery - 100% Watermark-Free)
    tileLayerSatellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19
    });

    // Layer Groups
    markersLayerGroup = L.layerGroup().addTo(leafletMap);
    routeLinesLayerGroup = L.layerGroup().addTo(leafletMap);
    blockedMarkersLayerGroup = L.layerGroup().addTo(leafletMap);

    renderLeafletMarkers();
  }

  // --- 5. RENDER 150 HIGH-TECH GLYPH MARKERS ---
  function renderLeafletMarkers() {
    if (!markersLayerGroup || !leafletMap) return;
    markersLayerGroup.clearLayers();
    markerInstances = {};

    const activeRouteIds = new Set();
    if (currentAnalysisResult && currentAnalysisResult.optimal_path) {
      currentAnalysisResult.optimal_path.forEach((p) => activeRouteIds.add(p.id));
    }
    if (currentFromId) activeRouteIds.add(currentFromId);
    if (currentToId) activeRouteIds.add(currentToId);

    RAW_150_NODES.forEach((node) => {
      // Check Filter
      if (activeFilter !== "ALL" && node.type !== activeFilter) return;

      const isFrom = node.id === currentFromId;
      const isTo = node.id === currentToId;
      const isBlocked = currentAnalysisResult && currentAnalysisResult.blocked_nodes && currentAnalysisResult.blocked_nodes.some((b) => b.id === node.id);
      const isConnected = activeRouteIds.has(node.id);

      let customClass = `leaflet-node-glyph glyph-${node.type.toLowerCase()}`;
      let isIdle = false;

      if (isFrom) {
        customClass += " is-origin is-active-node";
      } else if (isTo) {
        customClass += " is-dest is-active-node";
      } else if (isBlocked) {
        customClass += " is-blocked";
      } else if (isConnected) {
        customClass += " is-waypoint is-active-node";
      } else {
        customClass += " is-idle";
        isIdle = true;
      }

      // Icon HTML with glowing pulse ring (only on active / blocked)
      let glyphHtml = "";
      if (node.type === "SEA") {
        glyphHtml = `
          <div class="${customClass}" title="${node.name} (${node.location})">
            ${!isIdle ? '<span class="glyph-pulse-halo"></span>' : ''}
            <span class="glyph-core-symbol">⚓</span>
          </div>
        `;
      } else if (node.type === "AIR") {
        glyphHtml = `
          <div class="${customClass}" title="${node.name} (${node.location})">
            ${!isIdle ? '<span class="glyph-pulse-halo"></span>' : ''}
            <span class="glyph-core-symbol">✈</span>
          </div>
        `;
      } else {
        glyphHtml = `
          <div class="${customClass}" title="${node.name} (${node.location})">
            ${!isIdle ? '<span class="glyph-pulse-halo"></span>' : ''}
            <span class="glyph-core-symbol">🚆</span>
          </div>
        `;
      }

      const icon = L.divIcon({
        className: "custom-leaflet-div-icon",
        html: glyphHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([node.lat, node.lng], { icon: icon });

      // Rich Command-Center Popup
      const modeColors = { SEA: "#00f0ff", AIR: "#38bdf8", RAIL: "#f59e0b" };
      const popupContent = `
        <div class="leaflet-hud-popup">
          <div class="hud-card-top">
            <span class="hud-mode-badge" style="color: ${modeColors[node.type]}; border-color: ${modeColors[node.type]}44;">
              ${node.type} LOGISTICS
            </span>
            <span class="hud-id">#${node.num} // ${node.id.toUpperCase()}</span>
          </div>
          <div class="hud-title">${node.name}</div>
          <div class="hud-loc">${node.location} (${node.region || "Global Network"})</div>
          <div class="hud-metrics-grid">
            <div class="hud-cell">
              <span class="hud-label">CONGESTION</span>
              <span class="hud-val ${node.congestion === "HIGH" ? "val-high" : "val-ok"}">${node.congestion}</span>
            </div>
            <div class="hud-cell">
              <span class="hud-label">NETWORK RISK</span>
              <span class="hud-val ${node.network_risk === "HIGH" ? "val-high" : "val-ok"}">${node.network_risk}</span>
            </div>
            <div class="hud-cell">
              <span class="hud-label">EXP. DELAY</span>
              <span class="hud-val val-cyan">+${node.expected_delay_hours}h</span>
            </div>
            <div class="hud-cell">
              <span class="hud-label">EXP. LOSS</span>
              <span class="hud-val">$${node.expected_loss_usd.toLocaleString()}</span>
            </div>
          </div>
          <div class="popup-btn-row">
            <button class="popup-select-btn btn-set-from" onclick="window.RouteMap.setOrigin('${node.id}')">SET ORIGIN [FROM]</button>
            <button class="popup-select-btn btn-set-to" onclick="window.RouteMap.setDestination('${node.id}')">SET DEST [TO]</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-leaflet-dark-popup",
        closeButton: true,
        maxWidth: 290
      });

      marker.on("click", () => {
        onNodeClicked(node);
      });

      markersLayerGroup.addLayer(marker);
      markerInstances[node.id] = marker;
    });
  }

  // --- 6. GEODESIC GREAT-CIRCLE INTERPOLATION ---
  function computeGreatCirclePoints(lat1, lon1, lat2, lon2, numPoints = 28) {
    const points = [];
    const rad = Math.PI / 180.0;
    const rLat1 = lat1 * rad;
    const rLon1 = lon1 * rad;
    const rLat2 = lat2 * rad;
    const rLon2 = lon2 * rad;

    const dLon = rLon2 - rLon1;
    const d = 2.0 * Math.asin(Math.sqrt(
      Math.sin((rLat2 - rLat1) / 2.0) ** 2 +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2.0) ** 2
    ));

    if (d < 0.0001) {
      return [[lat1, lon1], [lat2, lon2]];
    }

    for (let i = 0; i <= numPoints; i++) {
      const f = i / numPoints;
      const A = Math.sin((1.0 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(rLat1) * Math.cos(rLon1) + B * Math.cos(rLat2) * Math.cos(rLon2);
      const y = A * Math.cos(rLat1) * Math.sin(rLon1) + B * Math.cos(rLat2) * Math.sin(rLon2);
      const z = A * Math.sin(rLat1) + B * Math.sin(rLat2);
      const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) / rad;
      const lon = Math.atan2(y, x) / rad;
      points.push([lat, lon]);
    }
    return points;
  }

  // --- 7. ANIMATED OPTIMAL ROUTE ON LEAFLET ---
  function drawOptimalRouteOnMap(result) {
    if (!routeLinesLayerGroup || !leafletMap) return;
    routeLinesLayerGroup.clearLayers();

    if (!result || !result.optimal_path || result.optimal_path.length < 2) return;

    const pathNodes = result.optimal_path;
    const allArcCoordinates = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const u = pathNodes[i];
      const v = pathNodes[i + 1];
      const arcPoints = computeGreatCirclePoints(u.lat, u.lng, v.lat, v.lng, 25);
      allArcCoordinates.push(...arcPoints);

      // Outer Neon Glow Polyline
      const glowPoly = L.polyline(arcPoints, {
        color: "#00f0ff",
        weight: 7,
        opacity: 0.35,
        lineCap: "round",
        lineJoin: "round",
        className: "leaflet-laser-aura"
      });
      routeLinesLayerGroup.addLayer(glowPoly);

      // Core Laser Polyline
      const corePoly = L.polyline(arcPoints, {
        color: "#ffffff",
        weight: 2.5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        className: "leaflet-laser-core"
      });
      routeLinesLayerGroup.addLayer(corePoly);

      // Animated Pulsing Dash Line
      const dashPoly = L.polyline(arcPoints, {
        color: "#00f0ff",
        weight: 3.5,
        dashArray: "12, 24",
        lineCap: "round",
        className: "leaflet-laser-tracer"
      });
      routeLinesLayerGroup.addLayer(dashPoly);
    }

    // Refresh marker glyph states (Origin, Destination, Waypoint, Blocked)
    renderLeafletMarkers();

    // Cinematic Camera FlyTo Bounds
    if (allArcCoordinates.length > 0) {
      const bounds = L.latLngBounds(allArcCoordinates);
      leafletMap.flyToBounds(bounds, {
        padding: [60, 60],
        maxZoom: 6,
        duration: 1.4,
        easeLinearity: 0.25
      });
    }
  }

  // --- 8. SEARCHABLE LOCATION COMBOBOXES & DROPDOWNS (150 NODES) ---
  let fromFilterType = "ALL";
  let toFilterType = "ALL";

  function getNodeIcon(type) {
    if (type === "SEA") return "⚓";
    if (type === "AIR") return "✈️";
    if (type === "RAIL") return "🚆";
    return "📍";
  }

  function getNodeBadgeClass(type) {
    if (type === "SEA") return "badge-sea";
    if (type === "AIR") return "badge-air";
    if (type === "RAIL") return "badge-rail";
    return "";
  }

  function formatNodeDisplay(node) {
    if (!node) return "";
    return `${node.num}. ${node.name} (${node.location})`;
  }

  function updateComboboxDisplay(target, nodeId) {
    const node = NODES_MAP[nodeId];
    if (!node) return;

    const input = document.getElementById(`${target}NodeSearchInput`);
    const icon = document.getElementById(`${target}SelectedIcon`);
    const clearBtn = document.getElementById(`${target}ClearBtn`);
    const select = document.getElementById(`${target}NodeSelect`);

    if (input) input.value = formatNodeDisplay(node);
    if (icon) icon.textContent = getNodeIcon(node.type);
    if (clearBtn) clearBtn.style.display = "block";
    if (select) select.value = nodeId;
  }

  function renderComboboxItems(target, filterType, query = "") {
    const listEl = document.getElementById(`${target}ItemsList`);
    if (!listEl) return;

    listEl.innerHTML = "";
    const cleanQuery = (query || "").toLowerCase().trim();

    let filtered = RAW_150_NODES;
    if (filterType && filterType !== "ALL") {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    if (cleanQuery) {
      filtered = filtered.filter((n) => {
        const nameMatch = n.name.toLowerCase().includes(cleanQuery);
        const locMatch = n.location.toLowerCase().includes(cleanQuery);
        const regMatch = (n.region || "").toLowerCase().includes(cleanQuery);
        const iataMatch = (n.iata || "").toLowerCase().includes(cleanQuery);
        const idMatch = n.id.toLowerCase().includes(cleanQuery);
        return nameMatch || locMatch || regMatch || iataMatch || idMatch;
      });
    }

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "combobox-no-results";
      empty.textContent = `No locations found matching "${query}"`;
      listEl.appendChild(empty);
      return;
    }

    const currentSelectedId = target === "from" ? currentFromId : currentToId;

    filtered.forEach((node) => {
      const item = document.createElement("div");
      item.className = `combobox-item ${node.id === currentSelectedId ? "selected" : ""}`;
      item.setAttribute("data-id", node.id);

      let titleHtml = `${node.num}. ${node.name}`;
      if (cleanQuery) {
        const regex = new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
        titleHtml = titleHtml.replace(regex, "<mark>$1</mark>");
      }

      item.innerHTML = `
        <div class="combobox-item-main">
          <div class="combobox-item-title">${titleHtml}</div>
          <div class="combobox-item-sub">${node.location} • ${node.region || ""}</div>
        </div>
        <span class="combobox-item-badge ${getNodeBadgeClass(node.type)}">${node.type}</span>
      `;

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        if (target === "from") {
          currentFromId = node.id;
        } else {
          currentToId = node.id;
        }
        updateComboboxDisplay(target, node.id);
        closeCombobox(target);
        renderLeafletMarkers();
      });

      listEl.appendChild(item);
    });
  }

  function openCombobox(target) {
    const panel = document.getElementById(`${target}DropdownPanel`);
    const otherTarget = target === "from" ? "to" : "from";
    closeCombobox(otherTarget);

    if (panel) {
      panel.classList.add("open");
      const currentFilter = target === "from" ? fromFilterType : toFilterType;
      const input = document.getElementById(`${target}NodeSearchInput`);
      const query = input ? input.value : "";
      const isSelectedVal = RAW_150_NODES.some((n) => formatNodeDisplay(n) === query);
      renderComboboxItems(target, currentFilter, isSelectedVal ? "" : query);
    }
  }

  function closeCombobox(target) {
    const panel = document.getElementById(`${target}DropdownPanel`);
    if (panel) panel.classList.remove("open");
  }

  function initSearchableComboboxes() {
    ["from", "to"].forEach((target) => {
      const input = document.getElementById(`${target}NodeSearchInput`);
      const inputBox = document.getElementById(`${target}ComboboxInputBox`);
      const clearBtn = document.getElementById(`${target}ClearBtn`);
      const toggleBtn = document.getElementById(`${target}ToggleBtn`);
      const panel = document.getElementById(`${target}DropdownPanel`);

      if (!input || !panel) return;

      if (inputBox) {
        inputBox.addEventListener("click", () => {
          input.focus();
          openCombobox(target);
        });
      }

      input.addEventListener("input", (e) => {
        const query = e.target.value;
        if (clearBtn) clearBtn.style.display = query.length > 0 ? "block" : "none";
        openCombobox(target);
        const currentFilter = target === "from" ? fromFilterType : toFilterType;
        renderComboboxItems(target, currentFilter, query);
      });

      input.addEventListener("focus", () => {
        openCombobox(target);
      });

      if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          input.value = "";
          clearBtn.style.display = "none";
          input.focus();
          const currentFilter = target === "from" ? fromFilterType : toFilterType;
          renderComboboxItems(target, currentFilter, "");
        });
      }

      if (toggleBtn) {
        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (panel.classList.contains("open")) {
            closeCombobox(target);
          } else {
            input.focus();
            openCombobox(target);
          }
        });
      }

      if (panel) {
        panel.querySelectorAll(".combo-tab").forEach((tab) => {
          tab.addEventListener("click", (e) => {
            e.stopPropagation();
            panel.querySelectorAll(".combo-tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            const fType = tab.getAttribute("data-type") || "ALL";
            if (target === "from") fromFilterType = fType;
            else toFilterType = fType;
            renderComboboxItems(target, fType, input.value);
          });
        });
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".searchable-combobox-wrapper")) {
        closeCombobox("from");
        closeCombobox("to");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeCombobox("from");
        closeCombobox("to");
      }
    });

    updateComboboxDisplay("from", currentFromId);
    updateComboboxDisplay("to", currentToId);
  }

  function populateDropdowns() {
    const fromSelect = document.getElementById("fromNodeSelect");
    const toSelect = document.getElementById("toNodeSelect");
    if (fromSelect && toSelect) {
      const createGroup = (label, type) => {
        const optGroup = document.createElement("optgroup");
        optGroup.label = label;
        RAW_150_NODES.filter((n) => n.type === type).forEach((node) => {
          const opt = document.createElement("option");
          opt.value = node.id;
          opt.textContent = `${node.num}. ${node.name} (${node.location})`;
          optGroup.appendChild(opt);
        });
        return optGroup;
      };

      [fromSelect, toSelect].forEach((sel) => {
        sel.innerHTML = "";
        sel.appendChild(createGroup("── MARITIME SEA HUBS (50) ──", "SEA"));
        sel.appendChild(createGroup("── AIR CARGO HUBS (50) ──", "AIR"));
        sel.appendChild(createGroup("── RAIL FREIGHT HUBS (50) ──", "RAIL"));
      });

      fromSelect.value = currentFromId;
      toSelect.value = currentToId;

      fromSelect.addEventListener("change", (e) => {
        currentFromId = e.target.value;
        updateComboboxDisplay("from", currentFromId);
        renderLeafletMarkers();
      });

      toSelect.addEventListener("change", (e) => {
        currentToId = e.target.value;
        updateComboboxDisplay("to", currentToId);
        renderLeafletMarkers();
      });
    }

    initSearchableComboboxes();
  }

  // --- 9. INTERACTIVE NODE SELECTION ---
  function onNodeClicked(node) {
    if (currentFromId && currentFromId !== node.id && !currentToId) {
      currentToId = node.id;
      updateComboboxDisplay("to", node.id);
    } else {
      currentFromId = node.id;
      updateComboboxDisplay("from", node.id);
    }
    renderLeafletMarkers();
  }

  function setOrigin(nodeId) {
    currentFromId = nodeId;
    updateComboboxDisplay("from", nodeId);
    renderLeafletMarkers();
    if (leafletMap) leafletMap.closePopup();
  }

  function setDestination(nodeId) {
    currentToId = nodeId;
    updateComboboxDisplay("to", nodeId);
    renderLeafletMarkers();
    if (leafletMap) leafletMap.closePopup();
  }


  // --- 10. AI ROUTE ANALYSIS & DETERMINISTIC OPTIMIZATION ---
  function analyzeCurrentSelection() {
    const fromSelect = document.getElementById("fromNodeSelect");
    const toSelect = document.getElementById("toNodeSelect");
    const problemInput = document.getElementById("routeProblemInput");

    const fromId = fromSelect ? fromSelect.value : currentFromId;
    const toId = toSelect ? toSelect.value : currentToId;
    const problem = problemInput ? problemInput.value : "";

    currentFromId = fromId;
    currentToId = toId;

    analyzeRoute(fromId, toId, problem);
  }

  // --- 10. REAL-TIME HYBRID AI DISRUPTION INTELLIGENCE & GRAPH OPTIMIZATION ---
  const GROQ_PRIMARY_KEY = "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";
  const GROQ_FAILOVER_KEY = "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";
  const GROQ_MODEL_NAME = "openai/gpt-oss-120b";

  function extractConstraintsDeterministicNLP(problemText) {
    const text = (problemText || "").toLowerCase();
    const affectedRegions = [];
    const blockedStraits = [];
    const blockedModes = [];
    let preferredMode = "ANY";
    const keywords = [];
    let severity = "HIGH";
    let disruptionType = "GENERAL_RISK";
    let preference = "BALANCED";

    // ── INDIAN OCEAN / ARABIAN SEA / BAY OF BENGAL / INDIA ──────────────────
    if (text.includes("indian ocean") || text.includes("india ocean") || text.includes("arabian sea") || text.includes("bay of bengal") || text.includes("laccadive sea") || (text.includes("india") && (text.includes("war") || text.includes("conflict") || text.includes("hostilit") || text.includes("missile")))) {
      affectedRegions.push("Indian Ocean", "Arabian Sea", "Bay of Bengal");
      blockedStraits.push("strait of hormuz", "bab-el-mandeb strait", "strait of malacca");
      keywords.push("indian ocean", "india ocean", "arabian sea", "bay of bengal", "colombo", "maldives", "oman", "hormuz", "malacca", "singapore", "sri lanka", "chennai", "karachi", "chittagong", "myanmar", "yangon");
      blockedModes.push("SEA");
      disruptionType = "MILITARY_CONFLICT";
      severity = "CRITICAL";
      preferredMode = "RAIL";
      preference = "SAFEST";
    }

    // ── SOUTH CHINA SEA / TAIWAN STRAIT / EAST ASIA ─────────────────────────
    if (text.includes("south china") || text.includes("taiwan") || text.includes("east china sea") || text.includes("yellow sea") || text.includes("philippines sea")) {
      affectedRegions.push("South China Sea", "Taiwan Strait", "East China Sea");
      blockedStraits.push("taiwan strait", "luzon strait");
      keywords.push("south china sea", "taiwan", "manila", "hong kong", "shanghai", "korea", "japan", "philippines", "luzon", "kaohsiung", "busan");
      disruptionType = "MILITARY_CONFLICT";
      severity = "CRITICAL";
      preferredMode = "AIR";
      preference = "SAFEST";
    }

    // ── STRAIT OF HORMUZ / PERSIAN GULF ─────────────────────────────────────
    if (text.includes("hormuz") || text.includes("persian gulf") || text.includes("gulf of oman") || text.includes("iran") || text.includes("iraq") || text.includes("kuwait") || text.includes("bahrain") || text.includes("qatar")) {
      affectedRegions.push("Strait of Hormuz", "Persian Gulf", "Gulf of Oman");
      blockedStraits.push("strait of hormuz");
      keywords.push("hormuz", "persian gulf", "iran", "gulf", "jebel ali", "dubai", "abu dhabi", "muscat", "salalah", "bandar", "mundra", "karachi");
      disruptionType = "MILITARY_CONFLICT";
      severity = "CRITICAL";
      preference = "SAFEST";
    }

    // ── SUEZ CANAL / RED SEA / BAB-EL-MANDEB ────────────────────────────────
    if (text.includes("suez") || text.includes("red sea") || text.includes("bab-el-mandeb") || text.includes("bab el mandeb") || text.includes("yemen") || text.includes("houthi") || text.includes("djibouti") || text.includes("egypt") || text.includes("aden")) {
      affectedRegions.push("Suez Canal", "Red Sea", "Bab-el-Mandeb Strait", "Gulf of Aden");
      blockedStraits.push("suez canal", "bab-el-mandeb strait");
      keywords.push("suez", "red sea", "bab-el-mandeb", "djibouti", "aden", "jeddah", "port sudan", "eritrea", "egypt");
      disruptionType = (text.includes("block") || text.includes("drought")) ? "CANAL_BLOCKADE" : "MILITARY_CONFLICT";
      severity = "CRITICAL";
      preference = "SAFEST";
    }

    // ── PANAMA CANAL / CENTRAL AMERICA ──────────────────────────────────────
    if (text.includes("panama") || text.includes("gatun") || text.includes("canal draft") || text.includes("central america")) {
      affectedRegions.push("Panama Canal", "Caribbean Sea");
      blockedStraits.push("panama canal");
      keywords.push("panama", "colon", "gatun", "central america");
      disruptionType = text.includes("drought") ? "WEATHER_DROUGHT" : "CANAL_BLOCKADE";
      severity = "HIGH";
    }

    // ── STRAIT OF MALACCA / SINGAPORE / SOUTHEAST ASIA ──────────────────────
    if (text.includes("malacca") || text.includes("singapore strait") || text.includes("piracy") || text.includes("lombok strait") || text.includes("sunda strait") || text.includes("banda sea") || text.includes("indonesia")) {
      affectedRegions.push("Strait of Malacca", "Southeast Asia Maritime");
      blockedStraits.push("strait of malacca", "singapore strait");
      keywords.push("malacca", "singapore", "indonesia", "piracy", "port klang", "batam", "medan", "penang", "lombok", "sunda");
      disruptionType = "PIRACY";
      severity = "HIGH";
    }

    // ── MEDITERRANEAN SEA / BOSPHORUS / BLACK SEA ────────────────────────────
    if (text.includes("mediterranean") || text.includes("bosphorus") || text.includes("black sea") || text.includes("aegean") || text.includes("dardanelles") || text.includes("sicily") || text.includes("gibraltar") || text.includes("italy") || text.includes("greece") || text.includes("turkey") || text.includes("ukraine") || text.includes("russia war")) {
      affectedRegions.push("Mediterranean Sea", "Black Sea", "Bosphorus Strait");
      blockedStraits.push("bosphorus strait", "strait of gibraltar");
      keywords.push("mediterranean", "bosphorus", "black sea", "istanbul", "athens", "piraeus", "genoa", "barcelona", "marseille", "naples", "valencia", "constanta", "odessa", "ukraine", "novorossiysk");
      disruptionType = "MILITARY_CONFLICT";
      severity = "CRITICAL";
    }

    // ── PACIFIC OCEAN ────────────────────────────────────────────────────────
    if (text.includes("pacific ocean") || text.includes("north pacific") || text.includes("south pacific") || text.includes("transpacific") || text.includes("pacific war")) {
      affectedRegions.push("Pacific Ocean", "North Pacific", "South Pacific");
      blockedStraits.push("taiwan strait", "luzon strait", "torres strait");
      keywords.push("pacific", "honolulu", "guam", "anchorage", "tokyo", "yokohama", "busan", "shanghai", "los angeles", "long beach", "seattle", "vancouver", "sydney", "auckland", "singapore");
      disruptionType = "MILITARY_CONFLICT";
      severity = "CRITICAL";
      preferredMode = "RAIL";
    }

    // ── ATLANTIC OCEAN ───────────────────────────────────────────────────────
    if (text.includes("atlantic ocean") || text.includes("north atlantic") || text.includes("south atlantic") || text.includes("transatlantic") || text.includes("atlantic war") || text.includes("gulf of mexico")) {
      affectedRegions.push("Atlantic Ocean", "North Atlantic", "South Atlantic");
      blockedStraits.push("strait of gibraltar", "english channel", "drake passage");
      keywords.push("atlantic", "rotterdam", "hamburg", "antwerp", "london", "new york", "baltimore", "houston", "santos", "buenos aires", "durban", "cape town", "dakar", "casablanca", "canary");
      disruptionType = "MILITARY_CONFLICT";
      severity = "CRITICAL";
      preferredMode = "AIR";
    }

    // ── AIRSPACE CLOSURES / EURASIAN ─────────────────────────────────────────
    if (text.includes("airspace") || text.includes("air space") || text.includes("no fly zone") || text.includes("fly zone") || text.includes("siberia") || text.includes("russian airspace") || text.includes("ukraine war") || text.includes("nato")) {
      affectedRegions.push("Eurasian Airspace", "Trans-Siberian Corridor");
      keywords.push("airspace", "russia", "siberia", "ukraine", "closure", "ban");
      disruptionType = "AIRSPACE_CLOSURE";
      blockedModes.push("AIR");
      if (preferredMode === "ANY") preferredMode = "RAIL";
      severity = "CRITICAL";
    }

    // ── EXPLICIT MODAL PREFERENCE DETECTION ──────────────────────────────────
    if (text.includes("air cargo") || text.includes("air freight") || text.includes("aviation") || text.includes("aircraft") || text.includes("fly") || text.includes("flight") || text.includes("charter")) {
      preferredMode = "AIR";
    } else if (text.includes("rail") || text.includes("railway") || text.includes("train") || text.includes("landbridge") || text.includes("silk road") || text.includes("belt and road")) {
      preferredMode = "RAIL";
    } else if ((text.includes("vessel") || text.includes("ship") || text.includes("container ship") || text.includes("bulk carrier") || text.includes("oil tanker") || text.includes("cargo ship")) && !blockedModes.includes("SEA")) {
      preferredMode = "SEA";
    }

    if (blockedModes.includes("SEA") && preferredMode === "SEA") {
      preferredMode = "RAIL";
    }

    if (affectedRegions.length === 0) {
      affectedRegions.push("General Risk Corridor");
    }

    const aiThreatSummary = `Threat detection identified ${disruptionType.replace(/_/g, " ")} affecting: ${affectedRegions.slice(0, 3).join(", ")}. Circumventing active hazard corridors and routing via optimal ${preferredMode} multi-modal corridor.`;

    return {
      disruption_type: disruptionType,
      severity: severity,
      affected_regions: affectedRegions,
      blocked_straits_or_chokepoints: blockedStraits,
      blocked_transport_modes: blockedModes,
      preferred_transport_mode: preferredMode,
      keyword_identifiers: keywords,
      user_routing_preference: preference,
      ai_threat_summary: aiThreatSummary,
      ai_engine_source: "DETERMINISTIC_NLP_ENGINE"
    };
  }

  async function extractConstraintsWithGroqAI(fromNode, toNode, problemText) {
    if (!problemText || problemText.trim().length < 3) return null;
    const prompt = `Analyze this logistics disruption and return ONLY a JSON object.

ORIGIN: ${fromNode.name} (${fromNode.type}) in ${fromNode.location}
DESTINATION: ${toNode.name} (${toNode.type}) in ${toNode.location}
DISRUPTION: "${problemText}"

Rules:
- Identify ALL blocked oceans/seas/straits/regions/airspace
- If any ocean/sea is blocked by war/hostilities: add "SEA" to blocked_transport_modes, set preferred_transport_mode to "RAIL" or "AIR"
- keyword_identifiers = lowercase location names in the blocked zones

Return ONLY this JSON (no markdown, no extra text):
{"disruption_type":"MILITARY_CONFLICT|WEATHER_DROUGHT|CANAL_BLOCKADE|AIRSPACE_CLOSURE|PORT_STRIKE|PIRACY|GENERAL_RISK","severity":"CRITICAL|HIGH|MODERATE|LOW","affected_regions":["..."],"blocked_straits_or_chokepoints":["..."],"blocked_transport_modes":["SEA"|"AIR"|"RAIL"],"preferred_transport_mode":"SEA|RAIL|AIR|ANY","keyword_identifiers":["..."],"user_routing_preference":"FASTEST|CHEAPEST|SAFEST|BALANCED","ai_threat_summary":"..."}`;

    const keys = [GROQ_PRIMARY_KEY, GROQ_FAILOVER_KEY];
    for (const key of keys) {
      if (!key) continue;
      try {
        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            model: GROQ_MODEL_NAME,
            messages: [
              { role: "system", content: "You are a geopolitical logistics risk analyst. You MUST respond with ONLY a raw JSON object." },
              { role: "user", content: prompt }
            ],
            temperature: 0.0,
            max_tokens: 1500
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          let raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
          raw = raw.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) raw = match[0];
          const parsed = JSON.parse(raw);
          if (parsed && parsed.disruption_type) {
            parsed.ai_engine_source = "GROQ_LIVE_OPENAI_GPT-OSS-120B";
            return parsed;
          }
        }
      } catch (err) {
        console.warn("[Route AI Client] Direct Groq API call notice:", err);
      }
    }
    return null;
  }

  function applyQualityGate(aiParsed, nlp) {
    if (!aiParsed) return nlp;
    const res = Object.assign({}, aiParsed);
    if (res.disruption_type === "GENERAL_RISK" && nlp.disruption_type !== "GENERAL_RISK") {
      res.disruption_type = nlp.disruption_type;
      res.severity = nlp.severity;
      res.user_routing_preference = nlp.user_routing_preference;
    }
    const aiReg = res.affected_regions || [];
    const nlpReg = nlp.affected_regions || [];
    res.affected_regions = Array.from(new Set(aiReg.concat(nlpReg)));

    const aiStr = res.blocked_straits_or_chokepoints || [];
    const nlpStr = nlp.blocked_straits_or_chokepoints || [];
    res.blocked_straits_or_chokepoints = Array.from(new Set(aiStr.concat(nlpStr)));

    const aiMod = res.blocked_transport_modes || [];
    const nlpMod = nlp.blocked_transport_modes || [];
    res.blocked_transport_modes = Array.from(new Set(aiMod.concat(nlpMod)));

    if (!res.preferred_transport_mode || res.preferred_transport_mode === "ANY") {
      if (nlp.preferred_transport_mode && nlp.preferred_transport_mode !== "ANY") {
        res.preferred_transport_mode = nlp.preferred_transport_mode;
      }
    }
    if (res.blocked_transport_modes.includes("SEA") && res.preferred_transport_mode === "SEA") {
      res.preferred_transport_mode = "RAIL";
    }

    const aiKw = res.keyword_identifiers || [];
    const nlpKw = nlp.keyword_identifiers || [];
    res.keyword_identifiers = Array.from(new Set(aiKw.concat(nlpKw)));
    return res;
  }

  async function analyzeRoute(fromId, toId, problemText) {
    if (isAnalyzing) return;
    isAnalyzing = true;
    setLoadingState(true);

    const fromNode = NODES_MAP[fromId];
    const toNode = NODES_MAP[toId];

    try {
      // 1. Try local backend endpoint first if available (silent fallback if not hosted)
      let backendSuccess = false;
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 1000);
        const res = await fetch("/api/routes/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from_node_id: fromId,
            to_node_id: toId,
            problem: problemText || ""
          }),
          signal: ctrl.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const result = await res.json();
          if (result && result.optimal_path && result.optimal_path.length > 0) {
            currentAnalysisResult = result;
            renderAnalysisResults(result);
            drawOptimalRouteOnMap(result);
            backendSuccess = true;
          }
        }
      } catch (_) {
        // Backend offline on static Vercel host — seamless client AI engine execution
      }

      if (backendSuccess) return;

      // 2. Direct browser-side AI Disruption Extraction with openai/gpt-oss-120b
      const nlpConstraints = extractConstraintsDeterministicNLP(problemText);
      let aiConstraints = null;
      if (problemText && problemText.trim().length > 3) {
        aiConstraints = await extractConstraintsWithGroqAI(fromNode, toNode, problemText);
      }

      const mergedConstraints = applyQualityGate(aiConstraints, nlpConstraints);

      // 3. Compute Pareto-optimal multi-modal graph path across 150 nodes
      const clientResult = clientSideRouteOptimizerWithConstraints(fromId, toId, mergedConstraints);
      currentAnalysisResult = clientResult;
      renderAnalysisResults(clientResult);
      drawOptimalRouteOnMap(clientResult);
    } catch (err) {
      console.error("[Route Intelligence] Route calculation error:", err);
    } finally {
      isAnalyzing = false;
      setLoadingState(false);
    }
  }

  function setLoadingState(loading) {
    const btn = document.getElementById("analyzeRouteBtn");
    const sweep = document.getElementById("radarSweepLine");
    const badge = document.getElementById("mapStatusBadge");

    if (loading) {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-ring"></span> COMPUTING PARETO ROUTE...`;
      }
      if (sweep) sweep.style.display = "block";
      if (badge) {
        badge.innerHTML = `<span style="color: #38bdf8;">AI RISK UNDERWRITING // NETWORKX TRAVERSAL...</span>`;
      }
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `ANALYZE OPTIMAL PATH ↗`;
      }
      if (sweep) sweep.style.display = "none";
      if (badge) {
        badge.innerHTML = `<span style="color: #10b981;">PARETO-OPTIMAL ROUTE COMPUTED</span>`;
      }
    }
  }

  // --- 11. RENDER RESULT SUMMARY & QCT RADAR ---
  function renderAnalysisResults(result) {
    const summaryContainer = document.getElementById("routeIntelligenceSummary");
    if (!summaryContainer) return;

    const pathNodes = result.optimal_path || [];
    const fromNode = pathNodes[0] || NODES_MAP[currentFromId];
    const toNode = pathNodes[pathNodes.length - 1] || NODES_MAP[currentToId];

    // Build Node Sequence Trail
    const pathPillsHtml = pathNodes
      .map((n, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === pathNodes.length - 1;
        const modeBadgeClass = `badge-mode-${n.type.toLowerCase()}`;
        return `
          <div class="trail-node-card ${isFirst ? "trail-origin" : isLast ? "trail-dest" : ""}">
            <div class="trail-node-top">
              <span class="trail-mode-badge ${modeBadgeClass}">${n.type}</span>
              <span class="trail-step">STEP ${String(idx + 1).padStart(2, "0")}</span>
            </div>
            <strong class="trail-name">${n.name}</strong>
            <span class="trail-loc">${n.location}</span>
          </div>
          ${!isLast ? `<div class="trail-arrow">→</div>` : ""}
        `;
      })
      .join("");

    // Build Blocked / Avoided Areas List
    const blockedNodesList = result.blocked_nodes || [];
    const blockedHtml = (blockedNodesList.length > 0)
      ? blockedNodesList.map((bn) => `
          <span class="blocked-node-chip" title="${bn.location}">
            ⛔ ${bn.name} (${bn.type})
          </span>
        `).join("")
      : `<span style="color: #10b981; font-size: 11px;">✓ Zero corridor blockades active</span>`;

    const riskLevel = result.risk_level || "LOW";
    const riskClass = riskLevel === "LOW" ? "risk-low" : riskLevel === "MODERATE" ? "risk-mod" : "risk-high";

    const aiConstraints = result.ai_constraints || {};
    const disruptionType = (result.disruption_type || aiConstraints.disruption_type || "GENERAL_RISK").replace(/_/g, " ");
    const severity = aiConstraints.severity || (riskLevel === "CRITICAL" ? "CRITICAL" : "HIGH");
    const engineSource = aiConstraints.ai_engine_source || result.ai_engine_source || "HYBRID GROQ AI";
    const preferredMode = aiConstraints.preferred_transport_mode || (result.transport_modes ? result.transport_modes[0] : "ANY");
    const threatSummary = aiConstraints.ai_threat_summary || "";

    summaryContainer.innerHTML = `
      <!-- Verdict Header Banner -->
      <div class="verdict-banner-row">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="status-badge-mono" style="color: #10b981; border-color: rgba(16, 185, 129, 0.4); font-size: 10px;">
            ● OPTIMAL PATH FOUND
          </span>
          <span class="caption-uppercase" style="color: #ffffff; letter-spacing: 2px;">
            ${fromNode ? fromNode.name : "Origin"} ➔ ${toNode ? toNode.name : "Destination"}
          </span>
        </div>
        <div style="display: flex; gap: 8px;">
          <span class="risk-badge ${riskClass}">
            RISK ASSESSMENT: ${riskLevel} (${(result.risk_score * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      <!-- KPI Metrics Strip -->
      <div class="route-kpi-grid">
        <div class="route-kpi-cell">
          <span class="kpi-label">TOTAL DISTANCE</span>
          <strong class="kpi-val">${result.total_distance_km ? result.total_distance_km.toLocaleString() : 0} KM</strong>
          <span class="kpi-sub">${result.optimal_path ? result.optimal_path.length - 1 : 0} Logistical Hops</span>
        </div>
        <div class="route-kpi-cell">
          <span class="kpi-label">TRANSIT DURATION</span>
          <strong class="kpi-val" style="color: #38bdf8;">${result.estimated_transit_time_days ? result.estimated_transit_time_days.toFixed(1) : "0.0"} DAYS</strong>
          <span class="kpi-sub">${result.transport_modes ? result.transport_modes.join(" → ") : "DIRECT"}</span>
        </div>
        <div class="route-kpi-cell">
          <span class="kpi-label">LANDED FREIGHT COST</span>
          <strong class="kpi-val" style="color: #ffffff;">$${result.estimated_cost_usd ? result.estimated_cost_usd.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}</strong>
          <span class="kpi-sub">Direct Carrier Rate</span>
        </div>
        <div class="route-kpi-cell">
          <span class="kpi-label">CAPITAL CARRYING COST</span>
          <strong class="kpi-val" style="color: #f59e0b;">$${result.carrying_cost_usd ? result.carrying_cost_usd.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}</strong>
          <span class="kpi-sub">@ 7.20% Dynamic APR</span>
        </div>
      </div>

      <!-- Progressive Route Sequence Trail -->
      <div class="route-trail-section">
        <div class="trail-header">
          <span class="caption-uppercase" style="color: #ffffff; font-size: 10px;">OPTIMAL MULTIMODAL ROUTING SEQUENCE:</span>
          <span class="caption-uppercase" style="color: var(--muted); font-size: 9.5px;">MODAL TRANSITIONS DETECTED</span>
        </div>
        <div class="route-trail-scroll">
          ${pathPillsHtml}
        </div>
      </div>

      <!-- AI Underwriter Reasoning & Avoided Zone Breakdown -->
      <div class="reasoning-split-grid">
        <div class="reasoning-card">
          <div class="reasoning-title-row">
            <span class="caption-uppercase" style="color: #38bdf8; font-size: 9.5px; letter-spacing: 1.5px;">
              ⚡ AI DISRUPTION UNDERWRITER REASONING
            </span>
            <span class="status-badge-mono" style="color: #00f0ff; border-color: rgba(0, 240, 255, 0.4); font-size: 8px;">
              ${engineSource}
            </span>
          </div>
          ${threatSummary ? `
            <div style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; padding: 10px 12px; margin: 8px 0 12px 0; border-radius: 0 4px 4px 0;">
              <span style="font-size: 9px; color: #38bdf8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">AI GEOPOLITICAL THREAT SUMMARY</span>
              <p style="font-size: 12px; color: #e2e8f0; line-height: 1.5; margin: 0;">${threatSummary}</p>
            </div>
          ` : ""}
          <p class="reasoning-text">
            ${result.ai_analysis || "Optimal multi-modal routing calculated under standard risk parameters."}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
            <span class="status-badge-mono" style="font-size: 8px; color: #f59e0b; border-color: rgba(245, 158, 11, 0.3);">SHOCK: ${disruptionType}</span>
            <span class="status-badge-mono" style="font-size: 8px; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">SEVERITY: ${severity}</span>
            <span class="status-badge-mono" style="font-size: 8px; color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);">PREFERRED: ${preferredMode}</span>
            <span class="status-badge-mono" style="font-size: 8px; color: #10b981; border-color: rgba(16, 185, 129, 0.3);">OBJECTIVE: ${aiConstraints.user_routing_preference || "BALANCED"}</span>
          </div>
        </div>

        <div class="avoided-zones-card">
          <div class="reasoning-title-row">
            <span class="caption-uppercase" style="color: #ef4444; font-size: 9.5px; letter-spacing: 1.5px;">
              AVOIDED / RESTRICTED CORRIDORS
            </span>
            <span class="status-badge-mono" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3); font-size: 8px;">
              ${blockedNodesList.length} RESTRICTED
            </span>
          </div>
          <div class="blocked-nodes-wrap">
            ${blockedHtml}
          </div>
        </div>
      </div>
    `;

    // Render QCT Triangulation Triangle Radar
    renderQCTRadar(result);
  }

  // --- 12. QCT TRIANGULATION RADAR CONTROLLER ---
  function renderQCTRadar(result) {
    const radar = document.getElementById("radarSvg");
    if (!radar) return;

    radar.innerHTML = "";

    const size = 260;
    const cx = size / 2;
    const cy = size / 2;
    const r = 85;

    radar.setAttribute("viewBox", `0 0 ${size} ${size}`);

    // Concentric Level Grids (25%, 50%, 75%, 100%)
    [0.25, 0.5, 0.75, 1.0].forEach((scale) => {
      const gridPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const p1 = getTrianglePoint(cx, cy, r * scale, 0);       // Top (Quality)
      const p2 = getTrianglePoint(cx, cy, r * scale, 120);     // Bottom Right (Cost)
      const p3 = getTrianglePoint(cx, cy, r * scale, 240);     // Bottom Left (Time Velocity)
      gridPoly.setAttribute("points", `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`);
      gridPoly.setAttribute("fill", scale === 1.0 ? "rgba(255, 255, 255, 0.02)" : "none");
      gridPoly.setAttribute("stroke", "rgba(255, 255, 255, 0.14)");
      gridPoly.setAttribute("stroke-width", "1");
      radar.appendChild(gridPoly);
    });

    // 3 Axis Lines
    [0, 120, 240].forEach((angle) => {
      const p = getTrianglePoint(cx, cy, r, angle);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx);
      line.setAttribute("y1", cy);
      line.setAttribute("x2", p.x);
      line.setAttribute("y2", p.y);
      line.setAttribute("stroke", "rgba(255, 255, 255, 0.18)");
      line.setAttribute("stroke-dasharray", "2 2");
      radar.appendChild(line);
    });

    // Labels
    drawRadarLabel(radar, cx, cy - r - 12, "QUALITY (Q)", "#10b981");
    drawRadarLabel(radar, cx + r + 28, cy + (r * 0.55), "COST (C)", "#f59e0b");
    drawRadarLabel(radar, cx - r - 28, cy + (r * 0.55), "TIME (T)", "#38bdf8");

    // Dynamic Scores Calculation from Route Results
    const transitDays = result ? (result.estimated_transit_time_days || 14.0) : 14.0;
    const totalCost = result ? (result.estimated_cost_usd || 34500.0) : 34500.0;
    const riskScore = result ? (result.risk_score || 0.15) : 0.15;

    // Quality Score Q: 100 - (Risk * 40), nominal ~96.5%
    const qualityScore = Math.max(60, Math.min(99.5, Math.round((1.0 - riskScore * 0.45) * 1000) / 10));
    // Time Velocity Score T: 100 - (transitDays / 35.0) * 65
    const timeScore = Math.max(15, Math.min(99, Math.round(100 - (transitDays / 35.0) * 65)));
    // Cost Efficiency Score C: 100 - (totalCost / 40000.0) * 55
    const costScore = Math.max(20, Math.min(98, Math.round(100 - (totalCost / 40000.0) * 55)));

    const qNorm = Math.max(0.2, Math.min(1.0, qualityScore / 100.0));
    const cNorm = Math.max(0.2, Math.min(1.0, costScore / 100.0));
    const tNorm = Math.max(0.2, Math.min(1.0, timeScore / 100.0));

    const ptQuality = getTrianglePoint(cx, cy, r * qNorm, 0);
    const ptCost = getTrianglePoint(cx, cy, r * cNorm, 120);
    const ptTime = getTrianglePoint(cx, cy, r * tNorm, 240);

    const dataPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    dataPoly.setAttribute("points", `${ptQuality.x},${ptQuality.y} ${ptCost.x},${ptCost.y} ${ptTime.x},${ptTime.y}`);
    dataPoly.setAttribute("fill", "rgba(16, 185, 129, 0.25)");
    dataPoly.setAttribute("stroke", "#10b981");
    dataPoly.setAttribute("stroke-width", "2.0");
    radar.appendChild(dataPoly);

    // Vertex dots
    [ptQuality, ptCost, ptTime].forEach((pt) => {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
      dot.setAttribute("r", "3.5");
      dot.setAttribute("fill", "#ffffff");
      dot.setAttribute("stroke", "#10b981");
      dot.setAttribute("stroke-width", "1.5");
      radar.appendChild(dot);
    });

    // Update Label DOMs
    const qEl = document.getElementById("radarQualityLabel");
    const tEl = document.getElementById("radarTimeLabel");
    const cEl = document.getElementById("radarCostLabel");
    if (qEl) qEl.textContent = `${qualityScore.toFixed(1)}%`;
    if (tEl) tEl.textContent = `${timeScore}% (${transitDays.toFixed(1)}d)`;
    if (cEl) cEl.textContent = `${costScore}% ($${(totalCost / 1000).toFixed(1)}k)`;
  }

  function getTrianglePoint(cx, cy, radius, angleDeg) {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad)
    };
  }

  function drawRadarLabel(radar, x, y, title, color) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("fill", color);
    text.setAttribute("font-size", "8.5");
    text.setAttribute("font-weight", "600");
    text.setAttribute("letter-spacing", "1");
    text.setAttribute("font-family", "var(--font-mono, monospace)");
    text.setAttribute("text-anchor", "middle");
    text.textContent = title;
    radar.appendChild(text);
  }

  // --- 13. CLIENT-SIDE ADVANCED DIJKSTRA & MULTI-MODAL GRAPH OPTIMIZER ---
  function clientSideRouteOptimizerWithConstraints(fromId, toId, constraints) {
    const fromNode = NODES_MAP[fromId];
    const toNode = NODES_MAP[toId];
    if (!fromNode || !toNode) {
      return {
        optimal_path: [],
        path_node_ids: [],
        ai_analysis: "Invalid origin or destination node selected."
      };
    }

    if (fromId === toId) {
      return {
        from_node: fromNode,
        to_node: toNode,
        optimal_path: [fromNode],
        path_node_ids: [fromId],
        path_edges: [],
        blocked_nodes: [],
        transport_modes: [fromNode.type],
        total_distance_km: 0,
        estimated_transit_time_days: 0,
        estimated_cost_usd: 0,
        carrying_cost_usd: 0,
        risk_score: 0.05,
        risk_level: "LOW",
        ai_analysis: "Origin and destination are identical. Zero transit required.",
        ai_constraints: constraints || {}
      };
    }

    const aiConstraints = constraints || {};
    const blockedStraits = (aiConstraints.blocked_straits_or_chokepoints || []).map(s => s.toLowerCase());
    const keywords = (aiConstraints.keyword_identifiers || []).map(k => k.toLowerCase());
    const affectedRegions = (aiConstraints.affected_regions || []).map(r => r.toLowerCase());
    const blockedModes = aiConstraints.blocked_transport_modes || [];
    let preferredMode = aiConstraints.preferred_transport_mode || "ANY";
    const disruptionType = aiConstraints.disruption_type || "GENERAL_RISK";
    const userPref = aiConstraints.user_routing_preference || "BALANCED";

    if (preferredMode === "ANY") {
      if (fromNode.type === "SEA" && toNode.type === "SEA" && !blockedModes.includes("SEA")) preferredMode = "SEA";
      else if (fromNode.type === "AIR" && toNode.type === "AIR") preferredMode = "AIR";
      else if (fromNode.type === "RAIL" && toNode.type === "RAIL") preferredMode = "RAIL";
    }

    // 2. Identify Blocked Nodes
    const blockedNodes = [];
    const blockedNodeIds = new Set();

    RAW_150_NODES.forEach((node) => {
      if (node.id === fromId || node.id === toId) return;
      const nName = node.name.toLowerCase();
      const nLoc = node.location.toLowerCase();
      const nReg = (node.region || "").toLowerCase();

      let isBlocked = false;
      for (const s of blockedStraits) {
        if (nName.includes(s) || nLoc.includes(s)) {
          isBlocked = true;
          break;
        }
      }
      if (!isBlocked) {
        for (const kw of keywords) {
          if (kw.length > 2 && (nName.includes(kw) || nLoc.includes(kw) || nReg.includes(kw))) {
            if (node.type === "SEA" || disruptionType === "MILITARY_CONFLICT") {
              isBlocked = true;
              break;
            }
          }
        }
      }

      if (isBlocked) {
        blockedNodes.push(node);
        blockedNodeIds.add(node.id);
      }
    });

    // 3. Multi-Objective Pareto Weights
    let wTime = 0.35, wCost = 0.35, wRisk = 0.30;
    if (userPref === "FASTEST" || preferredMode === "AIR") {
      wTime = 0.60; wCost = 0.20; wRisk = 0.20;
    } else if (userPref === "CHEAPEST" && !blockedModes.includes("SEA")) {
      wTime = 0.20; wCost = 0.60; wRisk = 0.20;
    } else if (userPref === "SAFEST" || disruptionType === "MILITARY_CONFLICT") {
      wTime = 0.25; wCost = 0.25; wRisk = 0.50;
    } else if (preferredMode === "RAIL") {
      wTime = 0.35; wCost = 0.40; wRisk = 0.25;
    }

    // 4. Build Adjacency List for Dijkstra
    const adj = {};
    RAW_150_NODES.forEach((n) => { adj[n.id] = []; });

    ALL_EDGES.forEach((e) => {
      const u = e.u;
      const v = e.v;
      const eMode = e.mode;
      const eName = (e.name || "").toLowerCase();

      let isEdgeBlocked = blockedNodeIds.has(u) || blockedNodeIds.has(v);
      if (!isEdgeBlocked) {
        for (const s of blockedStraits) {
          if (eName.includes(s)) { isEdgeBlocked = true; break; }
        }
      }

      // If SEA is explicitly blocked (e.g. War in Indian Ocean), block all pure sea edges in affected zone
      if (!isEdgeBlocked && blockedModes.includes("SEA") && eMode === "SEA") {
        isEdgeBlocked = true;
      }
      if (!isEdgeBlocked && blockedModes.includes("AIR") && eMode === "AIR") {
        isEdgeBlocked = true;
      }
      if (!isEdgeBlocked && blockedModes.includes("RAIL") && eMode === "RAIL") {
        isEdgeBlocked = true;
      }

      const penaltyMultiplier = isEdgeBlocked ? 50000.0 : 1.0;
      const effectiveRisk = isEdgeBlocked ? 0.99 : (e.base_risk || 0.05);

      let modePrefFactor = 1.0;
      if (preferredMode !== "ANY" && eMode !== preferredMode && eMode !== "INTERMODAL") {
        modePrefFactor = 2.5;
      }
      const isIntermodal = (eMode === "INTERMODAL");
      const intermodalPenalty = isIntermodal ? 1.0 : 1.0;

      const normCost = (e.freight_cost_usd || 3000.0) / 10000.0;
      const normTime = (e.transit_days || 2.0) / 7.0;
      const normRisk = effectiveRisk * 15.0;

      const weight = (wCost * normCost + wTime * normTime + wRisk * normRisk) * penaltyMultiplier * modePrefFactor * intermodalPenalty;

      adj[u].push({
        to: v,
        weight: weight,
        edge: e,
        effectiveRisk: effectiveRisk,
        isBlocked: isEdgeBlocked
      });
    });

    // 5. Dijkstra Algorithm
    const dist = {};
    const prev = {};
    const unvisited = new Set(RAW_150_NODES.map(n => n.id));

    RAW_150_NODES.forEach((n) => { dist[n.id] = Infinity; });
    dist[fromId] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let minD = Infinity;
      for (const nid of unvisited) {
        if (dist[nid] < minD) {
          minD = dist[nid];
          current = nid;
        }
      }

      if (!current || minD === Infinity || current === toId) break;
      unvisited.delete(current);

      const neighbors = adj[current] || [];
      for (const edgeObj of neighbors) {
        const neighbor = edgeObj.to;
        if (!unvisited.has(neighbor)) continue;

        const newDist = dist[current] + edgeObj.weight;
        if (newDist < dist[neighbor]) {
          dist[neighbor] = newDist;
          prev[neighbor] = current;
        }
      }
    }

    // 6. Reconstruct Optimal Path
    const pathIds = [];
    let curr = toId;
    while (curr) {
      pathIds.unshift(curr);
      curr = prev[curr];
    }

    if (pathIds.length < 2 && fromId !== toId) {
      pathIds.length = 0;
      pathIds.push(fromId, toId);
    }

    const optimalPath = pathIds.map(nid => NODES_MAP[nid]).filter(Boolean);
    const pathEdges = [];
    let totalDist = 0.0;
    let totalTime = 0.0;
    let totalCost = 0.0;
    let riskAccum = 0.0;
    const modesSeen = [];

    for (let i = 0; i < pathIds.length - 1; i++) {
      const uId = pathIds[i];
      const vId = pathIds[i + 1];
      const foundEdge = (adj[uId] || []).find(e => e.to === vId);
      const eData = foundEdge ? foundEdge.edge : {
        distance_km: haversineKm(NODES_MAP[uId].lat, NODES_MAP[uId].lng, NODES_MAP[vId].lat, NODES_MAP[vId].lng),
        transit_days: 2.0,
        freight_cost_usd: 3500.0,
        mode: NODES_MAP[vId].type,
        name: `${NODES_MAP[uId].name} to ${NODES_MAP[vId].name}`
      };

      const d = eData.distance_km || 1000;
      const t = eData.transit_days || 2.0;
      const c = eData.freight_cost_usd || 3000.0;
      const r = foundEdge ? foundEdge.effectiveRisk : 0.05;
      const m = eData.mode || NODES_MAP[vId].type;

      totalDist += d;
      totalTime += t;
      totalCost += c;
      riskAccum += r;

      if (!modesSeen.includes(m)) modesSeen.push(m);

      pathEdges.push({
        u: uId,
        v: vId,
        from_name: NODES_MAP[uId].name,
        to_name: NODES_MAP[vId].name,
        mode: m,
        name: eData.name,
        distance_km: Math.round(d * 10) / 10,
        transit_days: Math.round(t * 10) / 10,
        freight_cost_usd: Math.round(c * 100) / 100,
        risk: Math.round(r * 100) / 100
      });
    }

    const numHops = Math.max(1, pathEdges.length);
    const compositeRisk = Math.min(0.95, Math.round((riskAccum / numHops + (0.01 * numHops)) * 100) / 100);
    const riskLevel = compositeRisk < 0.25 ? "LOW" : compositeRisk < 0.55 ? "MODERATE" : compositeRisk < 0.75 ? "HIGH" : "CRITICAL";
    const carryingCost = Math.round(350000.0 * 0.072 * (totalTime / 365.0) * 100) / 100;

    const avoidedNames = blockedNodes.slice(0, 4).map(b => b.name);
    const pathSummaryStr = optimalPath.map(n => n.name).join(" → ");

    let aiReasoning = "";
    if (blockedNodes.length > 0 || (aiConstraints.affected_regions && aiConstraints.affected_regions.length > 0)) {
      const aff = (aiConstraints.affected_regions || []).slice(0, 2).join(", ") || avoidedNames.join(", ") || "Active Conflict Zone";
      aiReasoning = `STRATEGIC ROUTE VERDICT: Circumvented active ${disruptionType.replace(/_/g, " ")} (${aff}). Computed Pareto-optimal corridor via ${pathSummaryStr}. Landed freight locked at $${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} across ${totalTime.toFixed(1)} transit days (${riskLevel} Risk Profile).`;
    } else {
      aiReasoning = `OPTIMAL ROUTE COMPUTED: Operating along nominal global corridors. The selected pathway (${pathSummaryStr}) achieves optimal equilibrium between transit velocity (${totalTime.toFixed(1)} days) and capital efficiency ($${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`;
    }

    return {
      from_node: fromNode,
      to_node: toNode,
      optimal_path: optimalPath,
      path_node_ids: pathIds,
      path_edges: pathEdges,
      blocked_nodes: blockedNodes,
      transport_modes: modesSeen.length > 0 ? modesSeen : [fromNode.type],
      total_distance_km: Math.round(totalDist * 10) / 10,
      estimated_transit_time_days: Math.round(totalTime * 10) / 10,
      estimated_cost_usd: Math.round(totalCost * 100) / 100,
      carrying_cost_usd: carryingCost,
      risk_score: compositeRisk,
      risk_level: riskLevel,
      ai_analysis: aiReasoning,
      ai_constraints: aiConstraints
    };
  }

  function clientSideRouteOptimizer(fromId, toId, problemText) {
    const nlp = extractConstraintsDeterministicNLP(problemText);
    return clientSideRouteOptimizerWithConstraints(fromId, toId, nlp);
  }

  // --- 14. PRESET SHOCKS ---
  function applyPresetScenario(presetKey) {
    const problemInput = document.getElementById("routeProblemInput");
    const fromSelect = document.getElementById("fromNodeSelect");
    const toSelect = document.getElementById("toNodeSelect");

    const presets = {
      hormuz: {
        from: "sea_41",
        to: "sea_33",
        text: "Oil shipment from India to Europe. Avoid Strait of Hormuz and Persian Gulf conflict zone due to active naval engagements and elevated regional risk."
      },
      suez: {
        from: "sea_41",
        to: "sea_33",
        text: "Red Sea and Bab-el-Mandeb are blocked due to missile strikes. Suez Canal impassable. Find alternative ocean or rail route from India to Western Europe."
      },
      panama: {
        from: "sea_21",
        to: "sea_45",
        text: "Panama Canal draft restrictions and 3-week vessel transit backlog due to Lake Gatun drought. Reroute cargo from Shanghai to New York via West Coast Intermodal rail land-bridge."
      },
      airspace: {
        from: "air_03",
        to: "air_11",
        text: "Trans-Siberian and Eastern European airspace closed due to armed conflict. Urgent semiconductor cargo from Shanghai to Frankfurt. Find optimal safe air corridor."
      },
      malacca: {
        from: "sea_28",
        to: "sea_40",
        text: "High piracy and naval drill alert in Strait of Malacca. Route maritime freight from Hong Kong to Colombo via Sunda or Lombok bypass corridors."
      },
      urgent_pharma: {
        from: "air_43",
        to: "air_20",
        text: "Temperature-sensitive biologics from Mumbai to Paris. Maximize transit velocity and minimize handling dwell time."
      }
    };

    const sel = presets[presetKey];
    if (!sel) return;

    if (fromSelect) fromSelect.value = sel.from;
    if (toSelect) toSelect.value = sel.to;
    updateComboboxDisplay("from", sel.from);
    updateComboboxDisplay("to", sel.to);
    if (problemInput) problemInput.value = sel.text;

    currentFromId = sel.from;
    currentToId = sel.to;
    renderLeafletMarkers();

    analyzeRoute(sel.from, sel.to, sel.text);
  }

  // --- 15. MAP CONTROLS (ZOOM, FILTER, TOGGLE) ---
  function setFilter(filterType) {
    activeFilter = filterType;

    document.querySelectorAll(".map-filter-btn").forEach((btn) => {
      if (btn.getAttribute("data-filter") === filterType) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    renderLeafletMarkers();
  }

  function focusRoute() {
    if (!leafletMap || !currentAnalysisResult || !currentAnalysisResult.optimal_path) return;
    const coords = currentAnalysisResult.optimal_path.map((n) => [n.lat, n.lng]);
    if (coords.length > 0) {
      leafletMap.flyToBounds(L.latLngBounds(coords), {
        padding: [60, 60],
        maxZoom: 6,
        duration: 1.2
      });
    }
  }

  function resetView() {
    if (!leafletMap) return;
    leafletMap.flyTo([24.0, 30.0], 2.2, { duration: 1.2 });
  }

  function toggleBasemap() {
    if (!leafletMap || !tileLayerDark || !tileLayerSatellite) return;
    const btn = document.getElementById("btnToggleBasemap");

    if (currentBasemapType === "dark") {
      leafletMap.removeLayer(tileLayerDark);
      tileLayerSatellite.addTo(leafletMap);
      currentBasemapType = "satellite";
      if (btn) btn.innerHTML = "🌑 DARK MATTER";
    } else {
      leafletMap.removeLayer(tileLayerSatellite);
      tileLayerDark.addTo(leafletMap);
      currentBasemapType = "dark";
      if (btn) btn.innerHTML = "🛰️ SATELLITE";
    }
  }

  function setupEventListeners() {
    // Window resize handler for Leaflet
    window.addEventListener("resize", () => {
      if (leafletMap) leafletMap.invalidateSize();
    });

    // Enter key listener on disruption problem input
    const problemInput = document.getElementById("routeProblemInput");
    if (problemInput) {
      problemInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          analyzeCurrentSelection();
        }
      });
    }

    // React Bits "Decrypted Text" Animation Controller
    initDecryptedText();
  }

  // --- REACT BITS "DECRYPTED TEXT" ANIMATION CONTROLLER (HIGH-PERFORMANCE 60FPS) ---
  function initDecryptedText() {
    const el = document.getElementById("decryptedTitle");
    if (!el) return;

    const originalText = el.getAttribute("data-text") || el.textContent.trim();
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]<>~";
    const chars = originalText.split("");
    const total = chars.length;

    // Pre-create persistent span nodes once (zero DOM thrashing / zero layout reflow lag)
    el.innerHTML = "";
    const spanNodes = chars.map((ch) => {
      const s = document.createElement("span");
      if (ch === " ") {
        s.textContent = " ";
        s.className = "char-space";
      } else {
        s.textContent = ch;
        s.className = "char-revealed";
      }
      el.appendChild(s);
      return s;
    });

    let isDecrypting = false;
    let animFrameId = null;

    function runDecryption() {
      if (isDecrypting) return;
      isDecrypting = true;

      const startTime = performance.now();
      const totalDuration = 950; // Smooth medium speed (950ms) — perceptible decryption, 100% lag-free

      function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / totalDuration);
        const lockIndex = Math.floor(progress * total);

        for (let i = 0; i < total; i++) {
          if (chars[i] === " " || chars[i] === "&") {
            continue;
          }

          if (i <= lockIndex) {
            spanNodes[i].textContent = chars[i];
            spanNodes[i].className = "char-revealed";
          } else {
            spanNodes[i].textContent = characters[(Math.random() * characters.length) | 0];
            spanNodes[i].className = "char-scrambled";
          }
        }

        if (progress < 1.0) {
          animFrameId = requestAnimationFrame(frame);
        } else {
          // Final clean lock
          for (let i = 0; i < total; i++) {
            spanNodes[i].textContent = chars[i];
            spanNodes[i].className = chars[i] === " " ? "char-space" : "char-revealed";
          }
          isDecrypting = false;
        }
      }

      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(frame);
    }

    // Run on startup
    runDecryption();

    // Re-run on hover with debounce
    el.addEventListener("mouseenter", () => {
      if (!isDecrypting) runDecryption();
    });
  }

  // --- 16. PUBLIC EXPORTS ---
  window.RouteMap = {
    init: initRouteMap,
    setFilter: setFilter,
    focusRoute: focusRoute,
    resetView: resetView,
    toggleBasemap: toggleBasemap,
    setOrigin: setOrigin,
    setDestination: setDestination,
    analyzeCurrentSelection: analyzeCurrentSelection,
    applyPresetScenario: applyPresetScenario,
    getNodes: () => RAW_150_NODES,
    calculateRoute: clientSideRouteOptimizer,
    extractConstraints: extractConstraintsDeterministicNLP
  };

  // Auto-initialize when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouteMap);
  } else {
    initRouteMap();
  }
})();
