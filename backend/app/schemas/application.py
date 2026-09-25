from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from backend.app.schemas.approval import ApprovalTypeResponse

class ApplicationCreate(BaseModel):
    business_id: int
    approval_type_id: int
    custom_notes: Optional[str] = None

class ApplicationUpdateStatus(BaseModel):
    status: Optional[str] = None
    current_stage: Optional[str] = None
    officer_remarks: Optional[str] = None
    assigned_officer: Optional[str] = None
    advance_stage: Optional[bool] = False

class WorkflowStepResponse(BaseModel):
    id: int
    application_id: int
    step_name: str
    step_key: str
    step_order: int
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    officer_notes: Optional[str] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationDocumentResponse(BaseModel):
    id: int
    application_id: int
    document_id: int
    is_mandatory: bool
    status: str
    remarks: Optional[str] = None
    document: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: int
    business_id: int
    approval_type_id: int
    application_number: str
    status: str
    current_stage: str
    applicability_reason: Optional[str] = None
    submission_date: Optional[datetime] = None
    sla_deadline: Optional[datetime] = None
    delay_risk_level: str
    delay_risk_reasons: List[str]
    next_action_prompt: Optional[str] = None
    assigned_officer: Optional[str] = None
    officer_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    approval_type: Optional[ApprovalTypeResponse] = None
    business_name: Optional[str] = None
    business_industry: Optional[str] = None
    business_district: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationDetailResponse(ApplicationResponse):
    workflow_steps: List[WorkflowStepResponse] = []
    application_documents: List[ApplicationDocumentResponse] = []
    required_manifest: List[Dict[str, Any]] = []
    missing_mandatory_documents: List[str] = []
