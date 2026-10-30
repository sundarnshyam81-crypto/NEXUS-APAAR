from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    demo_id = Column(String(12), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    institution = Column(String(200), default="Demo Engineering College")
    department = Column(String(50), nullable=False)
    degree_programme = Column(String(100), nullable=False)
    academic_year = Column(String(10), nullable=False)
    enrolment_status = Column(String(30), default="active")
    credits_earned = Column(Integer, default=0)
    credits_required = Column(Integer, default=160)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("UserAccount", back_populates="student", uselist=False)
    admission_requests = relationship("AdmissionRequest", back_populates="student")
    credit_requests = relationship("CreditTransferRequest", back_populates="student")
    verifications = relationship("VerificationRecord", back_populates="student")
    notifications = relationship("Notification", back_populates="student")


class UserAccount(Base):
    __tablename__ = "user_accounts"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_pin = Column(String(200), nullable=False)
    role = Column(String(20), default="student")
    is_active = Column(Boolean, default=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="user")


class Programme(Base):
    __tablename__ = "programmes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False)
    approved_intake = Column(Integer, nullable=False)
    current_enrolled = Column(Integer, default=0)
    institution = Column(String(200), default="Demo Engineering College")

    admission_requests = relationship("AdmissionRequest", back_populates="programme")


class AdmissionRequest(Base):
    __tablename__ = "admission_requests"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(20), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    programme_id = Column(Integer, ForeignKey("programmes.id"), nullable=False)
    status = Column(String(30), default="submitted")
    stage1_status = Column(String(30), default="completed")
    stage2_status = Column(String(30), default="pending")
    stage3_status = Column(String(30), default="pending")
    stage4_status = Column(String(30), default="pending")
    stage5_status = Column(String(30), default="pending")
    stage1_submitted_at = Column(DateTime(timezone=True), nullable=True)
    stage2_verified_at = Column(DateTime(timezone=True), nullable=True)
    stage3_capacity_checked_at = Column(DateTime(timezone=True), nullable=True)
    stage4_credit_mapped_at = Column(DateTime(timezone=True), nullable=True)
    stage5_decided_at = Column(DateTime(timezone=True), nullable=True)
    decision_reason = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    has_conflicting_enrolment = Column(Boolean, default=False)
    seat_allocated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student = relationship("Student", back_populates="admission_requests")
    programme = relationship("Programme", back_populates="admission_requests")


class CreditTransferRequest(Base):
    __tablename__ = "credit_transfer_requests"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(20), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_name = Column(String(200), nullable=False)
    credit_source = Column(String(20), nullable=False)
    course_identifier = Column(String(100), nullable=False)
    credits_claimed = Column(Integer, nullable=False)
    completion_info = Column(Text, nullable=True)
    document_reference = Column(String(200), nullable=True)
    status = Column(String(30), default="pending")
    proposed_mapping = Column(String(200), nullable=True)
    evaluation_result = Column(Text, nullable=True)
    admin_explanation = Column(Text, nullable=True)
    approved_credits = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("Student", back_populates="credit_requests")


class VerificationRecord(Base):
    __tablename__ = "verification_records"
    id = Column(Integer, primary_key=True, index=True)
    verification_id = Column(String(20), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    request_type = Column(String(50), default="enrolment_check")
    status = Column(String(30), default="not_started")
    result = Column(String(30), nullable=True)
    is_simulated = Column(Boolean, default=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("Student", back_populates="verifications")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    related_request_id = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="notifications")


class AuditEvent(Base):
    __tablename__ = "audit_events"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(20), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    actor_role = Column(String(20), nullable=False)
    actor_reference = Column(String(100), nullable=False)
    event_type = Column(String(100), nullable=False)
    related_request_id = Column(String(20), nullable=True)
    related_student_demo_id = Column(String(12), nullable=True)
    previous_state = Column(String(50), nullable=True)
    new_state = Column(String(50), nullable=True)
    explanation = Column(Text, nullable=True)


class SeatAllocation(Base):
    __tablename__ = "seat_allocations"
    id = Column(Integer, primary_key=True, index=True)
    programme_id = Column(Integer, ForeignKey("programmes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    admission_request_id = Column(String(20), nullable=True)
    allocated_at = Column(DateTime(timezone=True), server_default=func.now())

    programme = relationship("Programme")
    student = relationship("Student")


class AicteInstitution(Base):
    __tablename__ = "aicte_institutions"
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    state = Column(String(80), nullable=False)
    district = Column(String(100), nullable=False)
    institution_type = Column(String(60), nullable=False)
    approval_status = Column(String(30), default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    applications = relationship("AicteApprovalApplication", back_populates="institution")
    courses = relationship("AicteCourse", back_populates="institution")
    compliance_submissions = relationship("AicteComplianceSubmission", back_populates="institution")


class AicteApprovalApplication(Base):
    __tablename__ = "aicte_approval_applications"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(30), unique=True, index=True, nullable=False)
    institution_id = Column(Integer, ForeignKey("aicte_institutions.id"), nullable=False)
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(30), default="pending", nullable=False)
    submitted_by = Column(String(100), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    institution = relationship("AicteInstitution", back_populates="applications")
    reviews = relationship(
        "AicteApplicationReview",
        back_populates="application",
        order_by="AicteApplicationReview.created_at.desc()",
    )


class AicteApplicationReview(Base):
    __tablename__ = "aicte_application_reviews"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("aicte_approval_applications.id"), nullable=False)
    administrator = Column(String(100), nullable=False)
    previous_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("AicteApprovalApplication", back_populates="reviews")


class AicteCourse(Base):
    __tablename__ = "aicte_courses"
    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String(30), unique=True, index=True, nullable=False)
    institution_id = Column(Integer, ForeignKey("aicte_institutions.id"), nullable=False)
    department = Column(String(100), nullable=False)
    course_name = Column(String(200), nullable=False)
    programme_level = Column(String(50), nullable=False)
    approved_intake = Column(Integer, nullable=False)
    academic_year = Column(String(20), nullable=False)
    approval_status = Column(String(30), default="approved", nullable=False)

    institution = relationship("AicteInstitution", back_populates="courses")


class AicteComplianceSubmission(Base):
    __tablename__ = "aicte_compliance_submissions"
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(String(30), unique=True, index=True, nullable=False)
    institution_id = Column(Integer, ForeignKey("aicte_institutions.id"), nullable=False)
    report_type = Column(String(120), nullable=False)
    academic_year = Column(String(20), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(30), default="pending", nullable=False)
    review_notes = Column(Text, nullable=True)

    institution = relationship("AicteInstitution", back_populates="compliance_submissions")


class AicteNotification(Base):
    __tablename__ = "aicte_notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(40), default="info", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AicteAuditLog(Base):
    __tablename__ = "aicte_audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    administrator = Column(String(100), nullable=False)
    activity = Column(String(120), nullable=False)
    institution_id = Column(Integer, ForeignKey("aicte_institutions.id"), nullable=True)
    institution_name = Column(String(200), nullable=True)
    action = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
