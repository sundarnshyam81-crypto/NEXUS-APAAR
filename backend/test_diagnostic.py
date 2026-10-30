import sys, os, time

# Force unbuffered output so every print appears immediately in the console
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None

print("[DIAGNOSTIC] Step 1: Checking Python environment & paths...", flush=True)
print(f"[DIAGNOSTIC] Python executable: {sys.executable}", flush=True)
print(f"[DIAGNOSTIC] Working dir: {os.getcwd()}", flush=True)

print("[DIAGNOSTIC] Step 2: Testing database connection...", flush=True)
t0 = time.time()
try:
    from database import engine, SessionLocal
    import models
    db = SessionLocal()
    student_count = db.query(models.Student).count()
    db.close()
    print(f"[DIAGNOSTIC] DB connected in {time.time() - t0:.2f}s! Found {student_count} students in DB.", flush=True)
except Exception as e:
    print(f"[DIAGNOSTIC] DB connection failed: {e}", flush=True)
    sys.exit(1)

print("[DIAGNOSTIC] Step 3: Importing FastAPI app...", flush=True)
t0 = time.time()
try:
    from main import app
    print(f"[DIAGNOSTIC] FastAPI app imported successfully in {time.time() - t0:.2f}s!", flush=True)
except Exception as e:
    print(f"[DIAGNOSTIC] App import failed: {e}", flush=True)
    sys.exit(1)

print("[DIAGNOSTIC] Step 4: Creating TestClient...", flush=True)
t0 = time.time()
try:
    from fastapi.testclient import TestClient
    client = TestClient(app)
    print(f"[DIAGNOSTIC] TestClient initialized in {time.time() - t0:.2f}s!", flush=True)
except Exception as e:
    print(f"[DIAGNOSTIC] TestClient init failed: {e}", flush=True)
    sys.exit(1)

print("[DIAGNOSTIC] Step 5: Testing /health endpoint...", flush=True)
t0 = time.time()
try:
    res = client.get("/health")
    print(f"[DIAGNOSTIC] /health returned {res.status_code} in {time.time() - t0:.2f}s: {res.json()}", flush=True)
except Exception as e:
    print(f"[DIAGNOSTIC] /health check failed: {e}", flush=True)
    sys.exit(1)

print("[DIAGNOSTIC] All pre-flight checks passed successfully!", flush=True)
