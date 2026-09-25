export type UserRole = 'applicant' | 'admin' | 'officer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Business {
  id: number;
  user_id: number;
  name: string;
  industry: string;
  state: string;
  district: string;
  project_type: string;
  project_stage: string;
  scale: string;
  investment_range?: string;
  investment_amount_inr?: number;
  employee_count: number;
  business_type: string;
  gstin?: string;
  pan?: string;
  udyam_number?: string;
  address?: string;
  plot_details?: string;
  electricity_load_kw?: number;
  water_requirement_kld?: number;
  effluent_discharge?: string;
  created_at: string;
  updated_at: string;
  total_applications?: number;
  completed_applications?: number;
  under_review_applications?: number;
  action_required_applications?: number;
  upcoming_inspections?: number;
  pending_compliance_tasks?: number;
}

export interface ApprovalType {
  id: number;
  code: string;
  name: string;
  issuing_authority: string;
  department: string;
  category: string;
  description: string;
  why_it_applies_template?: string;
  standard_sla_days: number;
  renewal_frequency_years: number;
  inspection_required: boolean;
  legal_act_reference?: string;
  applicability_rule_tags: Record<string, any>;
  required_documents_manifest: Array<{
    doc_type: string;
    name: string;
    mandatory: boolean;
  }>;
  default_workflow_steps: string[];
  demo_status: string;
  verification_status?: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'DEMO_ONLY';
  source_url?: string;
  last_verified_date?: string;
  statutory_disclaimer?: string;
}

export interface ApprovalPlanItem {
  approval_type_id: number;
  code: string;
  name: string;
  category: string;
  issuing_authority: string;
  department: string;
  is_applicable: boolean;
  why_it_applies: string;
  standard_sla_days: number;
  inspection_required: boolean;
  renewal_frequency_years: number;
  legal_act_reference?: string;
  verification_status?: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'DEMO_ONLY';
  source_url?: string;
  last_verified_date?: string;
  statutory_disclaimer?: string;
  required_documents: Array<{
    doc_type: string;
    name: string;
    mandatory: boolean;
  }>;
  existing_application_id?: number | null;
  status: string;
  next_action: string;
}

export interface ApprovalPlanResponse {
  business_id: number;
  business_name: string;
  industry: string;
  location: string;
  scale: string;
  total_recommended_approvals: number;
  critical_environmental_approvals: number;
  operational_licensing_approvals: number;
  items: ApprovalPlanItem[];
  ai_strategic_summary?: string;
}

export interface WorkflowStep {
  id: number;
  application_id: number;
  step_name: string;
  step_key: string;
  step_order: number;
  status: string; // PENDING, IN_PROGRESS, COMPLETED, ACTION_REQUIRED
  started_at?: string;
  completed_at?: string;
  officer_notes?: string;
  updated_by?: string;
}

export interface DocumentCheckItem {
  item: string;
  result: 'MATCH' | 'POTENTIAL_MISMATCH' | 'WARNING' | 'MISSING' | 'VERIFIED';
  details?: string;
}

export interface DocumentValidationResult {
  status: 'VERIFIED' | 'ACTION_REQUIRED' | 'POTENTIAL_MISMATCH' | 'REJECTED';
  document_type_detected: string;
  confidence_score: number;
  checks: DocumentCheckItem[];
  summary: string;
  recommended_action: string;
  inconsistency_notes?: string;
  extracted_data?: Record<string, any>;
  cited_regulatory_note?: string;
}

export interface DocumentItem {
  id: number;
  business_id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size_bytes: number;
  file_hash?: string;
  document_type: string;
  status: string; // UPLOADED, VERIFIED, ACTION_REQUIRED, REJECTED
  validation_result?: DocumentValidationResult;
  extracted_metadata?: Record<string, any>;
  ai_summary?: string;
  inconsistency_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocumentItem {
  id: number;
  application_id: number;
  document_id: number;
  is_mandatory: boolean;
  status: string;
  remarks?: string;
  document?: DocumentItem;
}

export interface ApplicationItem {
  id: number;
  business_id: number;
  approval_type_id: number;
  application_number: string;
  status: string; // NOT_STARTED, DOCUMENTS_REQUIRED, SUBMITTED, UNDER_REVIEW, INSPECTION_PENDING, APPROVED, REJECTED, ACTION_REQUIRED, COMPLETED
  current_stage: string;
  applicability_reason?: string;
  submission_date?: string;
  sla_deadline?: string;
  delay_risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  delay_risk_reasons: string[];
  next_action_prompt?: string;
  assigned_officer?: string;
  officer_remarks?: string;
  created_at: string;
  updated_at: string;
  approval_type?: ApprovalType;
  business_name?: string;
  business_industry?: string;
  business_district?: string;
  workflow_steps?: WorkflowStep[];
  application_documents?: ApplicationDocumentItem[];
  required_manifest?: Array<{ doc_type: string; name: string; mandatory: boolean }>;
  missing_mandatory_documents?: string[];
}

export interface InspectionItem {
  id: number;
  application_id: number;
  business_id: number;
  inspection_type: string;
  scheduled_date: string;
  officer_name: string;
  officer_designation: string;
  officer_contact?: string;
  location: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  applicant_action_required?: string;
  findings_summary?: string;
  compliance_score?: number;
  checklist_results?: Array<{ check: string; status: string }>;
  created_at: string;
  updated_at: string;
  application_number?: string;
  approval_name?: string;
  business_name?: string;
}

export interface ComplianceTaskItem {
  id: number;
  business_id: number;
  title: string;
  category: string;
  issuing_authority: string;
  frequency: string;
  due_date: string;
  status: 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';
  penalty_risk_desc?: string;
  action_instructions?: string;
  legal_act_reference?: string;
  verification_status?: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'DEMO_ONLY';
  source_url?: string;
  last_verified_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportSchemeItem {
  id: number;
  scheme_code: string;
  name: string;
  department: string;
  category: string;
  target_industries: string[];
  eligible_business_types: string[];
  eligible_districts: string[];
  eligible_project_stages: string[];
  investment_range_min: number;
  investment_range_max: number;
  benefits_summary: string;
  financial_incentive_details: string;
  basic_eligibility: string;
  application_mode: string;
  source_reference: string;
  source_url?: string;
  is_active: boolean;
  demo_status: string;
  verification_status?: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'DEMO_ONLY';
  last_verified_date?: string;
  statutory_disclaimer?: string;
  created_at: string;
}

export interface SchemeMatchItem {
  scheme: SupportSchemeItem;
  is_matched: boolean;
  match_score: number;
  match_reasons: string[];
  next_step: string;
  estimated_benefit?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  business_id?: number;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS' | 'SLA_BREACH' | 'INSPECTION';
  is_read: boolean;
  action_link?: string;
  created_at: string;
}

export interface BottleneckItem {
  stage_name: string;
  stage_key: string;
  count: number;
  percentage: number;
  avg_days_in_stage: number;
  threshold_days: number;
  is_critical: boolean;
  explanation: string;
}

export interface SlaRiskItem {
  application_id: number;
  application_number: string;
  approval_name: string;
  business_name: string;
  industry: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  current_stage: string;
  days_in_current_stage: number;
  configured_sla_days: number;
  reasons: string[];
  suggested_mitigation: string;
}

export interface AnalyticsOverview {
  total_applications: number;
  pending_applications: number;
  under_review_applications: number;
  action_required_applications: number;
  near_sla_applications: number;
  delayed_applications: number;
  completed_applications: number;
  total_businesses: number;
  total_inspections: number;
  status_breakdown: Array<{ status: string; count: number; percentage: number; color: string }>;
  industry_breakdown: Array<{ industry: string; count: number; percentage: number }>;
  stage_breakdown: Array<{ stage: string; count: number }>;
  bottlenecks: BottleneckItem[];
  sla_risks: SlaRiskItem[];
}

export interface AiCitation {
  record_type: string;
  title: string;
  reference_id?: string;
  note: string;
}

export interface AiAssistantResponse {
  query: string;
  response_text: string;
  citations: AiCitation[];
  suggested_actions: string[];
  relevant_links: Array<{ title: string; url: string }>;
}

export interface AuditLogItem {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  description: string;
  ip_address: string;
  created_at: string;
}
