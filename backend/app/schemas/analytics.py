from pydantic import BaseModel
from typing import List, Dict, Any

class StatusBreakdownItem(BaseModel):
    status: str
    count: int
    percentage: float
    color: str

class IndustryBreakdownItem(BaseModel):
    industry: str
    count: int
    percentage: float

class StageBreakdownItem(BaseModel):
    stage: str
    count: int

class BottleneckItem(BaseModel):
    stage_name: str
    stage_key: str
    count: int
    percentage: float
    avg_days_in_stage: float
    threshold_days: int
    is_critical: bool
    explanation: str

class SlaRiskItem(BaseModel):
    application_id: int
    application_number: str
    approval_name: str
    business_name: str
    industry: str
    risk_level: str # HIGH, MEDIUM, LOW
    current_stage: str
    days_in_current_stage: int
    configured_sla_days: int
    reasons: List[str]
    suggested_mitigation: str

class AnalyticsOverviewResponse(BaseModel):
    total_applications: int
    pending_applications: int
    under_review_applications: int
    action_required_applications: int
    near_sla_applications: int
    delayed_applications: int
    completed_applications: int
    total_businesses: int
    total_inspections: int
    status_breakdown: List[StatusBreakdownItem]
    industry_breakdown: List[IndustryBreakdownItem]
    stage_breakdown: List[StageBreakdownItem]
    bottlenecks: List[BottleneckItem]
    sla_risks: List[SlaRiskItem]
