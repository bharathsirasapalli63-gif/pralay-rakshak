"""
Regional Landslide Inventory, IoT Sensor Telemetry & Infrastructure Registry
Specialized for the North Eastern Region of India (Assam, Meghalaya, Sikkim, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura).
"""

import time
import math
import random
from typing import Dict, Any, List, Optional

# Initial Seed Data for IoT Sensor Corridors
SENSORS_DATABASE: List[Dict[str, Any]] = [
    {
        "id": "SNS-SK-01",
        "name": "NH-10 Sevoke - 29th Mile Sensor Cluster",
        "state": "Sikkim",
        "district": "Kalimpong / East Sikkim Border",
        "corridor": "NH-10 Siliguri-Gangtok Lifeline",
        "coordinates": [27.0521, 88.4820],
        "slope_deg": 46.5,
        "lithology": "Weathered Schist / Phyllite (Daling Group)",
        "fault_distance_km": 1.2,
        "vegetation_ndvi": 0.38,
        "inclinometer_tilt_deg": 4.8,
        "displacement_velocity_mm_hr": 1.85,
        "piezometer_pwp_kpa": 32.4,
        "soil_moisture_vwc_pct": 43.2,
        "rainfall_1h_mm": 18.5,
        "rainfall_24h_mm": 138.0,
        "rainfall_72h_mm": 245.0,
        "past_5day_rainfall": [45.0, 52.0, 85.0, 110.0, 138.0],
        "status": "CRITICAL",
        "last_updated": int(time.time())
    },
    {
        "id": "SNS-ML-02",
        "name": "NH-6 Sonapur Tunnel & Kleriat Slopes",
        "state": "Meghalaya",
        "district": "East Jaintia Hills",
        "corridor": "NH-6 Shillong-Silchar Corridor",
        "coordinates": [25.1245, 92.3610],
        "slope_deg": 42.0,
        "lithology": "Sandstone / Clay interbedding (Surma Group)",
        "fault_distance_km": 3.8,
        "vegetation_ndvi": 0.42,
        "inclinometer_tilt_deg": 3.2,
        "displacement_velocity_mm_hr": 1.20,
        "piezometer_pwp_kpa": 27.5,
        "soil_moisture_vwc_pct": 39.8,
        "rainfall_1h_mm": 12.0,
        "rainfall_24h_mm": 98.0,
        "rainfall_72h_mm": 185.0,
        "past_5day_rainfall": [30.0, 42.0, 65.0, 88.0, 98.0],
        "status": "ALERT",
        "last_updated": int(time.time())
    },
    {
        "id": "SNS-NL-03",
        "name": "NH-29 Kohima-Dimapur Bypass (Phesama)",
        "state": "Nagaland",
        "district": "Kohima",
        "corridor": "NH-29 Kohima Lifeline",
        "coordinates": [25.6420, 94.0845],
        "slope_deg": 38.5,
        "lithology": "Shale / Siltstone (Disang / Barail Formation)",
        "fault_distance_km": 2.1,
        "vegetation_ndvi": 0.40,
        "inclinometer_tilt_deg": 2.1,
        "displacement_velocity_mm_hr": 0.65,
        "piezometer_pwp_kpa": 19.8,
        "soil_moisture_vwc_pct": 34.5,
        "rainfall_1h_mm": 6.5,
        "rainfall_24h_mm": 62.0,
        "rainfall_72h_mm": 124.0,
        "past_5day_rainfall": [20.0, 28.0, 45.0, 55.0, 62.0],
        "status": "WATCH",
        "last_updated": int(time.time())
    },
    {
        "id": "SNS-AS-04",
        "name": "Dima Hasao Hill Section (Haflong-Jatinga)",
        "state": "Assam",
        "district": "Dima Hasao",
        "corridor": "Lumding-Silchar Railway & NH-27",
        "coordinates": [25.1840, 93.0320],
        "slope_deg": 35.0,
        "lithology": "Colluvial Debris / Overburden",
        "fault_distance_km": 4.5,
        "vegetation_ndvi": 0.52,
        "inclinometer_tilt_deg": 1.4,
        "displacement_velocity_mm_hr": 0.35,
        "piezometer_pwp_kpa": 15.2,
        "soil_moisture_vwc_pct": 31.0,
        "rainfall_1h_mm": 4.0,
        "rainfall_24h_mm": 48.0,
        "rainfall_72h_mm": 95.0,
        "past_5day_rainfall": [15.0, 22.0, 32.0, 40.0, 48.0],
        "status": "NORMAL",
        "last_updated": int(time.time())
    },
    {
        "id": "SNS-AR-05",
        "name": "Tawang Sela Pass Axis (Bhalukpong-Bomdila)",
        "state": "Arunachal Pradesh",
        "district": "West Kameng",
        "corridor": "NH-13 Trans-Arunachal Highway",
        "coordinates": [27.5020, 92.1050],
        "slope_deg": 49.0,
        "lithology": "Weathered Schist / Phyllite (Daling Group)",
        "fault_distance_km": 1.9,
        "vegetation_ndvi": 0.28,
        "inclinometer_tilt_deg": 3.9,
        "displacement_velocity_mm_hr": 1.45,
        "piezometer_pwp_kpa": 24.8,
        "soil_moisture_vwc_pct": 37.6,
        "rainfall_1h_mm": 14.2,
        "rainfall_24h_mm": 112.0,
        "rainfall_72h_mm": 190.0,
        "past_5day_rainfall": [28.0, 40.0, 75.0, 95.0, 112.0],
        "status": "ALERT",
        "last_updated": int(time.time())
    },
    {
        "id": "SNS-MN-06",
        "name": "NH-37 Imphal-Jiribam (Tupul Railway Corridor)",
        "state": "Manipur",
        "district": "Noney",
        "corridor": "NH-37 Lifeline & Tupul Yard",
        "coordinates": [24.7890, 93.6820],
        "slope_deg": 41.5,
        "lithology": "Shale / Siltstone (Disang / Barail Formation)",
        "fault_distance_km": 2.5,
        "vegetation_ndvi": 0.35,
        "inclinometer_tilt_deg": 2.8,
        "displacement_velocity_mm_hr": 0.95,
        "piezometer_pwp_kpa": 22.1,
        "soil_moisture_vwc_pct": 38.0,
        "rainfall_1h_mm": 8.0,
        "rainfall_24h_mm": 84.0,
        "rainfall_72h_mm": 145.0,
        "past_5day_rainfall": [18.0, 30.0, 50.0, 68.0, 84.0],
        "status": "ALERT",
        "last_updated": int(time.time())
    },
    {
        "id": "SNS-MZ-07",
        "name": "NH-54 Aizawl - Hunthar Veng Slip Zone",
        "state": "Mizoram",
        "district": "Aizawl",
        "corridor": "NH-54 / NH-306 Gateway",
        "coordinates": [23.7380, 92.7090],
        "slope_deg": 37.0,
        "lithology": "Sandstone / Clay interbedding (Surma Group)",
        "fault_distance_km": 4.1,
        "vegetation_ndvi": 0.44,
        "inclinometer_tilt_deg": 1.9,
        "displacement_velocity_mm_hr": 0.48,
        "piezometer_pwp_kpa": 17.6,
        "soil_moisture_vwc_pct": 33.2,
        "rainfall_1h_mm": 5.2,
        "rainfall_24h_mm": 56.0,
        "rainfall_72h_mm": 105.0,
        "past_5day_rainfall": [12.0, 24.0, 38.0, 48.0, 56.0],
        "status": "WATCH",
        "last_updated": int(time.time())
    },
    {
        "id": "SNS-TR-08",
        "name": "Jampui Hills Hillside Sector",
        "state": "Tripura",
        "district": "North Tripura",
        "corridor": "NH-208 / Vanghmun Ridge Road",
        "coordinates": [23.9510, 92.2780],
        "slope_deg": 28.0,
        "lithology": "Sandstone / Clay interbedding (Surma Group)",
        "fault_distance_km": 6.2,
        "vegetation_ndvi": 0.65,
        "inclinometer_tilt_deg": 0.8,
        "displacement_velocity_mm_hr": 0.15,
        "piezometer_pwp_kpa": 11.0,
        "soil_moisture_vwc_pct": 25.5,
        "rainfall_1h_mm": 2.0,
        "rainfall_24h_mm": 28.0,
        "rainfall_72h_mm": 52.0,
        "past_5day_rainfall": [8.0, 12.0, 18.0, 24.0, 28.0],
        "status": "NORMAL",
        "last_updated": int(time.time())
    }
]

# Arterial National Highway Network with nodes, coordinates, status & detours
HIGHWAY_NETWORK = [
    {
        "id": "HW-NH10",
        "name": "NH-10 (Siliguri - Sevoke - Rangpo - Gangtok)",
        "state": "Sikkim & West Bengal",
        "status": "BLOCKED",
        "blockage_reason": "Massive debris flow at 29th Mile & Birik Dara; active rockfall",
        "est_clearance_hours": 18,
        "clearance_agency": "BRO Project Swastik",
        "detour_route": "Via Gorubathan - Lava - Reshi - Rhenock - Rongpo (Light Vehicles Only)",
        "coordinates": [
            [26.8820, 88.4350], # Siliguri
            [26.9620, 88.4720], # Sevoke
            [27.0521, 88.4820], # 29th Mile (Blockage)
            [27.1750, 88.5320], # Rangpo
            [27.3314, 88.6138]  # Gangtok
        ],
        "risk_rating": "CRITICAL"
    },
    {
        "id": "HW-NH6",
        "name": "NH-6 (Shillong - Jowai - Sonapur - Silchar)",
        "state": "Meghalaya & Assam",
        "status": "RESTRICTED",
        "blockage_reason": "Single-lane traffic movement at Sonapur Tunnel mouth due to slush & mudflow",
        "est_clearance_hours": 6,
        "clearance_agency": "NHAI & Meghalaya PWD",
        "detour_route": "Heavy trucks regulated at Khliehriat; alternate via Umrangso-Halflong",
        "coordinates": [
            [25.5788, 91.8933], # Shillong
            [25.4480, 92.2030], # Jowai
            [25.1245, 92.3610], # Sonapur
            [24.8333, 92.7789]  # Silchar
        ],
        "risk_rating": "HIGH"
    },
    {
        "id": "HW-NH29",
        "name": "NH-29 (Dimapur - Chumukedima - Kohima - Mao)",
        "state": "Nagaland & Manipur",
        "status": "RESTRICTED",
        "blockage_reason": "Subsidence near Old KMC Dumping Ground & Phesama crack expansion",
        "est_clearance_hours": 8,
        "clearance_agency": "BRO Project Sewak",
        "detour_route": "Peducha-Tsiesema 10-Mile Bypass for passenger cars",
        "coordinates": [
            [25.9080, 93.7270], # Dimapur
            [25.8150, 93.8120], # Chumukedima
            [25.6420, 94.0845], # Kohima Phesama
            [25.5120, 94.1350]  # Mao Gate
        ],
        "risk_rating": "MODERATE"
    },
    {
        "id": "HW-NH27",
        "name": "NH-27 / East-West Corridor (Guwahati - Nagaon - Lumding - Haflong)",
        "state": "Assam",
        "status": "CLEAR",
        "blockage_reason": "All lanes operational with precautionary patrol at Jatinga Lampu",
        "est_clearance_hours": 0,
        "clearance_agency": "NHAI Regional Office Guwahati",
        "detour_route": "Standard Corridor",
        "coordinates": [
            [26.1445, 91.7362], # Guwahati
            [26.3450, 92.6840], # Nagaon
            [25.7520, 93.1720], # Lumding
            [25.1840, 93.0320]  # Haflong
        ],
        "risk_rating": "LOW"
    },
    {
        "id": "HW-NH13",
        "name": "NH-13 Trans-Arunachal Highway (Bhalukpong - Tenga - Bomdila - Tawang)",
        "state": "Arunachal Pradesh",
        "status": "RESTRICTED",
        "blockage_reason": "Rockfall near Munna Camp and Sela Tunnel approach road",
        "est_clearance_hours": 12,
        "clearance_agency": "BRO Project Vartak",
        "detour_route": "Via Rupa-Kalaktang Axis",
        "coordinates": [
            [27.0140, 92.6450], # Bhalukpong
            [27.2640, 92.4210], # Bomdila
            [27.5020, 92.1050], # Sela
            [27.5861, 91.8594]  # Tawang
        ],
        "risk_rating": "HIGH"
    },
    {
        "id": "HW-NH37",
        "name": "NH-37 (Imphal - Noney - Tupul - Jiribam)",
        "state": "Manipur",
        "status": "RESTRICTED",
        "blockage_reason": "Debris clearance near Awangkhul and Noney Bridge",
        "est_clearance_hours": 10,
        "clearance_agency": "NHIDCL & Manipur PWD",
        "detour_route": "Old Cachar Road (Restricted 4x4 Only)",
        "coordinates": [
            [24.8170, 93.9368], # Imphal
            [24.7890, 93.6820], # Tupul / Noney
            [24.8010, 93.1250]  # Jiribam
        ],
        "risk_rating": "HIGH"
    }
]

# Relief Shelters, Disaster Camps, Helipads & SDRF Bases
SHELTERS_DATABASE = [
    {
        "id": "SHL-SK-01",
        "name": "Rangpo Multi-Purpose Disaster Relief Camp",
        "state": "Sikkim",
        "district": "Pakyong",
        "type": "Designated Evacuation Shelter",
        "coordinates": [27.1790, 88.5290],
        "capacity_persons": 850,
        "current_occupancy": 120,
        "medical_officer_available": True,
        "helipad_ready": True,
        "emergency_contact": "+91-3592-202394",
        "sdrf_team_stationed": "Sikkim SDRF 2nd Platoon"
    },
    {
        "id": "SHL-SK-02",
        "name": "Gangtok Indoor Stadium Emergency Center",
        "state": "Sikkim",
        "district": "East Sikkim",
        "type": "Primary City Shelter",
        "coordinates": [27.3290, 88.6110],
        "capacity_persons": 1500,
        "current_occupancy": 45,
        "medical_officer_available": True,
        "helipad_ready": True,
        "emergency_contact": "+91-3592-202111",
        "sdrf_team_stationed": "NDRF 2nd Bn Unit Gangtok"
    },
    {
        "id": "SHL-ML-01",
        "name": "Khliehriat Government College Relief Hub",
        "state": "Meghalaya",
        "district": "East Jaintia Hills",
        "type": "District Emergency Shelter",
        "coordinates": [25.3580, 92.3650],
        "capacity_persons": 600,
        "current_occupancy": 85,
        "medical_officer_available": True,
        "helipad_ready": False,
        "emergency_contact": "+91-3655-220022",
        "sdrf_team_stationed": "Meghalaya SDRF Team Alpha"
    },
    {
        "id": "SHL-NL-01",
        "name": "Kohima High School Ground Relief Center",
        "state": "Nagaland",
        "district": "Kohima",
        "type": "Community Evacuation Center",
        "coordinates": [25.6740, 94.1080],
        "capacity_persons": 1200,
        "current_occupancy": 30,
        "medical_officer_available": True,
        "helipad_ready": True,
        "emergency_contact": "+91-370-2290055",
        "sdrf_team_stationed": "Nagaland SDRF Bn 1"
    },
    {
        "id": "SHL-AS-01",
        "name": "Haflong Government Boys Higher Secondary Relief Camp",
        "state": "Assam",
        "district": "Dima Hasao",
        "type": "District Disaster Shelter",
        "coordinates": [25.1780, 93.0250],
        "capacity_persons": 900,
        "current_occupancy": 65,
        "medical_officer_available": True,
        "helipad_ready": True,
        "emergency_contact": "+91-3673-236224",
        "sdrf_team_stationed": "Assam SDRF Unit Silchar / Haflong"
    },
    {
        "id": "SHL-AR-01",
        "name": "Dirang Sports Complex Emergency Base",
        "state": "Arunachal Pradesh",
        "district": "West Kameng",
        "type": "High Altitude Relief Shelter",
        "coordinates": [27.3550, 92.2350],
        "capacity_persons": 750,
        "current_occupancy": 15,
        "medical_officer_available": True,
        "helipad_ready": True,
        "emergency_contact": "+91-3780-222211",
        "sdrf_team_stationed": "12th Bn NDRF Itanagar Detachment"
    },
    {
        "id": "SHL-MN-01",
        "name": "Noney District Headquarters Relief Center",
        "state": "Manipur",
        "district": "Noney",
        "type": "Valley Safe Zone",
        "coordinates": [24.7950, 93.6550],
        "capacity_persons": 650,
        "current_occupancy": 40,
        "medical_officer_available": True,
        "helipad_ready": True,
        "emergency_contact": "+91-385-2451000",
        "sdrf_team_stationed": "Manipur Fire & Emergency Services"
    },
    {
        "id": "SHL-MZ-01",
        "name": "Aizawl Tourist Lodge Shelter & Base",
        "state": "Mizoram",
        "district": "Aizawl",
        "type": "Safe Ridge Evacuation Point",
        "coordinates": [23.7250, 92.7180],
        "capacity_persons": 500,
        "current_occupancy": 10,
        "medical_officer_available": True,
        "helipad_ready": False,
        "emergency_contact": "+91-389-2322238",
        "sdrf_team_stationed": "Mizoram Disaster Response Force"
    }
]

# Historical Landslide Hazard Zones & High Susceptibility Polygons
HAZARD_POLYGONS = [
    {
        "id": "HAZ-SK-01",
        "name": "Sevoke-Rongpo Active Slide Corridor",
        "state": "Sikkim / WB",
        "risk_level": "RED",
        "lhi_score": 88.5,
        "trigger_cause": "Intense Monsoon Rainfall & Tectonic Shear in Daling Schists",
        "vulnerable_villages": ["29th Mile", "Birik Dara", "Sethijhora", "Rambhi Bazar"],
        "estimated_population_at_risk": 4200,
        "polygon_coords": [
            [27.0200, 88.4600],
            [27.0800, 88.4700],
            [27.0900, 88.5100],
            [27.0300, 88.5000]
        ]
    },
    {
        "id": "HAZ-ML-02",
        "name": "Sonapur-Ratacherra Colluvial Slump Zone",
        "state": "Meghalaya",
        "risk_level": "ORANGE",
        "lhi_score": 76.2,
        "trigger_cause": "Heavy Orographic Precipitation & Sandstone Dip Slope Shear",
        "vulnerable_villages": ["Sonapur", "Khasimara", "Ratacherra", "Dona Umbluh"],
        "estimated_population_at_risk": 2800,
        "polygon_coords": [
            [25.1000, 92.3400],
            [25.1500, 92.3500],
            [25.1600, 92.3900],
            [25.1100, 92.3800]
        ]
    },
    {
        "id": "HAZ-NL-03",
        "name": "Kohima South Creep & Subsidence Belt",
        "state": "Nagaland",
        "risk_level": "YELLOW",
        "lhi_score": 58.4,
        "trigger_cause": "Disang Shale Weathering & Anthropogenic Road Cutting",
        "vulnerable_villages": ["Phesama", "Kigwema", "Jakhama", "Viswema"],
        "estimated_population_at_risk": 6500,
        "polygon_coords": [
            [25.6100, 94.0600],
            [25.6600, 94.0700],
            [25.6700, 94.1100],
            [25.6200, 94.1000]
        ]
    },
    {
        "id": "HAZ-AS-04",
        "name": "Jatinga-Mahur Railway Debris Sinks",
        "state": "Assam",
        "risk_level": "YELLOW",
        "lhi_score": 52.0,
        "trigger_cause": "Saturated Colluvium Overburden on Steep Terrace Slopes",
        "vulnerable_villages": ["Jatinga", "New Haflong", "Lampu", "Bagetar"],
        "estimated_population_at_risk": 3100,
        "polygon_coords": [
            [25.1600, 93.0100],
            [25.2100, 93.0200],
            [25.2200, 93.0600],
            [25.1700, 93.0500]
        ]
    },
    {
        "id": "HAZ-AR-05",
        "name": "Bhalukpong-Tenga Shear Zone",
        "state": "Arunachal Pradesh",
        "risk_level": "ORANGE",
        "lhi_score": 74.0,
        "trigger_cause": "Main Boundary Thrust (MBT) Proximity & Flash Deluges",
        "vulnerable_villages": ["Sessa", "Tipi", "Munna Camp", "Nag Mandir"],
        "estimated_population_at_risk": 1900,
        "polygon_coords": [
            [27.0500, 92.5800],
            [27.1200, 92.5900],
            [27.1400, 92.6500],
            [27.0700, 92.6400]
        ]
    }
]

# Field Incident Reports in-memory store
INCIDENT_REPORTS: List[Dict[str, Any]] = [
    {
        "id": "REP-2026-001",
        "timestamp": int(time.time()) - 3600,
        "reporter_name": "Tashi Bhutia (Field Officer, BRO)",
        "reporter_role": "BRO Project Swastik Patrol",
        "state": "Sikkim",
        "location_name": "NH-10 Km 29.4 near Likuvir",
        "coordinates": [27.0535, 88.4815],
        "crack_type": "Tension Crack (Crown)",
        "crack_width_mm": 180.0,
        "crack_depth_cm": 95.0,
        "crack_length_m": 45.0,
        "road_subsidence_cm": 35.0,
        "damage_score": 88.4,
        "severity": "CRITICAL_FAILURE",
        "photo_url": "/static/img/sample_crack1.jpg",
        "audio_note_url": None,
        "triage_status": "ACTION_REQUIRED",
        "assigned_team": "SDRF Pakyong & BRO Taskforce 10",
        "notes": "Crown tension crack actively widening by ~5mm/hr. Road shoulder has subsided by 35cm. Immediate vehicular closure recommended."
    },
    {
        "id": "REP-2026-002",
        "timestamp": int(time.time()) - 7200,
        "reporter_name": "Wanbiang Marbaniang (Citizen Volunteer)",
        "reporter_role": "Citizen Field Observer",
        "state": "Meghalaya",
        "location_name": "Sonapur Tunnel North Portal",
        "coordinates": [25.1255, 92.3625],
        "crack_type": "Transverse Scarp / Shear Crack",
        "crack_width_mm": 75.0,
        "crack_depth_cm": 40.0,
        "crack_length_m": 22.0,
        "road_subsidence_cm": 15.0,
        "damage_score": 58.2,
        "severity": "HIGH",
        "photo_url": "/static/img/sample_crack2.jpg",
        "audio_note_url": None,
        "triage_status": "UNDER_REVIEW",
        "assigned_team": "NHAI Road Maintenance Gang",
        "notes": "Muddy runoff accompanied by continuous rock chips falling onto carriage-way. Water seepage emerging from slope toe."
    }
]

# Real-time SOS Distress Signals in-memory store
SOS_DISTRESS_SIGNALS: List[Dict[str, Any]] = [
    {
        "id": "SOS-2026-001",
        "timestamp": int(time.time()) - 1800,
        "user_name": "Arjun Chhetri (Stranded Commuter)",
        "phone": "+91-98320-XXXXX",
        "state": "Sikkim",
        "corridor": "NH-10 Sevoke-Teesta Axis (29th Mile)",
        "coordinates": [27.0521, 88.4820],
        "situation": "Vehicle stuck in active mudflow. 4 passengers inside including an elderly patient.",
        "status": "DISTRESS_ACTIVE",
        "severity": "CRITICAL",
        "assigned_unit": "SDRF Pakyong Unit 2",
        "eta_minutes": 15,
        "notified_ddma": True,
        "last_ping": int(time.time()) - 120
    },
    {
        "id": "SOS-2026-002",
        "timestamp": int(time.time()) - 3200,
        "user_name": "Lalthanmawia (Truck Driver)",
        "phone": "+91-94361-XXXXX",
        "state": "Meghalaya",
        "corridor": "NH-6 Sonapur Tunnel Approach",
        "coordinates": [25.1245, 92.3610],
        "situation": "Boulder collapsed on highway blocking carriage-way. Debris continuously sliding.",
        "status": "ACKNOWLEDGED_EN_ROUTE",
        "severity": "HIGH",
        "assigned_unit": "NHAI Quick Response Patrol & BRO Crane",
        "eta_minutes": 25,
        "notified_ddma": True,
        "last_ping": int(time.time()) - 300
    }
]

# Regional IMD Weather Stations & Doppler Radar Feeds
WEATHER_STATIONS: List[Dict[str, Any]] = [
    {
        "id": "WX-IMD-GAU",
        "name": "Guwahati Doppler Weather Radar & Regional Met Centre",
        "state": "Assam",
        "district": "Kamrup Metropolitan",
        "coordinates": [26.1445, 91.7362],
        "elevation_m": 55,
        "station_type": "DOPPLER_RADAR_AWS",
        "alert_icon": "THUNDERSTORM",
        "warning_level": "YELLOW",
        "temp_c": 27.5,
        "humidity_pct": 89,
        "rainfall_rate_mm_hr": 14.8,
        "rainfall_24h_mm": 118.0,
        "wind_speed_kmh": 26,
        "wind_direction": "SSW",
        "pressure_hpa": 1004.2,
        "condition": "Heavy Convective Monsoon Showers",
        "radar_reflectivity_dbz": 48.5,
        "dew_point_c": 25.4,
        "status": "ACTIVE_MONSOON_SURGE"
    },
    {
        "id": "WX-IMD-SHR",
        "name": "Cherrapunji / Sohra Heavy Precipitation Station",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "coordinates": [25.2702, 91.7323],
        "elevation_m": 1313,
        "station_type": "HIGH_PRECIP_RADAR_AWS",
        "alert_icon": "CLOUDBURST",
        "warning_level": "RED",
        "temp_c": 21.4,
        "humidity_pct": 98,
        "rainfall_rate_mm_hr": 34.5,
        "rainfall_24h_mm": 276.0,
        "wind_speed_kmh": 38,
        "wind_direction": "S",
        "pressure_hpa": 868.5,
        "condition": "Severe Monsoon Cloudburst Deluge",
        "radar_reflectivity_dbz": 54.0,
        "dew_point_c": 21.0,
        "status": "CLOUDBURST_DELUGE"
    },
    {
        "id": "WX-IMD-SHL",
        "name": "Shillong Peak AWS & Upper Air Observatory",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "coordinates": [25.5788, 91.8933],
        "elevation_m": 1961,
        "station_type": "AWS_METEOROLOGICAL",
        "alert_icon": "HEAVY_RAIN",
        "warning_level": "ORANGE",
        "temp_c": 19.2,
        "humidity_pct": 94,
        "rainfall_rate_mm_hr": 18.5,
        "rainfall_24h_mm": 142.0,
        "wind_speed_kmh": 24,
        "wind_direction": "SSE",
        "pressure_hpa": 804.0,
        "condition": "Heavy Continuous Rain & Fog",
        "radar_reflectivity_dbz": 46.0,
        "dew_point_c": 18.2,
        "status": "HEAVY_RAIN"
    },
    {
        "id": "WX-IMD-GTK",
        "name": "Gangtok IMD Regional Meteorological Centre",
        "state": "Sikkim",
        "district": "East Sikkim",
        "coordinates": [27.3389, 88.6065],
        "elevation_m": 1650,
        "station_type": "DOPPLER_RADAR_AWS",
        "alert_icon": "LANDSLIDE",
        "warning_level": "RED",
        "temp_c": 17.5,
        "humidity_pct": 96,
        "rainfall_rate_mm_hr": 25.0,
        "rainfall_24h_mm": 188.0,
        "wind_speed_kmh": 32,
        "wind_direction": "SE",
        "pressure_hpa": 834.0,
        "condition": "Torrential Downpour & Slope Collapse Hazard",
        "radar_reflectivity_dbz": 51.5,
        "dew_point_c": 16.8,
        "status": "HIGH_ALERT"
    },
    {
        "id": "WX-IMD-MGN",
        "name": "Mangan Teesta Basin Hydro-Met AWS",
        "state": "Sikkim",
        "district": "North Sikkim",
        "coordinates": [27.5050, 88.5300],
        "elevation_m": 956,
        "station_type": "HYDRO_MET_AWS",
        "alert_icon": "CLOUDBURST",
        "warning_level": "RED",
        "temp_c": 16.0,
        "humidity_pct": 97,
        "rainfall_rate_mm_hr": 28.5,
        "rainfall_24h_mm": 215.0,
        "wind_speed_kmh": 29,
        "wind_direction": "S",
        "pressure_hpa": 905.0,
        "condition": "Intense Rain Squall & Flash Flood Risk",
        "radar_reflectivity_dbz": 52.8,
        "dew_point_c": 15.5,
        "status": "CLOUDBURST_RISK"
    },
    {
        "id": "WX-IMD-PSG",
        "name": "Pasighat Doppler Weather Radar Station",
        "state": "Arunachal Pradesh",
        "district": "East Siang",
        "coordinates": [28.0660, 95.3260],
        "elevation_m": 153,
        "station_type": "DOPPLER_RADAR_AWS",
        "alert_icon": "THUNDERSTORM",
        "warning_level": "ORANGE",
        "temp_c": 26.2,
        "humidity_pct": 93,
        "rainfall_rate_mm_hr": 21.0,
        "rainfall_24h_mm": 165.0,
        "wind_speed_kmh": 22,
        "wind_direction": "ENE",
        "pressure_hpa": 992.0,
        "condition": "Severe Monsoon Thunderstorm",
        "radar_reflectivity_dbz": 49.0,
        "dew_point_c": 24.9,
        "status": "HEAVY_RAIN"
    },
    {
        "id": "WX-IMD-ITN",
        "name": "Itanagar Foothills Meteorological Station",
        "state": "Arunachal Pradesh",
        "district": "Papum Pare",
        "coordinates": [27.0844, 93.6053],
        "elevation_m": 320,
        "station_type": "AWS_METEOROLOGICAL",
        "alert_icon": "HEAVY_RAIN",
        "warning_level": "YELLOW",
        "temp_c": 25.0,
        "humidity_pct": 90,
        "rainfall_rate_mm_hr": 16.2,
        "rainfall_24h_mm": 132.0,
        "wind_speed_kmh": 18,
        "wind_direction": "NE",
        "pressure_hpa": 978.0,
        "condition": "Continuous Orographic Rain",
        "radar_reflectivity_dbz": 47.0,
        "dew_point_c": 23.2,
        "status": "ACTIVE_MONSOON"
    },
    {
        "id": "WX-IMD-TWG",
        "name": "Tawang Alpine High-Altitude Observatory",
        "state": "Arunachal Pradesh",
        "district": "Tawang",
        "coordinates": [27.5861, 91.8594],
        "elevation_m": 3048,
        "station_type": "ALPINE_MET_AWS",
        "alert_icon": "SQUALL",
        "warning_level": "YELLOW",
        "temp_c": 11.5,
        "humidity_pct": 92,
        "rainfall_rate_mm_hr": 12.5,
        "rainfall_24h_mm": 92.0,
        "wind_speed_kmh": 35,
        "wind_direction": "WNW",
        "pressure_hpa": 710.0,
        "condition": "Cold Rain, Freezing Fog & Gale Winds",
        "radar_reflectivity_dbz": 43.5,
        "dew_point_c": 10.1,
        "status": "ALPINE_WATCH"
    },
    {
        "id": "WX-IMD-KOH",
        "name": "Kohima Ridge Meteorological AWS",
        "state": "Nagaland",
        "district": "Kohima",
        "coordinates": [25.6751, 94.1086],
        "elevation_m": 1444,
        "station_type": "AWS_METEOROLOGICAL",
        "alert_icon": "LANDSLIDE",
        "warning_level": "ORANGE",
        "temp_c": 20.5,
        "humidity_pct": 94,
        "rainfall_rate_mm_hr": 17.0,
        "rainfall_24h_mm": 135.0,
        "wind_speed_kmh": 20,
        "wind_direction": "S",
        "pressure_hpa": 855.0,
        "condition": "Heavy Hill Slopes Rain & Slope Slip",
        "radar_reflectivity_dbz": 47.5,
        "dew_point_c": 19.4,
        "status": "HEAVY_RAIN"
    },
    {
        "id": "WX-IMD-IMP",
        "name": "Imphal Valley Meteorological Centre",
        "state": "Manipur",
        "district": "Imphal West",
        "coordinates": [24.8170, 93.9368],
        "elevation_m": 786,
        "station_type": "AWS_METEOROLOGICAL",
        "alert_icon": "HEAVY_RAIN",
        "warning_level": "GREEN",
        "temp_c": 24.5,
        "humidity_pct": 87,
        "rainfall_rate_mm_hr": 9.8,
        "rainfall_24h_mm": 78.0,
        "wind_speed_kmh": 15,
        "wind_direction": "SW",
        "pressure_hpa": 924.0,
        "condition": "Moderate Monsoon Rain",
        "radar_reflectivity_dbz": 41.0,
        "dew_point_c": 22.1,
        "status": "MONSOON_WATCH"
    },
    {
        "id": "WX-IMD-AIZ",
        "name": "Aizawl Hilltop Meteorological Observatory",
        "state": "Mizoram",
        "district": "Aizawl",
        "coordinates": [23.7271, 92.7176],
        "elevation_m": 1132,
        "station_type": "AWS_METEOROLOGICAL",
        "alert_icon": "HEAVY_RAIN",
        "warning_level": "ORANGE",
        "temp_c": 22.4,
        "humidity_pct": 95,
        "rainfall_rate_mm_hr": 23.0,
        "rainfall_24h_mm": 182.0,
        "wind_speed_kmh": 25,
        "wind_direction": "SSW",
        "pressure_hpa": 888.0,
        "condition": "Severe Saturated Slope Downpour",
        "radar_reflectivity_dbz": 50.2,
        "dew_point_c": 21.5,
        "status": "HIGH_ALERT"
    },
    {
        "id": "WX-IMD-AGT",
        "name": "Agartala Airport Doppler Weather Radar",
        "state": "Tripura",
        "district": "West Tripura",
        "coordinates": [23.8315, 91.2868],
        "elevation_m": 15,
        "station_type": "DOPPLER_RADAR_AWS",
        "alert_icon": "THUNDERSTORM",
        "warning_level": "GREEN",
        "temp_c": 29.2,
        "humidity_pct": 85,
        "rainfall_rate_mm_hr": 8.5,
        "rainfall_24h_mm": 68.0,
        "wind_speed_kmh": 19,
        "wind_direction": "S",
        "pressure_hpa": 1006.0,
        "condition": "Monsoon Squalls & Passing Showers",
        "radar_reflectivity_dbz": 39.5,
        "dew_point_c": 26.2,
        "status": "MODERATE_RAIN"
    },
    {
        "id": "WX-IMD-HFL",
        "name": "Haflong Dima Hasao AWS",
        "state": "Assam",
        "district": "Dima Hasao",
        "coordinates": [25.1840, 93.0320],
        "elevation_m": 680,
        "station_type": "AWS_METEOROLOGICAL",
        "alert_icon": "LANDSLIDE",
        "warning_level": "RED",
        "temp_c": 23.5,
        "humidity_pct": 96,
        "rainfall_rate_mm_hr": 27.2,
        "rainfall_24h_mm": 204.0,
        "wind_speed_kmh": 28,
        "wind_direction": "S",
        "pressure_hpa": 935.0,
        "condition": "Severe Convective Downpour",
        "radar_reflectivity_dbz": 53.0,
        "dew_point_c": 22.8,
        "status": "CLOUDBURST_RISK"
    },
    {
        "id": "WX-IMD-SIL",
        "name": "Silchar Barak Valley Meteorological Station",
        "state": "Assam",
        "district": "Cachar",
        "coordinates": [24.8333, 92.7789],
        "elevation_m": 25,
        "station_type": "AWS_METEOROLOGICAL",
        "alert_icon": "HEAVY_RAIN",
        "warning_level": "YELLOW",
        "temp_c": 28.0,
        "humidity_pct": 91,
        "rainfall_rate_mm_hr": 15.4,
        "rainfall_24h_mm": 115.0,
        "wind_speed_kmh": 20,
        "wind_direction": "SSW",
        "pressure_hpa": 1005.0,
        "condition": "Heavy Rain & Saturated Alluvial Plains",
        "radar_reflectivity_dbz": 46.5,
        "dew_point_c": 26.4,
        "status": "HEAVY_RAIN"
    }
]

# Weather Doppler Radar & Cloudburst Isohyet Storm Polygons
WEATHER_RADAR_CELLS: List[Dict[str, Any]] = [
    {
        "id": "RAD-CELL-01",
        "name": "Meghalaya South Escarpment Convective Deluge",
        "state": "Meghalaya / Assam border",
        "intensity": "SEVERE_CLOUDBURST",
        "alert_icon": "CLOUDBURST",
        "warning_level": "RED",
        "center_coordinates": [25.25, 92.00],
        "reflectivity_dbz": 55.0,
        "rainfall_rate_mm_hr": 42.0,
        "echo_top_km": 14.5,
        "cell_movement": "North at 18 km/h",
        "color_hex": "#ef4444",
        "polygon_coords": [
            [25.10, 91.50],
            [25.40, 91.50],
            [25.45, 92.55],
            [25.05, 92.55],
            [25.10, 91.50]
        ]
    },
    {
        "id": "RAD-CELL-02",
        "name": "Teesta Basin - Sevoke Orographic Storm Band",
        "state": "Sikkim / West Bengal Border",
        "intensity": "HIGH_PRECIPITATION",
        "alert_icon": "LANDSLIDE",
        "warning_level": "RED",
        "center_coordinates": [27.12, 88.52],
        "reflectivity_dbz": 51.5,
        "rainfall_rate_mm_hr": 28.5,
        "echo_top_km": 12.0,
        "cell_movement": "North-East at 14 km/h",
        "color_hex": "#ea580c",
        "polygon_coords": [
            [26.85, 88.30],
            [27.45, 88.35],
            [27.40, 88.75],
            [26.80, 88.70],
            [26.85, 88.30]
        ]
    },
    {
        "id": "RAD-CELL-03",
        "name": "Barail Range & Dima Hasao Convective Core",
        "state": "Assam / Meghalaya",
        "intensity": "SEVERE_CONVECTIVE",
        "alert_icon": "CLOUDBURST",
        "warning_level": "RED",
        "center_coordinates": [25.22, 93.08],
        "reflectivity_dbz": 53.0,
        "rainfall_rate_mm_hr": 35.0,
        "echo_top_km": 13.5,
        "cell_movement": "North-North-East at 15 km/h",
        "color_hex": "#ef4444",
        "polygon_coords": [
            [25.00, 92.80],
            [25.45, 92.85],
            [25.40, 93.35],
            [24.95, 93.30],
            [25.00, 92.80]
        ]
    },
    {
        "id": "RAD-CELL-04",
        "name": "Nagaland-Manipur Ridge Rain Shield",
        "state": "Nagaland / Manipur",
        "intensity": "MODERATE_TO_HEAVY",
        "alert_icon": "THUNDERSTORM",
        "warning_level": "ORANGE",
        "center_coordinates": [25.20, 94.08],
        "reflectivity_dbz": 46.0,
        "rainfall_rate_mm_hr": 18.0,
        "echo_top_km": 10.5,
        "cell_movement": "North-East at 20 km/h",
        "color_hex": "#2563eb",
        "polygon_coords": [
            [24.60, 93.70],
            [25.85, 93.85],
            [25.80, 94.45],
            [24.55, 94.30],
            [24.60, 93.70]
        ]
    },
    {
        "id": "RAD-CELL-05",
        "name": "Siang Valley & Pasighat Frontal Surge",
        "state": "Arunachal Pradesh / Upper Assam",
        "intensity": "HIGH_PRECIPITATION",
        "alert_icon": "THUNDERSTORM",
        "warning_level": "ORANGE",
        "center_coordinates": [28.00, 95.25],
        "reflectivity_dbz": 49.5,
        "rainfall_rate_mm_hr": 24.0,
        "echo_top_km": 11.5,
        "cell_movement": "East at 16 km/h",
        "color_hex": "#ea580c",
        "polygon_coords": [
            [27.75, 94.80],
            [28.30, 94.90],
            [28.25, 95.70],
            [27.70, 95.60],
            [27.75, 94.80]
        ]
    }
]

class DataManager:
    """Provides access, real-time telemetry generation, and query methods."""

    @classmethod
    def get_weather_stations(cls) -> List[Dict[str, Any]]:
        """Returns live IMD meteorological stations with real-time readings."""
        now = time.time()
        results = []
        for ws in WEATHER_STATIONS:
            ws_copy = dict(ws)
            # Add light live atmospheric jitter
            jitter_temp = round((random.random() - 0.5) * 0.4, 1)
            jitter_rain = round((random.random() - 0.5) * 0.8, 1)
            ws_copy["temp_c"] = round(ws["temp_c"] + jitter_temp, 1)
            ws_copy["rainfall_rate_mm_hr"] = max(0.0, round(ws["rainfall_rate_mm_hr"] + jitter_rain, 1))
            ws_copy["last_updated"] = int(now)
            results.append(ws_copy)
        return results

    @classmethod
    def get_weather_radar(cls) -> List[Dict[str, Any]]:
        """Returns storm radar reflectivity polygons and isohyet bands."""
        return WEATHER_RADAR_CELLS

    @classmethod
    def get_live_sensors(cls) -> List[Dict[str, Any]]:
        """Returns live sensor list with dynamic simulated perturbations."""
        now = time.time()
        results = []
        for s in SENSORS_DATABASE:
            # Generate light realistic random walk around current readings
            noise_vwc = round((random.random() - 0.5) * 0.4, 2)
            noise_pwp = round((random.random() - 0.5) * 0.3, 2)
            noise_vel = round((random.random() - 0.5) * 0.04, 3)

            current_vwc = max(10.0, min(50.0, s["soil_moisture_vwc_pct"] + noise_vwc))
            current_pwp = max(0.0, min(50.0, s["piezometer_pwp_kpa"] + noise_pwp))
            current_vel = max(0.0, min(10.0, s["displacement_velocity_mm_hr"] + noise_vel))

            # 24-point time series for historical sparkline (hourly over last 24h)
            history_vwc = []
            history_rain = []
            history_vel = []
            base_rain = s["rainfall_24h_mm"] / 24.0

            for i in range(24):
                t_offset = 24 - i
                decay = math.exp(-i / 15.0)
                pt_rain = max(0.0, round(base_rain * (1.0 + math.sin(i / 3.0) * 0.8) + (random.random() * 2.0), 1))
                pt_vwc = max(15.0, min(48.0, round(current_vwc - (t_offset * 0.35 * decay) + (random.random() * 0.5), 1)))
                pt_vel = max(0.01, round(current_vel * (1.0 - (t_offset * 0.03)) + (random.random() * 0.05), 3))
                history_rain.append(pt_rain)
                history_vwc.append(pt_vwc)
                history_vel.append(pt_vel)

            s_copy = dict(s)
            s_copy["soil_moisture_vwc_pct"] = round(current_vwc, 1)
            s_copy["piezometer_pwp_kpa"] = round(current_pwp, 1)
            s_copy["displacement_velocity_mm_hr"] = round(current_vel, 3)
            s_copy["last_updated"] = int(now)
            s_copy["history_24h"] = {
                "rain_hourly": history_rain,
                "soil_moisture": history_vwc,
                "velocity": history_vel
            }
            results.append(s_copy)
        return results

    @classmethod
    def get_highways(cls) -> List[Dict[str, Any]]:
        return HIGHWAY_NETWORK

    @classmethod
    def get_shelters(cls) -> List[Dict[str, Any]]:
        return SHELTERS_DATABASE

    @classmethod
    def get_hazard_zones(cls) -> List[Dict[str, Any]]:
        return HAZARD_POLYGONS

    @classmethod
    def get_reports(cls) -> List[Dict[str, Any]]:
        return sorted(INCIDENT_REPORTS, key=lambda x: x["timestamp"], reverse=True)

    @classmethod
    def add_report(cls, report_data: Dict[str, Any]) -> Dict[str, Any]:
        report_id = f"REP-2026-{len(INCIDENT_REPORTS) + 1:03d}"
        new_rep = {
            "id": report_id,
            "timestamp": int(time.time()),
            "reporter_name": report_data.get("reporter_name", "Field Reporter"),
            "reporter_role": report_data.get("reporter_role", "Citizen / Official"),
            "state": report_data.get("state", "Assam"),
            "location_name": report_data.get("location_name", "Field Inspection Site"),
            "coordinates": report_data.get("coordinates", [26.1445, 91.7362]),
            "crack_type": report_data.get("crack_type", "Tension Crack (Crown)"),
            "crack_width_mm": float(report_data.get("crack_width_mm", 20.0)),
            "crack_depth_cm": float(report_data.get("crack_depth_cm", 15.0)),
            "crack_length_m": float(report_data.get("crack_length_m", 5.0)),
            "road_subsidence_cm": float(report_data.get("road_subsidence_cm", 0.0)),
            "damage_score": float(report_data.get("damage_score", 45.0)),
            "severity": report_data.get("severity", "MODERATE"),
            "photo_url": report_data.get("photo_url") or report_data.get("photo_b64") or None,
            "audio_note_url": report_data.get("audio_note_url", None),
            "triage_status": "ACTION_REQUIRED" if report_data.get("severity") in ["HIGH", "CRITICAL_FAILURE"] else "LOGGED",
            "assigned_team": "Local DDMA / SDRF Squad",
            "notes": report_data.get("notes", "")
        }
        INCIDENT_REPORTS.insert(0, new_rep)
        return new_rep

    @classmethod
    def get_active_sos(cls) -> List[Dict[str, Any]]:
        """Returns all SOS distress signals sorted by latest."""
        return sorted(SOS_DISTRESS_SIGNALS, key=lambda x: x["timestamp"], reverse=True)

    @classmethod
    def trigger_sos(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Registers a new real-time emergency SOS beacon."""
        sos_id = f"SOS-2026-{len(SOS_DISTRESS_SIGNALS) + 1:03d}"
        new_sos = {
            "id": sos_id,
            "timestamp": int(time.time()),
            "user_name": data.get("user_name", "Citizen Distress Beacon"),
            "phone": data.get("phone", "+91-112-EMERGENCY"),
            "state": data.get("state", "Sikkim"),
            "corridor": data.get("corridor", "NH-10 / Mountain Highway Corridor"),
            "coordinates": data.get("coordinates", [27.0521, 88.4820]),
            "situation": data.get("situation", "Immediate rescue required: Stranded due to active landslide / slope subsidence."),
            "status": "DISTRESS_ACTIVE",
            "severity": data.get("severity", "CRITICAL"),
            "assigned_unit": "Pending DDMA Dispatch",
            "eta_minutes": None,
            "notified_ddma": True,
            "last_ping": int(time.time())
        }
        SOS_DISTRESS_SIGNALS.insert(0, new_sos)
        return new_sos

    @classmethod
    def update_sos(cls, sos_id: str, action: str, assigned_unit: Optional[str] = None, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Updates SOS status, dispatches SDRF/NDRF, or resolves rescue operation."""
        for s in SOS_DISTRESS_SIGNALS:
            if s["id"] == sos_id:
                if action == "DISPATCH":
                    s["status"] = "ACKNOWLEDGED_EN_ROUTE"
                    s["assigned_unit"] = assigned_unit or "SDRF / BRO Quick Response Squad"
                    s["eta_minutes"] = 15
                elif action == "RESOLVE":
                    s["status"] = "RESCUE_COMPLETED"
                    s["resolved_at"] = int(time.time())
                elif action == "ACKNOWLEDGE":
                    s["status"] = "ACKNOWLEDGED_DDMA"
                if notes:
                    s["notes"] = notes
                s["last_ping"] = int(time.time())
                return s
        return None

    @classmethod
    def simulate_rainfall_stress(cls, added_rainfall_24h_mm: float) -> Dict[str, Any]:
        """
        Simulates heavy monsoon deluge or cloudburst scenario (e.g. +50mm to +200mm)
        and computes cascading impacts across highways and sensor zones.
        """
        impacted_sensors = []
        impacted_highways = []
        evacuation_recommended_villages = []

        for s in SENSORS_DATABASE:
            new_rf_24 = s["rainfall_24h_mm"] + added_rainfall_24h_mm
            new_rf_72 = s["rainfall_72h_mm"] + added_rainfall_24h_mm * 1.3
            new_vwc = min(49.5, s["soil_moisture_vwc_pct"] + (added_rainfall_24h_mm * 0.12))
            new_pwp = min(48.0, s["piezometer_pwp_kpa"] + (added_rainfall_24h_mm * 0.15))
            new_vel = s["displacement_velocity_mm_hr"] * (1.0 + (added_rainfall_24h_mm / 60.0))

            from backend.landslide_ai import LandslideAIEngine
            lhi_res = LandslideAIEngine.calculate_lhi(
                slope_deg=s["slope_deg"],
                rainfall_24h_mm=new_rf_24,
                rainfall_72h_mm=new_rf_72,
                soil_moisture_vwc=new_vwc,
                pore_pressure_kpa=new_pwp,
                tilt_velocity_mm_hr=new_vel,
                lithology=s["lithology"],
                fault_distance_km=s["fault_distance_km"],
                vegetation_ndvi=s["vegetation_ndvi"]
            )

            id_res = LandslideAIEngine.evaluate_rainfall_threshold(
                duration_hours=24.0,
                cumulative_rainfall_mm=new_rf_24,
                past_5day_rain_array=s["past_5day_rainfall"]
            )

            fos_res = LandslideAIEngine.calculate_infinite_slope_fos(
                slope_angle_deg=s["slope_deg"],
                pore_pressure_kpa=new_pwp
            )

            impacted_sensors.append({
                "sensor_id": s["id"],
                "name": s["name"],
                "state": s["state"],
                "simulated_rainfall_24h": round(new_rf_24, 1),
                "simulated_lhi": lhi_res["lhi"],
                "hazard_level": lhi_res["hazard_level"],
                "id_status": id_res["status"],
                "fos": fos_res["fos"],
                "fos_class": fos_res["stability_class"]
            })

            # Check if threshold crossed to escalate highway
            if lhi_res["hazard_level"] == "RED" or fos_res["fos"] < 1.0:
                for hw in HIGHWAY_NETWORK:
                    if hw["state"].find(s["state"]) != -1:
                        impacted_highways.append({
                            "highway_id": hw["id"],
                            "name": hw["name"],
                            "simulated_status": "BLOCKED",
                            "reason": f"High risk failure triggered by simulated {added_rainfall_24h_mm}mm deluge near {s['name']}"
                        })

        for hz in HAZARD_POLYGONS:
            if added_rainfall_24h_mm >= 80.0:
                evacuation_recommended_villages.extend(hz["vulnerable_villages"])

        return {
            "simulation_added_rainfall_mm": added_rainfall_24h_mm,
            "total_sensors_simulated": len(impacted_sensors),
            "red_hazard_count": sum(1 for x in impacted_sensors if x["hazard_level"] == "RED"),
            "orange_hazard_count": sum(1 for x in impacted_sensors if x["hazard_level"] == "ORANGE"),
            "sensor_details": impacted_sensors,
            "impacted_highways": impacted_highways,
            "evacuation_recommended_villages": list(set(evacuation_recommended_villages)),
            "simulated_timestamp": int(time.time())
        }
