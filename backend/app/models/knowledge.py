from sqlalchemy import Column, Integer, String, Text, Boolean, JSON, DateTime
from datetime import datetime, timezone
from backend.app.core.database import Base

class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False) # Environmental, Fire & Safety, Food Standards, Subsidies, Labour Laws
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    applicable_industries = Column(JSON, default=list)
    source_agency = Column(String(255), default="Government of Maharashtra")
    legal_act_reference = Column(String(255), nullable=True)
    source_title = Column(String(255), nullable=True)
    source_url = Column(String(255), nullable=True)
    source_reference = Column(String(255), nullable=True)
    source_section = Column(String(255), nullable=True)
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, NEEDS_VERIFICATION, DEMO_ONLY
    last_verified_date = Column(String(50), default="2026-09-25")
    is_official_guideline = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
