import React, { useState, useEffect } from 'react';
import {
  Gift,
  Sparkles,
  CheckCircle2,
  Building2,
  ExternalLink,
  Info,
  DollarSign,
  Layers,
  ChevronRight,
  Landmark,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SchemeService } from '../services/scheme.service';
import { SchemeMatchItem, SupportSchemeItem } from '../types';

export const SchemesPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const [matches, setMatches] = useState<SchemeMatchItem[]>([]);
  const [allSchemes, setAllSchemes] = useState<SupportSchemeItem[]>([]);
  const [viewMode, setViewMode] = useState<'MATCHED' | 'ALL'>('MATCHED');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const [all, matched] = await Promise.all([
          SchemeService.listAll(),
          activeBusiness ? SchemeService.matchForBusiness(activeBusiness.id) : Promise.resolve([]),
        ]);
        setAllSchemes(all);
        setMatches(matched);
      } catch (err) {
        console.error('Failed to load support schemes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [activeBusiness]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Government Support & Incentive Intelligence
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Maharashtra State Policies
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Industrial Subsidies & Financial Grants
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Evaluated for <strong className="text-white">{activeBusiness?.name}</strong> ({activeBusiness?.industry} • {activeBusiness?.district}, MH)
            </p>
          </div>

          {/* Toggle View */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700 text-xs self-start sm:self-auto">
            <button
              onClick={() => setViewMode('MATCHED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'MATCHED'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Matched For You ({matches.length})
            </button>
            <button
              onClick={() => setViewMode('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'ALL'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Schemes ({allSchemes.length})
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-950/60 border border-purple-800/50 rounded-xl p-3 text-xs text-purple-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            Schemes are matched against your sector, investment scale (₹{activeBusiness?.investment_amount_inr || 24.5} Cr), and project stage. Applications are submitted via the <strong>Maitri Single Window System</strong>.
          </span>
        </div>
      </div>

      {/* Statutory Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Fiscal Incentive & Regulatory Notice:</strong> Subsidies and capital grants displayed are indicative policy calculations formulated under Smart India Hackathon Problem Statement SIH26130. <em>IndustriaAI does not grant financial subsidies or issue official disbursement approvals.</em> All formal grant claims must be filed through the Directorate of Industries or MAIDC via the official Maitri Single Window portal.
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Evaluating subsidy policies...
        </div>
      ) : viewMode === 'MATCHED' ? (
        /* Matched Schemes List */
        <div className="space-y-4">
          {matches.map((item) => (
            <div
              key={item.scheme.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-mono">
                      {item.scheme.category}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {item.match_score}% Profile Match
                    </span>
                    {item.scheme.verification_status === 'VERIFIED' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified State Policy
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                        <Info className="w-3 h-3 text-slate-500" />
                        Prototype Demo
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1.5">
                    {item.scheme.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Department: <strong className="text-slate-700 dark:text-slate-300">{item.scheme.department}</strong>
                  </p>
                </div>

                <div className="text-right self-start sm:self-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Channel</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {item.scheme.application_mode}
                  </span>
                </div>
              </div>

              {/* Matching reasons pill */}
              <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/40 text-xs space-y-1.5">
                <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  Why This Scheme Matches Your Business:
                </span>
                <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-0.5">
                  {item.match_reasons.map((r, rIdx) => (
                    <li key={rIdx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Financial Benefits & Eligibility Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <strong className="text-slate-900 dark:text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Financial Benefits & Capital Subsidies:
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.scheme.financial_incentive_details}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <strong className="text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Eligibility Criteria:
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.scheme.basic_eligibility}
                  </p>
                </div>
              </div>

              {/* Bottom Next Step */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-500">
                  <strong>Recommended Next Step:</strong> {item.next_step}
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Source: <strong className="text-slate-600 dark:text-slate-300">{item.scheme.source_reference}</strong>
                    {item.scheme.last_verified_date && (
                      <span className="ml-2 font-mono text-emerald-600 dark:text-emerald-400">• Audited: {item.scheme.last_verified_date}</span>
                    )}
                  </span>
                </div>

                <a
                  href="https://maitri.mahaonline.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                >
                  Apply via Maitri Single Window <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* All Schemes List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-mono">
                  {scheme.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {scheme.name}
                </h3>
                <p className="text-xs text-blue-600 font-medium">
                  {scheme.department}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {scheme.benefits_summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Investment: ₹{scheme.investment_range_min} - ₹{scheme.investment_range_max} Cr</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{scheme.application_mode}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
