import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Filter,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationService } from '../services/application.service';
import { ApplicationItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { ActionOwnerBadge } from '../components/common/ActionOwnerBadge';
import { getActionWorkflowInfo } from '../utils/actionWorkflow';

export const ApplicationsPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const statusParam = searchParams.get('status');
  const delayRiskParam = searchParams.get('delay_risk');

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  const fetchApplications = async () => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await ApplicationService.list({ business_id: activeBusiness.id });
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeBusiness]);

  const filteredApps = applications.filter((app) => {
    const isTerminal = app.status === 'APPROVED' || app.status === 'COMPLETED' || app.status === 'REJECTED' || app.current_stage === 'COMPLETED';

    // URL parameter filtering (from Dashboard KPI clicks)
    if (filterParam === 'ACTION_REQUIRED') {
      const isActionReq = !isTerminal && (app.status === 'DOCUMENTS_REQUIRED' || app.status === 'ACTION_REQUIRED' || app.delay_risk_level === 'HIGH');
      if (!isActionReq) return false;
    }

    if (delayRiskParam === 'MONITORED') {
      const isMonitored = !isTerminal && (app.delay_risk_level === 'HIGH' || app.delay_risk_level === 'MEDIUM');
      if (!isMonitored) return false;
    } else if (delayRiskParam && delayRiskParam !== 'ALL') {
      if (app.delay_risk_level !== delayRiskParam) return false;
    }

    if (statusParam) {
      if (statusParam === 'APPROVED') {
        if (!(app.status === 'APPROVED' || app.status === 'COMPLETED')) return false;
      } else if (app.status !== statusParam) {
        return false;
      }
    }

    const matchesSearch =
      app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.approval_type?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.approval_type?.issuing_authority || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || app.delay_risk_level === riskFilter;

    const info = getActionWorkflowInfo(app);
    const matchesOwner = ownerFilter === 'ALL' || info.owner === ownerFilter;

    return matchesSearch && matchesStatus && matchesRisk && matchesOwner;
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Application Tracker & Workflow
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded">
              {applications.length} Clearances Tracked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor clearance stages, action owners, statutory SLA timelines, and required next steps.
          </p>
        </div>

        <Link
          to="/approvals"
          className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Add Clearance from Plan
        </Link>
      </div>

      {/* Active Filter Indicator if arrived from Dashboard KPI click */}
      {(filterParam || statusParam || delayRiskParam) && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span>
              Active Filter:{' '}
              <strong className="font-semibold text-slate-900">
                {filterParam === 'ACTION_REQUIRED'
                  ? 'Immediate Action Required (Missing Documents or SLA Critical)'
                  : delayRiskParam === 'MONITORED'
                  ? 'Near / Delayed SLA Risk'
                  : statusParam === 'APPROVED'
                  ? 'Approved & Granted Clearances'
                  : `Filtered by ${filterParam || statusParam || delayRiskParam}`}
              </strong>{' '}
              ({filteredApps.length} match{filteredApps.length === 1 ? '' : 'es'})
            </span>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-700 hover:text-slate-900 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" /> Clear Filter
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference number or clearance name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Owner:</span>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Owners</option>
              <option value="Applicant">Applicant</option>
              <option value="Department Officer">Department Officer</option>
              <option value="Inspection Officer">Inspection Officer</option>
              <option value="System">System</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DOCUMENTS_REQUIRED">Documents Required</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INSPECTION_PENDING">Inspection Pending</option>
              <option value="APPROVED">Approved / Completed</option>
              <option value="ACTION_REQUIRED">Action Required</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">SLA Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All SLA Tiers</option>
              <option value="HIGH">High Delay Risk</option>
              <option value="MEDIUM">Medium / Near SLA</option>
              <option value="LOW">Low / On Track</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Professional Workflow Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading application portfolio...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-xs font-semibold text-slate-700">No applications match the filter criteria.</h3>
          <p className="text-[11px] text-slate-500">Adjust your search query or reset filter controls.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Application</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Action Owner</th>
                  <th className="py-2.5 px-3">Next Action</th>
                  <th className="py-2.5 px-3">SLA</th>
                  <th className="py-2.5 px-3">Last Update</th>
                  <th className="py-2.5 px-3 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const info = getActionWorkflowInfo(app);
                  const lastUpdate = app.updated_at || app.submission_date || app.created_at;
                  const formattedLastUpdate = lastUpdate
                    ? new Date(lastUpdate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] font-semibold text-slate-800 block">
                          {app.application_number}
                        </span>
                        <span className="font-medium text-slate-900 block mt-0.5 line-clamp-1">
                          {app.approval_type?.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {app.approval_type?.issuing_authority}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {info.stageLabel}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <ActionOwnerBadge owner={info.owner} />
                      </td>

                      <td className="py-3 px-3 text-slate-800 font-medium max-w-xs">
                        <span className="line-clamp-2">{info.nextAction}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-700 block">
                          {info.dueDateOrSla}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {app.approval_type?.standard_sla_days || 30}d standard SLA
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {formattedLastUpdate}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Link
                          to={`/applications/${app.id}`}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          Open <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
