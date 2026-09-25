from sqlalchemy.orm import Session
from typing import Optional
from backend.app.models.audit import AuditLog
from backend.app.models.user import User

class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        description: str,
        user: Optional[User] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        ip_address: str = "127.0.0.1"
    ) -> AuditLog:
        log_entry = AuditLog(
            user_id=user.id if user else None,
            user_email=user.email if user else "system",
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            description=description,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
