from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AiAssistantRequest(BaseModel):
    query: str
    business_id: Optional[int] = None
    application_id: Optional[int] = None
    conversation_history: Optional[List[Dict[str, str]]] = []

class AiCitation(BaseModel):
    record_type: str # ApprovalType, Application, ComplianceTask, Scheme, KnowledgeBase
    title: str
    reference_id: Optional[str] = None
    note: str

class AiAssistantResponse(BaseModel):
    query: str
    response_text: str
    citations: List[AiCitation] = []
    suggested_actions: List[str] = []
    relevant_links: List[Dict[str, str]] = []
    mode: Optional[str] = "GROUNDED_RULE_ENGINE"
    is_fallback: Optional[bool] = False

class DocumentAnalysisRequest(BaseModel):
    document_id: int
    business_id: Optional[int] = None

class DocumentAnalysisResponse(BaseModel):
    document_id: int
    document_name: str
    document_type: str
    status: str
    confidence_score: float
    summary: str
    checks: List[Dict[str, Any]]
    recommended_action: str
    inconsistency_notes: Optional[str] = None
    extracted_data: Dict[str, Any]
    cited_regulatory_note: Optional[str] = None
