import os
import requests
import json
import tempfile

BASE_URL = os.getenv("API_URL", "http://127.0.0.1:8000").rstrip("/")

def test_ai_and_documents():
    print("=" * 70)
    print("TARGETED FUNCTIONAL TEST: AI ASSISTANT & DOCUMENT UPLOAD / VALIDATION")
    print("=" * 70)

    # 1. Health check
    h_res = requests.get(f"{BASE_URL}/health")
    assert h_res.status_code == 200, f"Health check failed: {h_res.text}"
    print("✓ Backend /health is healthy")

    # 2. Login as Applicant
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "applicant@industria.ai", "password": "password123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Logged in as Applicant (applicant@industria.ai)")

    # 3. Get applicant business
    biz_res = requests.get(f"{BASE_URL}/api/businesses", headers=headers)
    assert biz_res.status_code == 200, f"Failed to get businesses: {biz_res.text}"
    businesses = biz_res.json()
    assert len(businesses) > 0, "No business found for applicant!"
    business = businesses[0]
    biz_id = business["id"]
    print(f"✓ Active Business: {business['name']} (ID: {biz_id}, District: {business['district']})")

    # =========================================================================
    # PART 1: AI ASSISTANT TARGETED TESTS
    # =========================================================================
    print("\n" + "-" * 50)
    print("TESTING CONTEXTUAL AI ASSISTANT QUERIES")
    print("-" * 50)

    ai_queries = [
        "What should I do next?",
        "Which documents are currently missing?",
        "Why is my MPCB application at high delay risk?",
        "Summarize my current approval journey."
    ]

    for q in ai_queries:
        payload = {"query": q, "business_id": biz_id}
        res = requests.post(f"{BASE_URL}/api/ai/assistant", json=payload, headers=headers)
        assert res.status_code == 200, f"AI query '{q}' failed: {res.text}"
        data = res.json()

        resp_text = data.get("response_text", "")
        citations = data.get("citations", [])
        actions = data.get("suggested_actions", [])
        mode = data.get("mode")
        is_fallback = data.get("is_fallback")

        print(f"\n[QUERY]: '{q}'")
        print(f"  Mode: {mode} (Fallback: {is_fallback})")
        print(f"  Citations Count: {len(citations)}")
        print(f"  Suggested Actions: {actions}")
        print(f"  Response Preview: {resp_text[:200]}...")

        # Assertions
        assert len(resp_text) > 50, f"Response too short for '{q}'"
        assert not ("generic" in resp_text.lower() and "placeholder" in resp_text.lower()), "Generic response returned!"

        if q == "What should I do next?":
            # Must mention uploading mandatory documents (FSSAI/FSMS) or upcoming inspections
            assert "upload" in resp_text.lower() or "inspection" in resp_text.lower() or "fssai" in resp_text.lower(), (
                "Next actions missing specific database context!"
            )
            assert len(citations) > 0, "Citations should be present for next action"

        elif q == "Which documents are currently missing?":
            # Must reference missing mandatory docs (FSMS, Water test)
            assert "fsms" in resp_text.lower() or "water" in resp_text.lower() or "missing" in resp_text.lower(), (
                "Missing docs query did not list actual missing records!"
            )
            assert len(citations) > 0, "Citations missing for missing docs query"

        elif q == "Why is my MPCB application at high delay risk?":
            # Must reference MPCB CTE, high risk, and reasons
            assert "mpcb" in resp_text.lower() or "1048" in resp_text.lower(), (
                "Response did not reference MPCB application!"
            )
            assert "high" in resp_text.lower(), "High delay risk not mentioned in MPCB query!"
            assert "review" in resp_text.lower() or "18" in resp_text.lower() or "hydraulic" in resp_text.lower(), (
                "Real SLA delay reasons not included!"
            )
            assert any("MPCB" in c.get("title", "") or "1048" in c.get("reference_id", "") for c in citations), (
                "MPCB citation missing!"
            )

        elif q == "Summarize my current approval journey.":
            # Must give real count of approvals, approvals summary
            assert "maharashtra fresh foods" in resp_text.lower() or "approval" in resp_text.lower() or "10" in resp_text, (
                "Journey summary not grounded in business context!"
            )
            assert "completed" in resp_text.lower() or "approved" in resp_text.lower(), (
                "Approval status breakdown missing!"
            )

    print("\n✓ ALL 4 AI Assistant queries passed with grounded database context and internal citations.")

    # =========================================================================
    # PART 2: REAL DOCUMENT UPLOAD & VALIDATION PIPELINE
    # =========================================================================
    print("\n" + "-" * 50)
    print("TESTING REAL DOCUMENT UPLOAD & VALIDATION PIPELINE")
    print("-" * 50)

    # 1. Create a realistic matching TXT document in a temporary directory
    temp_dir = tempfile.mkdtemp()
    valid_doc_path = os.path.join(temp_dir, "Detailed_Project_Report_MFF.txt")
    valid_doc_content = f"""
DETAILED PROJECT REPORT (DPR)
FOR INDUSTRIAL CLEARANCES UNDER MAHARASHTRA SINGLE WINDOW

1. ENTERPRISE DETAILS
Entity Name: {business['name']}
Location: MIDC Industrial Area, Chakan, Pune, Maharashtra
Pincode: 410501
PAN Number: {business['pan']}
GSTIN Number: {business['gstin']}
Udyam Registration: {business['udyam_number']}
Line of Activity: Agro & Food Processing (Fruit pulp, frozen vegetables, and packaged retort foods)
Scale: {business['scale']} Enterprise

2. PROJECT SCOPE & CAPITAL OUTLAY
Total Capital Investment: Rs. 14.50 Crores
Plant & Machinery: Rs. 8.20 Crores
Land & Factory Building: Rs. 4.50 Crores
Working Capital Margin: Rs. 1.80 Crores
Connected Electrical Power Load: 350 kVA (MSEDCL Sanctioned)
Bulk Water Requirement: 45 KLD (MIDC Industrial Water Supply)

3. POLLUTION CONTROL & EFFLUENT TREATMENT SPECIFICATIONS
Effluent Generation: 32 KLD trade effluent and 8 KLD domestic sewage.
Effluent Treatment Plant (ETP): Primary neutralization, anaerobic biomethanation, and aerobic activated sludge process.
Treated water recycling for horticulture and floor washing.
Zero Liquid Discharge (ZLD) norms followed.

4. COMPLIANCE & SAFETY ASSURANCES
Fire protection hydrants, smoke detectors, and emergency exits built in accordance with National Building Code (NBC 2016).
Food safety standards formulated in compliance with FSSAI Schedule IV hygiene criteria.
    """.strip()

    with open(valid_doc_path, "w", encoding="utf-8") as f:
        f.write(valid_doc_content)

    valid_file_size = os.path.getsize(valid_doc_path)
    print(f"Created demo document '{os.path.basename(valid_doc_path)}' ({valid_file_size} bytes)")

    # Upload the matching document
    with open(valid_doc_path, "rb") as f:
        upload_resp = requests.post(
            f"{BASE_URL}/api/documents/upload",
            data={"business_id": biz_id, "document_type": "PROJECT_REPORT_DPR"},
            files={"file": (os.path.basename(valid_doc_path), f, "text/plain")},
            headers=headers
        )
    assert upload_resp.status_code == 200, f"Document upload failed: {upload_resp.text}"
    uploaded_doc = upload_resp.json()
    doc_id = uploaded_doc["id"]

    print(f"✓ Uploaded successfully -> Document ID: {doc_id}")
    print(f"  File Name: {uploaded_doc['original_filename']}")
    print(f"  File Type: {uploaded_doc['file_type']}")
    print(f"  Actual File Size: {uploaded_doc['file_size_bytes']} bytes (matches on disk: {uploaded_doc['file_size_bytes'] == valid_file_size})")
    print(f"  Validation Status: {uploaded_doc['status']}")
    print(f"  AI Summary: {uploaded_doc['ai_summary']}")

    # Assertions for matching document
    assert uploaded_doc["file_size_bytes"] == valid_file_size, "File size mismatch!"
    assert uploaded_doc["status"] in ["VERIFIED", "UPLOADED"], f"Expected VERIFIED status, got {uploaded_doc['status']}"
    assert uploaded_doc["validation_result"] is not None, "Validation result was not persisted!"

    v_res = uploaded_doc["validation_result"]
    checks = v_res.get("checks", [])
    print(f"  Total Checks Run: {len(checks)}")
    for c in checks:
        print(f"    - {c['item']}: {c['result']} ({c['details']})")

    # Verify Business Name Consistency check was performed and matched
    name_check = next((c for c in checks if "Business Name" in c["item"]), None)
    assert name_check is not None, "Business Name check was not executed!"
    assert name_check["result"] == "MATCH", f"Expected MATCH on Business Name, got {name_check['result']}"

    # Verify Tax/PAN check was performed and matched
    pan_check = next((c for c in checks if "PAN" in c["item"]), None)
    if pan_check:
        assert pan_check["result"] == "MATCH", f"Expected MATCH on PAN, got {pan_check['result']}"

    # 2. Test intentional mismatch document
    mismatch_doc_path = os.path.join(temp_dir, "Mismatched_Entity_Report.txt")
    mismatch_content = """
DETAILED PROJECT REPORT
Entity Name: Southern Spices & Beverages Karnataka Ltd.
Location: Peenya Industrial Area, Bengaluru, Karnataka
Pincode: 560058
PAN Number: AAACS8821K
GSTIN Number: 29AAACS8821K1Z2
Line of Activity: Beverage Bottling
    """.strip()

    with open(mismatch_doc_path, "w", encoding="utf-8") as f:
        f.write(mismatch_content)

    mismatch_file_size = os.path.getsize(mismatch_doc_path)
    with open(mismatch_doc_path, "rb") as f:
        mismatch_upload_resp = requests.post(
            f"{BASE_URL}/api/documents/upload",
            data={"business_id": biz_id, "document_type": "PROJECT_REPORT_DPR"},
            files={"file": (os.path.basename(mismatch_doc_path), f, "text/plain")},
            headers=headers
        )
    assert mismatch_upload_resp.status_code == 200, f"Mismatch doc upload failed: {mismatch_upload_resp.text}"
    mismatched_doc = mismatch_upload_resp.json()

    print(f"\n✓ Uploaded mismatched document -> Document ID: {mismatched_doc['id']}")
    print(f"  Validation Status: {mismatched_doc['status']}")
    print(f"  Inconsistency Notes: {mismatched_doc['inconsistency_notes']}")

    # Must detect POTENTIAL_MISMATCH and set ACTION_REQUIRED
    assert mismatched_doc["status"] == "ACTION_REQUIRED", (
        f"Expected status ACTION_REQUIRED on mismatched document, got {mismatched_doc['status']}"
    )
    mm_checks = mismatched_doc["validation_result"].get("checks", [])
    mm_name_check = next((c for c in mm_checks if "Business Name" in c["item"]), None)
    assert mm_name_check is not None and mm_name_check["result"] == "POTENTIAL_MISMATCH", (
        "Did not flag POTENTIAL_MISMATCH for mismatched business name!"
    )
    print(f"✓ Detected intentional entity mismatch successfully: {mm_name_check['details']}")

    # 3. Test Document Traceability
    print("\n" + "-" * 50)
    print("TESTING DOCUMENT TRACEABILITY & AUDIT LOGGING")
    print("-" * 50)
    audit_res = requests.get(f"{BASE_URL}/api/audit-logs?limit=10", headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    doc_actions = [l for l in logs if l["entity_type"] == "Document"]
    assert len(doc_actions) > 0, "No audit logs recorded for Document actions!"
    print(f"✓ Found {len(doc_actions)} document audit logs (Action: {doc_actions[0]['action']})")

    # Test Revalidate Endpoint
    reval_resp = requests.post(f"{BASE_URL}/api/documents/{doc_id}/validate", headers=headers)
    assert reval_resp.status_code == 200
    reval_data = reval_resp.json()
    assert reval_data["status"] == "VERIFIED"
    print(f"✓ Revalidation endpoint tested: status={reval_data['status']}")

    # Clean up temp files
    os.remove(valid_doc_path)
    os.remove(mismatch_doc_path)
    os.rmdir(temp_dir)

    print("\n" + "=" * 70)
    print("ALL AI ASSISTANT & REAL DOCUMENT UPLOAD / VALIDATION TESTS PASSED (100%)")
    print("=" * 70)

if __name__ == "__main__":
    test_ai_and_documents()
