import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  FileCheck2,
  AlertCircle,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApprovalService } from '../services/approval.service';
import { ApplicationService } from '../services/application.service';
import { ApprovalPlanResponse, ApprovalPlanItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const ApprovalPlanPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<ApprovalPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingAppId, setCreatingAppId] = useState<number | null>(null);

  const fetchPlan = async () => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await ApprovalService.generatePlan(activeBusiness.id);
      setPlan(data);
    } catch (err) {
      console.error('Failed to load approval plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [activeBusiness]);

  const handleInitiateApplication = async (approvalTypeId: number) => {
    if (!activeBusiness) return;
    setCreatingAppId(approvalTypeId);
    try {
      const app = await ApplicationService.create(activeBusiness.id, approvalTypeId);
      navigate(`/applications/${app.id}`);
    } catch (err) {
      console.error('Failed to initiate application:', err);
    } finally {
      setCreatingAppId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">
            Evaluating Maharashtra Statutory Rule Engines...
          </p>
        </div>
      </div>
    );
  }

  const items = plan?.items || [];
  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.issuing_authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.why_it_applies.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Strategic Intelligence Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/40 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Personalized Approval Intelligence
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Maharashtra State Jurisdiction
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Statutory Clearance Action Plan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Custom-generated roadmap for <strong className="text-white">{plan?.business_name}</strong> ({plan?.industry} • {plan?.location})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-assistant"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              Ask AI About Requirements
            </Link>
          </div>
        </div>

        {/* AI Strategic Summary Banner */}
        {plan?.ai_strategic_summary && (
          <div className="bg-blue-950/60 border border-blue-700/50 rounded-xl p-4 text-xs text-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {plan.ai_strategic_summary}
            </p>
          </div>
        )}

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Statutory Clearances:</span>
            <span className="text-lg font-black text-white">{plan?.total_recommended_approvals}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Safety & Environmental:</span>
            <span className="text-lg font-black text-amber-400">{plan?.critical_environmental_approvals}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Licensing & Operational:</span>
            <span className="text-lg font-black text-emerald-400">{plan?.operational_licensing_approvals}</span>
          </div>
        </div>
      </div>

      {/* Statutory Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Regulatory Notice & Legal Disclaimer:</strong> IndustriaAI provides indicative statutory intelligence and procedural workflow tracking under Smart India Hackathon Problem Statement SIH26130. <em>This platform does not issue legal approval decisions, certifications, or formal administrative sanctions.</em> All actual applications remain subject to official scrutiny by the designated department officers and applicable Maharashtra state statutory rules.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clearances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Approvals Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const isStarted = item.status !== 'NOT_STARTED';
          const isCompleted = item.status === 'APPROVED' || item.status === 'COMPLETED';

          return (
            <div
              key={item.code}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                isCompleted
                  ? 'border-emerald-200 dark:border-emerald-950 bg-emerald-50/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-4">
                {/* Top: Category, Verification Status & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                        {item.category}
                      </span>
                      {item.verification_status === 'VERIFIED' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Statutory Rule
                        </span>
                      ) : item.verification_status === 'NEEDS_VERIFICATION' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Needs Verification
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                          <Info className="w-3 h-3 text-slate-500" />
                          Prototype Demo Rule
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {item.issuing_authority}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                {/* Section: WHY IT APPLIES (Core Differentiator) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Why It Applies to Your Business:
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.why_it_applies}
                  </p>
                  {item.legal_act_reference && (
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/40">
                      <span>Statutory Basis: <strong className="text-slate-700 dark:text-slate-300">{item.legal_act_reference}</strong></span>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-semibold"
                        >
                          Official Portal <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Section: SLA, Inspection & Renewal Parameters */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/40">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Standard SLA</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{item.standard_sla_days} Days</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/40">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Site Inspection</span>
                    <strong className={item.inspection_required ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500'}>
                      {item.inspection_required ? 'Mandatory' : 'Exempted'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/40">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Validity / Renewal</span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {item.renewal_frequency_years === 0 ? 'Permanent' : `Every ${item.renewal_frequency_years} Yr`}
                    </strong>
                  </div>
                </div>

                {/* Section: Required Documents Manifest */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Required Documents Checklist ({item.required_documents.length}):
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {item.required_documents.map((doc, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <span className="flex-1">
                          {doc.name}
                          {doc.mandatory && (
                            <span className="text-[10px] text-rose-500 font-bold ml-1.5">*Mandatory</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                  <strong>Next Action:</strong> {item.next_action}
                </div>

                {item.existing_application_id ? (
                  <Link
                    to={`/applications/${item.existing_application_id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    Open Application <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleInitiateApplication(item.approval_type_id)}
                    disabled={creatingAppId === item.approval_type_id}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {creatingAppId === item.approval_type_id ? 'Initiating...' : 'Initiate Application'} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
