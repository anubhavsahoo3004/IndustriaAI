from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.business import Business
from backend.app.models.compliance import ComplianceTask
from backend.app.schemas.compliance import ComplianceTaskCreate, ComplianceTaskUpdate, ComplianceTaskResponse
from backend.app.services.compliance_service import ComplianceService
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/compliance", tags=["Compliance Calendar & Recurring Tasks"])

@router.get("", response_model=List[ComplianceTaskResponse])
def list_compliance_tasks(
    business_id: int = Query(...),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access compliance calendar for this business.")

    return ComplianceService.get_business_tasks(db, business_id, status)

@router.post("", response_model=ComplianceTaskResponse)
def create_compliance_task(
    data: ComplianceTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, data.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add compliance tasks for this business.")

    return ComplianceService.create_task(db, current_user, data)

@router.patch("/{task_id}", response_model=ComplianceTaskResponse)
def update_compliance_task(
    task_id: int,
    data: ComplianceTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = ComplianceService.get_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Compliance task not found.")

    business = BusinessService.get_by_id(db, task.business_id)
    if current_user.role not in ["admin", "officer"] and business and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit compliance tasks for this business.")

    return ComplianceService.update_task(db, task, current_user, data)
