from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_admin
from backend.app.models.user import User
from backend.app.models.business import Business
from backend.app.models.application import Application
from backend.app.models.inspection import Inspection
from backend.app.schemas.inspection import InspectionCreate, InspectionUpdate, InspectionResponse
from backend.app.services.inspection_service import InspectionService
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.get("", response_model=List[InspectionResponse])
def list_inspections(
    business_id: Optional[int] = Query(None),
    application_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Inspection)
    if current_user.role not in ["admin", "officer"]:
        user_biz_ids = [b.id for b in db.query(Business).filter(Business.user_id == current_user.id).all()]
        query = query.filter(Inspection.business_id.in_(user_biz_ids))

    if business_id:
        query = query.filter(Inspection.business_id == business_id)
    if application_id:
        query = query.filter(Inspection.application_id == application_id)
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

@router.post("", response_model=InspectionResponse)
def schedule_inspection(
    data: InspectionCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    insp = InspectionService.schedule_inspection(db, current_user, data)
    res = InspectionResponse.model_validate(insp)
    if insp.application:
        res.application_number = insp.application.application_number
        if insp.application.approval_type:
            res.approval_name = insp.application.approval_type.name
    if insp.business:
        res.business_name = insp.business.name
    return res

@router.patch("/{inspection_id}", response_model=InspectionResponse)
def update_inspection(
    inspection_id: int,
    data: InspectionUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    insp = InspectionService.get_by_id(db, inspection_id)
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found.")

    updated = InspectionService.update_inspection(db, insp, current_user, data)
    res = InspectionResponse.model_validate(updated)
    if updated.application:
        res.application_number = updated.application.application_number
        if updated.application.approval_type:
            res.approval_name = updated.application.approval_type.name
    if updated.business:
        res.business_name = updated.business.name
    return res
