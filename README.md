# PRALAY-RAKSHAK (प्रलय-रक्षक)
### AI-Powered Landslide Early Warning, GIS Radar Monitoring & Field Response Platform

An authoritative landslide disaster risk reduction (DRR) and response system specifically engineered for the high-vulnerability hill corridors across the **North Eastern Region (NER) of India** (Assam, Sikkim, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura).

---

## Key Features

1. **Live GIS Map & Radar Overlays**
   - High-resolution Leaflet GIS engine with Doppler precipitation radar overlays, storm cells, and IMD automated weather stations.
   - Real-time hazard polygons, slope susceptibility index, vulnerable highway corridors, and SDRF relief shelters.

2. **Geotechnical Factor of Safety & AI Early Warning**
   - Integrated infinite slope limit-equilibrium Factor of Safety (FoS) calculator factoring pore water pressure dynamics.
   - Dynamic Landslide Hazard Index (LHI) based on 24h/72h antecedent rainfall intensity-duration (I-D) thresholds and tilt velocities.

3. **Top-Right DDMA Command Login & Role-Based Access Control (RBAC)**
   - **District Admin / SDMA (Level-1)**: Full command, cloudburst deluge stress-testing simulator, multi-channel siren broadcast dispatch.
   - **Field Officer (Level-2)**: Tension crack and ground subsidence triage, drone photo verification, SDRF squad dispatch.
   - **Government Official (Executive)**: Executive oversight, real-time regional telemetry monitoring, and inter-agency resource deployment.

4. **Field Incident Reporting with Offline Queue Sync**
   - Citizen and field officer fissure damage reporting with photo uploads, GPS coordinates, and offline IndexedDB caching.
   - Automatic sync when network connectivity is restored.

5. **1-Tap Emergency SOS Beacon & Multilingual Siren**
   - Instant GPS distress beacon transmission to DDMA live dispatch console.
   - Offline SMS emergency generator with pre-formatted coordinates for mountain dead zones.
   - Web Audio API disaster siren broadcasting voice advisories in **8 Regional Languages** (*English, Hindi, Assamese, Bengali, Nepali, Mizo, Khasi, Manipuri*).

6. **Standalone Android APK Release**
   - Offline-capable Android APK package (PRALAY-RAKSHAK-Landslide-NER-v2.0.0.apk) with Service Worker & IndexedDB caching.

---

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic, GeoJSON
- **Frontend**: HTML5, Modern CSS (Pure Royal Navy Blue theme, zero external icon dependencies), Vanilla ES6+ JavaScript, Leaflet.js, Web Audio API
- **Storage & Offline**: IndexedDB, Service Worker PWA, In-Memory Thread-Safe Data Store

---

## Quick Start (Local Run)

`ash
# Clone the repository
git clone <your-repo-url>
cd project

# Install dependencies
pip install -r requirements.txt

# Run the application
python run.py
`

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## License & Attribution
National Disaster Management Authority (NDMA) & Geological Survey of India (GSI) DRR Framework compliant.
