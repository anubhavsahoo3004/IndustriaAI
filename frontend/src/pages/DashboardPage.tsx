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
  ArrowRight,
  ChevronRight,
  MapPin,
  Zap,
  Droplets,
  Users,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationService } from '../services/application.service';
import { InspectionService } from '../services/inspection.service';
import { ComplianceService } from '../services/compliance.service';
import { AnalyticsService } from '../services/analytics.service';
import { ApplicationItem, InspectionItem, ComplianceTaskItem, AnalyticsOverview } from '../types';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { getActionWorkflowInfo } from '../utils/actionWorkflow';

const STATUS_PIE_COLORS: Record<string, string> = {
  APPROVED: '#10b981',
  COMPLETED: '#059669',
  UNDER_REVIEW: '#64748b',
  INSPECTION_PENDING: '#94a3b8',
  DOCUMENTS_REQUIRED: '#f59e0b',
  ACTION_REQUIRED: '#d97706',
  SUBMITTED: '#3b82f6',
  REJECTED: '#ef4444',
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
      <div className="flex items-center justify-center min-h-[360px]">
        <div className="text-center space-y-2.5">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  // Canonical Action Required filter matching backend logic
  const isActionRequiredApp = (a: ApplicationItem) => {
    const isTerminal = a.status === 'APPROVED' || a.status === 'COMPLETED' || a.status === 'REJECTED' || a.current_stage === 'COMPLETED';
    if (isTerminal) return false;
    return a.status === 'DOCUMENTS_REQUIRED' || a.status === 'ACTION_REQUIRED' || a.delay_risk_level === 'HIGH';
  };

  const actionRequiredList = applications.filter(isActionRequiredApp);

  // Authoritative Applicant Action items: ONLY where Action Owner === 'Applicant'
  const applicantAttentionList = applications
    .map((app) => ({ app, info: getActionWorkflowInfo(app) }))
    .filter((item) => item.info.owner === 'Applicant');

  // Derive Canonical Metrics from Backend Analytics source of truth
  const totalApps = analytics ? analytics.total_applications : applications.length;
  const completedApps = analytics ? analytics.completed_applications : applications.filter((a) => a.status === 'APPROVED' || a.status === 'COMPLETED').length;
  const underReviewApps = analytics ? analytics.under_review_applications : applications.filter((a) => a.status === 'UNDER_REVIEW' || a.status === 'INSPECTION_PENDING').length;
  const actionReqApps = analytics ? analytics.action_required_applications : actionRequiredList.length;
  const highRiskApps = analytics ? analytics.delayed_applications : applications.filter((a) => a.delay_risk_level === 'HIGH' && !(a.status === 'APPROVED' || a.status === 'COMPLETED')).length;

  // Canonical Donut Chart Data
  const pieChartData = (() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status.replace(/_/g, ' '),
      statusKey: status,
      value: count,
      color: STATUS_PIE_COLORS[status] || '#94a3b8',
    })).sort((a, b) => b.value - a.value);
  })();

  const chartTotal = pieChartData.reduce((acc, curr) => acc + curr.value, 0);
  const upcomingInspections = inspections.filter((i) => i.status === 'SCHEDULED');

  return (
    <div className="space-y-5">
      {/* Top Business Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Registered Industrial Unit
              </span>
              <span className="text-xs text-slate-500 font-mono">
                MIDC Industrial Zone
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {activeBusiness?.name || 'Maharashtra Fresh Foods Pvt. Ltd.'}
            </h1>
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {activeBusiness?.industry} ({activeBusiness?.scale} Scale)
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activeBusiness?.district}, {activeBusiness?.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {activeBusiness?.employee_count || 45} Workers
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                {activeBusiness?.electricity_load_kw || 350} kW Load
              </span>
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-slate-400" />
                {activeBusiness?.water_requirement_kld || 45} KLD Water
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/approvals"
              className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Approval Plan
            </Link>
            <Link
              to="/ai-assistant"
              className="px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              Compliance Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Enterprise KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Applications"
          value={totalApps}
          subtitle="Tracked in portal"
          icon={FileCheck2}
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Approved"
          value={completedApps}
          subtitle="Clearances active"
          icon={CheckCircle2}
          badge={{ text: `${Math.round((completedApps / Math.max(1, totalApps)) * 100)}% Granted`, variant: 'positive' }}
          onClick={() => navigate('/applications?status=APPROVED')}
        />
        <StatCard
          title="Under Review"
          value={underReviewApps}
          subtitle="Department scrutiny"
          icon={Clock}
          onClick={() => navigate('/applications?status=UNDER_REVIEW')}
        />
        <StatCard
          title="Action Required"
          value={actionReqApps}
          subtitle="Response needed"
          icon={AlertTriangle}
          badge={{ text: `${actionReqApps} Action Pending`, variant: 'warning' }}
          onClick={() => navigate('/applications?filter=ACTION_REQUIRED')}
        />
        <StatCard
          title="High Delay Risk"
          value={highRiskApps}
          subtitle="SLA exceeded benchmark"
          icon={ShieldAlert}
          badge={{ text: `${highRiskApps} Critical`, variant: 'danger' }}
          onClick={() => navigate('/applications?delay_risk=HIGH')}
        />
      </div>

      {/* "What Needs Your Attention" Section (Only Action Owner = Applicant) */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900">
              What Needs Your Attention
            </h2>
            <p className="text-[11px] text-slate-500">
              Applications requiring your direct input, documentation upload, or query response
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {applicantAttentionList.length} Action{applicantAttentionList.length === 1 ? '' : 's'} Pending
          </span>
        </div>

        {applicantAttentionList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-md border border-slate-100">
            <p className="font-semibold text-slate-700">No actions currently require your attention.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">All submitted applications are actively being reviewed by the respective departments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Application</th>
                  <th className="py-2.5 px-3">Requirement</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicantAttentionList.map((item) => (
                  <tr key={item.app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] font-semibold text-slate-800 block">
                        {item.app.application_number}
                      </span>
                      <span className="font-medium text-slate-900 block mt-0.5">
                        {item.app.approval_type?.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <span className="line-clamp-2">{item.info.requirement}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {item.info.nextAction}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      {item.info.dueDateOrSla.replace(/^Due:\s*/, '')}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={item.app.status} />
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link
                        to={`/applications/${item.app.id}`}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        Open <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Section: Status Distribution & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Applications Status Distribution (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-semibold text-xs text-slate-900">
                  Compliance Portfolio Overview
                </h3>
                <p className="text-[11px] text-slate-500">
                  Status distribution across Maharashtra statutory bodies
                </p>
              </div>
              <Link to="/applications" className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Pie Chart */}
              <div className="h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={2}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} Clearances`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Donut Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900 leading-none">
                    {chartTotal}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    Clearances
                  </span>
                </div>
              </div>

              {/* Status Legend Table */}
              <div className="space-y-1 text-xs">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 capitalize">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{item.value}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({Math.round((item.value / Math.max(1, chartTotal)) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-200 text-slate-900 font-semibold text-xs">
                  <span>Total Portfolio</span>
                  <span>{chartTotal} Applications (100%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Updated Applications Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-semibold text-xs text-slate-900">
                  Recently Updated Applications
                </h3>
                <p className="text-[11px] text-slate-500">Live statutory status and SLA risk ratings</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-600 text-[11px] font-semibold">
                  <tr>
                    <th className="py-2 px-2.5">Clearance / Dept</th>
                    <th className="py-2 px-2.5">App Number</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5">Delay Risk</th>
                    <th className="py-2 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2.5 font-medium text-slate-900">
                        {app.approval_type?.name}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {app.approval_type?.issuing_authority}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-600">
                        {app.application_number}
                      </td>
                      <td className="py-2.5 px-2.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-2.5 px-2.5">
                        <RiskBadge level={app.delay_risk_level} showLabel={false} />
                      </td>
                      <td className="py-2.5 px-2.5 text-right">
                        <Link
                          to={`/applications/${app.id}`}
                          className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
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
        <div className="lg:col-span-5 space-y-5">
          {/* Scheduled Inspections Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-slate-600" />
                <div>
                  <h3 className="font-semibold text-xs text-slate-900">
                    Scheduled Inspections
                  </h3>
                  <p className="text-[10px] text-slate-500">Department officer site visits</p>
                </div>
              </div>
              <Link to="/inspections" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
                View All
              </Link>
            </div>

            {upcomingInspections.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No field inspections scheduled currently.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingInspections.map((insp) => (
                  <div
                    key={insp.id}
                    className="p-3 rounded-md border border-slate-200 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900">
                          {insp.inspection_type}
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Officer: <span className="font-medium text-slate-800">{insp.officer_name}</span> ({insp.officer_designation})
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 whitespace-nowrap">
                        {new Date(insp.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(insp.scheduled_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {insp.applicant_action_required && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                        <strong className="text-slate-800">Action:</strong> {insp.applicant_action_required}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statutory Compliance Calendar Summary */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-600" />
                <div>
                  <h3 className="font-semibold text-xs text-slate-900">
                    Statutory Compliance Calendar
                  </h3>
                  <p className="text-[10px] text-slate-500">Recurring filings & returns</p>
                </div>
              </div>
              <Link to="/compliance" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
                View Calendar
              </Link>
            </div>

            <div className="space-y-2">
              {complianceTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-md border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-medium text-slate-900">
                      {task.title}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {task.issuing_authority} • {task.frequency}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={task.status} />
                    <span className="block text-[10px] text-slate-500 mt-0.5 font-mono">
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
