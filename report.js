/**
 * Field Incident Reporting Engine & Offline IndexedDB Synchronization
 * Allows field officials and citizens to log cracks and ground displacements in remote zero-network zones.
 */

class ReportManager {
  constructor() {
    this.dbName = "LandslideOfflineDB";
    this.dbVersion = 1;
    this.db = null;
    this.currentPhotoB64 = null;
  }

  async init() {
    await this.initIndexedDB();
    this.setupNetworkListeners();
    this.setupFormListeners();
    this.refreshQueueUI();
  }

  initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("reports_queue")) {
          db.createObjectStore("reports_queue", { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error("IndexedDB initialization error:", event.target.error);
        resolve(null);
      };
    });
  }

  setupNetworkListeners() {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      const indicator = document.getElementById('offlineIndicator');
      const text = document.getElementById('offlineText');

      if (indicator && text) {
        if (isOnline) {
          indicator.className = "badge-online";
          text.textContent = "Online";
          // Attempt automatic sync when connectivity returns
          this.syncOfflineReports();
        } else {
          indicator.className = "badge-offline";
          text.textContent = "Offline Mode";
        }
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }

  setupFormListeners() {
    // GPS auto-grab button
    const btnGetGps = document.getElementById('btnGetGps');
    if (btnGetGps) {
      btnGetGps.addEventListener('click', () => {
        if ("geolocation" in navigator) {
          btnGetGps.textContent = " Locating...";
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              document.getElementById('repLat').value = pos.coords.latitude.toFixed(4);
              document.getElementById('repLng').value = pos.coords.longitude.toFixed(4);
              btnGetGps.textContent = " Grab GPS";
              if (window.showToast) window.showToast("GPS coordinates acquired!", "success");
            },
            (err) => {
              btnGetGps.textContent = " Grab GPS";
              if (window.showToast) window.showToast("GPS unavailable, using default coordinates.", "error");
            },
            { timeout: 8000, enableHighAccuracy: true }
          );
        }
      });
    }

    // Photo input change handler
    const photoInput = document.getElementById('repPhotoInput');
    const photoPreview = document.getElementById('photoPreviewContainer');
    const previewImg = document.getElementById('photoPreviewImg');

    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.currentPhotoB64 = event.target.result;
            if (previewImg) previewImg.src = this.currentPhotoB64;
            if (photoPreview) photoPreview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Form submission
    const form = document.getElementById('incidentReportForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleReportSubmit();
      });
    }

    // Manual sync button
    const btnSync = document.getElementById('btnManualSync');
    if (btnSync) {
      btnSync.addEventListener('click', () => {
        this.syncOfflineReports(true);
      });
    }
  }

  async handleReportSubmit() {
    const lat = parseFloat(document.getElementById('repLat').value) || 27.0535;
    const lng = parseFloat(document.getElementById('repLng').value) || 88.4815;

    const reportPayload = {
      reporter_name: document.getElementById('repName').value || "Citizen Reporter",
      reporter_role: "Field Observer",
      state: document.getElementById('repState').value,
      location_name: document.getElementById('repLocation').value,
      coordinates: [lat, lng],
      crack_type: document.getElementById('repCrackType').value,
      crack_width_mm: parseFloat(document.getElementById('repWidth').value) || 20.0,
      crack_depth_cm: parseFloat(document.getElementById('repDepth').value) || 15.0,
      crack_length_m: parseFloat(document.getElementById('repLength').value) || 5.0,
      road_subsidence_cm: parseFloat(document.getElementById('repSubsidence').value) || 0.0,
      photo_b64: this.currentPhotoB64,
      notes: document.getElementById('repNotes').value || "",
      created_at: Date.now()
    };

    // If online, try direct upload to FastAPI
    if (navigator.onLine) {
      try {
        const res = await fetch('/api/reports/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportPayload)
        });

        if (res.ok) {
          const result = await res.json();
          if (window.showToast) {
            window.showToast(`Report ${result.report_id} submitted! Severity: ${result.damage_assessment.severity_level}`, "success");
          }
          this.resetForm();
          if (window.app && window.app.refreshDDMATriage) {
            window.app.refreshDDMATriage();
          }
          return;
        }
      } catch (err) {
        console.warn("Online submission failed, falling back to IndexedDB:", err);
      }
    }

    // Offline / fallback path: Save to IndexedDB
    await this.queueOfflineReport(reportPayload);
    if (window.showToast) {
      window.showToast("No internet / network weak. Report cached securely in browser for auto-sync!", "success");
    }
    this.resetForm();
    await this.refreshQueueUI();
  }

  queueOfflineReport(payload) {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(false);
        return;
      }
      const transaction = this.db.transaction(["reports_queue"], "readwrite");
      const store = transaction.objectStore("reports_queue");
      const addRequest = store.add(payload);

      addRequest.onsuccess = () => resolve(true);
      addRequest.onerror = () => resolve(false);
    });
  }

  getQueuedReports() {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve([]);
        return;
      }
      const transaction = this.db.transaction(["reports_queue"], "readonly");
      const store = transaction.objectStore("reports_queue");
      const getRequest = store.getAll();

      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => resolve([]);
    });
  }

  clearQueue() {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve();
        return;
      }
      const transaction = this.db.transaction(["reports_queue"], "readwrite");
      const store = transaction.objectStore("reports_queue");
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => resolve();
    });
  }

  async refreshQueueUI() {
    const queueList = await this.getQueuedReports();
    const countBadge = document.getElementById('queueBadge');
    const container = document.getElementById('queuedReportsList');

    if (countBadge) {
      countBadge.textContent = `${queueList.length} Reports Queued`;
    }

    if (container) {
      if (queueList.length === 0) {
        container.innerHTML = `<div class="empty-state" data-i18n="no_queued_reports">No offline reports pending synchronization.</div>`;
      } else {
        container.innerHTML = queueList.map(r => `
          <div class="triage-item" style="border-left: 3px solid #ff9100; margin-bottom: 6px;">
            <div style="display:flex; justify-content:space-between; font-weight:700;">
              <span> ${r.location_name}</span>
              <span style="color:#ff9100; font-size:11px;">PENDING SYNC</span>
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">
              ${r.crack_type} • Width: ${r.crack_width_mm}mm, Depth: ${r.crack_depth_cm}cm, Length: ${r.crack_length_m}m
            </div>
            <div style="font-size:10px; color:#64748b;">Logged at: ${new Date(r.created_at).toLocaleTimeString()}</div>
          </div>
        `).join('');
      }
    }
  }

  async syncOfflineReports(manual = false) {
    if (!navigator.onLine) {
      if (manual && window.showToast) {
        window.showToast("Device is still offline. Connect to network to sync.", "error");
      }
      return;
    }

    const queued = await this.getQueuedReports();
    if (queued.length === 0) {
      if (manual && window.showToast) {
        window.showToast("No offline records in queue to sync.", "success");
      }
      return;
    }

    try {
      const res = await fetch('/api/reports/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: queued })
      });

      if (res.ok) {
        const result = await res.json();
        await this.clearQueue();
        await this.refreshQueueUI();
        if (window.showToast) {
          window.showToast(`Auto-sync complete: ${result.synced_count} offline field reports synced!`, "success");
        }
        if (window.app && window.app.refreshDDMATriage) {
          window.app.refreshDDMATriage();
        }
      }
    } catch (err) {
      console.warn("Error synchronizing offline reports:", err);
    }
  }

  resetForm() {
    document.getElementById('incidentReportForm').reset();
    this.currentPhotoB64 = null;
    const photoPreview = document.getElementById('photoPreviewContainer');
    if (photoPreview) photoPreview.style.display = 'none';
  }
}

// Global Report Manager Instance
window.ReportManagerInstance = new ReportManager();
