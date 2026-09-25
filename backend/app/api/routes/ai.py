from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.business import Business
from backend.app.models.application import Application
from backend.app.models.document import Document
from backend.app.models.inspection import Inspection
from backend.app.models.compliance import ComplianceTask
from backend.app.models.scheme import SupportScheme
from backend.app.schemas.ai import AiAssistantRequest, AiAssistantResponse, DocumentAnalysisRequest, DocumentAnalysisResponse
from backend.app.ai.assistant_service import ContextualAiAssistantService
from backend.app.ai.document_analyzer import DocumentAnalyzerService
from backend.app.services.business_service import BusinessService
from backend.app.services.document_service import DocumentService
from backend.app.services.audit_service import AuditService

router = APIRouter(prefix="/ai", tags=["Contextual AI Assistant & Document Intelligence"])

@router.post("/assistant", response_model=AiAssistantResponse)
async def query_assistant(
    data: AiAssistantRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = None
    if data.business_id:
        business = BusinessService.get_by_id(db, data.business_id)
        if not business:
            raise HTTPException(status_code=404, detail="Business not found.")
        if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access AI assistance for this business.")
    
    if not business:
        # Fallback to first business of user
        business = db.query(Business).filter(Business.user_id == current_user.id).first()

    if not business and current_user.role in ["admin", "officer"]:
        # If admin/officer without a specific business, fallback to primary demo business
        business = db.query(Business).first()

    if not business:
        raise HTTPException(status_code=400, detail="No active business profile found for contextual AI assistance.")

    applications = db.query(Application).filter(Application.business_id == business.id).all()
    documents = db.query(Document).filter(Document.business_id == business.id).all()
    inspections = db.query(Inspection).filter(Inspection.business_id == business.id).all()
    compliance_tasks = db.query(ComplianceTask).filter(ComplianceTask.business_id == business.id).all()
    schemes = db.query(SupportScheme).filter(SupportScheme.is_active == True).all()

    result = await ContextualAiAssistantService.process_query(
        query=data.query,
        business=business,
        applications=applications,
        documents=documents,
        inspections=inspections,
        compliance_tasks=compliance_tasks,
        schemes=schemes,
        conversation_history=data.conversation_history
    )

    AuditService.log(
        db,
        action="AI_ASSISTANT_QUERY",
        description=f"AI query asked: '{data.query[:80]}...'",
        user=current_user,
        entity_type="Business",
        entity_id=str(business.id)
    )

    return result

@router.post("/analyze-document", response_model=DocumentAnalysisResponse)
async def analyze_document(
    data: DocumentAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = DocumentService.get_by_id(db, data.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    business = BusinessService.get_by_id(db, doc.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Associated business profile not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to analyze documents for this business.")

    analysis = await DocumentAnalyzerService.analyze_document(doc, business)

    AuditService.log(
        db,
        action="AI_DOCUMENT_ANALYSIS",
        description=f"AI analyzed document '{doc.original_filename}' (Status: {analysis.get('status')})",
        user=current_user,
        entity_type="Document",
        entity_id=str(doc.id)
    )

    return {
        "document_id": doc.id,
        "document_name": doc.original_filename,
        "document_type": doc.document_type,
        "status": analysis.get("status", "VERIFIED"),
        "confidence_score": analysis.get("confidence_score", 0.95),
        "summary": analysis.get("summary", ""),
        "checks": analysis.get("checks", []),
        "recommended_action": analysis.get("recommended_action", ""),
        "inconsistency_notes": analysis.get("inconsistency_notes"),
        "extracted_data": analysis.get("extracted_data", {}),
        "cited_regulatory_note": analysis.get("cited_regulatory_note")
    }
