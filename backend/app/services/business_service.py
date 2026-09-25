from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.models.business import Business
from backend.app.models.user import User
from backend.app.schemas.business import BusinessCreate, BusinessUpdate
from backend.app.services.audit_service import AuditService

class BusinessService:
    @staticmethod
    def get_by_id(db: Session, business_id: int) -> Optional[Business]:
        return db.query(Business).filter(Business.id == business_id).first()

    @staticmethod
    def get_user_businesses(db: Session, user_id: int) -> List[Business]:
        return db.query(Business).filter(Business.user_id == user_id).all()

    @staticmethod
    def get_all_businesses(db: Session, limit: int = 100) -> List[Business]:
        return db.query(Business).limit(limit).all()

    @staticmethod
    def create_business(db: Session, user: User, data: BusinessCreate) -> Business:
        business = Business(
            user_id=user.id,
            **data.model_dump()
        )
        db.add(business)
        db.commit()
        db.refresh(business)

        AuditService.log(
            db,
            action="BUSINESS_CREATED",
            description=f"Created business profile '{business.name}' in {business.district}, Maharashtra ({business.industry}).",
            user=user,
            entity_type="Business",
            entity_id=str(business.id)
        )
        return business

    @staticmethod
    def update_business(db: Session, business: Business, user: User, data: BusinessUpdate) -> Business:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(business, key, value)
        
        db.commit()
        db.refresh(business)

        AuditService.log(
            db,
            action="BUSINESS_UPDATED",
            description=f"Updated business profile '{business.name}'.",
            user=user,
            entity_type="Business",
            entity_id=str(business.id)
        )
        return business
