/**
 * Static Host / GitHub Pages Fetch Interceptor & Mock Service Worker
 * Ensures full interactive functionality (GIS layers, AI predictor, FoS, DDMA login, SOS triggers)
 * on static hosting platforms like GitHub Pages where a Python backend is not running.
 */

(function() {
  const isStaticHost = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
  const originalFetch = window.fetch;

  let inMemoryReports = [
    {
      report_id: 'REP-2026-001',
      timestamp: Date.now() - 3600000,
      reporter_name: 'Capt. Tashi Bhutia',
      reporter_role: 'BRO Project Swastik',
      state: 'Sikkim',
      location_name: 'NH-10 Km 29.4 (Sevoke-Teesta)',
      coordinates: [27.0540, 88.4825],
      crack_type: 'Tension Crack (Crown)',
      crack_width_mm: 140.0,
      crack_depth_cm: 70.0,
      crack_length_m: 30.0,
      road_subsidence_cm: 25.0,
      photo_url: 'img/sample_crack1.jpg',
      notes: 'Active tension fissure widening at upper shoulder scarp.'
    }
  ];

  let inMemorySOS = [
    {
      sos_id: 'SOS-2026-001',
      timestamp: Date.now() - 1800000,
      user_name: 'Deepak Gurung',
      phone: '+91-98765-43210',
      state: 'Sikkim',
      corridor: 'NH-10 Likuvir Slide Zone',
      coordinates: [27.0540, 88.4830],
      situation: 'Vehicle trapped behind rockfall debris. 4 passengers inside. Safe but road blocked.',
      severity: 'CRITICAL',
      status: 'ACTIVE_SEARCH_PENDING'
    }
  ];

  function jsonResponse(data, status = 200) {
    return Promise.resolve(new Response(JSON.stringify(data), {
      status: status,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const pathPrefix = window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

  window.fetch = async function(url, options = {}) {
    const urlStr = typeof url === 'string' ? url : (url.url || '');
    const method = (options.method || 'GET').toUpperCase();

    if (urlStr.startsWith('/api/') || urlStr.includes('/api/')) {
      const apiPath = urlStr.substring(urlStr.indexOf('/api/'));

      if (method === 'GET') {
        if (apiPath === '/api/reports/list') {
          return jsonResponse({ count: inMemoryReports.length, reports: inMemoryReports });
        }
        if (apiPath === '/api/emergency/sos/active') {
          const active = inMemorySOS.filter(s => s.status !== 'RESCUE_COMPLETED');
          return jsonResponse({ count: inMemorySOS.length, active_distress_count: active.length, sos_records: inMemorySOS });
        }

        const staticMap = {
          '/api/risk/summary': 'api_data/risk_summary.json',
          '/api/sensors/live': 'api_data/sensors_live.json',
          '/api/gis/hazards': 'api_data/gis_hazards.json',
          '/api/gis/highways': 'api_data/gis_highways.json',
          '/api/gis/shelters': 'api_data/gis_shelters.json',
          '/api/gis/weather-stations': 'api_data/gis_weather_stations.json',
          '/api/gis/weather-radar': 'api_data/gis_weather_radar.json',
          '/api/alerts/active': 'api_data/alerts_active.json',
          '/api/download/info': 'api_data/download_info.json',
          '/api/auth/roles': 'api_data/auth_roles.json'
        };

        if (staticMap[apiPath]) {
          try {
            const staticUrl = pathPrefix + staticMap[apiPath];
            const resp = await originalFetch(staticUrl);
            if (resp.ok) return resp;
          } catch (e) {
            console.warn('Fallback to native fetch for', apiPath);
          }
        }
      }

      if (method === 'POST') {
        let body = {};
        if (options.body) {
          try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body; } catch(e){}
        }

        if (apiPath === '/api/auth/login') {
          const role = body.role || 'ADMIN';
          const officer_id = body.officer_id || 'ADM-NER-01';
          const pin = body.pin || '1234';

          if (pin !== '1234') {
            return jsonResponse({ detail: 'Invalid Security PIN. Access denied.' }, 401);
          }

          const rolesData = {
            'ADMIN': { name: 'Dr. Debojit Barman', dept: 'State Disaster Management Authority (SDMA)', clearance: 'LEVEL_1_COMMAND', title: 'District Admin / SDMA' },
            'FIELD_OFFICER': { name: 'Capt. Tashi Bhutia', dept: 'Border Roads Organisation & SDRF Quick Response', clearance: 'LEVEL_2_FIELD_OPS', title: 'Field Operations Commander' },
            'GOVERNMENT_OFFICIAL': { name: 'Smt. Ananya Saikia, IAS', dept: 'Ministry of Home Affairs (NER Coordination)', clearance: 'EXECUTIVE_OVERSIGHT', title: 'Executive State Observer' }
          };

          const user = rolesData[role] || rolesData['ADMIN'];
          return jsonResponse({
            status: 'AUTHENTICATED',
            role: role,
            role_title: user.title,
            officer_name: user.name,
            officer_id: officer_id,
            department: user.dept,
            clearance_level: user.clearance,
            auth_token: 'DDMA_AUTH_TOKEN_' + role + '_' + Date.now()
          });
        }

        if (apiPath === '/api/risk/predict') {
          const slope = body.slope_deg || 45.0;
          const r24 = body.rainfall_24h_mm || 120.0;
          const vwc = body.soil_moisture_vwc || 42.0;
          const lhi = Math.min(100, Math.round((slope * 0.4) + (r24 * 0.3) + (vwc * 0.3)));
          const level = lhi >= 70 ? 'RED' : (lhi >= 45 ? 'ORANGE' : 'YELLOW');
          const color = level === 'RED' ? '#ff1744' : (level === 'ORANGE' ? '#ff9100' : '#ffea00');

          return jsonResponse({
            lhi_assessment: {
              lhi: lhi,
              hazard_level: level,
              color_hex: color,
              failure_probability: lhi / 100,
              status_text: level === 'RED' ? 'Imminent Slope Instability' : 'Active Soil Saturation Warning',
              recommended_action: level === 'RED' ? 'Order immediate traffic suspension and village evacuation.' : 'Place SDRF quick response teams on standby.'
            },
            rainfall_id_threshold: { ratio: (r24 / 75.0).toFixed(2), status: r24 >= 75 ? 'BREACHED' : 'SAFE' },
            factor_of_safety: { fos: (1.45 - (r24 * 0.005)).toFixed(2), stability_class: r24 >= 100 ? 'Critically Unstable' : 'Marginally Stable' }
          });
        }

        if (apiPath === '/api/risk/fos') {
          const u = body.pore_pressure_kpa || 25.0;
          const beta = (body.slope_angle_deg || 40.0) * (Math.PI / 180);
          const c = body.cohesion_kpa || 14.0;
          const phi = (body.friction_angle_deg || 28.0) * (Math.PI / 180);
          const z = body.soil_depth_m || 3.0;
          const gamma = 19.5;

          const sigma_n = gamma * z * Math.pow(Math.cos(beta), 2);
          const tau_d = gamma * z * Math.sin(beta) * Math.cos(beta);
          const tau_f = c + Math.max(0, sigma_n - u) * Math.tan(phi);
          const fos = Math.max(0.1, tau_f / Math.max(0.1, tau_d));
          const tier = fos < 1.0 ? 'RED' : (fos < 1.3 ? 'ORANGE' : (fos < 1.6 ? 'YELLOW' : 'GREEN'));

          return jsonResponse({
            fos: fos.toFixed(2),
            risk_tier: tier,
            stability_class: fos < 1.0 ? 'Failure Imminent' : (fos < 1.3 ? 'Unstable' : 'Stable'),
            description: 'Effective normal stress = ' + (sigma_n - u).toFixed(1) + ' kPa | Driving shear = ' + tau_d.toFixed(1) + ' kPa'
          });
        }

        if (apiPath === '/api/simulation/rainfall-stress') {
          const surge = body.added_rainfall_24h_mm || 80.0;
          const redCount = Math.min(8, 2 + Math.floor(surge / 25));
          const orangeCount = Math.max(1, 4 - Math.floor(surge / 60));

          return jsonResponse({
            simulated_surge_mm: surge,
            red_hazard_count: redCount,
            orange_hazard_count: orangeCount,
            impacted_highways: [
              { name: 'NH-10 (Sevoke-Gangtok)', reason: 'High debris flow susceptibility at 29th Mile & Likuvir' },
              { name: 'NH-6 (Sonapur Tunnel)', reason: 'Mudslide accumulation at eastern portal approach' }
            ],
            evacuation_recommended_villages: ['Rongpo Lower Colony', 'Singtam Ward 3', 'Sonapur Valley', 'Likuvir Settlement']
          });
        }

        if (apiPath === '/api/broadcast/trigger') {
          return jsonResponse({
            status: 'DISPATCHED',
            broadcast_id: 'BC-' + Date.now(),
            timestamp: Date.now(),
            target_state: body.target_state || 'Sikkim',
            dispatched_by_role: body.role || 'ADMIN',
            sms_queue_count: 14500,
            siren_relays_active: 8
          });
        }

        if (apiPath === '/api/emergency/sos/trigger') {
          const newSos = {
            sos_id: 'SOS-2026-' + String(inMemorySOS.length + 1).padStart(3, '0'),
            timestamp: Date.now(),
            user_name: body.user_name || 'Anonymous Citizen',
            phone: body.phone || '+91-98765-XXXXX',
            state: body.state || 'Sikkim',
            corridor: body.corridor || 'NH-10 Corridor',
            coordinates: body.coordinates || [27.0540, 88.4830],
            situation: body.situation || 'Trapped in vehicle debris flow',
            severity: body.severity || 'CRITICAL',
            status: 'BEACON_ACTIVATED'
          };
          inMemorySOS.unshift(newSos);
          return jsonResponse({ status: 'BEACON_ACTIVATED', sos_id: newSos.sos_id, record: newSos });
        }

        if (apiPath === '/api/emergency/sos/manage') {
          const sos = inMemorySOS.find(s => s.sos_id === body.sos_id) || inMemorySOS[0];
          if (sos) {
            sos.status = body.action === 'RESOLVE' ? 'RESCUE_COMPLETED' : 'ACKNOWLEDGED_EN_ROUTE';
            if (body.assigned_unit) sos.assigned_unit = body.assigned_unit;
          }
          return jsonResponse({ status: 'UPDATED', sos: sos });
        }

        if (apiPath === '/api/reports/submit') {
          const newRep = {
            report_id: 'REP-2026-' + String(inMemoryReports.length + 1).padStart(3, '0'),
            timestamp: Date.now(),
            ...body
          };
          inMemoryReports.unshift(newRep);
          return jsonResponse({ status: 'SUCCESS', report_id: newRep.report_id, record: newRep });
        }

        if (apiPath === '/api/emergency/evacuation-route') {
          return jsonResponse({
            status: 'ROUTE_COMPUTED',
            origin: [body.origin_lat || 27.0521, body.origin_lng || 88.4820],
            destination_shelter: {
              name: 'Kalimpong Stadium Community Relief Center',
              capacity_beds: 350,
              available_beds: 120,
              helipad_ready: true,
              coordinates: [27.0680, 88.4720]
            },
            distance_km: 8.4,
            estimated_drive_time_mins: 22,
            route_waypoints: [
              [27.0521, 88.4820],
              [27.0580, 88.4790],
              [27.0630, 88.4750],
              [27.0680, 88.4720]
            ]
          });
        }
      }
    }

    return originalFetch(url, options);
  };
})();
