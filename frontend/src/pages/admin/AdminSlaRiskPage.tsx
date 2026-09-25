import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  ArrowRight,
  Sparkles,
  Info,
  Filter,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AnalyticsService } from '../../services/analytics.service';
import { SlaRiskItem } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';

export const AdminSlaRiskPage: React.FC = () => {
  const [slaRisks, setSlaRisks] = useState<SlaRiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');

  useEffect(() => {
    const fetchSlaRisks = async () => {
      try {
        setLoading(true);
        const res = await AnalyticsService.getSlaRisks();
        setSlaRisks(res.sla_risks || []);
      } catch (err) {
        console.error('Failed to load SLA risks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlaRisks();
  }, []);

  const filteredRisks = slaRisks.filter((item) => {
    if (riskFilter === 'HIGH') return item.risk_level === 'HIGH';
    if (riskFilter === 'MEDIUM') return item.risk_level === 'MEDIUM';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-rose-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5" />
                Transparent SLA Intelligence
              </span>
              <span className="text-xs text-slate-400">
                Rule-Based Delay Signals
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              SLA Risk & Delay Monitoring Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Transparent, explainable signals identifying stage velocity bottlenecks before statutory deadlines are breached.
            </p>
          </div>

          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700 text-xs self-start sm:self-auto">
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                riskFilter === 'ALL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All At Risk ({slaRisks.length})
            </button>
            <button
              onClick={() => setRiskFilter('HIGH')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                riskFilter === 'HIGH'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              High Delay ({slaRisks.filter((r) => r.risk_level === 'HIGH').length})
            </button>
            <button
              onClick={() => setRiskFilter('MEDIUM')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                riskFilter === 'MEDIUM'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Near SLA ({slaRisks.filter((r) => r.risk_level === 'MEDIUM').length})
            </button>
          </div>
        </div>

        {/* Explainable Signals Principle Banner */}
        <div className="bg-rose-950/60 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>
            <strong>Explainable Signal Methodology:</strong> Delay risks are triggered strictly by transparent indicators: (1) Hold time exceeding stage thresholds, (2) Missing mandatory documents, (3) Unscheduled mandatory inspections, or (4) Active statutory deadline proximity.
          </span>
        </div>
      </div>

      {/* Risk Queue Cards */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Evaluating delay risk signals...
        </div>
      ) : filteredRisks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">All applications progressing within SLA.</h3>
          <p className="text-xs text-slate-400">No applications currently flag hold-time or documentation delay risks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRisks.map((item) => (
            <div
              key={item.application_id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 ${
                item.risk_level === 'HIGH'
                  ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/10'
                  : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                      {item.application_number}
                    </span>
                    <RiskBadge level={item.risk_level} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">
                    {item.approval_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applicant: <strong className="text-slate-700 dark:text-slate-300">{item.business_name}</strong> ({item.industry})
                  </p>
                </div>

                <div className="text-right self-start sm:self-auto bg-slate-50 dark:bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Stage Hold Time</span>
                  <strong className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
                    {item.days_in_current_stage} Days in {item.current_stage}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">
                    (Standard SLA: {item.configured_sla_days} days)
                  </span>
                </div>
              </div>

              {/* Section 15 & 24: SHOW WHY IT WAS FLAGGED (Diagnostic Reasons) */}
              <div className="bg-rose-50/70 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-200/70 dark:border-rose-900/50 space-y-2">
                <span className="font-bold text-xs text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Identified Delay Reasons & Signals:
                </span>
                <ul className="list-disc pl-6 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  {item.reasons.map((reason, rIdx) => (
                    <li key={rIdx}>{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Administrative Mitigation Recommendation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <strong className="text-slate-900 dark:text-white block font-bold">
                  Recommended Administrative Mitigation:
                </strong>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.suggested_mitigation}
                </p>
              </div>

              {/* Action */}
              <div className="pt-2 flex justify-end">
                <Link
                  to={`/applications/${item.application_id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  Review Dossier & Take Action <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
