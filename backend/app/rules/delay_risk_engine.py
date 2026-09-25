from typing import Dict, Any, List, Tuple
from datetime import datetime, timezone
from backend.app.models.application import Application
from backend.app.rules.workflow_state import TERMINAL_STATUSES, WorkflowStage, ApplicationStatus

# Configured threshold days per workflow stage
STAGE_THRESHOLD_DAYS = {
    "DOC_VERIFICATION": 7,
    "DEPT_REVIEW": 15,
    "INSPECTION": 12,
    "FINAL_DECISION": 7,
}

class DelayRiskEngine:
    """
    Transparent rule-based delay-risk engine.
    Evaluates concrete business, workflow, document, and SLA signals
    and outputs risk levels (LOW, MEDIUM, HIGH) with exact explainable reasons.
    """

    @classmethod
    def evaluate_risk(cls, application: Application, missing_mandatory_docs_count: int = 0, has_scheduled_inspection: bool = False) -> Tuple[str, List[str], str]:
        # INVARIANT: Completed or terminal applications cannot carry active delay risk
        if application.status in TERMINAL_STATUSES or application.current_stage == WorkflowStage.COMPLETED.value:
            return (
                "LOW",
                [f"Application review finalized with status '{application.status}'. All statutory scrutiny is closed and no active SLA risk exists."],
                "Application completed. No further SLA action required."
            )

        reasons = []
        risk_score = 0 # 0-2: LOW, 3-5: MEDIUM, 6+: HIGH
        now = datetime.now(timezone.utc)

        # 1. Mandatory Document check
        if missing_mandatory_docs_count > 0:
            reasons.append(f"{missing_mandatory_docs_count} mandatory document(s) missing or require resubmission")
            risk_score += 3

        # 2. Application Inactivity / Days in current stage
        days_in_stage = 0
        if application.updated_at:
            delta = now - application.updated_at.replace(tzinfo=timezone.utc if application.updated_at.tzinfo is None else None)
            days_in_stage = max(0, delta.days)

        threshold = STAGE_THRESHOLD_DAYS.get(application.current_stage, 10)
        if application.status not in ["APPROVED", "COMPLETED", "REJECTED"]:
            if days_in_stage > threshold * 1.5:
                reasons.append(f"Current stage ({application.current_stage}) active for {days_in_stage} days (exceeds SLA threshold of {threshold} days by 50%+)")
                risk_score += 4
            elif days_in_stage > threshold:
                reasons.append(f"Stage '{application.current_stage}' exceeded configured benchmark of {threshold} days ({days_in_stage} days elapsed)")
                risk_score += 2

        # 3. SLA Deadline Proximity
        if application.sla_deadline and application.status not in ["APPROVED", "COMPLETED", "REJECTED"]:
            sla_dt = application.sla_deadline.replace(tzinfo=timezone.utc if application.sla_deadline.tzinfo is None else None)
            days_to_deadline = (sla_dt - now).days
            if days_to_deadline < 0:
                reasons.append(f"Statutory SLA deadline breached by {abs(days_to_deadline)} days")
                risk_score += 5
            elif days_to_deadline <= 5:
                reasons.append(f"Approaching statutory SLA deadline in {days_to_deadline} days")
                risk_score += 3

        # 4. Inspection Requirement & Scheduling
        if application.approval_type and application.approval_type.inspection_required:
            if application.current_stage in ["INSPECTION", "DEPT_REVIEW"] and not has_scheduled_inspection:
                reasons.append("Mandatory field inspection not yet scheduled by department")
                risk_score += 2

        # 5. Status specific signals
        if application.status == "ACTION_REQUIRED":
            reasons.append("Application marked with ACTION_REQUIRED pending applicant response")
            risk_score += 3

        # Determine level
        if risk_score >= 5:
            level = "HIGH"
            suggested_mitigation = "Immediate administrative escalation: prioritize document verification and schedule officer inspection."
        elif risk_score >= 2:
            level = "MEDIUM"
            suggested_mitigation = "Follow up on pending document reviews and departmental clearance within 48 hours."
        else:
            level = "LOW"
            suggested_mitigation = "Application progressing within standard statutory SLA timelines."
            if not reasons:
                reasons.append("All workflow steps, document submissions, and review timelines are within normal parameters.")

        return level, reasons, suggested_mitigation
