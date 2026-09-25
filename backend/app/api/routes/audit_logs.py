from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_admin
from backend.app.models.user import User
from backend.app.models.audit import AuditLog
from backend.app.schemas.audit import AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
def list_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if current_user.role not in ["admin", "officer"]:
        query = query.filter(AuditLog.user_id == current_user.id)

    if action:
        query = query.filter(AuditLog.action == action)

    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
