from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    inspection_type = Column(String(100), nullable=False) # e.g. Site Verification, Pollution / Emission Check, Fire Safety Audit
    scheduled_date = Column(DateTime, nullable=False)
    officer_name = Column(String(100), nullable=False)
    officer_designation = Column(String(100), default="Field Inspection Officer")
    officer_contact = Column(String(100), nullable=True)
    location = Column(String(255), nullable=False)
    
    # Status: SCHEDULED, IN_PROGRESS, COMPLETED, RESCHEDULED, CANCELLED
    status = Column(String(50), default="SCHEDULED", nullable=False)
    
    applicant_action_required = Column(Text, nullable=True) # e.g. "Keep factory layout and raw material storage access open"
    findings_summary = Column(Text, nullable=True)
    compliance_score = Column(Integer, nullable=True) # e.g. 90%
    checklist_results = Column(JSON, default=list) # [{"check": "Effluent treatment setup", "status": "PASSED"}]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="inspections")
    business = relationship("Business", back_populates="inspections")
