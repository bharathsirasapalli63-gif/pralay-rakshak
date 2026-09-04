/**
 * Leaflet GIS Interactive Map Engine
 * Specialized for North Eastern Region (Eastern Himalayas & Shillong Plateau)
 */

class GISMapController {
  constructor() {
    this.map = null;
    this.baseLayers = {};
    this.layerGroups = {
      hazards: null,
      sensors: null,
      highways: null,
      shelters: null,
      weatherRadar: null,
      weatherStations: null,
      evacuation: null
    };
    this.currentBasemap = 'light';
    // Center around Eastern Himalayas / North East (Lat: 26.2, Lng: 92.5)
    this.initialCenter = [26.2000, 92.5000];
    this.initialZoom = 7;
  }

  init() {
    const mapElement = document.getElementById('gisMap');
    if (!mapElement) return;

    // Initialize Leaflet Map
    this.map = L.map('gisMap', {
      center: this.initialCenter,
      zoom: this.initialZoom,
      zoomControl: true,
      attributionControl: false
    });

    // Setup Basemap Tile Layers (Light Voyager, Topo, Satellite, Dark)
    this.baseLayers.light = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    });

    this.baseLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    this.baseLayers.topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17
    });

    this.baseLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    });

    // Default to Light theme
    this.baseLayers.light.addTo(this.map);

    // Initialize Layer Groups
    this.layerGroups.hazards = L.layerGroup().addTo(this.map);
    this.layerGroups.highways = L.layerGroup().addTo(this.map);
    this.layerGroups.sensors = L.layerGroup().addTo(this.map);
    this.layerGroups.shelters = L.layerGroup().addTo(this.map);
    this.layerGroups.weatherRadar = L.layerGroup().addTo(this.map);
    this.layerGroups.weatherStations = L.layerGroup().addTo(this.map);
    this.layerGroups.evacuation = L.layerGroup().addTo(this.map);

    // Load initial data layers
    this.loadAllLayers();
    this.setupEventListeners();
  }

  switchBasemap(styleName) {
    if (!this.baseLayers[styleName]) return;
    Object.values(this.baseLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });
    this.baseLayers[styleName].addTo(this.map);
    this.currentBasemap = styleName;
  }

  setupEventListeners() {
    // Layer Checkboxes
    const layerHazards = document.getElementById('layerHazards');
    if (layerHazards) {
      layerHazards.addEventListener('change', (e) => {
        if (e.target.checked) this.layerGroups.hazards.addTo(this.map);
        else this.map.removeLayer(this.layerGroups.hazards);
      });
    }

    const layerSensors = document.getElementById('layerSensors');
    if (layerSensors) {
      layerSensors.addEventListener('change', (e) => {
        if (e.target.checked) this.layerGroups.sensors.addTo(this.map);
        else this.map.removeLayer(this.layerGroups.sensors);
      });
    }

    const layerHighways = document.getElementById('layerHighways');
    if (layerHighways) {
      layerHighways.addEventListener('change', (e) => {
        if (e.target.checked) this.layerGroups.highways.addTo(this.map);
        else this.map.removeLayer(this.layerGroups.highways);
      });
    }

    const layerShelters = document.getElementById('layerShelters');
    if (layerShelters) {
      layerShelters.addEventListener('change', (e) => {
        if (e.target.checked) this.layerGroups.shelters.addTo(this.map);
        else this.map.removeLayer(this.layerGroups.shelters);
      });
    }

    const layerWeatherRadar = document.getElementById('layerWeatherRadar');
    if (layerWeatherRadar) {
      layerWeatherRadar.addEventListener('change', (e) => {
        if (e.target.checked) this.layerGroups.weatherRadar.addTo(this.map);
        else this.map.removeLayer(this.layerGroups.weatherRadar);
      });
    }

    const layerWeatherStations = document.getElementById('layerWeatherStations');
    if (layerWeatherStations) {
      layerWeatherStations.addEventListener('change', (e) => {
        if (e.target.checked) this.layerGroups.weatherStations.addTo(this.map);
        else this.map.removeLayer(this.layerGroups.weatherStations);
      });
    }

    // Basemap Segmented Buttons
    document.querySelectorAll('.btn-segment[data-basemap]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-segment[data-basemap]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchBasemap(btn.getAttribute('data-basemap'));
      });
    });

    // Quick Corridor Chips
    document.querySelectorAll('.chip-btn[data-center]').forEach(chip => {
      chip.addEventListener('click', () => {
        const [lat, lng] = chip.getAttribute('data-center').split(',').map(Number);
        const zoom = parseInt(chip.getAttribute('data-zoom') || '13', 10);
        this.flyTo(lat, lng, zoom);
      });
    });
  }

  flyTo(lat, lng, zoom = 13) {
    if (!this.map) return;
    this.map.flyTo([lat, lng], zoom, {
      duration: 1.4,
      easeLinearity: 0.25
    });
  }

  async loadAllLayers() {
    await Promise.all([
      this.loadHazardsLayer(),
      this.loadHighwaysLayer(),
      this.loadSensorsLayer(),
      this.loadSheltersLayer(),
      this.loadWeatherRadarLayer(),
      this.loadWeatherStationsLayer()
    ]);
  }

  async loadHazardsLayer() {
    try {
      const res = await fetch('/api/gis/hazards');
      const data = await res.json();
      this.layerGroups.hazards.clearLayers();

      const colorMap = {
        RED: '#dc2626',
        ORANGE: '#ea580c',
        YELLOW: '#d97706',
        GREEN: '#16a34a'
      };

      L.geoJSON(data, {
        style: (feature) => {
          const risk = feature.properties.risk_level || 'YELLOW';
          const color = colorMap[risk] || '#ea580c';
          return {
            color: color,
            weight: 2,
            opacity: 0.9,
            fillColor: color,
            fillOpacity: risk === 'RED' ? 0.35 : 0.25,
            dashArray: risk === 'RED' ? '4, 4' : null
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          const villages = p.vulnerable_villages ? p.vulnerable_villages.join(', ') : 'N/A';
          const popupHtml = `
            <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 200px;">
              <div style="font-weight: 800; font-size: 13px; color: ${colorMap[p.risk_level]}; margin-bottom: 4px;">
                 ${p.name}
              </div>
              <div><strong>State:</strong> ${p.state}</div>
              <div><strong>Hazard Level:</strong> <span style="color:${colorMap[p.risk_level]}; font-weight:700;">${p.risk_level} (LHI: ${p.lhi_score})</span></div>
              <div style="margin-top: 4px;"><strong>Trigger Factors:</strong> ${p.trigger_cause}</div>
              <div style="margin-top: 4px;"><strong>Vulnerable Habitats:</strong> ${villages}</div>
              <div style="margin-top: 4px;"><strong>Pop. At Risk:</strong> ${p.population_at_risk.toLocaleString()} residents</div>
            </div>
          `;
          layer.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
        }
      }).addTo(this.layerGroups.hazards);
    } catch (err) {
      console.warn("Failed to load hazard GIS layer:", err);
    }
  }

  async loadHighwaysLayer() {
    try {
      const res = await fetch('/api/gis/highways');
      const data = await res.json();
      this.layerGroups.highways.clearLayers();

      const statusColors = {
        CLEAR: '#16a34a',
        RESTRICTED: '#ea580c',
        BLOCKED: '#dc2626'
      };

      L.geoJSON(data, {
        style: (feature) => {
          const status = feature.properties.status || 'CLEAR';
          const color = statusColors[status] || '#16a34a';
          return {
            color: color,
            weight: status === 'BLOCKED' ? 5 : 4,
            opacity: 0.95,
            dashArray: status === 'RESTRICTED' ? '6, 6' : null
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          const statusColor = statusColors[p.status];
          const popupHtml = `
            <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 220px;">
              <div style="font-weight: 800; font-size: 13px; color: ${statusColor}; margin-bottom: 4px;">
                 ${p.name}
              </div>
              <div><strong>Status:</strong> <span style="color:${statusColor}; font-weight:700;">${p.status}</span></div>
              <div><strong>Region:</strong> ${p.state}</div>
              <div style="margin-top: 4px;"><strong>Condition:</strong> ${p.blockage_reason}</div>
              ${p.est_clearance_hours > 0 ? `<div><strong>Est. Clearance:</strong> ~${p.est_clearance_hours} hours</div>` : ''}
              <div><strong>Agency:</strong> ${p.clearance_agency}</div>
              <div style="margin-top: 6px; background: #f0fdf4; padding: 4px 6px; border-radius: 4px; border: 1px solid #bbf7d0; color: #166534;">
                <strong>Detour:</strong> ${p.detour_route}
              </div>
            </div>
          `;
          layer.bindPopup(popupHtml);
        }
      }).addTo(this.layerGroups.highways);
    } catch (err) {
      console.warn("Failed to load highway GIS layer:", err);
    }
  }

  async loadSensorsLayer() {
    try {
      const res = await fetch('/api/sensors/live');
      const data = await res.json();
      this.layerGroups.sensors.clearLayers();

      data.sensors.forEach(s => {
        const markerColor = s.color_hex || '#0284c7';

        // Custom animated HTML marker
        const iconHtml = `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${markerColor}; opacity: 0.35; animation: pulseRadar 2s infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${markerColor}; border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-sensor-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker(s.coordinates, { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 230px;">
            <div style="font-weight: 800; font-size: 13px; color: ${markerColor}; margin-bottom: 2px;">
               ${s.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${s.corridor} (${s.state})</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #f8fafc; padding: 6px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #e2e8f0;">
              <div><strong>LHI Hazard:</strong> <span style="color:${markerColor}; font-weight:700;">${s.hazard_level} (${s.lhi})</span></div>
              <div><strong>Slope:</strong> ${s.slope_deg}°</div>
              <div><strong>24h Rain:</strong> ${s.rainfall_24h_mm} mm</div>
              <div><strong>Velocity:</strong> ${s.displacement_velocity_mm_hr} mm/h</div>
              <div><strong>Soil Moisture:</strong> ${s.soil_moisture_vwc_pct}%</div>
              <div><strong>Pore Press:</strong> ${s.piezometer_pwp_kpa} kPa</div>
            </div>
            <div style="font-size: 10px; color: #64748b;">Lithology: ${s.lithology}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(this.layerGroups.sensors);
      });
    } catch (err) {
      console.warn("Failed to load sensor GIS layer:", err);
    }
  }

  async loadSheltersLayer() {
    try {
      const res = await fetch('/api/gis/shelters');
      const data = await res.json();
      this.layerGroups.shelters.clearLayers();

      L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          const iconHtml = `
            <div style="background: #16a34a; border: 2px solid white; border-radius: 6px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
              
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'shelter-icon',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          return L.marker(latlng, { icon: customIcon });
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          const popupHtml = `
            <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 220px;">
              <div style="font-weight: 800; font-size: 13px; color: #16a34a; margin-bottom: 2px;">
                 ${p.name}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${p.type} • ${p.district}, ${p.state}</div>
              
              <div style="margin-bottom: 4px;"><strong>Capacity:</strong> ${p.capacity_persons} persons (${p.available_beds} beds available)</div>
              <div><strong>Medical Officer:</strong> ${p.medical_officer_available ? ' On-site' : ' Standby'}</div>
              <div><strong>Helipad Ready:</strong> ${p.helipad_ready ? ' Certified' : 'None'}</div>
              <div><strong>Stationed Unit:</strong> ${p.sdrf_team_stationed}</div>
              <div style="margin-top: 6px;">
                <a href="tel:${p.emergency_contact}" style="display:inline-block; background: #16a34a; color: #ffffff; font-weight:700; padding: 3px 8px; border-radius: 4px; text-decoration: none;">
                   Call: ${p.emergency_contact}
                </a>
              </div>
            </div>
          `;
          layer.bindPopup(popupHtml);
        }
      }).addTo(this.layerGroups.shelters);
    } catch (err) {
      console.warn("Failed to load shelters GIS layer:", err);
    }
  }

  async loadWeatherRadarLayer() {
    try {
      const res = await fetch('/api/gis/weather-radar');
      const data = await res.json();
      this.layerGroups.weatherRadar.clearLayers();

      const radarIntensityColors = {
        SEVERE_CLOUDBURST: '#ef4444',
        SEVERE_CONVECTIVE: '#ef4444',
        HIGH_PRECIPITATION: '#ea580c',
        MODERATE_TO_HEAVY: '#2563eb'
      };

      // 1. Render radar storm polygons
      L.geoJSON(data, {
        style: (feature) => {
          const intensity = feature.properties.intensity || 'HIGH_PRECIPITATION';
          const color = radarIntensityColors[intensity] || feature.properties.color_hex || '#ef4444';
          return {
            color: color,
            weight: 2,
            opacity: 0.9,
            fillColor: color,
            fillOpacity: intensity.includes('SEVERE') ? 0.38 : 0.22,
            dashArray: '5, 5'
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          const color = radarIntensityColors[p.intensity] || p.color_hex || '#ef4444';
          const popupHtml = `
            <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 230px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 4px;">
                <span style="font-size: 10px; font-weight: 800; background: ${color}; color: white; padding: 2px 6px; border-radius: 4px;">${p.intensity.replace(/_/g, ' ')}</span>
                <span style="font-size: 11px; font-weight: 700; color: #64748b;">${p.echo_top_km} km Top</span>
              </div>
              <div style="font-weight: 800; font-size: 13px; color: ${color}; margin-bottom: 4px;">
                ${p.name}
              </div>
              <div><strong>Region:</strong> ${p.state}</div>
              <div><strong>Echo Reflectivity:</strong> <span style="font-weight:700; color:${color};">${p.reflectivity_dbz} dBZ</span></div>
              <div><strong>Precipitation Rate:</strong> <strong>${p.rainfall_rate_mm_hr} mm/hr</strong></div>
              <div><strong>Storm Movement:</strong> ${p.cell_movement}</div>
              <div style="margin-top: 6px; padding: 5px 8px; background: #fef2f2; border-radius: 4px; font-size: 11px; border: 1px solid #fecaca; color: #991b1b;">
                <strong>NDMA / IMD Advisory:</strong> High-reflectivity cloudburst cell. Mountain road blockages likely.
              </div>
            </div>
          `;
          layer.bindPopup(popupHtml);
        }
      }).addTo(this.layerGroups.weatherRadar);

      // 2. Render Sachet-style central storm cell marker on each polygon center
      data.features.forEach(feat => {
        const p = feat.properties;
        const center = p.center_coordinates || [feat.geometry.coordinates[0][0][1], feat.geometry.coordinates[0][0][0]];
        const iconType = p.alert_icon || 'CLOUDBURST';
        const level = p.warning_level || 'RED';

        const sachetHtml = this.getSachetMarkerHtml(iconType, level, null, p.intensity);
        const customIcon = L.divIcon({
          html: sachetHtml,
          className: 'sachet-storm-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const stormMarker = L.marker(center, { icon: customIcon });
        const stormPopup = `
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 220px;">
            <div style="font-size: 10px; font-weight: 800; color: #ef4444; margin-bottom: 2px;">NDMA / SACHET RADAR ALERT</div>
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 4px;">${p.name}</div>
            <div><strong>Severity:</strong> <span style="color:#dc2626; font-weight:700;">${p.intensity} (${p.reflectivity_dbz} dBZ)</span></div>
            <div><strong>Rain Rate:</strong> ${p.rainfall_rate_mm_hr} mm/h</div>
            <div><strong>Track:</strong> ${p.cell_movement}</div>
          </div>
        `;
        stormMarker.bindPopup(stormPopup);
        stormMarker.addTo(this.layerGroups.weatherRadar);
      });

    } catch (err) {
      console.warn("Failed to load weather radar GIS layer:", err);
    }
  }

  async loadWeatherStationsLayer() {
    try {
      const res = await fetch('/api/gis/weather-stations');
      const data = await res.json();
      this.layerGroups.weatherStations.clearLayers();

      let maxRainRate = 0;
      let maxRainStation = '';
      let maxEcho = 0;

      data.features.forEach(feat => {
        const p = feat.properties;
        const coords = [feat.geometry.coordinates[1], feat.geometry.coordinates[0]]; // [lat, lng]

        if (p.rainfall_rate_mm_hr > maxRainRate) {
          maxRainRate = p.rainfall_rate_mm_hr;
          maxRainStation = p.name.split(' ')[0];
        }
        if (p.radar_reflectivity_dbz > maxEcho) {
          maxEcho = p.radar_reflectivity_dbz;
        }

        const iconType = p.alert_icon || 'HEAVY_RAIN';
        const level = p.warning_level || (p.rainfall_rate_mm_hr >= 25.0 ? 'RED' : (p.rainfall_rate_mm_hr >= 15.0 ? 'ORANGE' : 'YELLOW'));
        const tempText = `${Math.round(p.temp_c)}°`;

        // Create Sachet Circular Badge Icon
        const sachetHtml = this.getSachetMarkerHtml(iconType, level, tempText, p.condition);

        const customIcon = L.divIcon({
          html: sachetHtml,
          className: 'sachet-weather-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker(coords, { icon: customIcon });

        const levelColors = {
          RED: '#dc2626',
          ORANGE: '#ea580c',
          YELLOW: '#ca8a04',
          GREEN: '#16a34a'
        };
        const badgeColor = levelColors[level] || '#0284c7';

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 250px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; background: ${badgeColor}; color: white; padding: 2px 6px; border-radius: 4px;">
                ${level} ALERT • ${p.alert_icon.replace(/_/g, ' ')}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: #64748b;">${p.temp_c}°C</span>
            </div>
            <div style="font-weight: 800; font-size: 13px; color: ${badgeColor}; margin-bottom: 2px;">
              ${p.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${p.district}, ${p.state} • Elev: ${p.elevation_m}m</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #f8fafc; padding: 6px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #e2e8f0;">
              <div><strong>Condition:</strong> <span style="color:${badgeColor}; font-weight:700;">${p.condition}</span></div>
              <div><strong>Rain Rate:</strong> <strong>${p.rainfall_rate_mm_hr} mm/h</strong></div>
              <div><strong>24h Rainfall:</strong> ${p.rainfall_24h_mm} mm</div>
              <div><strong>Humidity:</strong> ${p.humidity_pct}%</div>
              <div><strong>Wind:</strong> ${p.wind_direction} ${p.wind_speed_kmh} km/h</div>
              <div><strong>Pressure:</strong> ${p.pressure_hpa} hPa</div>
              <div><strong>Radar Echo:</strong> ${p.radar_reflectivity_dbz} dBZ</div>
              <div><strong>Dew Point:</strong> ${p.dew_point_c}°C</div>
            </div>
            <div style="padding: 4px 6px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 11px; color: #1e40af;">
              <strong>IMD Live Telemetry:</strong> Station active • ${p.status}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(this.layerGroups.weatherStations);
      });

      // Update Weather HUD elements
      const echoEl = document.getElementById('hudRadarEcho');
      const rainEl = document.getElementById('hudMaxRain');
      const cellsEl = document.getElementById('hudStormCells');
      if (echoEl) echoEl.textContent = `${maxEcho.toFixed(1)} dBZ (Active Radar)`;
      if (rainEl) rainEl.textContent = `${maxRainRate.toFixed(1)} mm/h (${maxRainStation})`;
      if (cellsEl) cellsEl.textContent = `${data.features.length} Met Stations Monitored`;

    } catch (err) {
      console.warn("Failed to load weather stations GIS layer:", err);
    }
  }

  getSachetMarkerHtml(type, level, tempText, tooltipTitle) {
    const colorMap = {
      RED: '#e53935',
      ORANGE: '#fb8c00',
      YELLOW: '#fdd835',
      GREEN: '#43a047'
    };
    const bgColor = colorMap[level] || '#fdd835';

    // Exact NDMA Sachet Vector Glyphs
    const svgIcons = {
      HEAVY_RAIN: `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
          <path d="M8 18v2"/>
          <path d="M12 17v3"/>
          <path d="M16 18v2"/>
        </svg>`,
      THUNDERSTORM: `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/>
          <polyline points="13 10 9 16 14 16 10 22"/>
        </svg>`,
      CLOUDBURST: `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
          <path d="M7 17v4"/>
          <path d="M11 16v5"/>
          <path d="M15 17v4"/>
        </svg>`,
      LANDSLIDE: `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 20L13 7l8 13H3z"/>
          <path d="M10 14l2-3 2 3"/>
          <circle cx="16" cy="11" r="1.5" fill="#111827"/>
          <circle cx="8" cy="16" r="1.5" fill="#111827"/>
        </svg>`,
      SQUALL: `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
          <path d="M19.6 12a2 2 0 1 1-1.4 3.4H2"/>
          <path d="M15 16.4a2 2 0 1 1-1.4 3.4H2"/>
        </svg>`
    };

    const iconSvg = svgIcons[type] || svgIcons.HEAVY_RAIN;

    return `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="${tooltipTitle || ''}">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${bgColor}; opacity: 0.4; animation: pulseSachet 2.2s infinite ease-out;"></div>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bgColor}; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; position: relative;">
          ${iconSvg}
        </div>
        ${tempText ? `<div style="position: absolute; bottom: -6px; background: #0f172a; color: #ffffff; font-size: 8px; font-weight: 800; padding: 1px 3px; border-radius: 3px; border: 1px solid #ffffff; line-height: 1;">${tempText}</div>` : ''}
      </div>
    `;
  }

  drawEvacuationRoute(routeData) {
    if (!this.map || !routeData) return;
    this.layerGroups.evacuation.clearLayers();

    const waypoints = routeData.route_waypoints; // [[lat, lng], ...]

    // Polyline glow effect
    const glowLine = L.polyline(waypoints, {
      color: '#0284c7',
      weight: 8,
      opacity: 0.35
    }).addTo(this.layerGroups.evacuation);

    // Active track polyline
    const routeLine = L.polyline(waypoints, {
      color: '#2563eb',
      weight: 4,
      dashArray: '8, 6',
      opacity: 0.95
    }).addTo(this.layerGroups.evacuation);

    // Add Start Marker (Origin)
    const startIcon = L.divIcon({
      html: `<div style="background:#dc2626; border:2px solid white; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:800;"></div>`,
      className: 'route-origin-icon',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker(waypoints[0], { icon: startIcon })
      .bindPopup("<strong>Your Location (Origin)</strong>")
      .addTo(this.layerGroups.evacuation);

    // Add Destination Marker (Shelter)
    const endPoint = waypoints[waypoints.length - 1];
    const endIcon = L.divIcon({
      html: `<div style="background:#16a34a; border:2px solid white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:11px;"></div>`,
      className: 'route-dest-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    L.marker(endPoint, { icon: endIcon })
      .bindPopup(`<strong>Safe Destination Shelter:</strong><br>${routeData.destination_shelter.name}`)
      .addTo(this.layerGroups.evacuation);

    // Fit map bounds to show complete evacuation route
    this.map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
  }

  focusSOSLocation(coords, userName, situation) {
    if (!this.map || !coords) return;
    if (!this.layerGroups.evacuation) {
      this.layerGroups.evacuation = L.layerGroup().addTo(this.map);
    }
    this.layerGroups.evacuation.clearLayers();

    const sosIcon = L.divIcon({
      html: `<div style="background:#dc2626; border:3px solid #ffffff; box-shadow:0 0 15px rgba(220,38,38,0.8); border-radius:50%; width:24px; height:24px; animation: pulseSachet 1.2s infinite alternate;"></div>`,
      className: 'sos-beacon-map-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker(coords, { icon: sosIcon })
      .bindPopup(`
        <div style="font-family:inherit; min-width:200px;">
          <div style="color:#b91c1c; font-weight:800; font-size:12px; margin-bottom:4px;">LIVE SOS DISTRESS BEACON</div>
          <div style="font-weight:700; font-size:12px; color:#1e3a8a;">${userName}</div>
          <div style="font-size:11px; color:#334155; margin:4px 0;"><strong>Situation:</strong> ${situation}</div>
          <div style="font-size:10px; color:#64748b; font-family:monospace;">GPS: ${coords[0]}, ${coords[1]}</div>
        </div>
      `)
      .addTo(this.layerGroups.evacuation);

    this.map.setView(coords, 14, { animate: true });
    setTimeout(() => {
      marker.openPopup();
    }, 400);
  }
}

// Global GIS Controller Instance
window.GISMap = new GISMapController();
