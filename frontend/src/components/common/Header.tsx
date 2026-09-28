import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  Layers,
  Sparkles,
  CheckCheck,
  UserCheck
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const Header: React.FC = () => {
  const { user, activeBusiness, businesses, setActiveBusiness, switchDemoRole, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Government Sub-bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-white">Government of Maharashtra</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            Single Window Industrial Approvals & Compliance Portal (SIH26130)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-medium">
            {user?.role === 'applicant'
              ? 'Applicant Enterprise Workspace'
              : user?.role === 'officer'
              ? 'Department Scrutiny & Field Desk'
              : 'State Directorate Oversight Desk'}
          </span>
          <span className="bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
            MAHARASHTRA REGION
          </span>
        </div>
      </div>


      {/* Main Navigation Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo & Product Identity */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  INDUSTRIA<span className="text-blue-600">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  Navigator
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Intelligent Industrial Approval & Compliance Engine
              </p>
            </div>
          </Link>

          {/* Active Business Switcher */}
          {user?.role === 'applicant' && businesses.length > 0 && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowBizDropdown(!showBizDropdown)}
                title={activeBusiness ? `${activeBusiness.name} • ${activeBusiness.industry} (${activeBusiness.district}, MH)` : 'Select Business Profile'}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors group cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate max-w-[220px] lg:max-w-[320px] font-bold" title={activeBusiness?.name}>
                  {activeBusiness?.name || 'Select Business'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </button>

              {showBizDropdown && (
                <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Registered Enterprises</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-normal">Active Selection</span>
                  </div>
                  {businesses.map((biz) => (
                    <button
                      key={biz.id}
                      title={`Switch active context to ${biz.name}`}
                      onClick={() => {
                        setActiveBusiness(biz);
                        setShowBizDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs flex flex-col gap-0.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 ${
                        activeBusiness?.id === biz.id ? 'bg-blue-50/60 dark:bg-blue-950/30 text-blue-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white break-words">{biz.name}</span>
                        {activeBusiness?.id === biz.id && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {biz.industry} • {biz.district}, Maharashtra
                      </span>
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                    <Link
                      to="/business/profile"
                      onClick={() => setShowBizDropdown(false)}
                      className="block text-center text-xs text-blue-600 font-semibold hover:underline py-1"
                    >
                      + Manage / Add Business Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Tools: Staff Department Controls + AI CTA + Notifications + User */}
        <div className="flex items-center gap-3">
          {/* Department Desk & Officer Switcher: ONLY for Staff (Admin/Officer), never shown to Applicants */}
          {user?.role !== 'applicant' && (
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 text-purple-300 border border-purple-800/60 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span className="max-w-[200px] truncate">
                  {user?.department || (user?.role === 'admin' ? 'Directorate Desk' : 'Field Scrutiny Desk')}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => switchDemoRole('admin')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    user?.role === 'admin'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>
                <button
                  onClick={() => switchDemoRole('officer')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    user?.role === 'officer'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Officer
                </button>
              </div>
            </div>
          )}


          {/* AI Assistant Quick Link */}
          <Link
            to="/ai-assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">AI Compliance Assistant</span>
          </Link>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-3 z-50">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No notifications.</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.action_link) {
                            navigate(n.action_link);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                          !n.is_read ? 'bg-blue-50/40 dark:bg-blue-950/20 font-medium' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.full_name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 dark:bg-slate-800 uppercase">
                    Role: {user?.role}
                  </span>
                </div>

                {user?.role !== 'applicant' && (
                  <Link
                    to="/audit-logs"
                    onClick={() => setShowUserDropdown(false)}
                    className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    System Audit Logs
                  </Link>
                )}


                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
