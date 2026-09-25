import os
import sys
from datetime import datetime, timedelta, timezone

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.core.database import engine, Base, SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models import *
from backend.app.rules.knowledge_data import (
    MAHARASHTRA_APPROVALS_SEED,
    MAHARASHTRA_SCHEMES_SEED,
    MAHARASHTRA_KNOWLEDGE_ARTICLES_SEED
)
from backend.app.rules.workflow_state import CanonicalWorkflowState

def create_sample_file(file_path: str, content: str):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

def seed_database():
    print("Initializing Database Tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    now = datetime.now(timezone.utc)

    print("Seeding Users...")
    applicant_user = User(
        email="applicant@industria.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Rajesh Kulkarni",
        phone="+91 98230 45678",
        role="applicant",
        is_active=True
    )
    admin_user = User(
        email="admin@industria.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Dr. Sunita Deshmukh",
        phone="+91 94220 11223",
        role="admin",
        department="Directorate of Industries, Maharashtra",
        is_active=True
    )
    officer_user = User(
        email="officer@industria.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Sanjay Patil",
        phone="+91 98221 99887",
        role="officer",
        department="MPCB & DISH Regional Scrutiny Officer",
        is_active=True
    )
    db.add_all([applicant_user, admin_user, officer_user])
    db.commit()

    print("Seeding Approval Types...")
    approval_type_map = {}
    for item in MAHARASHTRA_APPROVALS_SEED:
        app_type = ApprovalType(**item)
        db.add(app_type)
        db.commit()
        db.refresh(app_type)
        approval_type_map[app_type.code] = app_type

    print("Seeding Support Schemes...")
    for scheme_data in MAHARASHTRA_SCHEMES_SEED:
        scheme = SupportScheme(**scheme_data)
        db.add(scheme)
    db.commit()

    print("Seeding Knowledge Base Articles...")
    for kb in MAHARASHTRA_KNOWLEDGE_ARTICLES_SEED:
        article = KnowledgeArticle(**kb)
        db.add(article)
    db.commit()

    print("Seeding Primary Demo Business...")
    primary_business = Business(
        user_id=applicant_user.id,
        name="Maharashtra Fresh Foods Pvt. Ltd.",
        industry="Food Processing",
        state="Maharashtra",
        district="Pune",
        project_type="New Unit",
        project_stage="Civil Works",
        scale="Medium",
        investment_range="₹10 Cr - ₹50 Cr",
        investment_amount_inr=24.50, # In Crores
        employee_count=45,
        business_type="Private Limited",
        gstin="27AAACM4821K1Z5",
        pan="AAACM4821K",
        udyam_number="UDYAM-MH-26-0048912",
        address="Plot No. E-42, MIDC Industrial Area, Phase II, Chakan, Taluka Khed, Pune - 410501",
        plot_details="Plot E-42 (Area: 12,500 sq.m)",
        electricity_load_kw=350.0,
        water_requirement_kld=45.0,
        effluent_discharge="Yes"
    )

    # Additional businesses for admin analytics
    textile_business = Business(
        user_id=applicant_user.id,
        name="Sahyadri Integrated Textiles Ltd.",
        industry="Textile",
        state="Maharashtra",
        district="Solapur",
        project_type="New Unit",
        project_stage="Planning",
        scale="Large",
        investment_range="> 50 Crore (Large)",
        investment_amount_inr=62.0,
        employee_count=180,
        business_type="Private Limited",
        gstin="27AABCS1234F1Z8",
        pan="AABCS1234F",
        udyam_number="UDYAM-MH-30-0081234",
        address="Plot 108, Solapur MIDC Chincholi",
        electricity_load_kw=800.0,
        water_requirement_kld=80.0,
        effluent_discharge="Yes"
    )

    mfg_business = Business(
        user_id=applicant_user.id,
        name="TechnoForge Precision Engineering",
        industry="Manufacturing",
        state="Maharashtra",
        district="Aurangabad",
        project_type="Expansion",
        project_stage="Operational",
        scale="Small",
        investment_range="1 - 10 Crore (Small)",
        investment_amount_inr=7.8,
        employee_count=30,
        business_type="LLP",
        gstin="27AAEFG9876P1Z1",
        pan="AAEFG9876P",
        udyam_number="UDYAM-MH-02-0019283",
        address="Plot 44, Waluj MIDC, Aurangabad",
        electricity_load_kw=180.0,
        water_requirement_kld=10.0,
        effluent_discharge="No"
    )

    db.add_all([primary_business, textile_business, mfg_business])
    db.commit()
    db.refresh(primary_business)

    print("Seeding Documents and Mock Files for Primary Business...")
    uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    demo_docs_config = [
        ("pan_card.txt", "PAN_CARD", "Company PAN Card & Director Identification", "PERMANENT ACCOUNT NUMBER: AAACM4821K\nName: MAHARASHTRA FRESH FOODS PVT. LTD.\nDate of Incorporation: 12/04/2021\nStatus: Registered Company\nIncome Tax Dept, Government of India"),
        ("udyam_certificate.txt", "UDYAM_REGISTRATION", "Udyam MSME Registration Certificate", "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES\nUDYAM REGISTRATION CERTIFICATE\nUDYAM NUMBER: UDYAM-MH-26-0048912\nNAME OF ENTERPRISE: MAHARASHTRA FRESH FOODS PVT. LTD.\nMajor Activity: Manufacturing (Food Processing)\nLocation: Pune, Maharashtra"),
        ("7_12_land_extract.txt", "LAND_TITLE_7_12_EXTRACT", "MIDC Industrial Land Allotment & 7/12 Extract", "MAHARASHTRA INDUSTRIAL DEVELOPMENT CORPORATION (MIDC)\nPlot Allotment Letter Ref: MIDC/PUNE/CHAKAN-II/E-42/2025\nAllottee: Maharashtra Fresh Foods Pvt. Ltd.\nPlot Area: 12,500 sq. meters, Phase II Chakan Industrial Area, Pune."),
        ("detailed_project_report.txt", "PROJECT_REPORT_DPR", "Detailed Project Report (DPR) & Process Flow", "DETAILED PROJECT REPORT (DPR)\nProject: Modern Integrated Fruit & Agro-Processing Unit\nPromoter: Maharashtra Fresh Foods Pvt. Ltd.\nTotal Capital Outlay: Rs. 24.50 Crores\nPlant & Machinery: Rs. 14.80 Crores\nBuilding & Civil Infrastructure: Rs. 6.20 Crores\nProcess: Raw Material Washing -> Sorting -> Pureeing/Freezing -> Vacuum Packaging -> Cold Storage"),
        ("etp_pollution_scheme.txt", "POLLUTION_CONTROL_SCHEME", "Effluent Treatment Plant (ETP) Engineering Layout", "ENVIRONMENTAL POLLUTION CONTROL SCHEME\nApplicant: Maharashtra Fresh Foods Pvt. Ltd., Chakan Phase II, Pune\nEffluent Generation: 35 KLD Industrial Effluent, 10 KLD Domestic\nETP Design Capacity: 50 KLD with Primary Coagulation, Secondary Aeration & Tertiary Activated Carbon Filter\nProposed COD reduction: >95%, BOD < 30 mg/l\nAir Pollution Control: Cyclone Separator with 30m stack for steam boiler."),
        ("fire_safety_drawings.txt", "FIRE_SAFETY_PLAN", "Fire Protection & Hydrant Blueprint Specifications", "FIRE SAFETY SCHEME & SYSTEM LAYOUT\nPremises: Maharashtra Fresh Foods Pvt. Ltd.\nBuilding Height: 8.5 meters (Single storey industrial shed with mezzanine)\nTotal Built-up Area: 4,800 sq.m\nFire Water Static Tank Capacity: 100,000 Litres underground + 25,000 Litres overhead\nExternal Hydrant Ring with 8 Pillar Hydrants & 20 Hose Reels\nAutomatic Heat/Smoke Detectors & Emergency Exit signs every 15 meters."),
        ("water_balance_sheet.txt", "WATER_BALANCE_SHEET", "Water Balance Diagram & Flow Calculations", "WATER BALANCE CALCULATIONS\nFresh Water Requirement: 45 KLD (Source: MIDC Bulk Water Line)\nUsage Breakdown: Processing 25 KLD, Cooling Tower 10 KLD, Domestic/Washing 10 KLD\nRecycled Water for Green Belt: 15 KLD\nDaily Net Discharge to MIDC CETP: 20 KLD."),
        ("electricity_load_sld.txt", "ELECTRICITY_LOAD_SANCTION", "Single Line Diagram (SLD) & Connected Load Schedule", "MSEDCL HIGH TENSION LOAD APPLICATION\nConsumer: Maharashtra Fresh Foods Pvt. Ltd.\nContract Demand: 350 kVA at 11 kV HT Supply\nConnected Motor Load: 450 HP (335 kW)\nTransformer: 500 kVA, 11kV/433V Step-down Transformer."),
        ("factory_building_plan.txt", "FACTORY_BUILDING_PLAN", "Approved Factory Architectural Layout", "FACTORY BUILDING ARCHITECTURAL DRAWINGS\nArchitectural plan conforming to Model Maharashtra Factories Rules.\nSufficient natural ventilation (15% of floor area), 5m wide internal roads, separate finished goods loading bays."),
        ("boiler_inspection_doc.txt", "BOILER_MANUFACTURER_CERT", "Boiler Maker Certificate & Inspection Dossier", "DIRECTORATE OF STEAM BOILERS MAHARASHTRA\nBoiler Rating: 3.0 Tons/Hour Working Pressure 10.54 kg/sq.cm\nManufacturer: Thermax India Ltd.\nMaterial Inspection Certificate Form II & Hydraulic Test Certificate.")
    ]

    doc_entities = []
    for fname, dtype, title, text_content in demo_docs_config:
        fpath = os.path.join(uploads_dir, f"demo_{fname}")
        create_sample_file(fpath, text_content)
        
        doc = Document(
            business_id=primary_business.id,
            user_id=applicant_user.id,
            filename=f"demo_{fname}",
            original_filename=fname,
            file_path=fpath,
            file_type="TXT",
            file_size_bytes=len(text_content.encode("utf-8")),
            file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            document_type=dtype,
            status="VERIFIED",
            validation_result={
                "status": "VERIFIED",
                "document_type_detected": dtype,
                "confidence_score": 0.96,
                "checks": [
                    {"item": "Business Name Consistency", "result": "MATCH", "details": "Matched 'Maharashtra Fresh Foods Pvt. Ltd.'"},
                    {"item": "Jurisdiction Check", "result": "MATCH", "details": "Matched Pune, Maharashtra"},
                    {"item": "Document Structural Completeness", "result": "MATCH", "details": "Mandatory technical sections present"}
                ],
                "summary": f"Verified {title} against Maharashtra Fresh Foods Pvt. Ltd. profile.",
                "recommended_action": "Document meets compliance standards for departmental processing."
            },
            extracted_metadata={"page_count": 1, "business_name_status": "VERIFIED"},
            ai_summary=f"Statutory submission document for {title}."
        )
        db.add(doc)
        doc_entities.append(doc)

    db.commit()

    print("Seeding Applications & Realistic Workflow Timelines...")
    # 1. MPCB Consent to Establish (CTE) - UNDER_REVIEW (Delayed / High SLA Risk)
    cte_app_type = approval_type_map["MPCB_CONSENT_ESTABLISH"]
    cte_app = Application(
        business_id=primary_business.id,
        approval_type_id=cte_app_type.id,
        application_number="MH-MPCB-2026-1048",
        status="UNDER_REVIEW",
        current_stage="DEPT_REVIEW",
        submission_date=now - timedelta(days=28),
        sla_deadline=now + timedelta(days=17),
        delay_risk_level="HIGH",
        delay_risk_reasons=[
            "Departmental review stage active for 18 days (exceeds SLA benchmark of 15 days)",
            "Inter-departmental hydraulic review memo pending from Regional Sub-division"
        ],
        next_action_prompt="Officer review pending. Awaiting final scrutiny endorsement.",
        assigned_officer="Sanjay Patil (MPCB Regional Officer Pune)",
        updated_at=now - timedelta(days=18) # 18 days inactive in current stage
    )
    db.add(cte_app)
    db.commit()
    db.refresh(cte_app)

    # Add workflow steps for CTE
    steps_cte = [
        WorkflowStep(application_id=cte_app.id, step_name="Submitted", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=28), completed_at=now - timedelta(days=28), officer_notes="Online single window application received."),
        WorkflowStep(application_id=cte_app.id, step_name="Document Verification", step_key="DOC_VERIFICATION", step_order=2, status="COMPLETED", started_at=now - timedelta(days=28), completed_at=now - timedelta(days=22), officer_notes="Mandatory DPR, ETP layout & 7/12 land extract verified by desk.", updated_by="Desk Officer"),
        WorkflowStep(application_id=cte_app.id, step_name="Department Review", step_key="DEPT_REVIEW", step_order=3, status="IN_PROGRESS", started_at=now - timedelta(days=22), officer_notes="Scrutiny of ETP 50 KLD capacity vs raw effluent parameters under review."),
        WorkflowStep(application_id=cte_app.id, step_name="Site Inspection", step_key="INSPECTION", step_order=4, status="PENDING"),
        WorkflowStep(application_id=cte_app.id, step_name="Board Decision", step_key="FINAL_DECISION", step_order=5, status="PENDING")
    ]
    db.add_all(steps_cte)

    # 2. FSSAI State Manufacturing License - DOCUMENTS_REQUIRED (Medium SLA Risk)
    fssai_app_type = approval_type_map["FSSAI_STATE_MFG_LICENSE"]
    fssai_app = Application(
        business_id=primary_business.id,
        approval_type_id=fssai_app_type.id,
        application_number="MH-FSSAI-2026-2491",
        status="DOCUMENTS_REQUIRED",
        current_stage="DOC_VERIFICATION",
        submission_date=now - timedelta(days=12),
        sla_deadline=now + timedelta(days=18),
        delay_risk_level="MEDIUM",
        delay_risk_reasons=[
            "2 mandatory document(s) missing: FSMS Food Safety Plan & NABL Potable Water Test Report",
            "Initial document verification waiting on applicant upload"
        ],
        next_action_prompt="Upload missing FSMS Safety Plan and NABL Potable Water Test Report.",
        assigned_officer="Dr. Anjali Joshi (FDA Maharashtra)",
        updated_at=now - timedelta(days=5)
    )
    db.add(fssai_app)
    db.commit()
    db.refresh(fssai_app)

    steps_fssai = [
        WorkflowStep(application_id=fssai_app.id, step_name="Submitted", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=12), completed_at=now - timedelta(days=12), officer_notes="Application registered."),
        WorkflowStep(application_id=fssai_app.id, step_name="Document Verification", step_key="DOC_VERIFICATION", step_order=2, status="IN_PROGRESS", started_at=now - timedelta(days=12), officer_notes="FSMS Plan and NABL water test report requested.", updated_by="Food Safety Desk"),
        WorkflowStep(application_id=fssai_app.id, step_name="Food Safety Officer Scrutiny", step_key="DEPT_REVIEW", step_order=3, status="PENDING"),
        WorkflowStep(application_id=fssai_app.id, step_name="Physical Inspection", step_key="INSPECTION", step_order=4, status="PENDING"),
        WorkflowStep(application_id=fssai_app.id, step_name="License Grant", step_key="FINAL_DECISION", step_order=5, status="PENDING")
    ]
    db.add_all(steps_fssai)

    # 3. MIDC Fire Safety NOC - INSPECTION_PENDING (Near SLA / Medium Delay Risk)
    fire_app_type = approval_type_map["MIDC_FIRE_SAFETY_NOC"]
    fire_app = Application(
        business_id=primary_business.id,
        approval_type_id=fire_app_type.id,
        application_number="MH-MIDC-2026-3829",
        status="INSPECTION_PENDING",
        current_stage="INSPECTION",
        submission_date=now - timedelta(days=17),
        sla_deadline=now + timedelta(days=4), # Approaching SLA (4 days left)
        delay_risk_level="MEDIUM",
        delay_risk_reasons=[
            "Approaching statutory SLA deadline in 4 days (SLA: 21 days)",
            "Field physical audit scheduled; waiting for on-site inspection completion"
        ],
        next_action_prompt="Site inspection scheduled for tomorrow. Keep perimeter access and water tank open.",
        assigned_officer="Chief Fire Officer K. Shinde",
        updated_at=now - timedelta(days=2)
    )
    db.add(fire_app)
    db.commit()
    db.refresh(fire_app)

    steps_fire = [
        WorkflowStep(application_id=fire_app.id, step_name="Submitted", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=17), completed_at=now - timedelta(days=17)),
        WorkflowStep(application_id=fire_app.id, step_name="Document Verification", step_key="DOC_VERIFICATION", step_order=2, status="COMPLETED", started_at=now - timedelta(days=17), completed_at=now - timedelta(days=10), officer_notes="Fire drawings & building blueprints verified."),
        WorkflowStep(application_id=fire_app.id, step_name="Fire Officer Site Inspection", step_key="INSPECTION", step_order=3, status="IN_PROGRESS", started_at=now - timedelta(days=3), officer_notes="Field inspection assigned to Station Officer."),
        WorkflowStep(application_id=fire_app.id, step_name="Compliance Audit", step_key="DEPT_REVIEW", step_order=4, status="PENDING"),
        WorkflowStep(application_id=fire_app.id, step_name="NOC Issuance", step_key="FINAL_DECISION", step_order=5, status="PENDING")
    ]
    db.add_all(steps_fire)

    # 4. DISH Factory Registration - UNDER_REVIEW (Low Risk)
    dish_app_type = approval_type_map["DISH_FACTORY_REGISTRATION"]
    dish_app = Application(
        business_id=primary_business.id,
        approval_type_id=dish_app_type.id,
        application_number="MH-DISH-2026-4192",
        status="UNDER_REVIEW",
        current_stage="DEPT_REVIEW",
        submission_date=now - timedelta(days=8),
        sla_deadline=now + timedelta(days=22),
        delay_risk_level="LOW",
        delay_risk_reasons=["Progressing within standard review benchmarks."],
        next_action_prompt="Departmental scrutiny of machinery layout in progress.",
        assigned_officer="DISH Senior Inspector M. Gaikwad",
        updated_at=now - timedelta(days=3)
    )
    db.add(dish_app)
    db.commit()
    db.refresh(dish_app)

    steps_dish = [
        WorkflowStep(application_id=dish_app.id, step_name="Submitted", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=8), completed_at=now - timedelta(days=8), officer_notes="Online factory registration submitted."),
        WorkflowStep(application_id=dish_app.id, step_name="Document Verification", step_key="DOC_VERIFICATION", step_order=2, status="COMPLETED", started_at=now - timedelta(days=8), completed_at=now - timedelta(days=4), officer_notes="Factory drawings & machine layout verified.", updated_by="Desk Scrutiny Officer"),
        WorkflowStep(application_id=dish_app.id, step_name="Machinery Safety Scrutiny", step_key="DEPT_REVIEW", step_order=3, status="IN_PROGRESS", started_at=now - timedelta(days=4), officer_notes="Evaluating horsepower ratings and boiler proximity clearance."),
        WorkflowStep(application_id=dish_app.id, step_name="Factory Inspector Site Audit", step_key="INSPECTION", step_order=4, status="PENDING"),
        WorkflowStep(application_id=dish_app.id, step_name="Registration Grant", step_key="FINAL_DECISION", step_order=5, status="PENDING")
    ]
    db.add_all(steps_dish)

    # 5. MSEDCL Power Sanction - APPROVED (Completed)
    power_app_type = approval_type_map["MSEDCL_POWER_LOAD_SANCTION"]
    power_app = Application(
        business_id=primary_business.id,
        approval_type_id=power_app_type.id,
        application_number="MH-MSEDCL-2026-5810",
        status="APPROVED",
        current_stage="COMPLETED",
        submission_date=now - timedelta(days=35),
        sla_deadline=now - timedelta(days=20),
        delay_risk_level="LOW",
        delay_risk_reasons=["Application successfully approved and clearance certificate issued. No active SLA risk."],
        next_action_prompt="HT Power sanctioned (350 kVA). Meter energized.",
        assigned_officer="Executive Engineer MSEDCL Chakan",
        updated_at=now - timedelta(days=19)
    )
    db.add(power_app)
    db.commit()
    db.refresh(power_app)

    steps_power = [
        WorkflowStep(application_id=power_app.id, step_name="Application & Load Calculation", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=35), completed_at=now - timedelta(days=35)),
        WorkflowStep(application_id=power_app.id, step_name="Feasibility Study", step_key="DOC_VERIFICATION", step_order=2, status="COMPLETED", started_at=now - timedelta(days=35), completed_at=now - timedelta(days=28)),
        WorkflowStep(application_id=power_app.id, step_name="Demand Note & Payment Verification", step_key="DEPT_REVIEW", step_order=3, status="COMPLETED", started_at=now - timedelta(days=28), completed_at=now - timedelta(days=24)),
        WorkflowStep(application_id=power_app.id, step_name="Substation Transformer Inspection", step_key="INSPECTION", step_order=4, status="COMPLETED", started_at=now - timedelta(days=24), completed_at=now - timedelta(days=20)),
        WorkflowStep(application_id=power_app.id, step_name="Sanction & Meter Energization", step_key="FINAL_DECISION", step_order=5, status="COMPLETED", started_at=now - timedelta(days=20), completed_at=now - timedelta(days=19), officer_notes="HT Power line energized at 350 kVA. Sanction order issued.")
    ]
    db.add_all(steps_power)

    # 6. Non-Agricultural Land Permission - APPROVED
    na_app_type = approval_type_map["MAHA_TOWN_PLANNING_NA_NOC"]
    na_app = Application(
        business_id=primary_business.id,
        approval_type_id=na_app_type.id,
        application_number="MH-MAHA-2026-6204",
        status="APPROVED",
        current_stage="COMPLETED",
        submission_date=now - timedelta(days=45),
        sla_deadline=now - timedelta(days=15),
        delay_risk_level="LOW",
        delay_risk_reasons=["Application successfully approved and clearance certificate issued. No active SLA risk."],
        next_action_prompt="Sanction Order issued by Town Planning Authority.",
        assigned_officer="Town Planner Pune Region",
        updated_at=now - timedelta(days=16)
    )
    db.add(na_app)
    db.commit()
    db.refresh(na_app)

    steps_na = [
        WorkflowStep(application_id=na_app.id, step_name="Application Submitted", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=45), completed_at=now - timedelta(days=45)),
        WorkflowStep(application_id=na_app.id, step_name="Title & Revenue Record Verification", step_key="DOC_VERIFICATION", step_order=2, status="COMPLETED", started_at=now - timedelta(days=45), completed_at=now - timedelta(days=35)),
        WorkflowStep(application_id=na_app.id, step_name="Town Planning Technical Examination", step_key="DEPT_REVIEW", step_order=3, status="COMPLETED", started_at=now - timedelta(days=35), completed_at=now - timedelta(days=25)),
        WorkflowStep(application_id=na_app.id, step_name="Revenue Authority Joint Measurement", step_key="INSPECTION", step_order=4, status="COMPLETED", started_at=now - timedelta(days=25), completed_at=now - timedelta(days=18)),
        WorkflowStep(application_id=na_app.id, step_name="Sanction Order Issued", step_key="FINAL_DECISION", step_order=5, status="COMPLETED", started_at=now - timedelta(days=18), completed_at=now - timedelta(days=16), officer_notes="NA 44 Sanction formally granted.")
    ]
    db.add_all(steps_na)

    # 7. Steam Boiler Registration - INSPECTION_PENDING
    boiler_app_type = approval_type_map["STEAM_BOILER_REGISTRATION"]
    boiler_app = Application(
        business_id=primary_business.id,
        approval_type_id=boiler_app_type.id,
        application_number="MH-STEAM-2026-7319",
        status="INSPECTION_PENDING",
        current_stage="INSPECTION",
        submission_date=now - timedelta(days=6),
        sla_deadline=now + timedelta(days=14),
        delay_risk_level="LOW",
        delay_risk_reasons=["Hydraulic pressure inspection scheduled."],
        next_action_prompt="Prepare boiler hydraulic pressure test pump for Inspector visit.",
        assigned_officer="Inspector of Steam Boilers, Pune Circle",
        updated_at=now - timedelta(days=1)
    )
    db.add(boiler_app)
    db.commit()
    db.refresh(boiler_app)

    steps_boiler = [
        WorkflowStep(application_id=boiler_app.id, step_name="Application & Drawings Submitted", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=6), completed_at=now - timedelta(days=6)),
        WorkflowStep(application_id=boiler_app.id, step_name="Design & Material Certificate Scrutiny", step_key="DOC_VERIFICATION", step_order=2, status="COMPLETED", started_at=now - timedelta(days=6), completed_at=now - timedelta(days=3)),
        WorkflowStep(application_id=boiler_app.id, step_name="Directorate Scrutiny", step_key="DEPT_REVIEW", step_order=3, status="COMPLETED", started_at=now - timedelta(days=3), completed_at=now - timedelta(days=2)),
        WorkflowStep(application_id=boiler_app.id, step_name="Hydraulic Pressure Inspection", step_key="INSPECTION", step_order=4, status="IN_PROGRESS", started_at=now - timedelta(days=1), officer_notes="Field inspection scheduled for hydraulic stress testing."),
        WorkflowStep(application_id=boiler_app.id, step_name="Registration Certificate Grant", step_key="FINAL_DECISION", step_order=5, status="PENDING")
    ]
    db.add_all(steps_boiler)

    # 8. Legal Metrology - SUBMITTED
    pkg_app_type = approval_type_map["LEGAL_METROLOGY_PACKAGED"]
    pkg_app = Application(
        business_id=primary_business.id,
        approval_type_id=pkg_app_type.id,
        application_number="MH-LEGAL-2026-8490",
        status="SUBMITTED",
        current_stage="DOC_VERIFICATION",
        submission_date=now - timedelta(days=2),
        sla_deadline=now + timedelta(days=13),
        delay_risk_level="LOW",
        delay_risk_reasons=["Application under initial auto-scrutiny."],
        next_action_prompt="Under preliminary packaging label verification.",
        assigned_officer="Assistant Controller Legal Metrology",
        updated_at=now - timedelta(days=2)
    )
    db.add(pkg_app)
    db.commit()
    db.refresh(pkg_app)

    steps_pkg = [
        WorkflowStep(application_id=pkg_app.id, step_name="Online Application Received", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=2), completed_at=now - timedelta(days=2)),
        WorkflowStep(application_id=pkg_app.id, step_name="Packaging Label & Net Quantity Verification", step_key="DOC_VERIFICATION", step_order=2, status="IN_PROGRESS", started_at=now - timedelta(days=2), officer_notes="Checking declaration on package sample artwork."),
        WorkflowStep(application_id=pkg_app.id, step_name="Technical Verification", step_key="DEPT_REVIEW", step_order=3, status="PENDING"),
        WorkflowStep(application_id=pkg_app.id, step_name="Certificate of Registration Grant", step_key="FINAL_DECISION", step_order=4, status="PENDING")
    ]
    db.add_all(steps_pkg)

    # 9. Water Connection - APPROVED
    water_app_type = approval_type_map["MAHA_WATER_SUPPLY_NOC"]
    water_app = Application(
        business_id=primary_business.id,
        approval_type_id=water_app_type.id,
        application_number="MH-MAHA-2026-9112",
        status="APPROVED",
        current_stage="COMPLETED",
        submission_date=now - timedelta(days=30),
        sla_deadline=now - timedelta(days=16),
        delay_risk_level="LOW",
        delay_risk_reasons=["Application successfully approved and clearance certificate issued. No active SLA risk."],
        next_action_prompt="MIDC bulk water connection active.",
        assigned_officer="MIDC Executive Engineer (Water)",
        updated_at=now - timedelta(days=15)
    )
    db.add(water_app)
    db.commit()
    db.refresh(water_app)

    steps_water = [
        WorkflowStep(application_id=water_app.id, step_name="Pipeline Connection Request Submitted", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=30), completed_at=now - timedelta(days=30)),
        WorkflowStep(application_id=water_app.id, step_name="Water Balance & Plumbing Drawing Scrutiny", step_key="DOC_VERIFICATION", step_order=2, status="COMPLETED", started_at=now - timedelta(days=30), completed_at=now - timedelta(days=24)),
        WorkflowStep(application_id=water_app.id, step_name="Hydraulic Feasibility Assessment", step_key="DEPT_REVIEW", step_order=3, status="COMPLETED", started_at=now - timedelta(days=24), completed_at=now - timedelta(days=19)),
        WorkflowStep(application_id=water_app.id, step_name="Pipe Tapping Site Inspection", step_key="INSPECTION", step_order=4, status="COMPLETED", started_at=now - timedelta(days=19), completed_at=now - timedelta(days=16)),
        WorkflowStep(application_id=water_app.id, step_name="Water Supply Sanction & Meter Installed", step_key="FINAL_DECISION", step_order=5, status="COMPLETED", started_at=now - timedelta(days=16), completed_at=now - timedelta(days=15), officer_notes="45 KLD bulk supply line sanctioned.")
    ]
    db.add_all(steps_water)

    # 10. Shops & Establishment (Gumasta) - APPROVED
    gumasta_app_type = approval_type_map["MAHA_SHOPS_ESTABLISHMENT_GUMASTA"]
    gumasta_app = Application(
        business_id=primary_business.id,
        approval_type_id=gumasta_app_type.id,
        application_number="MH-MAHA-2026-9850",
        status="APPROVED",
        current_stage="COMPLETED",
        submission_date=now - timedelta(days=50),
        sla_deadline=now - timedelta(days=43),
        delay_risk_level="LOW",
        delay_risk_reasons=["Application successfully approved and clearance certificate issued. No active SLA risk."],
        next_action_prompt="Registration Certificate active (Lifetime validity).",
        assigned_officer="Labour Officer Pune",
        updated_at=now - timedelta(days=42)
    )
    db.add(gumasta_app)
    db.commit()
    db.refresh(gumasta_app)

    steps_gumasta = [
        WorkflowStep(application_id=gumasta_app.id, step_name="Online Form Submitted", step_key="SUBMITTED", step_order=1, status="COMPLETED", started_at=now - timedelta(days=50), completed_at=now - timedelta(days=50)),
        WorkflowStep(application_id=gumasta_app.id, step_name="KYC & Business Address Verification", step_key="DOC_VERIFICATION", step_order=2, status="COMPLETED", started_at=now - timedelta(days=50), completed_at=now - timedelta(days=45)),
        WorkflowStep(application_id=gumasta_app.id, step_name="Labour Department Auto-Scrutiny", step_key="DEPT_REVIEW", step_order=3, status="COMPLETED", started_at=now - timedelta(days=45), completed_at=now - timedelta(days=43)),
        WorkflowStep(application_id=gumasta_app.id, step_name="Registration Certificate Issued", step_key="FINAL_DECISION", step_order=4, status="COMPLETED", started_at=now - timedelta(days=43), completed_at=now - timedelta(days=42), officer_notes="Gumasta Registration certificate issued.")
    ]
    db.add_all(steps_gumasta)

    db.commit()

    # Validate all seeded applications against Canonical State Rules
    all_seeded_apps = db.query(Application).all()
    for sapp in all_seeded_apps:
        is_valid, err = CanonicalWorkflowState.validate_state(sapp.status, sapp.current_stage)
        assert is_valid, f"Seed error in {sapp.application_number}: {err}"
        # Ensure completed apps have all steps COMPLETED
        if sapp.status in ["APPROVED", "COMPLETED"]:
            assert sapp.delay_risk_level == "LOW", f"Completed app {sapp.application_number} must have LOW delay risk"
            for stp in sapp.workflow_steps:
                assert stp.status == "COMPLETED", f"Completed app {sapp.application_number} has non-completed step {stp.step_name}"
    print(f"Verified all {len(all_seeded_apps)} applications against Canonical State Model (100% consistent).")

    print("Linking Documents to Applications...")
    # Link doc entities to applications
    for doc in doc_entities:
        if doc.document_type in ["PROJECT_REPORT_DPR", "POLLUTION_CONTROL_SCHEME", "LAND_TITLE_7_12_EXTRACT", "WATER_BALANCE_SHEET"]:
            db.add(ApplicationDocument(application_id=cte_app.id, document_id=doc.id, is_mandatory=True, status="VERIFIED"))
        if doc.document_type in ["FIRE_SAFETY_PLAN", "FACTORY_BUILDING_PLAN"]:
            db.add(ApplicationDocument(application_id=fire_app.id, document_id=doc.id, is_mandatory=True, status="VERIFIED"))
        if doc.document_type in ["ELECTRICITY_LOAD_SANCTION", "LAND_TITLE_7_12_EXTRACT"]:
            db.add(ApplicationDocument(application_id=power_app.id, document_id=doc.id, is_mandatory=True, status="VERIFIED"))
        if doc.document_type in ["PAN_CARD", "UDYAM_REGISTRATION"]:
            db.add(ApplicationDocument(application_id=fssai_app.id, document_id=doc.id, is_mandatory=True, status="VERIFIED"))
        if doc.document_type in ["BOILER_MANUFACTURER_CERT"]:
            db.add(ApplicationDocument(application_id=boiler_app.id, document_id=doc.id, is_mandatory=True, status="VERIFIED"))

    db.commit()

    print("Seeding Inspections...")
    insp1 = Inspection(
        application_id=fire_app.id,
        business_id=primary_business.id,
        inspection_type="Fire Safety & Hydrant System Audit",
        scheduled_date=now + timedelta(days=1, hours=4), # Tomorrow morning
        officer_name="K. Shinde",
        officer_designation="Station Fire Officer, MIDC Chakan",
        officer_contact="+91 94225 33445",
        location="Plot E-42, MIDC Chakan Phase II, Pune",
        status="SCHEDULED",
        applicant_action_required="Keep underground static water reservoir access clear and ensure fire pump test run readiness."
    )
    insp2 = Inspection(
        application_id=boiler_app.id,
        business_id=primary_business.id,
        inspection_type="Boiler Hydraulic Pressure Verification",
        scheduled_date=now + timedelta(days=4, hours=2),
        officer_name="V. K. Tambe",
        officer_designation="Inspector of Steam Boilers, Maharashtra",
        officer_contact="+91 98233 77889",
        location="Boiler Room, Maharashtra Fresh Foods Pvt. Ltd., Chakan",
        status="SCHEDULED",
        applicant_action_required="Ensure calibrated test pressure gauge (0-25 kg/cm2) and trained IBR boiler attendant on site."
    )
    db.add_all([insp1, insp2])
    db.commit()

    print("Seeding Recurring Compliance Calendar Tasks...")
    comp1 = ComplianceTask(
        business_id=primary_business.id,
        title="MPCB Environmental Statement (Form V) Annual Submission",
        category="Pollution Monitoring",
        issuing_authority="MPCB",
        frequency="Annual",
        due_date=now + timedelta(days=45),
        status="UPCOMING",
        penalty_risk_desc="Statutory notice under Environment Protection Act and potential fine of ₹25,000.",
        action_instructions="Submit Form V with annual water consumption, raw material balance, and ETP sludge disposal logs.",
        legal_act_reference="Environment (Protection) Rules 1986 (Rule 14)",
        source_title="Environment (Protection) Second Amendment Rules, 1992 - Environmental Statement Submission",
        source_reference="Gazette Notification G.S.R. 329(E) & Rule 14 of Environment (Protection) Rules 1986",
        source_section="Rule 14 (Mandatory annual submission of Form V on or before 30th September to SPCB)",
        verification_status="VERIFIED",
        source_url="https://mpcb.gov.in/consent-management",
        last_verified_date="2026-09-25"
    )
    comp2 = ComplianceTask(
        business_id=primary_business.id,
        title="Potable Water Bacteriological Lab Test (NABL)",
        category="FSSAI Mandatory Testing",
        issuing_authority="FDA / FSSAI",
        frequency="Half-Yearly",
        due_date=now + timedelta(days=14),
        status="DUE_SOON",
        penalty_risk_desc="Non-compliance notice and suspension of food processing batch clearance.",
        action_instructions="Collect raw source & treated RO water samples and send to accredited NABL lab in Pune.",
        legal_act_reference="Food Safety & Standards Regulations 2011 (Schedule IV)",
        source_title="Food Safety and Standards (Licensing and Registration of Food Businesses) Regulations, 2011",
        source_reference="FSSAI Notification No. 1-27/FSSAI/T/2010 & Schedule 4 General Hygienic Practices",
        source_section="Schedule 4, Part II, Section 4.1.2 (Mandatory biannual testing of potable water as per IS 10500)",
        verification_status="VERIFIED",
        source_url="https://foscos.fssai.gov.in",
        last_verified_date="2026-09-25"
    )
    comp3 = ComplianceTask(
        business_id=primary_business.id,
        title="Annual Factory Safety Audit & Fire Mock Drill",
        category="Fire & Worker Safety",
        issuing_authority="DISH & MIDC Fire",
        frequency="Annual",
        due_date=now + timedelta(days=90),
        status="UPCOMING",
        penalty_risk_desc="Factory inspectorate audit non-compliance mark.",
        action_instructions="Conduct factory-wide evacuation drill with trained fire marshals and log attendance register.",
        legal_act_reference="Maharashtra Factories (Safety Audit) Rules 2012/2024 & Fire Prevention Act 2006",
        source_title="Maharashtra Factories (Safety Audit) Rules, 2012 & Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
        source_reference="DISH Notification No. FAC-2012/CR-278/LAB-4 & Section 3(3) of Fire Prevention Act 2006",
        source_section="Rules 3 & 4 (Periodic Safety Audit for factories employing 50+ workers) and Section 3(3) (Mock Drills)",
        verification_status="VERIFIED",
        source_url="https://dish.maharashtra.gov.in",
        last_verified_date="2026-09-25"
    )
    db.add_all([comp1, comp2, comp3])
    db.commit()

    print("Seeding In-App Notifications...")
    notifs = [
        Notification(
            user_id=applicant_user.id,
            business_id=primary_business.id,
            title="Inspection Scheduled: Fire Safety NOC",
            message="Field inspection for your Fire NOC (MH-MIDC-2026-3829) is scheduled for tomorrow at 11:00 AM.",
            type="INSPECTION",
            action_link="/inspections"
        ),
        Notification(
            user_id=applicant_user.id,
            business_id=primary_business.id,
            title="SLA Delay Risk Alert: MPCB Consent",
            message="Application MH-MPCB-2026-1048 has exceeded the 15-day department review benchmark. Flagged for priority escalation.",
            type="SLA_BREACH",
            action_link="/applications"
        ),
        Notification(
            user_id=applicant_user.id,
            business_id=primary_business.id,
            title="Missing Documents for FSSAI License",
            message="FSSAI license application MH-FSSAI-2026-2491 requires FSMS Plan and NABL water test report.",
            type="ALERT",
            action_link="/applications"
        ),
        Notification(
            user_id=applicant_user.id,
            business_id=primary_business.id,
            title="Government Support Scheme Match",
            message="Your profile matches Maharashtra Package Scheme of Incentives (PSI 2019/2024) for up to 50% capital subsidy.",
            type="SUCCESS",
            action_link="/schemes"
        )
    ]
    db.add_all(notifs)
    db.commit()

    print("Seeding Audit Logs...")
    audit_events = [
        ("USER_LOGIN", "Applicant Rajesh Kulkarni logged in from 127.0.0.1", applicant_user, "User", str(applicant_user.id)),
        ("BUSINESS_CREATED", "Registered business profile 'Maharashtra Fresh Foods Pvt. Ltd.' in Pune, Maharashtra.", applicant_user, "Business", str(primary_business.id)),
        ("PLAN_GENERATED", "Generated personalized approval roadmap for Food Processing Unit (10 approvals identified).", applicant_user, "Business", str(primary_business.id)),
        ("APPLICATION_CREATED", "Created application MH-MPCB-2026-1048 for Consent to Establish.", applicant_user, "Application", str(cte_app.id)),
        ("DOCUMENT_UPLOADED", "Uploaded 'demo_etp_pollution_scheme.txt' (POLLUTION_CONTROL_SCHEME).", applicant_user, "Document", str(doc_entities[4].id)),
        ("DOCUMENT_VALIDATED", "Validated 'demo_etp_pollution_scheme.txt': Consistency check MATCH with profile.", applicant_user, "Document", str(doc_entities[4].id)),
        ("INSPECTION_SCHEDULED", "Scheduled Fire Safety Audit on 26/09/2026 by Station Officer K. Shinde.", admin_user, "Inspection", str(insp1.id)),
        ("SLA_RISK_FLAGGED", "Automated Delay Risk Engine flagged MH-MPCB-2026-1048 as HIGH delay risk.", None, "Application", str(cte_app.id))
    ]

    for action, desc, usr, etype, eid in audit_events:
        db.add(AuditLog(
            user_id=usr.id if usr else None,
            user_email=usr.email if usr else "system_delay_engine",
            action=action,
            entity_type=etype,
            entity_id=eid,
            description=desc,
            ip_address="127.0.0.1",
            created_at=now - timedelta(days=1)
        ))

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
