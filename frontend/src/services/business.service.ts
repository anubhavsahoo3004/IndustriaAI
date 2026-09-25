import { request } from './api';
import { Business } from '../types';

export const BusinessService = {
  list: async (): Promise<Business[]> => {
    return request<Business[]>('/businesses');
  },

  getById: async (id: number): Promise<Business> => {
    return request<Business>(`/businesses/${id}`);
  },

  create: async (data: Partial<Business>): Promise<Business> => {
    return request<Business>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Business>): Promise<Business> => {
    return request<Business>(`/businesses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
