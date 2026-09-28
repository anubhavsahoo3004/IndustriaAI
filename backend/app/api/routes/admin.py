from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.dependencies import require_admin
from backend.app.models.user import User
from backend.app.models.application import Application
from backend.app.models.inspection import Inspection
from backend.app.models.audit import AuditLog
from backend.app.schemas.application import ApplicationResponse
from backend.app.schemas.inspection import InspectionResponse
from backend.app.schemas.audit import AuditLogResponse
from backend.app.schemas.analytics import AnalyticsOverviewResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/admin", tags=["Department Administration & Control"], dependencies=[Depends(require_admin)])

@router.get("/analytics", response_model=AnalyticsOverviewResponse)
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Department-wide clearance and bottleneck analytics. Admin/Officer only."""
    return AnalyticsService.get_overview_analytics(db)

@router.get("/bottlenecks")
def get_admin_bottlenecks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Department-wide processing bottlenecks. Admin/Officer only."""
    data = AnalyticsService.get_overview_analytics(db)
    return {
        "total_active_pipeline": sum(b["count"] for b in data["bottlenecks"]),
        "bottlenecks": data["bottlenecks"]
    }

@router.get("/sla")
@router.get("/sla-risk")
def get_admin_sla_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Department-wide SLA delay risk queue. Admin/Officer only."""
    data = AnalyticsService.get_overview_analytics(db)
    return {
        "total_at_risk": len(data["sla_risks"]),
        "sla_risks": data["sla_risks"]
    }

@router.get("/review", response_model=List[ApplicationResponse])
@router.get("/scrutiny-queue", response_model=List[ApplicationResponse])
def get_admin_scrutiny_queue(
    status: Optional[str] = Query(None),
    delay_risk: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Department-wide application scrutiny queue. Admin/Officer only."""
    query = db.query(Application)
    if status:
        query = query.filter(Application.status == status)
    if delay_risk:
        query = query.filter(Application.delay_risk_level == delay_risk)
    
    apps = query.order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        item = ApplicationResponse.model_validate(a)
        if a.business:
            item.business_name = a.business.name
            item.business_industry = a.business.industry
            item.business_district = a.business.district
        results.append(item)
    return results

@router.get("/applications", response_model=List[ApplicationResponse])
def get_admin_all_applications(
    status: Optional[str] = Query(None),
    delay_risk: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """All applications across all businesses statewide. Admin/Officer only."""
    query = db.query(Application)
    if status:
        query = query.filter(Application.status == status)
    if delay_risk:
        query = query.filter(Application.delay_risk_level == delay_risk)
    
    apps = query.order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        item = ApplicationResponse.model_validate(a)
        if a.business:
            item.business_name = a.business.name
            item.business_industry = a.business.industry
            item.business_district = a.business.district
        results.append(item)
    return results

@router.get("/inspections", response_model=List[InspectionResponse])
def get_admin_inspections(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """All field inspections scheduled statewide. Admin/Officer only."""
    query = db.query(Inspection)
    if status:
        query = query.filter(Inspection.status == status)
    
    inspections = query.order_by(Inspection.scheduled_date.asc()).all()
    results = []
    for insp in inspections:
        res = InspectionResponse.model_validate(insp)
        if insp.application:
            res.application_number = insp.application.application_number
            if insp.application.approval_type:
                res.approval_name = insp.application.approval_type.name
        if insp.business:
            res.business_name = insp.business.name
        results.append(res)
    return results

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_admin_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Full system audit trail logs. Admin/Officer only."""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
