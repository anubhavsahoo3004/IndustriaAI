from sqlalchemy import Column, Integer, String, Text, Float, JSON, Boolean, DateTime
from datetime import datetime, timezone
from backend.app.core.database import Base

class SupportScheme(Base):
    __tablename__ = "support_schemes"

    id = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False) # Department of Industries, MAIDC, MSME Dept
    category = Column(String(100), default="Financial Incentive") # Capital Subsidy, Interest Subvention, Tax Exemption, Export Assistance
    target_industries = Column(JSON, default=list) # ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit"]
    eligible_business_types = Column(JSON, default=list) # ["Private Limited", "LLP", "Partnership", "Proprietorship"]
    eligible_districts = Column(JSON, default=list) # ["All", "Pune", "Nashik", "Aurangabad", "Nagpur"]
    eligible_project_stages = Column(JSON, default=list) # ["New Unit", "Expansion", "Modernization"]
    investment_range_min = Column(Float, default=0.0)
    investment_range_max = Column(Float, default=1000.0) # In Crores
    benefits_summary = Column(Text, nullable=False)
    financial_incentive_details = Column(Text, nullable=False) # e.g. "Up to 50% Capital Subsidy capped at ₹50 Lakhs"
    basic_eligibility = Column(Text, nullable=False)
    application_mode = Column(String(100), default="Online Single Window (Maitri)")
    source_reference = Column(Text, default="Government of Maharashtra Resolution (GR) No. PSI-2019/CR-12")
    source_title = Column(Text, nullable=True)
    source_url = Column(Text, nullable=True)
    source_section = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    demo_status = Column(String(50), default="CONFIGURED_PROTOTYPE")
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, NEEDS_VERIFICATION, DEMO_ONLY
    last_verified_date = Column(String(50), default="2026-09-25")
    statutory_disclaimer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
