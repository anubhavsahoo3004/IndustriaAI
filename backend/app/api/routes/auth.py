from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.models.user import User
from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from backend.app.core.dependencies import get_current_user
from backend.app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered."
        )

    # Public self-registration is strictly restricted to 'applicant' role to prevent privilege escalation
    user = User(
        email=data.email.lower(),
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role="applicant",
        department=data.department
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)

    AuditService.log(
        db,
        action="USER_REGISTERED",
        description=f"New user registered: {user.email} (Role: {user.role})",
        user=user,
        entity_type="User",
        entity_id=str(user.id)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive."
        )

    token = create_access_token(subject=user.id)

    AuditService.log(
        db,
        action="USER_LOGIN",
        description=f"User logged in successfully: {user.email}",
        user=user,
        entity_type="User",
        entity_id=str(user.id)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
