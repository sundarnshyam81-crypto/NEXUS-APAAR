from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from database import get_db
import models, schemas, auth
from typing import Optional
from datetime import datetime
import io, csv, uuid

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard", response_model=schemas.DashboardMetrics)
def get_dashboard(current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    total_students = db.query(models.Student).count()
    total_requests = db.query(models.AdmissionRequest).count()
    approved = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.status == "approved").count()
    pending = db.query(models.AdmissionRequest).filter(
        models.AdmissionRequest.status.in_(["submitted", "pending_review", "more_info_required"])).count()
    blocked_rej = db.query(models.AdmissionRequest).filter(
        models.AdmissionRequest.status.in_(["blocked", "rejected"])).count()
    pending_credits = db.query(models.CreditTransferRequest).filter(
        models.CreditTransferRequest.status.in_(["pending", "under_review"])).count()
    total_seats = db.query(func.sum(models.Programme.approved_intake)).scalar() or 0
    total_enrolled = db.query(func.sum(models.Programme.current_enrolled)).scalar() or 0
    v_passed = db.query(models.VerificationRecord).filter(
        models.VerificationRecord.result.in_(["passed", "simulated_pass"])).count()
    v_failed = db.query(models.VerificationRecord).filter(
        models.VerificationRecord.result.in_(["failed", "simulated_fail"])).count()
    v_pending = db.query(models.VerificationRecord).filter(
        models.VerificationRecord.status.in_(["not_started", "in_progress"])).count()
    return schemas.DashboardMetrics(
        total_students=total_students, total_admission_requests=total_requests,
        approved_applications=approved, pending_applications=pending,
        blocked_rejected_applications=blocked_rej, pending_credit_requests=pending_credits,
        total_approved_seats=int(total_seats), total_occupied_seats=int(total_enrolled),
        total_available_seats=int(total_seats) - int(total_enrolled),
        verification_passed=v_passed, verification_failed=v_failed, verification_pending=v_pending
    )


@router.get("/students")
def list_students(
    search: Optional[str] = None, department: Optional[str] = None,
    academic_year: Optional[str] = None, admission_status: Optional[str] = None,
    page: int = 1, page_size: int = 20,
    current_user=Depends(auth.require_admin), db: Session = Depends(get_db)
):
    query = db.query(models.Student)
    if search:
        query = query.filter(or_(
            models.Student.full_name.ilike(f"%{search}%"),
            models.Student.demo_id.ilike(f"%{search}%")
        ))
    if department:
        query = query.filter(models.Student.department == department)
    if academic_year:
        query = query.filter(models.Student.academic_year == academic_year)

    total = query.count()
    students = query.offset((page - 1) * page_size).limit(page_size).all()
    result = []
    for s in students:
        latest_ar = db.query(models.AdmissionRequest).filter(
            models.AdmissionRequest.student_id == s.id
        ).order_by(models.AdmissionRequest.created_at.desc()).first()
        pending_cr = db.query(models.CreditTransferRequest).filter(
            models.CreditTransferRequest.student_id == s.id,
            models.CreditTransferRequest.status.in_(["pending", "under_review"])
        ).count()
        row = {
            "id": s.id, "demo_id": s.demo_id, "full_name": s.full_name,
            "department": s.department, "academic_year": s.academic_year,
            "enrolment_status": s.enrolment_status,
            "admission_status": latest_ar.status if latest_ar else "no_request",
            "credit_status": "pending_review" if pending_cr > 0 else "up_to_date",
            "credits_earned": s.credits_earned, "degree_programme": s.degree_programme,
            "institution": s.institution,
        }
        result.append(row)
    if admission_status:
        result = [r for r in result if r["admission_status"] == admission_status]
    return {"students": result, "total": total, "page": page, "page_size": page_size}


@router.get("/students/{student_id}")
def get_student_detail(student_id: int, current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    ars = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == s.id).all()
    crs = db.query(models.CreditTransferRequest).filter(models.CreditTransferRequest.student_id == s.id).all()
    vers = db.query(models.VerificationRecord).filter(models.VerificationRecord.student_id == s.id).order_by(models.VerificationRecord.created_at.desc()).all()
    audits = db.query(models.AuditEvent).filter(models.AuditEvent.related_student_demo_id == s.demo_id).order_by(models.AuditEvent.timestamp.desc()).limit(20).all()
    return {
        "student": {
            "id": s.id, "demo_id": s.demo_id, "full_name": s.full_name,
            "institution": s.institution, "department": s.department,
            "degree_programme": s.degree_programme, "academic_year": s.academic_year,
            "enrolment_status": s.enrolment_status,
            "credits_earned": s.credits_earned, "credits_required": s.credits_required,
        },
        "admission_requests": [{
            "request_id": ar.request_id, "status": ar.status,
            "programme_id": ar.programme_id,
            "created_at": ar.created_at.isoformat() if ar.created_at else None,
            "decision_reason": ar.decision_reason,
            "has_conflicting_enrolment": ar.has_conflicting_enrolment,
            "seat_allocated": ar.seat_allocated,
            "stage1_status": ar.stage1_status, "stage2_status": ar.stage2_status,
            "stage3_status": ar.stage3_status, "stage4_status": ar.stage4_status,
            "stage5_status": ar.stage5_status,
        } for ar in ars],
        "credit_requests": [{
            "request_id": cr.request_id, "course_name": cr.course_name,
            "credit_source": cr.credit_source, "credits_claimed": cr.credits_claimed,
            "status": cr.status, "approved_credits": cr.approved_credits,
            "admin_explanation": cr.admin_explanation,
            "created_at": cr.created_at.isoformat() if cr.created_at else None,
        } for cr in crs],
        "verifications": [{
            "verification_id": v.verification_id, "request_type": v.request_type,
            "status": v.status, "result": v.result, "is_simulated": v.is_simulated,
            "explanation": v.explanation,
            "created_at": v.created_at.isoformat() if v.created_at else None,
            "completed_at": v.completed_at.isoformat() if v.completed_at else None,
        } for v in vers],
        "audit_events": [{
            "event_id": ae.event_id,
            "timestamp": ae.timestamp.isoformat() if ae.timestamp else None,
            "actor_role": ae.actor_role, "event_type": ae.event_type,
            "previous_state": ae.previous_state, "new_state": ae.new_state,
            "explanation": ae.explanation,
        } for ae in audits],
    }


@router.get("/export-report")
def export_report(current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    output = io.StringIO()
    w = csv.writer(output)
    w.writerow(["NEXUS APAAR - SYNTHETIC DEMO DATA EXPORT"])
    w.writerow(["Generated", datetime.now().isoformat()])
    w.writerow([])
    w.writerow(["Demo ID", "Name", "Department", "Academic Year", "Credits Earned", "Enrolment Status", "Admission Status"])
    for s in students:
        ar = db.query(models.AdmissionRequest).filter(models.AdmissionRequest.student_id == s.id).order_by(models.AdmissionRequest.created_at.desc()).first()
        w.writerow([s.demo_id, s.full_name, s.department, s.academic_year, s.credits_earned, s.enrolment_status, ar.status if ar else "no_request"])
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nexusapaar_demo_export.csv"})
