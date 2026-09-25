import { request } from './api';
import { AnalyticsOverview } from '../types';

export const AnalyticsService = {
  getOverview: async (params?: { business_id?: number }): Promise<AnalyticsOverview> => {
    const query = params?.business_id ? `?business_id=${params.business_id}` : '';
    return request<AnalyticsOverview>(`/analytics/overview${query}`);
  },

  getBottlenecks: async () => {
    return request<{ total_active_pipeline: number; bottlenecks: any[] }>('/analytics/bottlenecks');
  },

  getSlaRisks: async () => {
    return request<{ total_at_risk: number; sla_risks: any[] }>('/analytics/sla-risk');
  },
};
