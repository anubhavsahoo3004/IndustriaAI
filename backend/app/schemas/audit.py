from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    description: str
    ip_address: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogCreate(BaseModel):
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    description: str
    ip_address: Optional[str] = "127.0.0.1"
