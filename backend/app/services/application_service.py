from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import random
from backend.app.models.application import Application
from backend.app.models.workflow import WorkflowStep
from backend.app.models.approval import ApprovalType
from backend.app.models.business import Business
from backend.app.models.user import User
from backend.app.models.document import ApplicationDocument
from backend.app.rules.delay_risk_engine import DelayRiskEngine
from backend.app.rules.workflow_state import (
    CanonicalWorkflowState,
    ApplicationStatus,
    WorkflowStage,
    StepStatus,
    TERMINAL_STATUSES,
    DEFAULT_STATUS_FOR_STAGE,
    VALID_STATUS_STAGE_MAP
)
from backend.app.services.audit_service import AuditService
from backend.app.services.notification_service import NotificationService

WORKFLOW_STAGE_MAP = {
    1: ("Submitted", "SUBMITTED"),
    2: ("Document Verification", "DOC_VERIFICATION"),
    3: ("Department Review", "DEPT_REVIEW"),
    4: ("Site Inspection", "INSPECTION"),
    5: ("Final Decision", "FINAL_DECISION")
}

class ApplicationService:
    @staticmethod
    def get_by_id(db: Session, application_id: int) -> Optional[Application]:
        return db.query(Application).filter(Application.id == application_id).first()

    @staticmethod
    def get_applications(
        db: Session,
        business_id: Optional[int] = None,
        status: Optional[str] = None,
        delay_risk: Optional[str] = None,
        limit: int = 100
    ) -> List[Application]:
        query = db.query(Application)
        if business_id:
            query = query.filter(Application.business_id == business_id)
        if status:
            query = query.filter(Application.status == status)
        if delay_risk:
            query = query.filter(Application.delay_risk_level == delay_risk)
        return query.order_by(Application.created_at.desc()).limit(limit).all()

    @classmethod
    def create_application(cls, db: Session, user: User, business: Business, approval_type: ApprovalType) -> Application:
        # Check if existing application already exists
        existing = db.query(Application).filter(
            Application.business_id == business.id,
            Application.approval_type_id == approval_type.id
        ).first()
        if existing:
            return existing

        rand_num = random.randint(1000, 9999)
        dept_code = approval_type.code.split("_")[0]
        app_number = f"MH-{dept_code}-2026-{rand_num}"

        now = datetime.now(timezone.utc)
        sla_deadline = now + timedelta(days=approval_type.standard_sla_days)

        app = Application(
            business_id=business.id,
            approval_type_id=approval_type.id,
            application_number=app_number,
            status="DOCUMENTS_REQUIRED",
            current_stage="DOC_VERIFICATION",
            submission_date=now,
            sla_deadline=sla_deadline,
            delay_risk_level="LOW",
            delay_risk_reasons=["Application initiated; upload mandatory documents to complete submission."],
            next_action_prompt=f"Upload required documents for {approval_type.name}",
            assigned_officer="Desk Scrutiny Officer"
        )
        db.add(app)
        db.commit()
        db.refresh(app)

        # Create workflow steps
        step_names = approval_type.default_workflow_steps or ["Submitted", "Document Verification", "Department Review", "Inspection", "Final Decision"]
        for idx, step_name in enumerate(step_names, 1):
            key = "SUBMITTED" if idx == 1 else ("DOC_VERIFICATION" if idx == 2 else ("DEPT_REVIEW" if idx == 3 else ("INSPECTION" if idx == 4 else "FINAL_DECISION")))
            status = "COMPLETED" if idx == 1 else ("IN_PROGRESS" if idx == 2 else "PENDING")
            step = WorkflowStep(
                application_id=app.id,
                step_name=step_name,
                step_key=key,
                step_order=idx,
                status=status,
                started_at=now if idx <= 2 else None,
                completed_at=now if idx == 1 else None,
                officer_notes="Application created online" if idx == 1 else None
            )
            db.add(step)

        db.commit()
        db.refresh(app)

        AuditService.log(
            db,
            action="APPLICATION_CREATED",
            description=f"Created application {app.application_number} for {approval_type.name}.",
            user=user,
            entity_type="Application",
            entity_id=str(app.id)
        )

        NotificationService.create_notification(
            db,
            user_id=user.id,
            business_id=business.id,
            title="Application Initiated",
            message=f"Application {app.application_number} ({approval_type.name}) created. Please attach mandatory documents.",
            type="INFO",
            action_link=f"/applications/{app.id}"
        )

        return app

    @classmethod
    def update_application_status(
        cls,
        db: Session,
        application: Application,
        user: User,
        status: Optional[str] = None,
        current_stage: Optional[str] = None,
        officer_remarks: Optional[str] = None,
        assigned_officer: Optional[str] = None,
        advance_stage: bool = False
    ) -> Application:
        now = datetime.now(timezone.utc)
        steps = db.query(WorkflowStep).filter(WorkflowStep.application_id == application.id).order_by(WorkflowStep.step_order).all()

        if advance_stage:
            # Advance workflow step logic sequentially
            current_idx = -1
            for i, st in enumerate(steps):
                if st.status == "IN_PROGRESS" or st.step_key == application.current_stage:
                    current_idx = i
                    break
            
            if current_idx != -1 and current_idx + 1 < len(steps):
                next_step = steps[current_idx + 1]
                application.current_stage = next_step.step_key
                # Harmonize status for advanced stage
                if next_step.step_key == WorkflowStage.INSPECTION.value:
                    application.status = ApplicationStatus.INSPECTION_PENDING.value
                elif next_step.step_key == WorkflowStage.FINAL_DECISION.value:
                    application.status = ApplicationStatus.UNDER_REVIEW.value
                elif next_step.step_key == WorkflowStage.COMPLETED.value:
                    application.status = ApplicationStatus.APPROVED.value
                    application.current_stage = WorkflowStage.COMPLETED.value
                else:
                    application.status = ApplicationStatus.UNDER_REVIEW.value
            else:
                # Reached final stage
                application.status = ApplicationStatus.APPROVED.value
                application.current_stage = WorkflowStage.COMPLETED.value
        else:
            # Canonical harmonization of explicitly provided or existing status and stage
            target_status, target_stage = CanonicalWorkflowState.harmonize_state(
                status=status,
                stage=current_stage,
                current_status=application.status,
                current_stage=application.current_stage
            )
            application.status = target_status
            application.current_stage = target_stage

        if officer_remarks:
            application.officer_remarks = officer_remarks
        if assigned_officer:
            application.assigned_officer = assigned_officer

        if application.status in [ApplicationStatus.APPROVED.value, ApplicationStatus.COMPLETED.value]:
            application.next_action_prompt = "Statutory approval granted. Clearance certificate active."

        # Synchronize all workflow step records to guarantee consistency with canonical state
        CanonicalWorkflowState.synchronize_workflow_steps(
            steps=steps,
            current_stage=application.current_stage,
            status=application.status,
            officer_notes=officer_remarks,
            updated_by=user.full_name
        )

        # Re-evaluate Delay Risk
        missing_count = 0 if application.status in TERMINAL_STATUSES else cls.count_missing_mandatory_documents(db, application)
        has_inspection = len(application.inspections) > 0
        risk_level, reasons, mitigation = DelayRiskEngine.evaluate_risk(
            application=application,
            missing_mandatory_docs_count=missing_count,
            has_scheduled_inspection=has_inspection
        )
        application.delay_risk_level = risk_level
        application.delay_risk_reasons = reasons

        db.commit()
        db.refresh(application)

        AuditService.log(
            db,
            action="APPLICATION_STATUS_UPDATED",
            description=f"Updated application {application.application_number}: status={application.status}, stage={application.current_stage}.",
            user=user,
            entity_type="Application",
            entity_id=str(application.id)
        )

        # Notify business owner
        if application.business and application.business.user_id:
            notif_type = "ALERT" if application.status == "ACTION_REQUIRED" else ("SUCCESS" if application.status in ["APPROVED", "COMPLETED"] else "INFO")
            NotificationService.create_notification(
                db,
                user_id=application.business.user_id,
                business_id=application.business_id,
                title=f"Application Update: {application.application_number}",
                message=f"Status changed to {application.status} ({application.current_stage}). Remarks: {officer_remarks or 'Stage advanced.'}",
                type=notif_type,
                action_link=f"/applications/{application.id}"
            )

        return application

    @staticmethod
    def count_missing_mandatory_documents(db: Session, application: Application) -> int:
        if not application.approval_type:
            return 0
        manifest = application.approval_type.required_documents_manifest or []
        attached_links = db.query(ApplicationDocument).filter(ApplicationDocument.application_id == application.id).all()
        attached_doc_ids = [al.document_id for al in attached_links]
        
        # Get uploaded docs
        from backend.app.models.document import Document
        docs = db.query(Document).filter(Document.id.in_(attached_doc_ids)).all() if attached_doc_ids else []
        attached_types = [d.document_type for d in docs if d.status != "REJECTED"]

        missing = 0
        for item in manifest:
            if item.get("mandatory") and item.get("doc_type") not in attached_types:
                missing += 1
        return missing
