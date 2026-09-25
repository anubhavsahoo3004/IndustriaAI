"""
Curated knowledge base of Maharashtra industrial approvals, standard SLAs, required documents, and support schemes.
Extensible configuration without hard-coding in routes or frontend.
Claim-level audited under SIH26130 Regulatory Knowledge Audit with authoritative statutory sources and disclaimer.
"""

MAHARASHTRA_APPROVALS_SEED = [
    {
        "code": "MPCB_CONSENT_ESTABLISH",
        "name": "Consent to Establish (CTE) - Orange / Red Category",
        "issuing_authority": "Maharashtra Pollution Control Board (MPCB)",
        "department": "Environment & Climate Change",
        "category": "Environmental",
        "description": "Statutory permission required prior to starting any construction or physical installation of industrial plant and machinery to ensure pollution mitigation measures.",
        "why_it_applies_template": "Your {industry} unit at {district} ({scale} scale) with effluent/emission generation falls under MPCB environmental classification requiring prior pollution clearance.",
        "standard_sla_days": 24, # Indicative for Orange Category under MPCB EoDB guidelines (Green: 15d, Orange: 24d, Red: 40d; subject to SRO confirmation)
        "renewal_frequency_years": 0, # One time before construction
        "inspection_required": True,
        "legal_act_reference": "Water (Prevention & Control of Pollution) Act 1974 & Air Act 1981",
        "source_title": "MPCB Consent Management Guidelines & EoDB Timelines Schedule",
        "source_url": "https://mpcb.gov.in/consent-management",
        "source_reference": "Maharashtra Right to Public Services Act, 2015 & MPCB EoDB Notified Timelines (Aaple Sarkar)",
        "source_section": "Indicative Timelines Schedule (Green 15d, Orange 24d, Red 40d) & Financial Delegation Bands",
        "verification_status": "NEEDS_VERIFICATION", # Classified as NEEDS_VERIFICATION because exact internal circular PDF could not be independently downloaded from public portal
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit"],
            "excluded_industries": ["IT / Services"],
            "stages": ["Planning", "Land Acquired", "Civil Works"],
            "effluent_trigger": True,
            "category_timelines": {
                "Green": 15,
                "Orange": 24,
                "Red": 40
            },
            "delegation_power_slabs": {
                "Sub-Regional Officer": "Orange < ₹25 Cr, Green < ₹50 Cr",
                "Regional Officer": "Red < ₹25 Cr, Orange ₹25 Cr - ₹100 Cr",
                "Head Office / Consent Committee": "Red > ₹25 Cr, Orange > ₹100 Cr"
            }
        },
        "required_documents_manifest": [
            {"doc_type": "PROJECT_REPORT_DPR", "name": "Detailed Project Report (DPR) & Manufacturing Process Flowchart", "mandatory": True},
            {"doc_type": "POLLUTION_CONTROL_SCHEME", "name": "Effluent Treatment Plant (ETP) / STP Layout & Air Pollution Control Scheme", "mandatory": True},
            {"doc_type": "LAND_TITLE_7_12_EXTRACT", "name": "Land Ownership 7/12 Extract or MIDC Plot Allotment Letter", "mandatory": True},
            {"doc_type": "WATER_BALANCE_SHEET", "name": "Water Balance Diagram & Raw Material Quantity Calculations", "mandatory": True},
            {"doc_type": "FACTORY_BUILDING_PLAN", "name": "Factory Layout Plan showing machinery & green belt area", "mandatory": False}
        ],
        "default_workflow_steps": ["Submitted", "Document Verification", "Department Review", "Site Inspection", "Board Decision"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "FSSAI_STATE_MFG_LICENSE",
        "name": "FSSAI State Manufacturing & Processing License",
        "issuing_authority": "Food & Drugs Administration (FDA) Maharashtra / FSSAI",
        "department": "Food Safety & Standards",
        "category": "Licensing & Safety",
        "description": "Mandatory license under Food Safety and Standards Act for manufacturing, processing, packaging, and storage of food products in Maharashtra.",
        "why_it_applies_template": "Your business operates in the {industry} sector with {scale} production scale. FSSAI eligibility is evaluated using the applicable Kind-of-Business (KoB) rules and current turnover thresholds. Capacity-specific conditions are applied only where the applicable KoB specifies them.",
        "standard_sla_days": 30,
        "renewal_frequency_years": 1,
        "inspection_required": True,
        "legal_act_reference": "Food Safety and Standards Act, 2006 (Section 31)",
        "source_title": "Food Safety and Standards (Licensing & Registration of Food Businesses) Regulations, 2011 & Amendment Regulations, 2026",
        "source_url": "https://foscos.fssai.gov.in",
        "source_reference": "FSS Act 2006 (Sec 31), FSS Regulations 2011 (Schedule 1) & 2026 Turnover Amendments",
        "source_section": "KoB Rules & Turnover Thresholds: Evaluated using applicable Kind-of-Business (KoB) rules and current turnover thresholds (>₹1.5 Cr to ₹50 Cr effective 01.04.2026 for State License). Capacity-specific conditions apply only where the applicable KoB specifies them.",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing"],
            "scales": ["Micro", "Small", "Medium", "Large"],
            "foscos_license_level": "State License",
            "evaluation_principle": "FSSAI eligibility is evaluated using the applicable Kind-of-Business (KoB) rules and current turnover thresholds. Capacity-specific conditions are applied only where the applicable KoB specifies them.",
            "statutory_criteria": {
                "turnover_based_rule_2026": {
                    "effective_date": "2026-04-01",
                    "basic_registration": "Annual turnover up to ₹1.5 Crore",
                    "state_license": "Annual turnover above ₹1.5 Crore and up to ₹50 Crore",
                    "central_license": "Annual turnover above ₹50 Crore"
                },
                "applicable_kob_capacity_rules": {
                    "regulations": "FSS Regulations 2011 Schedule 1 (KoB 1.1 General Food Manufacturing)",
                    "note": "Capacity-specific conditions are applied only where the applicable KoB specifies them.",
                    "state_license_band": "101 kg/day up to 2 MT/day (applicable to KoB 1.1 General Food Manufacturing)"
                }
            }
        },
        "required_documents_manifest": [
            {"doc_type": "FSSAI_FOOD_SAFETY_MANAGEMENT_PLAN", "name": "FSMS Plan (Food Safety Management System) & SOPs", "mandatory": True},
            {"doc_type": "EQUIPMENT_LIST_SPECIFICATIONS", "name": "List of Food Processing Machinery, Installed Capacities & Horsepower", "mandatory": True},
            {"doc_type": "WATER_TEST_REPORT", "name": "Potable Water Chemical & Bacteriological Analysis Report from NABL Lab", "mandatory": True},
            {"doc_type": "PAN_CARD", "name": "PAN & Aadhaar of Directors / Authorized Signatory", "mandatory": True},
            {"doc_type": "UDYAM_REGISTRATION", "name": "Udyam Registration Certificate", "mandatory": True}
        ],
        "default_workflow_steps": ["Submitted", "Document Verification", "Food Safety Officer Scrutiny", "Physical Inspection", "License Grant"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "MIDC_FIRE_SAFETY_NOC",
        "name": "Fire Safety Provisional & Final NOC",
        "issuing_authority": "Maharashtra Fire Services / MIDC Special Planning Authority",
        "department": "Urban Development & Fire Safety",
        "category": "Safety & Fire",
        "description": "Fire prevention and life safety clearance required to ensure industrial premises comply with Maharashtra Fire Prevention and Life Safety Measures Act.",
        "why_it_applies_template": "Your proposed industrial plant at {district} exceeds built-up thresholds requiring approved fire hydrant, smoke detection, and emergency evacuation clearance.",
        "standard_sla_days": 21,
        "renewal_frequency_years": 1,
        "inspection_required": True,
        "legal_act_reference": "Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
        "source_title": "Maharashtra Fire Prevention and Life Safety Measures Act, 2006 & Rules 2008",
        "source_url": "https://mahafireservice.gov.in",
        "source_reference": "Maharashtra Act No. III of 2007",
        "source_section": "Section 3 (Approval of Building Plans) & Schedule I",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit", "IT / Services"]
        },
        "required_documents_manifest": [
            {"doc_type": "FIRE_SAFETY_PLAN", "name": "Architectural Fire Safety & Hydrant System Layout drawing (scale 1:100)", "mandatory": True},
            {"doc_type": "FACTORY_BUILDING_PLAN", "name": "Approved Architectural Building Blueprint & Structural Stability Certificate", "mandatory": True},
            {"doc_type": "PROJECT_REPORT_DPR", "name": "Hazardous Raw Material & Fuel Storage Declaration", "mandatory": True}
        ],
        "default_workflow_steps": ["Submitted", "Document Verification", "Fire Officer Site Inspection", "Compliance Audit", "NOC Issuance"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "DISH_FACTORY_REGISTRATION",
        "name": "Factory License & Plan Approval under Factories Act",
        "issuing_authority": "Directorate of Industrial Safety & Health (DISH) Maharashtra",
        "department": "Labour & Employment",
        "category": "Labour & Safety",
        "description": "Statutory registration and approval of factory building plans for premises employing 10 or more workers with power or 20 or more without power.",
        "why_it_applies_template": "Your unit employs {employee_count} workers with electric power load, requiring mandatory factory license and worker safety compliance registration under DISH.",
        "standard_sla_days": 30,
        "renewal_frequency_years": 1,
        "inspection_required": True,
        "legal_act_reference": "Factories Act 1948 & Maharashtra Factories Rules 1963",
        "source_title": "The Factories Act, 1948 & Maharashtra Factories Rules, 1963",
        "source_url": "https://dish.maharashtra.gov.in",
        "source_reference": "Central Act No. 63 of 1948",
        "source_section": "Section 2(m) & Rules 3 to 5 (Approval of Plans, Form 1 & Form 2 License Grant)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "min_employees": 10,
            "industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit"]
        },
        "required_documents_manifest": [
            {"doc_type": "FACTORY_BUILDING_PLAN", "name": "Factory Building Plans in Triplicate signed by Certified Competent Person", "mandatory": True},
            {"doc_type": "EQUIPMENT_LIST_SPECIFICATIONS", "name": "Details of Prime Movers, Motors, Connected Power & Machinery Layout", "mandatory": True},
            {"doc_type": "PAN_CARD", "name": "Appointment of Factory Manager & Occupier Identity Proof", "mandatory": True}
        ],
        "default_workflow_steps": ["Submitted", "Document Verification", "DISH Inspector Scrutiny", "Factory Inspection", "License Grant"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "MSEDCL_POWER_LOAD_SANCTION",
        "name": "HT / LT Industrial Electricity Load Sanction & Connection",
        "issuing_authority": "Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)",
        "department": "Energy Department",
        "category": "Power & Utilities",
        "description": "Sanction of industrial electric supply and installation of transformer / metering unit for operational machinery.",
        "why_it_applies_template": "Your industrial operations require {electricity_load_kw} kW connected power for machinery and plant automation in {district}.",
        "standard_sla_days": 15,
        "renewal_frequency_years": 0,
        "inspection_required": True,
        "legal_act_reference": "Electricity Act 2003 & Maharashtra Electricity Regulatory Commission (MERC) Regulations",
        "source_title": "MERC Standards of Performance of Distribution Licensees Regulations, 2021",
        "source_url": "https://wss.mahadiscom.in/wss/wss",
        "source_reference": "MERC (Electricity Supply Code) Regulations, 2021",
        "source_section": "Regulation 4 (Schedule of Timelines for Supply Feasibility & Connection Release)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit", "IT / Services"]
        },
        "required_documents_manifest": [
            {"doc_type": "ELECTRICITY_LOAD_SANCTION", "name": "Connected Electrical Load List, Single Line Diagram (SLD) & Transformer Rating", "mandatory": True},
            {"doc_type": "LAND_TITLE_7_12_EXTRACT", "name": "Proof of Land Ownership / Registered Lease Deed & MIDC Possession Receipt", "mandatory": True},
            {"doc_type": "TEST_REPORT_ELECTRICAL", "name": "Electrical Contractor Test Report (Form A/B)", "mandatory": False}
        ],
        "default_workflow_steps": ["Submitted", "Technical Feasibility Study", "Joint Site Survey", "Demand Note Generation", "Meter Energization"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "MAHA_TOWN_PLANNING_NA_NOC",
        "name": "Non-Agricultural (NA) Industrial Land Use Permission / Building Sanction",
        "issuing_authority": "Town Planning & Valuation Dept / District Collector / MIDC SPA",
        "department": "Revenue & Town Planning",
        "category": "Land & Civil",
        "description": "Zoning clearance and conversion of agricultural land to industrial use or formal building layout sanction inside MIDC / designated industrial zones.",
        "why_it_applies_template": "Establishing a {project_type} industrial facility in {district} requires certified industrial land use and building drawing sanctions.",
        "standard_sla_days": 30,
        "renewal_frequency_years": 0,
        "inspection_required": True,
        "legal_act_reference": "Maharashtra Land Revenue Code, 1966 & MRTP Act 1966",
        "source_title": "Maharashtra Land Revenue Code, 1966 & Revenue Department Guidelines",
        "source_url": "https://mahabhumi.gov.in",
        "source_reference": "Maharashtra Act No. XLI of 1966",
        "source_section": "Section 44 (Procedure for Conversion of Agricultural Land into Industrial Non-Agricultural Use)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit"],
            "stages": ["Land Acquired", "Planning", "Civil Works"]
        },
        "required_documents_manifest": [
            {"doc_type": "LAND_TITLE_7_12_EXTRACT", "name": "7/12 Extract, Mutation Entry, Gut Book Extract & Demarcation Map", "mandatory": True},
            {"doc_type": "FACTORY_BUILDING_PLAN", "name": "Architectural Layout, Elevation & Cross-Section Drawings", "mandatory": True},
            {"doc_type": "PROJECT_REPORT_DPR", "name": "Project Synopsis and Environmental Impact Self-Assessment", "mandatory": False}
        ],
        "default_workflow_steps": ["Submitted", "Revenue Verification", "Town Planner Scrutiny", "Site Measurement", "Sanction Order"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "STEAM_BOILER_REGISTRATION",
        "name": "Boiler Registration & Pressure Vessel Safety Approval",
        "issuing_authority": "Directorate of Steam Boilers, Maharashtra",
        "department": "Energy & Labour",
        "category": "Industrial Equipment Safety",
        "description": "Mandatory registration, hydraulic pressure testing, and steam piping inspection before operating any steam boiler or economizer.",
        "why_it_applies_template": "Your manufacturing/processing setup utilizes steam generation equipment requiring certified boiler inspection to prevent industrial pressure hazards.",
        "standard_sla_days": 20,
        "renewal_frequency_years": 1,
        "inspection_required": True,
        "legal_act_reference": "Indian Boilers Act 1923 & Maharashtra Boiler Rules",
        "source_title": "The Indian Boilers Act, 1923 & Maharashtra Boiler Rules, 1962",
        "source_url": "https://boiler.maharashtra.gov.in",
        "source_reference": "Central Act No. 5 of 1923",
        "source_section": "Section 7 (Registration) & Section 8 (Inspection & Certificate of Fitness)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing", "Manufacturing", "Textile"],
            "scales": ["Small", "Medium", "Large"]
        },
        "required_documents_manifest": [
            {"doc_type": "BOILER_MANUFACTURER_CERT", "name": "Boiler Maker Certificate (Form II/III) & Material Test Certificates", "mandatory": True},
            {"doc_type": "STEAM_PIPING_LAYOUT", "name": "Piping Isometric Drawings & Welder Qualification Certificates", "mandatory": True}
        ],
        "default_workflow_steps": ["Submitted", "Drawing Scrutiny", "Hydraulic Test by Boiler Inspector", "Steam Test", "Certificate of Fitness"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "LEGAL_METROLOGY_PACKAGED",
        "name": "Legal Metrology Registration (Packaged Commodities Rules)",
        "issuing_authority": "Food, Civil Supplies & Consumer Protection Dept, Maharashtra",
        "department": "Consumer Affairs",
        "category": "Packaging & Commerce",
        "description": "Registration of manufacturer/packer under Legal Metrology Act for pre-packaged goods displaying MRP, net quantity, batch, and manufacturer details.",
        "why_it_applies_template": "Your unit produces packaged consumer goods for distribution, legally requiring declaration compliance under Legal Metrology Rules.",
        "standard_sla_days": 15,
        "renewal_frequency_years": 5,
        "inspection_required": False,
        "legal_act_reference": "Legal Metrology Act 2009 & Packaged Commodities Rules 2011",
        "source_title": "Legal Metrology (Packaged Commodities) Rules, 2011",
        "source_url": "https://lm.doca.gov.in",
        "source_reference": "Notification G.S.R. 202(E) dated 07.03.2011",
        "source_section": "Rule 27 (Registration of Manufacturers, Packers and Importers)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing", "Textile", "Manufacturing"]
        },
        "required_documents_manifest": [
            {"doc_type": "SAMPLE_PACKAGING_ARTWORK", "name": "Sample Label / Packaging Artwork with Mandatory Declarations", "mandatory": True},
            {"doc_type": "PAN_CARD", "name": "Company PAN & Certificate of Incorporation", "mandatory": True}
        ],
        "default_workflow_steps": ["Submitted", "Label Compliance Check", "Fee Verification", "Registration Certificate"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "MAHA_WATER_SUPPLY_NOC",
        "name": "Industrial Water Connection / Ground Water Withdrawal NOC",
        "issuing_authority": "MIDC Water Supply / Maharashtra Ground Water Authority",
        "department": "Water Resources & Infrastructure",
        "category": "Power & Utilities",
        "description": "Sanction of bulk industrial water supply pipeline connection from MIDC or statutory NOC for borewell groundwater extraction.",
        "why_it_applies_template": "Your industrial operations require {water_requirement_kld} KLD daily water supply for processing and utility cooling at {district}.",
        "standard_sla_days": 15, # Officially notified under Maharashtra RTS Act
        "renewal_frequency_years": 0,
        "inspection_required": True,
        "legal_act_reference": "Maharashtra Ground Water (Management & Regulation) Act & MIDC Water Regulations",
        "source_title": "MIDC Water Supply Regulations & Right to Public Services Act Notified Services",
        "source_url": "https://maitri.mahaonline.gov.in",
        "source_reference": "Maharashtra RTS Act 2015 Notification No. RTS-2015/CR-268",
        "source_section": "Item No. 6: Sanction of New Industrial Water Connection (15 Days)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit"]
        },
        "required_documents_manifest": [
            {"doc_type": "WATER_BALANCE_SHEET", "name": "Detailed Water Flow & Recycled Water Usage Diagram", "mandatory": True},
            {"doc_type": "LAND_TITLE_7_12_EXTRACT", "name": "Land Possession Proof & Factory Plan", "mandatory": True}
        ],
        "default_workflow_steps": ["Submitted", "Hydraulic Feasibility Check", "Pipeline Survey", "Connection Sanction"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "code": "MAHA_SHOPS_ESTABLISHMENT_GUMASTA",
        "name": "Maharashtra Shops & Establishment Act Registration (Gumasta)",
        "issuing_authority": "Local Municipal Corporation / Directorate of Labour Maharashtra",
        "department": "Labour Administration",
        "category": "Commercial Registration",
        "description": "Primary commercial registration mandatory for all business establishments operating within municipal corporation or council limits in Maharashtra.",
        "why_it_applies_template": "Your commercial entity registered in {district} requires statutory municipal trade registration for legal establishment operations.",
        "standard_sla_days": 7,
        "renewal_frequency_years": 0, # Lifetime with annual intimation
        "inspection_required": False,
        "legal_act_reference": "Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act, 2017",
        "source_title": "Maharashtra Shops and Establishments Act, 2017 & Rules 2018",
        "source_url": "https://lms.mahaonline.gov.in",
        "source_reference": "Maharashtra Act No. LXI of 2017",
        "source_section": "Section 6 (Form A/B for 10+ workers) & Section 7 (Intimation Form F/G for <10 workers)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative procedural guidance under SIH26130. Does not constitute a statutory grant or legal approval decision.",
        "applicability_rule_tags": {
            "industries": ["Food Processing", "Manufacturing", "MSME / Small Industrial Unit", "Textile", "IT / Services"]
        },
        "required_documents_manifest": [
            {"doc_type": "PAN_CARD", "name": "PAN Card of Business and Proprietor/Partners/Directors", "mandatory": True},
            {"doc_type": "ADDRESS_PROOF_UTILITY", "name": "Registered Office Electricity Bill / Rent Agreement", "mandatory": True}
        ],
        "default_workflow_steps": ["Submitted", "Auto-Scrutiny", "Certificate Generation"],
        "demo_status": "CONFIGURED_PROTOTYPE"
    }
]


MAHARASHTRA_SCHEMES_SEED = [
    {
        "scheme_code": "MAHA_PSI_2019_2024",
        "name": "Maharashtra Package Scheme of Incentives (PSI 2019/2024)",
        "department": "Department of Industries, Govt. of Maharashtra",
        "category": "Capital Subsidy & Tax Exemption",
        "target_industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit"],
        "eligible_business_types": ["Private Limited", "LLP", "Partnership", "Proprietorship"],
        "eligible_districts": ["All", "Pune", "Nashik", "Aurangabad", "Nagpur", "Thane", "Kolhapur", "Solapur"],
        "eligible_project_stages": ["New Unit", "Expansion", "Modernization"],
        "investment_range_min": 0.5,
        "investment_range_max": 250.0,
        "benefits_summary": "Up to 50% - 80% Industrial Promotion Subsidy (IPS) on eligible gross fixed capital investment + 100% Electricity Duty Exemption for 7-10 years.",
        "financial_incentive_details": "Industrial Promotion Subsidy (Gross SGST reimbursement), Power Tariff Subsidy @ ₹1.50 to ₹2.00 per unit for 3-5 years, and 100% Stamp Duty Exemption on land acquisition.",
        "basic_eligibility": "MSMEs and Large units setting up new industrial manufacturing projects or undergoing at least 25% capacity expansion in Maharashtra.",
        "application_mode": "Online Single Window Portal (Maitri)",
        "source_title": "Government of Maharashtra Package Scheme of Incentives (PSI) 2019",
        "source_reference": "Government Resolution (GR) No. PSI-2019/CR-46/IND-8 dated 16.09.2019",
        "source_url": "https://maitri.mahaonline.gov.in",
        "source_section": "Clause 3.1 (Gross SGST IPS Refund) & Clause 3.2 (Electricity Duty Exemption)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative subsidy information under SIH26130. Final eligibility is determined by Directorate of Industries via Maitri.",
        "is_active": True,
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "scheme_code": "CMEGP_MAHA_ENTREPRENEUR",
        "name": "Chief Minister Employment Generation Programme (CMEGP)",
        "department": "Directorate of Industries & KVIB Maharashtra",
        "category": "Credit-Linked Capital Subsidy",
        "target_industries": ["Food Processing", "Manufacturing", "MSME / Small Industrial Unit", "Textile", "IT / Services"],
        "eligible_business_types": ["Private Limited", "LLP", "Partnership", "Proprietorship"],
        "eligible_districts": ["All", "Pune", "Nashik", "Aurangabad", "Nagpur", "Thane", "Kolhapur"],
        "eligible_project_stages": ["New Unit"],
        "investment_range_min": 0.05,
        "investment_range_max": 1.0,
        "benefits_summary": "15% - 25% (General) or 25% - 35% (Special Category) margin money capital subsidy on project cost up to ₹50 Lakhs (Manufacturing) / ₹20 Lakhs (Services).",
        "financial_incentive_details": "Direct bank credit subsidy: 15% Urban / 25% Rural for general category, 25% Urban / 35% Rural for SC/ST/Women/Minority/Differently-abled entrepreneurs.",
        "basic_eligibility": "New micro & small entrepreneurs aged 18 to 45 years with minimum 7th/10th standard educational qualification setting up greenfield units.",
        "application_mode": "CMEGP Maha Online Single Window",
        "source_title": "Chief Minister Employment Generation Programme (CMEGP) Guidelines",
        "source_reference": "Government Resolution No. Yojana-2019/Pra.Kra.121/Industry 7 dated 01.08.2019",
        "source_url": "https://maha-cmegp.gov.in",
        "source_section": "Clause 4 (Margin Money Subsidy Pattern & Beneficiary Contribution of 5%-10%)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Credit-linked subsidy governed by District Task Force Committee (DTFC) approval.",
        "is_active": True,
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "scheme_code": "MAHA_TEXTILE_POLICY_SUBSIDY",
        "name": "Maharashtra Integrated Textile Policy Incentive Scheme",
        "department": "Department of Textiles, Govt. of Maharashtra",
        "category": "Capital & Interest Subsidy",
        "target_industries": ["Textile"],
        "eligible_business_types": ["Private Limited", "LLP", "Partnership", "Proprietorship"],
        "eligible_districts": ["All", "Solapur", "Ichalkaranji", "Kolhapur", "Nagpur", "Amravati", "Nashik", "Pune"],
        "eligible_project_stages": ["New Unit", "Expansion", "Modernization"],
        "investment_range_min": 0.5,
        "investment_range_max": 100.0,
        "benefits_summary": "25% - 45% Capital Subsidy on machinery, 5% - 7% Interest Subvention for 5 years, and ₹2 to ₹3/unit electricity rebate.",
        "financial_incentive_details": "Special capital incentive for greenfield spinning, weaving, garmenting, technical textiles, and processing clusters in Vidarbha, Marathwada and North Maharashtra.",
        "basic_eligibility": "Units registered under Ministry of Textiles TUFS or Maharashtra State Textile Department with operational modern shuttleless looms/processing.",
        "application_mode": "Directorate of Textiles Maharashtra Portal",
        "source_title": "Maharashtra Integrated and Sustainable Textile Policy 2023–2028",
        "source_reference": "Government Resolution (GR) No. Policy 2023/C.R. 81/Tex-5 dated 02.06.2023",
        "source_url": "https://mahatextile.maharashtra.gov.in",
        "source_section": "Chapter IV: Capital Subsidies, Maha-TUFS (40%), and ETP/ZLD Support (50%)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Incentive calculations are subject to zoning verification under Maharashtra Textile Policy.",
        "is_active": True,
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "scheme_code": "MAHA_MSME_ELECTRICITY_DUTY_EXEMPTION",
        "name": "Electricity Duty Exemption for MSMEs (PSI-Linked)",
        "department": "Energy Department & Industries Directorate",
        "category": "Power Tariff Relief",
        "target_industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit", "IT / Services"],
        "eligible_business_types": ["Private Limited", "LLP", "Partnership", "Proprietorship"],
        "eligible_districts": ["All"],
        "eligible_project_stages": ["New Unit", "Expansion", "Operational"],
        "investment_range_min": 0.1,
        "investment_range_max": 50.0,
        "benefits_summary": "100% waiver on Maharashtra Electricity Duty for 7 to 10 years for eligible industrial consumer connections in eligible talukas.",
        "financial_incentive_details": "Direct waiver on monthly electricity billing from MSEDCL / Tata Power / Adani, saving ₹0.80 - ₹1.20 per kWh on industrial consumption. Administered via DIC Eligibility Certificate under PSI 2019.",
        "basic_eligibility": "Valid Udyam Registration and Eligibility Certificate issued by District Industries Centre (DIC) under Industrial Policy / PSI 2019 (Group C, D, D+ talukas).",
        "application_mode": "Maitri Single Window System",
        "source_title": "Government of Maharashtra Electricity Duty Exemption Guidelines under Industrial Policy / PSI 2019",
        "source_reference": "Industries GR No. PSI-2019/CR-46/IND-8 Clause 3.2 & Maharashtra Electricity Duty Act Section 3",
        "source_section": "PSI 2019 Part II Clause 3.2 (Electricity Duty Exemption in Group C, D, D+ areas)",
        "verification_status": "NEEDS_VERIFICATION", # Reclassified as NEEDS_VERIFICATION because exemption is contingent on DIC Eligibility Certificate under PSI zoning rather than an automatic statutory right under Electricity Duty Act
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Exemption certificate must be issued by DIC and submitted to MSEDCL billing desk. Group A and B talukas are generally ineligible except for 100% EOU / IT.",
        "is_active": True,
        "demo_status": "CONFIGURED_PROTOTYPE"
    },
    {
        "scheme_code": "MAHA_FOOD_PROCESSING_POLICY_MAIDC",
        "name": "Chief Minister Agriculture & Food Processing Scheme (MAIDC)",
        "department": "Maharashtra Agro Industries Development Corporation (MAIDC)",
        "category": "Agro & Food Processing Grant",
        "target_industries": ["Food Processing"],
        "eligible_business_types": ["Private Limited", "LLP", "Partnership", "Proprietorship"],
        "eligible_districts": ["All", "Pune", "Nashik", "Aurangabad", "Nagpur", "Thane", "Kolhapur"],
        "eligible_project_stages": ["New Unit", "Expansion"],
        "investment_range_min": 0.25,
        "investment_range_max": 50.0,
        "benefits_summary": "Up to 30% - 50% Capital Subsidy capped at ₹50 Lakhs for plant & machinery in agro/food processing and cold storage infrastructure.",
        "financial_incentive_details": "Grant-in-aid of 30% to 50% of eligible plant and machinery cost, subject to annual state budget allocation and PMFME scheme convergence guidelines.",
        "basic_eligibility": "Dedicated food processing units including fruits/vegetables, grains, dairy, spices, bakery, and beverage manufacturing established in Maharashtra.",
        "application_mode": "MAIDC Agro Processing Portal",
        "source_title": "Chief Minister Agriculture & Food Processing Scheme (Mukhyamantri Krishi Anna Prakriya Yojana)",
        "source_reference": "Agriculture & ADF Department GR FPP-2018/CR-45 & PMFME Convergence Guidelines",
        "source_url": "https://maidcmumbai.com",
        "source_section": "Capital Subsidy for Agro-Processing Units & Periodic Annual Budgetary Provisions",
        "verification_status": "NEEDS_VERIFICATION", # Classified as NEEDS_VERIFICATION due to annual budgetary caps and PMFME convergence
        "last_verified_date": "2026-09-25",
        "statutory_disclaimer": "Indicative grant details under SIH26130. Sanctions are governed by MAIDC / MoFPI norms and current financial year budgetary provisions.",
        "is_active": True,
        "demo_status": "CONFIGURED_PROTOTYPE"
    }
]

MAHARASHTRA_KNOWLEDGE_ARTICLES_SEED = [
    {
        "category": "Environmental",
        "title": "MPCB Consent to Establish (CTE) & Consent to Operate (CTO) Roadmap",
        "summary": "Step-by-step guidance on environmental categorization (Red, Orange, Green, White) under MPCB and required pollution control measures.",
        "content": "Industries in Maharashtra are categorized based on pollution index score: Red (>60), Orange (41-59), Green (21-40), and White (up to 20). Food processing, metal manufacturing, and dyeing units generally fall in Orange/Red categories, requiring prior CTE before civil foundation and CTO before production trial.",
        "applicable_industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit"],
        "source_agency": "Maharashtra Pollution Control Board (MPCB)",
        "legal_act_reference": "Water Act 1974 & Air Act 1981",
        "source_title": "MPCB Guidelines on Categorization of Industrial Sectors (Red/Orange/Green/White)",
        "source_url": "https://mpcb.gov.in",
        "source_reference": "CPCB Directions & MPCB Circular No. MPCB/RO(HQ)/B-210101",
        "source_section": "Pollution Index Score Methodology & Categorization Table",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "is_official_guideline": True
    },
    {
        "category": "Safety & Fire",
        "title": "Maharashtra Fire Safety Norms for Industrial & Warehouse Buildings",
        "summary": "Mandatory life safety compliance, setback area requirements, and static water storage tank capacities per National Building Code (NBC) 2016.",
        "content": "Under Maharashtra Fire Prevention and Life Safety Measures Act 2006, industrial buildings exceeding 500 sq.m built-up area must maintain 6-meter all-round clear access for fire tenders, overhead fire water tanks (min 50,000 litres), automated sprinkler networks, and trained fire marshals.",
        "applicable_industries": ["Food Processing", "Manufacturing", "Textile", "MSME / Small Industrial Unit", "IT / Services"],
        "source_agency": "Maharashtra Fire Services / MIDC",
        "legal_act_reference": "Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
        "source_title": "National Building Code of India (NBC 2016) Part 4: Fire & Life Safety & Maharashtra Fire Rules",
        "source_url": "https://mahafireservice.gov.in",
        "source_reference": "NBC 2016 Part 4 & Maharashtra Fire Prevention Rules, 2008",
        "source_section": "Clause 4.10 (Industrial Buildings - Group G) & Minimum Static Water Storage Requirements",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "is_official_guideline": True
    },
    {
        "category": "Food Standards",
        "title": "FSSAI Mandatory Food Safety Management System (FSMS) & Lab Testing Norms",
        "summary": "Statutory food hygiene requirements under Schedule 4 of Food Safety and Standards (Licensing & Registration) Regulations.",
        "content": "Every Food Processing Unit in Maharashtra must submit water test reports from NABL accredited labs every 6 months, conduct annual medical fitness audits of food handlers, maintain stainless steel grade contact machinery (SS 304/316), and implement HACCP-aligned traceability protocols.",
        "applicable_industries": ["Food Processing"],
        "source_agency": "FDA Maharashtra & FSSAI",
        "legal_act_reference": "Food Safety and Standards Act, 2006 (Schedule IV)",
        "source_title": "FSSAI Guidance Document on Food Safety Management System (FSMS) Implementation",
        "source_url": "https://fssai.gov.in",
        "source_reference": "Food Safety and Standards Act, 2006",
        "source_section": "Schedule IV (Good Manufacturing Practices / Good Hygienic Practices)",
        "verification_status": "VERIFIED",
        "last_verified_date": "2026-09-25",
        "is_official_guideline": True
    }
]
