import React, { useState, useEffect } from 'react';
import {
  Gift,
  Building2,
  ExternalLink,
  Info,
  DollarSign,
  Landmark
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Industrial Incentives & Support Schemes
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded">
              Maharashtra State Policies
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated for <strong className="text-slate-800">{activeBusiness?.name}</strong> ({activeBusiness?.industry} • {activeBusiness?.district}, Maharashtra).
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('MATCHED')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              viewMode === 'MATCHED'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matched for Enterprise ({matches.length})
          </button>
          <button
            onClick={() => setViewMode('ALL')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              viewMode === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Policy Schemes ({allSchemes.length})
          </button>
        </div>
      </div>

      {/* Official Guidance Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Incentive schemes are administered under the <strong>Package Scheme of Incentives (PSI 2019)</strong> by the Directorate of Industries, Government of Maharashtra. Eligible units can apply through the official <strong>Maitri Single Window System</strong>.
        </p>
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading state support schemes...
        </div>
      ) : viewMode === 'MATCHED' ? (
        matches.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-6 space-y-2">
            <Gift className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-slate-700">No specific scheme matches found.</h3>
            <p className="text-[11px] text-slate-500">Explore all schemes to inspect broad MSME and sectoral incentives.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Scheme</th>
                    <th className="py-2.5 px-3">Nodal Department</th>
                    <th className="py-2.5 px-3">Eligibility Profile</th>
                    <th className="py-2.5 px-3">Potential Benefit</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matches.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block">
                          {item.scheme?.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {item.scheme?.category || 'Industrial Subsidy'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {item.scheme?.department || 'Directorate of Industries, Maharashtra'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs text-[11px]">
                        {item.match_reasons?.join(', ') || item.scheme?.basic_eligibility}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {item.estimated_benefit || item.scheme?.benefits_summary}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          Strong Profile Match
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={item.scheme?.source_url || 'https://maitri.mahaonline.gov.in'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                        >
                          Maitri Portal <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Scheme Name</th>
                  <th className="py-2.5 px-3">Nodal Agency</th>
                  <th className="py-2.5 px-3">Eligibility Summary</th>
                  <th className="py-2.5 px-3">Incentive Benefit</th>
                  <th className="py-2.5 px-3 text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSchemes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 block">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {s.department}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs text-[11px]">
                      {s.basic_eligibility}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {s.benefits_summary}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={s.source_url || 'https://maitri.mahaonline.gov.in'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                      >
                        Official Site <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
