from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    business_id: Optional[int] = None
    title: str
    message: str
    type: str
    is_read: bool
    action_link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    user_id: int
    business_id: Optional[int] = None
    title: str
    message: str
    type: str = "INFO"
    action_link: Optional[str] = None
