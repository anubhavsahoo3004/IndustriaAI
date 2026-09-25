from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    industry = Column(String(100), nullable=False) # Food Processing, Manufacturing, MSME / Small Industrial Unit, Textile, IT / Services
    state = Column(String(100), default="Maharashtra", nullable=False)
    district = Column(String(100), nullable=False) # Pune, Nashik, Aurangabad, Thane, etc.
    project_type = Column(String(100), default="New Unit", nullable=False) # New Unit, Expansion, Modernization
    project_stage = Column(String(100), default="Planning", nullable=False) # Concept, Land Acquired, Civil Works, Ready for Commissioning, Operational
    scale = Column(String(50), default="Medium", nullable=False) # Micro, Small, Medium, Large
    investment_range = Column(String(100), nullable=True) # e.g. "₹10 Cr - ₹50 Cr"
    investment_amount_inr = Column(Float, nullable=True) # in Lakhs / Crores
    employee_count = Column(Integer, default=25)
    business_type = Column(String(100), default="Private Limited") # Private Limited, LLP, Partnership, Proprietorship
    gstin = Column(String(50), nullable=True)
    pan = Column(String(50), nullable=True)
    udyam_number = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    plot_details = Column(String(255), nullable=True) # e.g., Plot No 42, MIDC Chakan Phase II
    electricity_load_kw = Column(Float, nullable=True) # in kW
    water_requirement_kld = Column(Float, nullable=True) # in KLD
    effluent_discharge = Column(String(50), default="Yes") # Yes, No
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="businesses")
    applications = relationship("Application", back_populates="business", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="business", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="business", cascade="all, delete-orphan")
    compliance_tasks = relationship("ComplianceTask", back_populates="business", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="business", cascade="all, delete-orphan")
