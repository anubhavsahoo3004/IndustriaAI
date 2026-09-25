from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.models.inspection import Inspection
from backend.app.models.application import Application
from backend.app.models.user import User
from backend.app.schemas.inspection import InspectionCreate, InspectionUpdate
from backend.app.rules.workflow_state import CanonicalWorkflowState, TERMINAL_STATUSES, ApplicationStatus, WorkflowStage
from backend.app.services.audit_service import AuditService
from backend.app.services.notification_service import NotificationService

class InspectionService:
    @staticmethod
    def get_by_id(db: Session, inspection_id: int) -> Optional[Inspection]:
        return db.query(Inspection).filter(Inspection.id == inspection_id).first()

    @staticmethod
    def get_inspections(
        db: Session,
        business_id: Optional[int] = None,
        application_id: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[Inspection]:
        query = db.query(Inspection)
        if business_id:
            query = query.filter(Inspection.business_id == business_id)
        if application_id:
            query = query.filter(Inspection.application_id == application_id)
        if status:
            query = query.filter(Inspection.status == status)
        return query.order_by(Inspection.scheduled_date.asc()).all()

    @classmethod
    def schedule_inspection(cls, db: Session, user: User, data: InspectionCreate) -> Inspection:
        inspection = Inspection(
            application_id=data.application_id,
            business_id=data.business_id,
            inspection_type=data.inspection_type,
            scheduled_date=data.scheduled_date,
            officer_name=data.officer_name,
            officer_designation=data.officer_designation or "Field Inspection Officer",
            officer_contact=data.officer_contact,
            location=data.location,
            applicant_action_required=data.applicant_action_required,
            status="SCHEDULED"
        )
        db.add(inspection)
        
        # Update application stage if needed
        app = db.query(Application).filter(Application.id == data.application_id).first()
        if app and app.status not in TERMINAL_STATUSES:
            app.status = ApplicationStatus.INSPECTION_PENDING.value
            app.current_stage = WorkflowStage.INSPECTION.value
            app.next_action_prompt = f"Field Inspection scheduled on {data.scheduled_date.strftime('%d %b %Y')}. Prepare site and documents."
            if app.workflow_steps:
                CanonicalWorkflowState.synchronize_workflow_steps(
                    steps=app.workflow_steps,
                    current_stage=app.current_stage,
                    status=app.status,
                    officer_notes=f"Inspection scheduled with {data.officer_name} on {data.scheduled_date.strftime('%d %b %Y')}",
                    updated_by=user.full_name
                )

        db.commit()
        db.refresh(inspection)

        AuditService.log(
            db,
            action="INSPECTION_SCHEDULED",
            description=f"Scheduled '{inspection.inspection_type}' on {inspection.scheduled_date.strftime('%Y-%m-%d')} by {inspection.officer_name}.",
            user=user,
            entity_type="Inspection",
            entity_id=str(inspection.id)
        )

        # Notify business owner
        if inspection.business and inspection.business.user_id:
            NotificationService.create_notification(
                db,
                user_id=inspection.business.user_id,
                business_id=inspection.business_id,
                title="Field Inspection Scheduled",
                message=f"A {inspection.inspection_type} is scheduled on {inspection.scheduled_date.strftime('%d %b %Y, %I:%M %p')} at {inspection.location}.",
                type="INSPECTION",
                action_link="/inspections"
            )

        return inspection

    @classmethod
    def update_inspection(cls, db: Session, inspection: Inspection, user: User, data: InspectionUpdate) -> Inspection:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(inspection, key, value)
        
        db.commit()
        db.refresh(inspection)

        AuditService.log(
            db,
            action="INSPECTION_UPDATED",
            description=f"Updated inspection #{inspection.id}: status={inspection.status}.",
            user=user,
            entity_type="Inspection",
            entity_id=str(inspection.id)
        )

        return inspection
