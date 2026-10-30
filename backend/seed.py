"""
NEXUS APAAR — Database Seed Script
Inserts 10 synthetic student accounts and demo data.
Safe to rerun — uses upsert logic (skips existing records).
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine
import models
from auth import get_password_hash
from datetime import date, datetime, timedelta
import uuid

models.Base.metadata.create_all(bind=engine)

DEMO_PIN = os.getenv("STUDENT_DEMO_PIN", "2026")
ADMIN_ID = os.getenv("ADMIN_ID", "collegeadmin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "CollegeDemo@2026")
AICTE_ADMIN_ID = os.getenv("AICTE_ADMIN_ID", "aicteadmin")
AICTE_ADMIN_PASSWORD = os.getenv("AICTE_ADMIN_PASSWORD", "AICTEDemo@2026")

AICTE_INSTITUTIONS = [
    {"institution_id": "DEMO-AICTE-001", "name": "Demo National Institute of Technology", "state": "Delhi", "district": "New Delhi", "institution_type": "Public Technical University", "approval_status": "approved"},
    {"institution_id": "DEMO-AICTE-002", "name": "Demo Coastal Institute of Engineering", "state": "Tamil Nadu", "district": "Chennai", "institution_type": "Private Engineering College", "approval_status": "approved"},
    {"institution_id": "DEMO-AICTE-003", "name": "Demo Western Valley Polytechnic", "state": "Maharashtra", "district": "Pune", "institution_type": "Polytechnic", "approval_status": "pending"},
    {"institution_id": "DEMO-AICTE-004", "name": "Demo Eastern Technical University", "state": "West Bengal", "district": "Kolkata", "institution_type": "State Technical University", "approval_status": "under_review"},
    {"institution_id": "DEMO-AICTE-005", "name": "Demo Deccan School of Technology", "state": "Karnataka", "district": "Bengaluru Urban", "institution_type": "Private Engineering College", "approval_status": "approved"},
    {"institution_id": "DEMO-AICTE-006", "name": "Demo Aravali Institute of Applied Sciences", "state": "Rajasthan", "district": "Jaipur", "institution_type": "Public Engineering College", "approval_status": "rejected"},
    {"institution_id": "DEMO-AICTE-007", "name": "Demo Himalayan Polytechnic", "state": "Uttarakhand", "district": "Dehradun", "institution_type": "Polytechnic", "approval_status": "pending"},
    {"institution_id": "DEMO-AICTE-008", "name": "Demo Central Institute of Engineering", "state": "Madhya Pradesh", "district": "Bhopal", "institution_type": "Public Engineering College", "approval_status": "approved"},
]

STUDENTS = [
    {"demo_id": "900000000001", "full_name": "Shyam",         "department": "AIML",       "academic_year": "II",  "degree_programme": "B.Tech Artificial Intelligence & Machine Learning", "credits_earned": 72,  "credits_required": 160},
    {"demo_id": "900000000002", "full_name": "Saran Kanna",   "department": "CSE",        "academic_year": "II",  "degree_programme": "B.Tech Computer Science & Engineering",             "credits_earned": 68,  "credits_required": 160},
    {"demo_id": "900000000003", "full_name": "Sanjay Kumar",  "department": "IT",         "academic_year": "III", "degree_programme": "B.Tech Information Technology",                     "credits_earned": 104, "credits_required": 160},
    {"demo_id": "900000000004", "full_name": "Dhiya",         "department": "AIML",       "academic_year": "II",  "degree_programme": "B.Tech Artificial Intelligence & Machine Learning", "credits_earned": 74,  "credits_required": 160},
    {"demo_id": "900000000005", "full_name": "Aarav Kumar",   "department": "CSE",        "academic_year": "II",  "degree_programme": "B.Tech Computer Science & Engineering",             "credits_earned": 66,  "credits_required": 160},
    {"demo_id": "900000000006", "full_name": "Priya Sharma",  "department": "ECE",        "academic_year": "III", "degree_programme": "B.Tech Electronics & Communication Engineering",    "credits_earned": 98,  "credits_required": 160},
    {"demo_id": "900000000007", "full_name": "Karthik S",     "department": "CSE",        "academic_year": "IV",  "degree_programme": "B.Tech Computer Science & Engineering",             "credits_earned": 138, "credits_required": 160},
    {"demo_id": "900000000008", "full_name": "Divya Nair",    "department": "IT",         "academic_year": "I",   "degree_programme": "B.Tech Information Technology",                     "credits_earned": 28,  "credits_required": 160},
    {"demo_id": "900000000009", "full_name": "Arjun R",       "department": "EEE",        "academic_year": "III", "degree_programme": "B.Tech Electrical & Electronics Engineering",       "credits_earned": 102, "credits_required": 160},
    {"demo_id": "900000000010", "full_name": "Meera Krishnan","department": "Mechanical", "academic_year": "II",  "degree_programme": "B.Tech Mechanical Engineering",                     "credits_earned": 70,  "credits_required": 160},
]

PROGRAMMES = [
    {"name": "B.Tech Computer Science & Engineering",           "department": "CSE",        "approved_intake": 120, "current_enrolled": 87},
    {"name": "B.Tech Artificial Intelligence & Machine Learning","department": "AIML",       "approved_intake": 60,  "current_enrolled": 42},
    {"name": "B.Tech Electronics & Communication Engineering",  "department": "ECE",        "approved_intake": 90,  "current_enrolled": 45},
    {"name": "B.Tech Information Technology",                   "department": "IT",         "approved_intake": 60,  "current_enrolled": 38},
    {"name": "B.Tech Electrical & Electronics Engineering",     "department": "EEE",        "approved_intake": 60,  "current_enrolled": 31},
    {"name": "B.Tech Mechanical Engineering",                   "department": "Mechanical", "approved_intake": 60,  "current_enrolled": 44},
]

CREDIT_REQUESTS = [
    {"si": 0, "course_name": "Machine Learning Foundations",    "src": "NPTEL",  "cid": "NPTEL-ML-2024-T1",   "cc": 4, "status": "approved",       "ac": 4, "expl": "Course maps to AIML elective. Approved."},
    {"si": 1, "course_name": "Data Structures and Algorithms",  "src": "SWAYAM", "cid": "SWAYAM-DSA-CS101",   "cc": 4, "status": "pending",         "ac": 0, "expl": None},
    {"si": 2, "course_name": "Cloud Computing Essentials",      "src": "ABC",    "cid": "ABC-CC-2024-001",     "cc": 3, "status": "under_review",    "ac": 0, "expl": None},
    {"si": 4, "course_name": "Python Programming Advanced",     "src": "NPTEL",  "cid": "NPTEL-PY-ADV-2024",  "cc": 4, "status": "approved",        "ac": 4, "expl": "Relevant to CSE curriculum. Approved."},
    {"si": 6, "course_name": "Artificial Intelligence Ethics",  "src": "SWAYAM", "cid": "SWAYAM-AIE-2024",    "cc": 2, "status": "rejected",        "ac": 0, "expl": "Course does not meet credit-hour requirement."},
    {"si": 8, "course_name": "Power Electronics",               "src": "NPTEL",  "cid": "NPTEL-PE-2024",      "cc": 4, "status": "approved",        "ac": 4, "expl": "Maps to EEE elective. Approved."},
]

NOTIFICATIONS = [
    {"si": 0, "title": "Application Submitted",        "msg": "Your admission application has been submitted successfully.",                       "nt": "success"},
    {"si": 0, "title": "Credit Transfer Approved",     "msg": "Your NPTEL Machine Learning Foundations credit transfer (4 credits) was approved.", "nt": "success"},
    {"si": 1, "title": "Application Under Review",     "msg": "Your admission application is currently under review.",                             "nt": "info"},
    {"si": 1, "title": "Credit Transfer Submitted",    "msg": "Your SWAYAM DSA credit transfer request has been submitted for review.",            "nt": "info"},
    {"si": 4, "title": "Enrolment Conflict Detected",  "msg": "Configured demo: enrolment conflict detected. Contact the administrator.",          "nt": "error"},
    {"si": 5, "title": "Additional Documents Required","msg": "Please provide additional documentation for your admission application.",            "nt": "warning"},
    {"si": 6, "title": "Admission Approved",           "msg": "Congratulations! Your admission to B.Tech CSE has been approved.",                  "nt": "success"},
    {"si": 8, "title": "Credit Transfer Approved",     "msg": "Your NPTEL Power Electronics credit transfer (4 credits) was approved.",            "nt": "success"},
]


def seed():
    db = SessionLocal()
    try:
        print("=" * 60)
        print("NEXUS APAAR — Database Seed")
        print("=" * 60)

        # Admin account
        admin = db.query(models.UserAccount).filter(models.UserAccount.username == ADMIN_ID).first()
        if not admin:
            admin = models.UserAccount(username=ADMIN_ID, hashed_pin=get_password_hash(ADMIN_PASSWORD), role="admin", is_active=True)
            db.add(admin); db.flush()
            print(f"  ✓ Admin account created: {ADMIN_ID}")
        else:
            print(f"  · Admin account exists: {ADMIN_ID}")

        aicte_admin = db.query(models.UserAccount).filter(models.UserAccount.username == AICTE_ADMIN_ID).first()
        if not aicte_admin:
            db.add(models.UserAccount(
                username=AICTE_ADMIN_ID,
                hashed_pin=get_password_hash(AICTE_ADMIN_PASSWORD),
                role="aicte_admin",
                is_active=True,
            ))
            print(f"  ✓ AICTE demo account created: {AICTE_ADMIN_ID}")
        else:
            print(f"  · AICTE demo account exists: {AICTE_ADMIN_ID}")

        seed_aicte_demo_data(db)

        # Programmes
        prog_map = {}
        for pd in PROGRAMMES:
            p = db.query(models.Programme).filter(models.Programme.department == pd["department"]).first()
            if not p:
                p = models.Programme(**pd); db.add(p); db.flush()
                print(f"  ✓ Programme: {pd['name']}")
            prog_map[pd["department"]] = p

        # Students + user accounts
        student_objs = []
        for sd in STUDENTS:
            s = db.query(models.Student).filter(models.Student.demo_id == sd["demo_id"]).first()
            if not s:
                s = models.Student(
                    demo_id=sd["demo_id"], full_name=sd["full_name"],
                    institution="Demo Engineering College",
                    department=sd["department"], degree_programme=sd["degree_programme"],
                    academic_year=sd["academic_year"],
                    credits_earned=sd["credits_earned"], credits_required=sd["credits_required"],
                    enrolment_status="active"
                )
                db.add(s); db.flush()
                u = models.UserAccount(username=f"student_{sd['demo_id']}", hashed_pin=get_password_hash(DEMO_PIN), role="student", student_id=s.id, is_active=True)
                db.add(u); db.flush()
                print(f"  ✓ Student: {sd['full_name']} ({sd['demo_id']})")
            student_objs.append(s)

        # Admission requests
        statuses = ["submitted","pending_review","approved","submitted","blocked","more_info_required","approved","submitted","pending_review","submitted"]
        for i, s in enumerate(student_objs):
            existing = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == s.id).first()
            if not existing:
                prog = prog_map.get(s.department)
                if not prog:
                    continue
                st = statuses[i] if i < len(statuses) else "submitted"
                req_id = f"ADM{uuid.uuid4().hex[:10].upper()}"
                ar = models.AdmissionRequest(
                    request_id=req_id, student_id=s.id, programme_id=prog.id, status=st,
                    stage1_status="completed", stage1_submitted_at=datetime.utcnow(),
                    stage2_status="completed" if st in ["approved","blocked","pending_review"] else "pending",
                    stage3_status="completed" if st == "approved" else "pending",
                    stage4_status="completed" if st == "approved" else "pending",
                    stage5_status="approved" if st == "approved" else ("blocked" if st == "blocked" else "pending"),
                    has_conflicting_enrolment=(st == "blocked"),
                    seat_allocated=(st == "approved"),
                    decision_reason=(
                        "Application meets all configured demonstration requirements." if st == "approved"
                        else ("SIMULATED VERIFICATION: Configured demonstration enrolment conflict detected." if st == "blocked"
                        else None)
                    ),
                )
                if st == "approved":
                    ar.stage5_decided_at = datetime.utcnow()
                    ar.stage3_capacity_checked_at = datetime.utcnow()
                    ar.stage4_credit_mapped_at = datetime.utcnow()
                if st in ["approved","blocked","pending_review"]:
                    ar.stage2_verified_at = datetime.utcnow()
                db.add(ar); db.flush()

                if st == "approved":
                    s.enrolment_status = "enrolled"

                print(f"  ✓ Admission: {s.full_name} → {st}")

        # Credit transfer requests
        for cd in CREDIT_REQUESTS:
            s = student_objs[cd["si"]]
            existing = db.query(models.CreditTransferRequest).filter(
                models.CreditTransferRequest.student_id == s.id,
                models.CreditTransferRequest.course_identifier == cd["cid"]
            ).first()
            if not existing:
                req_id = f"CTR{uuid.uuid4().hex[:10].upper()}"
                cr = models.CreditTransferRequest(
                    request_id=req_id, student_id=s.id,
                    course_name=cd["course_name"], credit_source=cd["src"],
                    course_identifier=cd["cid"], credits_claimed=cd["cc"],
                    status=cd["status"], approved_credits=cd["ac"],
                    admin_explanation=cd["expl"],
                    completion_info=f"Completed online. Score: {78 + cd['si'] * 2}%",
                    reviewed_at=datetime.utcnow() if cd["status"] in ["approved","rejected"] else None,
                )
                db.add(cr); db.flush()
                print(f"  ✓ Credit request: {cd['course_name']} ({s.full_name})")

        # Notifications
        for nd in NOTIFICATIONS:
            s = student_objs[nd["si"]]
            existing = db.query(models.Notification).filter(
                models.Notification.student_id == s.id,
                models.Notification.title == nd["title"]
            ).first()
            if not existing:
                db.add(models.Notification(student_id=s.id, title=nd["title"], message=nd["msg"], notification_type=nd["nt"]))

        # Verification records (first 5 students)
        for i, s in enumerate(student_objs[:5]):
            existing = db.query(models.VerificationRecord).filter(models.VerificationRecord.student_id == s.id).first()
            if not existing:
                has_conflict = (i == 4)  # Student 5 (Aarav) has conflict
                db.add(models.VerificationRecord(
                    verification_id=f"VER{uuid.uuid4().hex[:10].upper()}",
                    student_id=s.id, request_type="enrolment_check",
                    status="simulated_fail" if has_conflict else "simulated_pass",
                    result="simulated_fail" if has_conflict else "simulated_pass",
                    is_simulated=True,
                    explanation="SIMULATED VERIFICATION: This demonstration evaluates a configured test condition. No real zero-knowledge proof was executed.",
                    completed_at=datetime.utcnow()
                ))

        # Seed audit events
        for et in [("system_initialized", "seed_script", "system", "NEXUS APAAR demo database initialized with synthetic data."),
                   ("settings_changed", "collegeadmin", "admin", "Demo programmes and seat capacities configured.")]:
            existing = db.query(models.AuditEvent).filter(models.AuditEvent.event_type == et[0]).first()
            if not existing:
                db.add(models.AuditEvent(
                    event_id=f"AUD{uuid.uuid4().hex[:12].upper()}",
                    actor_role=et[2], actor_reference=et[1],
                    event_type=et[0], explanation=et[3]
                ))

        db.commit()
        print("\n✅ Seed complete!")
        print(f"   Admin:        {ADMIN_ID} / {ADMIN_PASSWORD}")
        print(f"   Student PIN:  {DEMO_PIN}")
        print(f"   Students:     {len(student_objs)}")
        print(f"   Programmes:   {len(PROGRAMMES)}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"❌ Seed error: {e}")
        import traceback; traceback.print_exc()
        raise
    finally:
        db.close()


def seed_aicte_demo_data(db):
    now = datetime.utcnow()
    institution_map = {}
    for data in AICTE_INSTITUTIONS:
        institution = db.query(models.AicteInstitution).filter(
            models.AicteInstitution.institution_id == data["institution_id"]
        ).first()
        if not institution:
            institution = models.AicteInstitution(**data)
            db.add(institution)
            db.flush()
        institution_map[data["institution_id"]] = institution

    course_data = [
        ("DEMO-AICTE-001", "CSE-UG-001", "Computer Science", "B.Tech Computer Science and Engineering", "Undergraduate", 120, "2025-26"),
        ("DEMO-AICTE-001", "ECE-UG-001", "Electronics", "B.Tech Electronics and Communication Engineering", "Undergraduate", 60, "2025-26"),
        ("DEMO-AICTE-002", "CSE-UG-002", "Computer Science", "B.E. Computer Science and Engineering", "Undergraduate", 180, "2025-26"),
        ("DEMO-AICTE-002", "AI-PG-002", "Artificial Intelligence", "M.Tech Artificial Intelligence", "Postgraduate", 24, "2025-26"),
        ("DEMO-AICTE-003", "DIP-MECH-003", "Mechanical", "Diploma in Mechanical Engineering", "Diploma", 60, "2025-26"),
        ("DEMO-AICTE-004", "CIVIL-UG-004", "Civil Engineering", "B.Tech Civil Engineering", "Undergraduate", 90, "2025-26"),
        ("DEMO-AICTE-005", "IT-UG-005", "Information Technology", "B.E. Information Technology", "Undergraduate", 120, "2025-26"),
        ("DEMO-AICTE-005", "ECE-UG-005", "Electronics", "B.E. Electronics Engineering", "Undergraduate", 60, "2025-26"),
        ("DEMO-AICTE-006", "MECH-UG-006", "Mechanical", "B.Tech Mechanical Engineering", "Undergraduate", 60, "2025-26"),
        ("DEMO-AICTE-007", "DIP-CIVIL-007", "Civil Engineering", "Diploma in Civil Engineering", "Diploma", 60, "2025-26"),
        ("DEMO-AICTE-008", "CSE-UG-008", "Computer Science", "B.Tech Computer Science and Engineering", "Undergraduate", 120, "2025-26"),
    ]
    for institution_code, code, department, name, level, intake, year in course_data:
        if not db.query(models.AicteCourse).filter(models.AicteCourse.course_code == code).first():
            db.add(models.AicteCourse(
                course_code=code,
                institution_id=institution_map[institution_code].id,
                department=department,
                course_name=name,
                programme_level=level,
                approved_intake=intake,
                academic_year=year,
                approval_status="approved",
            ))

    application_data = [
        ("DEMO-APP-2026-001", "DEMO-AICTE-001", "approved", 150),
        ("DEMO-APP-2026-002", "DEMO-AICTE-002", "approved", 120),
        ("DEMO-APP-2026-003", "DEMO-AICTE-003", "pending", 12),
        ("DEMO-APP-2026-004", "DEMO-AICTE-004", "under_review", 32),
        ("DEMO-APP-2026-005", "DEMO-AICTE-005", "approved", 90),
        ("DEMO-APP-2026-006", "DEMO-AICTE-006", "rejected", 75),
        ("DEMO-APP-2026-007", "DEMO-AICTE-007", "pending", 18),
        ("DEMO-APP-2026-008", "DEMO-AICTE-008", "approved", 60),
    ]
    for app_id, institution_code, status, days_ago in application_data:
        if not db.query(models.AicteApprovalApplication).filter(
            models.AicteApprovalApplication.application_id == app_id
        ).first():
            db.add(models.AicteApprovalApplication(
                application_id=app_id,
                institution_id=institution_map[institution_code].id,
                status=status,
                submitted_by="Synthetic institutional applicant",
                submission_date=now - timedelta(days=days_ago),
            ))

    compliance_data = [
        ("DEMO-COMP-001", "DEMO-AICTE-001", "Annual Institution Information", "completed", -20),
        ("DEMO-COMP-002", "DEMO-AICTE-002", "Faculty and Infrastructure Return", "pending", 8),
        ("DEMO-COMP-003", "DEMO-AICTE-003", "Annual Institution Information", "overdue", -12),
        ("DEMO-COMP-004", "DEMO-AICTE-004", "Faculty and Infrastructure Return", "pending", 5),
        ("DEMO-COMP-005", "DEMO-AICTE-005", "Annual Institution Information", "completed", -15),
        ("DEMO-COMP-006", "DEMO-AICTE-006", "Faculty and Infrastructure Return", "overdue", -4),
        ("DEMO-COMP-007", "DEMO-AICTE-007", "Annual Institution Information", "pending", 12),
        ("DEMO-COMP-008", "DEMO-AICTE-008", "Faculty and Infrastructure Return", "completed", -8),
    ]
    for submission_id, institution_code, report_type, status, due_in in compliance_data:
        if not db.query(models.AicteComplianceSubmission).filter(
            models.AicteComplianceSubmission.submission_id == submission_id
        ).first():
            db.add(models.AicteComplianceSubmission(
                submission_id=submission_id,
                institution_id=institution_map[institution_code].id,
                report_type=report_type,
                academic_year="2025-26",
                due_date=now + timedelta(days=due_in),
                submitted_at=now - timedelta(days=max(1, abs(due_in) // 2)) if status == "completed" else None,
                status=status,
                review_notes="Synthetic sample submission." if status == "completed" else None,
            ))

    notice_data = [
        ("New institution approval applications", "Three synthetic institution applications are awaiting review.", "approval"),
        ("Compliance reports require attention", "Two demo compliance submissions are overdue.", "compliance"),
        ("AICTE demo environment", "All institution and course records in this portal are synthetic demonstration data.", "info"),
    ]
    for title, message, category in notice_data:
        if not db.query(models.AicteNotification).filter(
            models.AicteNotification.title == title
        ).first():
            db.add(models.AicteNotification(title=title, message=message, notification_type=category))

    profile_data = {
        "DEMO-AICTE-001": ("University", "Government", "Synthetic National Technical University", "Sector 12, Academic Avenue", "New Delhi", "110078", "North", 28.6139, 77.2090, 1986, 125, 2024, "Standard annual review."),
        "DEMO-AICTE-002": ("Affiliated College", "Private", "Synthetic Coastal State University", "18 Marina Road, Education District", "Chennai", "600025", "South", 13.0827, 80.2707, 2004, 142, 2024, "Maintain approved faculty strength."),
        "DEMO-AICTE-003": ("Polytechnic", "Trust", "Synthetic Maharashtra Technical Board", "42 Western Valley Road", "Pune", "411007", "West", 18.5204, 73.8567, 2012, 36, 2023, "Intake capped at 60 pending compliance review."),
        "DEMO-AICTE-004": ("University", "Government", "Synthetic Eastern Technical University", "7 Riverbank Campus Road", "Kolkata", "700091", "East", 22.5726, 88.3639, 1998, 63, 2024, "No new programmes during the current review cycle."),
        "DEMO-AICTE-005": ("Autonomous College", "Society", "Synthetic Deccan Education Society", "5 Innovation Park", "Bengaluru", "560037", "South", 12.9716, 77.5946, 2007, 132, 2024, "Maintain infrastructure capacity for approved intake."),
        "DEMO-AICTE-006": ("Affiliated College", "Government-aided", "Synthetic Rajasthan Technical University", "31 Aravali Campus Road", "Jaipur", "302017", "West", 26.9124, 75.7873, 1994, 27, 2023, "New intake requires a fresh compliance review."),
        "DEMO-AICTE-007": ("Polytechnic", "Government", "Synthetic Uttarakhand Board of Technical Education", "9 Himalayan Learning Lane", "Dehradun", "248001", "North", 30.3165, 78.0322, 2001, 39, 2024, "Maintain approved safety and laboratory standards."),
        "DEMO-AICTE-008": ("Autonomous College", "Government", "Synthetic Central Technical University", "16 Lakeview Institutional Road", "Bhopal", "462026", "Central", 23.2599, 77.4126, 1991, 89, 2024, "Standard annual review."),
    }

    for code, values in profile_data.items():
        (
            institution_type, ownership, affiliating_body, address_line, city, pincode,
            region, latitude, longitude, established_year, enrolled_target,
            rank_offset, approval_conditions,
        ) = values
        institution = institution_map[code]
        courses = db.query(models.AicteCourse).filter(
            models.AicteCourse.institution_id == institution.id,
            models.AicteCourse.approval_status == "approved",
        ).order_by(models.AicteCourse.course_name).all()
        total_intake = sum(course.approved_intake for course in courses)
        if not db.query(models.AicteInstitutionProfile).filter(
            models.AicteInstitutionProfile.institution_id == institution.id
        ).first():
            db.add(models.AicteInstitutionProfile(
                institution_id=institution.id,
                display_name=institution.name,
                institution_type=institution_type,
                ownership=ownership,
                affiliating_body=affiliating_body,
                address_line=address_line,
                city=city,
                pincode=pincode,
                region=region,
                latitude=latitude,
                longitude=longitude,
                established_year=established_year,
                registered_with_aicte_date=date(established_year + 2, 7, 1),
                approval_valid_from=date(2026, 7, 1),
                approval_valid_until=date(2027, 6, 30),
                last_inspection_date=date(2025, 2, 1),
                study_modes=["Full-time", "Hybrid"] if rank_offset % 2 else ["Full-time", "Part-time", "Hybrid"],
                medium_of_instruction="English",
                academic_structure="Semester system",
                programme_levels=sorted({course.programme_level.replace("Undergraduate", "UG").replace("Postgraduate", "PG") for course in courses}),
                abc_integration=True,
                facilities_summary="Campus hostel, central library, programme laboratories, and placement cell.",
                total_approved_intake=total_intake,
                maximum_permitted_intake=total_intake + max(12, total_intake // 5),
                current_enrolled=enrolled_target,
                approval_conditions=approval_conditions,
            ))
            db.flush()

        grouped_courses = {}
        for course in courses:
            grouped_courses.setdefault(course.department, []).append(course)
        for department_name, department_courses in grouped_courses.items():
            if db.query(models.AicteInstitutionDepartment).filter(
                models.AicteInstitutionDepartment.institution_id == institution.id,
                models.AicteInstitutionDepartment.department_name == department_name,
            ).first():
                continue
            approved_intake = sum(course.approved_intake for course in department_courses)
            enrolled = min(
                approved_intake,
                round(enrolled_target * approved_intake / total_intake) if total_intake else 0,
            )
            db.add(models.AicteInstitutionDepartment(
                institution_id=institution.id,
                department_name=department_name,
                programmes=sorted({course.course_name for course in department_courses}),
                hod_role_label="Head of Department",
                approved_intake=approved_intake,
                enrolled=enrolled,
                faculty_count=max(8, (approved_intake + 14) // 15),
                established_year=established_year + 3,
            ))

        for academic_year, year_offset, pass_rate, placement_rate in [
            ("2022-23", 2, 78.0 + rank_offset % 9, 54.0 + rank_offset % 12),
            ("2023-24", 1, 81.0 + rank_offset % 9, 58.0 + rank_offset % 12),
            ("2024-25", 0, 84.0 + rank_offset % 9, 62.0 + rank_offset % 12),
        ]:
            if not db.query(models.AicteInstitutionOutcome).filter(
                models.AicteInstitutionOutcome.institution_id == institution.id,
                models.AicteInstitutionOutcome.academic_year == academic_year,
            ).first():
                db.add(models.AicteInstitutionOutcome(
                    institution_id=institution.id,
                    academic_year=academic_year,
                    graduates=max(1, int(total_intake * (0.50 + year_offset * 0.02))),
                    pass_percentage=pass_rate,
                    placement_percentage=placement_rate,
                ))

        for ranking_year, demo_rank, score in [
            (2024, 18 + rank_offset, 62.5 + rank_offset % 10),
            (2025, 15 + rank_offset, 67.5 + rank_offset % 10),
        ]:
            if not db.query(models.AicteInstitutionRanking).filter(
                models.AicteInstitutionRanking.institution_id == institution.id,
                models.AicteInstitutionRanking.year == ranking_year,
            ).first():
                db.add(models.AicteInstitutionRanking(
                    institution_id=institution.id,
                    year=ranking_year,
                    demo_rank=demo_rank,
                    category=f"{institution_type} (synthetic)",
                    score=score,
                ))


if __name__ == "__main__":
    seed()
