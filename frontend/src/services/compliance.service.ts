import { request } from './api';
import { ComplianceTaskItem } from '../types';

export const ComplianceService = {
  listByBusiness: async (businessId: number, status?: string): Promise<ComplianceTaskItem[]> => {
    const qs = status ? `&status=${status}` : '';
    return request<ComplianceTaskItem[]>(`/compliance?business_id=${businessId}${qs}`);
  },

  create: async (data: Partial<ComplianceTaskItem>): Promise<ComplianceTaskItem> => {
    return request<ComplianceTaskItem>('/compliance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<ComplianceTaskItem>): Promise<ComplianceTaskItem> => {
    return request<ComplianceTaskItem>(`/compliance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
