import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Bell,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  HelpCircle,
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Top Government Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 sm:px-6 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-white">Government of Maharashtra</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 hidden sm:inline">
            Single Window Industrial Approvals & Compliance Portal (SIH 2026 • PS 26130)
          </span>
          <span className="text-slate-300 sm:hidden">
            Single Window Portal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-medium text-[11px] hidden md:inline">
            {user?.role === 'applicant'
              ? 'Applicant Enterprise Workspace'
              : user?.role === 'officer'
              ? 'Department Scrutiny & Field Desk'
              : 'State Directorate Oversight Desk'}
          </span>
          <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
            MAHARASHTRA REGION
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Logo & Product Identity */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  INDUSTRIAAI
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-300">
                  Navigator
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Industrial Approval & Compliance System
              </p>
            </div>
          </Link>

          {/* Active Business Switcher */}
          {user?.role === 'applicant' && businesses.length > 0 && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowBizDropdown(!showBizDropdown)}
                title={activeBusiness ? `${activeBusiness.name} • ${activeBusiness.industry} (${activeBusiness.district}, MH)` : 'Select Business Profile'}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <span className="truncate max-w-[220px] lg:max-w-[300px] font-semibold" title={activeBusiness?.name}>
                  {activeBusiness?.name || 'Select Business'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              </button>

              {showBizDropdown && (
                <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Registered Enterprises</span>
                    <span className="text-slate-600 font-mono">Active Selection</span>
                  </div>
                  {businesses.map((biz) => (
                    <button
                      key={biz.id}
                      title={`Switch active context to ${biz.name}`}
                      onClick={() => {
                        setActiveBusiness(biz);
                        setShowBizDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                        activeBusiness?.id === biz.id ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 break-words">{biz.name}</span>
                        {activeBusiness?.id === biz.id && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {biz.industry} • {biz.district}, Maharashtra
                      </span>
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-100 bg-slate-50">
                    <Link
                      to="/business/profile"
                      onClick={() => setShowBizDropdown(false)}
                      className="block text-center text-xs text-slate-700 font-medium hover:text-slate-900 hover:underline py-0.5"
                    >
                      + Manage / Add Business Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Tools: Staff Controls + Assistant CTA + Notifications + User */}
        <div className="flex items-center gap-2.5">
          {/* Department Desk & Officer Switcher: ONLY for Staff (Admin/Officer), never shown to Applicants */}
          {user?.role !== 'applicant' && (
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium">
                <Shield className="w-3.5 h-3.5 text-slate-600" />
                <span className="max-w-[180px] truncate">
                  {user?.department || (user?.role === 'admin' ? 'Directorate Desk' : 'Field Scrutiny Desk')}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-300 text-xs">
                <button
                  onClick={() => switchDemoRole('admin')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                    user?.role === 'admin'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  Admin
                </button>
                <button
                  onClick={() => switchDemoRole('officer')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                    user?.role === 'officer'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  Officer
                </button>
              </div>
            </div>
          )}

          {/* Assistant Link */}
          <Link
            to="/ai-assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Compliance Assistant</span>
          </Link>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
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
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          !n.is_read ? 'bg-slate-50 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-700 hover:text-slate-900 font-semibold hover:underline"
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
              className="flex items-center gap-2 p-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.full_name}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    Role: {user?.role}
                  </span>
                </div>

                {user?.role !== 'applicant' && (
                  <Link
                    to="/audit-logs"
                    onClick={() => setShowUserDropdown(false)}
                    className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
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
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
