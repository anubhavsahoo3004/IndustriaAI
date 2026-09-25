from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplianceTaskCreate(BaseModel):
    business_id: int
    title: str
    category: str
    issuing_authority: str
    frequency: str = "Annual"
    due_date: datetime
    penalty_risk_desc: Optional[str] = None
    action_instructions: Optional[str] = None
    legal_act_reference: Optional[str] = None
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    source_reference: Optional[str] = None
    source_section: Optional[str] = None
    verification_status: Optional[str] = "VERIFIED"
    last_verified_date: Optional[str] = "2026-09-25"

class ComplianceTaskUpdate(BaseModel):
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    action_instructions: Optional[str] = None
    completed_at: Optional[datetime] = None

class ComplianceTaskResponse(BaseModel):
    id: int
    business_id: int
    title: str
    category: str
    issuing_authority: str
    frequency: str
    due_date: datetime
    status: str
    penalty_risk_desc: Optional[str] = None
    action_instructions: Optional[str] = None
    legal_act_reference: Optional[str] = None
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    source_reference: Optional[str] = None
    source_section: Optional[str] = None
    verification_status: Optional[str] = "VERIFIED"
    last_verified_date: Optional[str] = "2026-09-25"
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
