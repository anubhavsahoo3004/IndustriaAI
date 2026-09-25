from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.business import Business
from backend.app.models.document import Document
from backend.app.schemas.document import DocumentResponse, DocumentAttachRequest
from backend.app.services.document_service import DocumentService
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/documents", tags=["Document Management & AI Analysis"])

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    business_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access documents for this business.")

    return DocumentService.get_business_documents(db, business_id)

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    business_id: int = Form(...),
    document_type: str = Form(...),
    application_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = BusinessService.get_by_id(db, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload documents for this business.")

    # Validate file format
    allowed_extensions = ["pdf", "docx", "doc", "txt", "png", "jpg", "jpeg"]
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '.{ext}'. Supported: PDF, DOCX, TXT, PNG, JPG.")

    doc = await DocumentService.save_and_create_document(
        db=db,
        user=current_user,
        business=business,
        upload_file=file,
        document_type=document_type,
        application_id=application_id
    )
    return doc

@router.post("/{document_id}/validate")
async def validate_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = DocumentService.get_by_id(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    business = BusinessService.get_by_id(db, doc.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Associated business not found.")

    if current_user.role not in ["admin", "officer"] and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to validate documents for this business.")

    result = await DocumentService.revalidate_document(db, doc, business, current_user)
    return result

@router.post("/attach")
def attach_document(
    data: DocumentAttachRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = DocumentService.get_by_id(db, data.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    business = BusinessService.get_by_id(db, doc.business_id)
    if current_user.role not in ["admin", "officer"] and business and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to attach documents for this business.")

    link = DocumentService.attach_document_to_application(
        db=db,
        document_id=data.document_id,
        application_id=data.application_id,
        is_mandatory=data.is_mandatory
    )
    return {"status": "success", "message": "Document attached successfully.", "link_id": link.id}

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = DocumentService.get_by_id(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    business = BusinessService.get_by_id(db, doc.business_id)
    if current_user.role not in ["admin", "officer"] and business and business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to download documents for this business.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on disk storage.")

    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type="application/octet-stream"
    )
