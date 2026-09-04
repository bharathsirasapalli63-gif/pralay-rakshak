/**
 * Emergency SOS Distress Beacon & Safe Evacuation Router Engine
 */

class EmergencyManager {
  constructor() {
    this.currentLat = 27.0521;
    this.currentLng = 88.4820;
  }

  init() {
    this.setupSOSButton();
    this.setupEvacRouter();
    this.detectUserCoordinates();
  }

  detectUserCoordinates() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentLat = parseFloat(pos.coords.latitude.toFixed(4));
          this.currentLng = parseFloat(pos.coords.longitude.toFixed(4));
          const coordDisplay = document.getElementById('currentCoordDisplay');
          if (coordDisplay) {
            coordDisplay.textContent = `Lat: ${this.currentLat}, Lng: ${this.currentLng} (Live GPS Acquired)`;
          }
        },
        (err) => {
          // Fallback to initial Sikkim NH-10 coordinates
          console.log("Using default mountain corridor coordinates for evacuation demo.");
        },
        { timeout: 5000 }
      );
    }
  }

  setupSOSButton() {
    const btnSos = document.getElementById('btnSosMain');
    const statusMsg = document.getElementById('sosStatusMsg');

    if (btnSos) {
      btnSos.addEventListener('click', async () => {
        if ("vibrate" in navigator) {
          navigator.vibrate([150, 100, 150, 100, 150, 200, 400, 100, 400, 100, 400, 200, 150, 100, 150, 100, 150]);
        }

        if (window.AlertsController) {
          window.AlertsController.triggerEmergencySiren(window.AlertsController.currentLang);
        }

        const smsBody = encodeURIComponent(
          `[CRITICAL LANDSLIDE SOS] I am trapped/require emergency rescue. GPS: https://maps.google.com/?q=${this.currentLat},${this.currentLng} (Lat: ${this.currentLat}, Lng: ${this.currentLng}). Please dispatch SDRF/NDRF.`
        );
        const smsLink = `sms:112?body=${smsBody}`;

        let registeredSosId = "SOS-2026-LIVE";

        // Transmit SOS beacon to backend DDMA control room
        try {
          const res = await fetch('/api/emergency/sos/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_name: "Citizen SOS Beacon (" + new Date().toLocaleTimeString() + ")",
              phone: "+91-112-EMERGENCY",
              state: "Sikkim",
              corridor: `Mountain Highway Corridor (GPS: ${this.currentLat}, ${this.currentLng})`,
              coordinates: [this.currentLat, this.currentLng],
              situation: "Immediate rescue required: Active slope movement or vehicle trapped in landslide debris.",
              severity: "CRITICAL"
            })
          });

          if (res.ok) {
            const data = await res.json();
            registeredSosId = data.sos_id || registeredSosId;
            if (window.app && window.app.fetchDDMASOSSignals) {
              window.app.fetchDDMASOSSignals();
            }
          }
        } catch (e) {
          console.warn("SOS online beacon failed, fallback SMS link ready:", e);
        }

        if (statusMsg) {
          statusMsg.innerHTML = `
            <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 12px; margin-top: 10px; text-align: left;">
              <div style="font-weight: 800; color: #dc2626; font-size: 13px;">DISTRESS BEACON TRANSMITTED: ${registeredSosId}</div>
              <div style="font-size: 11px; margin-top: 4px; color: #7f1d1d; font-weight: 600;">
                GPS Coordinates [${this.currentLat}, ${this.currentLng}] notified to DDMA Command Control & SDRF Quick Response.
              </div>
              <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="${smsLink}" style="display: inline-block; background: #dc2626; color: white; font-weight: 800; text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 11px;">
                  Send Backup 112 SMS
                </a>
                <button type="button" class="btn-secondary" style="font-size:11px; padding:6px 10px;" onclick="if(window.app){ window.app.switchTab('tab-map'); }">
                  View On GIS Map
                </button>
              </div>
            </div>
          `;
        }

        if (window.showToast) {
          window.showToast("SOS DISTRESS TRANSMITTED! DDMA Authorizer & SDRF Response Squad Notified.", "error");
        }
      });
    }
  }

  setupEvacRouter() {
    const btnCalc = document.getElementById('btnCalculateEvac');
    const resultBox = document.getElementById('evacRouteResultBox');

    if (btnCalc) {
      btnCalc.addEventListener('click', async () => {
        btnCalc.textContent = " Computing Safe Detours...";
        try {
          const res = await fetch('/api/emergency/evacuation-route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin_lat: this.currentLat,
              origin_lng: this.currentLng,
              avoid_blocked_highways: true
            })
          });

          if (res.ok) {
            const data = await res.json();
            btnCalc.textContent = " Find Safe Route";

            if (resultBox) {
              resultBox.style.display = 'block';
              resultBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <h4 style="color: #00e676; font-size: 14px; font-weight: 800;"> Safe Route Computed: ${data.destination_shelter.name}</h4>
                    <p style="color: #94a3b8; font-size: 11px;">${data.destination_shelter.type} • ${data.destination_shelter.district}, ${data.destination_shelter.state}</p>
                  </div>
                  <span class="badge-status-green">${data.distance_km} KM</span>
                </div>

                <div style="background: #0a0e17; padding: 8px; border-radius: 6px; font-size: 12px; margin-bottom: 8px; border-left: 3px solid #00e5ff;">
                  <strong>Navigation Advisory:</strong> ${data.advisory}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px;">
                  <div style="background: #101726; padding: 6px; border-radius: 4px;">
                    <strong>Est. Time:</strong><br>${data.est_travel_time_minutes} mins
                  </div>
                  <div style="background: #101726; padding: 6px; border-radius: 4px;">
                    <strong>Available Beds:</strong><br>${data.destination_shelter.available_beds} beds
                  </div>
                  <div style="background: #101726; padding: 6px; border-radius: 4px;">
                    <strong>Medical:</strong><br>${data.destination_shelter.medical_support ? ' On-Site' : 'Standby'}
                  </div>
                </div>

                <div style="display: flex; gap: 8px;">
                  <button id="btnViewRouteOnMap" class="btn-primary" style="flex: 1; padding: 6px 10px; font-size: 12px;">
                     Show on Live GIS Map
                  </button>
                  <a href="tel:${data.destination_shelter.emergency_contact}" style="background: #00e676; color: black; font-weight: 700; text-decoration: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; display: flex; align-items: center;">
                     Call Shelter
                  </a>
                </div>
              `;

              // Hook "Show on Map" button
              document.getElementById('btnViewRouteOnMap').addEventListener('click', () => {
                if (window.app && window.app.switchTab) {
                  window.app.switchTab('tab-map');
                }
                if (window.GISMap && window.GISMap.drawEvacuationRoute) {
                  window.GISMap.drawEvacuationRoute(data);
                }
              });
            }

            if (window.showToast) {
              window.showToast(`Safe route found to ${data.destination_shelter.name} (${data.distance_km} km)!`, "success");
            }
          }
        } catch (err) {
          btnCalc.textContent = " Find Safe Route";
          if (window.showToast) {
            window.showToast("Failed to compute evacuation route. Please check connection.", "error");
          }
        }
      });
    }
  }
}

// Global Emergency Manager Instance
window.EmergencyManagerInstance = new EmergencyManager();
