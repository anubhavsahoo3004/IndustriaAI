import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ShieldAlert,
  Clock,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CalendarCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  Activity,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsOverview } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskBadge } from '../../components/common/RiskBadge';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await AnalyticsService.getOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Computing State Administrative Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-xs text-slate-400">Unable to load analytics.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-purple-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                Directorate Administrative Desk
              </span>
              <span className="text-xs text-slate-400">
                Government of Maharashtra Single Window Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Industrial Clearance & Bottleneck Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Cross-departmental monitoring across MPCB, FDA, DISH, MSEDCL, and MIDC regional offices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/sla-risk"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              View SLA Risk Queue ({data.delayed_applications + data.near_sla_applications})
            </Link>
          </div>
        </div>
      </div>

      {/* 6 High-Level Executive Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Portfolio"
          value={data.total_applications}
          icon={FileCheck2}
          iconColor="text-blue-600"
          onClick={() => navigate('/admin/applications')}
        />
        <StatCard
          title="Under Review"
          value={data.under_review_applications}
          icon={Clock}
          iconColor="text-indigo-600"
          onClick={() => navigate('/admin/applications')}
        />
        <StatCard
          title="Action Req."
          value={data.action_required_applications}
          icon={AlertTriangle}
          iconColor="text-amber-600"
          badge={{ text: 'Applicant Action', variant: 'warning' }}
          onClick={() => navigate('/admin/applications')}
        />
        <StatCard
          title="Near SLA (Warn)"
          value={data.near_sla_applications}
          icon={AlertCircle}
          iconColor="text-amber-500"
          badge={{ text: 'Approaching', variant: 'warning' }}
          onClick={() => navigate('/admin/sla-risk')}
        />
        <StatCard
          title="Delayed / High"
          value={data.delayed_applications}
          icon={ShieldAlert}
          iconColor="text-rose-600"
          badge={{ text: 'Escalate', variant: 'danger' }}
          onClick={() => navigate('/admin/sla-risk')}
        />
        <StatCard
          title="Approved"
          value={data.completed_applications}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          badge={{ text: `${Math.round((data.completed_applications / Math.max(1, data.total_applications)) * 100)}%`, variant: 'positive' }}
          onClick={() => navigate('/admin/applications')}
        />
      </div>

      {/* Section 16: BOTTLENECK ANALYSIS SECTION (Crucial Requirement) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Statutory Workflow Bottleneck Analysis
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Computed from live application hold times and stage velocity across Maharashtra single window departments.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-3 py-1 rounded-xl">
            Live Pipeline Scrutiny
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.bottlenecks.map((b) => (
            <div
              key={b.stage_key}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                b.is_critical
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {b.stage_name}
                </span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    b.is_critical
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {b.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${b.is_critical ? 'bg-rose-500' : 'bg-purple-600'}`}
                  style={{ width: `${Math.min(100, b.percentage)}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Active: <strong>{b.count} files</strong></span>
                <span>Threshold: <strong>{b.threshold_days} days</strong></span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                {b.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Industry Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Applications by Industry Sector
            </h3>
            <p className="text-xs text-slate-500">Portfolio distribution in Maharashtra</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.industry_breakdown} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="industry" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Applications by Status Distribution
            </h3>
            <p className="text-xs text-slate-500">Overall state compliance lifecycle</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.status_breakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, value }: any) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {data.status_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority SLA Delay Queue Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Immediate Administrative Delay Risk Queue
            </h3>
            <p className="text-xs text-slate-500">
              Applications exceeding departmental review benchmarks or approaching statutory deadlines.
            </p>
          </div>
          <Link
            to="/admin/sla-risk"
            className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1"
          >
            View Full Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-3 px-4 font-bold">App Number</th>
                <th className="py-3 px-4 font-bold">Business & Sector</th>
                <th className="py-3 px-4 font-bold">Clearance</th>
                <th className="py-3 px-4 font-bold">Risk Level</th>
                <th className="py-3 px-4 font-bold">Days in Stage</th>
                <th className="py-3 px-4 font-bold">Trigger Reasons</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.sla_risks.slice(0, 5).map((risk) => (
                <tr key={risk.application_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {risk.application_number}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {risk.business_name}
                    <span className="block text-[10px] text-slate-400 font-normal">{risk.industry}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {risk.approval_name}
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge level={risk.risk_level} />
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {risk.days_in_current_stage} / {risk.configured_sla_days}d
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                    {risk.reasons.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/applications/${risk.application_id}`}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
