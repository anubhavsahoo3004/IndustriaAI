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
  HelpCircle,
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
    { to: '/approvals', label: 'Approval Plan', icon: Compass },
    { to: '/applications', label: 'Applications', icon: FileCheck2 },
    { to: '/documents', label: 'Documents & Checks', icon: FolderOpen },
    { to: '/inspections', label: 'Inspections', icon: CalendarCheck },
    { to: '/compliance', label: 'Compliance Calendar', icon: ClipboardList },
    { to: '/schemes', label: 'Support & Subsidies', icon: Gift },
    { to: '/notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { to: '/ai-assistant', label: 'Compliance Assistant', icon: HelpCircle },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Directorate Analytics', icon: BarChart3 },
    { to: '/admin/applications', label: 'Scrutiny & Review', icon: FileCheck2 },
    { to: '/admin/sla-risk', label: 'SLA Delay Queue', icon: ShieldAlert },
    { to: '/admin/inspections', label: 'Inspection Dispatch', icon: CalendarDays },
    { to: '/audit-logs', label: 'Audit Trail Logs', icon: History },
  ];

  const isStaff = user?.role === 'admin' || user?.role === 'officer';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between min-h-[calc(100vh-80px)] p-3 border-r border-slate-800 select-none">
      <div className="space-y-5">
        {/* Applicant Section */}
        {!isStaff && (
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Applicant Portal
            </div>
            <nav className="space-y-0.5">
              {applicantLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{link.label}</span>
                    </div>
                    {link.count !== undefined && link.count > 0 && (
                      <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-semibold">
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
              <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Department Desk</span>
                <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded font-mono">
                  {user?.role === 'admin' ? 'Directorate Desk' : 'Officer Desk'}
                </span>
              </div>
              <nav className="space-y-0.5">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-slate-800 text-white font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{link.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Enterprise Oversight
              </div>
              <nav className="space-y-0.5">
                {[
                  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { to: '/business/profile', label: 'Business Profile', icon: Building },
                  { to: '/approvals', label: 'Approval Plan', icon: Compass },
                  { to: '/applications', label: 'Applications', icon: FileCheck2 },
                  { to: '/documents', label: 'Documents & Checks', icon: FolderOpen },
                  { to: '/inspections', label: 'Inspections', icon: CalendarCheck },
                  { to: '/ai-assistant', label: 'Compliance Assistant', icon: HelpCircle },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-slate-800 text-white font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
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
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-0.5">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Rules Engine Online
          </span>
          <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Smart India Hackathon 2026 • PS 26130
        </p>
      </div>
    </aside>
  );
};
