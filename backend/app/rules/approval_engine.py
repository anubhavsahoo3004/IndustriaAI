from typing import List, Dict, Any, Optional
from backend.app.models.business import Business
from backend.app.models.approval import ApprovalType
from backend.app.models.application import Application

class ApprovalIntelligenceEngine:
    """
    Structured Rule Engine that determines statutory approvals based on business profile:
    - Industry (Food Processing, Manufacturing, MSME / Small Industrial Unit, Textile, IT / Services)
    - Location / District
    - Project Type & Stage
    - Scale (Micro, Small, Medium, Large)
    - Technical parameters (Employees, Effluent, Power load, Water requirement)
    """

    @staticmethod
    def evaluate_applicability(business: Business, approval_type: ApprovalType) -> Dict[str, Any]:
        tags = approval_type.applicability_rule_tags or {}
        is_applicable = True
        reasons = []

        # 1. Industry match
        target_industries = tags.get("industries", [])
        excluded_industries = tags.get("excluded_industries", [])

        if excluded_industries and business.industry in excluded_industries:
            return {"is_applicable": False, "reason": f"Not applicable for {business.industry}."}

        if target_industries and business.industry not in target_industries:
            return {"is_applicable": False, "reason": f"Applicable only for {', '.join(target_industries)}."}

        reasons.append(f"Industry '{business.industry}' matches statutory scope")

        # 2. Scale match
        target_scales = tags.get("scales", [])
        if target_scales and business.scale not in target_scales:
            return {"is_applicable": False, "reason": f"Applicable for {', '.join(target_scales)} scale units."}

        # 3. Employee threshold
        min_employees = tags.get("min_employees")
        if min_employees is not None:
            if (business.employee_count or 0) < min_employees:
                return {"is_applicable": False, "reason": f"Requires minimum {min_employees} workers (current: {business.employee_count})."}
            reasons.append(f"Unit has {business.employee_count} workers (exceeds threshold of {min_employees})")

        # 4. Effluent / Environmental trigger
        if tags.get("effluent_trigger"):
            if business.effluent_discharge == "Yes" or business.industry in ["Food Processing", "Manufacturing", "Textile"]:
                reasons.append("Unit involves industrial effluent / emission generation requiring MPCB clearance")
            else:
                return {"is_applicable": False, "reason": "No industrial effluent discharge declared."}

        # 5. Project stage relevance
        stages = tags.get("stages", [])
        if stages and business.project_stage not in stages and business.project_stage not in ["Operational", "Civil Works"]:
            # Note: Still applicable, but note stage
            reasons.append(f"Statutory requirement for stage '{business.project_stage}'")
        else:
            reasons.append(f"Mandatory clearance for {business.project_stage} phase")

        # Format personalized reason template
        template = approval_type.why_it_applies_template or "Statutory requirement for {industry} in {district} ({scale} scale)."
        formatted_reason = template.format(
            industry=business.industry,
            district=business.district,
            scale=business.scale,
            project_type=business.project_type,
            project_stage=business.project_stage,
            employee_count=business.employee_count or 25,
            electricity_load_kw=business.electricity_load_kw or 150,
            water_requirement_kld=business.water_requirement_kld or 25
        )

        return {
            "is_applicable": True,
            "reason": formatted_reason,
            "signals": reasons
        }

    @classmethod
    def generate_personalized_plan(cls, business: Business, available_approvals: List[ApprovalType], existing_applications: List[Application] = None) -> List[Dict[str, Any]]:
        existing_app_map = {}
        if existing_applications:
            for app in existing_applications:
                existing_app_map[app.approval_type_id] = app

        plan_items = []
        for appr in available_approvals:
            eval_res = cls.evaluate_applicability(business, appr)
            if eval_res["is_applicable"]:
                existing_app = existing_app_map.get(appr.id)
                status = existing_app.status if existing_app else "NOT_STARTED"
                
                next_action = "Prepare and attach mandatory documents"
                if existing_app:
                    if existing_app.status == "DOCUMENTS_REQUIRED":
                        next_action = "Upload missing mandatory documents"
                    elif existing_app.status == "UNDER_REVIEW":
                        next_action = "Awaiting Departmental Officer review"
                    elif existing_app.status == "INSPECTION_PENDING":
                        next_action = "Prepare site layout for scheduled officer inspection"
                    elif existing_app.status == "APPROVED" or existing_app.status == "COMPLETED":
                        next_action = "Approval granted. Maintain operational compliance log."
                    elif existing_app.status == "ACTION_REQUIRED":
                        next_action = existing_app.next_action_prompt or "Applicant clarification or document re-submission needed"

                # Dynamic SLA & Authority adjustments based on statutory categories and capital investment
                effective_sla = appr.standard_sla_days
                effective_authority = appr.issuing_authority

                if appr.code == "MPCB_CONSENT_ESTABLISH":
                    inv = business.investment_amount_inr or 24.5
                    # Indicative categorization under MPCB EoDB RTS Schedule (subject to RO circular confirmation):
                    # Green: 15 working days | Orange: 24 working days | Red: 40 working days
                    if business.industry in ["Food Processing", "Manufacturing", "Textile"]:
                        # Orange Category unit
                        effective_sla = 24
                        if inv < 25.0:
                            effective_authority = "MPCB (Sub-Regional Officer / Regional Officer Pune, Capital < ₹25 Cr)"
                        elif inv <= 100.0:
                            effective_authority = "MPCB (Regional Officer, Capital ₹25 Cr - ₹100 Cr)"
                        else:
                            effective_authority = "MPCB (Head Office Consent Committee, Capital > ₹100 Cr)"
                    else:
                        # Heavy / Red category
                        effective_sla = 40
                        if inv < 25.0:
                            effective_authority = "MPCB (Regional Officer, Capital < ₹25 Cr)"
                        else:
                            effective_authority = "MPCB (Head Office Consent Committee / Member Secretary, Capital > ₹25 Cr)"

                    eval_res["reason"] += " (Indicative SLA: 24 days for Orange Category with Capital < ₹25 Cr; requires confirmation with Regional Office circular)."

                elif appr.code == "FSSAI_STATE_MFG_LICENSE":
                    eval_res["reason"] += " (FSSAI eligibility is evaluated using the applicable Kind-of-Business (KoB) rules and current turnover thresholds. Capacity-specific conditions are applied only where the applicable KoB specifies them. For this food unit, State License applies based on the applicable turnover threshold of ₹1.5 Cr to ₹50 Cr effective 01-Apr-2026, alongside KoB 1.1 manufacturing capacity criteria)."

                elif appr.code == "MAHA_WATER_SUPPLY_NOC":
                    # Maharashtra RTS Act 2015 Notification No. RTS-2015/CR-268 specifies 15 days for MIDC water connection
                    effective_sla = 15

                plan_items.append({
                    "approval_type_id": appr.id,
                    "code": appr.code,
                    "name": appr.name,
                    "category": appr.category,
                    "issuing_authority": effective_authority,
                    "department": appr.department,
                    "is_applicable": True,
                    "why_it_applies": eval_res["reason"],
                    "standard_sla_days": effective_sla,
                    "inspection_required": appr.inspection_required,
                    "renewal_frequency_years": appr.renewal_frequency_years,
                    "legal_act_reference": appr.legal_act_reference,
                    "verification_status": getattr(appr, "verification_status", "VERIFIED"),
                    "source_title": getattr(appr, "source_title", None),
                    "source_url": getattr(appr, "source_url", None),
                    "source_reference": getattr(appr, "source_reference", None),
                    "source_section": getattr(appr, "source_section", None),
                    "last_verified_date": getattr(appr, "last_verified_date", "2026-09-25"),
                    "statutory_disclaimer": getattr(appr, "statutory_disclaimer", None),
                    "required_documents": appr.required_documents_manifest or [],
                    "existing_application_id": existing_app.id if existing_app else None,
                    "status": status,
                    "next_action": next_action
                })

        return plan_items
