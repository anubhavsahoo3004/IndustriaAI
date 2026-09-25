from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SupportSchemeResponse(BaseModel):
    id: int
    scheme_code: str
    name: str
    department: str
    category: str
    target_industries: List[str]
    eligible_business_types: List[str]
    eligible_districts: List[str]
    eligible_project_stages: List[str]
    investment_range_min: float
    investment_range_max: float
    benefits_summary: str
    financial_incentive_details: str
    basic_eligibility: str
    application_mode: str
    source_reference: str
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    source_section: Optional[str] = None
    is_active: bool
    demo_status: str
    verification_status: Optional[str] = "VERIFIED"
    last_verified_date: Optional[str] = "2026-09-25"
    statutory_disclaimer: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SchemeMatchResponse(BaseModel):
    scheme: SupportSchemeResponse
    is_matched: bool
    match_score: int # 0-100%
    match_reasons: List[str]
    next_step: str
    estimated_benefit: Optional[str] = None
