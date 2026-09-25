import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Edit,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { ApplicationService } from '../../services/application.service';
import { ApplicationItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Modal } from '../../components/common/Modal';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    const validStages = stateMatrix?.valid_status_stage_map[status] || [];
    if (validStages.length > 0 && !validStages.includes(newStage)) {
      setNewStage(stateMatrix?.default_stage_for_status[status] || validStages[0]);
    }
  };

  const openUpdateModal = (app: ApplicationItem) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setNewStage(app.current_stage);
    setOfficerRemarks(app.officer_remarks || '');
    setAssignedOfficer(app.assigned_officer || 'Desk Scrutiny Officer');
    setAdvanceStage(false);
    setUpdateSuccess(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    setUpdateSuccess(null);
    try {
      const updated = await ApplicationService.updateStatus(selectedApp.id, {
        status: newStatus,
        current_stage: newStage,
        officer_remarks: officerRemarks,
        assigned_officer: assignedOfficer,
        advance_stage: advanceStage,
      });

      setUpdateSuccess(`Application ${updated.application_number} updated to ${updated.status}.`);
      await fetchApplications();
      setTimeout(() => {
        setSelectedApp(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.business_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.approval_type?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Department Scrutiny & Review Queue
            </h1>
            <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-bold px-2.5 py-0.5 rounded-full">
              {applications.length} Applications Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant documents, advance statutory workflow stages, assign field scrutiny officers, and log official decisions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by app number, business name, or clearance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="DOCUMENTS_REQUIRED">Documents Required</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="INSPECTION_PENDING">Inspection Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTION_REQUIRED">Action Required</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading departmental queue...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
          <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications match filter.</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-bold">App Number</th>
                  <th className="py-3 px-4 font-bold">Applicant Business</th>
                  <th className="py-3 px-4 font-bold">Clearance Category</th>
                  <th className="py-3 px-4 font-bold">Current Stage</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">SLA Delay Risk</th>
                  <th className="py-3 px-4 font-bold">Assigned Officer</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {app.application_number}
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 dark:text-white block">{app.business_name}</strong>
                      <span className="text-[10px] text-slate-400">{app.business_industry} • {app.business_district}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{app.approval_type?.name}</span>
                      <span className="text-[10px] text-slate-400">{app.approval_type?.department}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {app.current_stage.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={app.delay_risk_level} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {app.assigned_officer || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openUpdateModal(app)}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 hover:bg-purple-100 font-bold"
                      >
                        Update
                      </button>
                      <Link
                        to={`/applications/${app.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-semibold inline-block"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Application Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Update Scrutiny Status: ${selectedApp.application_number}`}
          subtitle={`${selectedApp.approval_type?.name} for ${selectedApp.business_name}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            {updateSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                {updateSuccess}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Application Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                >
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="INSPECTION_PENDING">INSPECTION_PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="ACTION_REQUIRED">ACTION_REQUIRED</option>
                  <option value="DOCUMENTS_REQUIRED">DOCUMENTS_REQUIRED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workflow Stage *
                </label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                >
                  {(stateMatrix?.valid_status_stage_map[newStatus] || ['SUBMITTED', 'DOC_VERIFICATION', 'DEPT_REVIEW', 'INSPECTION', 'FINAL_DECISION', 'COMPLETED']).map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Scrutiny Officer
              </label>
              <input
                type="text"
                value={assignedOfficer}
                onChange={(e) => setAssignedOfficer(e.target.value)}
                placeholder="e.g. Sanjay Patil (MPCB Regional Officer)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Scrutiny Remarks
              </label>
              <textarea
                rows={3}
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder="Enter departmental review findings or required applicant clarifications..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/50">
              <input
                type="checkbox"
                id="advanceStage"
                checked={advanceStage}
                onChange={(e) => setAdvanceStage(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="advanceStage" className="font-semibold text-purple-900 dark:text-purple-200">
                Advance workflow timeline to next sequential stage automatically
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save & Publish Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
