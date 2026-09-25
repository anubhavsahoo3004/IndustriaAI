from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    approval_type_id = Column(Integer, ForeignKey("approval_types.id"), nullable=False)
    application_number = Column(String(100), unique=True, index=True, nullable=False)
    
    # Statuses: NOT_STARTED, DOCUMENTS_REQUIRED, SUBMITTED, UNDER_REVIEW, INSPECTION_PENDING, APPROVED, REJECTED, ACTION_REQUIRED, COMPLETED
    status = Column(String(50), default="DOCUMENTS_REQUIRED", nullable=False)
    
    # Workflow Stage: SUBMITTED, DOC_VERIFICATION, DEPT_REVIEW, INSPECTION, DECISION, COMPLETED
    current_stage = Column(String(50), default="DOC_VERIFICATION", nullable=False)
    
    applicability_reason = Column(Text, nullable=True)
    submission_date = Column(DateTime, nullable=True)
    sla_deadline = Column(DateTime, nullable=True)
    
    # Delay & SLA intelligence
    delay_risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH
    delay_risk_reasons = Column(JSON, default=list) # ["Review stage exceeded 15 days", "Required document missing"]
    next_action_prompt = Column(Text, nullable=True)
    
    assigned_officer = Column(String(100), nullable=True)
    officer_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    business = relationship("Business", back_populates="applications")
    approval_type = relationship("ApprovalType", back_populates="applications")
    workflow_steps = relationship("WorkflowStep", back_populates="application", cascade="all, delete-orphan", order_by="WorkflowStep.step_order")
    application_documents = relationship("ApplicationDocument", back_populates="application", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="application", cascade="all, delete-orphan")
