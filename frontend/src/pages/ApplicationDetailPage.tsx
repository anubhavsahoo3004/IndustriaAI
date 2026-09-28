import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ApplicationService } from '../services/application.service';
import { DocumentService } from '../services/document.service';
import { ApplicationItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { Timeline } from '../components/common/Timeline';
import { Modal } from '../components/common/Modal';
import { getActionWorkflowInfo } from '../utils/actionWorkflow';

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
      <div className="flex items-center justify-center min-h-[360px]">
        <div className="text-center space-y-2.5">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Application Record...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-xs text-slate-600">Application record not found.</p>
        <Link to="/applications" className="text-xs text-slate-900 font-semibold hover:underline">
          &larr; Back to Applications
        </Link>
      </div>
    );
  }

  const attachedDocs = application.application_documents || [];
  const manifest = application.required_manifest || application.approval_type?.required_documents_manifest || [];
  const actionInfo = getActionWorkflowInfo(application);

  return (
    <div className="space-y-5">
      {/* Top Back Navigation & Official Case Header */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications List
        </button>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  {application.application_number}
                </span>
                <StatusBadge status={application.status} />
                <RiskBadge level={application.delay_risk_level} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {application.approval_type?.name}
              </h1>
              <p className="text-xs text-slate-600">
                Issuing Department: <span className="font-medium text-slate-900">{application.approval_type?.issuing_authority}</span> • {application.business_name} ({application.business_district}, Maharashtra)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/ai-assistant"
                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                Inquire with Assistant
              </Link>
            </div>
          </div>

          {/* CURRENT ACTION - Prominent Simple Bordered Enterprise Panel */}
          <div className="border border-slate-200 rounded-md p-4 bg-slate-50/70">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600 mb-3 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>CURRENT ACTION</span>
              <span className="text-[11px] font-mono font-medium text-slate-600 normal-case">{actionInfo.stageLabel} Stage</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 block">
                  ACTION OWNER
                </span>
                <span className="text-sm font-semibold text-slate-900 block mt-1">
                  {actionInfo.owner}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 block">
                  NEXT ACTION
                </span>
                <span className="text-sm font-medium text-slate-800 block mt-1">
                  {actionInfo.nextAction}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 block">
                  DUE / SLA
                </span>
                <span className="text-sm font-medium text-slate-800 block mt-1">
                  {actionInfo.dueDateOrSla}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Sections Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Information, Workflow, Required Documents */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section 1: Application Information */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Application Information
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Application Reference</span>
                <span className="font-mono font-semibold text-slate-900">{application.application_number}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Authority</span>
                <span className="font-medium text-slate-900">{application.approval_type?.issuing_authority}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Category / Type</span>
                <span className="font-medium text-slate-900">{application.approval_type?.category || 'Industrial Clearance'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Unit Name</span>
                <span className="font-medium text-slate-900">{application.business_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Assigned Scrutiny Desk</span>
                <span className="font-medium text-slate-900">{application.assigned_officer || 'Technical Review Cell'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Last Update</span>
                <span className="font-mono text-slate-700 text-[11px]">
                  {application.updated_at
                    ? new Date(application.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Current Status & Sequential Workflow Stages */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Current Status & Workflow Stage
              </h2>
              <span className="text-xs font-medium text-slate-700">
                Active Stage: <strong className="text-slate-900">{application.current_stage.replace(/_/g, ' ')}</strong>
              </span>
            </div>

            <div className="pt-1">
              <Timeline
                steps={application.workflow_steps || []}
                currentStage={application.current_stage}
              />
            </div>
          </div>

          {/* Section 3: Required Statutory Documents & Verification */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Required Documents & Verification Status
                </h2>
                <p className="text-[11px] text-slate-500">
                  Statutory dossier requirements for {application.approval_type?.name}
                </p>
              </div>

              <button
                onClick={() => {
                  const firstDocType = manifest[0] ? (typeof manifest[0] === 'string' ? manifest[0] : manifest[0].doc_type) : 'PROJECT_REPORT_DPR';
                  setUploadDocType(firstDocType);
                  setShowUploadModal(true);
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Upload className="w-3 h-3" /> Upload Document
              </button>
            </div>

            {/* Checklist of Required Documents */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden text-xs">
              {manifest.length === 0 ? (
                <div className="p-3 text-slate-500 text-center">No statutory checklist defined.</div>
              ) : (
                manifest.map((reqItem: any, idx) => {
                  const reqDocType = typeof reqItem === 'string' ? reqItem : reqItem.doc_type;
                  const reqDocName = typeof reqItem === 'string' ? reqItem.replace(/_/g, ' ') : (reqItem.name || (reqItem.doc_type ? reqItem.doc_type.replace(/_/g, ' ') : 'Required Document'));
                  const matchingDoc = attachedDocs.find((d) => d.document?.document_type === reqDocType || (d as any).document_type === reqDocType);
                  const docItem = matchingDoc?.document || (matchingDoc as any);
                  const isVerified = matchingDoc && (matchingDoc.status === 'VERIFIED' || docItem?.status === 'VERIFIED');
                  const isMismatch = matchingDoc && (matchingDoc.status === 'ACTION_REQUIRED' || docItem?.status === 'ACTION_REQUIRED');

                  return (
                    <div key={idx} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {isVerified ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : isMismatch ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0 inline-block" />
                          )}
                          <span className="font-semibold text-slate-900">
                            {reqDocName}
                          </span>
                        </div>
                        {docItem?.original_filename ? (
                          <p className="text-[11px] text-slate-500 pl-6">
                            Uploaded: <span className="font-mono text-slate-700">{docItem.original_filename}</span> ({Math.round((docItem.file_size_bytes || 0) / 1024)} KB)
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-800 pl-6">
                            Missing statutory document — upload required for clearance scrutiny.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pl-6 sm:pl-0">
                        {matchingDoc ? (
                          <>
                            <StatusBadge status={matchingDoc.status || docItem?.status || 'UPLOADED'} />
                            <button
                              onClick={() => handleRunValidation(matchingDoc.document_id || matchingDoc.id)}
                              disabled={validatingDocId === (matchingDoc.document_id || matchingDoc.id)}
                              className="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                            >
                              {validatingDocId === (matchingDoc.document_id || matchingDoc.id) ? 'Verifying...' : 'Verify'}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setUploadDocType(reqDocType);
                              setShowUploadModal(true);
                            }}
                            className="px-2.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
                          >
                            Upload Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Inspection, SLA & Timeline, Risk Diagnostics, Next Action */}
        <div className="lg:col-span-4 space-y-5">
          {/* Section 4: Scheduled Field Inspection */}
          {application.inspections && application.inspections.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <CalendarCheck className="w-4 h-4 text-slate-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  4. Field Inspection
                </h2>
              </div>

              {application.inspections.map((insp) => (
                <div key={insp.id} className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-md border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{insp.inspection_type}</span>
                    <StatusBadge status={insp.status} />
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Officer: <span className="font-medium text-slate-800">{insp.officer_name}</span> ({insp.officer_designation || 'Inspection Officer'})
                  </p>
                  <p className="text-slate-600 text-[11px] font-mono">
                    Scheduled: {new Date(insp.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(insp.scheduled_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {insp.applicant_action_required && (
                    <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-700">
                      <strong>Preparation:</strong> {insp.applicant_action_required}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section 5: SLA Timeline & Benchmarks */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                5. SLA & Statutory Timeline
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Statutory SLA Window:</span>
                <span className="font-mono font-bold text-slate-900">
                  {application.approval_type?.standard_sla_days || 30} Days (RTSA)
                </span>
              </div>

              {application.approval_type?.code === 'MPCB_CTE' && (
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Department Review Benchmark:</span>
                  <span className="font-mono font-bold text-slate-900">15 Days</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Days Active in Pipeline:</span>
                <span className="font-mono font-bold text-slate-900">
                  {application.submission_date || application.created_at
                    ? `${Math.max(1, Math.floor((Date.now() - new Date(application.submission_date || application.created_at).getTime()) / (1000 * 60 * 60 * 24)))} Days`
                    : 'In Progress'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target SLA Date:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {application.sla_deadline
                    ? new Date(application.sla_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 6: Risk Factors & Required Next Action */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                6. Risk Diagnostics & Next Action
              </h2>
              <RiskBadge level={application.delay_risk_level} />
            </div>

            <div className="space-y-2 text-xs">
              {application.delay_risk_reasons && application.delay_risk_reasons.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Risk Diagnostic Triggers:</span>
                  <ul className="space-y-1 text-[11px] text-slate-700">
                    {application.delay_risk_reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Required Next Action:</span>
                <p className="mt-1 text-xs text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 font-medium">
                  {application.next_action_prompt || 'Application progressing under routine departmental scrutiny.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Statutory Clearance Document"
        subtitle={`Application Ref: ${application.application_number} • ${application.approval_type?.name}`}
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Statutory Document Category
            </label>
            <select
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
            >
              {manifest.map((m: any, idx) => {
                const docVal = typeof m === 'string' ? m : m.doc_type;
                const docLabel = typeof m === 'string' ? m.replace(/_/g, ' ') : (m.name || (m.doc_type ? m.doc_type.replace(/_/g, ' ') : 'Document'));
                return (
                  <option key={idx} value={docVal}>
                    {docLabel}
                  </option>
                );
              })}
              <option value="OTHER_SUPPORTING">Other Supporting Attachment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Document File (.pdf, .txt, .docx, .png, .jpg)
            </label>
            <input
              type="file"
              required
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading & Analyzing...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Validation Result Modal */}
      {validationModalDoc && (
        <Modal
          isOpen={true}
          onClose={() => setValidationModalDoc(null)}
          title="Document Verification Report"
          subtitle={`Verification Summary for ${validationModalDoc.document_type?.replace(/_/g, ' ')}`}
        >
          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-900">Validation Status</span>
              <StatusBadge status={validationModalDoc.validation_status} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Analysis Summary:</span>
              <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 leading-relaxed">
                {validationModalDoc.ai_summary || 'Document checks completed successfully.'}
              </p>
            </div>

            {validationModalDoc.extracted_metadata && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Verification Checks:</span>
                <div className="border border-slate-200 rounded divide-y divide-slate-100">
                  {Object.entries(validationModalDoc.extracted_metadata).map(([k, v]: [string, any]) => (
                    <div key={k} className="p-2 flex items-center justify-between">
                      <span className="text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-slate-900 font-medium">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setValidationModalDoc(null)}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium"
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
