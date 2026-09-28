from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.business import Business
from backend.app.models.application import Application
from backend.app.models.inspection import Inspection
from backend.app.models.compliance import ComplianceTask
from backend.app.schemas.business import BusinessCreate, BusinessUpdate, BusinessResponse, BusinessDetailResponse
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/businesses", tags=["Businesses"])

@router.get("", response_model=List[BusinessResponse])
def list_businesses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role in ["admin", "officer"]:
        return BusinessService.get_all_businesses(db)
    return BusinessService.get_user_businesses(db, current_user.id)

@router.post("", response_model=BusinessResponse)
def create_business(
    data: BusinessCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return BusinessService.create_business(db, current_user, data)

@router.get("/{business_id}", response_model=BusinessDetailResponse)
def get_business(
    business_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this business profile.")

    # Calculate summary metrics
    apps = db.query(Application).filter(Application.business_id == business.id).all()
    inspections = db.query(Inspection).filter(Inspection.business_id == business.id, Inspection.status == "SCHEDULED").all()
    compliance_tasks = db.query(ComplianceTask).filter(ComplianceTask.business_id == business.id, ComplianceTask.status != "COMPLETED").all()

    total = len(apps)
    completed = len([a for a in apps if a.status in ["APPROVED", "COMPLETED"]])
    under_review = len([a for a in apps if a.status in ["UNDER_REVIEW", "INSPECTION_PENDING"]])
    action_req = len([
        a for a in apps
        if not (a.status in ["APPROVED", "COMPLETED", "REJECTED"] or a.current_stage == "COMPLETED")
        and (a.status in ["DOCUMENTS_REQUIRED", "ACTION_REQUIRED"] or a.delay_risk_level == "HIGH")
    ])

    data = BusinessResponse.model_validate(business).model_dump()
    return {
        **data,
        "total_applications": total,
        "completed_applications": completed,
        "under_review_applications": under_review,
        "action_required_applications": action_req,
        "upcoming_inspections": len(inspections),
        "pending_compliance_tasks": len(compliance_tasks)
    }

@router.patch("/{business_id}", response_model=BusinessResponse)
def update_business(
    business_id: int,
    data: BusinessUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this business profile.")

    return BusinessService.update_business(db, business, current_user, data)
