import { request } from './api';
import { ApplicationItem } from '../types';

export const ApplicationService = {
  list: async (params?: { business_id?: number; status?: string; delay_risk?: string }): Promise<ApplicationItem[]> => {
    const query = new URLSearchParams();
    if (params?.business_id) query.append('business_id', params.business_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.delay_risk) query.append('delay_risk', params.delay_risk);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<ApplicationItem[]>(`/applications${qs}`);
  },

  getById: async (id: number): Promise<ApplicationItem> => {
    return request<ApplicationItem>(`/applications/${id}`);
  },

  create: async (businessId: number, approvalTypeId: number): Promise<ApplicationItem> => {
    return request<ApplicationItem>('/applications', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, approval_type_id: approvalTypeId }),
    });
  },

  updateStatus: async (
    id: number,
    data: {
      status?: string;
      current_stage?: string;
      officer_remarks?: string;
      assigned_officer?: string;
      advance_stage?: boolean;
    }
  ): Promise<ApplicationItem> => {
    return request<ApplicationItem>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getStateMatrix: async (): Promise<{
    statuses: string[];
    stages: string[];
    valid_status_stage_map: Record<string, string[]>;
    default_stage_for_status: Record<string, string>;
    default_status_for_stage: Record<string, string>;
    stage_labels: Record<string, string>;
  }> => {
    return request('/applications/state-matrix');
  },
};
