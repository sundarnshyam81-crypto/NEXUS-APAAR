from pydantic import BaseModel, field_validator, Field
from typing import Optional, List
from datetime import datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    demo_id: Optional[str] = None
    full_name: Optional[str] = None


class StudentLoginRequest(BaseModel):
    demo_id: str = Field(..., description="12-digit synthetic demo identifier")
    demo_pin: str = Field(..., description="Demo PIN")

    @field_validator("demo_id")
    @classmethod
    def validate_demo_id(cls, v):
        if not v.isdigit():
            raise ValueError("Demo ID must contain only digits")
        if len(v) != 12:
            raise ValueError("Demo ID must be exactly 12 digits")
        return v


class AdminLoginRequest(BaseModel):
    admin_id: str
    password: str


class AicteAdminLoginRequest(BaseModel):
    admin_id: str
    password: str


class AicteApplicationReviewRequest(BaseModel):
    status: str
    notes: str = Field(..., min_length=5, max_length=2000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value not in ["under_review", "approved", "rejected"]:
            raise ValueError("Status must be under_review, approved, or rejected")
        return value


class AicteComplianceReviewRequest(BaseModel):
    status: str
    notes: str = Field(..., min_length=5, max_length=2000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value not in ["under_review", "completed", "pending", "overdue"]:
            raise ValueError("Invalid compliance status")
        return value


class StudentProfileResponse(BaseModel):
    id: int
    demo_id: str
    full_name: str
    institution: str
    department: str
    degree_programme: str
    academic_year: str
    enrolment_status: str
    credits_earned: int
    credits_required: int

    model_config = {"from_attributes": True}


class AdmissionRequestResponse(BaseModel):
    id: int
    request_id: str
    student_id: int
    programme_id: int
    programme_name: Optional[str] = None
    department: Optional[str] = None
    status: str
    stage1_status: str
    stage2_status: str
    stage3_status: str
    stage4_status: str
    stage5_status: str
    stage1_submitted_at: Optional[datetime] = None
    stage2_verified_at: Optional[datetime] = None
    stage3_capacity_checked_at: Optional[datetime] = None
    stage4_credit_mapped_at: Optional[datetime] = None
    stage5_decided_at: Optional[datetime] = None
    decision_reason: Optional[str] = None
    has_conflicting_enrolment: bool = False
    seat_allocated: bool = False
    created_at: datetime
    student_name: Optional[str] = None
    student_demo_id: Optional[str] = None

    model_config = {"from_attributes": True}


class CreditTransferRequestCreate(BaseModel):
    course_name: str = Field(..., min_length=2, max_length=200)
    credit_source: str = Field(..., description="ABC, SWAYAM, or NPTEL")
    course_identifier: str = Field(..., min_length=2, max_length=100)
    credits_claimed: int = Field(..., ge=1, le=20)
    completion_info: Optional[str] = None
    document_reference: Optional[str] = None

    @field_validator("credit_source")
    @classmethod
    def validate_source(cls, v):
        if v not in ["ABC", "SWAYAM", "NPTEL"]:
            raise ValueError("Credit source must be ABC, SWAYAM, or NPTEL")
        return v


class CreditTransferRequestResponse(BaseModel):
    id: int
    request_id: str
    student_id: int
    course_name: str
    credit_source: str
    course_identifier: str
    credits_claimed: int
    completion_info: Optional[str] = None
    document_reference: Optional[str] = None
    status: str
    proposed_mapping: Optional[str] = None
    evaluation_result: Optional[str] = None
    admin_explanation: Optional[str] = None
    approved_credits: int
    created_at: datetime
    student_name: Optional[str] = None
    student_demo_id: Optional[str] = None

    model_config = {"from_attributes": True}


class CreditReviewRequest(BaseModel):
    action: str = Field(..., description="approve, reject, or request_info")
    approved_credits: Optional[int] = None
    proposed_mapping: Optional[str] = None
    admin_explanation: str = Field(..., min_length=5)

    @field_validator("action")
    @classmethod
    def validate_action(cls, v):
        if v not in ["approve", "reject", "request_info"]:
            raise ValueError("Action must be approve, reject, or request_info")
        return v


class AdmissionDecisionRequest(BaseModel):
    action: str
    reason: Optional[str] = None

    @field_validator("action")
    @classmethod
    def validate_action(cls, v):
        if v not in ["approve", "reject", "request_info", "run_verification", "check_capacity"]:
            raise ValueError("Invalid action")
        return v


class ProgrammeResponse(BaseModel):
    id: int
    name: str
    department: str
    approved_intake: int
    current_enrolled: int
    institution: str
    available_seats: int = 0
    utilisation_pct: float = 0.0
    pending_requests: int = 0

    model_config = {"from_attributes": True}


class VerificationResponse(BaseModel):
    id: int
    verification_id: str
    student_id: int
    request_type: str
    status: str
    result: Optional[str] = None
    is_simulated: bool = True
    explanation: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    student_name: Optional[str] = None
    student_demo_id: Optional[str] = None

    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id: int
    student_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    related_request_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditEventResponse(BaseModel):
    id: int
    event_id: str
    timestamp: datetime
    actor_role: str
    actor_reference: str
    event_type: str
    related_request_id: Optional[str] = None
    related_student_demo_id: Optional[str] = None
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    explanation: Optional[str] = None

    model_config = {"from_attributes": True}


class DashboardMetrics(BaseModel):
    total_students: int
    total_admission_requests: int
    approved_applications: int
    pending_applications: int
    blocked_rejected_applications: int
    pending_credit_requests: int
    total_approved_seats: int
    total_occupied_seats: int
    total_available_seats: int
    verification_passed: int
    verification_failed: int
    verification_pending: int
