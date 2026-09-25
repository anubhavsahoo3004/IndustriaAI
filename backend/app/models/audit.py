from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False) # LOGIN, BUSINESS_CREATED, PLAN_GENERATED, DOC_UPLOAD, DOC_VALIDATED, STATUS_CHANGE, INSPECTION_SCHEDULED, AI_ANALYSIS
    entity_type = Column(String(100), nullable=True) # User, Business, Application, Document, Inspection
    entity_id = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audit_logs")
