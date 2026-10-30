from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import List
from datetime import datetime
import io, uuid

router = APIRouter(prefix="/api/student", tags=["Student"])


def _get_student(current_user: models.UserAccount, db: Session) -> models.Student:
    if not current_user.student_id:
        raise HTTPException(status_code=403, detail="No student profile associated")
    student = db.query(models.Student).filter(models.Student.id == current_user.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


def _add_audit(db, actor_role, actor_ref, event_type, request_id=None, student_demo_id=None, prev=None, new=None, explanation=None):
    db.add(models.AuditEvent(
        event_id=f"AUD{uuid.uuid4().hex[:12].upper()}",
        actor_role=actor_role, actor_reference=actor_ref,
        event_type=event_type, related_request_id=request_id,
        related_student_demo_id=student_demo_id,
        previous_state=prev, new_state=new, explanation=explanation
    ))


@router.get("/profile", response_model=schemas.StudentProfileResponse)
def get_profile(current_user: models.UserAccount = Depends(auth.require_student), db: Session = Depends(get_db)):
    return _get_student(current_user, db)


@router.get("/admission-status")
def get_admission_status(current_user: models.UserAccount = Depends(auth.require_student), db: Session = Depends(get_db)):
    student = _get_student(current_user, db)
    requests = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).all()
    result = []
    for r in requests:
        prog = db.query(models.Programme).filter(models.Programme.id == r.programme_id).first()
        result.append({
            "id": r.id, "request_id": r.request_id, "student_id": r.student_id,
            "programme_id": r.programme_id, "programme_name": prog.name if prog else None,
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
        })
    return result


@router.get("/credits")
def get_credits(current_user: models.UserAccount = Depends(auth.require_student), db: Session = Depends(get_db)):
    student = _get_student(current_user, db)
    reqs = db.query(models.CreditTransferRequest).filter(models.CreditTransferRequest.student_id == student.id).all()
    approved_ext = sum(r.approved_credits for r in reqs if r.status == "approved")
    under_review = sum(r.credits_claimed for r in reqs if r.status in ["pending", "under_review"])
    return {
        "credits_earned": student.credits_earned,
        "credits_required": student.credits_required,
        "credits_remaining": max(0, student.credits_required - student.credits_earned - approved_ext),
        "external_credits_approved": approved_ext,
        "credits_under_review": under_review,
        "total_effective_credits": student.credits_earned + approved_ext,
        "credit_requests": [
            {
                "id": r.id, "request_id": r.request_id, "student_id": r.student_id,
                "course_name": r.course_name, "credit_source": r.credit_source,
                "course_identifier": r.course_identifier, "credits_claimed": r.credits_claimed,
                "completion_info": r.completion_info, "document_reference": r.document_reference,
                "status": r.status, "proposed_mapping": r.proposed_mapping,
                "evaluation_result": r.evaluation_result, "admin_explanation": r.admin_explanation,
                "approved_credits": r.approved_credits,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            } for r in reqs
        ]
    }


@router.post("/credit-transfer")
def submit_credit_transfer(
    request: schemas.CreditTransferRequestCreate,
    current_user: models.UserAccount = Depends(auth.require_student),
    db: Session = Depends(get_db)
):
    student = _get_student(current_user, db)
    req_id = f"CTR{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:6].upper()}"

    cr = models.CreditTransferRequest(
        request_id=req_id, student_id=student.id,
        course_name=request.course_name, credit_source=request.credit_source,
        course_identifier=request.course_identifier, credits_claimed=request.credits_claimed,
        completion_info=request.completion_info, document_reference=request.document_reference,
        status="pending"
    )
    db.add(cr)
    db.add(models.Notification(
        student_id=student.id, title="Credit Transfer Request Submitted",
        message=f"Your credit transfer for '{request.course_name}' ({request.credits_claimed} credits via {request.credit_source}) has been submitted. ID: {req_id}",
        notification_type="success", related_request_id=req_id
    ))
    _add_audit(db, "student", student.demo_id, "credit_transfer_request_created",
               req_id, student.demo_id, None, "pending",
               f"Student submitted credit transfer for {request.course_name} ({request.credits_claimed} credits, {request.credit_source})")
    db.commit()
    db.refresh(cr)
    return {
        "id": cr.id, "request_id": cr.request_id, "student_id": cr.student_id,
        "course_name": cr.course_name, "credit_source": cr.credit_source,
        "course_identifier": cr.course_identifier, "credits_claimed": cr.credits_claimed,
        "status": cr.status, "approved_credits": cr.approved_credits,
        "created_at": cr.created_at.isoformat() if cr.created_at else None,
    }


@router.get("/notifications")
def get_notifications(current_user: models.UserAccount = Depends(auth.require_student), db: Session = Depends(get_db)):
    student = _get_student(current_user, db)
    notifs = db.query(models.Notification).filter(
        models.Notification.student_id == student.id
    ).order_by(models.Notification.created_at.desc()).limit(50).all()
    return [
        {
            "id": n.id, "student_id": n.student_id, "title": n.title,
            "message": n.message, "notification_type": n.notification_type,
            "is_read": n.is_read, "related_request_id": n.related_request_id,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        } for n in notifs
    ]


@router.post("/notifications/{notif_id}/read")
def mark_read(notif_id: int, current_user: models.UserAccount = Depends(auth.require_student), db: Session = Depends(get_db)):
    student = _get_student(current_user, db)
    n = db.query(models.Notification).filter(
        models.Notification.id == notif_id, models.Notification.student_id == student.id
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.get("/verification-history")
def get_verifications(current_user: models.UserAccount = Depends(auth.require_student), db: Session = Depends(get_db)):
    student = _get_student(current_user, db)
    records = db.query(models.VerificationRecord).filter(
        models.VerificationRecord.student_id == student.id
    ).order_by(models.VerificationRecord.created_at.desc()).all()
    return [
        {
            "id": r.id, "verification_id": r.verification_id, "request_type": r.request_type,
            "status": r.status, "result": r.result, "is_simulated": r.is_simulated,
            "explanation": r.explanation,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        } for r in records
    ]


@router.get("/report")
def download_report(current_user: models.UserAccount = Depends(auth.require_student), db: Session = Depends(get_db)):
    student = _get_student(current_user, db)
    credit_reqs = db.query(models.CreditTransferRequest).filter(models.CreditTransferRequest.student_id == student.id).all()
    admission_reqs = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == student.id).all()

    lines = [
        "NEXUS APAAR — STUDENT SUMMARY REPORT",
        "DEMO ENVIRONMENT — SYNTHETIC DATA ONLY",
        "=" * 60,
        f"Generated: {datetime.now().isoformat()}",
        "",
        "STUDENT INFORMATION",
        f"Name: {student.full_name}",
        f"Synthetic Demo ID: {student.demo_id}",
        f"Institution: {student.institution}",
        f"Department: {student.department}",
        f"Degree Programme: {student.degree_programme}",
        f"Academic Year: {student.academic_year}",
        f"Enrolment Status: {student.enrolment_status}",
        "",
        "ACADEMIC CREDITS",
        f"Credits Earned: {student.credits_earned}",
        f"Credits Required: {student.credits_required}",
        "",
        "ADMISSION REQUESTS",
    ]
    for ar in admission_reqs:
        prog = db.query(models.Programme).filter(models.Programme.id == ar.programme_id).first()
        lines.append(f"  Request ID: {ar.request_id} | Programme: {prog.name if prog else 'N/A'} | Status: {ar.status}")
        if ar.decision_reason:
            lines.append(f"  Decision: {ar.decision_reason}")
    lines += ["", "CREDIT TRANSFER HISTORY"]
    for cr in credit_reqs:
        lines.append(f"  {cr.request_id} | {cr.course_name} | {cr.credit_source} | {cr.credits_claimed} credits | Status: {cr.status}")
    lines += ["", "=" * 60, "This report contains synthetic demonstration data only.", "Not an official academic document."]

    content = "\n".join(lines)
    buf = io.BytesIO(content.encode("utf-8"))
    return StreamingResponse(buf, media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=nexusapaar_report_{student.demo_id}.txt"})
