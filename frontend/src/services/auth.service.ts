import { request } from './api';
import { AuthResponse, User } from '../types';

export const AuthService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (data: { email: string; password: string; full_name: string; phone?: string; role?: string }): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async (): Promise<User> => {
    return request<User>('/auth/me');
  },
};
