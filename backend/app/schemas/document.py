from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentCheckItem(BaseModel):
    item: str
    result: str # MATCH, POTENTIAL_MISMATCH, MISSING, VERIFIED, WARNING
    details: Optional[str] = None

class DocumentValidationResult(BaseModel):
    status: str # VERIFIED, ACTION_REQUIRED, POTENTIAL_MISMATCH, REJECTED
    document_type_detected: str
    confidence_score: float = 0.95
    checks: List[DocumentCheckItem] = []
    summary: str
    recommended_action: str
    inconsistency_notes: Optional[str] = None
    extracted_data: Dict[str, Any] = {}

class DocumentResponse(BaseModel):
    id: int
    business_id: int
    user_id: int
    filename: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    file_hash: Optional[str] = None
    document_type: str
    status: str
    validation_result: Optional[Dict[str, Any]] = None
    extracted_metadata: Optional[Dict[str, Any]] = None
    ai_summary: Optional[str] = None
    inconsistency_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentAttachRequest(BaseModel):
    application_id: int
    document_id: int
    is_mandatory: bool = True
