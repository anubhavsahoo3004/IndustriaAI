import { request } from './api';
import { NotificationItem } from '../types';

export const NotificationService = {
  list: async (): Promise<NotificationItem[]> => {
    return request<NotificationItem[]>('/notifications');
  },

  markRead: async (id: number): Promise<NotificationItem> => {
    return request<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllRead: async (): Promise<{ status: string; marked_read_count: number }> => {
    return request<{ status: string; marked_read_count: number }>('/notifications/mark-all-read', {
      method: 'POST',
    });
  },
};
