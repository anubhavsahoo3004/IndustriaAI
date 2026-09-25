from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ApprovalTypeResponse(BaseModel):
    id: int
    code: str
    name: str
    issuing_authority: str
    department: str
    category: str
    description: str
    why_it_applies_template: Optional[str] = None
    standard_sla_days: int
    renewal_frequency_years: int
    inspection_required: bool
    legal_act_reference: Optional[str] = None
    applicability_rule_tags: Dict[str, Any]
    required_documents_manifest: List[Dict[str, Any]]
    default_workflow_steps: List[str]
    demo_status: str
    verification_status: Optional[str] = "VERIFIED"
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    source_reference: Optional[str] = None
    source_section: Optional[str] = None
    last_verified_date: Optional[str] = "2026-09-25"
    statutory_disclaimer: Optional[str] = None

    class Config:
        from_attributes = True

class ApprovalPlanItem(BaseModel):
    approval_type_id: int
    code: str
    name: str
    category: str
    issuing_authority: str
    department: str
    is_applicable: bool
    why_it_applies: str
    standard_sla_days: int
    inspection_required: bool
    renewal_frequency_years: int
    legal_act_reference: Optional[str] = None
    verification_status: Optional[str] = "VERIFIED"
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    source_reference: Optional[str] = None
    source_section: Optional[str] = None
    last_verified_date: Optional[str] = "2026-09-25"
    statutory_disclaimer: Optional[str] = None
    required_documents: List[Dict[str, Any]]
    existing_application_id: Optional[int] = None
    status: str = "NOT_STARTED"
    next_action: str = "Prepare and attach mandatory documents"

class ApprovalPlanResponse(BaseModel):
    business_id: int
    business_name: str
    industry: str
    location: str
    scale: str
    total_recommended_approvals: int
    critical_environmental_approvals: int
    operational_licensing_approvals: int
    items: List[ApprovalPlanItem]
    ai_strategic_summary: Optional[str] = None
