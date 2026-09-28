import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  ChevronRight,
  Edit
} from 'lucide-react';
import { ApplicationService } from '../../services/application.service';
import { ApplicationItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Modal } from '../../components/common/Modal';
import { ActionOwnerBadge } from '../../components/common/ActionOwnerBadge';
import { getActionWorkflowInfo } from '../../utils/actionWorkflow';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  // Edit / Status Modal state
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newStage, setNewStage] = useState('');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [advanceStage, setAdvanceStage] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [stateMatrix, setStateMatrix] = useState<{
    statuses: string[];
    stages: string[];
    valid_status_stage_map: Record<string, string[]>;
    default_stage_for_status: Record<string, string>;
    stage_labels: Record<string, string>;
  } | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const [data, matrix] = await Promise.all([
        ApplicationService.list(),
        ApplicationService.getStateMatrix().catch(() => null),
      ]);
      setApplications(data);
      if (matrix) setStateMatrix(matrix);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenModal = (app: ApplicationItem) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setNewStage(app.current_stage);
    setOfficerRemarks('');
    setAssignedOfficer(app.assigned_officer || 'Sanjay Patil (Senior Field Officer)');
    setAdvanceStage(false);
    setUpdateSuccess(null);
  };

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    if (stateMatrix?.default_stage_for_status && stateMatrix.default_stage_for_status[status]) {
      setNewStage(stateMatrix.default_stage_for_status[status]);
    }
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    setUpdateSuccess(null);
    try {
      await ApplicationService.updateStatus(selectedApp.id, {
        status: newStatus,
        current_stage: newStage,
        advance_stage: advanceStage,
        officer_remarks: officerRemarks || 'Administrative review action recorded by scrutiny desk.',
        assigned_officer: assignedOfficer,
      });

      setUpdateSuccess('Application status and workflow stage successfully updated.');
      await fetchApplications();
      setTimeout(() => {
        setSelectedApp(null);
      }, 1000);
    } catch (err: any) {
      console.error('Update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.business_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.approval_type?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.approval_type?.issuing_authority || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const info = getActionWorkflowInfo(app);
    const matchesOwner = ownerFilter === 'ALL' || info.owner === ownerFilter;
    return matchesSearch && matchesStatus && matchesOwner;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Department Scrutiny & Review Queue
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded font-mono">
              {applications.length} Applications Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate dossiers, monitor action owners, statutory SLA timelines, and advance workflow steps.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference, enterprise name, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Action Owner:</span>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Action Owners</option>
              <option value="Applicant">Applicant Pending</option>
              <option value="Department Officer">Department Pending</option>
              <option value="Inspection Officer">Inspection Pending</option>
              <option value="System">System / Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              <option value="DOCUMENTS_REQUIRED">Documents Required</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INSPECTION_PENDING">Inspection Pending</option>
              <option value="APPROVED">Approved / Completed</option>
              <option value="ACTION_REQUIRED">Action Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scrutiny Queue Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading scrutiny queue...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-xs font-semibold text-slate-700">No applications found in queue.</h3>
          <p className="text-[11px] text-slate-500">Adjust your filter options to inspect other cases.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Application Ref & Enterprise</th>
                  <th className="py-2.5 px-3">Current Stage</th>
                  <th className="py-2.5 px-3">Action Owner</th>
                  <th className="py-2.5 px-3">Next Action</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">SLA</th>
                  <th className="py-2.5 px-3 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const info = getActionWorkflowInfo(app);
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] font-semibold text-slate-800 block">
                          {app.application_number}
                        </span>
                        <span className="font-medium text-slate-900 block mt-0.5">
                          {app.business_name}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {app.approval_type?.name} • {app.business_district}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {info.stageLabel}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <ActionOwnerBadge owner={info.owner} />
                      </td>

                      <td className="py-3 px-3 text-slate-800 font-medium max-w-xs">
                        <span className="line-clamp-2">{info.nextAction}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-700 block">
                          {info.dueDateOrSla}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {app.submission_date || app.created_at
                            ? `${Math.max(1, Math.floor((Date.now() - new Date(app.submission_date || app.created_at).getTime()) / (1000 * 60 * 60 * 24)))}d active`
                            : 'Active'} / {app.approval_type?.standard_sla_days || 30}d
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          to={`/applications/${app.id}`}
                          className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                        >
                          Dossier <ChevronRight className="w-3 h-3 text-slate-400" />
                        </Link>

                        <button
                          onClick={() => handleOpenModal(app)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3 h-3" /> Update Status
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

      {/* Scrutiny Status Update Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title="Administrative Scrutiny Determination"
          subtitle={`Case: ${selectedApp.application_number} • ${selectedApp.business_name}`}
        >
          <form onSubmit={handleSaveUpdate} className="space-y-4">
            {updateSuccess && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                {updateSuccess}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Determination Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                >
                  <option value="UNDER_REVIEW">UNDER REVIEW (Scrutiny in progress)</option>
                  <option value="DOCUMENTS_REQUIRED">DOCUMENTS REQUIRED (Deficiency notice)</option>
                  <option value="INSPECTION_PENDING">INSPECTION PENDING (Field audit assigned)</option>
                  <option value="APPROVED">APPROVED (Statutory clearance granted)</option>
                  <option value="REJECTED">REJECTED (Declined with grounds)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Workflow Procedural Stage
                </label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                >
                  <option value="SUBMISSION">1. Application Submission</option>
                  <option value="DEPT_REVIEW">2. Department Scrutiny & Review</option>
                  <option value="INSPECTION">3. Site / Field Inspection</option>
                  <option value="FINAL_APPROVAL">4. Final Administrative Sanction</option>
                  <option value="COMPLETED">5. Completed / Discharged</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assigned Scrutiny Officer
              </label>
              <input
                type="text"
                value={assignedOfficer}
                onChange={(e) => setAssignedOfficer(e.target.value)}
                placeholder="e.g. Sanjay Patil (Senior Scrutiny Officer)"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Official Department Remarks & Directions
              </label>
              <textarea
                rows={3}
                required
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder="Record scrutiny findings, deficiency notes, or inspection orders..."
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="advStage"
                checked={advanceStage}
                onChange={(e) => setAdvanceStage(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0"
              />
              <label htmlFor="advStage" className="text-xs text-slate-700 font-medium cursor-pointer">
                Automatically mark current workflow step completed and advance sequential stage
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
              >
                {updating ? 'Recording Decision...' : 'Commit Determination'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
