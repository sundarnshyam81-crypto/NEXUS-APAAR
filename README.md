# NEXUS APAAR — Intelligent Admission Control Centre

> **Smart India Hackathon 2026 Submission**  
> **Problem Statement ID:** SIH26263  
> **Problem Statement:** Development of an APAAR ID-Based Student Data Management Platform  
> **Team Name:** Zyvantha  
> **Environment Status:** DEMO ENVIRONMENT — SYNTHETIC DATA ONLY  

---

## 1. Executive Summary

**NEXUS APAAR** is a multi-portal enterprise web application designed to demonstrate secure, privacy-preserving, and transparent student data management powered by synthetic APAAR identifiers. It includes a Student Portal, College Admin Portal, and a separate AICTE Admin Portal for synthetic institution approval and compliance workflows.

The platform directly addresses the challenges outlined in SIH26263:
1. **Student Admission Lifecycle Management**: 5-stage transparent tracking from submission to institutional allocation.
2. **Concurrent Enrolment Conflict Verification**: Automated privacy-preserving validation preventing dual full-time registrations.
3. **Institutional Seat Capacity Digital Twin**: Real-time intake monitoring with transactional seat allocations that strictly prevent over-intake.
4. **Academic Credit Intelligence**: Unified ingestion and evaluation of external credits from the Academic Bank of Credits (**ABC**), **SWAYAM**, and **NPTEL**.
5. **Privacy-Preserving Verification Interface**: Transparent demonstration evaluator with a modular architecture ready for zero-knowledge circuits (**circom** and **snarkjs**).
6. **Auditable Administrative Action Ledger**: Comprehensive audit trail with RFC 4180 CSV export for governance and compliance.
7. **Three-Role Access Control**: Separate Student, College Administrator, and AICTE Administrator roles backed by persistent SQLite/PostgreSQL storage.
8. **AICTE Administration Demo**: Synthetic institution directory, approval reviews, course/intake monitoring, compliance reviews, analytics, notifications, and decision audit history.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Recharts, Lucide React |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic 2, Python-Jose (JWT), Passlib/HMAC-SHA256 |
| **Database** | SQLite (Default Local Dev) / PostgreSQL Compatible (via SQLAlchemy ORM) |
| **Verification Layer**| Simulated Zero-Knowledge Verification Interface (transparently declared as simulation) |
| **AI Intelligence** | Gemini / LangChain Integration Adapter with Deterministic Demonstration Fallback |

---

## 3. Ten Predefined Synthetic Student Demo Accounts

All demonstration identifiers are **strictly 12-digit numeric strings** stored without loss of precision.

| # | Student Name | Synthetic Demo APAAR ID | Dept | Year | Academic Degree Programme | Configured Scenario / Status |
|---|---|---|---|---|---|---|
| 1 | **Shyam** | `900000000001` | AIML | II | B.Tech Artificial Intelligence & Machine Learning | **Scenario A**: Eligible for approval |
| 2 | **Saran Kanna** | `900000000002` | CSE | II | B.Tech Computer Science & Engineering | Pending Review (SWAYAM DSA Claim) |
| 3 | **Sanjay Kumar** | `900000000003` | IT | III | B.Tech Information Technology | Approved Admission & Active Enrolment |
| 4 | **Dhiya** | `900000000004` | AIML | II | B.Tech Artificial Intelligence & Machine Learning | Standard Submitted Application |
| 5 | **Aarav Kumar** | `900000000005` | CSE | II | B.Tech Computer Science & Engineering | **Scenario B**: Conflicting Active Enrolment |
| 6 | **Priya Sharma** | `900000000006` | ECE | III | B.Tech Electronics & Communication Engineering | Additional Info Required / ECE Target |
| 7 | **Karthik S** | `900000000007` | CSE | IV | B.Tech Computer Science & Engineering | Senior Enrolled / 138 Credits |
| 8 | **Divya Nair** | `900000000008` | IT | I | B.Tech Information Technology | Fresh 1st Year Applicant |
| 9 | **Arjun R** | `900000000009` | EEE | III | B.Tech Electrical & Electronics Engineering | Approved NPTEL Credit Transfer |
| 10 | **Meera Krishnan** | `900000000010` | Mechanical | II | B.Tech Mechanical Engineering | Fresh Mechanical Applicant |

---

## 4. Demonstration Credentials

### Student Portal Access
- **Identifier**: Any 12-digit Demo APAAR ID from table above (e.g., `900000000001`)
- **Demo PIN**: `2026`
- *Convenience*: The login screen includes a 1-click **Demo Account Picker** that pre-populates credentials for instant testing.

### College Administrator Portal Access
- **Administrator ID**: `collegeadmin`
- **Password**: `CollegeDemo@2026`
- *Convenience*: Includes a **"Load Default Demo Credentials"** button.

### AICTE Administrator Portal Access
- **Portal**: `/aicte/login`
- **Administrator ID**: `aicteadmin`
- **Password**: `AICTEDemo@2026`
- Configure `AICTE_ADMIN_ID` and `AICTE_ADMIN_PASSWORD` in `backend/.env` to override the local demo credentials.
- Seed the AICTE administrator account and synthetic institutional records with `python seed.py`.
- Institution, approval, course, intake, and compliance data in this portal are synthetic and are **not verified official AICTE data**. This application does not connect to AICTE systems.
- Institution names in the directory, applications, course list, dashboard and compliance list open an institution overview at `/aicte/institutions/{id}`. The overview API is `GET /api/aicte/institutions/{id}/overview` and is restricted to AICTE administrators.
- Seeded overview profiles include synthetic institution identity and ownership, location, affiliation, approval dates, study modes, facilities, approved intake and enrolment aggregates, departments, three years of outcomes, demo rankings, compliance counts, and review history. Department statistics contain institution-level aggregates only and no student names or identifiers.
- Institution dates, outcome percentages/passouts, and values labeled **Demo ranking (synthetic)** are fictional demonstration values, not verified official AICTE data.

---

## 5. Local Setup and Startup Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node.js v24)
- Git

### Step 1: Clone Repository and Navigate to Folder
```bash
cd nexusapaar
```

### Step 2: Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python seed.py
```

### Step 3: Start FastAPI Backend Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* The API documentation will be available at: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
* Health check: [http://localhost:8000/health](http://localhost:8000/health)

### Step 4: Frontend Setup & Startup (In a new terminal)
```bash
cd frontend
npm install
npm run dev
```
* The application will be running at: [http://localhost:3000](http://localhost:3000)

---

## 6. Running the Automated 25-Point Test Suite

The project includes an automated test script validating all SIH requirements:
```bash
cd backend
python test_suite.py
```

**Verified Test Requirements:**
1. `TEST 1`: Valid synthetic student account logs in and retrieves own profile.
2. `TEST 2`: Arbitrary/invalid demo IDs or wrong PINs are strictly rejected.
3. `TEST 3`: Student cannot access another student's profile or college admin endpoints.
4. `TEST 4`: College administrator logs in with distinct authenticated role.
5. `TEST 5`: Student can submit external credit-transfer requests (ABC / SWAYAM / NPTEL).
6. `TEST 6`: Submitted requests appear in real time in the college review queue.
7. `TEST 7`: Administrator's approval/rejection decision updates student profile and credit ledger.
8. `TEST 8`: Active conflicting enrolment prevents admission approval.
9. `TEST 9`: Programme at 100% capacity rejects further seat allocation.
10. `TEST 10`: Immutable audit events recorded for all state mutations.
11. `TEST 11`: Dashboard live statistics strictly match database records.
12. `TEST 12`: CSV export generates valid RFC 4180 synthetic records.
13. `TEST 13`: Operates gracefully without an external Gemini API key.
14. `TEST 14`: Simulated verification is explicitly declared and never misrepresented as real ZKP.
15. `TEST 15`: All application routes and health checks pass.
16. `TEST 16`: AICTE administrators receive complete seeded institution overview sections.
17. `TEST 17`: Unknown institution overview IDs return 404.
18. `TEST 18`: Student tokens are forbidden from institution overviews.
19. `TEST 19`: College administrator tokens are forbidden from institution overviews.
20. `TEST 20`: Institution overviews require an authenticated token.
21. `TEST 21`: Utilisation is derived from enrolled and approved intake totals.
22. `TEST 22`: Department approved intakes sum to institution approved intake.
23. `TEST 23`: Passouts-last-year uses the latest completed outcomes year.
24. `TEST 24`: Overview responses exclude student identifiers and declare synthetic data.
25. `TEST 25`: Re-running the AICTE profile seed does not duplicate records.

---

## 7. Interactive Demonstration Scenarios (Judges Guide)

The College Administrator Portal (`/admin/overview`) features a **Demo Scenarios** control deck:

1. **Scenario A — Eligible Admission (Shyam, 900000000001)**
   - Click `Scen A (Execute)`.
   - Passes all prerequisites, executes simulated verification, verifies seat availability in AIML, allocates a seat transactionally, and approves the admission.
   - Log in to the Student Portal as Shyam (`900000000001` / `2026`) to view the approved status and seat allocation.

2. **Scenario B — Conflicting Enrolment Block (Aarav Kumar, 900000000005)**
   - Click `Scen B (Execute)`.
   - Simulated verification detects an active concurrent full-time enrolment in the demonstration dataset.
   - Admission request transitions to `blocked` status with clear policy rationale.
   - Attempting to approve this request via API or UI is barred with an HTTP 400 error.

3. **Scenario C — Capacity Reached Rejection (ECE Programme)**
   - Click `Scen C (Execute)`.
   - Sets the ECE programme enrolment to 90/90 (100% capacity).
   - Any further admission attempts to ECE are rejected with a capacity ceiling alert.

4. **Scenario Reset**: Click `Reset All 3 Demo Scenarios` in `/admin/settings` or use the individual reset buttons to return data to baseline.

---

## 8. Privacy & Ethical Transparency Notice

- **Synthetic Data**: All student names, demonstration identifiers, degrees, and institutions are entirely fictional.
- **No Real Government Integration**: This application does not claim live integration with APAAR, Digilocker, or National Academic Depository (NAD) registers.
- **Simulated Verification**: The privacy verification feature is explicitly labeled as `SIMULATED VERIFICATION` to preserve complete academic and technical integrity.

---

## 9. Team & Submission Details

- **Hackathon:** Smart India Hackathon 2026
- **Problem Statement ID:** SIH26263
- **Team Name:** Zyvantha
- **Project Name:** NEXUS APAAR
