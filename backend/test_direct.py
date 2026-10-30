import sys, time
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None

print("Testing direct synchronous invocation of backend functions...", flush=True)
t0 = time.time()

from database import SessionLocal
import models, schemas
from routers import auth_router, student_router, admin_router, admission_router, capacity_router, credit_router

db = SessionLocal()

# 1. Student login
req = schemas.StudentLoginRequest(demo_id="900000000001", demo_pin="2026")
res = auth_router.student_login(req, db=db)
print(f"✓ TEST 1: Student Login successful in {time.time()-t0:.3f}s! User: {res.full_name}, Token: {res.access_token[:20]}...", flush=True)

# 2. Admin login
t0 = time.time()
req_admin = schemas.AdminLoginRequest(admin_id="collegeadmin", password="CollegeDemo@2026")
res_admin = auth_router.admin_login(req_admin, db=db)
print(f"✓ TEST 2: Admin Login successful in {time.time()-t0:.3f}s! Role: {res_admin.role}", flush=True)

# 3. Admin dashboard
t0 = time.time()
dash = admin_router.get_dashboard(db=db)
print(f"✓ TEST 3: Dashboard data retrieved in {time.time()-t0:.3f}s! Total students: {dash.total_students}, Total seats: {dash.total_approved_seats}", flush=True)

# 4. Department Seat Capacity
t0 = time.time()
progs = capacity_router.get_programmes(db=db)
print(f"✓ TEST 4: Seat Capacity retrieved in {time.time()-t0:.3f}s! {len(progs)} programmes found.", flush=True)

db.close()
print("All direct tests completed in milliseconds without any socket hang!", flush=True)
