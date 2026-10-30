from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from database import get_db
import auth
import models
import schemas


router = APIRouter(prefix="/api/aicte", tags=["AICTE Administration"])


def _date(value):
    return value.isoformat() if value else None


def _institution_record(institution):
    approved_courses = [
        course for course in institution.courses
        if course.approval_status == "approved"
    ]
    return {
        "id": institution.id,
        "institution_id": institution.institution_id,
        "name": institution.name,
        "state": institution.state,
        "district": institution.district,
        "institution_type": institution.institution_type,
        "approval_status": institution.approval_status,
        "approved_courses": len(approved_courses),
        "approved_intake": sum(course.approved_intake for course in approved_courses),
        "created_at": _date(institution.created_at),
    }


def _application_record(application, include_reviews=False):
    record = {
        "id": application.id,
        "application_id": application.application_id,
        "institution": _institution_record(application.institution),
        "submission_date": _date(application.submission_date),
        "status": application.status,
        "submitted_by": application.submitted_by,
        "updated_at": _date(application.updated_at),
    }
    if include_reviews:
        record["review_history"] = [
            {
                "id": review.id,
                "administrator": review.administrator,
                "previous_status": review.previous_status,
                "new_status": review.new_status,
                "notes": review.notes,
                "created_at": _date(review.created_at),
            }
            for review in application.reviews
        ]
    return record


def _write_audit(db, administrator, activity, institution, action):
    db.add(models.AicteAuditLog(
        administrator=administrator.username,
        activity=activity,
        institution_id=institution.id if institution else None,
        institution_name=institution.name if institution else None,
        action=action,
    ))


@router.get("/dashboard")
def dashboard(
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    institutions = db.query(models.AicteInstitution).options(
        joinedload(models.AicteInstitution.courses)
    ).all()
    applications = db.query(models.AicteApprovalApplication).options(
        joinedload(models.AicteApprovalApplication.institution)
    ).order_by(models.AicteApprovalApplication.submission_date.desc()).all()
    compliance = db.query(models.AicteComplianceSubmission).all()
    approved_courses = db.query(models.AicteCourse).filter(
        models.AicteCourse.approval_status == "approved"
    )
    pending_applications = [
        application for application in applications
        if application.status in ["pending", "under_review"]
    ]
    pending_compliance = [
        submission for submission in compliance
        if submission.status in ["pending", "under_review"]
    ]

    return {
        "is_demo": True,
        "data_notice": "Synthetic demonstration records only; not verified official AICTE data.",
        "metrics": {
            "total_institutions": len(institutions),
            "approved_institutions": sum(i.approval_status == "approved" for i in institutions),
            "pending_applications": sum(a.status in ["pending", "under_review"] for a in applications),
            "rejected_applications": sum(a.status == "rejected" for a in applications),
            "approved_courses": approved_courses.count(),
            "approved_intake": approved_courses.with_entities(
                func.coalesce(func.sum(models.AicteCourse.approved_intake), 0)
            ).scalar(),
            "pending_compliance": len(pending_compliance),
            "overdue_compliance": sum(c.status == "overdue" for c in compliance),
        },
        "state_distribution": [
            {"state": state, "institutions": count}
            for state, count in db.query(
                models.AicteInstitution.state,
                func.count(models.AicteInstitution.id),
            ).group_by(models.AicteInstitution.state).order_by(
                func.count(models.AicteInstitution.id).desc()
            ).all()
        ],
        "recent_applications": [
            _application_record(application)
            for application in applications[:5]
        ],
        "pending_requests": [
            _application_record(application)
            for application in pending_applications[:5]
        ],
        "notifications": [
            {
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "notification_type": notification.notification_type,
                "is_read": notification.is_read,
                "created_at": _date(notification.created_at),
            }
            for notification in db.query(models.AicteNotification).order_by(
                models.AicteNotification.created_at.desc()
            ).limit(5).all()
        ],
    }


@router.get("/institutions")
def list_institutions(
    search: Optional[str] = None,
    state: Optional[str] = None,
    institution_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.AicteInstitution).options(
        joinedload(models.AicteInstitution.courses)
    )
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(
            models.AicteInstitution.name.ilike(term),
            models.AicteInstitution.institution_id.ilike(term),
            models.AicteInstitution.district.ilike(term),
        ))
    if state:
        query = query.filter(models.AicteInstitution.state == state)
    if institution_type:
        query = query.filter(models.AicteInstitution.institution_type == institution_type)
    if status_filter:
        query = query.filter(models.AicteInstitution.approval_status == status_filter)
    total = query.count()
    records = query.order_by(models.AicteInstitution.name).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    return {"institutions": [_institution_record(i) for i in records], "total": total, "page": page, "page_size": page_size}


@router.get(
    "/institutions/{institution_id}/overview",
    response_model=schemas.AicteInstitutionOverviewResponse,
)
def institution_overview(
    institution_id: int,
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    institution = db.query(models.AicteInstitution).filter(
        models.AicteInstitution.id == institution_id
    ).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    profile = db.query(models.AicteInstitutionProfile).filter(
        models.AicteInstitutionProfile.institution_id == institution.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Institution overview not found")

    courses = db.query(models.AicteCourse).filter(
        models.AicteCourse.institution_id == institution.id,
        models.AicteCourse.approval_status == "approved",
    ).order_by(models.AicteCourse.course_name).all()
    departments = db.query(models.AicteInstitutionDepartment).filter(
        models.AicteInstitutionDepartment.institution_id == institution.id
    ).order_by(models.AicteInstitutionDepartment.department_name).all()
    outcomes = db.query(models.AicteInstitutionOutcome).filter(
        models.AicteInstitutionOutcome.institution_id == institution.id
    ).order_by(models.AicteInstitutionOutcome.academic_year.desc()).limit(3).all()
    rankings = db.query(models.AicteInstitutionRanking).filter(
        models.AicteInstitutionRanking.institution_id == institution.id
    ).order_by(models.AicteInstitutionRanking.year.desc()).limit(2).all()
    compliance = db.query(models.AicteComplianceSubmission).filter(
        models.AicteComplianceSubmission.institution_id == institution.id
    ).all()
    decisions = db.query(models.AicteAuditLog).filter(
        models.AicteAuditLog.institution_id == institution.id
    ).order_by(models.AicteAuditLog.created_at.desc()).limit(8).all()

    latest_outcome = outcomes[0] if outcomes else None
    latest_ranking = rankings[0] if rankings else None
    previous_ranking = rankings[1] if len(rankings) > 1 else None

    return {
        "profile": {
            "institution_id": institution.institution_id,
            "display_name": profile.display_name,
            "institution_type": profile.institution_type,
            "ownership": profile.ownership,
            "affiliating_body": profile.affiliating_body,
            "approval_status": institution.approval_status,
        },
        "location": {
            "address_line": profile.address_line,
            "city": profile.city,
            "district": institution.district,
            "state": institution.state,
            "pincode": profile.pincode,
            "region": profile.region,
            "latitude": profile.latitude,
            "longitude": profile.longitude,
        },
        "key_dates": {
            "established_year": profile.established_year,
            "registered_with_aicte_date": profile.registered_with_aicte_date,
            "approval_valid_from": profile.approval_valid_from,
            "approval_valid_until": profile.approval_valid_until,
            "last_inspection_date": profile.last_inspection_date,
        },
        "study_model": {
            "study_modes": profile.study_modes,
            "medium_of_instruction": profile.medium_of_instruction,
            "academic_structure": profile.academic_structure,
            "programme_levels": profile.programme_levels,
            "abc_integration": profile.abc_integration,
            "facilities_summary": profile.facilities_summary,
        },
        "limits": {
            "total_approved_intake": profile.total_approved_intake,
            "maximum_permitted_intake": profile.maximum_permitted_intake,
            "current_enrolled": profile.current_enrolled,
            "utilisation_pct": round(
                profile.current_enrolled / profile.total_approved_intake * 100, 1
            ) if profile.total_approved_intake else 0.0,
            "programme_intakes": [
                {
                    "programme": course.course_name,
                    "department": course.department,
                    "programme_level": course.programme_level,
                    "approved_intake": course.approved_intake,
                }
                for course in courses
            ],
            "approval_conditions": profile.approval_conditions,
        },
        "departments": [
            {
                "department_name": department.department_name,
                "programmes": department.programmes,
                "hod_role_label": department.hod_role_label,
                "approved_intake": department.approved_intake,
                "enrolled": department.enrolled,
                "faculty_count": department.faculty_count,
                "established_year": department.established_year,
            }
            for department in departments
        ],
        "outcomes": [
            {
                "academic_year": outcome.academic_year,
                "graduates": outcome.graduates,
                "pass_percentage": outcome.pass_percentage,
                "placement_percentage": outcome.placement_percentage,
            }
            for outcome in reversed(outcomes)
        ],
        "passouts_last_year": latest_outcome.graduates if latest_outcome else 0,
        "ranking": {
            "year": latest_ranking.year,
            "demo_rank": latest_ranking.demo_rank,
            "category": latest_ranking.category,
            "score": latest_ranking.score,
            "previous_year_rank": previous_ranking.demo_rank if previous_ranking else None,
            "rank_change": (
                previous_ranking.demo_rank - latest_ranking.demo_rank
                if previous_ranking else None
            ),
        } if latest_ranking else None,
        "compliance_snapshot": {
            "pending": sum(item.status in ["pending", "under_review"] for item in compliance),
            "submitted": sum(
                item.status == "completed" or item.submitted_at is not None
                for item in compliance
            ),
            "overdue": sum(item.status == "overdue" for item in compliance),
        },
        "recent_decisions": [
            {
                "activity": decision.activity,
                "administrator": decision.administrator,
                "action": {
                    "institution_approval_review": "Institution approval decision recorded",
                    "compliance_submission_review": "Institution compliance review recorded",
                }.get(decision.activity, "Institutional administrative action recorded"),
                "timestamp": decision.created_at,
            }
            for decision in decisions
        ],
        "synthetic_notice": "Synthetic demo data. Not verified official AICTE data.",
    }


@router.get("/institutions/{institution_id}")
def institution_detail(
    institution_id: int,
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    institution = db.query(models.AicteInstitution).options(
        joinedload(models.AicteInstitution.courses),
        joinedload(models.AicteInstitution.applications).joinedload(models.AicteApprovalApplication.reviews),
        joinedload(models.AicteInstitution.compliance_submissions),
    ).filter(models.AicteInstitution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    return {
        **_institution_record(institution),
        "courses": [
            {
                "id": course.id,
                "course_code": course.course_code,
                "department": course.department,
                "course_name": course.course_name,
                "programme_level": course.programme_level,
                "approved_intake": course.approved_intake,
                "academic_year": course.academic_year,
                "approval_status": course.approval_status,
            }
            for course in institution.courses
        ],
        "applications": [
            _application_record(application, include_reviews=True)
            for application in sorted(
                institution.applications,
                key=lambda item: item.submission_date or datetime.min,
                reverse=True,
            )
        ],
        "compliance_submissions": [
            {
                "submission_id": item.submission_id,
                "report_type": item.report_type,
                "academic_year": item.academic_year,
                "due_date": _date(item.due_date),
                "submitted_at": _date(item.submitted_at),
                "status": item.status,
                "review_notes": item.review_notes,
            }
            for item in institution.compliance_submissions
        ],
    }


@router.get("/applications")
def list_applications(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.AicteApprovalApplication).options(
        joinedload(models.AicteApprovalApplication.institution)
    )
    if status_filter:
        query = query.filter(models.AicteApprovalApplication.status == status_filter)
    if search:
        term = f"%{search.strip()}%"
        query = query.join(models.AicteInstitution).filter(or_(
            models.AicteApprovalApplication.application_id.ilike(term),
            models.AicteInstitution.name.ilike(term),
            models.AicteInstitution.institution_id.ilike(term),
        ))
    total = query.count()
    records = query.order_by(
        models.AicteApprovalApplication.submission_date.desc()
    ).offset((page - 1) * page_size).limit(page_size).all()
    return {"applications": [_application_record(a, True) for a in records], "total": total, "page": page, "page_size": page_size}


@router.get("/applications/{application_id}")
def application_detail(
    application_id: int,
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    application = db.query(models.AicteApprovalApplication).options(
        joinedload(models.AicteApprovalApplication.institution).joinedload(models.AicteInstitution.courses),
        joinedload(models.AicteApprovalApplication.reviews),
    ).filter(models.AicteApprovalApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Approval application not found")
    return _application_record(application, True)


@router.post("/applications/{application_id}/review")
def review_application(
    application_id: int,
    request: schemas.AicteApplicationReviewRequest,
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    application = db.query(models.AicteApprovalApplication).options(
        joinedload(models.AicteApprovalApplication.institution)
    ).filter(models.AicteApprovalApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Approval application not found")

    previous_status = application.status
    application.status = request.status
    application.updated_at = datetime.utcnow()
    if request.status in ["approved", "rejected"]:
        application.institution.approval_status = request.status
    elif application.institution.approval_status != "approved":
        application.institution.approval_status = request.status
    db.add(models.AicteApplicationReview(
        application_id=application.id,
        administrator=current_user.username,
        previous_status=previous_status,
        new_status=request.status,
        notes=request.notes.strip(),
    ))
    _write_audit(
        db, current_user, "institution_approval_review", application.institution,
        f"{application.application_id}: {previous_status} → {request.status}. {request.notes.strip()}",
    )
    db.add(models.AicteNotification(
        title="Institution approval updated",
        message=f"{application.institution.name}: application {application.application_id} is now {request.status}.",
        notification_type="approval",
    ))
    db.commit()
    db.refresh(application)
    return _application_record(application, True)


@router.get("/courses")
def list_courses(
    search: Optional[str] = None,
    state: Optional[str] = None,
    programme_level: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.AicteCourse).join(
        models.AicteInstitution
    ).options(joinedload(models.AicteCourse.institution))
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(
            models.AicteCourse.course_name.ilike(term),
            models.AicteCourse.course_code.ilike(term),
            models.AicteCourse.department.ilike(term),
            models.AicteInstitution.name.ilike(term),
        ))
    if state:
        query = query.filter(models.AicteInstitution.state == state)
    if programme_level:
        query = query.filter(models.AicteCourse.programme_level == programme_level)
    if status_filter:
        query = query.filter(models.AicteCourse.approval_status == status_filter)
    records = query.order_by(models.AicteInstitution.name, models.AicteCourse.course_name).all()
    return {
        "courses": [
            {
                "id": course.id,
                "course_code": course.course_code,
                "institution": course.institution.name,
                "institution_pk": course.institution.id,
                "institution_id": course.institution.institution_id,
                "state": course.institution.state,
                "department": course.department,
                "course_name": course.course_name,
                "programme_level": course.programme_level,
                "approved_intake": course.approved_intake,
                "academic_year": course.academic_year,
                "approval_status": course.approval_status,
            }
            for course in records
        ],
        "total": len(records),
    }


@router.get("/compliance")
def list_compliance(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    institution_id: Optional[int] = Query(None, ge=1),
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.AicteComplianceSubmission).options(
        joinedload(models.AicteComplianceSubmission.institution)
    )
    if status_filter:
        query = query.filter(models.AicteComplianceSubmission.status == status_filter)
    if institution_id is not None:
        query = query.filter(models.AicteComplianceSubmission.institution_id == institution_id)
    if search:
        term = f"%{search.strip()}%"
        query = query.join(models.AicteInstitution).filter(or_(
            models.AicteComplianceSubmission.submission_id.ilike(term),
            models.AicteComplianceSubmission.report_type.ilike(term),
            models.AicteInstitution.name.ilike(term),
        ))
    records = query.order_by(models.AicteComplianceSubmission.due_date).all()
    all_submissions = db.query(models.AicteComplianceSubmission).all()
    return {
        "submissions": [
            {
                "id": item.id,
                "submission_id": item.submission_id,
                "institution": item.institution.name,
                "institution_pk": item.institution.id,
                "institution_id": item.institution.institution_id,
                "state": item.institution.state,
                "report_type": item.report_type,
                "academic_year": item.academic_year,
                "due_date": _date(item.due_date),
                "submitted_at": _date(item.submitted_at),
                "status": item.status,
                "review_notes": item.review_notes,
            }
            for item in records
        ],
        "summary": {
            "total": len(all_submissions),
            "completed": sum(item.status == "completed" for item in all_submissions),
            "pending": sum(item.status in ["pending", "under_review"] for item in all_submissions),
            "overdue": sum(item.status == "overdue" for item in all_submissions),
        },
    }


@router.post("/compliance/{submission_id}/review")
def review_compliance(
    submission_id: int,
    request: schemas.AicteComplianceReviewRequest,
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    submission = db.query(models.AicteComplianceSubmission).options(
        joinedload(models.AicteComplianceSubmission.institution)
    ).filter(models.AicteComplianceSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Compliance submission not found")
    previous_status = submission.status
    submission.status = request.status
    submission.review_notes = request.notes.strip()
    if request.status == "completed" and not submission.submitted_at:
        submission.submitted_at = datetime.utcnow()
    _write_audit(
        db, current_user, "compliance_submission_review", submission.institution,
        f"{submission.submission_id}: {previous_status} → {request.status}. {request.notes.strip()}",
    )
    db.commit()
    return {"submission_id": submission.submission_id, "status": submission.status, "review_notes": submission.review_notes}


@router.get("/analytics")
def analytics(
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    states = db.query(
        models.AicteInstitution.state,
        func.count(models.AicteInstitution.id),
    ).group_by(models.AicteInstitution.state).order_by(
        func.count(models.AicteInstitution.id).desc()
    ).all()
    statuses = db.query(
        models.AicteInstitution.approval_status,
        func.count(models.AicteInstitution.id),
    ).group_by(models.AicteInstitution.approval_status).all()
    levels = db.query(
        models.AicteCourse.programme_level,
        func.count(models.AicteCourse.id),
    ).group_by(models.AicteCourse.programme_level).all()
    intake_by_state = db.query(
        models.AicteInstitution.state,
        func.coalesce(func.sum(models.AicteCourse.approved_intake), 0),
    ).join(models.AicteCourse).filter(
        models.AicteCourse.approval_status == "approved"
    ).group_by(models.AicteInstitution.state).order_by(
        func.sum(models.AicteCourse.approved_intake).desc()
    ).all()
    monthly = db.query(
        func.strftime("%Y-%m", models.AicteApprovalApplication.submission_date),
        func.count(models.AicteApprovalApplication.id),
    ).group_by(func.strftime("%Y-%m", models.AicteApprovalApplication.submission_date)).order_by(
        func.strftime("%Y-%m", models.AicteApprovalApplication.submission_date)
    ).all()
    return {
        "is_demo": True,
        "state_distribution": [{"state": state, "institutions": count} for state, count in states],
        "institution_status": [{"status": status, "count": count} for status, count in statuses],
        "course_distribution": [{"programme_level": level, "courses": count} for level, count in levels],
        "approved_intake_by_state": [{"state": state, "intake": int(intake)} for state, intake in intake_by_state],
        "approval_trend": [{"month": month, "applications": count} for month, count in monthly],
    }


@router.get("/notifications")
def list_notifications(
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    notifications = db.query(models.AicteNotification).order_by(
        models.AicteNotification.created_at.desc()
    ).all()
    return [
        {
            "id": item.id,
            "title": item.title,
            "message": item.message,
            "notification_type": item.notification_type,
            "is_read": item.is_read,
            "created_at": _date(item.created_at),
        }
        for item in notifications
    ]


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    notification = db.query(models.AicteNotification).filter(
        models.AicteNotification.id == notification_id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    return {"id": notification.id, "is_read": notification.is_read}


@router.get("/audit")
def list_aicte_audit(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: models.UserAccount = Depends(auth.require_aicte_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.AicteAuditLog)
    total = query.count()
    events = query.order_by(models.AicteAuditLog.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    return {
        "events": [
            {
                "id": event.id,
                "administrator": event.administrator,
                "activity": event.activity,
                "institution": event.institution_name,
                "action": event.action,
                "timestamp": _date(event.created_at),
            }
            for event in events
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }
