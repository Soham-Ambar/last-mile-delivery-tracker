import { api } from './api';

export function getDashboard(params?: { range?: string; startDate?: string; endDate?: string }) {
  return api.get('/analytics/dashboard', { params });
}
