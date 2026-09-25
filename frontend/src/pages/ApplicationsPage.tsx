import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationService } from '../services/application.service';
import { ApplicationItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';

export const ApplicationsPage: React.FC = () => {
  const { activeBusiness } = useAuth();
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                      {app.application_number}
                    </span>
                    <StatusBadge status={app.status} />
                    <RiskBadge level={app.delay_risk_level} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">
                    {app.approval_type?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Issuing Authority: <strong className="text-slate-700 dark:text-slate-300">{app.approval_type?.issuing_authority}</strong>
                  </p>
                </div>

                <Link
                  to={`/applications/${app.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 self-start md:self-auto shadow-sm"
                >
                  View Timeline & Docs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Progress Stage & Next Action */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stage</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {app.current_stage.replace(/_/g, ' ')}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Deadline</span>
                  <strong className="text-slate-900 dark:text-white font-mono">
                    {app.sla_deadline ? new Date(app.sla_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Standard 30 Days'}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Action Required</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate block">
                    {app.next_action_prompt || 'Awaiting department review.'}
                  </span>
                </div>
              </div>

              {/* Delay risk reasons if Medium or High */}
              {app.delay_risk_level !== 'LOW' && app.delay_risk_reasons && app.delay_risk_reasons.length > 0 && (
                <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Delay Risk Signals:</strong> {app.delay_risk_reasons.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
