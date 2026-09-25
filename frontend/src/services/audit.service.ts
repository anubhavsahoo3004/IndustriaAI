import { request } from './api';
import { AuditLogItem } from '../types';

export const AuditService = {
  list: async (limit = 100, action?: string): Promise<AuditLogItem[]> => {
    const qs = new URLSearchParams();
    qs.append('limit', limit.toString());
    if (action) qs.append('action', action);
    return request<AuditLogItem[]>(`/audit-logs?${qs.toString()}`);
  },
};
