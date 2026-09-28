import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationService } from '../services/application.service';
import { ApplicationItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';

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

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Application Tracker & Workflow
            </h1>
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full">
              {applications.length} Clearances Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status, departmental timelines, and explainable SLA risk tracking.
          </p>
        </div>

        <Link
          to="/approvals"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Add Clearance from Plan
        </Link>
      </div>

      {/* Active Filter Indicator if arrived from Dashboard KPI click */}
      {(filterParam || statusParam || delayRiskParam) && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>
              Active Filter:{' '}
              <strong className="font-bold">
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
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 text-[11px] font-bold transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Clear Filter
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by application number or clearance name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold"
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
            <span className="text-slate-400 font-semibold">SLA Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="ALL">All SLA Tiers</option>
              <option value="HIGH">High Delay Risk</option>
              <option value="MEDIUM">Medium / Near SLA</option>
              <option value="LOW">Low / On Track</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading application portfolio...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
          <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications match your filter criteria.</h3>
          <p className="text-xs text-slate-400">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                      {app.application_number}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status:</span>
                    <StatusBadge status={app.status} />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Delay Risk:</span>
                    <RiskBadge level={app.delay_risk_level} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    {app.approval_type?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Authority: <strong className="text-slate-700 dark:text-slate-300">{app.approval_type?.issuing_authority}</strong>
                  </p>
                </div>

                <div className="text-right self-start md:self-auto text-xs text-slate-400">
                  <span className="block text-[10px] uppercase font-bold">Last Updated</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {app.updated_at ? new Date(app.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                  </span>
                  {app.assigned_officer && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Desk: {app.assigned_officer.split('(')[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Distinct Dimensional Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* 1. Workflow Stage */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Current Workflow Stage
                  </span>
                  <strong className="text-slate-900 dark:text-white font-bold block text-sm">
                    {app.current_stage.replace(/_/g, ' ')}
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    {app.status === 'APPROVED' ? 'Final approval issued' : 'Under active procedural progression'}
                  </span>
                </div>

                {/* 2. Statutory SLA */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    SLA Window & Target
                  </span>
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 dark:text-white font-mono font-bold">
                      {app.approval_type?.standard_sla_days || 30} Days (Total)
                    </strong>
                    {app.approval_type?.code === 'MPCB_CONSENT_ESTABLISH' && (
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                        (Review Benchmark: 15d)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Target: {app.sla_deadline ? new Date(app.sla_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Standard Window'}
                  </span>
                </div>

                {/* 3. Delay Risk Diagnostics */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Delay Risk Level
                  </span>
                  <div className="flex items-center gap-1.5">
                    <RiskBadge level={app.delay_risk_level} />
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {app.delay_risk_level === 'LOW' ? 'On track' : `${app.delay_risk_reasons?.length || 1} signal(s)`}
                    </span>
                  </div>
                  {app.delay_risk_reasons && app.delay_risk_reasons[0] && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 truncate block">
                      {app.delay_risk_reasons[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Actionable Next Action Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider block">
                    Explicit Next Action Required:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {app.next_action_prompt || 'Application progressing within scheduled scrutiny parameters.'}
                  </p>
                </div>

                <Link
                  to={`/applications/${app.id}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm shadow-blue-500/20 self-start sm:self-auto"
                >
                  {app.status === 'DOCUMENTS_REQUIRED' ? 'Upload Missing Documents' : (app.status === 'INSPECTION_PENDING' ? 'View Inspection Readiness' : 'Open Application Dossier')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
