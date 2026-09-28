import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Clock,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApprovalService } from '../services/approval.service';
import { ApplicationService } from '../services/application.service';
import { ApprovalPlanResponse, ApprovalPlanItem } from '../types';

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
      <div className="flex items-center justify-center min-h-[360px]">
        <div className="text-center space-y-2.5">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Statutory Clearance Roadmap
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded">
              {items.length} Required Approvals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential compliance workflow tailored to {activeBusiness?.name} ({activeBusiness?.industry} • {activeBusiness?.district}, Maharashtra).
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Clearances' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search approvals or authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
          />
        </div>
      </div>

      {/* Structured Sequential Workflow */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-6 space-y-2">
            <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-slate-700">No clearances match your filter.</h3>
            <p className="text-[11px] text-slate-500">Reset category filter or search terms.</p>
          </div>
        ) : (
          <div className="relative pl-7 sm:pl-9">
            {/* Connected vertical workflow line */}
            <div className="absolute left-[13px] sm:left-[17px] top-3 bottom-3 w-0.5 bg-slate-200" />

            <div className="space-y-4">
              {filteredItems.map((item, idx) => {
                const stepNum = idx + 1;
                return (
                  <div key={item.approval_type_id} className="relative">
                    {/* Step Node */}
                    <div className="absolute -left-[27px] sm:-left-[35px] top-3 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-300 bg-white text-slate-700 font-bold text-xs">
                      {stepNum}
                    </div>

                    {/* Step Card */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              Step {stepNum} • {item.category}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {item.issuing_authority}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {item.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {item.standard_sla_days} Days SLA
                          </span>

                          <button
                            onClick={() => handleInitiateApplication(item.approval_type_id)}
                            disabled={creatingAppId === item.approval_type_id}
                            className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          >
                            {creatingAppId === item.approval_type_id ? 'Initiating...' : 'Initiate Application'}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Statutory Reason & Checklist */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                        <div className="md:col-span-6 space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                            Statutory Applicability
                          </span>
                          <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                            {item.why_it_applies}
                          </p>
                        </div>

                        <div className="md:col-span-6 space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                            Mandatory Document Checklist ({(item.required_documents || []).length})
                          </span>
                          <ul className="space-y-1 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                            {(item.required_documents || []).map((doc, docIdx) => (
                              <li key={docIdx} className="flex items-start gap-1.5">
                                <span className="text-slate-400">•</span>
                                <span>{typeof doc === 'string' ? doc : (doc.name || doc.doc_type)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
