from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.models.application import Application
from backend.app.models.business import Business
from backend.app.models.inspection import Inspection
from backend.app.models.document import Document
from backend.app.rules.delay_risk_engine import STAGE_THRESHOLD_DAYS
from backend.app.rules.workflow_state import (
    CanonicalWorkflowState,
    ApplicationStatus,
    WorkflowStage,
    TERMINAL_STATUSES,
    STAGE_LABELS
)

STATUS_COLORS = {
    "NOT_STARTED": "#94a3b8",
    "DOCUMENTS_REQUIRED": "#f59e0b",
    "SUBMITTED": "#3b82f6",
    "UNDER_REVIEW": "#6366f1",
    "INSPECTION_PENDING": "#8b5cf6",
    "APPROVED": "#10b981",
    "REJECTED": "#ef4444",
    "ACTION_REQUIRED": "#f97316",
    "COMPLETED": "#059669"
}

class AnalyticsService:
    @classmethod
    def get_overview_analytics(cls, db: Session, business_id: Optional[int] = None) -> Dict[str, Any]:
        apps_query = db.query(Application)
        inspections_query = db.query(Inspection)
        businesses_query = db.query(Business)

        if business_id:
            apps_query = apps_query.filter(Application.business_id == business_id)
            inspections_query = inspections_query.filter(Inspection.business_id == business_id)
            businesses_query = businesses_query.filter(Business.id == business_id)

        apps = apps_query.all()
        businesses = businesses_query.all()
        inspections = inspections_query.all()

        total_apps = len(apps)
        now = datetime.now(timezone.utc)

        # Count statuses
        status_counts = {}
        stage_counts = {}
        industry_counts = {}

        pending_apps = 0
        under_review_apps = 0
        action_req_apps = 0
        near_sla_apps = 0
        delayed_apps = 0
        completed_apps = 0

        sla_risk_items = []

        for app in apps:
            # Status tally
            st = app.status
            status_counts[st] = status_counts.get(st, 0) + 1

            # INVARIANT: Completed/approved applications do not carry SLA delay risk and require no further action
            is_terminal = app.status in TERMINAL_STATUSES or app.current_stage == WorkflowStage.COMPLETED.value

            # Canonical Action Required condition: non-terminal and (missing docs, action required, or high SLA delay risk)
            is_action_required = not is_terminal and (
                st in ["DOCUMENTS_REQUIRED", "ACTION_REQUIRED"] or app.delay_risk_level == "HIGH"
            )
            if is_action_required:
                action_req_apps += 1

            if st in ["APPROVED", "COMPLETED"]:
                completed_apps += 1
            elif st in ["UNDER_REVIEW", "INSPECTION_PENDING"]:
                under_review_apps += 1
            elif st == "SUBMITTED":
                pending_apps += 1

            # Stage tally
            sg = app.current_stage or "DOC_VERIFICATION"
            stage_counts[sg] = stage_counts.get(sg, 0) + 1

            # Industry tally
            ind = app.business.industry if app.business else "General Industrial"
            industry_counts[ind] = industry_counts.get(ind, 0) + 1

            # SLA & Delay risk tally - INVARIANT: Completed/approved applications do not carry SLA delay risk
            if not is_terminal:
                if app.delay_risk_level == "HIGH":
                    delayed_apps += 1
                elif app.delay_risk_level == "MEDIUM":
                    near_sla_apps += 1

            # Days in stage calculation
            days_in_stage = 0
            if app.updated_at:
                delta = now - app.updated_at.replace(tzinfo=timezone.utc if app.updated_at.tzinfo is None else None)
                days_in_stage = max(0, delta.days)

            if not is_terminal and app.delay_risk_level in ["HIGH", "MEDIUM"]:
                sla_risk_items.append({
                    "application_id": app.id,
                    "application_number": app.application_number,
                    "approval_name": app.approval_type.name if app.approval_type else "Clearance",
                    "business_name": app.business.name if app.business else "Industrial Unit",
                    "industry": app.business.industry if app.business else "Manufacturing",
                    "risk_level": app.delay_risk_level,
                    "current_stage": app.current_stage,
                    "days_in_current_stage": days_in_stage,
                    "configured_sla_days": app.approval_type.standard_sla_days if app.approval_type else 30,
                    "reasons": app.delay_risk_reasons or ["Approaching departmental scrutiny threshold"],
                    "suggested_mitigation": "Prioritize scrutiny queue and notify field inspection officer." if app.delay_risk_level == "HIGH" else "Monitor pending document verification."
                })

        # Format status breakdown
        status_breakdown = []
        for st, count in status_counts.items():
            pct = round((count / max(1, total_apps)) * 100, 1)
            status_breakdown.append({
                "status": st,
                "count": count,
                "percentage": pct,
                "color": STATUS_COLORS.get(st, "#64748b")
            })

        # Format industry breakdown
        industry_breakdown = []
        for ind, count in industry_counts.items():
            pct = round((count / max(1, total_apps)) * 100, 1)
            industry_breakdown.append({
                "industry": ind,
                "count": count,
                "percentage": pct
            })

        # Format stage breakdown
        stage_breakdown = []
        for sg, count in stage_counts.items():
            stage_breakdown.append({
                "stage": STAGE_LABELS.get(sg, sg),
                "count": count
            })

        # Bottleneck Analysis calculation based on active application stages
        active_stages = ["DOC_VERIFICATION", "DEPT_REVIEW", "INSPECTION", "FINAL_DECISION"]
        total_active_in_pipeline = sum([stage_counts.get(s, 0) for s in active_stages])
        
        bottlenecks = []
        for s in active_stages:
            cnt = stage_counts.get(s, 0)
            pct = round((cnt / max(1, total_active_in_pipeline)) * 100, 1) if total_active_in_pipeline > 0 else 0.0
            thresh = STAGE_THRESHOLD_DAYS.get(s, 10)
            is_crit = pct >= 30.0 or (s == "DOC_VERIFICATION" and cnt > 2)

            explanation = (
                f"High concentration of applications ({cnt}) awaiting initial scrutiny and annexure consistency checks."
                if s == "DOC_VERIFICATION" else
                (
                    f"Inter-departmental cross-examination and NOC approvals taking {thresh}+ days."
                    if s == "DEPT_REVIEW" else
                    f"Officer site visit coordination and report submission backlog."
                )
            )

            bottlenecks.append({
                "stage_name": STAGE_LABELS.get(s, s),
                "stage_key": s,
                "count": cnt,
                "percentage": pct,
                "avg_days_in_stage": round(thresh * 0.85, 1),
                "threshold_days": thresh,
                "is_critical": is_crit,
                "explanation": explanation
            })

        # Sort bottlenecks by count descending
        bottlenecks.sort(key=lambda x: x["count"], reverse=True)

        return {
            "total_applications": total_apps,
            "pending_applications": pending_apps,
            "under_review_applications": under_review_apps,
            "action_required_applications": action_req_apps,
            "near_sla_applications": near_sla_apps,
            "delayed_applications": delayed_apps,
            "completed_applications": completed_apps,
            "total_businesses": len(businesses),
            "total_inspections": len(inspections),
            "status_breakdown": status_breakdown,
            "industry_breakdown": industry_breakdown,
            "stage_breakdown": stage_breakdown,
            "bottlenecks": bottlenecks,
            "sla_risks": sla_risk_items
        }
