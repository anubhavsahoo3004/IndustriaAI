import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Search,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DocumentService } from '../services/document.service';
import { DocumentItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const DocumentsPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docType, setDocType] = useState('PROJECT_REPORT_DPR');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Revalidating state
  const [validatingId, setValidatingId] = useState<number | null>(null);

  const fetchDocuments = async () => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await DocumentService.listByBusiness(activeBusiness.id);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeBusiness]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !activeBusiness) return;

    setUploading(true);
    try {
      await DocumentService.upload(activeBusiness.id, docType, file);
      setShowUploadModal(false);
      setFile(null);
      await fetchDocuments();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRevalidate = async (docId: number) => {
    setValidatingId(docId);
    try {
      const res = await DocumentService.validate(docId);
      await fetchDocuments();
      const updatedDoc = documents.find((d) => d.id === docId);
      if (updatedDoc) {
        setSelectedDoc({ ...updatedDoc, validation_result: res, status: res.status });
      }
    } catch (err) {
      console.error('Revalidation failed:', err);
    } finally {
      setValidatingId(null);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    return (
      doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.ai_summary || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const mismatchCount = documents.filter((d) => d.status === 'ACTION_REQUIRED').length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Document Management & Statutory Checks
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded">
              {documents.length} Uploaded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administrative verification tool for entity consistency, PAN, GSTIN, and statutory completeness.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" /> Upload Document
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-md p-3">
          <span className="text-[10px] text-slate-500 uppercase font-medium block">Total Documents</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 block">{documents.length}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-3">
          <span className="text-[10px] text-slate-500 uppercase font-medium block">Verified & Consistent</span>
          <span className="text-lg font-bold text-emerald-700 mt-0.5 block">{verifiedCount}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-3">
          <span className="text-[10px] text-slate-500 uppercase font-medium block">Mismatch Detected</span>
          <span className="text-lg font-bold text-amber-700 mt-0.5 block">{mismatchCount}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-3">
          <span className="text-[10px] text-slate-500 uppercase font-medium block">Associated Business</span>
          <span className="text-xs font-semibold text-slate-800 mt-1 block truncate" title={activeBusiness?.name}>
            {activeBusiness?.name || 'Maharashtra Fresh Foods'}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-md p-2.5 shadow-xs flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="Filter by document type, filename, or verification notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Administrative Verification Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading document repository...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-xs font-semibold text-slate-700">No documents found.</h3>
          <p className="text-[11px] text-slate-500">Upload mandatory statutory documents for automated administrative verification.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Verification Summary</th>
                  <th className="py-2.5 px-3">Mismatch Check</th>
                  <th className="py-2.5 px-3">Uploaded Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const isVerified = doc.status === 'VERIFIED';
                  const isMismatch = doc.status === 'ACTION_REQUIRED';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {doc.document_type.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 block">
                              {doc.original_filename} ({Math.round(doc.file_size_bytes / 1024)} KB)
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={doc.status} />
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-slate-600 line-clamp-2 text-[11px]">
                          {doc.ai_summary || 'Standard validation checks completed.'}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Verified Consistent
                          </span>
                        ) : isMismatch ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Mismatch Detected
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Pending Verification
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {new Date(doc.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          Report
                        </button>
                        <button
                          onClick={() => handleRevalidate(doc.id)}
                          disabled={validatingId === doc.id}
                          className="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium cursor-pointer"
                        >
                          {validatingId === doc.id ? 'Checking...' : 'Re-verify'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Details Modal */}
      {selectedDoc && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDoc(null)}
          title="Administrative Document Verification Report"
          subtitle={`Dossier Check: ${selectedDoc.document_type.replace(/_/g, ' ')} (${selectedDoc.original_filename})`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800">Compliance Status</span>
              <StatusBadge status={selectedDoc.status} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Verification Summary:</span>
              <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 leading-relaxed">
                {selectedDoc.ai_summary || 'All statutory checks passed against registered business profile.'}
              </p>
            </div>

            {selectedDoc.validation_result?.checks && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Specific Verification Checks:</span>
                <div className="border border-slate-200 rounded divide-y divide-slate-100">
                  {selectedDoc.validation_result.checks.map((c: any, i: number) => (
                    <div key={i} className="p-2.5 flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-900 block">{c.check_name}</span>
                        <span className="text-[11px] text-slate-500 block">{c.details}</span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                          c.status === 'MATCH' || c.status === 'PASSED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Statutory Document"
        subtitle="Select document category and attachment file for administrative check"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
            >
              <option value="PROJECT_REPORT_DPR">Detailed Project Report (DPR)</option>
              <option value="LAND_TITLE_DEED">Land Title / MIDC Lease Agreement</option>
              <option value="SITE_PLAN">Factory Site & Machinery Layout Blueprint</option>
              <option value="PAN_CARD">Permanent Account Number (PAN) Card</option>
              <option value="GST_CERTIFICATE">GST Registration Certificate</option>
              <option value="UDYAM_MSME">Udyam / MSME Registration</option>
              <option value="FSMS_PLAN">Food Safety Management System (FSMS) Plan</option>
              <option value="WATER_ANALYSIS_REPORT">NABL Potable Water Chemical Analysis Report</option>
              <option value="OTHER_SUPPORTING">Other Supporting Regulatory Document</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Document File (.pdf, .txt, .docx, .png, .jpg)
            </label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {uploading ? 'Analyzing Document...' : 'Upload & Verify'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
