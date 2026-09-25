from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BusinessBase(BaseModel):
    name: str
    industry: str # Food Processing, Manufacturing, MSME / Small Industrial Unit, Textile, IT / Services
    state: str = "Maharashtra"
    district: str
    project_type: str = "New Unit" # New Unit, Expansion, Modernization
    project_stage: str = "Planning" # Concept, Land Acquired, Civil Works, Ready for Commissioning, Operational
    scale: str = "Medium" # Micro, Small, Medium, Large
    investment_range: Optional[str] = "₹10 Cr - ₹50 Cr"
    investment_amount_inr: Optional[float] = 25.0 # In Crores
    employee_count: int = 25
    business_type: str = "Private Limited"
    gstin: Optional[str] = None
    pan: Optional[str] = None
    udyam_number: Optional[str] = None
    address: Optional[str] = None
    plot_details: Optional[str] = None
    electricity_load_kw: Optional[float] = 150.0
    water_requirement_kld: Optional[float] = 25.0
    effluent_discharge: Optional[str] = "Yes"

class BusinessCreate(BusinessBase):
    pass

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    district: Optional[str] = None
    project_type: Optional[str] = None
    project_stage: Optional[str] = None
    scale: Optional[str] = None
    investment_range: Optional[str] = None
    investment_amount_inr: Optional[float] = None
    employee_count: Optional[int] = None
    business_type: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    udyam_number: Optional[str] = None
    address: Optional[str] = None
    plot_details: Optional[str] = None
    electricity_load_kw: Optional[float] = None
    water_requirement_kld: Optional[float] = None
    effluent_discharge: Optional[str] = None

class BusinessResponse(BusinessBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BusinessDetailResponse(BusinessResponse):
    total_applications: int = 0
    completed_applications: int = 0
    under_review_applications: int = 0
    action_required_applications: int = 0
    upcoming_inspections: int = 0
    pending_compliance_tasks: int = 0
