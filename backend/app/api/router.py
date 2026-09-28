from fastapi import APIRouter
from backend.app.api.routes import (
    auth,
    businesses,
    approvals,
    applications,
    documents,
    inspections,
    compliance,
    schemes,
    notifications,
    analytics,
    ai,
    audit_logs,
    admin,
    officer
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(businesses.router)
api_router.include_router(approvals.router)
api_router.include_router(applications.router)
api_router.include_router(documents.router)
api_router.include_router(inspections.router)
api_router.include_router(compliance.router)
api_router.include_router(schemes.router)
api_router.include_router(notifications.router)
api_router.include_router(analytics.router)
api_router.include_router(ai.router)
api_router.include_router(audit_logs.router)
api_router.include_router(admin.router)
api_router.include_router(officer.router)

