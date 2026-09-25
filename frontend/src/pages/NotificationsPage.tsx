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
        return <CalendarCheck className="w-5 h-5 text-purple-600" />;
      case 'SLA_BREACH':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'ALERT':
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'SUCCESS':
        return <Gift className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Notification & Alert Center
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications for statutory milestones, inspection visits, and SLA risk warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'UNREAD'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No notifications to display.</h3>
          <p className="text-xs text-slate-400">All alerts and compliance reminders have been cleared.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markAsRead(item.id);
                if (item.action_link) navigate(item.action_link);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 hover:shadow-sm ${
                !item.is_read
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">
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
                <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 gap-1 flex-shrink-0 mt-1">
                  <span>View</span> <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
