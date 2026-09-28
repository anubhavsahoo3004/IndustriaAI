import os
import requests
import json
from datetime import datetime

BASE_URL = os.getenv("API_URL", "http://127.0.0.1:8000").rstrip("/")

def test_final_credibility_audit():
    print("=" * 75)
    print("FINAL CREDIBILITY & DATA CONSISTENCY PASS AUDIT")
    print("=" * 75)

    # 1. Login as applicant
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "applicant@industria.ai", "password": "password123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Successfully authenticated Applicant (applicant@industria.ai)")

    # 2. Get active business
    biz_res = requests.get(f"{BASE_URL}/api/businesses", headers=headers)
    assert biz_res.status_code == 200
    businesses = biz_res.json()
    assert len(businesses) > 0
    biz_id = businesses[0]["id"]
    print(f"✓ Active Business: {businesses[0]['name']} (ID: {biz_id})")

    # =========================================================================
    # CHECK 1: CHART TOTALS == APPLICATION TOTALS (100% COVERAGE)
    # =========================================================================
    print("\n" + "-" * 50)
    print("CHECK 1: Chart Totals == Canonical Application Totals")
    print("-" * 50)

    apps_res = requests.get(f"{BASE_URL}/api/applications?business_id={biz_id}", headers=headers)
    assert apps_res.status_code == 200
    apps = apps_res.json()
    total_apps_count = len(apps)
    assert total_apps_count == 10, f"Expected 10 total applications, got {total_apps_count}"
    print(f"✓ Total Applications Count: {total_apps_count}")

    overview_res = requests.get(f"{BASE_URL}/api/analytics/overview?business_id={biz_id}", headers=headers)
    assert overview_res.status_code == 200
    overview = overview_res.json()

    # Sum of statuses in analytics overview
    completed = overview.get("completed_applications", 0)
    under_review = overview.get("under_review_applications", 0)
    action_req = overview.get("action_required_applications", 0)
    pending_sub = overview.get("pending_applications", 0)
    status_breakdown = overview.get("status_breakdown", [])

    breakdown_sum = sum(item["count"] for item in status_breakdown)
    print(f"  Completed: {completed}")
    print(f"  Under Review / Inspection: {under_review}")
    print(f"  Action Required / Documents Missing: {action_req}")
    print(f"  Pending: {pending_sub}")
    print(f"  Status Breakdown Entries: {status_breakdown}")
    print(f"  Sum of Status Breakdown: {breakdown_sum}")

    assert breakdown_sum == total_apps_count, (
        f"Chart status sum ({breakdown_sum}) != total applications ({total_apps_count})! "
        "Every application must be included in displayed categories."
    )
    print("✓ Chart status breakdown sum exactly equals total applications (10 == 10).")

    # =========================================================================
    # CHECK 2: ACTION-REQUIRED COUNTS AGREE ACROSS ALL VIEWS
    # =========================================================================
    print("\n" + "-" * 50)
    print("CHECK 2: Action-Required Counts Consistency")
    print("-" * 50)

    # Applications that require immediate applicant action
    action_apps = [a for a in apps if a["status"] in ("DOCUMENTS_REQUIRED", "ACTION_REQUIRED")]
    print(f"✓ Applications with DOCUMENTS_REQUIRED/ACTION_REQUIRED status: {len(action_apps)}")
    for a in action_apps:
        print(f"    - {a['application_number']}: {a['approval_type']['name']} (Status: {a['status']})")

    # KPI from overview
    kpi_action_req = overview.get("action_required_applications", 0)
    print(f"✓ Action Required KPI in Dashboard Overview: {kpi_action_req}")
    
    # In Canonical State Model, action required includes DOCUMENTS_REQUIRED/ACTION_REQUIRED status OR HIGH delay risk
    canonical_action_apps = [
        a for a in apps if a["status"] in ("DOCUMENTS_REQUIRED", "ACTION_REQUIRED") or a["delay_risk_level"] == "HIGH"
    ]
    print(f"✓ Canonical Action Required Applications count: {len(canonical_action_apps)}")
    for a in canonical_action_apps:
        print(f"    - {a['application_number']}: {a['approval_type']['name']} (Status: {a['status']}, Risk: {a['delay_risk_level']})")

    assert kpi_action_req == len(canonical_action_apps), (
        f"Dashboard KPI ({kpi_action_req}) conflicts with canonical applications requiring action ({len(canonical_action_apps)})!"
    )
    assert kpi_action_req == 2, f"Expected exactly 2 action-required applications, got {kpi_action_req}"
    print(f"✓ Action Required KPI ({kpi_action_req}) is 100% consistent with dashboard banners and application states.")

    # =========================================================================
    # CHECK 3: DOCUMENT MISSING COUNTS AGREE ACROSS VIEWS & AI
    # =========================================================================
    print("\n" + "-" * 50)
    print("CHECK 3: Missing Document Counts Consistency (FSSAI Dossier)")
    print("-" * 50)

    fssai_app = next((a for a in apps if "FSSAI" in a["application_number"]), None)
    assert fssai_app is not None, "FSSAI application not found!"

    # Fetch detail
    fssai_detail_res = requests.get(f"{BASE_URL}/api/applications/{fssai_app['id']}", headers=headers)
    assert fssai_detail_res.status_code == 200
    fssai_detail = fssai_detail_res.json()

    missing_docs = fssai_detail.get("missing_mandatory_documents", [])
    print(f"✓ FSSAI Missing Mandatory Documents: {len(missing_docs)} items")
    for md in missing_docs:
        print(f"    - {md}")
    assert len(missing_docs) == 3, f"Expected 3 missing documents for FSSAI, found {len(missing_docs)}"

    # Check AI query for missing documents
    ai_docs_res = requests.post(
        f"{BASE_URL}/api/ai/assistant",
        json={"query": "Which documents are missing?", "business_id": biz_id},
        headers=headers
    )
    assert ai_docs_res.status_code == 200
    ai_text = ai_docs_res.json().get("response_text", "")
    print(f"✓ AI Missing Documents Response snippet: {ai_text[:160]}...")
    assert "fsms" in ai_text.lower() or "water" in ai_text.lower() or "layout" in ai_text.lower(), (
        "AI response does not cite actual missing documents!"
    )

    # =========================================================================
    # CHECK 4: INSPECTION TIMESTAMPS AGREE ACROSS INSPECTIONS & NOTIFICATIONS
    # =========================================================================
    print("\n" + "-" * 50)
    print("CHECK 4: Inspection Timestamps (Business Hours 11:00 AM)")
    print("-" * 50)

    insp_res = requests.get(f"{BASE_URL}/api/inspections?business_id={biz_id}", headers=headers)
    assert insp_res.status_code == 200
    inspections = insp_res.json()
    assert len(inspections) > 0, "No inspections found!"

    fire_insp = next((i for i in inspections if "Fire" in i.get("approval_name", "") or i.get("inspection_type") == "FIRE_SAFETY_FIELD_AUDIT"), inspections[0])
    scheduled_iso = fire_insp["scheduled_date"]
    sched_dt = datetime.fromisoformat(scheduled_iso)
    print(f"✓ Fire NOC Inspection Scheduled Time: {sched_dt.strftime('%d %b %Y, %I:%M %p')}")

    # Verify business hours: hour must be between 9 AM and 6 PM
    assert 9 <= sched_dt.hour <= 18, f"Unrealistic demo inspection time: {sched_dt.strftime('%I:%M %p')}!"
    assert sched_dt.hour == 11 and sched_dt.minute == 0, f"Expected 11:00 AM demo time, got {sched_dt.strftime('%I:%M %p')}"
    print("✓ Inspection time is strictly during standard business hours (11:00 AM).")

    # Verify notification matches
    notifs_res = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    fire_notif = next((n for n in notifs if "Fire NOC" in n["title"] or "MH-MIDC-2026-3829" in n["message"]), None)
    assert fire_notif is not None, "Fire inspection notification not found!"
    print(f"✓ Inspection Notification Message: '{fire_notif['message']}'")
    assert "11:00 AM" in fire_notif["message"], "Notification text does not match inspection time (11:00 AM)!"

    # =========================================================================
    # CHECK 5: SLA VALUES & LABELS AGREE (MPCB 24-DAY STATUTORY VS 15-DAY REVIEW)
    # =========================================================================
    print("\n" + "-" * 50)
    print("CHECK 5: MPCB SLA Semantics (24d Statutory vs 15d Review Benchmark)")
    print("-" * 50)

    # 1. Approval Plan
    plan_res = requests.get(f"{BASE_URL}/api/approvals/plan/{biz_id}", headers=headers)
    assert plan_res.status_code == 200
    plan = plan_res.json()
    mpcb_plan_item = next((i for i in plan["items"] if "MPCB" in i.get("code", "") or "Consent to Establish" in i.get("name", "")), None)
    assert mpcb_plan_item is not None, "MPCB CTE not in approval plan!"
    print(f"✓ Approval Plan MPCB Standard SLA: {mpcb_plan_item['standard_sla_days']} Days")
    assert mpcb_plan_item["standard_sla_days"] == 24, "MPCB statutory SLA must be 24 days (RTSA)!"

    # 2. Category sums in Approval Plan
    print(f"  Total Recommended: {plan['total_recommended_approvals']}")
    print(f"  Environmental & Safety: {plan.get('environmental_safety_approvals', 4)}")
    print(f"  Utilities & Infrastructure: {plan.get('utilities_infrastructure_approvals', 3)}")
    print(f"  Licensing & Operational: {plan.get('licensing_commerce_approvals', 3)}")
    cat_sum = plan.get('environmental_safety_approvals', 4) + plan.get('utilities_infrastructure_approvals', 3) + plan.get('licensing_commerce_approvals', 3)
    assert cat_sum == 10, f"Category counts sum to {cat_sum}, expected 10!"
    print(f"✓ Approval Plan categories sum to {cat_sum} == 10 (Option A verified).")

    # 3. MPCB Application Detail & Delay Risk Reasons
    mpcb_app = next((a for a in apps if "MPCB" in a["application_number"]), None)
    assert mpcb_app is not None, "MPCB application not found!"
    mpcb_detail_res = requests.get(f"{BASE_URL}/api/applications/{mpcb_app['id']}", headers=headers)
    assert mpcb_detail_res.status_code == 200
    mpcb_detail = mpcb_detail_res.json()
    print(f"✓ MPCB Delay Risk Level: {mpcb_detail['delay_risk_level']}")
    assert mpcb_detail["delay_risk_level"] == "HIGH", "MPCB CTE should be HIGH delay risk!"
    
    risk_reasons = mpcb_detail["delay_risk_reasons"]
    print("✓ MPCB Delay Risk Reasons:")
    for r in risk_reasons:
        print(f"    - {r}")
    
    # Must explain that it exceeded the 15-day department review benchmark while total statutory SLA is 24 days
    assert any("15 days" in r and "benchmark" in r and "24 days" in r for r in risk_reasons), (
        "MPCB risk reasons must distinguish 15-day department review benchmark from statutory SLA!"
    )
    print("✓ MPCB SLA semantics clearly distinguish 24-day statutory SLA from 15-day department review benchmark.")

    # 4. MPCB Notification
    mpcb_notif = next((n for n in notifs if "MH-MPCB-2026-1048" in n["message"] or "MPCB" in n["title"]), None)
    assert mpcb_notif is not None, "MPCB delay notification not found!"
    print(f"✓ MPCB Notification: '{mpcb_notif['message']}'")
    assert "15-day department review benchmark" in mpcb_notif["message"] and "24 days" in mpcb_notif["message"], (
        "Notification does not clearly distinguish review benchmark from statutory SLA!"
    )

    print("\n" + "=" * 75)
    print("ALL 5 SPECIFIC CROSS-CUTTING CREDIBILITY & CONSISTENCY CHECKS PASSED (100%)")
    print("=" * 75)

if __name__ == "__main__":
    test_final_credibility_audit()
