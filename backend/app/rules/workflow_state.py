"""
Canonical Application State & Workflow Engine for IndustriaAI.

Defines:
- Canonical Application Statuses
- Canonical Workflow Stages
- Canonical Step Statuses
- Valid Status-Stage Combinations
- Valid Stage Transitions
- State Harmonization and Workflow Step Synchronization
"""

from enum import Enum
from typing import Dict, List, Optional, Tuple, Set, Any
from datetime import datetime, timezone

class ApplicationStatus(str, Enum):
    DRAFT = "DRAFT"
    DOCUMENTS_REQUIRED = "DOCUMENTS_REQUIRED"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    INSPECTION_PENDING = "INSPECTION_PENDING"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

class WorkflowStage(str, Enum):
    SUBMITTED = "SUBMITTED"
    DOC_VERIFICATION = "DOC_VERIFICATION"
    DEPT_REVIEW = "DEPT_REVIEW"
    INSPECTION = "INSPECTION"
    FINAL_DECISION = "FINAL_DECISION"
    COMPLETED = "COMPLETED"

class StepStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    REJECTED = "REJECTED"

# Standard sequential stage order
STAGE_ORDER: List[str] = [
    WorkflowStage.SUBMITTED.value,
    WorkflowStage.DOC_VERIFICATION.value,
    WorkflowStage.DEPT_REVIEW.value,
    WorkflowStage.INSPECTION.value,
    WorkflowStage.FINAL_DECISION.value,
    WorkflowStage.COMPLETED.value,
]

# Canonical human-readable stage labels
STAGE_LABELS: Dict[str, str] = {
    WorkflowStage.SUBMITTED.value: "Initial Submission",
    WorkflowStage.DOC_VERIFICATION.value: "Document Verification",
    WorkflowStage.DEPT_REVIEW.value: "Department Review",
    WorkflowStage.INSPECTION.value: "Site Inspection",
    WorkflowStage.FINAL_DECISION.value: "Final Decision",
    WorkflowStage.COMPLETED.value: "Completed",
}

# Strict set of valid (Status, Stage) combinations
# Invariant: An application's status and current_stage must belong to this mapping.
VALID_STATUS_STAGE_MAP: Dict[str, Set[str]] = {
    ApplicationStatus.DRAFT.value: {
        WorkflowStage.SUBMITTED.value,
    },
    ApplicationStatus.DOCUMENTS_REQUIRED.value: {
        WorkflowStage.SUBMITTED.value,
        WorkflowStage.DOC_VERIFICATION.value,
    },
    ApplicationStatus.SUBMITTED.value: {
        WorkflowStage.SUBMITTED.value,
        WorkflowStage.DOC_VERIFICATION.value,
    },
    ApplicationStatus.UNDER_REVIEW.value: {
        WorkflowStage.DOC_VERIFICATION.value,
        WorkflowStage.DEPT_REVIEW.value,
        WorkflowStage.FINAL_DECISION.value,
    },
    ApplicationStatus.INSPECTION_PENDING.value: {
        WorkflowStage.INSPECTION.value,
    },
    ApplicationStatus.ACTION_REQUIRED.value: {
        WorkflowStage.DOC_VERIFICATION.value,
        WorkflowStage.DEPT_REVIEW.value,
        WorkflowStage.INSPECTION.value,
        WorkflowStage.FINAL_DECISION.value,
    },
    ApplicationStatus.APPROVED.value: {
        WorkflowStage.FINAL_DECISION.value,
        WorkflowStage.COMPLETED.value,
    },
    ApplicationStatus.REJECTED.value: {
        WorkflowStage.FINAL_DECISION.value,
        WorkflowStage.COMPLETED.value,
    },
    ApplicationStatus.COMPLETED.value: {
        WorkflowStage.COMPLETED.value,
    },
}

# Terminal statuses where an application's review process is finished
TERMINAL_STATUSES: Set[str] = {
    ApplicationStatus.APPROVED.value,
    ApplicationStatus.REJECTED.value,
    ApplicationStatus.COMPLETED.value,
}

# Default stage when changing status if not explicitly given
DEFAULT_STAGE_FOR_STATUS: Dict[str, str] = {
    ApplicationStatus.DRAFT.value: WorkflowStage.SUBMITTED.value,
    ApplicationStatus.DOCUMENTS_REQUIRED.value: WorkflowStage.DOC_VERIFICATION.value,
    ApplicationStatus.SUBMITTED.value: WorkflowStage.SUBMITTED.value,
    ApplicationStatus.UNDER_REVIEW.value: WorkflowStage.DEPT_REVIEW.value,
    ApplicationStatus.INSPECTION_PENDING.value: WorkflowStage.INSPECTION.value,
    ApplicationStatus.ACTION_REQUIRED.value: WorkflowStage.DOC_VERIFICATION.value,
    ApplicationStatus.APPROVED.value: WorkflowStage.COMPLETED.value,
    ApplicationStatus.REJECTED.value: WorkflowStage.COMPLETED.value,
    ApplicationStatus.COMPLETED.value: WorkflowStage.COMPLETED.value,
}

# Default status when a stage is directly picked
DEFAULT_STATUS_FOR_STAGE: Dict[str, str] = {
    WorkflowStage.SUBMITTED.value: ApplicationStatus.SUBMITTED.value,
    WorkflowStage.DOC_VERIFICATION.value: ApplicationStatus.UNDER_REVIEW.value,
    WorkflowStage.DEPT_REVIEW.value: ApplicationStatus.UNDER_REVIEW.value,
    WorkflowStage.INSPECTION.value: ApplicationStatus.INSPECTION_PENDING.value,
    WorkflowStage.FINAL_DECISION.value: ApplicationStatus.UNDER_REVIEW.value,
    WorkflowStage.COMPLETED.value: ApplicationStatus.APPROVED.value,
}

class CanonicalWorkflowState:
    """
    Authoritative state validation, harmonization, and synchronization engine.
    """

    @staticmethod
    def is_valid_combination(status: str, stage: str) -> bool:
        """Checks if a (status, stage) pair is strictly valid."""
        allowed_stages = VALID_STATUS_STAGE_MAP.get(status)
        if allowed_stages is None:
            return False
        return stage in allowed_stages

    @classmethod
    def validate_state(cls, status: str, stage: str) -> Tuple[bool, Optional[str]]:
        """
        Validates the state and returns (is_valid, error_detail).
        Catches known contradictory states.
        """
        if status not in VALID_STATUS_STAGE_MAP:
            return False, f"Invalid application status '{status}'."

        if stage not in [s.value for s in WorkflowStage]:
            return False, f"Invalid workflow stage '{stage}'."

        # Specific contradiction guards
        if stage == WorkflowStage.COMPLETED.value and status == ApplicationStatus.UNDER_REVIEW.value:
            return False, "Contradictory state: current_stage cannot be 'COMPLETED' while status is 'UNDER_REVIEW'."

        if status == ApplicationStatus.APPROVED.value and stage in [
            WorkflowStage.SUBMITTED.value,
            WorkflowStage.DOC_VERIFICATION.value,
            WorkflowStage.DEPT_REVIEW.value,
            WorkflowStage.INSPECTION.value
        ]:
            return False, f"Contradictory state: status cannot be 'APPROVED' while workflow is at earlier stage '{stage}'."

        if status == ApplicationStatus.INSPECTION_PENDING.value and stage != WorkflowStage.INSPECTION.value:
            return False, f"Contradictory state: status 'INSPECTION_PENDING' must be in stage 'INSPECTION', not '{stage}'."

        if not cls.is_valid_combination(status, stage):
            allowed = list(VALID_STATUS_STAGE_MAP.get(status, []))
            return False, f"Invalid stage '{stage}' for status '{status}'. Valid stages are: {allowed}."

        return True, None

    @classmethod
    def harmonize_state(
        cls,
        status: Optional[str],
        stage: Optional[str],
        current_status: str,
        current_stage: str
    ) -> Tuple[str, str]:
        """
        Takes potentially partial or conflicting inputs and returns a guaranteed
        consistent (canonical_status, canonical_stage) tuple.
        """
        target_status = status or current_status
        target_stage = stage or current_stage

        # Rule 1: Terminal statuses mandate COMPLETED stage
        if target_status in [ApplicationStatus.APPROVED.value, ApplicationStatus.COMPLETED.value]:
            if target_stage not in [WorkflowStage.FINAL_DECISION.value, WorkflowStage.COMPLETED.value]:
                target_stage = WorkflowStage.COMPLETED.value
            if target_status == ApplicationStatus.COMPLETED.value:
                target_stage = WorkflowStage.COMPLETED.value

        # Rule 2: COMPLETED stage mandates terminal status
        elif target_stage == WorkflowStage.COMPLETED.value:
            if target_status not in TERMINAL_STATUSES:
                target_status = ApplicationStatus.APPROVED.value

        # Rule 3: INSPECTION stage harmonization
        elif target_stage == WorkflowStage.INSPECTION.value:
            if target_status not in [ApplicationStatus.INSPECTION_PENDING.value, ApplicationStatus.ACTION_REQUIRED.value]:
                target_status = ApplicationStatus.INSPECTION_PENDING.value

        # Rule 4: INSPECTION_PENDING status mandates INSPECTION stage
        elif target_status == ApplicationStatus.INSPECTION_PENDING.value:
            target_stage = WorkflowStage.INSPECTION.value

        # Rule 5: Fallback to default stage for status if pair is still invalid
        if not cls.is_valid_combination(target_status, target_stage):
            target_stage = DEFAULT_STAGE_FOR_STATUS.get(target_status, WorkflowStage.DOC_VERIFICATION.value)

        return target_status, target_stage

    @classmethod
    def synchronize_workflow_steps(
        cls,
        steps: List[Any],
        current_stage: str,
        status: str,
        officer_notes: Optional[str] = None,
        updated_by: Optional[str] = None
    ) -> None:
        """
        Synchronizes all workflow step entities with the application's canonical
        status and current_stage.
        
        Guarantees:
        - Completed applications show all steps COMPLETED. No spinning in-progress icons.
        - Steps prior to current_stage are COMPLETED.
        - Current step reflects status (IN_PROGRESS, ACTION_REQUIRED, REJECTED, COMPLETED).
        - Subsequent steps are PENDING.
        """
        if not steps:
            return

        sorted_steps = sorted(steps, key=lambda s: s.step_order)
        now = datetime.now(timezone.utc)

        # Find matching stage index
        stage_idx = -1
        for i, s in enumerate(sorted_steps):
            if s.step_key == current_stage:
                stage_idx = i
                break

        # If terminal/completed, ALL steps are completed
        if status in [ApplicationStatus.APPROVED.value, ApplicationStatus.COMPLETED.value] or current_stage == WorkflowStage.COMPLETED.value:
            for s in sorted_steps:
                s.status = StepStatus.COMPLETED.value
                if not s.started_at:
                    s.started_at = now
                if not s.completed_at:
                    s.completed_at = now
                if not s.officer_notes and s.step_key in ["FINAL_DECISION", "COMPLETED"]:
                    s.officer_notes = officer_notes or "Approval granted and clearance issued by competent authority."
                if updated_by:
                    s.updated_by = updated_by
            return

        # If stage_idx not found, treat based on STAGE_ORDER
        if stage_idx == -1:
            try:
                canonical_order = STAGE_ORDER.index(current_stage)
            except ValueError:
                canonical_order = 1

            for s in sorted_steps:
                try:
                    s_order = STAGE_ORDER.index(s.step_key)
                except ValueError:
                    s_order = s.step_order - 1

                if s_order < canonical_order:
                    s.status = StepStatus.COMPLETED.value
                    if not s.completed_at:
                        s.completed_at = now
                elif s_order == canonical_order:
                    s.status = StepStatus.ACTION_REQUIRED.value if status == ApplicationStatus.ACTION_REQUIRED.value else StepStatus.IN_PROGRESS.value
                    if not s.started_at:
                        s.started_at = now
                    s.completed_at = None
                else:
                    s.status = StepStatus.PENDING.value
                    s.completed_at = None
            return

        # Synchronize according to stage_idx
        for i, s in enumerate(sorted_steps):
            if i < stage_idx:
                s.status = StepStatus.COMPLETED.value
                if not s.started_at:
                    s.started_at = now
                if not s.completed_at:
                    s.completed_at = now
            elif i == stage_idx:
                if status == ApplicationStatus.ACTION_REQUIRED.value:
                    s.status = StepStatus.ACTION_REQUIRED.value
                elif status == ApplicationStatus.REJECTED.value:
                    s.status = StepStatus.REJECTED.value
                else:
                    s.status = StepStatus.IN_PROGRESS.value
                
                if not s.started_at:
                    s.started_at = now
                s.completed_at = None
                if officer_notes:
                    s.officer_notes = officer_notes
                if updated_by:
                    s.updated_by = updated_by
            else:
                s.status = StepStatus.PENDING.value
                s.completed_at = None
