from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, auth
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/verification", tags=["Verification"])


@router.get("/")
def list_verifications(current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    records = db.query(models.VerificationRecord).order_by(models.VerificationRecord.created_at.desc()).all()
    result = []
    for r in records:
        s = db.query(models.Student).filter(models.Student.id == r.student_id).first()
        result.append({
            "id": r.id, "verification_id": r.verification_id, "student_id": r.student_id,
            "student_name": s.full_name if s else None,
            "student_demo_id": s.demo_id if s else None,
            "request_type": r.request_type, "status": r.status,
            "result": r.result, "is_simulated": r.is_simulated,
            "explanation": r.explanation,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        })
    return result


@router.post("/run/{student_id}")
def run_verification(student_id: int, current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    req = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).first()
    has_conflict = req.has_conflicting_enrolment if req else False
    now = datetime.utcnow()
    ver = models.VerificationRecord(
        verification_id=f"VER{uuid.uuid4().hex[:10].upper()}",
        student_id=student.id, request_type="enrolment_check",
        status="simulated_pass" if not has_conflict else "simulated_fail",
        result="simulated_pass" if not has_conflict else "simulated_fail",
        is_simulated=True,
        explanation="SIMULATED VERIFICATION: This demonstration evaluates a configured test condition without executing a real zero-knowledge proof. The result reflects the configured demo scenario state.",
        completed_at=now
    )
    db.add(ver)
    db.add(models.AuditEvent(
        event_id=f"AUD{uuid.uuid4().hex[:12].upper()}",
        actor_role="admin", actor_reference="collegeadmin",
        event_type="verification_executed", related_student_demo_id=student.demo_id,
        new_state=ver.result,
        explanation=f"Simulated verification executed for student {student.demo_id}"
    ))
    db.commit()
    return {
        "verification_id": ver.verification_id, "result": ver.result,
        "is_simulated": True, "explanation": ver.explanation,
        "message": "SIMULATED VERIFICATION COMPLETE — Not a real cryptographic proof",
        "student_name": student.full_name, "student_demo_id": student.demo_id,
    }
