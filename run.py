"""
One-Click Launcher for PRALAY-RAKSHAK: AI Landslide Early Warning & GIS Platform
"""

import os
import sys
import time
import webbrowser
import threading
import uvicorn

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def open_browser(url: str):
    time.sleep(1.2)
    print(f"\n[INFO] Opening application in browser: {url}")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[WARN] Could not automatically open browser: {e}")

def main():
    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"

    print("=" * 72)
    print("PRALAY-RAKSHAK: AI Landslide Early Warning & GIS Platform (NER)")
    print("Coverage: Assam, Meghalaya, Sikkim, Arunachal, Nagaland, Manipur, Mizoram, Tripura")
    print(f"Server live at: {url}")
    print("=" * 72)

    # Launch browser in a background thread
    threading.Thread(target=open_browser, args=(url,), daemon=True).start()

    # Start FastAPI with Uvicorn
    uvicorn.run("backend.main:app", host=host, port=port, reload=False, log_level="info")

if __name__ == "__main__":
    main()
