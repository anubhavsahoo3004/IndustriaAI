from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    step_name = Column(String(100), nullable=False) # e.g. Submitted, Document Verification, Department Review, Inspection, Final Decision
    step_key = Column(String(50), nullable=False) # SUBMITTED, DOC_VERIFICATION, DEPT_REVIEW, INSPECTION, DECISION
    step_order = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, IN_PROGRESS, COMPLETED, ACTION_REQUIRED, REJECTED, SKIPPED
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    officer_notes = Column(Text, nullable=True)
    updated_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="workflow_steps")
