import { request } from './api';
import { ApprovalType, ApprovalPlanResponse } from '../types';

export const ApprovalService = {
  listTypes: async (): Promise<ApprovalType[]> => {
    return request<ApprovalType[]>('/approvals');
  },

  generatePlan: async (businessId: number): Promise<ApprovalPlanResponse> => {
    return request<ApprovalPlanResponse>(`/approvals/plan/${businessId}`);
  },
};
