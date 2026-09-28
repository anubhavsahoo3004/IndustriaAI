from sqlalchemy import Column, Integer, String, Text, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class ApprovalType(Base):
    __tablename__ = "approval_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    issuing_authority = Column(String(255), nullable=False) # MPCB, MIDC, DISH, FDA / FSSAI, MSEDCL, etc.
    department = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False) # Environmental, Fire & Safety, Power & Utilities, Licensing, Labour
    description = Column(Text, nullable=False)
    why_it_applies_template = Column(Text, nullable=True)
    standard_sla_days = Column(Integer, default=30)
    renewal_frequency_years = Column(Integer, default=1)
    inspection_required = Column(Boolean, default=True)
    legal_act_reference = Column(String(255), nullable=True) # e.g. Water (Prevention & Control of Pollution) Act, 1974
    applicability_rule_tags = Column(JSON, default=dict) # {industries: [...], scales: [...], min_employees: 10, ...}
    required_documents_manifest = Column(JSON, default=list) # [{doc_type: "...", name: "...", mandatory: true, desc: "..."}]
    default_workflow_steps = Column(JSON, default=list) # ["Document Verification", "Department Review", "Inspection", "Final Decision"]
    demo_status = Column(String(50), default="CONFIGURED_PROTOTYPE")
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, NEEDS_VERIFICATION, DEMO_ONLY
    source_title = Column(Text, nullable=True)
    source_url = Column(Text, nullable=True)
    source_reference = Column(Text, nullable=True)
    source_section = Column(Text, nullable=True)
    last_verified_date = Column(String(50), default="2026-09-25")
    statutory_disclaimer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    applications = relationship("Application", back_populates="approval_type")
