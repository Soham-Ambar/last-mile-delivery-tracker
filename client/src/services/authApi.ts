import { api } from './api';

export function setAuthHeader(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthHeader() {
  delete api.defaults.headers.common.Authorization;
}

export function register(payload: { name: string; email: string; phone?: string; password: string }) {
  return api.post('/auth/register', payload);
}

export function login(payload: { email: string; password: string }) {
  return api.post('/auth/login', payload);
}

export function getProfile() {
  return api.get('/auth/profile');
}

export function logout() {
  return api.post('/auth/logout');
}
