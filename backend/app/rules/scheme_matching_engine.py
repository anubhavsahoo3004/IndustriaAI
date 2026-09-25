from typing import List, Dict, Any
from backend.app.models.business import Business
from backend.app.models.scheme import SupportScheme

class SchemeMatchingEngine:
    """
    Evaluates business profile parameters against Maharashtra industrial support schemes
    and computes match scores, tailored eligibility reasons, and next action recommendations.
    """

    @classmethod
    def match_schemes(cls, business: Business, schemes: List[SupportScheme]) -> List[Dict[str, Any]]:
        results = []

        for scheme in schemes:
            score = 0
            max_score = 5
            reasons = []

            # 1. Industry match
            target_industries = scheme.target_industries or []
            if "All" in target_industries or business.industry in target_industries:
                score += 2
                reasons.append(f"Direct industry match for '{business.industry}'")
            else:
                # Incompatible industry
                continue

            # 2. Location / District match
            target_districts = scheme.eligible_districts or []
            if "All" in target_districts or business.district in target_districts:
                score += 1
                reasons.append(f"Eligible district location ({business.district}, Maharashtra)")

            # 3. Project Stage match
            target_stages = scheme.eligible_project_stages or []
            if not target_stages or business.project_type in target_stages or business.project_stage in target_stages:
                score += 1
                reasons.append(f"Project stage/type '{business.project_type}' is supported")

            # 4. Investment Range check
            inv = business.investment_amount_inr or 10.0
            if scheme.investment_range_min <= inv <= scheme.investment_range_max:
                score += 1
                reasons.append(f"Investment scale of ₹{inv} Cr falls within scheme limits (₹{scheme.investment_range_min} - ₹{scheme.investment_range_max} Cr)")

            match_percentage = int((score / max_score) * 100)
            if match_percentage >= 60:
                # Formulate next step
                next_step = f"Apply via {scheme.application_mode} with DPR and Udyam Registration."

                results.append({
                    "scheme": scheme,
                    "is_matched": True,
                    "match_score": match_percentage,
                    "match_reasons": reasons,
                    "next_step": next_step,
                    "estimated_benefit": scheme.benefits_summary
                })

        # Sort by match score descending
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results
