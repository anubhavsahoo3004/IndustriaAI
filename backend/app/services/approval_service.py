from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from backend.app.models.approval import ApprovalType
from backend.app.models.business import Business
from backend.app.models.application import Application
from backend.app.rules.approval_engine import ApprovalIntelligenceEngine

class ApprovalService:
    @staticmethod
    def get_all_approval_types(db: Session) -> List[ApprovalType]:
        return db.query(ApprovalType).all()

    @staticmethod
    def get_approval_type_by_id(db: Session, approval_type_id: int) -> Optional[ApprovalType]:
        return db.query(ApprovalType).filter(ApprovalType.id == approval_type_id).first()

    @staticmethod
    def get_approval_type_by_code(db: Session, code: str) -> Optional[ApprovalType]:
        return db.query(ApprovalType).filter(ApprovalType.code == code).first()

    @staticmethod
    def generate_plan_for_business(db: Session, business: Business) -> Dict[str, Any]:
        all_approvals = db.query(ApprovalType).all()
        existing_applications = db.query(Application).filter(Application.business_id == business.id).all()

        plan_items = ApprovalIntelligenceEngine.generate_personalized_plan(
            business=business,
            available_approvals=all_approvals,
            existing_applications=existing_applications
        )

        critical_env = len([p for p in plan_items if p["category"] in ["Environmental", "Safety & Fire"]])
        licensing = len([p for p in plan_items if p["category"] in ["Licensing & Safety", "Industrial Equipment Safety", "Labour & Safety"]])

        ai_summary = (
            f"Statutory compliance roadmap generated for {business.name} ({business.industry}, {business.scale} Scale in {business.district}, Maharashtra). "
            f"Identified {len(plan_items)} relevant statutory approvals including {critical_env} high-priority safety/environmental clearances. "
            f"Adherence to MPCB, DISH, and local MIDC/FDA regulations is prioritized."
        )

        return {
            "business_id": business.id,
            "business_name": business.name,
            "industry": business.industry,
            "location": f"{business.district}, {business.state}",
            "scale": business.scale,
            "total_recommended_approvals": len(plan_items),
            "critical_environmental_approvals": critical_env,
            "operational_licensing_approvals": licensing,
            "items": plan_items,
            "ai_strategic_summary": ai_summary
        }
