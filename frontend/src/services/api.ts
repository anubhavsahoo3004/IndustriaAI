/**
 * Dynamic API Base URL resolution:
 * 1. If VITE_API_BASE_URL is set (e.g., https://industriaai-api.onrender.com or http://127.0.0.1:8000),
 *    normalizes slashes and appends /api appropriately.
 * 2. If unset (local development with `npm run dev`), defaults to '/api' which is proxied by Vite.
 */
const rawApiUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()?.replace(/\/+$/, '');
export const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('industria_token');

  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiError(errorDetail, response.status);
  }

  // If status is 204 or empty content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
