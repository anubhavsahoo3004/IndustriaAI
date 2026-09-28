import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  ArrowRight,
  Info
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
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                SLA Compliance Engine
              </span>
              <span className="text-xs text-slate-500">
                Rule-Based Delay Signals
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              SLA Risk & Delay Monitoring Queue
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Transparent, explainable signals identifying stage velocity bottlenecks before statutory deadlines are breached.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs self-start sm:self-auto">
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                riskFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All At Risk ({slaRisks.length})
            </button>
            <button
              onClick={() => setRiskFilter('HIGH')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                riskFilter === 'HIGH'
                  ? 'bg-white text-rose-700 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Delay ({slaRisks.filter((r) => r.risk_level === 'HIGH').length})
            </button>
            <button
              onClick={() => setRiskFilter('MEDIUM')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                riskFilter === 'MEDIUM'
                  ? 'bg-white text-amber-700 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Near SLA ({slaRisks.filter((r) => r.risk_level === 'MEDIUM').length})
            </button>
          </div>
        </div>

        {/* Explainable Signals Methodology Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-700 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
          <span>
            <strong className="font-semibold text-slate-900">Explainable Signal Methodology:</strong> Delay risks are triggered strictly by transparent indicators: (1) Hold time exceeding stage thresholds, (2) Missing mandatory documents, (3) Unscheduled mandatory inspections, or (4) Active statutory deadline proximity.
          </span>
        </div>
      </div>

      {/* Risk Queue Cards */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Evaluating delay risk signals...
        </div>
      ) : filteredRisks.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-8 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">All applications progressing within SLA.</h3>
          <p className="text-xs text-slate-500">No applications currently flag hold-time or documentation delay risks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRisks.map((item) => (
            <div
              key={item.application_id}
              className={`bg-white border rounded-lg p-5 shadow-xs space-y-4 ${
                item.risk_level === 'HIGH'
                  ? 'border-l-4 border-l-rose-600 border-slate-200'
                  : 'border-l-4 border-l-amber-500 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.application_number}
                    </span>
                    <RiskBadge level={item.risk_level} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">
                    {item.approval_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applicant: <strong className="text-slate-800 font-medium">{item.business_name}</strong> ({item.industry})
                  </p>
                </div>

                <div className="text-right self-start sm:self-auto bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Stage Hold Time</span>
                  <strong className="text-xs font-bold font-mono text-slate-900">
                    {item.days_in_current_stage} Days in {item.current_stage}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    (Standard SLA: {item.configured_sla_days} days)
                  </span>
                </div>
              </div>

              {/* Show Identified Delay Reasons */}
              <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 space-y-1.5">
                <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Identified Delay Reasons & Signals:
                </span>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-0.5">
                  {item.reasons.map((reason, rIdx) => (
                    <li key={rIdx}>{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Administrative Mitigation Recommendation */}
              <div className="p-3 rounded-md bg-white border border-slate-200 text-xs space-y-1">
                <strong className="text-slate-900 block font-semibold">
                  Recommended Administrative Mitigation:
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  {item.suggested_mitigation}
                </p>
              </div>

              {/* Action */}
              <div className="pt-1 flex justify-end">
                <Link
                  to={`/applications/${item.application_id}`}
                  className="px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
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
