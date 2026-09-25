from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_admin
from backend.app.models.user import User
from backend.app.models.business import Business
from backend.app.schemas.analytics import AnalyticsOverviewResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Admin Analytics & Bottlenecks"])

def resolve_authorized_business_id(current_user: User, business_id: Optional[int], db: Session) -> Optional[int]:
    if current_user.role not in ["admin", "officer"]:
        if business_id is not None:
            biz = db.query(Business).filter(Business.id == business_id).first()
            if not biz or biz.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to access analytics for this business.")
            return biz.id
        else:
            user_biz = db.query(Business).filter(Business.user_id == current_user.id).first()
            return user_biz.id if user_biz else -1
    return business_id

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    business_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_biz_id = resolve_authorized_business_id(current_user, business_id, db)
    return AnalyticsService.get_overview_analytics(db, business_id=target_biz_id)

@router.get("/bottlenecks")
def get_bottlenecks(
    business_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_biz_id = resolve_authorized_business_id(current_user, business_id, db)
    data = AnalyticsService.get_overview_analytics(db, business_id=target_biz_id)
    return {
        "total_active_pipeline": sum(b["count"] for b in data["bottlenecks"]),
        "bottlenecks": data["bottlenecks"]
    }

@router.get("/sla-risk")
def get_sla_risks(
    business_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_biz_id = resolve_authorized_business_id(current_user, business_id, db)
    data = AnalyticsService.get_overview_analytics(db, business_id=target_biz_id)
    return {
        "total_at_risk": len(data["sla_risks"]),
        "sla_risks": data["sla_risks"]
    }
