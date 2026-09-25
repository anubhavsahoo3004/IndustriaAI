import { request } from './api';
import { InspectionItem } from '../types';

export const InspectionService = {
  list: async (params?: { business_id?: number; application_id?: number; status?: string }): Promise<InspectionItem[]> => {
    const query = new URLSearchParams();
    if (params?.business_id) query.append('business_id', params.business_id.toString());
    if (params?.application_id) query.append('application_id', params.application_id.toString());
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<InspectionItem[]>(`/inspections${qs}`);
  },

  schedule: async (data: {
    application_id: number;
    business_id: number;
    inspection_type: string;
    scheduled_date: string;
    officer_name: string;
    officer_designation?: string;
    officer_contact?: string;
    location: string;
    applicant_action_required?: string;
  }): Promise<InspectionItem> => {
    return request<InspectionItem>('/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<InspectionItem>): Promise<InspectionItem> => {
    return request<InspectionItem>(`/inspections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
