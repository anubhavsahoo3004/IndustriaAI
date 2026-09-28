import os
import requests
import json
import sys

BASE_URL = os.getenv("API_URL", "http://127.0.0.1:8000").rstrip("/")

def run_tests():
    print("=" * 60)
    print("RUNNING WORKFLOW & STATE CONSISTENCY AUDIT")
    print("=" * 60)

    # 1. Health check
    h_res = requests.get(f"{BASE_URL}/health")
    assert h_res.status_code == 200, f"Health check failed: {h_res.text}"
    print("✓ Backend /health is healthy")

    # 2. Login as Applicant
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "applicant@industria.ai", "password": "password123"})
    assert login_res.status_code == 200, f"Applicant login failed: {login_res.text}"
    applicant_token = login_res.json()["access_token"]
    app_headers = {"Authorization": f"Bearer {applicant_token}"}
    print("✓ Logged in as Applicant (applicant@industria.ai)")

    # 3. Get State Matrix from Backend
    matrix_res = requests.get(f"{BASE_URL}/api/applications/state-matrix", headers=app_headers)
    assert matrix_res.status_code == 200, f"State matrix fetch failed: {matrix_res.text}"
    state_matrix = matrix_res.json()
    valid_map = state_matrix["valid_status_stage_map"]
    print(f"✓ Retrieved Canonical State Matrix ({len(state_matrix['statuses'])} statuses, {len(state_matrix['stages'])} stages)")

    # 4. Fetch Applicant Applications
    apps_res = requests.get(f"{BASE_URL}/api/applications", headers=app_headers)
    assert apps_res.status_code == 200, f"Applications list failed: {apps_res.text}"
    applications = apps_res.json()
    print(f"✓ Retrieved {len(applications)} applications for applicant")

    # 5. Audit Every Application Status & Current Stage Combination
    for app in applications:
        app_num = app["application_number"]
        st = app["status"]
        sg = app["current_stage"]
        risk = app["delay_risk_level"]

        # Validate against canonical state matrix
        allowed_stages = valid_map.get(st, [])
        assert sg in allowed_stages, f"Illegal state in {app_num}: status '{st}' with stage '{sg}'! Allowed: {allowed_stages}"

        # Contradiction rule 1: current_stage = COMPLETED while status = UNDER_REVIEW
        if sg == "COMPLETED":
            assert st in ["APPROVED", "COMPLETED", "REJECTED"], f"Contradiction in {app_num}: stage COMPLETED with status {st}"

        # Contradiction rule 2: status = APPROVED while workflow is still at earlier stage
        if st == "APPROVED":
            assert sg in ["FINAL_DECISION", "COMPLETED"], f"Contradiction in {app_num}: status APPROVED with earlier stage {sg}"

        # Contradiction rule 4: delay risk remaining HIGH after application is completed
        if st in ["APPROVED", "COMPLETED"] or sg == "COMPLETED":
            assert risk == "LOW", f"Contradiction in {app_num}: Completed app has delay risk '{risk}'!"

        print(f"  ✓ {app_num}: Status='{st}', Stage='{sg}', DelayRisk='{risk}' -> CANONICALLY CONSISTENT")

    # 6. Audit Application Details & Workflow Steps
    print("\nAuditing Application Detail & Workflow Steps...")
    for app in applications:
        detail_res = requests.get(f"{BASE_URL}/api/applications/{app['id']}", headers=app_headers)
        assert detail_res.status_code == 200, f"Failed to get detail for app {app['id']}"
        detail = detail_res.json()
        steps = detail.get("workflow_steps", [])
        assert len(steps) > 0, f"Application {app['application_number']} has 0 workflow steps!"

        st = detail["status"]
        sg = detail["current_stage"]

        if st in ["APPROVED", "COMPLETED"] or sg == "COMPLETED":
            for step in steps:
                assert step["status"] == "COMPLETED", (
                    f"Contradiction in {app['application_number']}: Completed application has non-completed step "
                    f"'{step['step_name']}' with status '{step['status']}'!"
                )
        print(f"  ✓ {app['application_number']}: {len(steps)} workflow steps verified consistent with stage '{sg}'")

    # 7. Audit Dashboard KPIs & Backend Source of Truth
    print("\nAuditing Dashboard KPIs vs Analytics Service...")
    biz_id = applications[0]["business_id"]
    overview_res = requests.get(f"{BASE_URL}/api/analytics/overview?business_id={biz_id}", headers=app_headers)
    assert overview_res.status_code == 200, f"Failed to get analytics overview: {overview_res.text}"
    overview = overview_res.json()

    # Verify counts
    assert overview["total_applications"] == len(applications)
    print(f"  ✓ Total Applications: {overview['total_applications']}")
    print(f"  ✓ Completed Applications: {overview['completed_applications']}")
    print(f"  ✓ Under Review Applications: {overview['under_review_applications']}")
    print(f"  ✓ Action Required Applications: {overview['action_required_applications']}")
    print(f"  ✓ Delayed (High Risk) Applications: {overview['delayed_applications']}")
    print(f"  ✓ Near SLA (Medium Risk) Applications: {overview['near_sla_applications']}")

    # Verify SLA risks list does NOT include completed applications
    for item in overview["sla_risks"]:
        # Find matching app
        matching = next(a for a in applications if a["id"] == item["application_id"])
        assert matching["status"] not in ["APPROVED", "COMPLETED", "REJECTED"], (
            f"Contradiction: Completed application {matching['application_number']} appears in SLA Risk queue!"
        )
        assert matching["current_stage"] != "COMPLETED", (
            f"Contradiction: Application in COMPLETED stage appears in SLA Risk queue!"
        )
    print(f"  ✓ All {len(overview['sla_risks'])} SLA risk items belong strictly to active, in-pipeline applications.")

    # 8. Test Admin Scrutiny Queue & Safe State Transitions
    print("\nAuditing Admin Scrutiny Queue & State Transitions...")
    admin_login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@industria.ai", "password": "password123"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Find an active application to test advance_stage
    active_app = next(a for a in applications if a["status"] == "UNDER_REVIEW" and a["current_stage"] == "DEPT_REVIEW")
    print(f"  Testing stage advancement on active app: {active_app['application_number']} (Current: {active_app['current_stage']})")

    advance_res = requests.patch(
        f"{BASE_URL}/api/applications/{active_app['id']}/status",
        json={"advance_stage": True, "officer_remarks": "Technical scrutiny cleared by department."},
        headers=admin_headers
    )
    assert advance_res.status_code == 200, f"Failed to advance stage: {advance_res.text}"
    adv_data = advance_res.json()
    print(f"  ✓ Successfully advanced stage to: Stage='{adv_data['current_stage']}', Status='{adv_data['status']}'")

    # Verify canonical relationship held
    assert adv_data["current_stage"] in valid_map.get(adv_data["status"], []), "Advanced stage broke canonical state!"

    # Now verify Detail view reflects updated steps
    updated_detail = requests.get(f"{BASE_URL}/api/applications/{active_app['id']}", headers=app_headers).json()
    dept_step = next(s for s in updated_detail["workflow_steps"] if s["step_key"] == "DEPT_REVIEW")
    assert dept_step["status"] == "COMPLETED", f"Prior step DEPT_REVIEW should now be COMPLETED, got {dept_step['status']}"
    print(f"  ✓ Prior stage 'DEPT_REVIEW' correctly synchronized to COMPLETED")

    # Test completing an application: approving it
    approve_res = requests.patch(
        f"{BASE_URL}/api/applications/{active_app['id']}/status",
        json={"status": "APPROVED", "current_stage": "COMPLETED", "officer_remarks": "Final clearance approved."},
        headers=admin_headers
    )
    assert approve_res.status_code == 200
    appr_data = approve_res.json()
    assert appr_data["status"] == "APPROVED"
    assert appr_data["current_stage"] == "COMPLETED"
    assert appr_data["delay_risk_level"] == "LOW", "Completed application must have delay_risk_level LOW!"
    print(f"  ✓ Approved application: Status='{appr_data['status']}', Stage='{appr_data['current_stage']}', Risk='{appr_data['delay_risk_level']}'")

    # Verify all steps are completed
    final_detail = requests.get(f"{BASE_URL}/api/applications/{active_app['id']}", headers=app_headers).json()
    for s in final_detail["workflow_steps"]:
        assert s["status"] == "COMPLETED", f"Step '{s['step_name']}' is not COMPLETED in approved app!"
    print(f"  ✓ All {len(final_detail['workflow_steps'])} steps are COMPLETED in approved application.")

    print("\n" + "=" * 60)
    print("ALL WORKFLOW & STATE CONSISTENCY TESTS PASSED (100% CANONICAL)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
