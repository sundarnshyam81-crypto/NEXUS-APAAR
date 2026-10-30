from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import List
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/capacity", tags=["Seat Capacity"])


@router.get("/programmes")
def list_programmes(current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    programmes = db.query(models.Programme).all()
    result = []
    for p in programmes:
        available = max(0, p.approved_intake - p.current_enrolled)
        utilisation = round((p.current_enrolled / p.approved_intake * 100) if p.approved_intake > 0 else 0, 1)
        pending = db.query(models.AdmissionRequest).filter(
            models.AdmissionRequest.programme_id == p.id,
            models.AdmissionRequest.status.in_(["submitted", "pending_review", "more_info_required"])
        ).count()
        result.append({
            "id": p.id, "name": p.name, "department": p.department,
            "approved_intake": p.approved_intake, "current_enrolled": p.current_enrolled,
            "institution": p.institution, "available_seats": available,
            "utilisation_pct": utilisation, "pending_requests": pending,
        })
    return result


@router.post("/simulate-admission/{programme_id}")
def simulate_admission(programme_id: int, current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    prog = db.query(models.Programme).filter(models.Programme.id == programme_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")
    if prog.current_enrolled >= prog.approved_intake:
        raise HTTPException(status_code=400, detail=f"No seats available in {prog.name}. Capacity reached.")
    prog.current_enrolled += 1
    db.add(models.AuditEvent(
        event_id=f"AUD{uuid.uuid4().hex[:12].upper()}",
        actor_role="admin", actor_reference="collegeadmin", event_type="seat_allocated",
        explanation=f"Simulated seat allocation for {prog.name}. Enrolled: {prog.current_enrolled}/{prog.approved_intake}"
    ))
    db.commit()
    return {
        "programme": prog.name, "approved_intake": prog.approved_intake,
        "current_enrolled": prog.current_enrolled,
        "available_seats": prog.approved_intake - prog.current_enrolled,
        "message": "Simulation: one seat allocated"
    }


@router.post("/reset-programme/{programme_id}")
def reset_programme(programme_id: int, enrolled_count: int = 0, current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    prog = db.query(models.Programme).filter(models.Programme.id == programme_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")
    prog.current_enrolled = max(0, min(enrolled_count, prog.approved_intake))
    db.commit()
    return {"message": f"Programme {prog.name} reset to {prog.current_enrolled} enrolled"}
