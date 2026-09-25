import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  CalendarCheck,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Upload,
  ChevronRight,
  ExternalLink,
  MapPin,
  Flame,
  Zap,
  Droplets,
  Users
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationService } from '../services/application.service';
import { InspectionService } from '../services/inspection.service';
import { ComplianceService } from '../services/compliance.service';
import { AnalyticsService } from '../services/analytics.service';
import { ApplicationItem, InspectionItem, ComplianceTaskItem, AnalyticsOverview } from '../types';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';

const STATUS_PIE_COLORS: Record<string, string> = {
  APPROVED: '#10b981',
  COMPLETED: '#059669',
  UNDER_REVIEW: '#6366f1',
  INSPECTION_PENDING: '#8b5cf6',
  DOCUMENTS_REQUIRED: '#f59e0b',
  ACTION_REQUIRED: '#f97316',
  SUBMITTED: '#3b82f6',
};

export const DashboardPage: React.FC = () => {
  const { user, activeBusiness } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTaskItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!activeBusiness) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [appsData, inspData, compData, analyticsData] = await Promise.all([
          ApplicationService.list({ business_id: activeBusiness.id }),
          InspectionService.list({ business_id: activeBusiness.id }),
          ComplianceService.listByBusiness(activeBusiness.id),
          AnalyticsService.getOverview({ business_id: activeBusiness.id }).catch(() => null),
        ]);
        setApplications(appsData);
        setInspections(inspData);
        setComplianceTasks(compData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activeBusiness]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Industrial Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  // Derive Canonical Metrics from Backend Analytics source of truth
  const totalApps = analytics ? analytics.total_applications : applications.length;
  const completedApps = analytics ? analytics.completed_applications : applications.filter((a) => a.status === 'APPROVED' || a.status === 'COMPLETED').length;
  const underReviewApps = analytics ? analytics.under_review_applications : applications.filter((a) => a.status === 'UNDER_REVIEW' || a.status === 'INSPECTION_PENDING').length;
  const actionReqApps = analytics ? analytics.action_required_applications : applications.filter((a) => a.status === 'DOCUMENTS_REQUIRED' || a.status === 'ACTION_REQUIRED').length;
  const nearSlaApps = analytics ? (analytics.delayed_applications + analytics.near_sla_applications) : applications.filter((a) => a.delay_risk_level === 'HIGH' || a.delay_risk_level === 'MEDIUM').length;

  // Chart data derived from Backend Source of Truth
  const pieChartData = analytics?.status_breakdown && analytics.status_breakdown.length > 0
    ? analytics.status_breakdown.map((item) => ({
        name: item.status.replace(/_/g, ' '),
        value: item.count,
        color: item.color || STATUS_PIE_COLORS[item.status] || '#94a3b8',
      }))
    : (() => {
        const counts: Record<string, number> = {};
        applications.forEach((a) => {
          counts[a.status] = (counts[a.status] || 0) + 1;
        });
        return Object.entries(counts).map(([status, count]) => ({
          name: status.replace(/_/g, ' '),
          value: count,
          color: STATUS_PIE_COLORS[status] || '#94a3b8',
        }));
      })();

  const barChartData = analytics?.stage_breakdown && analytics.stage_breakdown.length > 0
    ? analytics.stage_breakdown.map((item) => ({
        stage: item.stage,
        count: item.count,
      }))
    : (() => {
        const stageCounts: Record<string, number> = {};
        applications.forEach((a) => {
          stageCounts[a.current_stage] = (stageCounts[a.current_stage] || 0) + 1;
        });
        return Object.entries(stageCounts).map(([stage, count]) => ({
          stage: stage.replace(/_/g, ' '),
          count,
        }));
      })();

  const upcomingInspections = inspections.filter((i) => i.status === 'SCHEDULED');
  const actionRequiredList = applications.filter((a) => a.status === 'DOCUMENTS_REQUIRED' || a.status === 'ACTION_REQUIRED' || a.delay_risk_level === 'HIGH');

  return (
    <div className="space-y-6">
      {/* Top Business Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Active Industrial Unit
              </span>
              <span className="text-xs text-slate-400 font-mono">
                MIDC Industrial Zone
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {activeBusiness?.name || 'Maharashtra Fresh Foods Pvt. Ltd.'}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                {activeBusiness?.industry} ({activeBusiness?.scale} Scale)
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {activeBusiness?.district}, {activeBusiness?.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                {activeBusiness?.employee_count || 45} Workers
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                {activeBusiness?.electricity_load_kw || 350} kW Load
              </span>
              <span className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                {activeBusiness?.water_requirement_kld || 45} KLD Water
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/approvals"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              View Approval Plan
            </Link>
            <Link
              to="/ai-assistant"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              Ask AI Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Core Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Clearances"
          value={totalApps}
          subtitle="Tracked applications"
          icon={FileCheck2}
          iconColor="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Completed"
          value={completedApps}
          subtitle="Sanctioned & Approved"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
          badge={{ text: `${Math.round((completedApps / Math.max(1, totalApps)) * 100)}% Done`, variant: 'positive' }}
          onClick={() => navigate('/applications?status=APPROVED')}
        />
        <StatCard
          title="Under Review"
          value={underReviewApps}
          subtitle="Department scrutiny"
          icon={Clock}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50 dark:bg-indigo-950/30"
          onClick={() => navigate('/applications?status=UNDER_REVIEW')}
        />
        <StatCard
          title="Action Required"
          value={actionReqApps}
          subtitle="Applicant upload needed"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/30"
          badge={{ text: 'Needs Attention', variant: 'warning' }}
          onClick={() => navigate('/applications?status=DOCUMENTS_REQUIRED')}
        />
        <StatCard
          title="Near / Delayed SLA"
          value={nearSlaApps}
          subtitle="SLA risk monitored"
          icon={ShieldAlert}
          iconColor="text-rose-600"
          bgColor="bg-rose-50 dark:bg-rose-950/30"
          badge={{ text: `${nearSlaApps} Monitored`, variant: 'danger' }}
          onClick={() => navigate('/applications?delay_risk=HIGH')}
        />
      </div>

      {/* Urgent Action Banner if any actions or SLA delay */}
      {actionRequiredList.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-amber-200">
                  Immediate Action Required for {actionRequiredList.length} Clearance(s)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {actionRequiredList[0]?.approval_type?.name} ({actionRequiredList[0]?.application_number}):{' '}
                  <span className="font-semibold">{actionRequiredList[0]?.next_action_prompt}</span>
                </p>
              </div>
            </div>
            <Link
              to={`/applications/${actionRequiredList[0]?.id}`}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              Resolve Action <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Two Column Layout: Charts & Timeline Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Applications & Bottleneck Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Applications by Status & Stage */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Compliance Portfolio Overview
                </h3>
                <p className="text-xs text-slate-500">
                  Status distribution across Maharashtra statutory bodies
                </p>
              </div>
              <Link to="/applications" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Pie Chart */}
              <div className="h-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Legend */}
              <div className="space-y-1.5 text-xs">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 dark:text-slate-300 capitalize">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recently Updated Applications Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Recently Updated Applications
                </h3>
                <p className="text-xs text-slate-500">Live statutory status and SLA risk ratings</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="pb-2.5 font-bold">Clearance / Dept</th>
                    <th className="pb-2.5 font-bold">App Number</th>
                    <th className="pb-2.5 font-bold">Status</th>
                    <th className="pb-2.5 font-bold">Delay Risk</th>
                    <th className="pb-2.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {app.approval_type?.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {app.approval_type?.issuing_authority}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {app.application_number}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3">
                        <RiskBadge level={app.delay_risk_level} showLabel={false} />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/applications/${app.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 font-semibold inline-flex items-center gap-1"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Inspections & Recurring Compliance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scheduled Inspections Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Upcoming Inspections
                  </h3>
                  <p className="text-[11px] text-slate-400">Department officer site visits</p>
                </div>
              </div>
              <Link to="/inspections" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            {upcomingInspections.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No field inspections scheduled currently.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInspections.map((insp) => (
                  <div
                    key={insp.id}
                    className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-purple-200">
                          {insp.inspection_type}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Officer: <strong className="text-slate-700 dark:text-slate-300">{insp.officer_name}</strong> ({insp.officer_designation})
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 whitespace-nowrap">
                        {new Date(insp.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    {insp.applicant_action_required && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-purple-100/60 dark:border-purple-800/40">
                        <strong>Action Needed:</strong> {insp.applicant_action_required}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recurring Compliance Calendar Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Statutory Compliance Calendar
                  </h3>
                  <p className="text-[11px] text-slate-400">Recurring filings & safety drills</p>
                </div>
              </div>
              <Link to="/compliance" className="text-xs text-blue-600 font-semibold hover:underline">
                View Calendar
              </Link>
            </div>

            <div className="space-y-2.5">
              {complianceTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {task.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {task.issuing_authority} • {task.frequency}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={task.status} />
                    <span className="block text-[10px] text-slate-400 mt-1">
                      Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
