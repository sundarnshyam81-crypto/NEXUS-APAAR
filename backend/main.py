"""
NEXUS APAAR — FastAPI Backend
SIH 2026 | Team Zyvantha | Problem Statement SIH26263
DEMO ENVIRONMENT — SYNTHETIC DATA ONLY
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
import os
from dotenv import load_dotenv

load_dotenv()

from routers import auth_router, student_router, admin_router, admission_router, credit_router, verification_router, capacity_router, audit_router, aicte_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NEXUS APAAR API",
    description="""
**NEXUS APAAR — Intelligent Admission Control Centre**

SIH 2026 | Team Zyvantha | Problem Statement SIH26263

> **DEMO ENVIRONMENT — SYNTHETIC DATA ONLY**
> All student data, verification results, and institutional records are entirely synthetic.
> This platform is not connected to any government system.
    """,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(student_router.router)
app.include_router(admin_router.router)
app.include_router(admission_router.router)
app.include_router(credit_router.router)
app.include_router(verification_router.router)
app.include_router(capacity_router.router)
app.include_router(audit_router.router)
app.include_router(aicte_router.router)


@app.get("/")
def root():
    return {
        "application": "NEXUS APAAR",
        "version": "1.0.0",
        "hackathon": "Smart India Hackathon 2026",
        "team": "Zyvantha",
        "environment": "DEMO — SYNTHETIC DATA ONLY",
        "docs": "/api/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "environment": "demo"}
