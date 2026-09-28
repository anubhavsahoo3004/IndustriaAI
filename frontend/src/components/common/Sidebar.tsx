import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  Compass,
  FileCheck2,
  FolderOpen,
  CalendarCheck,
  ClipboardList,
  Gift,
  Bell,
  Sparkles,
  BarChart3,
  ShieldAlert,
  CalendarDays,
  History
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const applicantLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/business/profile', label: 'Business Profile', icon: Building },
    { to: '/approvals', label: 'Approval Plan', icon: Compass, badge: 'Smart' },
    { to: '/applications', label: 'Applications', icon: FileCheck2 },
    { to: '/documents', label: 'Documents & Checks', icon: FolderOpen },
    { to: '/inspections', label: 'Inspections', icon: CalendarCheck },
    { to: '/compliance', label: 'Compliance Calendar', icon: ClipboardList },
    { to: '/schemes', label: 'Support & Subsidies', icon: Gift },
    { to: '/notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, highlight: true },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Analytics', icon: BarChart3 },
    { to: '/admin/applications', label: 'Scrutiny & Review', icon: FileCheck2 },
    { to: '/admin/sla-risk', label: 'SLA Delay Queue', icon: ShieldAlert, alert: true },
    { to: '/admin/inspections', label: 'Inspection Dispatch', icon: CalendarDays },
    { to: '/audit-logs', label: 'Audit Trail Logs', icon: History },
  ];

  const isStaff = user?.role === 'admin' || user?.role === 'officer';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between min-h-[calc(100vh-80px)] p-4 border-r border-slate-800 select-none">
      <div className="space-y-6">
        {/* Applicant-only view: Strict applicant enterprise navigation */}
        {!isStaff && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Applicant Portal
            </div>
            <nav className="space-y-1">
              {applicantLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : link.highlight
                          ? 'bg-gradient-to-r from-blue-950/40 to-indigo-950/40 text-blue-300 border border-blue-800/40 hover:bg-blue-900/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold">
                        {link.badge}
                      </span>
                    )}
                    {link.count !== undefined && link.count > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-black">
                        {link.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Administration Section: ONLY rendered for Admin / Officer */}
        {isStaff && (
          <>
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-purple-400">
                <span>Department Control</span>
                <span className="text-[9px] bg-purple-950/60 border border-purple-800/60 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                  {user?.role === 'admin' ? 'Directorate Desk' : 'Officer Desk'}
                </span>
              </div>
              <nav className="space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" />
                        <span>{link.label}</span>
                      </div>
                      {link.alert && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div>
              <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Enterprise Oversight
              </div>
              <nav className="space-y-1">
                {[
                  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { to: '/business/profile', label: 'Business Profile', icon: Building },
                  { to: '/approvals', label: 'Approval Plan', icon: Compass },
                  { to: '/applications', label: 'Applications', icon: FileCheck2 },
                  { to: '/documents', label: 'Documents & Checks', icon: FolderOpen },
                  { to: '/inspections', label: 'Inspections', icon: CalendarCheck },
                  { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, highlight: true },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : link.highlight
                            ? 'bg-gradient-to-r from-blue-950/40 to-indigo-950/40 text-blue-300 border border-blue-800/40 hover:bg-blue-900/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        <span>{link.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </>
        )}
      </div>


      {/* System Status Footer */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Rules Engine Online
          </span>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Smart India Hackathon 2026 Prototype
        </p>
      </div>
    </aside>
  );
};
