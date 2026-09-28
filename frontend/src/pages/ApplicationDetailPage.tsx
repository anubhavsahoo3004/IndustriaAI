import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Upload,
  FileText,
  AlertTriangle,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { ApplicationService } from '../services/application.service';
import { DocumentService } from '../services/document.service';
import { ApplicationItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { Timeline } from '../components/common/Timeline';
import { Modal } from '../components/common/Modal';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Validation details modal state
  const [validationModalDoc, setValidationModalDoc] = useState<any | null>(null);
  const [validatingDocId, setValidatingDocId] = useState<number | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ApplicationService.getById(parseInt(id));
      setApplication(data);
    } catch (err) {
      console.error('Failed to load application:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadDocType || !application) return;

    setUploading(true);
    try {
      await DocumentService.upload(
        application.business_id,
        uploadDocType,
        selectedFile,
        application.id
      );
      setShowUploadModal(false);
      setSelectedFile(null);
      await fetchDetail();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRunValidation = async (docId: number) => {
    setValidatingDocId(docId);
    try {
      const res = await DocumentService.validate(docId);
      setValidationModalDoc(res);
      await fetchDetail();
    } catch (err) {
      console.error('Validation failed:', err);
    } finally {
      setValidatingDocId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Application Dossier...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-slate-600">Application not found.</p>
        <Link to="/applications" className="text-xs text-blue-600 font-bold hover:underline">
          &larr; Back to Applications
        </Link>
      </div>
    );
  }

  const attachedDocs = application.application_documents || [];
  const manifest = application.required_manifest || application.approval_type?.required_documents_manifest || [];

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications List
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                  {application.application_number}
                </span>
                <StatusBadge status={application.status} />
                <RiskBadge level={application.delay_risk_level} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
                {application.approval_type?.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Department: <strong className="text-slate-700 dark:text-slate-300">{application.approval_type?.issuing_authority}</strong> • {application.business_name} ({application.business_district}, MH)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/ai-assistant"
                className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI About this Clearance
              </Link>
            </div>
          </div>

          {/* Quick Info & Last Updated Audit */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Authority</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{application.approval_type?.issuing_authority}</span>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Officer / Desk</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{application.assigned_officer || 'Department Scrutiny Cell'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Workflow Update</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {application.updated_at
                  ? new Date(application.updated_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recently Updated'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Distinct Dimensional Cards: STATUS, WORKFLOW STAGE, SLA, DELAY RISK, NEXT ACTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. STATUS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">1. Regulatory Status</span>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {application.status === 'DOCUMENTS_REQUIRED' && 'Mandatory statutory clearances documents are missing and required from applicant.'}
              {application.status === 'UNDER_REVIEW' && 'Department scrutiny officers are evaluating technical specifications and site plans.'}
              {application.status === 'INSPECTION_PENDING' && 'Official field inspection has been assigned and scheduled.'}
              {application.status === 'APPROVED' && 'Statutory clearance has been formally sanctioned and issued.'}
              {application.status === 'REJECTED' && 'Clearance request was declined by the regulatory authority.'}
              {!['DOCUMENTS_REQUIRED', 'UNDER_REVIEW', 'INSPECTION_PENDING', 'APPROVED', 'REJECTED'].includes(application.status) && 'Clearance is progressing through statutory scrutiny stages.'}
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
            Ref: {application.application_number}
          </div>
        </div>

        {/* 2. CURRENT WORKFLOW STAGE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">2. Current Workflow Stage</span>
            <div className="mt-2">
              <strong className="text-slate-900 dark:text-white font-bold text-sm block">
                {application.current_stage.replace(/_/g, ' ')}
              </strong>
              <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                Stage {application.workflow_steps?.findIndex((s) => s.status === 'IN_PROGRESS') !== -1 ? (application.workflow_steps?.findIndex((s) => s.status === 'IN_PROGRESS') ?? 0) + 1 : 1} of {application.workflow_steps?.length || 5}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Active sequential phase under the {application.approval_type?.issuing_authority} processing charter.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Desk:</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{application.assigned_officer?.split('(')[0] || 'Technical Officer'}</span>
          </div>
        </div>

        {/* 3. SLA & PROCESSING WINDOW */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">3. Statutory SLA & Benchmarks</span>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Statutory SLA Window:</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {application.approval_type?.standard_sla_days || 30} Days (RTSA)
                </span>
              </div>
              {application.approval_type?.code === 'MPCB_CTE' && (
                <div className="p-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                  <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">Dept Review Benchmark:</span>
                  <span className="font-mono text-[11px] font-bold text-indigo-800 dark:text-indigo-200">15 Days</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Target Date:</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {application.sla_deadline ? new Date(application.sla_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Total statutory SLA per Maharashtra Right to Services Act.
          </p>
        </div>

        {/* 4. DELAY RISK */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">4. SLA Delay Risk</span>
              <RiskBadge level={application.delay_risk_level} />
            </div>
            <div className="mt-2 space-y-1">
              {application.delay_risk_reasons && application.delay_risk_reasons.length > 0 ? (
                <ul className="text-xs text-rose-700 dark:text-rose-300 space-y-1 pl-3 list-disc">
                  {application.delay_risk_reasons.slice(0, 2).map((r, i) => (
                    <li key={i} className="leading-tight">{r}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  On Track • Review proceeding within benchmark limits.
                </p>
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Risk Status:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{application.delay_risk_level} Priority</span>
          </div>
        </div>
      </div>

      {/* 5. NEXT ACTION (Explicit, Actionable Callout) */}
      <div className={`rounded-2xl p-5 border shadow-xs transition-all ${
        application.status === 'DOCUMENTS_REQUIRED'
          ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
          : application.delay_risk_level === 'HIGH'
          ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
          : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                5. Immediate Next Action
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {application.status === 'DOCUMENTS_REQUIRED'
                  ? 'Applicant Submission Required'
                  : application.status === 'INSPECTION_PENDING'
                  ? 'Field Readiness Required'
                  : 'Department Processing Stage'}
              </span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
              {application.next_action_prompt || 'Ensure all compliance records are up to date and monitor department notifications.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {application.status === 'DOCUMENTS_REQUIRED' && (
              <button
                onClick={() => {
                  setUploadDocType(manifest[0]?.doc_type || 'GENERAL_DOC');
                  setShowUploadModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Missing Document
              </button>
            )}

            {application.status === 'INSPECTION_PENDING' && (
              <Link
                to="/inspections"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <CalendarCheck className="w-3.5 h-3.5" /> View Inspection Schedule
              </Link>
            )}

            <Link
              to="/ai-assistant"
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Ask AI Guidance
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Section: Timeline (Left) & Document Checklist (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Visual Workflow Timeline (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Statutory Workflow Timeline
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
              Stage {application.workflow_steps?.findIndex((s) => s.status === 'IN_PROGRESS') !== -1 ? (application.workflow_steps?.findIndex((s) => s.status === 'IN_PROGRESS') ?? 0) + 1 : 1} of {application.workflow_steps?.length || 5}
            </span>
          </div>

          <Timeline steps={application.workflow_steps || []} currentStage={application.current_stage} />
        </div>

        {/* Right: Required Documents Manifest & Attached Files (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Document Completeness Checklist
                </h2>
                <p className="text-[11px] text-slate-400">
                  {attachedDocs.length} uploaded • {application.missing_mandatory_documents?.length || 0} mandatory missing
                </p>
              </div>

              <button
                onClick={() => {
                  setUploadDocType(manifest[0]?.doc_type || 'GENERAL_DOC');
                  setShowUploadModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Document
              </button>
            </div>

            {/* Missing documents warning if any */}
            {application.missing_mandatory_documents && application.missing_mandatory_documents.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Missing Mandatory Document(s):
                </span>
                <ul className="list-disc pl-5 text-amber-700 dark:text-amber-300 space-y-0.5">
                  {application.missing_mandatory_documents.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attached Documents List */}
            <div className="space-y-3">
              {attachedDocs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No documents attached to this application yet.
                </div>
              ) : (
                attachedDocs.map((item) => {
                  const doc = item.document;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                              {doc?.original_filename || doc?.filename || 'Uploaded Document'}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Type: {doc?.document_type} • {item.is_mandatory ? 'Mandatory' : 'Optional'}
                            </span>
                          </div>
                        </div>

                        <StatusBadge status={doc?.status || 'UPLOADED'} />
                      </div>

                      {/* AI Validation Summary if available */}
                      {doc?.validation_result && (
                        <div className="text-[11px] p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                              Completeness & Consistency Check:
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Confidence: {Math.round((doc.validation_result.confidence_score || 0.95) * 100)}%
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            {doc.validation_result.summary}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleRunValidation(item.document_id)}
                          disabled={validatingDocId === item.document_id}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                          {validatingDocId === item.document_id ? 'Checking...' : 'Run Completeness Check'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Statutory Clearance Document"
        subtitle={`Application ${application.application_number}`}
      >
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Document Type *
            </label>
            <select
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              {manifest.map((m) => (
                <option key={m.doc_type} value={m.doc_type}>
                  {m.name} {m.mandatory ? '(*Mandatory)' : ''}
                </option>
              ))}
              <option value="ADDITIONAL_ANNEXURE">Additional Technical Annexure</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Choose File (PDF, DOCX, TXT, PNG/JPG) *
            </label>
            <input
              type="file"
              required
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
            <strong>Note:</strong> Uploaded documents will immediately undergo an automated consistency check comparing entity names, addresses, and statutory requirements.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {uploading ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Validation Result Modal */}
      {validationModalDoc && (
        <Modal
          isOpen={true}
          onClose={() => setValidationModalDoc(null)}
          title="Document Completeness & Consistency Report"
          subtitle="Automated Statutory Verification Check"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <StatusBadge status={validationModalDoc.status} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence</span>
                <strong className="text-emerald-600 font-bold">{Math.round(validationModalDoc.confidence_score * 100)}%</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Verification Criteria:</h4>
              <div className="space-y-1.5">
                {validationModalDoc.checks?.map((c: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{c.item}</span>
                      <p className="text-[11px] text-slate-500">{c.details}</p>
                    </div>
                    <StatusBadge status={c.result} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-900 dark:text-blue-200 space-y-1">
              <strong className="block">Summary:</strong>
              <p className="text-[11px] leading-relaxed">{validationModalDoc.summary}</p>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-900 dark:text-emerald-200 space-y-1">
              <strong className="block">Recommended Action:</strong>
              <p className="text-[11px] leading-relaxed">{validationModalDoc.recommended_action}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setValidationModalDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
