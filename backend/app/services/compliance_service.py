from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.models.compliance import ComplianceTask
from backend.app.models.business import Business
from backend.app.models.user import User
from backend.app.schemas.compliance import ComplianceTaskCreate, ComplianceTaskUpdate
from backend.app.services.audit_service import AuditService

class ComplianceService:
    @staticmethod
    def get_by_id(db: Session, task_id: int) -> Optional[ComplianceTask]:
        return db.query(ComplianceTask).filter(ComplianceTask.id == task_id).first()

    @staticmethod
    def get_business_tasks(db: Session, business_id: int, status: Optional[str] = None) -> List[ComplianceTask]:
        query = db.query(ComplianceTask).filter(ComplianceTask.business_id == business_id)
        if status:
            query = query.filter(ComplianceTask.status == status)
        return query.order_by(ComplianceTask.due_date.asc()).all()

    @classmethod
    def create_task(cls, db: Session, user: User, data: ComplianceTaskCreate) -> ComplianceTask:
        task = ComplianceTask(**data.model_dump())
        db.add(task)
        db.commit()
        db.refresh(task)

        AuditService.log(
            db,
            action="COMPLIANCE_TASK_CREATED",
            description=f"Added recurring compliance requirement: '{task.title}' (Due: {task.due_date.strftime('%Y-%m-%d')}).",
            user=user,
            entity_type="ComplianceTask",
            entity_id=str(task.id)
        )
        return task

    @classmethod
    def update_task(cls, db: Session, task: ComplianceTask, user: User, data: ComplianceTaskUpdate) -> ComplianceTask:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        if data.status == "COMPLETED" and not task.completed_at:
            task.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(task)

        AuditService.log(
            db,
            action="COMPLIANCE_TASK_UPDATED",
            description=f"Updated compliance task '{task.title}': status={task.status}.",
            user=user,
            entity_type="ComplianceTask",
            entity_id=str(task.id)
        )
        return task
