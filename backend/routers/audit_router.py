from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import Optional
from datetime import datetime
import io, csv

router = APIRouter(prefix="/api/audit", tags=["Audit"])


@router.get("/events")
def list_events(
    event_type: Optional[str] = None, student_demo_id: Optional[str] = None,
    request_id: Optional[str] = None, page: int = 1, page_size: int = 50,
    current_user=Depends(auth.require_admin), db: Session = Depends(get_db)
):
    q = db.query(models.AuditEvent)
    if event_type:
        q = q.filter(models.AuditEvent.event_type == event_type)
    if student_demo_id:
        q = q.filter(models.AuditEvent.related_student_demo_id == student_demo_id)
    if request_id:
        q = q.filter(models.AuditEvent.related_request_id == request_id)
    total = q.count()
    events = q.order_by(models.AuditEvent.timestamp.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "events": [{
            "id": e.id, "event_id": e.event_id,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "actor_role": e.actor_role, "actor_reference": e.actor_reference,
            "event_type": e.event_type, "related_request_id": e.related_request_id,
            "related_student_demo_id": e.related_student_demo_id,
            "previous_state": e.previous_state, "new_state": e.new_state,
            "explanation": e.explanation,
        } for e in events],
        "total": total, "page": page, "page_size": page_size,
    }


@router.get("/export-csv")
def export_csv(current_user=Depends(auth.require_admin), db: Session = Depends(get_db)):
    events = db.query(models.AuditEvent).order_by(models.AuditEvent.timestamp.desc()).all()
    output = io.StringIO()
    w = csv.writer(output)
    w.writerow(["NEXUS APAAR - AUDIT LOG EXPORT (SYNTHETIC DEMO DATA)"])
    w.writerow(["Generated", datetime.now().isoformat()])
    w.writerow([])
    w.writerow(["Event ID", "Timestamp", "Actor Role", "Actor Reference", "Event Type",
                "Request ID", "Student Demo ID", "Previous State", "New State", "Explanation"])
    for e in events:
        w.writerow([e.event_id, e.timestamp.isoformat() if e.timestamp else "",
                    e.actor_role, e.actor_reference, e.event_type,
                    e.related_request_id or "", e.related_student_demo_id or "",
                    e.previous_state or "", e.new_state or "", e.explanation or ""])
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nexusapaar_audit_log.csv"})
