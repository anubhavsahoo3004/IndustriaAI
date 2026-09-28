import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Activity,
  Layers,
  FileCheck2
} from 'lucide-react';
import { AuditService } from '../services/audit.service';
import { AuditLogItem } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await AuditService.list(100);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = ['ALL', ...Array.from(new Set(logs.map((l) => l.action)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              System Audit Trail & Compliance Log
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200 font-mono">
              {logs.length} Logged Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of all logins, application state transitions, document validations, inspection dispatches, and administrative actions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by description or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-mono text-[11px]"
          >
            {uniqueActions.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading audit trail...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-8 space-y-2">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No audit records found.</h3>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Timestamp</th>
                  <th className="py-2.5 px-4 font-bold">Action</th>
                  <th className="py-2.5 px-4 font-bold">User / Actor</th>
                  <th className="py-2.5 px-4 font-bold">Entity Type & ID</th>
                  <th className="py-2.5 px-4 font-bold">Description</th>
                  <th className="py-2.5 px-4 font-bold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {log.user_email || 'System'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                      {log.entity_type ? `${log.entity_type} #${log.entity_id || ''}` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 leading-relaxed max-w-md">
                      {log.description}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
