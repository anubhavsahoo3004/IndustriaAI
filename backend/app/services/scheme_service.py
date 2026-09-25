from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from backend.app.models.scheme import SupportScheme
from backend.app.models.business import Business
from backend.app.rules.scheme_matching_engine import SchemeMatchingEngine

class SchemeService:
    @staticmethod
    def get_all_schemes(db: Session) -> List[SupportScheme]:
        return db.query(SupportScheme).filter(SupportScheme.is_active == True).all()

    @staticmethod
    def get_scheme_by_id(db: Session, scheme_id: int) -> Optional[SupportScheme]:
        return db.query(SupportScheme).filter(SupportScheme.id == scheme_id).first()

    @staticmethod
    def match_schemes_for_business(db: Session, business: Business) -> List[Dict[str, Any]]:
        all_schemes = db.query(SupportScheme).filter(SupportScheme.is_active == True).all()
        return SchemeMatchingEngine.match_schemes(business, all_schemes)
