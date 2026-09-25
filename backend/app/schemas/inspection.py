from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class InspectionCreate(BaseModel):
    application_id: int
    business_id: int
    inspection_type: str
    scheduled_date: datetime
    officer_name: str
    officer_designation: Optional[str] = "Field Inspection Officer"
    officer_contact: Optional[str] = None
    location: str
    applicant_action_required: Optional[str] = None

class InspectionUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    officer_name: Optional[str] = None
    findings_summary: Optional[str] = None
    compliance_score: Optional[int] = None
    checklist_results: Optional[List[Dict[str, Any]]] = None
    applicant_action_required: Optional[str] = None

class InspectionResponse(BaseModel):
    id: int
    application_id: int
    business_id: int
    inspection_type: str
    scheduled_date: datetime
    officer_name: str
    officer_designation: str
    officer_contact: Optional[str] = None
    location: str
    status: str
    applicant_action_required: Optional[str] = None
    findings_summary: Optional[str] = None
    compliance_score: Optional[int] = None
    checklist_results: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    application_number: Optional[str] = None
    approval_name: Optional[str] = None
    business_name: Optional[str] = None

    class Config:
        from_attributes = True
