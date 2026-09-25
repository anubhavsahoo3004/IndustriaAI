from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.business import Business
from backend.app.models.approval import ApprovalType
from backend.app.models.application import Application
from backend.app.models.workflow import WorkflowStep
from backend.app.models.document import ApplicationDocument, Document
from backend.app.schemas.application import ApplicationCreate, ApplicationUpdateStatus, ApplicationResponse, ApplicationDetailResponse, WorkflowStepResponse, ApplicationDocumentResponse
from backend.app.services.application_service import ApplicationService
from backend.app.services.business_service import BusinessService
from backend.app.services.approval_service import ApprovalService
from backend.app.rules.workflow_state import (
    ApplicationStatus,
    WorkflowStage,
    VALID_STATUS_STAGE_MAP,
    DEFAULT_STAGE_FOR_STATUS,
    DEFAULT_STATUS_FOR_STAGE,
    STAGE_LABELS
)

router = APIRouter(prefix="/applications", tags=["Applications & Workflow"])

@router.get("/state-matrix")
def get_workflow_state_matrix(
    current_user: User = Depends(get_current_user)
):
    """
    Returns the single canonical application state matrix,
    valid status/stage combinations, and default mappings.
    """
    return {
        "statuses": [s.value for s in ApplicationStatus],
        "stages": [s.value for s in WorkflowStage],
        "valid_status_stage_map": {k: sorted(list(v)) for k, v in VALID_STATUS_STAGE_MAP.items()},
        "default_stage_for_status": DEFAULT_STAGE_FOR_STATUS,
        "default_status_for_stage": DEFAULT_STATUS_FOR_STAGE,
        "stage_labels": STAGE_LABELS
    }

@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    business_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    delay_risk: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Application)
    if current_user.role not in ["admin", "officer"]:
        user_biz_ids = [b.id for b in db.query(Business).filter(Business.user_id == current_user.id).all()]
        query = query.filter(Application.business_id.in_(user_biz_ids))

    if business_id:
        query = query.filter(Application.business_id == business_id)
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

@router.post("", response_model=ApplicationResponse)
def create_application(
    data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, data.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create application for this business.")

    approval_type = ApprovalService.get_approval_type_by_id(db, data.approval_type_id)
    if not approval_type:
        raise HTTPException(status_code=404, detail="Approval type not found.")

    app = ApplicationService.create_application(db, current_user, business, approval_type)
    res = ApplicationResponse.model_validate(app)
    res.business_name = business.name
    res.business_industry = business.industry
    res.business_district = business.district
    return res

@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application_detail(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = ApplicationService.get_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if current_user.role not in ["admin", "officer"] and app.business and app.business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this application.")

    steps = db.query(WorkflowStep).filter(WorkflowStep.application_id == app.id).order_by(WorkflowStep.step_order.asc()).all()
    app_docs = db.query(ApplicationDocument).filter(ApplicationDocument.application_id == app.id).all()

    # Format document links with document details
    app_doc_responses = []
    attached_types = []
    for ad in app_docs:
        doc = db.query(Document).filter(Document.id == ad.document_id).first()
        doc_data = {
            "id": doc.id,
            "filename": doc.filename,
            "original_filename": doc.original_filename,
            "document_type": doc.document_type,
            "file_type": doc.file_type,
            "status": doc.status,
            "validation_result": doc.validation_result,
            "created_at": doc.created_at
        } if doc else None
        
        if doc and doc.status != "REJECTED":
            attached_types.append(doc.document_type)

        app_doc_responses.append(ApplicationDocumentResponse(
            id=ad.id,
            application_id=ad.application_id,
            document_id=ad.document_id,
            is_mandatory=ad.is_mandatory,
            status=ad.status,
            remarks=ad.remarks,
            document=doc_data
        ))

    manifest = app.approval_type.required_documents_manifest if app.approval_type else []
    missing_mandatory = []
    for m in manifest:
        if m.get("mandatory") and m.get("doc_type") not in attached_types:
            missing_mandatory.append(m.get("name", m.get("doc_type")))

    res_dict = ApplicationResponse.model_validate(app).model_dump()
    if app.business:
        res_dict["business_name"] = app.business.name
        res_dict["business_industry"] = app.business.industry
        res_dict["business_district"] = app.business.district

    return ApplicationDetailResponse(
        **res_dict,
        workflow_steps=[WorkflowStepResponse.model_validate(s) for s in steps],
        application_documents=app_doc_responses,
        required_manifest=manifest,
        missing_mandatory_documents=missing_mandatory
    )

@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = ApplicationService.get_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if current_user.role not in ["admin", "officer"]:
        raise HTTPException(status_code=403, detail="Only administrative officers can update application workflow stages.")

    updated = ApplicationService.update_application_status(
        db=db,
        application=app,
        user=current_user,
        status=data.status,
        current_stage=data.current_stage,
        officer_remarks=data.officer_remarks,
        assigned_officer=data.assigned_officer,
        advance_stage=data.advance_stage or False
    )
    res = ApplicationResponse.model_validate(updated)
    if updated.business:
        res.business_name = updated.business.name
        res.business_industry = updated.business.industry
        res.business_district = updated.business.district
    return res
