import { request } from './api';
import { SupportSchemeItem, SchemeMatchItem } from '../types';

export const SchemeService = {
  listAll: async (): Promise<SupportSchemeItem[]> => {
    return request<SupportSchemeItem[]>('/schemes');
  },

  matchForBusiness: async (businessId: number): Promise<SchemeMatchItem[]> => {
    return request<SchemeMatchItem[]>(`/schemes/match/${businessId}`);
  },
};
