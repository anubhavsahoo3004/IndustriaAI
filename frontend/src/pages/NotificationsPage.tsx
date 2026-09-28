import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CalendarCheck,
  ShieldAlert,
  AlertTriangle,
  Gift,
  CheckCircle2,
  Info,
  ChevronRight
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationItem } from '../types';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'INSPECTION':
        return <CalendarCheck className="w-4 h-4 text-slate-700" />;
      case 'SLA_BREACH':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'ALERT':
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Notification & Alert Center
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded border border-rose-200">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Notifications for statutory milestones, inspection visits, and SLA risk warnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filter === 'UNREAD'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-8 space-y-2">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No notifications to display.</h3>
          <p className="text-xs text-slate-500">All alerts and compliance reminders have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markAsRead(item.id);
                if (item.action_link) navigate(item.action_link);
              }}
              className={`p-3.5 rounded-lg border transition-colors cursor-pointer flex items-start justify-between gap-4 shadow-xs ${
                !item.is_read
                  ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/60'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-white border border-slate-200 shadow-xs mt-0.5 flex-shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-slate-900">
                      {item.title}
                    </h3>
                    {!item.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {new Date(item.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {item.action_link && (
                <div className="flex items-center text-xs font-medium text-slate-700 hover:text-slate-900 gap-1 flex-shrink-0 mt-1">
                  <span>View</span> <ChevronRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
