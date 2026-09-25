from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.business import Business
from backend.app.schemas.approval import ApprovalTypeResponse, ApprovalPlanResponse
from backend.app.services.approval_service import ApprovalService
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/approvals", tags=["Approvals & Intelligence Engine"])

@router.get("", response_model=List[ApprovalTypeResponse])
def list_approval_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ApprovalService.get_all_approval_types(db)

@router.get("/plan/{business_id}", response_model=ApprovalPlanResponse)
def generate_approval_plan(
    business_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access plan for this business.")

    return ApprovalService.generate_plan_for_business(db, business)
