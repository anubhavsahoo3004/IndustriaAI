import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Shield, Briefcase, UserCheck, ArrowRight, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
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
      navigate('/dashboard');
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
      if (demoEmail === 'admin@industria.ai') {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">
            INDUSTRIA<span className="text-blue-500">AI</span>
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            • Maharashtra Industrial Approval Navigator (SIH26130)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded font-mono">
            LIVE DEMO ENVIRONMENT
          </span>
        </div>
      </div>

      {/* Main Login Area */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Product Value Prop */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Smart India Hackathon SIH26130 Prototype
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Personalized Industrial <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Approval Intelligence</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Transforming complex Maharashtra regulatory compliance into an automated, transparent, and proactive action roadmap for entrepreneurs and industries.
            </p>

            {/* Key feature pills */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Deterministic rules engine tailored to Maharashtra industrial laws</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>AI Document completeness checks & profile consistency analysis</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Explainable SLA Delay Risk engine with administrative bottleneck detection</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Grounded contextual AI assistant citing actual regulatory records</span>
              </div>
            </div>
          </div>

          {/* Right: Auth Card with 1-Click Demo Accounts */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Sign In to Workspace</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select a demo persona for instant access or enter credentials below.
              </p>
            </div>

            {/* 1-Click Demo Persona Cards */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant 1-Click Demo Personas:
              </p>

              <button
                type="button"
                onClick={() => handleDemoLogin('applicant@industria.ai')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl border border-blue-800/60 bg-blue-950/30 hover:bg-blue-950/60 hover:border-blue-600 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Applicant Persona</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">Primary Demo</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Rajesh Kulkarni • Maharashtra Fresh Foods Pvt. Ltd. (Food Processing)
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@industria.ai')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl border border-purple-800/60 bg-purple-950/30 hover:bg-purple-950/60 hover:border-purple-600 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-600 text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Department Admin Persona</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">Govt Directorate</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Dr. Sunita Deshmukh • Full analytics, SLA bottlenecks & approvals
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('officer@industria.ai')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-700 text-white">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Field Inspection Officer</span>
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">Pune Region</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Sanjay Patil • MPCB & DISH Field Scrutiny Officer
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Or Sign In with Email</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Credentials form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="applicant@industria.ai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-colors disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/80 bg-slate-900/40 px-6 py-3 text-center text-xs text-slate-500">
        IndustriaAI Intelligent Industrial Approval & Compliance Navigator • SIH26130 Hackathon Prototype • State Focus: Maharashtra
      </div>
    </div>
  );
};
