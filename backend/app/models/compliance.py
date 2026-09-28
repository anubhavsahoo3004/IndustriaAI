from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class ComplianceTask(Base):
    __tablename__ = "compliance_tasks"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Pollution Monitoring, Fire Safety Drill, Labour Return, FSSAI Return, Boiler Inspection, Electricity Duty Exemption
    issuing_authority = Column(String(100), nullable=False) # MPCB, DISH, FDA, MSEDCL
    frequency = Column(String(50), default="Annual") # Monthly, Quarterly, Half-Yearly, Annual
    due_date = Column(DateTime, nullable=False)
    
    # Status: UPCOMING, DUE_SOON, OVERDUE, COMPLETED
    status = Column(String(50), default="UPCOMING", nullable=False)
    
    legal_act_reference = Column(Text, nullable=True)
    source_title = Column(Text, nullable=True)
    source_url = Column(Text, nullable=True)
    source_reference = Column(Text, nullable=True)
    source_section = Column(Text, nullable=True)
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, NEEDS_VERIFICATION, DEMO_ONLY
    last_verified_date = Column(String(50), default="2026-09-25")
    
    penalty_risk_desc = Column(Text, nullable=True) # e.g. "₹5,000 fine per month of delay + potential notice"
    action_instructions = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    business = relationship("Business", back_populates="compliance_tasks")
