/**
 * Main Application Orchestrator & State Manager
 * Coordinates GIS Map, Telemetry Feeds, AI Predictor, FoS Calculator, Reporting, and DDMA Command.
 */

class AppController {
  constructor() {
    this.currentTab = 'tab-map';
    this.telemetryPollingTimer = null;
    this.seenSosIds = new Set();
    this.cachedReports = [];
  }

  async init() {
    this.setupTabNavigation();
    this.setupLanguageSelector();
    this.setupSirenControls();
    this.setupAIPredictor();
    this.setupFosCalculator();
    this.setupDDMASecurity();
    this.setupDDMASimulator();
    this.setupBroadcastForm();
    this.setupSurvivalGuide();
    this.setupPhotoModal();
    this.setupApkDownloadModal();
    this.registerServiceWorker();

    // Initialize Submodules
    if (window.GISMap) window.GISMap.init();
    if (window.ReportManagerInstance) await window.ReportManagerInstance.init();
    if (window.EmergencyManagerInstance) window.EmergencyManagerInstance.init();

    // Initial Data Fetch
    await this.fetchRiskSummary();
    await this.fetchSensorsTelemetry();
    await this.fetchWeatherSummary();
    await this.refreshDDMATriage();
    await this.fetchDDMASOSSignals();
    await this.fetchDDMAPhotoGallery();

    // Start background telemetry polling every 20 seconds
    this.telemetryPollingTimer = setInterval(() => {
      this.fetchRiskSummary();
      this.fetchSensorsTelemetry();
      this.fetchWeatherSummary();
      this.fetchDDMASOSSignals();
      this.fetchDDMAPhotoGallery();
    }, 20000);
  }

  setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn[data-tab]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });

    this.currentTab = tabId;

    if (tabId === 'tab-ddma') {
      this.renderDDMAAuthState();
      this.fetchDDMASOSSignals();
      this.fetchDDMAPhotoGallery();
    }

    // If switching to GIS map, invalidate Leaflet size to render correctly
    if (tabId === 'tab-map' && window.GISMap && window.GISMap.map) {
      setTimeout(() => window.GISMap.map.invalidateSize(), 150);
    }
  }

  setupLanguageSelector() {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const langCode = e.target.value;
        if (window.AlertsController) {
          window.AlertsController.setLanguage(langCode);
        }
      });
    }
  }

  setupSirenControls() {
    const btnSirenHeader = document.getElementById('headerSirenBtn');
    const btnStopSiren = document.getElementById('btnStopSiren');

    if (btnSirenHeader) {
      btnSirenHeader.addEventListener('click', () => {
        if (window.AlertsController) {
          window.AlertsController.triggerEmergencySiren();
        }
      });
    }

    if (btnStopSiren) {
      btnStopSiren.addEventListener('click', () => {
        if (window.AlertsController) {
          window.AlertsController.stopEmergencySiren();
        }
      });
    }
  }

  async fetchRiskSummary() {
    try {
      const res = await fetch('/api/risk/summary');
      if (res.ok) {
        const data = await res.json();
        
        // Update stats
        const m = data.metrics;
        const statRed = document.getElementById('statRedCount');
        const statOrange = document.getElementById('statOrangeCount');
        const statYellow = document.getElementById('statYellowCount');
        const statGreen = document.getElementById('statGreenCount');
        const riskPill = document.getElementById('overallRiskPill');

        if (statRed) statRed.textContent = m.red_hazard_count;
        if (statOrange) statOrange.textContent = m.orange_hazard_count;
        if (statYellow) statYellow.textContent = m.yellow_hazard_count;
        if (statGreen) statGreen.textContent = m.green_hazard_count;

        if (riskPill) {
          if (m.red_hazard_count > 0) {
            riskPill.className = "badge-status-red";
            riskPill.textContent = "HIGH ALERT";
          } else if (m.orange_hazard_count > 0) {
            riskPill.className = "badge-status-orange";
            riskPill.textContent = "ORANGE ALERT";
          } else {
            riskPill.className = "badge-status-green";
            riskPill.textContent = "NORMAL WATCH";
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch risk summary:", err);
    }
  }

  async fetchSensorsTelemetry() {
    try {
      const res = await fetch('/api/sensors/live');
      if (res.ok) {
        const data = await res.json();
        this.renderSensorsGrid(data.sensors);
      }
    } catch (err) {
      console.warn("Could not fetch sensors telemetry:", err);
    }
  }

  async fetchWeatherSummary() {
    try {
      const res = await fetch('/api/gis/weather-stations');
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const firstStation = data.features[0].properties;
          const topTemp = document.getElementById('sachetTopTemp');
          const topCond = document.getElementById('sachetTopCond');
          const topRadar = document.getElementById('sachetTopRadar');

          if (topTemp) topTemp.textContent = `${Math.round(firstStation.temp_c)}°C`;
          if (topCond) topCond.textContent = firstStation.condition;
          if (topRadar) topRadar.textContent = `Doppler: ${firstStation.radar_reflectivity_dbz} dBZ`;
        }
      }
    } catch (err) {
      console.warn("Could not fetch weather summary:", err);
    }
  }

  renderSensorsGrid(sensors) {
    const container = document.getElementById('sensorsContainer');
    if (!container) return;

    container.innerHTML = sensors.map((s, idx) => {
      const isCrit = s.hazard_level === 'RED' || s.hazard_level === 'ORANGE';
      return `
        <div class="sensor-card ${isCrit ? 'critical' : ''}">
          <div class="sensor-header">
            <div>
              <div class="sensor-title"> ${s.name}</div>
              <div class="sensor-corridor">${s.corridor} • ${s.state}</div>
            </div>
            <span class="badge-tag" style="color:${s.color_hex}; border-color:${s.color_hex};">
              ${s.hazard_level} (${s.lhi})
            </span>
          </div>

          <div class="sensor-metrics-row">
            <div class="sensor-metric">
              <div class="metric-val" style="color:${s.color_hex};">${s.rainfall_24h_mm}<span style="font-size:9px;">mm</span></div>
              <div class="metric-label">24h Rain</div>
            </div>
            <div class="sensor-metric">
              <div class="metric-val">${s.soil_moisture_vwc_pct}<span style="font-size:9px;">%</span></div>
              <div class="metric-label">VWC Soil</div>
            </div>
            <div class="sensor-metric">
              <div class="metric-val">${s.displacement_velocity_mm_hr}<span style="font-size:9px;">mm/h</span></div>
              <div class="metric-label">Tilt Rate</div>
            </div>
            <div class="sensor-metric">
              <div class="metric-val">${s.piezometer_pwp_kpa}<span style="font-size:9px;">kPa</span></div>
              <div class="metric-label">Pore Press</div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#64748b; margin-top:4px;">
            <span>24h Rainfall & Moisture Trend:</span>
            <span>Slope: ${s.slope_deg}°</span>
          </div>

          <div class="sparkline-container">
            <canvas id="spark_${idx}" class="sparkline-canvas"></canvas>
          </div>
        </div>
      `;
    }).join('');

    // Draw sparklines on canvases
    sensors.forEach((s, idx) => {
      if (s.history_24h && s.history_24h.rain_hourly) {
        this.drawSparkline(`spark_${idx}`, s.history_24h.rain_hourly, s.color_hex || '#00e5ff');
      }
    });
  }

  drawSparkline(canvasId, dataPoints, strokeColor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    const maxVal = Math.max(...dataPoints, 10.0);
    const step = width / (dataPoints.length - 1);

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, strokeColor + '55');
    gradient.addColorStop(1, strokeColor + '00');

    ctx.beginPath();
    dataPoints.forEach((val, i) => {
      const x = i * step;
      const y = height - (val / maxVal) * (height - 6) - 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Fill under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw stroke line
    ctx.beginPath();
    dataPoints.forEach((val, i) => {
      const x = i * step;
      const y = height - (val / maxVal) * (height - 6) - 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  setupAIPredictor() {
    const form = document.getElementById('aiPredictForm');
    const resultBox = document.getElementById('aiPredictResult');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          slope_deg: parseFloat(document.getElementById('predSlope').value),
          rainfall_24h_mm: parseFloat(document.getElementById('predRain24').value),
          rainfall_72h_mm: parseFloat(document.getElementById('predRain24').value) * 1.8,
          soil_moisture_vwc: parseFloat(document.getElementById('predVwc').value),
          pore_pressure_kpa: parseFloat(document.getElementById('predPwp').value),
          tilt_velocity_mm_hr: parseFloat(document.getElementById('predVelocity').value),
          lithology: document.getElementById('predLitho').value
        };

        try {
          const res = await fetch('/api/risk/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            const lhi = data.lhi_assessment;
            const idThresh = data.rainfall_id_threshold;
            const fos = data.factor_of_safety;

            if (resultBox) {
              resultBox.style.display = 'block';
              resultBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <h4 style="color:${lhi.color_hex}; font-size:14px; font-weight:800;">
                    ${lhi.hazard_level} HAZARD: LHI ${lhi.lhi} / 100
                  </h4>
                  <span class="badge-tag" style="color:${lhi.color_hex}; border-color:${lhi.color_hex};">
                    Fail Prob: ${(lhi.failure_probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div style="font-size:12px; margin-bottom:6px;"><strong>Status:</strong> ${lhi.status_text}</div>
                <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">
                  <strong>I-D Rainfall Ratio:</strong> ${idThresh.ratio}x threshold (${idThresh.status}) • <strong>Geotechnical FoS:</strong> ${fos.fos} (${fos.stability_class})
                </div>
                <div style="background:#0a0e17; padding:6px 10px; border-radius:6px; font-size:11px; border-left:3px solid ${lhi.color_hex};">
                  <strong>Recommended Action:</strong> ${lhi.recommended_action}
                </div>
              `;
            }
          }
        } catch (err) {
          console.error("AI prediction request failed:", err);
        }
      });
    }
  }

  setupFosCalculator() {
    const slider = document.getElementById('fosPwpSlider');
    const pwpVal = document.getElementById('fosPwpVal');
    const badge = document.getElementById('fosValBadge');
    const statusText = document.getElementById('fosStatusText');

    const updateFos = async () => {
      const u = parseFloat(slider.value);
      if (pwpVal) pwpVal.textContent = u;

      const c = parseFloat(document.getElementById('fosCohesion').value) || 14.0;
      const phi = parseFloat(document.getElementById('fosPhi').value) || 28.0;
      const beta = parseFloat(document.getElementById('fosBeta').value) || 40.0;
      const z = parseFloat(document.getElementById('fosDepth').value) || 3.0;

      try {
        const res = await fetch('/api/risk/fos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cohesion_kpa: c,
            friction_angle_deg: phi,
            slope_angle_deg: beta,
            soil_depth_m: z,
            pore_pressure_kpa: u
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (badge) {
            badge.textContent = `FoS: ${data.fos}`;
            const colors = {
              GREEN: '#00e676',
              YELLOW: '#ffea00',
              ORANGE: '#ff9100',
              RED: '#ff1744'
            };
            badge.style.color = colors[data.risk_tier] || '#ff1744';
          }
          if (statusText) {
            statusText.textContent = `${data.stability_class} • ${data.description}`;
          }
        }
      } catch (err) {
        console.warn("FoS calculation error:", err);
      }
    };

    if (slider) {
      slider.addEventListener('input', updateFos);
      ['fosCohesion', 'fosPhi', 'fosBeta', 'fosDepth'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', updateFos);
      });
      updateFos();
    }
  }

  setupDDMASecurity() {
    this.renderDDMAAuthState();

    const loginWrapper = document.getElementById('loginDropdownWrapper');
    const headerLoginBtn = document.getElementById('headerLoginBtn') || document.getElementById('headerClearanceBtn');
    const loginDropdownMenu = document.getElementById('loginDropdownMenu');

    // Toggle Dropdown Menu
    if (headerLoginBtn && loginDropdownMenu) {
      headerLoginBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShown = loginDropdownMenu.classList.contains('show');
        if (isShown) {
          this.closeLoginDropdown();
        } else {
          this.openLoginDropdown();
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (loginWrapper && !loginWrapper.contains(e.target)) {
          this.closeLoginDropdown();
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginDropdownMenu.classList.contains('show')) {
          this.closeLoginDropdown();
        }
      });
    }

    // Category Card & Button Click Handlers in Dropdown
    document.querySelectorAll('.dropdown-category-card, .btn-cat-login').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.stopPropagation();
        const role = el.getAttribute('data-category') || el.getAttribute('data-action-category');
        const badge = el.getAttribute('data-badge') || el.getAttribute('data-action-badge') || 'ADM-NER-01';

        if (role) {
          this.closeLoginDropdown();
          await this.loginOfficial(role, badge, '1234');
          this.switchTab('tab-ddma');
        }
      });
    });

    // Dropdown Active Session Buttons
    const btnGoDashboard = document.getElementById('dropdownBtnGoDashboard');
    if (btnGoDashboard) {
      btnGoDashboard.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeLoginDropdown();
        this.switchTab('tab-ddma');
      });
    }

    const btnDropdownSignOut = document.getElementById('dropdownBtnSignOut');
    if (btnDropdownSignOut) {
      btnDropdownSignOut.addEventListener('click', (e) => {
        e.stopPropagation();
        this.signOutOfficial();
        this.closeLoginDropdown();
      });
    }

    const roleSelect = document.getElementById('authRoleSelect');
    const badgeInput = document.getElementById('authOfficerId');
    if (roleSelect && badgeInput) {
      roleSelect.addEventListener('change', (e) => {
        const role = e.target.value;
        const badges = {
          'ADMIN': 'ADM-NER-01',
          'FIELD_OFFICER': 'BRO-SW-104',
          'GOVERNMENT_OFFICIAL': 'IAS-DC-502'
        };
        badgeInput.value = badges[role] || 'ADM-NER-01';
      });
    }

    const authForm = document.getElementById('ddmaAuthForm');
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = document.getElementById('authRoleSelect').value;
        const officer_id = document.getElementById('authOfficerId').value;
        const pin = document.getElementById('authPin').value;
        await this.loginOfficial(role, officer_id, pin);
      });
    }

    document.querySelectorAll('.btn-auth-demo[data-demo-role]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const role = btn.getAttribute('data-demo-role');
        const badge = btn.getAttribute('data-demo-badge');
        if (roleSelect) roleSelect.value = role;
        if (badgeInput) badgeInput.value = badge;
        const pinInput = document.getElementById('authPin');
        if (pinInput) pinInput.value = '1234';
        await this.loginOfficial(role, badge, '1234');
      });
    });

    const btnLock = document.getElementById('btnLockDdma');
    if (btnLock) {
      btnLock.addEventListener('click', () => {
        this.signOutOfficial();
      });
    }
  }

  openLoginDropdown() {
    const headerBtn = document.getElementById('headerLoginBtn') || document.getElementById('headerClearanceBtn');
    const menu = document.getElementById('loginDropdownMenu');
    if (menu) {
      menu.classList.add('show');
    }
    if (headerBtn) {
      headerBtn.classList.add('active');
      headerBtn.setAttribute('aria-expanded', 'true');
    }
  }

  closeLoginDropdown() {
    const headerBtn = document.getElementById('headerLoginBtn') || document.getElementById('headerClearanceBtn');
    const menu = document.getElementById('loginDropdownMenu');
    if (menu) {
      menu.classList.remove('show');
    }
    if (headerBtn) {
      headerBtn.classList.remove('active');
      headerBtn.setAttribute('aria-expanded', 'false');
    }
  }

  signOutOfficial() {
    sessionStorage.removeItem('ddma_auth_session');
    this.renderDDMAAuthState();
    if (window.showToast) {
      window.showToast('DDMA Dashboard Locked. Officer signed out.', 'info');
    }
  }

  getOfficialSession() {
    try {
      const data = sessionStorage.getItem('ddma_auth_session');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  async loginOfficial(role, officer_id, pin) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, officer_id, pin })
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('ddma_auth_session', JSON.stringify(data));
        this.renderDDMAAuthState();
        if (window.showToast) {
          window.showToast(`Verified: Logged in as ${data.officer_name} (${data.role_title})`, 'success');
        }
        const slider = document.getElementById('simRainSlider');
        if (slider) {
          const evt = new Event('input');
          slider.dispatchEvent(evt);
        }
        await this.refreshDDMATriage();
      } else {
        const err = await res.json();
        if (window.showToast) {
          window.showToast(err.detail || 'Access Denied: Invalid credentials.', 'error');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (window.showToast) {
        window.showToast('Authentication service unavailable.', 'error');
      }
    }
  }

  renderDDMAAuthState() {
    const session = this.getOfficialSession();
    const lockScreen = document.getElementById('ddmaSecurityLock');
    const authContent = document.getElementById('ddmaAuthorizedContent');
    const headerText = document.getElementById('headerLoginText') || document.getElementById('headerClearanceText');
    const headerDot = document.getElementById('headerLoginDot') || document.getElementById('headerClearanceDot');
    const dropdownSession = document.getElementById('dropdownActiveSession');
    const dropdownRole = document.getElementById('dropdownActiveRole');
    const dropdownName = document.getElementById('dropdownActiveName');
    const dropdownDept = document.getElementById('dropdownActiveDept');

    if (session && session.auth_token) {
      if (lockScreen) lockScreen.style.display = 'none';
      if (authContent) authContent.style.display = 'block';

      const nameEl = document.getElementById('authActiveOfficerName');
      const deptEl = document.getElementById('authActiveOfficerDept');
      const badgeEl = document.getElementById('authActiveClearanceBadge');

      if (nameEl) nameEl.textContent = session.officer_name;
      if (deptEl) deptEl.textContent = session.department;
      if (badgeEl) badgeEl.textContent = (session.clearance_level || '').replace(/_/g, ' ');

      if (headerText) {
        const roleShort = session.role === 'ADMIN' ? 'Admin' : (session.role === 'FIELD_OFFICER' ? 'Field Officer' : 'Govt Official');
        headerText.textContent = `${roleShort} (Active)`;
      }
      if (headerDot) headerDot.classList.add('authorized');

      if (dropdownSession) dropdownSession.style.display = 'block';
      if (dropdownRole) dropdownRole.textContent = session.role;
      if (dropdownName) dropdownName.textContent = session.officer_name;
      if (dropdownDept) dropdownDept.textContent = `${session.department} • ${(session.clearance_level || '').replace(/_/g, ' ')}`;
    } else {
      if (lockScreen) lockScreen.style.display = 'flex';
      if (authContent) authContent.style.display = 'none';

      if (headerText) headerText.textContent = 'Login';
      if (headerDot) headerDot.classList.remove('authorized');

      if (dropdownSession) dropdownSession.style.display = 'none';
    }
  }

  setupDDMASimulator() {
    const slider = document.getElementById('simRainSlider');
    const rainVal = document.getElementById('simRainVal');
    const impactTag = document.getElementById('simImpactTag');
    const resultsContainer = document.getElementById('simResultsContainer');

    const runSimulation = async (surgeMm) => {
      if (rainVal) rainVal.textContent = surgeMm;
      if (impactTag) {
        if (surgeMm >= 150) impactTag.textContent = "Extreme Cloudburst Deluge";
        else if (surgeMm >= 80) impactTag.textContent = "High Danger Surge";
        else if (surgeMm >= 40) impactTag.textContent = "Moderate Heavy Rainfall";
        else impactTag.textContent = "Baseline Monsoon Level";
      }

      const session = this.getOfficialSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session && session.role) {
        headers['X-Auth-Role'] = session.role;
        headers['Authorization'] = `Bearer ${session.auth_token}`;
      }

      try {
        const res = await fetch('/api/simulation/rainfall-stress', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ added_rainfall_24h_mm: surgeMm })
        });

        if (res.ok) {
          const data = await res.json();
          if (resultsContainer) {
            const blockedList = data.impacted_highways.map(h => `<li><strong>${h.name}</strong>: ${h.reason}</li>`).join('');
            const villageList = data.evacuation_recommended_villages.slice(0, 6).join(', ');

            resultsContainer.innerHTML = `
              <div class="sim-stat-box" style="border-left: 3px solid #ff1744;">
                <div class="sim-stat-val" style="color:#ff1744;">${data.red_hazard_count}</div>
                <div class="sim-stat-lbl">Corridors Breaching RED Threshold</div>
              </div>
              <div class="sim-stat-box" style="border-left: 3px solid #ff9100;">
                <div class="sim-stat-val" style="color:#ff9100;">${data.orange_hazard_count}</div>
                <div class="sim-stat-lbl">Corridors Under ORANGE Alert</div>
              </div>
              <div class="sim-stat-box" style="border-left: 3px solid #00e5ff;">
                <div class="sim-stat-val" style="color:#00e5ff;">${data.impacted_highways.length}</div>
                <div class="sim-stat-lbl">Highways Blocked / Restricted</div>
              </div>

              <div style="grid-column: 1 / -1; background:#0a0e17; padding:10px; border-radius:8px; font-size:11px;">
                <div style="font-weight:700; color:#f1f5f9; margin-bottom:4px;">Cascading Simulated Highway Impacts:</div>
                <ul style="margin-left:16px; color:#cbd5e1; margin-bottom:6px;">
                  ${blockedList || '<li>All lifelines operational at this precipitation tier.</li>'}
                </ul>
                ${villageList ? `<div style="color:#fda4af;"><strong>Mandatory Village Evacuation Triggers:</strong> ${villageList}</div>` : ''}
              </div>
            `;
          }
        } else if (res.status === 403) {
          if (resultsContainer) {
            resultsContainer.innerHTML = `
              <div style="grid-column: 1 / -1; background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:12px; border-radius:8px; font-size:12px; font-weight:600;">
                RESTRICTED COMMAND: DDMA Stress Simulator is only operable by authorized Admin, Field Officer, or Government Official accounts.
              </div>
            `;
          }
        }
      } catch (err) {
        console.warn("Simulation run error:", err);
      }
    };

    if (slider) {
      slider.addEventListener('input', (e) => {
        runSimulation(parseFloat(e.target.value));
      });
      runSimulation(80);
    }
  }

  async refreshDDMATriage() {
    try {
      const res = await fetch('/api/reports/list');
      if (res.ok) {
        const data = await res.json();
        this.cachedReports = data.reports || [];
        const container = document.getElementById('triageListContainer');
        const countBadge = document.getElementById('triageCount');

        if (countBadge) countBadge.textContent = `${data.count} Active`;

        if (container) {
          if (data.reports.length === 0) {
            container.innerHTML = `<div class="empty-state">No incident reports recorded.</div>`;
          } else {
            container.innerHTML = data.reports.map(r => {
              const isCrit = r.severity === 'CRITICAL_FAILURE' || r.severity === 'HIGH';
              const badgeColor = isCrit ? '#ff1744' : '#ffea00';
              return `
                <div class="triage-item" style="border-left: 3px solid ${badgeColor};">
                  <div class="triage-header">
                    <span>${r.location_name} (${r.state})</span>
                    <span style="color:${badgeColor}; font-weight:800; font-size:11px;">${r.severity}</span>
                  </div>
                  <div style="font-size:11px; color:#64748b;">
                    <strong>Type:</strong> ${r.crack_type} • <strong>Reporter:</strong> ${r.reporter_name} (${r.reporter_role})
                  </div>
                  <div style="font-size:11px; color:#334155; margin-top:2px;">
                    ${r.notes}
                  </div>

                  ${r.photo_url ? `
                    <div class="triage-photo-preview" onclick="window.app.openPhotoViewer('${r.id}')">
                      <img src="${r.photo_url}" class="triage-photo-thumb" alt="Fissure Evidence">
                      <div class="triage-photo-meta">
                        <span>Field Evidence Photo Attached</span><br>
                        <small style="color:var(--brand-blue); text-decoration:underline;">Click to inspect full resolution</small>
                      </div>
                    </div>
                  ` : ''}

                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:10px; color:#64748b;">
                    <span>Assigned: ${r.assigned_team}</span>
                    <button class="btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="window.showToast('SDRF Response Team Dispatched!', 'success')">
                      Dispatch Team
                    </button>
                  </div>
                </div>
              `;
            }).join('');
          }
        }
      }
    } catch (err) {
      console.warn("Could not refresh triage:", err);
    }
  }

  async fetchDDMASOSSignals() {
    try {
      const res = await fetch('/api/emergency/sos/active');
      if (res.ok) {
        const data = await res.json();
        const container = document.getElementById('ddmaSosContainer');
        const badge = document.getElementById('ddmaSosBadge');
        const banner = document.getElementById('ddmaSosAlertBanner');
        const bannerText = document.getElementById('ddmaSosBannerText');

        if (badge) {
          badge.textContent = `${data.active_distress_count} Active Distress`;
          if (data.active_distress_count > 0) {
            badge.className = "badge-status-red";
          } else {
            badge.className = "badge-status-green";
          }
        }

        if (banner) {
          if (data.active_distress_count > 0) {
            banner.style.display = 'flex';
            if (bannerText) {
              bannerText.textContent = `CRITICAL ALERT: ${data.active_distress_count} Active SOS Distress Beacons Transmitting GPS Coordinates`;
            }
          } else {
            banner.style.display = 'none';
          }
        }

        data.signals.forEach(s => {
          if (s.status === 'DISTRESS_ACTIVE' && !this.seenSosIds.has(s.id)) {
            this.seenSosIds.add(s.id);
            if (window.showToast) {
              window.showToast(`NEW SOS DISTRESS BEACON: ${s.user_name} (${s.corridor})! SDRF Rescue Needed.`, 'error');
            }
          }
        });

        if (container) {
          if (data.signals.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">No active SOS distress signals reported.</div>`;
          } else {
            container.innerHTML = data.signals.map(s => {
              const isResolved = s.status === 'RESCUE_COMPLETED';
              const isEnRoute = s.status === 'ACKNOWLEDGED_EN_ROUTE';
              const statusClass = isResolved ? 'resolved' : (isEnRoute ? 'en-route' : '');
              const statusTagColor = isResolved ? '#16a34a' : (isEnRoute ? '#ea580c' : '#dc2626');
              const statusLabel = isResolved ? 'RESCUE COMPLETED' : (isEnRoute ? 'SDRF EN ROUTE' : 'ACTIVE DISTRESS');

              return `
                <div class="sos-card-item ${statusClass}">
                  <div class="sos-card-header">
                    <div>
                      <div class="sos-user-title">${s.user_name}</div>
                      <div class="sos-corridor-text">${s.corridor} • ${s.state}</div>
                    </div>
                    <span class="badge-tag" style="color:${statusTagColor}; border-color:${statusTagColor}; font-weight:800;">
                      ${statusLabel}
                    </span>
                  </div>

                  <div class="sos-situation-box">
                    <strong>Situation:</strong> ${s.situation}
                  </div>

                  <div class="sos-meta-row">
                    <span>GPS: ${s.coordinates[0]}, ${s.coordinates[1]}</span>
                    <span>Contact: ${s.phone}</span>
                  </div>

                  ${s.assigned_unit ? `<div style="font-size:11px; color:#1e3a8a; font-weight:600;">Assigned Squad: ${s.assigned_unit} ${s.eta_minutes ? `(ETA ~${s.eta_minutes}m)` : ''}</div>` : ''}

                  <div class="sos-actions-row">
                    ${!isResolved ? `
                      <button class="btn-sos-action btn-sos-dispatch" onclick="window.app.manageSosSignal('${s.id}', 'DISPATCH')">
                        Dispatch SDRF Squad
                      </button>
                    ` : ''}
                    <button class="btn-sos-action btn-sos-map" onclick="window.app.plotSosOnMap(${s.coordinates[0]}, ${s.coordinates[1]}, '${s.user_name.replace(/'/g, "\\'")}', '${s.situation.replace(/'/g, "\\'")}')">
                      Plot on GIS Map
                    </button>
                    ${!isResolved ? `
                      <button class="btn-sos-action btn-sos-resolve" onclick="window.app.manageSosSignal('${s.id}', 'RESOLVE')">
                        Mark Rescued
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('');
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch DDMA SOS signals:", err);
    }
  }

  async manageSosSignal(sosId, action) {
    const session = this.getOfficialSession();
    const headers = { 'Content-Type': 'application/json' };
    if (session && session.role) {
      headers['X-Auth-Role'] = session.role;
      headers['Authorization'] = `Bearer ${session.auth_token}`;
    }

    try {
      const res = await fetch('/api/emergency/sos/manage', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          sos_id: sosId,
          action: action,
          assigned_unit: "SDRF Pakyong & BRO Quick Response Squad",
          notes: "Official action authorized from DDMA Command Console."
        })
      });

      if (res.ok) {
        const msg = action === 'DISPATCH' ? 'SDRF Response Squad Dispatched!' : 'SOS Beacon Cleared (Rescue Completed)!';
        if (window.showToast) window.showToast(msg, 'success');
        await this.fetchDDMASOSSignals();
      } else if (res.status === 403) {
        if (window.showToast) window.showToast('Access Denied: Only authorized DDMA officers can manage SOS beacons.', 'error');
      }
    } catch (err) {
      console.error('Error managing SOS signal:', err);
    }
  }

  plotSosOnMap(lat, lng, userName, situation) {
    this.switchTab('tab-map');
    if (window.GISMap && window.GISMap.focusSOSLocation) {
      window.GISMap.focusSOSLocation([lat, lng], userName, situation);
    }
    if (window.showToast) {
      window.showToast(`Centered map on SOS Beacon for ${userName}`, 'info');
    }
  }

  async fetchDDMAPhotoGallery() {
    try {
      const res = await fetch('/api/reports/list');
      if (res.ok) {
        const data = await res.json();
        this.cachedReports = data.reports || [];
        const photoReports = this.cachedReports.filter(r => r.photo_url);
        const countBadge = document.getElementById('ddmaPhotoCount');
        const container = document.getElementById('ddmaPhotoContainer');

        if (countBadge) countBadge.textContent = `${photoReports.length} Photos`;

        if (container) {
          if (photoReports.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">No damage photos uploaded yet.</div>`;
          } else {
            container.innerHTML = photoReports.map(r => `
              <div class="ddma-photo-card">
                <div class="ddma-photo-thumb-wrapper" onclick="window.app.openPhotoViewer('${r.id}')">
                  <img src="${r.photo_url}" alt="Fissure Evidence" loading="lazy">
                  <span class="photo-damage-badge">Damage: ${Math.round(r.damage_score || 50)}/100</span>
                </div>
                <div class="ddma-photo-body">
                  <div class="photo-card-loc">${r.location_name} (${r.state})</div>
                  <div class="photo-card-crack">${r.crack_type} • Width: ${r.crack_width_mm}mm</div>
                  <div class="photo-card-footer">
                    <span style="font-size:10px; color:#64748b;">By ${r.reporter_name}</span>
                    <button class="btn-inspect-photo" onclick="window.app.openPhotoViewer('${r.id}')">
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            `).join('');
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch photo gallery:", err);
    }
  }

  openPhotoViewer(reportId) {
    const report = this.cachedReports.find(r => r.id === reportId);
    if (!report || !report.photo_url) return;

    const modal = document.getElementById('photoViewerModal');
    const title = document.getElementById('modalPhotoTitle');
    const img = document.getElementById('modalPhotoImg');
    const meta = document.getElementById('modalPhotoMeta');

    if (title) title.textContent = `${report.location_name} (${report.state}) - Evidence Photo`;
    if (img) img.src = report.photo_url;
    if (meta) {
      meta.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:#f8fafc; padding:8px; border-radius:6px; margin-bottom:8px; border:1px solid #e2e8f0;">
          <div><strong>Crack Morphology:</strong> ${report.crack_type}</div>
          <div><strong>AI Damage Rating:</strong> ${report.damage_score}/100 (${report.severity})</div>
          <div><strong>Fissure Dimensions:</strong> Width ${report.crack_width_mm}mm • Depth ${report.crack_depth_cm}cm • Length ${report.crack_length_m}m</div>
          <div><strong>Road Subsidence:</strong> ${report.road_subsidence_cm} cm</div>
        </div>
        <div style="margin-bottom:6px;"><strong>Reporter:</strong> ${report.reporter_name} (${report.reporter_role || 'Field Observer'})</div>
        <div style="margin-bottom:6px;"><strong>Field Notes:</strong> ${report.notes || 'Visual evidence captured on site.'}</div>
        <div style="font-size:10px; color:#64748b;">GPS Coordinates: ${report.coordinates ? `${report.coordinates[0]}, ${report.coordinates[1]}` : 'N/A'} • Logged: ${new Date(report.timestamp * 1000).toLocaleString()}</div>
      `;
    }

    if (modal) modal.style.display = 'flex';
  }

  setupPhotoModal() {
    const modal = document.getElementById('photoViewerModal');
    const btnClose = document.getElementById('btnClosePhotoModal');

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }
  }

  setupBroadcastForm() {
    const form = document.getElementById('broadcastForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          target_state: document.getElementById('broadState').value,
          risk_level: document.getElementById('broadSeverity').value,
          hazard_title: "Severe Landslide Threat Warning",
          message_text: document.getElementById('broadMsg').value,
          channels: ["SMS_CELL_BROADCAST", "WHATSAPP_EMERGENCY", "SIREN_ACTIVATION"]
        };

        const session = this.getOfficialSession();
        const headers = { 'Content-Type': 'application/json' };
        if (session && session.role) {
          headers['X-Auth-Role'] = session.role;
          headers['Authorization'] = `Bearer ${session.auth_token}`;
        }

        try {
          const res = await fetch('/api/broadcast/trigger', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            if (window.showToast) {
              window.showToast(`Broadcast Dispatched to ${data.target_state} (${data.sms_queue_count.toLocaleString()} SMS / 48 Cell Towers)!`, "success");
            }
          } else if (res.status === 403) {
            const err = await res.json();
            if (window.showToast) {
              window.showToast(err.detail || "Access Denied: Broadcast requires Admin or Govt Official clearance.", "error");
            }
          } else {
            if (window.showToast) window.showToast("Failed to dispatch broadcast.", "error");
          }
        } catch (err) {
          if (window.showToast) window.showToast("Failed to dispatch broadcast.", "error");
        }
      });
    }
  }

  setupSurvivalGuide() {
    // Subtab switching
    const subTabButtons = document.querySelectorAll('.btn-survival-tab[data-subtab]');
    subTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-subtab');
        subTabButtons.forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.survival-panel').forEach(panel => {
          panel.classList.toggle('active', panel.id === target);
        });
      });
    });

    // Go-bag checklist state management & progress tracking
    const checkboxes = document.querySelectorAll('.gobag-check');
    const percentLabel = document.getElementById('gobagPercent');
    const progressBar = document.getElementById('gobagBar');

    const updateChecklistProgress = () => {
      if (!checkboxes.length) return;
      let checkedCount = 0;
      const stateObj = {};

      checkboxes.forEach(cb => {
        const itemKey = cb.getAttribute('data-item');
        if (cb.checked) {
          checkedCount++;
          stateObj[itemKey] = true;
        }
      });

      const pct = Math.round((checkedCount / checkboxes.length) * 100);
      if (percentLabel) percentLabel.textContent = `${pct}% Prepared (${checkedCount}/${checkboxes.length} Essentials)`;
      if (progressBar) progressBar.style.width = `${pct}%`;

      try {
        localStorage.setItem('LandslideGoBagState', JSON.stringify(stateObj));
      } catch (e) {}
    };

    // Restore saved state
    try {
      const saved = JSON.parse(localStorage.getItem('LandslideGoBagState') || '{}');
      checkboxes.forEach(cb => {
        const itemKey = cb.getAttribute('data-item');
        if (saved[itemKey]) cb.checked = true;
        cb.addEventListener('change', updateChecklistProgress);
      });
    } catch (e) {
      checkboxes.forEach(cb => cb.addEventListener('change', updateChecklistProgress));
    }

    updateChecklistProgress();
  }

  setupApkDownloadModal() {
    const modal = document.getElementById('apkDownloadModal');
    const btnOpen = document.getElementById('headerApkBtn');
    const btnClose = document.getElementById('btnCloseApkModal');
    const btnPwaInstall = document.getElementById('btnPwaInstallModal');

    if (btnOpen && modal) {
      btnOpen.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }

    // PWA BeforeInstallPrompt Handler
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      if (btnPwaInstall) {
        btnPwaInstall.style.display = 'block';
        btnPwaInstall.addEventListener('click', async () => {
          if (window.deferredPwaPrompt) {
            window.deferredPwaPrompt.prompt();
            const { outcome } = await window.deferredPwaPrompt.userChoice;
            if (outcome === 'accepted') {
              if (window.showToast) window.showToast('PRALAY-RAKSHAK Installed to Home Screen!', 'success');
            }
            window.deferredPwaPrompt = null;
            if (modal) modal.style.display = 'none';
          }
        });
      }
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
          .then(reg => console.log('PWA ServiceWorker registered with scope:', reg.scope))
          .catch(err => console.warn('PWA ServiceWorker registration failed:', err));
      });
    }
  }
}

// Toast Notification Helper
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : (type === 'success' ? 'toast-success' : '')}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
  window.app.init();
});
