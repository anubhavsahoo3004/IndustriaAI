import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Briefcase, Shield, UserCheck, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('officer')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      if (demoEmail === 'admin@industria.ai' || demoEmail === 'officer@industria.ai') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-slate-900 text-sm">
            INDUSTRIAAI <span className="font-normal text-slate-500">Navigator</span>
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            • Maharashtra Industrial Approvals & Compliance
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded font-mono">
            Smart India Hackathon 2026 • PS 26130
          </span>
        </div>
      </div>

      {/* Main Login Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Product Value Prop */}
          <div className="lg:col-span-6 space-y-5 lg:pr-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                Smart India Hackathon 2026 • PS 26130
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2.5">
                Industrial Approval & Compliance Navigator
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Manage approvals, documents, inspections and compliance requirements from one workspace.
              </p>
            </div>

            {/* Operational features list */}
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Deterministic statutory rules engine mapped to Maharashtra industrial acts</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Automated document verification and business profile consistency checks</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Transparent SLA delay risk monitoring and administrative bottleneck detection</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Contextual compliance assistant citing actual regulatory department records</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block">Single Window Operational Scope:</span>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Covers statutory clearances from Maharashtra Pollution Control Board (MPCB), Food & Drug Administration (FDA), Directorate of Industrial Safety & Health (DISH), MSEDCL, and MIDC.
              </p>
            </div>
          </div>

          {/* Right: Auth Card with Selectable Rectangular Personas */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sign In to Workspace</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a demonstration persona below or authenticate with registered credentials.
              </p>
            </div>

            {/* 1-Click Selectable Rectangular Persona Rows */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Select Persona (Instant Demo Access):
              </p>

              <button
                type="button"
                onClick={() => handleDemoLogin('applicant@industria.ai')}
                disabled={loading}
                className="w-full text-left p-3 rounded-md border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-100 text-slate-700">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Applicant</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                        Enterprise
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Rajesh Kulkarni • Maharashtra Fresh Foods Pvt. Ltd.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@industria.ai')}
                disabled={loading}
                className="w-full text-left p-3 rounded-md border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-100 text-slate-700">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Department Admin</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                        State Directorate
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dr. Sunita Deshmukh • Cross-departmental SLA & bottleneck oversight
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('officer@industria.ai')}
                disabled={loading}
                className="w-full text-left p-3 rounded-md border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-100 text-slate-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Field Inspection Officer</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                        Pune Region Desk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sanjay Patil • MPCB & DISH field scrutiny & inspection verification
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>
            </div>

            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                Or Sign In with Email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* Credentials form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="applicant@industria.ai"
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white px-6 py-2.5 text-center text-xs text-slate-500">
        IndustriaAI Industrial Approval & Compliance Navigator • Smart India Hackathon 2026 Prototype • State Focus: Maharashtra
      </div>
    </div>
  );
};
