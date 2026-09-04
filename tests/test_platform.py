"""
Automated Test Suite for Landslide Early Warning, GIS & Field Response Platform
Tests AI algorithms, Geotechnical FoS, I-D rainfall thresholds, and FastAPI endpoints.
"""

import unittest
from starlette.testclient import TestClient
from backend.main import app
from backend.landslide_ai import LandslideAIEngine
from backend.data_sources import DataManager

class TestLandslideAI(unittest.TestCase):
    """Unit tests for core AI and Geotechnical algorithms."""

    def test_lhi_calculation_green(self):
        """Test mild conditions evaluate to GREEN / Low Hazard."""
        res = LandslideAIEngine.calculate_lhi(
            slope_deg=18.0,
            rainfall_24h_mm=15.0,
            rainfall_72h_mm=25.0,
            soil_moisture_vwc=20.0,
            pore_pressure_kpa=5.0,
            tilt_velocity_mm_hr=0.01,
            lithology="Granite / Gneiss (Shillong Plateau Core)",
            fault_distance_km=15.0,
            vegetation_ndvi=0.75
        )
        self.assertLess(res["lhi"], 35.0)
        self.assertEqual(res["hazard_level"], "GREEN")
        self.assertEqual(res["recommended_action"], "MONITOR_STANDARD")
        self.assertIn("slope_score", res["factors"])

    def test_lhi_calculation_red(self):
        """Test extreme monsoon conditions evaluate to RED / Severe Hazard."""
        res = LandslideAIEngine.calculate_lhi(
            slope_deg=48.0,
            rainfall_24h_mm=145.0,
            rainfall_72h_mm=260.0,
            soil_moisture_vwc=46.0,
            pore_pressure_kpa=38.0,
            tilt_velocity_mm_hr=2.4,
            lithology="Colluvial Debris / Overburden",
            fault_distance_km=0.8,
            vegetation_ndvi=0.20
        )
        self.assertGreaterEqual(res["lhi"], 80.0)
        self.assertEqual(res["hazard_level"], "RED")
        self.assertEqual(res["recommended_action"], "EVACUATE_CLOSURE_DEPLOY_NDRF")
        self.assertGreaterEqual(res["failure_probability"], 0.70)

    def test_dynamic_rainfall_threshold(self):
        """Test Intensity-Duration (I-D) power-law threshold and AMI penalty."""
        # Low rainfall
        low_res = LandslideAIEngine.evaluate_rainfall_threshold(
            duration_hours=24.0,
            cumulative_rainfall_mm=20.0,
            past_5day_rain_array=[5.0, 10.0, 5.0, 10.0, 5.0]
        )
        self.assertEqual(low_res["status"], "GREEN")
        self.assertLess(low_res["ratio"], 1.0)

        # High cloudburst rainfall with heavy antecedent saturation
        high_res = LandslideAIEngine.evaluate_rainfall_threshold(
            duration_hours=6.0,
            cumulative_rainfall_mm=120.0, # 20 mm/hr
            past_5day_rain_array=[60.0, 85.0, 110.0, 95.0, 120.0]
        )
        self.assertEqual(high_res["status"], "RED")
        self.assertGreater(high_res["ratio"], 1.45)
        self.assertGreater(high_res["ami_saturation_penalty_pct"], 15.0)

    def test_infinite_slope_fos(self):
        """Test geotechnical Factor of Safety equations."""
        # Stable dry slope
        stable_fos = LandslideAIEngine.calculate_infinite_slope_fos(
            cohesion_kpa=20.0,
            friction_angle_deg=35.0,
            slope_angle_deg=25.0,
            soil_depth_m=2.0,
            pore_pressure_kpa=0.0
        )
        self.assertGreater(stable_fos["fos"], 1.30)
        self.assertEqual(stable_fos["stability_class"], "STABLE")
        self.assertEqual(stable_fos["risk_tier"], "GREEN")

        # Saturated slope with high pore water pressure
        failing_fos = LandslideAIEngine.calculate_infinite_slope_fos(
            cohesion_kpa=5.0,
            friction_angle_deg=22.0,
            slope_angle_deg=42.0,
            soil_depth_m=3.5,
            pore_pressure_kpa=36.0
        )
        self.assertLess(failing_fos["fos"], 1.0)
        self.assertEqual(failing_fos["stability_class"], "SLOPE_FAILURE_ACTIVE")
        self.assertEqual(failing_fos["risk_tier"], "RED")

    def test_crack_damage_evaluation(self):
        """Test morphological crack and field fissure evaluation."""
        # Minor fissure
        minor_eval = LandslideAIEngine.evaluate_field_crack_damage(
            crack_width_mm=5.0,
            crack_depth_cm=4.0,
            crack_length_m=2.0,
            crack_type="Hairline Surface Fissure"
        )
        self.assertEqual(minor_eval["severity_level"], "MINOR")

        # Major tension fissure with road subsidence
        critical_eval = LandslideAIEngine.evaluate_field_crack_damage(
            crack_width_mm=190.0,
            crack_depth_cm=85.0,
            crack_length_m=40.0,
            crack_type="Tension Crack (Crown)",
            road_subsidence_cm=30.0,
            photo_b64="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
        )
        self.assertEqual(critical_eval["severity_level"], "CRITICAL_FAILURE")
        self.assertGreater(critical_eval["damage_score"], 80.0)
        self.assertIn("IMMEDIATE EVACUATION", critical_eval["mitigation_instructions"])


class TestPlatformAPI(unittest.TestCase):
    """Integration tests for FastAPI REST Endpoints."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_api_risk_summary(self):
        """Test /api/risk/summary returns state-wise metrics and critical corridors."""
        response = self.client.get("/api/risk/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["region"], "North Eastern Region (NER India)")
        self.assertIn("metrics", data)
        self.assertIn("total_sensor_stations", data["metrics"])
        self.assertGreater(data["metrics"]["total_sensor_stations"], 0)
        self.assertIn("sensor_evaluations", data)

    def test_api_risk_predict(self):
        """Test /api/risk/predict POST endpoint."""
        payload = {
            "slope_deg": 42.0,
            "rainfall_24h_mm": 110.0,
            "rainfall_72h_mm": 210.0,
            "soil_moisture_vwc": 41.5,
            "pore_pressure_kpa": 27.0,
            "tilt_velocity_mm_hr": 1.15,
            "lithology": "Weathered Schist / Phyllite (Daling Group)"
        }
        response = self.client.post("/api/risk/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("lhi_assessment", data)
        self.assertIn("rainfall_id_threshold", data)
        self.assertIn("factor_of_safety", data)

    def test_api_sensors_live(self):
        """Test /api/sensors/live returns telemetry with 24h history for sparklines."""
        response = self.client.get("/api/sensors/live")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["count"], 0)
        sensor = data["sensors"][0]
        self.assertIn("history_24h", sensor)
        self.assertEqual(len(sensor["history_24h"]["rain_hourly"]), 24)

    def test_api_alerts_active(self):
        """Test /api/alerts/active returns multi-lingual regional translations."""
        response = self.client.get("/api/alerts/active")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["count"], 0)
        alert = data["alerts"][0]
        self.assertIn("translations", alert)
        # Check all 8 languages exist
        for lang in ["en", "hi", "as", "bn", "ne", "mzo", "kha", "mni"]:
            self.assertIn(lang, alert["translations"])

    def test_api_gis_endpoints(self):
        """Test GeoJSON endpoints for hazards, highways, and shelters."""
        # Hazards
        res_haz = self.client.get("/api/gis/hazards")
        self.assertEqual(res_haz.status_code, 200)
        data_haz = res_haz.json()
        self.assertEqual(data_haz["type"], "FeatureCollection")
        self.assertGreater(len(data_haz["features"]), 0)

        # Highways
        res_hw = self.client.get("/api/gis/highways")
        self.assertEqual(res_hw.status_code, 200)
        data_hw = res_hw.json()
        self.assertEqual(data_hw["type"], "FeatureCollection")

        # Shelters
        res_sh = self.client.get("/api/gis/shelters")
        self.assertEqual(res_sh.status_code, 200)
        data_sh = res_sh.json()
        self.assertEqual(data_sh["type"], "FeatureCollection")

    def test_api_weather_overlays(self):
        """Test /api/gis/weather-stations and /api/gis/weather-radar endpoints."""
        res_ws = self.client.get("/api/gis/weather-stations")
        self.assertEqual(res_ws.status_code, 200)
        data_ws = res_ws.json()
        self.assertEqual(data_ws["type"], "FeatureCollection")
        self.assertGreater(len(data_ws["features"]), 0)
        sample_ws = data_ws["features"][0]["properties"]
        self.assertIn("temp_c", sample_ws)
        self.assertIn("rainfall_rate_mm_hr", sample_ws)
        self.assertIn("radar_reflectivity_dbz", sample_ws)

        res_radar = self.client.get("/api/gis/weather-radar")
        self.assertEqual(res_radar.status_code, 200)
        data_radar = res_radar.json()
        self.assertEqual(data_radar["type"], "FeatureCollection")
        self.assertGreater(len(data_radar["features"]), 0)
        sample_cell = data_radar["features"][0]["properties"]
        self.assertIn("reflectivity_dbz", sample_cell)
        self.assertIn("intensity", sample_cell)

    def test_api_reports_submit_and_sync(self):
        """Test field report submission and batch offline sync."""
        report_payload = {
            "reporter_name": "Major Sonam Wangdi",
            "reporter_role": "BRO Project Swastik",
            "state": "Sikkim",
            "location_name": "NH-10 Km 31.2",
            "coordinates": [27.0610, 88.4890],
            "crack_type": "Transverse Scarp / Shear Crack",
            "crack_width_mm": 95.0,
            "crack_depth_cm": 50.0,
            "crack_length_m": 18.0,
            "road_subsidence_cm": 12.0,
            "notes": "Pavement cracking actively widening."
        }
        res_submit = self.client.post("/api/reports/submit", json=report_payload)
        self.assertEqual(res_submit.status_code, 200)
        data_sub = res_submit.json()
        self.assertEqual(data_sub["status"], "SUCCESS")
        self.assertIn("REP-2026-", data_sub["report_id"])

        # Test batch sync
        sync_payload = {
            "reports": [report_payload]
        }
        res_sync = self.client.post("/api/reports/sync", json=sync_payload)
        self.assertEqual(res_sync.status_code, 200)
        data_sync = res_sync.json()
        self.assertEqual(data_sync["status"], "SYNCED")
        self.assertEqual(data_sync["synced_count"], 1)

    def test_api_evacuation_route(self):
        """Test safe evacuation route calculation."""
        evac_payload = {
            "origin_lat": 27.0521,
            "origin_lng": 88.4820,
            "avoid_blocked_highways": True
        }
        res = self.client.post("/api/emergency/evacuation-route", json=evac_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ROUTE_COMPUTED")
        self.assertIn("destination_shelter", data)
        self.assertIn("route_waypoints", data)
        self.assertGreater(len(data["route_waypoints"]), 1)

    def test_api_auth_roles(self):
        """Test /api/auth/roles returns authorized DDMA roles."""
        res = self.client.get("/api/auth/roles")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("roles", data)
        role_keys = [r["role_key"] for r in data["roles"]]
        self.assertIn("ADMIN", role_keys)
        self.assertIn("FIELD_OFFICER", role_keys)
        self.assertIn("GOVERNMENT_OFFICIAL", role_keys)

    def test_api_auth_login_success_and_failures(self):
        """Test official login with valid and invalid credentials."""
        # Success for Field Officer
        res = self.client.post("/api/auth/login", json={
            "role": "FIELD_OFFICER",
            "officer_id": "BRO-SW-104",
            "pin": "1234"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "AUTHENTICATED")
        self.assertEqual(data["role"], "FIELD_OFFICER")
        self.assertIn("DDMA_AUTH_TOKEN_", data["auth_token"])

        # Success for Admin
        res_adm = self.client.post("/api/auth/login", json={
            "role": "ADMIN",
            "officer_id": "ADM-NER-01",
            "pin": "1234"
        })
        self.assertEqual(res_adm.status_code, 200)
        self.assertEqual(res_adm.json()["role"], "ADMIN")

        # Success for Govt Official
        res_govt = self.client.post("/api/auth/login", json={
            "role": "GOVERNMENT_OFFICIAL",
            "officer_id": "IAS-DC-502",
            "pin": "1234"
        })
        self.assertEqual(res_govt.status_code, 200)
        self.assertEqual(res_govt.json()["role"], "GOVERNMENT_OFFICIAL")

        # Invalid PIN returns 401
        res_bad_pin = self.client.post("/api/auth/login", json={
            "role": "ADMIN",
            "pin": "9999"
        })
        self.assertEqual(res_bad_pin.status_code, 401)

        # Invalid Role returns 400
        res_bad_role = self.client.post("/api/auth/login", json={
            "role": "UNAUTHORIZED_GUEST",
            "pin": "1234"
        })
        self.assertEqual(res_bad_role.status_code, 400)

    def test_api_simulation_rainfall_stress_rbac(self):
        """Test heavy rainfall stress simulation RBAC permissions."""
        sim_payload = {"added_rainfall_24h_mm": 90.0}

        # Unauthorized request without headers returns 403
        res_unauth = self.client.post("/api/simulation/rainfall-stress", json=sim_payload)
        self.assertEqual(res_unauth.status_code, 403)

        # Unauthorized citizen role returns 403
        res_citizen = self.client.post("/api/simulation/rainfall-stress", json=sim_payload, headers={"X-Auth-Role": "CITIZEN"})
        self.assertEqual(res_citizen.status_code, 403)

        # Authorized Field Officer request succeeds
        res_fo = self.client.post("/api/simulation/rainfall-stress", json=sim_payload, headers={"X-Auth-Role": "FIELD_OFFICER"})
        self.assertEqual(res_fo.status_code, 200)
        data = res_fo.json()
        self.assertIn("red_hazard_count", data)
        self.assertIn("impacted_highways", data)
        self.assertEqual(data["authorized_operator_role"], "FIELD_OFFICER")

        # Authorized Admin request succeeds
        res_adm = self.client.post("/api/simulation/rainfall-stress", json=sim_payload, headers={"X-Auth-Role": "ADMIN"})
        self.assertEqual(res_adm.status_code, 200)

    def test_api_broadcast_trigger_rbac(self):
        """Test multi-channel emergency warning broadcast RBAC permissions."""
        broad_payload = {
            "target_state": "Sikkim",
            "risk_level": "RED",
            "hazard_title": "Severe Landslide Alert NH-10",
            "message_text": "Immediate evacuation ordered.",
            "channels": ["SMS_CELL_BROADCAST", "SIREN_ACTIVATION"]
        }

        # Unauthorized without headers returns 403
        res_unauth = self.client.post("/api/broadcast/trigger", json=broad_payload)
        self.assertEqual(res_unauth.status_code, 403)

        # Field Officer cannot trigger state-level broadcast (Level-1 Admin/Govt Official only)
        res_fo = self.client.post("/api/broadcast/trigger", json=broad_payload, headers={"X-Auth-Role": "FIELD_OFFICER"})
        self.assertEqual(res_fo.status_code, 403)

        # Authorized Admin succeeds
        res_adm = self.client.post("/api/broadcast/trigger", json=broad_payload, headers={"X-Auth-Role": "ADMIN"})
        self.assertEqual(res_adm.status_code, 200)
        data = res_adm.json()
        self.assertEqual(data["status"], "DISPATCHED")
        self.assertEqual(data["dispatched_by_role"], "ADMIN")
        self.assertGreater(data["sms_queue_count"], 0)

        # Authorized Govt Official succeeds
        res_govt = self.client.post("/api/broadcast/trigger", json=broad_payload, headers={"X-Auth-Role": "GOVERNMENT_OFFICIAL"})
        self.assertEqual(res_govt.status_code, 200)
        self.assertEqual(res_govt.json()["dispatched_by_role"], "GOVERNMENT_OFFICIAL")

    def test_api_sos_trigger_and_active(self):
        """Test SOS beacon trigger and active signal monitoring."""
        sos_payload = {
            "user_name": "Deepak Gurung",
            "phone": "+91-98765-43210",
            "state": "Sikkim",
            "corridor": "NH-10 Likuvir Slide Zone",
            "coordinates": [27.0540, 88.4830],
            "situation": "Car trapped in rock debris. Need towing and rescue.",
            "severity": "CRITICAL"
        }
        res_trigger = self.client.post("/api/emergency/sos/trigger", json=sos_payload)
        self.assertEqual(res_trigger.status_code, 200)
        data = res_trigger.json()
        self.assertEqual(data["status"], "BEACON_ACTIVATED")
        self.assertIn("SOS-2026-", data["sos_id"])

        res_active = self.client.get("/api/emergency/sos/active")
        self.assertEqual(res_active.status_code, 200)
        data_act = res_active.json()
        self.assertGreaterEqual(data_act["active_distress_count"], 1)
        self.assertGreaterEqual(data_act["count"], 1)

    def test_api_sos_manage_rbac(self):
        """Test DDMA Authorizer managing SOS signals (Dispatch & Resolve)."""
        # Unauthenticated request returns 403
        res_unauth = self.client.post("/api/emergency/sos/manage", json={
            "sos_id": "SOS-2026-001",
            "action": "DISPATCH"
        })
        self.assertEqual(res_unauth.status_code, 403)

        # Citizen role returns 403
        res_citizen = self.client.post("/api/emergency/sos/manage", json={
            "sos_id": "SOS-2026-001",
            "action": "DISPATCH"
        }, headers={"X-Auth-Role": "CITIZEN"})
        self.assertEqual(res_citizen.status_code, 403)

        # Authorized Field Officer can dispatch SDRF
        res_fo = self.client.post("/api/emergency/sos/manage", json={
            "sos_id": "SOS-2026-001",
            "action": "DISPATCH",
            "assigned_unit": "SDRF Pakyong Unit 1"
        }, headers={"X-Auth-Role": "FIELD_OFFICER"})
        self.assertEqual(res_fo.status_code, 200)
        self.assertEqual(res_fo.json()["status"], "UPDATED")
        self.assertEqual(res_fo.json()["sos"]["status"], "ACKNOWLEDGED_EN_ROUTE")

        # Authorized Admin can mark resolved
        res_adm = self.client.post("/api/emergency/sos/manage", json={
            "sos_id": "SOS-2026-001",
            "action": "RESOLVE"
        }, headers={"X-Auth-Role": "ADMIN"})
        self.assertEqual(res_adm.status_code, 200)
        self.assertEqual(res_adm.json()["sos"]["status"], "RESCUE_COMPLETED")

    def test_api_reports_photo_presence(self):
        """Test that reports with uploaded photo base64 properly retain photo_url for DDMA gallery."""
        photo_payload = {
            "reporter_name": "Officer Karma",
            "reporter_role": "BRO Swastik Patrol",
            "state": "Sikkim",
            "location_name": "NH-10 Likuvir Crown Scarp",
            "coordinates": [27.0540, 88.4825],
            "crack_type": "Tension Crack (Crown)",
            "crack_width_mm": 140.0,
            "crack_depth_cm": 70.0,
            "crack_length_m": 30.0,
            "road_subsidence_cm": 25.0,
            "photo_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
            "notes": "Crown crack expanding rapidly under heavy rainfall."
        }
        res = self.client.post("/api/reports/submit", json=photo_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsNotNone(data["record"]["photo_url"])

        # Check list endpoint contains photo
        res_list = self.client.get("/api/reports/list")
        self.assertEqual(res_list.status_code, 200)
        reports_with_photo = [r for r in res_list.json()["reports"] if r.get("photo_url")]
        self.assertGreaterEqual(len(reports_with_photo), 1)

    def test_api_download_info(self):
        """Test /api/download/info returns Android APK package metadata and URLs."""
        res = self.client.get("/api/download/info")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["package_name"], "in.gov.ndma.pralayrakshak.ner")
        self.assertEqual(data["version"], "2.0.0")
        self.assertIn("download_url", data)
        self.assertIn("size_kb", data)
        self.assertIn("min_android_version", data)

    def test_api_download_apk(self):
        """Test /api/download/apk serves the Android package archive."""
        res = self.client.get("/api/download/apk")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("content-type"), "application/vnd.android.package-archive")
        self.assertIn("attachment; filename=", res.headers.get("content-disposition", ""))
        self.assertGreater(len(res.content), 1000)

    def test_serve_frontend(self):
        """Test root / serves index.html."""
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("PRALAY-RAKSHAK", res.text)


if __name__ == "__main__":
    unittest.main()

