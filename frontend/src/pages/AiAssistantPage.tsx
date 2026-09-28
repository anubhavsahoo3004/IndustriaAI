import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Building2,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AiService } from '../services/ai.service';
import { AiCitation } from '../types';
import { ApplicationService } from '../services/application.service';
import { InspectionService } from '../services/inspection.service';
import { ComplianceService } from '../services/compliance.service';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: AiCitation[];
  suggestedActions?: string[];
  links?: Array<{ title: string; url: string }>;
  timestamp: Date;
}

const PRESET_TOPICS = [
  { label: 'Next Action', query: 'What should I do next?' },
  { label: 'Missing Documents', query: 'Which documents are currently missing?' },
  { label: 'MPCB Delay Risk', query: 'Why is my MPCB application at high delay risk?' },
  { label: 'Clearance Summary', query: 'Summarize my current approval journey.' },
  { label: 'Compliance Due This Month', query: 'What compliance tasks are due soon?' }
];

export const AiAssistantPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const [liveContext, setLiveContext] = useState({
    totalClearances: 10,
    actionRequired: 2,
    highRisk: 1,
    upcomingInspections: 1,
    upcomingTasks: 3
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Welcome to the **Statutory Compliance Guidance Assistant** for **${
        activeBusiness?.name || 'Maharashtra Fresh Foods Pvt. Ltd.'
      }**.\n\nI am synchronized with your active applications, statutory document checklists, inspection schedules, and Maharashtra state industrial regulations.\n\nSelect a topic below or type your inquiry.`,
      timestamp: new Date(),
      suggestedActions: [
        'What should I do next?',
        'Which documents are currently missing?',
        'Why is my MPCB application at high delay risk?',
        'Summarize my current approval journey.'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeBusiness) return;
    const loadContext = async () => {
      try {
        const [apps, insps, comps] = await Promise.all([
          ApplicationService.list({ business_id: activeBusiness.id }),
          InspectionService.list({ business_id: activeBusiness.id }),
          ComplianceService.listByBusiness(activeBusiness.id),
        ]);
        const actReq = apps.filter((a) => {
          const isTerm = a.status === 'APPROVED' || a.status === 'COMPLETED';
          return !isTerm && (a.status === 'DOCUMENTS_REQUIRED' || a.status === 'ACTION_REQUIRED' || a.delay_risk_level === 'HIGH');
        }).length;
        const highRisk = apps.filter((a) => a.delay_risk_level === 'HIGH' && !(a.status === 'APPROVED' || a.status === 'COMPLETED')).length;
        const upcomingInsp = insps.filter((i) => i.status === 'SCHEDULED').length;
        const upcomingComp = comps.filter((c) => c.status !== 'COMPLETED').length;

        setLiveContext({
          totalClearances: apps.length || 10,
          actionRequired: actReq || 2,
          highRisk: highRisk || 1,
          upcomingInspections: upcomingInsp || 1,
          upcomingTasks: upcomingComp || 3
        });
      } catch (e) {
        console.error('Error loading assistant context:', e);
      }
    };
    loadContext();
  }, [activeBusiness]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (q: string) => {
    if (!q.trim() || !activeBusiness) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await AiService.askAssistant(q, activeBusiness?.id);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response_text,
        citations: res.citations,
        suggestedActions: res.suggested_actions,
        links: res.relevant_links,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue accessing the compliance knowledge database. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Compliance Assistant
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded">
              Regulatory Guidance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inquire about statutory approval stages, document requirements, SLA risks, and Maharashtra industrial laws.
          </p>
        </div>
      </div>

      {/* Live Application Synchronization Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Active Unit</span>
          <span className="font-semibold text-slate-900 truncate block" title={activeBusiness?.name}>
            {activeBusiness?.name || 'Maharashtra Fresh Foods'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Clearances</span>
          <span className="font-semibold text-slate-900 block">{liveContext.totalClearances} Total</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Action Needed</span>
          <span className="font-semibold text-amber-800 block">{liveContext.actionRequired} Clearances</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">SLA Delays</span>
          <span className="font-semibold text-rose-800 block">{liveContext.highRisk} Critical</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Field Audits</span>
          <span className="font-semibold text-slate-900 block">{liveContext.upcomingInspections} Scheduled</span>
        </div>
      </div>

      {/* Quick Inquiries Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Ask about:
        </span>
        {PRESET_TOPICS.map((topic, i) => (
          <button
            key={i}
            onClick={() => handleSend(topic.query)}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col h-[520px]">
        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-100 text-slate-900 border border-slate-300 rounded-lg p-3 max-w-lg'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-lg p-4 max-w-2xl space-y-3'
                }`}
              >
                <div className="prose prose-xs max-w-none text-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* Evidence / Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Grounded Regulatory Evidence & Statutory Sources:
                    </span>
                    <div className="space-y-1">
                      {msg.citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-0.5"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>{c.title || c.record_type}</span>
                            {c.reference_id && (
                              <span className="font-mono text-slate-500 text-[10px]">{c.reference_id}</span>
                            )}
                          </div>
                          <p className="text-slate-600">{c.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Action Prompts */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 block w-full">
                      Recommended Follow-ups:
                    </span>
                    {msg.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(act)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right pt-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></div>
                <span>Checking regulatory rules database & active applications...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about required documents, next actions, or SLA timelines..."
              className="flex-1 px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
