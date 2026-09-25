from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.scheme import SupportScheme
from backend.app.schemas.scheme import SupportSchemeResponse, SchemeMatchResponse
from backend.app.services.scheme_service import SchemeService
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/schemes", tags=["Government Support & Incentives"])

@router.get("", response_model=List[SupportSchemeResponse])
def list_schemes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SchemeService.get_all_schemes(db)

@router.get("/match/{business_id}", response_model=List[SchemeMatchResponse])
def match_schemes(
    business_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to match schemes for this business.")

    matches = SchemeService.match_schemes_for_business(db, business)
    return matches
