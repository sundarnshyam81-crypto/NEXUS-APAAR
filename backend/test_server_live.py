import subprocess
import time
import urllib.request
import json
import sys

print("[SERVER TEST] Starting uvicorn process on port 8005...", flush=True)
proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8005"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

try:
    # Wait for server to start
    time.sleep(3)
    print("[SERVER TEST] Probing http://127.0.0.1:8005/health...", flush=True)
    req = urllib.request.Request("http://127.0.0.1:8005/health")
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode())
        print(f"[SERVER TEST] Health response: {data}", flush=True)

    print("[SERVER TEST] Probing http://127.0.0.1:8005/ (root info)...", flush=True)
    req_root = urllib.request.Request("http://127.0.0.1:8005/")
    with urllib.request.urlopen(req_root, timeout=5) as response:
        root_data = json.loads(response.read().decode())
        print(f"[SERVER TEST] Root response: {root_data}", flush=True)

    print("[SERVER TEST] SUCCESS! FastAPI server runs and responds perfectly!", flush=True)
finally:
    print("[SERVER TEST] Stopping uvicorn process...", flush=True)
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except Exception:
        proc.kill()
