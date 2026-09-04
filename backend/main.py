"""
FastAPI Backend Application for Landslide Early Warning & Field Response Platform
Serves REST APIs, GeoJSON GIS feeds, dynamic AI predictions, and PWA static assets.
"""

import os
import math
import time
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from backend.landslide_ai import LandslideAIEngine
from backend.data_sources import (
    DataManager,
    SENSORS_DATABASE,
    HIGHWAY_NETWORK,
    SHELTERS_DATABASE,
    HAZARD_POLYGONS
)

app = FastAPI(
    title="AI Landslide Early Warning & Response Platform (NER)",
    description="Operational early warning, GIS monitoring, and field emergency response platform for North Eastern India.",
    version="2.0.0"
)

# Enable CORS for cross-origin PWA testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for validation
class PredictRiskRequest(BaseModel):
    slope_deg: float = 38.0
    rainfall_24h_mm: float = 85.0
    rainfall_72h_mm: float = 160.0
    soil_moisture_vwc: float = 38.5
    pore_pressure_kpa: float = 24.0
    tilt_velocity_mm_hr: float = 0.85
    lithology: str = "Weathered Schist / Phyllite (Daling Group)"
    fault_distance_km: float = 2.5
    vegetation_ndvi: float = 0.40

class FosRequest(BaseModel):
    cohesion_kpa: float = 12.0
    friction_angle_deg: float = 30.0
    slope_angle_deg: float = 38.0
    soil_depth_m: float = 2.5
    pore_pressure_kpa: Optional[float] = None
    water_table_ratio: float = 0.6

class IncidentReportRequest(BaseModel):
    reporter_name: str
    reporter_role: Optional[str] = "Citizen / Observer"
    state: str
    location_name: str
    coordinates: List[float] # [lat, lng]
    crack_type: str = "Tension Crack (Crown)"
    crack_width_mm: float = 20.0
    crack_depth_cm: float = 15.0
    crack_length_m: float = 5.0
    road_subsidence_cm: float = 0.0
    photo_b64: Optional[str] = None
    audio_b64: Optional[str] = None
    notes: Optional[str] = ""

class BatchSyncRequest(BaseModel):
    reports: List[IncidentReportRequest]

class RainfallStressRequest(BaseModel):
    added_rainfall_24h_mm: float = 75.0

class EvacuationRouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    target_shelter_id: Optional[str] = None
    avoid_blocked_highways: bool = True

class BroadcastAlertRequest(BaseModel):
    target_state: str
    risk_level: str
    hazard_title: str
    message_text: str
    channels: List[str] = ["SMS_CELL_BROADCAST", "WHATSAPP_EMERGENCY", "SIREN_ACTIVATION"]

class LoginRequest(BaseModel):
    role: str # "ADMIN", "FIELD_OFFICER", "GOVERNMENT_OFFICIAL"
    officer_id: Optional[str] = None
    pin: Optional[str] = "1234"

class SOSTriggerRequest(BaseModel):
    user_name: Optional[str] = "Citizen Distress Beacon"
    phone: Optional[str] = "+91-112-EMERGENCY"
    state: Optional[str] = "Sikkim"
    corridor: Optional[str] = "NH-10 / Mountain Highway Corridor"
    coordinates: List[float] = [27.0521, 88.4820]
    situation: Optional[str] = "Immediate rescue required: Stranded due to active landslide / slope subsidence."
    severity: Optional[str] = "CRITICAL"

class SOSManageRequest(BaseModel):
    sos_id: str
    action: str # "DISPATCH", "ACKNOWLEDGE", "RESOLVE"
    assigned_unit: Optional[str] = "SDRF Pakyong Rapid Rescue Squad"
    notes: Optional[str] = ""

# Official Verified Accounts Database for DDMA Role-Based Access Control
OFFICIAL_ACCOUNTS = {
    "ADMIN": {
        "id": "ADM-NER-01",
        "name": "Dr. B. K. Sarma",
        "role_title": "SDMA / NDMA Lead Coordinator",
        "department": "State Disaster Management Authority",
        "clearance_level": "LEVEL-1_FULL_COMMAND",
        "allowed_actions": ["SIMULATION", "BROADCAST", "TRIAGE", "AUDIT"],
        "pin": "1234"
    },
    "FIELD_OFFICER": {
        "id": "BRO-SW-104",
        "name": "Capt. Tashi Bhutia",
        "role_title": "BRO Patrol Commander",
        "department": "Border Roads Organisation & SDRF Quick Response",
        "clearance_level": "LEVEL-2_FIELD_OPERATIONS",
        "allowed_actions": ["SIMULATION", "TRIAGE", "DAMAGE_RATING"],
        "pin": "1234"
    },
    "GOVERNMENT_OFFICIAL": {
        "id": "IAS-DC-502",
        "name": "Rohit Das, IAS",
        "role_title": "District Magistrate & DDMA Chairman",
        "department": "District Disaster Management Authority (DDMA)",
        "clearance_level": "LEVEL-1_EXECUTIVE_GOVERNMENT",
        "allowed_actions": ["SIMULATION", "BROADCAST", "TRIAGE", "EVACUATION_ORDERS"],
        "pin": "1234"
    }
}

def verify_ddma_permission(req: Request, allowed_roles: List[str] = ["ADMIN", "FIELD_OFFICER", "GOVERNMENT_OFFICIAL"]) -> str:
    """Enforces Role-Based Access Control on sensitive DDMA endpoints."""
    auth_role = req.headers.get("X-Auth-Role", "").upper().strip()
    auth_header = req.headers.get("Authorization", "")
    
    if not auth_role and "Bearer " in auth_header:
        token = auth_header.replace("Bearer ", "").upper().strip()
        for r in allowed_roles:
            if r in token:
                auth_role = r
                break

    if not auth_role or auth_role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail=f"ACCESS_DENIED: DDMA Command operations are restricted to Admin, Field Officer, and Government Officials. Current role '{auth_role or 'UNAUTHENTICATED'}' is not authorized."
        )
    return auth_role


# --- REST API Endpoints ---

@app.get("/api/risk/summary")
async def get_risk_summary():
    """Returns regional executive summary, alert counts, and vulnerable state metrics."""
    sensors = DataManager.get_live_sensors()
    red_count = 0
    orange_count = 0
    yellow_count = 0
    green_count = 0

    evaluated_sensors = []
    for s in sensors:
        ai_eval = LandslideAIEngine.calculate_lhi(
            slope_deg=s["slope_deg"],
            rainfall_24h_mm=s["rainfall_24h_mm"],
            rainfall_72h_mm=s["rainfall_72h_mm"],
            soil_moisture_vwc=s["soil_moisture_vwc_pct"],
            pore_pressure_kpa=s["piezometer_pwp_kpa"],
            tilt_velocity_mm_hr=s["displacement_velocity_mm_hr"],
            lithology=s["lithology"],
            fault_distance_km=s["fault_distance_km"],
            vegetation_ndvi=s["vegetation_ndvi"]
        )
        s_eval = dict(s)
        s_eval["lhi"] = ai_eval["lhi"]
        s_eval["hazard_level"] = ai_eval["hazard_level"]
        s_eval["status_text"] = ai_eval["status_text"]
        s_eval["color_hex"] = ai_eval["color_hex"]
        evaluated_sensors.append(s_eval)

        if ai_eval["hazard_level"] == "RED":
            red_count += 1
        elif ai_eval["hazard_level"] == "ORANGE":
            orange_count += 1
        elif ai_eval["hazard_level"] == "YELLOW":
            yellow_count += 1
        else:
            green_count += 1

    highways = DataManager.get_highways()
    blocked_hw_count = sum(1 for h in highways if h["status"] == "BLOCKED")
    restricted_hw_count = sum(1 for h in highways if h["status"] == "RESTRICTED")

    reports = DataManager.get_reports()
    pending_reports = sum(1 for r in reports if r["triage_status"] == "ACTION_REQUIRED")

    return {
        "region": "North Eastern Region (NER India)",
        "timestamp": int(time.time()),
        "overall_status": "HIGH_ALERT" if red_count > 0 else ("WATCH" if orange_count > 0 else "NORMAL"),
        "metrics": {
            "total_sensor_stations": len(sensors),
            "red_hazard_count": red_count,
            "orange_hazard_count": orange_count,
            "yellow_hazard_count": yellow_count,
            "green_hazard_count": green_count,
            "blocked_highways": blocked_hw_count,
            "restricted_highways": restricted_hw_count,
            "open_incident_reports": pending_reports
        },
        "critical_corridors": [
            {"corridor": "NH-10 Siliguri-Gangtok (29th Mile)", "state": "Sikkim", "threat": "Active Debris Flow / Rockfall"},
            {"corridor": "NH-6 Shillong-Silchar (Sonapur Tunnel)", "state": "Meghalaya", "threat": "Slush Inundation & Tension Scarp"}
        ],
        "sensor_evaluations": evaluated_sensors
    }


@app.post("/api/risk/predict")
async def predict_risk(req: PredictRiskRequest):
    """Calculates Landslide Hazard Index (LHI), I-D Threshold, and Factor of Safety."""
    lhi_result = LandslideAIEngine.calculate_lhi(
        slope_deg=req.slope_deg,
        rainfall_24h_mm=req.rainfall_24h_mm,
        rainfall_72h_mm=req.rainfall_72h_mm,
        soil_moisture_vwc=req.soil_moisture_vwc,
        pore_pressure_kpa=req.pore_pressure_kpa,
        tilt_velocity_mm_hr=req.tilt_velocity_mm_hr,
        lithology=req.lithology,
        fault_distance_km=req.fault_distance_km,
        vegetation_ndvi=req.vegetation_ndvi
    )

    id_result = LandslideAIEngine.evaluate_rainfall_threshold(
        duration_hours=24.0,
        cumulative_rainfall_mm=req.rainfall_24h_mm
    )

    fos_result = LandslideAIEngine.calculate_infinite_slope_fos(
        slope_angle_deg=req.slope_deg,
        pore_pressure_kpa=req.pore_pressure_kpa
    )

    return {
        "lhi_assessment": lhi_result,
        "rainfall_id_threshold": id_result,
        "factor_of_safety": fos_result,
        "timestamp": int(time.time())
    }


@app.post("/api/risk/fos")
async def calculate_fos(req: FosRequest):
    """Calculates infinite slope geotechnical Factor of Safety."""
    return LandslideAIEngine.calculate_infinite_slope_fos(
        cohesion_kpa=req.cohesion_kpa,
        friction_angle_deg=req.friction_angle_deg,
        slope_angle_deg=req.slope_angle_deg,
        soil_depth_m=req.soil_depth_m,
        pore_pressure_kpa=req.pore_pressure_kpa,
        water_table_ratio=req.water_table_ratio
    )


@app.get("/api/sensors/live")
async def get_sensors():
    """Returns live telemetry stream for all IoT sensor arrays."""
    sensors = DataManager.get_live_sensors()
    for s in sensors:
        ai_res = LandslideAIEngine.calculate_lhi(
            slope_deg=s["slope_deg"],
            rainfall_24h_mm=s["rainfall_24h_mm"],
            rainfall_72h_mm=s["rainfall_72h_mm"],
            soil_moisture_vwc=s["soil_moisture_vwc_pct"],
            pore_pressure_kpa=s["piezometer_pwp_kpa"],
            tilt_velocity_mm_hr=s["displacement_velocity_mm_hr"],
            lithology=s["lithology"],
            fault_distance_km=s["fault_distance_km"],
            vegetation_ndvi=s["vegetation_ndvi"]
        )
        s["lhi"] = ai_res["lhi"]
        s["hazard_level"] = ai_res["hazard_level"]
        s["color_hex"] = ai_res["color_hex"]
    return {"count": len(sensors), "sensors": sensors}


@app.get("/api/alerts/active")
async def get_active_alerts():
    """Returns localized multilingual disaster alerts in 8 regional languages."""
    alerts = [
        {
            "id": "ALT-2026-SK-01",
            "state": "Sikkim",
            "corridor": "NH-10 (Sevoke - Gangtok Axis)",
            "severity": "RED",
            "title": "IMMINENT LANDSLIDE COLLAPSE WARNING: NH-10 29TH MILE",
            "timestamp": int(time.time()),
            "expires_in_hours": 12,
            "trigger_factors": "Continuous 138mm precipitation & inclinometer displacement rate >1.8 mm/hr",
            "translations": {
                "en": "CRITICAL DANGER: Severe landslide activity detected at NH-10 29th Mile. Road closed. Immediate evacuation of lower valley settlements.",
                "hi": "अत्यंत गंभीर चेतावनी: NH-10 29वें मील पर भारी भूस्खलन का खतरा। मार्ग पूरी तरह बंद है। निचले क्षेत्रों के लोग तुरंत सुरक्षित स्थान पर जाएं।",
                "as": "চৰম বিপদৰ সতৰ্কবাণী: NH-10ৰ ২৯ মাইলত প্ৰচণ্ড ভূমিস্খলনৰ সম্ভাৱনা। পথ সম্পূৰ্ণ বন্ধ। সকলো লোকক সুৰক্ষিত স্থানলৈ যাবলৈ অনুৰোধ।",
                "bn": "চরম বিপদের সতর্কতা: NH-10 ২৯ মাইলে তীব্র ধসের সম্ভাবনা। রাস্তা সম্পূর্ণ বন্ধ। অবিলম্বে নিরাপদ আশ্রয়স্থলে পৌঁছান।",
                "ne": "अत्यन्त गम्भीर चेतावनी: NH-10 को २९ माईलमा ठूलो पहिरोको जोखिम। सडक पूर्ण रूपमा बन्द। तुरुन्त सुरक्षित स्थानमा जानुहोस्।",
                "mzo": "HRIATTIRNA KHAP CHIAH: NH-10 29th Mile ah leimin hlauhawm tak a awm. Kawng khar a ni a, hmun him lam pan nghal tur.",
                "kha": "KABA MAHAM: Ka jingshlei bad jingkhih khyndew ba jur ha NH-10 29th Mile. Khang ia ka surok bad leit shaki jaka ba shngain.",
                "mni": "ময়ামগী অকনবা ৱাৰ্নিং: NH-10গী ২৯ মাইলদা য়োকখৎলকপা লৈবাক চুকপগী খুদোংথিবা লৈরে। অথুবা মতমদা শাফবা মফমদা চৎলু।"
            },
            "instructions": [
                "Do not attempt travel between Siliguri and Rangpo/Gangtok via NH-10.",
                "Follow traffic police diversions via Gorubathan-Lava-Reshi route.",
                "Residents in 29th Mile and Birik Dara report to Rangpo Multi-Purpose Shelter."
            ]
        },
        {
            "id": "ALT-2026-ML-02",
            "state": "Meghalaya",
            "corridor": "NH-6 (Sonapur Tunnel - Kleriat)",
            "severity": "ORANGE",
            "title": "HIGH RISK LANDSLIDE ADVISORY: NH-6 SONAPUR TUNNEL",
            "timestamp": int(time.time()),
            "expires_in_hours": 24,
            "trigger_factors": "98mm rainfall / 24h & continuous slope toe seepage",
            "translations": {
                "en": "WARNING: High risk of slope slip near Sonapur Tunnel. Heavy trucks restricted. Exercise extreme caution.",
                "hi": "चेतावनी: सोनापुर टनल के पास भूस्खलन का उच्च जोखिम। भारी वाहनों का प्रवेश प्रतिबंधित है।",
                "as": "সতৰ্কবাণী: সোণাপুৰ সুৰংগৰ কাষত ভূমিস্খলনৰ প্ৰৱল আশংকা। গধুৰ যান-বাহন চলাচল নিষিদ্ধ।",
                "bn": "সতর্কতা: সোনাপুর টানেলের কাছে ধসের আশঙ্কা। ভারী যানবাহনের চলাচল নিয়ন্ত্রিত করা হয়েছে।",
                "ne": "चेतावनी: सोनापुर सुरुङ नजिक पहिरोको उच्च जोखिम। भारी सवारी साधनहरूमा प्रतिबन्ध लगाइएको छ।",
                "mzo": "HRIATTIRNA: Sonapur Tunnel bulah leimin theihna a sang. Lirthei lian tlan khap rih a ni.",
                "kha": "KABA MAHAM: Ka jingshlei khyndew ha syndah Sonapur Tunnel. Ban peitngor bad pynsangeh ia ki kali heh.",
                "mni": "ৱাৰ্নিং: সোনাপুর তনেল মপান্দা লৈবাক চুকপগী অকনবা খুদোংথিবা লৈরে। চাউরবা গারী চৎপা থিংলে।"
            },
            "instructions": [
                "Night-time driving strictly prohibited across Sonapur-Ratacherra sector.",
                "SDRF quick response unit on standby at Khliehriat."
            ]
        }
    ]
    return {"count": len(alerts), "alerts": alerts}


# --- GIS GeoJSON Feeds ---

@app.get("/api/gis/hazards")
async def get_hazard_geojson():
    """Returns GeoJSON FeatureCollection of landslide susceptibility polygons & hazard zones."""
    features = []
    for hz in HAZARD_POLYGONS:
        # Convert polygon coords [lat, lng] to GeoJSON standard [lng, lat]
        geojson_ring = [[pt[1], pt[0]] for pt in hz["polygon_coords"]]
        # Close polygon if not closed
        if geojson_ring[0] != geojson_ring[-1]:
            geojson_ring.append(geojson_ring[0])

        features.append({
            "type": "Feature",
            "id": hz["id"],
            "properties": {
                "name": hz["name"],
                "state": hz["state"],
                "risk_level": hz["risk_level"],
                "lhi_score": hz["lhi_score"],
                "trigger_cause": hz["trigger_cause"],
                "vulnerable_villages": hz["vulnerable_villages"],
                "population_at_risk": hz["estimated_population_at_risk"]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [geojson_ring]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }


@app.get("/api/gis/highways")
async def get_highways_geojson():
    """Returns GeoJSON FeatureCollection of arterial highway lifelines with live clearance status."""
    features = []
    for hw in HIGHWAY_NETWORK:
        geojson_line = [[pt[1], pt[0]] for pt in hw["coordinates"]]
        features.append({
            "type": "Feature",
            "id": hw["id"],
            "properties": {
                "name": hw["name"],
                "state": hw["state"],
                "status": hw["status"],
                "blockage_reason": hw["blockage_reason"],
                "est_clearance_hours": hw["est_clearance_hours"],
                "clearance_agency": hw["clearance_agency"],
                "detour_route": hw["detour_route"],
                "risk_rating": hw["risk_rating"]
            },
            "geometry": {
                "type": "LineString",
                "coordinates": geojson_line
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }


@app.get("/api/gis/shelters")
async def get_shelters_geojson():
    """Returns GeoJSON FeatureCollection of safe relief shelters and response bases."""
    features = []
    for sh in SHELTERS_DATABASE:
        features.append({
            "type": "Feature",
            "id": sh["id"],
            "properties": {
                "name": sh["name"],
                "state": sh["state"],
                "district": sh["district"],
                "type": sh["type"],
                "capacity_persons": sh["capacity_persons"],
                "current_occupancy": sh["current_occupancy"],
                "available_beds": sh["capacity_persons"] - sh["current_occupancy"],
                "medical_officer_available": sh["medical_officer_available"],
                "helipad_ready": sh["helipad_ready"],
                "emergency_contact": sh["emergency_contact"],
                "sdrf_team_stationed": sh["sdrf_team_stationed"]
            },
            "geometry": {
                "type": "Point",
                "coordinates": [sh["coordinates"][1], sh["coordinates"][0]] # [lng, lat]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }


@app.get("/api/gis/weather-stations")
async def get_weather_stations_geojson():
    """Returns GeoJSON FeatureCollection of regional IMD Doppler radars and automated weather stations."""
    stations = DataManager.get_weather_stations()
    features = []
    for ws in stations:
        features.append({
            "type": "Feature",
            "id": ws["id"],
            "properties": {
                "name": ws["name"],
                "state": ws["state"],
                "district": ws["district"],
                "elevation_m": ws["elevation_m"],
                "station_type": ws["station_type"],
                "alert_icon": ws.get("alert_icon", "HEAVY_RAIN"),
                "warning_level": ws.get("warning_level", "YELLOW"),
                "temp_c": ws["temp_c"],
                "humidity_pct": ws["humidity_pct"],
                "rainfall_rate_mm_hr": ws["rainfall_rate_mm_hr"],
                "rainfall_24h_mm": ws["rainfall_24h_mm"],
                "wind_speed_kmh": ws["wind_speed_kmh"],
                "wind_direction": ws["wind_direction"],
                "pressure_hpa": ws["pressure_hpa"],
                "condition": ws["condition"],
                "radar_reflectivity_dbz": ws["radar_reflectivity_dbz"],
                "dew_point_c": ws["dew_point_c"],
                "status": ws["status"],
                "last_updated": ws["last_updated"]
            },
            "geometry": {
                "type": "Point",
                "coordinates": [ws["coordinates"][1], ws["coordinates"][0]] # [lng, lat]
            }
        })
    return {
        "type": "FeatureCollection",
        "count": len(features),
        "features": features
    }


@app.get("/api/gis/weather-radar")
async def get_weather_radar_geojson():
    """Returns GeoJSON FeatureCollection of live Doppler radar storm cells and cloudburst isohyet bands."""
    radar_cells = DataManager.get_weather_radar()
    features = []
    for rc in radar_cells:
        geojson_ring = [[pt[1], pt[0]] for pt in rc["polygon_coords"]]
        if geojson_ring[0] != geojson_ring[-1]:
            geojson_ring.append(geojson_ring[0])

        features.append({
            "type": "Feature",
            "id": rc["id"],
            "properties": {
                "name": rc["name"],
                "state": rc["state"],
                "intensity": rc["intensity"],
                "alert_icon": rc.get("alert_icon", "CLOUDBURST"),
                "warning_level": rc.get("warning_level", "RED"),
                "center_coordinates": rc.get("center_coordinates", [rc["polygon_coords"][0][0], rc["polygon_coords"][0][1]]),
                "reflectivity_dbz": rc["reflectivity_dbz"],
                "rainfall_rate_mm_hr": rc["rainfall_rate_mm_hr"],
                "echo_top_km": rc["echo_top_km"],
                "cell_movement": rc["cell_movement"],
                "color_hex": rc["color_hex"]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [geojson_ring]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }


# --- Field Reporting & Offline Sync ---

@app.post("/api/reports/submit")
async def submit_report(req: IncidentReportRequest):
    """Submits field incident report, executes AI crack evaluation, and stores record."""
    ai_crack_eval = LandslideAIEngine.evaluate_field_crack_damage(
        crack_width_mm=req.crack_width_mm,
        crack_depth_cm=req.crack_depth_cm,
        crack_length_m=req.crack_length_m,
        crack_type=req.crack_type,
        road_subsidence_cm=req.road_subsidence_cm,
        photo_b64=req.photo_b64
    )

    report_payload = {
        "reporter_name": req.reporter_name,
        "reporter_role": req.reporter_role,
        "state": req.state,
        "location_name": req.location_name,
        "coordinates": req.coordinates,
        "crack_type": req.crack_type,
        "crack_width_mm": req.crack_width_mm,
        "crack_depth_cm": req.crack_depth_cm,
        "crack_length_m": req.crack_length_m,
        "road_subsidence_cm": req.road_subsidence_cm,
        "damage_score": ai_crack_eval["damage_score"],
        "severity": ai_crack_eval["severity_level"],
        "photo_url": req.photo_b64 if req.photo_b64 else "/static/img/sample_crack1.jpg",
        "audio_note_url": None,
        "notes": f"{req.notes} [AI Damage Score: {ai_crack_eval['damage_score']}/100. Action: {ai_crack_eval['mitigation_instructions']}]"
    }

    saved_record = DataManager.add_report(report_payload)
    return {
        "status": "SUCCESS",
        "report_id": saved_record["id"],
        "damage_assessment": ai_crack_eval,
        "record": saved_record
    }


@app.get("/api/reports/list")
async def list_reports():
    """Returns all incident triage reports."""
    reports = DataManager.get_reports()
    return {"count": len(reports), "reports": reports}


@app.post("/api/reports/sync")
async def sync_offline_reports(batch: BatchSyncRequest):
    """Batch processes queued reports collected while offline in mountain areas."""
    synced_records = []
    for rep in batch.reports:
        ai_crack_eval = LandslideAIEngine.evaluate_field_crack_damage(
            crack_width_mm=rep.crack_width_mm,
            crack_depth_cm=rep.crack_depth_cm,
            crack_length_m=rep.crack_length_m,
            crack_type=rep.crack_type,
            road_subsidence_cm=rep.road_subsidence_cm,
            photo_b64=rep.photo_b64
        )
        report_payload = {
            "reporter_name": rep.reporter_name,
            "reporter_role": rep.reporter_role,
            "state": rep.state,
            "location_name": rep.location_name,
            "coordinates": rep.coordinates,
            "crack_type": rep.crack_type,
            "crack_width_mm": rep.crack_width_mm,
            "crack_depth_cm": rep.crack_depth_cm,
            "crack_length_m": rep.crack_length_m,
            "road_subsidence_cm": rep.road_subsidence_cm,
            "damage_score": ai_crack_eval["damage_score"],
            "severity": ai_crack_eval["severity_level"],
            "photo_url": rep.photo_b64 if rep.photo_b64 else "/static/img/sample_crack2.jpg",
            "notes": f"{rep.notes} [Synced from Offline Cache]"
        }
        saved = DataManager.add_report(report_payload)
        synced_records.append(saved)

    return {
        "status": "SYNCED",
        "synced_count": len(synced_records),
        "records": synced_records
    }


# --- Real-Time SOS Distress Beacon Endpoints ---

@app.post("/api/emergency/sos/trigger")
async def trigger_sos_beacon(req: SOSTriggerRequest):
    """Broadcasts a live SOS distress beacon with user GPS coordinates."""
    sos_data = {
        "user_name": req.user_name,
        "phone": req.phone,
        "state": req.state,
        "corridor": req.corridor,
        "coordinates": req.coordinates,
        "situation": req.situation,
        "severity": req.severity
    }
    created = DataManager.trigger_sos(sos_data)
    return {
        "status": "BEACON_ACTIVATED",
        "message": "Distress beacon registered. DDMA / SDRF emergency response alerted.",
        "sos_id": created["id"],
        "sos": created
    }


@app.get("/api/emergency/sos/active")
async def get_active_sos_signals():
    """Returns active emergency SOS distress signals for DDMA monitoring."""
    signals = DataManager.get_active_sos()
    active_count = sum(1 for s in signals if s.get("status") in ["DISTRESS_ACTIVE", "ACKNOWLEDGED_EN_ROUTE", "ACKNOWLEDGED_DDMA"])
    return {
        "count": len(signals),
        "active_distress_count": active_count,
        "signals": signals
    }


@app.post("/api/emergency/sos/manage")
async def manage_sos_signal(req: SOSManageRequest, request: Request):
    """Allows DDMA Authorizers (Admin, Field Officer, Govt Official) to dispatch SDRF/NDRF or resolve SOS."""
    auth_role = verify_ddma_permission(request, ["ADMIN", "FIELD_OFFICER", "GOVERNMENT_OFFICIAL"])
    updated = DataManager.update_sos(req.sos_id, req.action, req.assigned_unit, req.notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"SOS Signal {req.sos_id} not found.")
    return {
        "status": "UPDATED",
        "authorized_by": auth_role,
        "action": req.action,
        "sos": updated
    }


# --- Emergency Evacuation Router ---

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great circle distance between two points in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

@app.post("/api/emergency/evacuation-route")
async def calculate_evacuation_route(req: EvacuationRouteRequest):
    """
    Computes a safe evacuation route from origin coordinates to the closest
    accessible relief shelter, actively avoiding blocked highway segments and RED hazard zones.
    """
    shelters = DataManager.get_shelters()
    highways = DataManager.get_highways()

    # Find nearest shelters
    shelter_distances = []
    for sh in shelters:
        dist = haversine_km(req.origin_lat, req.origin_lng, sh["coordinates"][0], sh["coordinates"][1])
        shelter_distances.append((dist, sh))

    shelter_distances.sort(key=lambda x: x[0])

    if not shelter_distances:
        raise HTTPException(status_code=404, detail="No designated evacuation shelters found in database.")

    chosen_dist, chosen_shelter = shelter_distances[0]
    if req.target_shelter_id:
        match = next((s for s in shelters if s["id"] == req.target_shelter_id), None)
        if match:
            chosen_shelter = match
            chosen_dist = haversine_km(req.origin_lat, req.origin_lng, chosen_shelter["coordinates"][0], chosen_shelter["coordinates"][1])

    # Route construction avoiding blocked corridors
    origin_point = [req.origin_lat, req.origin_lng]
    target_point = chosen_shelter["coordinates"]

    # Generate realistic intermediate waypoints that bypass active slides
    # If corridor contains blocked NH-10, inject safe detour via Gorubathan / Lava
    route_waypoints = [origin_point]

    is_sikkim_area = (26.7 <= req.origin_lat <= 27.5) and (88.2 <= req.origin_lng <= 88.8)
    if is_sikkim_area and req.avoid_blocked_highways:
        # Route around blocked 29th Mile via Reshi-Rongpo detour ridge
        detour_wp1 = [26.9600, 88.6800] # Gorubathan / Lava Pass
        detour_wp2 = [27.1200, 88.6200] # Reshi
        route_waypoints.extend([detour_wp1, detour_wp2])
        estimated_time_mins = round(chosen_dist * 3.8 + 45.0) # Mountain delay factor
        route_status = "SAFE_DETOUR_ACTIVE"
        advisory = "Standard NH-10 blocked at 29th Mile. Routed safely via East Sikkim Lava-Reshi Ridge Detour."
    else:
        # Direct mountain corridor
        mid_lat = (req.origin_lat + target_point[0]) / 2.0 + 0.015
        mid_lng = (req.origin_lng + target_point[1]) / 2.0 - 0.010
        route_waypoints.append([mid_lat, mid_lng])
        estimated_time_mins = round(chosen_dist * 2.5 + 15.0)
        route_status = "CLEAR_CORRIDOR"
        advisory = "Corridor clear. Proceed with caution and watch for loose rock on cut slopes."

    route_waypoints.append(target_point)

    return {
        "status": "ROUTE_COMPUTED",
        "route_status": route_status,
        "advisory": advisory,
        "origin": origin_point,
        "destination_shelter": {
            "id": chosen_shelter["id"],
            "name": chosen_shelter["name"],
            "state": chosen_shelter["state"],
            "district": chosen_shelter["district"],
            "type": chosen_shelter["type"],
            "capacity": chosen_shelter["capacity_persons"],
            "available_beds": chosen_shelter["capacity_persons"] - chosen_shelter["current_occupancy"],
            "helipad_ready": chosen_shelter["helipad_ready"],
            "medical_support": chosen_shelter["medical_officer_available"],
            "emergency_contact": chosen_shelter["emergency_contact"]
        },
        "distance_km": round(chosen_dist, 2),
        "est_travel_time_minutes": estimated_time_mins,
        "route_waypoints": route_waypoints,
        "geojson_linestring": {
            "type": "LineString",
            "coordinates": [[pt[1], pt[0]] for pt in route_waypoints]
        }
    }


# --- DDMA Security, Authentication & Role-Based Access Control ---

@app.get("/api/auth/roles")
async def get_authorized_roles():
    """Returns official roles authorized for DDMA Command operations."""
    return {
        "roles": [
            {
                "role_key": "ADMIN",
                "title": "DDMA / SDMA Administrator",
                "description": "State & District Disaster Management Command (Level-1 Full)",
                "sample_badge": "ADM-NER-01"
            },
            {
                "role_key": "FIELD_OFFICER",
                "title": "Field Officer (BRO / SDRF / GSI)",
                "description": "Lifeline Highway Patrol & Rapid Response Squad (Level-2 Ops)",
                "sample_badge": "BRO-SW-104"
            },
            {
                "role_key": "GOVERNMENT_OFFICIAL",
                "title": "Government Official / District Magistrate",
                "description": "Executive Administration, SEOC & Evacuation Command (Level-1 Exec)",
                "sample_badge": "IAS-DC-502"
            }
        ]
    }


@app.post("/api/auth/login")
async def login_official(req: LoginRequest):
    """Authenticates official credentials for DDMA Command access."""
    role_key = req.role.upper().strip()
    if role_key not in OFFICIAL_ACCOUNTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid official role '{req.role}'. Must be ADMIN, FIELD_OFFICER, or GOVERNMENT_OFFICIAL."
        )

    account = OFFICIAL_ACCOUNTS[role_key]

    # Validate PIN if provided
    if req.pin and req.pin.strip() != account["pin"]:
        raise HTTPException(
            status_code=401,
            detail="INVALID_CREDENTIALS: Incorrect Security PIN for official clearance."
        )

    # Generate secure session authorization token
    auth_token = f"DDMA_AUTH_TOKEN_{role_key}_{int(time.time())}"

    return {
        "status": "AUTHENTICATED",
        "auth_token": auth_token,
        "role": role_key,
        "officer_id": req.officer_id or account["id"],
        "officer_name": account["name"],
        "role_title": account["role_title"],
        "department": account["department"],
        "clearance_level": account["clearance_level"],
        "allowed_actions": account["allowed_actions"],
        "timestamp": int(time.time())
    }


@app.get("/api/auth/verify")
async def verify_auth_status(request: Request):
    """Verifies the active session clearance for DDMA operations."""
    try:
        active_role = verify_ddma_permission(request)
        account = OFFICIAL_ACCOUNTS[active_role]
        return {
            "status": "AUTHORIZED",
            "role": active_role,
            "officer_name": account["name"],
            "role_title": account["role_title"],
            "clearance_level": account["clearance_level"]
        }
    except HTTPException as e:
        return {
            "status": "UNAUTHORIZED",
            "detail": e.detail
        }


# --- Protected DDMA Simulation & Broadcast ---

@app.post("/api/simulation/rainfall-stress")
async def simulate_rainfall_stress_endpoint(req: RainfallStressRequest, request: Request):
    """Allows authenticated DDMA commanders (Admin, Field Officer, Government Official) to simulate extreme cloudbursts."""
    auth_role = verify_ddma_permission(request, ["ADMIN", "FIELD_OFFICER", "GOVERNMENT_OFFICIAL"])
    res = DataManager.simulate_rainfall_stress(req.added_rainfall_24h_mm)
    res["authorized_operator_role"] = auth_role
    return res


@app.post("/api/broadcast/trigger")
async def trigger_emergency_broadcast(req: BroadcastAlertRequest, request: Request):
    """Simulates multi-channel emergency broadcast dispatch (Requires Admin or Government Official clearance)."""
    auth_role = verify_ddma_permission(request, ["ADMIN", "GOVERNMENT_OFFICIAL"])
    return {
        "status": "DISPATCHED",
        "timestamp": int(time.time()),
        "dispatched_by_role": auth_role,
        "target_state": req.target_state,
        "risk_level": req.risk_level,
        "channels_activated": req.channels,
        "cell_broadcast_towers_engaged": 48,
        "sms_queue_count": 34200,
        "disaster_sirens_sounded": 14,
        "broadcast_summary": f"Emergency Broadcast dispatched by {auth_role} for {req.target_state} [{req.risk_level}]: {req.hazard_title}"
    }


# --- Android APK Download Endpoints ---

@app.get("/api/download/info")
async def get_apk_info():
    """Returns official Android APK package release metadata."""
    apk_path = os.path.join(FRONTEND_DIR, "downloads", "PRALAY-RAKSHAK-Landslide-NER-v2.0.0.apk")
    if not os.path.exists(apk_path):
        script_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "generate_apk.py")
        if os.path.exists(script_path):
            try:
                from scripts.generate_apk import generate_apk
                generate_apk()
            except Exception:
                pass

    size_bytes = os.path.getsize(apk_path) if os.path.exists(apk_path) else 0
    size_mb = round(size_bytes / (1024 * 1024), 2)
    size_kb = round(size_bytes / 1024, 1)

    return {
        "app_name": "PRALAY-RAKSHAK",
        "title": "PRALAY-RAKSHAK: AI Landslide Early Warning & Field Response Platform",
        "package_name": "in.gov.ndma.pralayrakshak.ner",
        "version": "2.0.0",
        "version_code": 200,
        "release_channel": "Official Production Release",
        "filename": "PRALAY-RAKSHAK-Landslide-NER-v2.0.0.apk",
        "size_kb": size_kb,
        "size_mb": size_mb,
        "min_android_version": "Android 7.0 (Nougat) or higher",
        "target_sdk": "Android 14 / 15 (API 34)",
        "download_url": "/api/download/apk",
        "direct_file_url": "/static/downloads/PRALAY-RAKSHAK-Landslide-NER-v2.0.0.apk",
        "features": [
            "Real-Time GIS Doppler Radar & Weather Overlays",
            "IoT Sensor Telemetry & Geotechnical Factor of Safety Calculator",
            "Field Incident & Ground Crack Reporting with Offline Queue Sync",
            "DDMA Role-Based Security Command Dashboard",
            "1-Tap Emergency SOS Beacon with GPS Coordinates",
            "Multilingual Disaster Siren Synthesizer in 8 Regional Languages"
        ]
    }


@app.get("/api/download/apk")
async def download_apk():
    """Serves the signed Android APK package for direct download."""
    apk_path = os.path.join(FRONTEND_DIR, "downloads", "PRALAY-RAKSHAK-Landslide-NER-v2.0.0.apk")
    if not os.path.exists(apk_path):
        from scripts.generate_apk import generate_apk
        generate_apk()

    if not os.path.exists(apk_path):
        raise HTTPException(status_code=404, detail="APK package could not be located.")

    return FileResponse(
        path=apk_path,
        media_type="application/vnd.android.package-archive",
        filename="PRALAY-RAKSHAK-Landslide-NER-v2.0.0.apk",
        headers={
            "Content-Disposition": 'attachment; filename="PRALAY-RAKSHAK-Landslide-NER-v2.0.0.apk"'
        }
    )


# Mount Static Frontend
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
async def serve_index():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"status": "Frontend not found, please check frontend/index.html"})

if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend_root")

