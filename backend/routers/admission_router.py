from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/admissions", tags=["Admissions"])


def _audit(db, actor_role, actor_ref, event_type, req_id=None, demo_id=None, prev=None, new=None, expl=None):
    db.add(models.AuditEvent(
        event_id=f"AUD{uuid.uuid4().hex[:12].upper()}",
        actor_role=actor_role, actor_reference=actor_ref, event_type=event_type,
        related_request_id=req_id, related_student_demo_id=demo_id,
        previous_state=prev, new_state=new, explanation=expl
    ))


@router.get("/")
def list_admissions(status_filter: Optional[str] = None, current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    q = db.query(models.AdmissionRequest)
    if status_filter:
        q = q.filter(models.AdmissionRequest.status == status_filter)
    reqs = q.order_by(models.AdmissionRequest.created_at.desc()).all()
    result = []
    for r in reqs:
        prog = db.query(models.Programme).filter(models.Programme.id == r.programme_id).first()
        student = db.query(models.Student).filter(models.Student.id == r.student_id).first()
        result.append({
            "id": r.id, "request_id": r.request_id, "student_id": r.student_id,
            "programme_id": r.programme_id,
            "programme_name": prog.name if prog else None,
            "department": prog.department if prog else None,
            "status": r.status,
            "stage1_status": r.stage1_status, "stage2_status": r.stage2_status,
            "stage3_status": r.stage3_status, "stage4_status": r.stage4_status,
            "stage5_status": r.stage5_status,
            "stage1_submitted_at": r.stage1_submitted_at.isoformat() if r.stage1_submitted_at else None,
            "stage2_verified_at": r.stage2_verified_at.isoformat() if r.stage2_verified_at else None,
            "stage3_capacity_checked_at": r.stage3_capacity_checked_at.isoformat() if r.stage3_capacity_checked_at else None,
            "stage4_credit_mapped_at": r.stage4_credit_mapped_at.isoformat() if r.stage4_credit_mapped_at else None,
            "stage5_decided_at": r.stage5_decided_at.isoformat() if r.stage5_decided_at else None,
            "decision_reason": r.decision_reason,
            "has_conflicting_enrolment": r.has_conflicting_enrolment,
            "seat_allocated": r.seat_allocated,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "student_name": student.full_name if student else None,
            "student_demo_id": student.demo_id if student else None,
        })
    return result


@router.post("/{request_id}/action")
def process_action(
    request_id: str,
    decision: schemas.AdmissionDecisionRequest,
    current_user=Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    req = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Admission request not found")
    student = db.query(models.Student).filter(models.Student.id == req.student_id).first()
    programme = db.query(models.Programme).filter(models.Programme.id == req.programme_id).first()
    prev_status = req.status
    now = datetime.utcnow()

    if decision.action == "run_verification":
        req.stage2_status = "completed" if not req.has_conflicting_enrolment else "failed"
        req.stage2_verified_at = now
        if req.has_conflicting_enrolment:
            req.status = "blocked"
            req.stage5_status = "blocked"
            req.decision_reason = "SIMULATED VERIFICATION: A conflicting active full-time enrolment was detected in the demonstration dataset. This is a configured demo scenario — not a real government record check."
        else:
            req.status = "pending_review"
        db.add(models.VerificationRecord(
            verification_id=f"VER{uuid.uuid4().hex[:10].upper()}",
            student_id=req.student_id, request_type="enrolment_check",
            status="simulated_pass" if not req.has_conflicting_enrolment else "simulated_fail",
            result="simulated_pass" if not req.has_conflicting_enrolment else "simulated_fail",
            is_simulated=True,
            explanation="SIMULATED VERIFICATION: This demonstration evaluates a configured test condition. No real zero-knowledge proof was executed.",
            completed_at=now
        ))
        _audit(db, "admin", "collegeadmin", "verification_executed", request_id,
               student.demo_id if student else None, prev_status, req.status,
               f"Simulated enrolment verification for {request_id}")

    elif decision.action == "check_capacity":
        if not programme:
            raise HTTPException(status_code=400, detail="Programme not found")
        req.stage3_status = "completed"
        req.stage3_capacity_checked_at = now
        available = programme.approved_intake - programme.current_enrolled
        if available <= 0:
            req.status = "blocked"
            req.stage5_status = "blocked"
            req.decision_reason = f"CAPACITY REACHED: Programme '{programme.name}' has reached its approved intake of {programme.approved_intake}. No additional seats available."
        else:
            req.status = "pending_review"
        _audit(db, "admin", "collegeadmin", "capacity_checked", request_id,
               student.demo_id if student else None, prev_status, req.status,
               f"Capacity check: {available} seats available in {programme.name if programme else 'N/A'}")

    elif decision.action == "approve":
        if req.has_conflicting_enrolment:
            raise HTTPException(status_code=400, detail="Cannot approve: conflicting enrolment detected")
        if not programme:
            raise HTTPException(status_code=400, detail="Programme not found")
        if programme.approved_intake - programme.current_enrolled <= 0:
            raise HTTPException(status_code=400, detail="Cannot approve: programme at capacity")
        programme.current_enrolled += 1
        db.add(models.SeatAllocation(programme_id=programme.id, student_id=req.student_id, admission_request_id=request_id))
        req.status = "approved"
        req.seat_allocated = True
        req.stage2_status = "completed"
        req.stage3_status = "completed"
        req.stage3_capacity_checked_at = now
        req.stage4_status = "completed"
        req.stage4_credit_mapped_at = now
        req.stage5_status = "approved"
        req.stage5_decided_at = now
        req.decision_reason = decision.reason or "Application meets all configured demonstration requirements."
        if student:
            student.enrolment_status = "enrolled"
            db.add(models.Notification(
                student_id=student.id, title="Admission Approved",
                message=f"Congratulations! Your admission ({request_id}) to {programme.name} has been approved. A seat has been allocated.",
                notification_type="success", related_request_id=request_id
            ))
        _audit(db, "admin", "collegeadmin", "admission_approved", request_id,
               student.demo_id if student else None, prev_status, "approved",
               f"Admission approved. Seat allocated to {programme.name if programme else 'N/A'}.")

    elif decision.action == "reject":
        req.status = "rejected"
        req.stage5_status = "rejected"
        req.stage5_decided_at = now
        req.decision_reason = decision.reason or "Application rejected by administrator."
        if student:
            db.add(models.Notification(
                student_id=student.id, title="Admission Rejected",
                message=f"Your admission application ({request_id}) has been rejected. Reason: {req.decision_reason}",
                notification_type="error", related_request_id=request_id
            ))
        _audit(db, "admin", "collegeadmin", "admission_rejected", request_id,
               student.demo_id if student else None, prev_status, "rejected", decision.reason)

    elif decision.action == "request_info":
        req.status = "more_info_required"
        req.decision_reason = decision.reason or "Additional information required."
        if student:
            db.add(models.Notification(
                student_id=student.id, title="Additional Information Required",
                message=f"Your admission ({request_id}) requires more information: {req.decision_reason}",
                notification_type="warning", related_request_id=request_id
            ))
        _audit(db, "admin", "collegeadmin", "more_info_requested", request_id,
               student.demo_id if student else None, prev_status, "more_info_required", decision.reason)

    db.commit()
    return {"message": f"Action '{decision.action}' completed", "new_status": req.status, "request_id": request_id}


@router.post("/demo-scenarios/{scenario}")
def run_scenario(scenario: str, current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    scenario = scenario.upper()
    now = datetime.utcnow()

    if scenario == "A":
        student = db.query(models.Student).filter(models.Student.demo_id == "900000000001").first()
        req = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).first() if student else None
        if req:
            prog = db.query(models.Programme).filter(models.Programme.id == req.programme_id).first()
            req.status = "approved"; req.has_conflicting_enrolment = False
            req.stage2_status = "completed"; req.stage3_status = "completed"
            req.stage4_status = "completed"; req.stage5_status = "approved"
            req.stage5_decided_at = now
            req.decision_reason = "SCENARIO A: All configured demonstration conditions passed. Application eligible for approval."
            if prog and not req.seat_allocated:
                prog.current_enrolled = min(prog.current_enrolled + 1, prog.approved_intake)
                req.seat_allocated = True
            _audit(db, "admin", "collegeadmin", "scenario_executed", req.request_id, student.demo_id, "submitted", "approved", "Demo Scenario A: Eligible admission approved")
            db.commit()
            return {"message": "Scenario A: Eligible admission approved", "request_id": req.request_id, "status": "approved"}
        return {"message": "Scenario A: No request found"}

    elif scenario == "B":
        student = db.query(models.Student).filter(models.Student.demo_id == "900000000005").first()
        req = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).first() if student else None
        if req:
            req.has_conflicting_enrolment = True; req.status = "blocked"
            req.stage2_status = "failed"; req.stage2_verified_at = now
            req.stage5_status = "blocked"
            req.decision_reason = "SCENARIO B: SIMULATED VERIFICATION detected a conflicting active full-time enrolment. This is a configured demo scenario — not a real government record check."
            _audit(db, "admin", "collegeadmin", "scenario_executed", req.request_id, student.demo_id, "submitted", "blocked", "Demo Scenario B: Enrolment conflict detected")
            db.commit()
            return {"message": "Scenario B: Enrolment conflict blocked", "request_id": req.request_id, "status": "blocked"}
        return {"message": "Scenario B: No request found"}

    elif scenario == "C":
        prog = db.query(models.Programme).filter(models.Programme.department == "ECE").first()
        student = db.query(models.Student).filter(models.Student.demo_id == "900000000006").first()
        req = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).first() if student else None
        if prog:
            prog.current_enrolled = prog.approved_intake
        if req:
            req.status = "blocked"; req.stage3_status = "failed"
            req.stage3_capacity_checked_at = now; req.stage5_status = "blocked"
            req.decision_reason = f"SCENARIO C: Programme '{prog.name if prog else 'ECE'}' has reached its approved intake of {prog.approved_intake if prog else 90}. No seats available."
        _audit(db, "admin", "collegeadmin", "scenario_executed", req.request_id if req else None, student.demo_id if student else None, "submitted", "blocked", "Demo Scenario C: Programme capacity reached")
        db.commit()
        return {"message": "Scenario C: Programme capacity reached", "programme": prog.name if prog else "ECE", "status": "blocked"}

    raise HTTPException(status_code=400, detail="Invalid scenario. Use A, B, or C")


@router.post("/reset-scenario/{scenario}")
def reset_scenario(scenario: str, current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    scenario = scenario.upper()
    if scenario == "A":
        student = db.query(models.Student).filter(models.Student.demo_id == "900000000001").first()
        req = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).first() if student else None
        if req:
            prog = db.query(models.Programme).filter(models.Programme.id == req.programme_id).first()
            if req.seat_allocated and prog:
                prog.current_enrolled = max(0, prog.current_enrolled - 1)
            req.status = "submitted"; req.has_conflicting_enrolment = False; req.seat_allocated = False
            req.stage2_status = "pending"; req.stage3_status = "pending"
            req.stage4_status = "pending"; req.stage5_status = "pending"
            req.stage5_decided_at = None; req.decision_reason = None
            db.commit()
        return {"message": "Scenario A reset"}
    elif scenario == "B":
        student = db.query(models.Student).filter(models.Student.demo_id == "900000000005").first()
        req = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).first() if student else None
        if req:
            req.has_conflicting_enrolment = False; req.status = "submitted"
            req.stage2_status = "pending"; req.stage5_status = "pending"; req.decision_reason = None
            db.commit()
        return {"message": "Scenario B reset"}
    elif scenario == "C":
        prog = db.query(models.Programme).filter(models.Programme.department == "ECE").first()
        if prog:
            prog.current_enrolled = 45
        student = db.query(models.Student).filter(models.Student.demo_id == "900000000006").first()
        req = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).first() if student else None
        if req:
            req.status = "submitted"; req.stage3_status = "pending"
            req.stage5_status = "pending"; req.decision_reason = None
        db.commit()
        return {"message": "Scenario C reset"}
    raise HTTPException(status_code=400, detail="Invalid scenario")
