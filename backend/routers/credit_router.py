from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/credits", tags=["Credits"])


def _audit(db, actor_role, actor_ref, event_type, req_id=None, demo_id=None, prev=None, new=None, expl=None):
    db.add(models.AuditEvent(
        event_id=f"AUD{uuid.uuid4().hex[:12].upper()}",
        actor_role=actor_role, actor_reference=actor_ref, event_type=event_type,
        related_request_id=req_id, related_student_demo_id=demo_id,
        previous_state=prev, new_state=new, explanation=expl
    ))


@router.get("/")
def list_credit_requests(status_filter: Optional[str] = None, current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    q = db.query(models.CreditTransferRequest)
    if status_filter:
        q = q.filter(models.CreditTransferRequest.status == status_filter)
    reqs = q.order_by(models.CreditTransferRequest.created_at.desc()).all()
    result = []
    for r in reqs:
        s = db.query(models.Student).filter(models.Student.id == r.student_id).first()
        result.append({
            "id": r.id, "request_id": r.request_id, "student_id": r.student_id,
            "student_name": s.full_name if s else None,
            "student_demo_id": s.demo_id if s else None,
            "course_name": r.course_name, "credit_source": r.credit_source,
            "course_identifier": r.course_identifier, "credits_claimed": r.credits_claimed,
            "status": r.status, "proposed_mapping": r.proposed_mapping,
            "evaluation_result": r.evaluation_result, "admin_explanation": r.admin_explanation,
            "approved_credits": r.approved_credits,
            "completion_info": r.completion_info,
            "document_reference": r.document_reference,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result


@router.post("/{request_id}/review")
def review_credit(
    request_id: str,
    review: schemas.CreditReviewRequest,
    current_user=Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    req = db.query(models.CreditTransferRequest).filter(models.CreditTransferRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Credit transfer request not found")
    student = db.query(models.Student).filter(models.Student.id == req.student_id).first()
    prev = req.status
    now = datetime.utcnow()

    if review.action == "approve":
        req.status = "approved"
        req.approved_credits = review.approved_credits or req.credits_claimed
        req.proposed_mapping = review.proposed_mapping
        req.admin_explanation = review.admin_explanation
        req.reviewed_at = now
        if student:
            student.credits_earned += req.approved_credits
            db.add(models.Notification(
                student_id=student.id, title="Credit Transfer Approved",
                message=f"Your credit transfer for '{req.course_name}' has been approved. {req.approved_credits} credits added.",
                notification_type="success", related_request_id=request_id
            ))
        _audit(db, "admin", "collegeadmin", "credit_mapping_approved", request_id,
               student.demo_id if student else None, prev, "approved", review.admin_explanation)

    elif review.action == "reject":
        req.status = "rejected"; req.admin_explanation = review.admin_explanation
        req.approved_credits = 0; req.reviewed_at = now
        if student:
            db.add(models.Notification(
                student_id=student.id, title="Credit Transfer Rejected",
                message=f"Your credit transfer for '{req.course_name}' was rejected. Reason: {review.admin_explanation}",
                notification_type="error", related_request_id=request_id
            ))
        _audit(db, "admin", "collegeadmin", "credit_mapping_rejected", request_id,
               student.demo_id if student else None, prev, "rejected", review.admin_explanation)

    elif review.action == "request_info":
        req.status = "more_info_required"; req.admin_explanation = review.admin_explanation; req.reviewed_at = now
        if student:
            db.add(models.Notification(
                student_id=student.id, title="Credit Transfer: More Information Required",
                message=f"Your credit transfer for '{req.course_name}' needs more info: {review.admin_explanation}",
                notification_type="warning", related_request_id=request_id
            ))
        _audit(db, "admin", "collegeadmin", "credit_info_requested", request_id,
               student.demo_id if student else None, prev, "more_info_required", review.admin_explanation)

    db.commit()
    return {"message": f"Credit request {review.action}d", "request_id": request_id, "new_status": req.status}
