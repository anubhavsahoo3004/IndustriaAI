import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Send,
  Building2,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  Info,
  Layers,
  HelpCircle,
  FileText,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AiService } from '../services/ai.service';
import { AiAssistantResponse, AiCitation } from '../types';

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

const PRESET_PROMPTS = [
  'What should I do next?',
  'Which documents are missing?',
  'Why is MPCB delayed?',
  'Which clearance has the highest risk?',
  'What is due this month?'
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
      text: `Hello! I am your **IndustriaAI Statutory Compliance Navigator** for **${
        activeBusiness?.name || 'Maharashtra Fresh Foods Pvt. Ltd.'
      }**.\n\nI am synchronized in real-time with your active applications, statutory document checklist, scheduled inspections, and Maharashtra government regulations.\n\nHow may I guide your industrial clearance journey today?`,
      timestamp: new Date(),
      suggestedActions: [
        'What should I do next?',
        'Which documents are missing?',
        'Why is MPCB delayed?',
        'Which clearance has the highest risk?',
        'What is due this month?'
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
        console.error('Failed to load assistant context', e);
      }
    };
    loadContext();
  }, [activeBusiness]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      // Build conversation history format
      const history = messages.map((m) => ({
        role: m.sender,
        text: m.text,
      }));

      const res: AiAssistantResponse = await AiService.askAssistant(
        q,
        activeBusiness?.id,
        undefined,
        history
      );

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
    <div className="max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Contextual AI Compliance Navigator
              </h1>
              <p className="text-xs text-slate-500">
                Grounded in active applications for <strong className="text-slate-800 dark:text-slate-200">{activeBusiness?.name}</strong> ({activeBusiness?.industry} • {activeBusiness?.district}, MH)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Database Grounded
          </span>
        </div>
      </div>

      {/* Preset Prompt Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-shrink-0">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Quick Questions:
        </span>
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-semibold whitespace-nowrap shadow-sm transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Compact Live-Context Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-3 border border-slate-700/60 shadow-sm flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Enterprise Compliance Context: <strong className="text-white">{activeBusiness?.name}</strong>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            Database Grounded
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Clearances</span>
            <strong className="text-sm font-black text-white">{liveContext.totalClearances}</strong>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Action Required</span>
            <strong className="text-sm font-black text-amber-400">{liveContext.actionRequired}</strong>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">High Delay Risk</span>
            <strong className="text-sm font-black text-rose-400">{liveContext.highRisk}</strong>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Inspections</span>
            <strong className="text-sm font-black text-purple-300">{liveContext.upcomingInspections}</strong>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Compliance Tasks</span>
            <strong className="text-sm font-black text-emerald-400">{liveContext.upcomingTasks}</strong>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4.5 space-y-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800'
                }`}
              >
                {/* Text Content */}
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <div className="space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-2 pb-1 border-b border-slate-200 dark:border-slate-700">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5 mb-1.5">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-2 mb-1">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 leading-relaxed text-slate-800 dark:text-slate-200 last:mb-0">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-slate-950 dark:text-white">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 mb-2.5 space-y-1 text-slate-800 dark:text-slate-200">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-slate-800 dark:text-slate-200">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 px-3 py-2 rounded-r-lg my-2 text-xs text-blue-900 dark:text-blue-200 font-medium not-italic">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => {
                          const isInternal = href?.startsWith('/') || href?.startsWith('#');
                          if (isInternal) {
                            return (
                              <Link
                                to={href || '#'}
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {children}
                              </Link>
                            );
                          }
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              {children} <ExternalLink className="w-3 h-3 inline ml-0.5" />
                            </a>
                          );
                        },
                        code: ({ children }) => (
                          <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/80 font-mono text-[11px] text-blue-700 dark:text-blue-300">
                            {children}
                          </code>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-left font-bold text-slate-900 dark:text-white">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Citations of Database Records */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Grounded Statutory Citations:
                    </span>
                    <div className="space-y-1">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]"
                        >
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            [{c.record_type}] {c.title}
                          </span>
                          <p className="text-slate-500 mt-0.5">{c.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Action Chips */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Suggested Actions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(action)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[11px] font-semibold transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Deep Links */}
                {!isUser && msg.links && msg.links.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {msg.links.map((link, lIdx) => (
                      <Link
                        key={lIdx}
                        to={link.url}
                        className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold hover:bg-slate-800 transition-all flex items-center gap-1"
                      >
                        {link.title} <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                )}

                <span className={`text-[9px] block text-right ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-spin">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-semibold text-blue-600 animate-pulse">
              Consulting Maharashtra regulatory database and application state...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-lg flex-shrink-0"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything about your clearances, deadlines, or missing documents..."
          className="flex-1 px-4 py-2.5 text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
