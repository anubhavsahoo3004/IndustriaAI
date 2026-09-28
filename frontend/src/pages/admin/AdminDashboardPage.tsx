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
  ArrowRight,
  Shield
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
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
      <div className="flex items-center justify-center min-h-[360px]">
        <div className="text-center space-y-2.5">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Department Analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-xs text-slate-400">Unable to load analytics.</div>;
  }

  const stageData = (data.stage_breakdown || []).map((s) => ({
    stage: s.stage.replace(/_/g, ' '),
    count: s.count,
  }));

  const delayedCount = data.delayed_applications + data.near_sla_applications;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Directorate Operations & Scrutiny Desk
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-mono px-2 py-0.5 rounded font-semibold">
              State Oversight
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-departmental monitoring across MPCB, FDA, DISH, MSEDCL, and MIDC regional offices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/sla-risk"
            className="px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            SLA Delay Queue ({delayedCount})
          </Link>
          <Link
            to="/admin/applications"
            className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Scrutiny Queue
          </Link>
        </div>
      </div>

      {/* 4 Clean Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Pipeline"
          value={data.total_applications}
          subtitle="Total industrial applications"
          icon={FileCheck2}
          onClick={() => navigate('/admin/applications')}
        />
        <StatCard
          title="Clearances Granted"
          value={data.completed_applications}
          subtitle="Formally approved"
          icon={CheckCircle2}
          badge={{ text: 'Completed', variant: 'positive' }}
          onClick={() => navigate('/admin/applications?status=APPROVED')}
        />
        <StatCard
          title="Under Review"
          value={data.under_review_applications}
          subtitle="Department scrutiny active"
          icon={Clock}
          onClick={() => navigate('/admin/applications?status=UNDER_REVIEW')}
        />
        <StatCard
          title="SLA Monitored / Delayed"
          value={delayedCount}
          subtitle="Exceeds review benchmark or near SLA"
          icon={ShieldAlert}
          badge={{ text: `${delayedCount} Delayed`, variant: 'danger' }}
          onClick={() => navigate('/admin/sla-risk')}
        />
      </div>

      {/* Main Grid: Department Queues and Stage Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Department Scrutiny Bottlenecks Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-semibold text-xs text-slate-900">
                  Department Workload & Processing Times
                </h3>
                <p className="text-[11px] text-slate-500">
                  Median clearance days vs statutory RTSA limits by issuing authority
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-2.5">Department</th>
                    <th className="py-2 px-2.5">Active Queue</th>
                    <th className="py-2 px-2.5">Median Days</th>
                    <th className="py-2 px-2.5">Target SLA</th>
                    <th className="py-2 px-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((data as any)?.department_breakdown || [
                    { department: 'MPCB (Pollution Control)', count: 4, median_days: 18, statutory_days: 24, status: 'DELAYED' },
                    { department: 'FDA (Food & Drug Admin)', count: 2, median_days: 12, statutory_days: 20, status: 'NORMAL' },
                    { department: 'DISH (Safety & Health)', count: 2, median_days: 14, statutory_days: 30, status: 'NORMAL' },
                    { department: 'MIDC (Infrastructure)', count: 1, median_days: 7, statutory_days: 15, status: 'ON_TRACK' },
                    { department: 'MSEDCL (Power Board)', count: 1, median_days: 10, statutory_days: 21, status: 'ON_TRACK' },
                  ]).map((dept: any, idx: number) => {
                    const isDelayed = dept.status === 'DELAYED' || dept.median_days > 15;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-2.5 font-medium text-slate-900">
                          {dept.department}
                        </td>
                        <td className="py-2.5 px-2.5 font-semibold text-slate-800">
                          {dept.count}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-700">
                          {dept.median_days}d
                        </td>
                        <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-500">
                          {dept.statutory_days}d
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                              isDelayed
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {isDelayed ? 'Review Benchmark Exceeded' : 'Within Benchmark'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Stage Workload Breakdown Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-semibold text-xs text-slate-900">
                  Applications by Workflow Stage
                </h3>
                <p className="text-[11px] text-slate-500">Active distribution across procedural checkpoints</p>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis dataKey="stage" type="category" width={110} tick={{ fontSize: 10, fill: '#334155' }} />
                  <Tooltip formatter={(value: any) => [`${value} Applications`, 'Count']} />
                  <Bar dataKey="count" fill="#334155" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
