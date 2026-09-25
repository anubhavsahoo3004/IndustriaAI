from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False) # PDF, DOCX, TXT, PNG, JPG
    file_size_bytes = Column(Integer, default=0)
    file_hash = Column(String(64), nullable=True) # SHA-256
    document_type = Column(String(100), nullable=False) # PAN, UDYAM, DPR, BUILDING_PLAN, POLLUTION_CONTROL, FIRE_PLAN, etc.
    
    # Validation status: UPLOADED, VERIFIED, ACTION_REQUIRED, REJECTED
    status = Column(String(50), default="UPLOADED")
    
    # AI and Rule Validation results
    validation_result = Column(JSON, default=dict)
    # e.g.: {"status": "ACTION_REQUIRED", "checks": [{"item": "Business Name", "result": "MATCH"}], "summary": "...", "recommended_action": "..."}
    extracted_metadata = Column(JSON, default=dict)
    ai_summary = Column(Text, nullable=True)
    inconsistency_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    business = relationship("Business", back_populates="documents")
    application_links = relationship("ApplicationDocument", back_populates="document", cascade="all, delete-orphan")


class ApplicationDocument(Base):
    __tablename__ = "application_documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    status = Column(String(50), default="ATTACHED") # ATTACHED, VERIFIED, ACTION_REQUIRED, REJECTED
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="application_documents")
    document = relationship("Document", back_populates="application_links")
