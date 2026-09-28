import os
import requests
import sys

BASE_URL = os.getenv("API_URL", "http://127.0.0.1:8000").rstrip("/")

def run_role_isolation_audit():
    print("=" * 70)
    print("ROLE-BASED AUTHORIZATION & SECURITY BOUNDARY AUDIT")
    print("=" * 70)

    # 1. Health check
    h = requests.get(f"{BASE_URL}/health")
    assert h.status_code == 200, "Backend health check failed"
    print("✓ Backend /health is healthy")

    # 2. Authenticate Personas
    # Applicant: Rajesh Kulkarni
    app_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "applicant@industria.ai", "password": "password123"})
    assert app_res.status_code == 200, "Applicant login failed"
    app_data = app_res.json()
    app_token = app_data["access_token"]
    app_headers = {"Authorization": f"Bearer {app_token}"}
    assert app_data["user"]["role"] == "applicant", f"Expected role 'applicant', got {app_data['user']['role']}"
    print(f"✓ Authenticated Applicant: {app_data['user']['full_name']} (Role: {app_data['user']['role']})")

    # Admin: Dr. Sunita Deshmukh
    admin_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@industria.ai", "password": "password123"})
    assert admin_res.status_code == 200, "Admin login failed"
    admin_data = admin_res.json()
    admin_token = admin_data["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    assert admin_data["user"]["role"] == "admin", f"Expected role 'admin', got {admin_data['user']['role']}"
    print(f"✓ Authenticated Admin: {admin_data['user']['full_name']} (Role: {admin_data['user']['role']})")

    # Officer: Sanjay Patil
    officer_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "officer@industria.ai", "password": "password123"})
    assert officer_res.status_code == 200, "Officer login failed"
    officer_data = officer_res.json()
    officer_token = officer_data["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    assert officer_data["user"]["role"] == "officer", f"Expected role 'officer', got {officer_data['user']['role']}"
    print(f"✓ Authenticated Officer: {officer_data['user']['full_name']} (Role: {officer_data['user']['role']})")

    # -------------------------------------------------------------------------
    # PART 1: APPLICANT ATTEMPTS ACCESS TO ADMIN / OFFICER ENDPOINTS (EXPECT 403)
    # -------------------------------------------------------------------------
    print("\n" + "-" * 60)
    print("TEST SUITE 1: APPLICANT ACCESS RESTRICTION AUDIT (MUST BE 403)")
    print("-" * 60)

    forbidden_endpoints = [
        # Admin Analytics & Bottlenecks
        ("GET", "/api/analytics/overview", None, "Statewide Admin Analytics (no business_id)"),
        ("GET", "/api/analytics/bottlenecks", None, "Department Bottlenecks Queue"),
        ("GET", "/api/analytics/sla-risk", None, "SLA Delay Risk Queue"),
        ("GET", "/api/admin/analytics", None, "Dedicated Admin Analytics Endpoint"),
        ("GET", "/api/admin/bottlenecks", None, "Dedicated Admin Bottlenecks Endpoint"),
        ("GET", "/api/admin/sla", None, "Dedicated Admin SLA Delay Queue"),
        ("GET", "/api/admin/sla-risk", None, "Dedicated Admin SLA Risk Endpoint"),

        # Scrutiny & Review Queue
        ("GET", "/api/applications/scrutiny-queue", None, "Department Scrutiny Queue"),
        ("GET", "/api/applications/review-queue", None, "Department Review Queue"),
        ("GET", "/api/admin/review", None, "Admin Review Endpoint"),
        ("GET", "/api/admin/scrutiny-queue", None, "Admin Scrutiny Queue Endpoint"),
        ("GET", "/api/admin/applications", None, "Admin All Applications Queue"),
        ("GET", "/api/officer/scrutiny-queue", None, "Officer Scrutiny Queue"),
        ("GET", "/api/officer/applications", None, "Officer Applications Queue"),

        # Application Status Manipulation (Officer/Admin only)
        ("PATCH", "/api/applications/1/status", {"status": "APPROVED", "officer_remarks": "Unauthorized test"}, "Application Status Update"),

        # Field Inspection Dispatch Queue & Scheduling
        ("GET", "/api/inspections/dispatch-queue", None, "Inspection Dispatch Queue"),
        ("GET", "/api/admin/inspections", None, "Admin Inspections Endpoint"),
        ("GET", "/api/officer/inspections", None, "Officer Inspections Endpoint"),
        ("POST", "/api/inspections", {
            "business_id": 1,
            "application_id": 1,
            "inspection_type": "Unauthorized Inspection",
            "scheduled_date": "2026-10-01T10:00:00Z"
        }, "Schedule Field Inspection"),
        ("PATCH", "/api/inspections/1", {"status": "COMPLETED"}, "Update Inspection Findings"),

        # Foreign Business Data Isolation
        ("GET", "/api/analytics/overview?business_id=9999", None, "Foreign Business Analytics"),
        ("GET", "/api/applications?business_id=9999", None, "Foreign Business Applications"),
        ("GET", "/api/inspections?business_id=9999", None, "Foreign Business Inspections"),
    ]

    for method, path, payload, description in forbidden_endpoints:
        if method == "GET":
            res = requests.get(f"{BASE_URL}{path}", headers=app_headers)
        elif method == "POST":
            res = requests.post(f"{BASE_URL}{path}", json=payload, headers=app_headers)
        elif method == "PATCH":
            res = requests.patch(f"{BASE_URL}{path}", json=payload, headers=app_headers)

        assert res.status_code == 403, (
            f"SECURITY BREACH: Applicant accessed {path} ({description})! "
            f"Expected HTTP 403, got HTTP {res.status_code}: {res.text}"
        )
        print(f"  ✓ HTTP 403 FORBIDDEN: {method} {path} ({description})")

    # -------------------------------------------------------------------------
    # PART 2: APPLICANT ALLOWED ROUTES (MUST BE 200)
    # -------------------------------------------------------------------------
    print("\n" + "-" * 60)
    print("TEST SUITE 2: APPLICANT AUTHORIZED ROUTES (MUST BE 200)")
    print("-" * 60)

    applicant_allowed_endpoints = [
        ("GET", "/api/businesses", "Applicant Businesses"),
        ("GET", "/api/approvals", "Approval Types Catalogue"),
        ("GET", "/api/approvals/plan/1", "Applicant Approval Roadmap"),
        ("GET", "/api/applications?business_id=1", "Applicant Applications"),
        ("GET", "/api/applications/state-matrix", "Workflow Canonical State Matrix"),
        ("GET", "/api/documents?business_id=1", "Applicant Documents"),
        ("GET", "/api/inspections?business_id=1", "Applicant Scheduled Inspections"),
        ("GET", "/api/compliance?business_id=1", "Applicant Compliance Calendar"),
        ("GET", "/api/schemes", "Government Support Schemes"),
        ("GET", "/api/schemes/match/1", "Matched Subsidies & Incentives"),
        ("GET", "/api/notifications", "Applicant Notifications"),
        ("GET", "/api/analytics/overview?business_id=1", "Applicant Self-Business Analytics"),
        ("POST", "/api/ai/assistant", "AI Compliance Assistant", {"query": "What are my pending clearances?", "business_id": 1}),
    ]

    for item in applicant_allowed_endpoints:
        method = item[0]
        path = item[1]
        desc = item[2]
        payload = item[3] if len(item) > 3 else None

        if method == "GET":
            res = requests.get(f"{BASE_URL}{path}", headers=app_headers)
        else:
            res = requests.post(f"{BASE_URL}{path}", json=payload, headers=app_headers)

        assert res.status_code == 200, (
            f"Applicant authorized route failed: {path} ({desc})! "
            f"Expected HTTP 200, got HTTP {res.status_code}: {res.text}"
        )
        print(f"  ✓ HTTP 200 SUCCESS: {method} {path} ({desc})")

    # -------------------------------------------------------------------------
    # PART 3: ADMIN AUTHORIZED ACCESS AUDIT (MUST BE 200)
    # -------------------------------------------------------------------------
    print("\n" + "-" * 60)
    print("TEST SUITE 3: ADMIN AUTHORIZED DEPARTMENT ACCESS (MUST BE 200)")
    print("-" * 60)

    admin_allowed_endpoints = [
        ("GET", "/api/analytics/overview", "Statewide Admin Analytics"),
        ("GET", "/api/analytics/bottlenecks", "Department Processing Bottlenecks"),
        ("GET", "/api/analytics/sla-risk", "Department SLA Delay Queue"),
        ("GET", "/api/admin/analytics", "Admin Analytics Desk"),
        ("GET", "/api/admin/bottlenecks", "Admin Bottleneck Desk"),
        ("GET", "/api/admin/sla", "Admin SLA Delay Queue"),
        ("GET", "/api/admin/review", "Admin Scrutiny & Review Queue"),
        ("GET", "/api/admin/applications", "Admin All Applications"),
        ("GET", "/api/admin/inspections", "Admin Field Inspections"),
        ("GET", "/api/admin/audit-logs", "Admin System Audit Trail"),
        ("GET", "/api/applications/scrutiny-queue", "Statewide Scrutiny Queue"),
        ("GET", "/api/inspections/dispatch-queue", "Statewide Inspection Dispatch Queue"),
    ]

    for method, path, desc in admin_allowed_endpoints:
        res = requests.get(f"{BASE_URL}{path}", headers=admin_headers)
        assert res.status_code == 200, (
            f"Admin access failed: {path} ({desc})! "
            f"Expected HTTP 200, got HTTP {res.status_code}: {res.text}"
        )
        print(f"  ✓ HTTP 200 SUCCESS: {method} {path} ({desc})")

    # -------------------------------------------------------------------------
    # PART 4: OFFICER AUTHORIZED ACCESS AUDIT (MUST BE 200)
    # -------------------------------------------------------------------------
    print("\n" + "-" * 60)
    print("TEST SUITE 4: OFFICER AUTHORIZED SCRUTINY & INSPECTION ACCESS (MUST BE 200)")
    print("-" * 60)

    officer_allowed_endpoints = [
        ("GET", "/api/officer/scrutiny-queue", "Officer Scrutiny Queue"),
        ("GET", "/api/officer/inspections", "Officer Inspection Dispatch Queue"),
        ("GET", "/api/officer/sla-queue", "Officer SLA Queue"),
        ("GET", "/api/admin/review", "Officer Access to Scrutiny Desk"),
        ("GET", "/api/admin/inspections", "Officer Access to Inspections Desk"),
        ("GET", "/api/applications/scrutiny-queue", "Officer Access to Scrutiny Queue"),
        ("GET", "/api/inspections/dispatch-queue", "Officer Access to Dispatch Queue"),
    ]

    for method, path, desc in officer_allowed_endpoints:
        res = requests.get(f"{BASE_URL}{path}", headers=officer_headers)
        assert res.status_code == 200, (
            f"Officer access failed: {path} ({desc})! "
            f"Expected HTTP 200, got HTTP {res.status_code}: {res.text}"
        )
        print(f"  ✓ HTTP 200 SUCCESS: {method} {path} ({desc})")

    print("\n" + "=" * 70)
    print("ALL ROLE-BASED AUTHORIZATION & SECURITY BOUNDARY AUDITS PASSED (100%)")
    print("=" * 70)

if __name__ == "__main__":
    run_role_isolation_audit()
