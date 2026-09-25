import os
import shutil
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import UploadFile
from backend.app.core.config import settings
from backend.app.models.document import Document, ApplicationDocument
from backend.app.models.business import Business
from backend.app.models.user import User
from backend.app.models.application import Application
from backend.app.utils.document_parser import DocumentParser
from backend.app.ai.document_analyzer import DocumentAnalyzerService
from backend.app.services.audit_service import AuditService
from backend.app.services.notification_service import NotificationService

class DocumentService:
    @staticmethod
    def get_by_id(db: Session, document_id: int) -> Optional[Document]:
        return db.query(Document).filter(Document.id == document_id).first()

    @staticmethod
    def get_business_documents(db: Session, business_id: int) -> List[Document]:
        return db.query(Document).filter(Document.id != None, Document.business_id == business_id).order_by(Document.created_at.desc()).all()

    @classmethod
    async def save_and_create_document(
        cls,
        db: Session,
        user: User,
        business: Business,
        upload_file: UploadFile,
        document_type: str,
        application_id: Optional[int] = None
    ) -> Document:
        filename = upload_file.filename or "uploaded_doc"
        file_ext = filename.split(".")[-1].upper() if "." in filename else "TXT"
        
        # Unique disk file name
        import uuid
        safe_name = f"{business.id}_{uuid.uuid4().hex[:8]}_{filename}"
        disk_path = os.path.join(settings.UPLOAD_DIR, safe_name)
        with open(disk_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        file_size = os.path.getsize(disk_path)
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            if os.path.exists(disk_path):
                os.remove(disk_path)
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum permissible size of {settings.MAX_FILE_SIZE_MB}MB."
            )

        file_hash = DocumentParser.calculate_file_hash(disk_path)

        doc = Document(
            business_id=business.id,
            user_id=user.id,
            filename=safe_name,
            original_filename=filename,
            file_path=disk_path,
            file_type=file_ext,
            file_size_bytes=file_size,
            file_hash=file_hash,
            document_type=document_type,
            status="UPLOADED"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        AuditService.log(
            db,
            action="DOCUMENT_UPLOADED",
            description=f"Uploaded document '{filename}' for {business.name} as type '{document_type}'.",
            user=user,
            entity_type="Document",
            entity_id=str(doc.id)
        )

        # Attach to application if provided
        if application_id:
            cls.attach_document_to_application(db, doc.id, application_id)

        # Run automated completeness & consistency check
        analysis_result = await DocumentAnalyzerService.analyze_document(doc, business)
        doc.status = analysis_result.get("status", "VERIFIED")
        doc.validation_result = analysis_result
        doc.extracted_metadata = analysis_result.get("extracted_data", {})
        doc.ai_summary = analysis_result.get("summary")
        doc.inconsistency_notes = analysis_result.get("inconsistency_notes")

        db.commit()
        db.refresh(doc)

        AuditService.log(
            db,
            action="DOCUMENT_VALIDATED",
            description=f"Validated document '{filename}': status={doc.status}.",
            user=user,
            entity_type="Document",
            entity_id=str(doc.id)
        )

        if doc.status == "ACTION_REQUIRED":
            NotificationService.create_notification(
                db,
                user_id=user.id,
                business_id=business.id,
                title="Document Check: Action Required",
                message=f"Potential inconsistency detected in '{filename}' ({doc.document_type}). Please verify details.",
                type="WARNING",
                action_link=f"/documents"
            )

        return doc

    @classmethod
    async def revalidate_document(cls, db: Session, document: Document, business: Business, user: User) -> Dict[str, Any]:
        analysis_result = await DocumentAnalyzerService.analyze_document(document, business)
        document.status = analysis_result.get("status", "VERIFIED")
        document.validation_result = analysis_result
        document.extracted_metadata = analysis_result.get("extracted_data", {})
        document.ai_summary = analysis_result.get("summary")
        document.inconsistency_notes = analysis_result.get("inconsistency_notes")

        db.commit()
        db.refresh(document)

        AuditService.log(
            db,
            action="DOCUMENT_REVALIDATED",
            description=f"Re-validated document '{document.original_filename}'. Result: {document.status}.",
            user=user,
            entity_type="Document",
            entity_id=str(document.id)
        )

        return analysis_result

    @staticmethod
    def attach_document_to_application(db: Session, document_id: int, application_id: int, is_mandatory: bool = True) -> ApplicationDocument:
        existing = db.query(ApplicationDocument).filter(
            ApplicationDocument.document_id == document_id,
            ApplicationDocument.application_id == application_id
        ).first()
        if existing:
            return existing

        link = ApplicationDocument(
            application_id=application_id,
            document_id=document_id,
            is_mandatory=is_mandatory,
            status="ATTACHED"
        )
        db.add(link)
        db.commit()
        db.refresh(link)
        return link
