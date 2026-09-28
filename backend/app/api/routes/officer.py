from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.dependencies import require_officer_or_admin
from backend.app.models.user import User
from backend.app.models.application import Application
from backend.app.models.inspection import Inspection
from backend.app.schemas.application import ApplicationResponse
from backend.app.schemas.inspection import InspectionResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/officer", tags=["Officer Operations & Scrutiny"], dependencies=[Depends(require_officer_or_admin)])

@router.get("/scrutiny-queue", response_model=List[ApplicationResponse])
@router.get("/applications", response_model=List[ApplicationResponse])
def get_officer_scrutiny_queue(
    status: Optional[str] = Query(None),
    delay_risk: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer_or_admin)
):
    """Officer scrutiny queue of applications requiring review. Officer/Admin only."""
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
def get_officer_inspections(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer_or_admin)
):
    """Officer inspection dispatch queue. Officer/Admin only."""
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

@router.get("/sla-queue")
def get_officer_sla_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer_or_admin)
):
    """Officer SLA risk queue. Officer/Admin only."""
    data = AnalyticsService.get_overview_analytics(db)
    return {
        "total_at_risk": len(data["sla_risks"]),
        "sla_risks": data["sla_risks"]
    }
