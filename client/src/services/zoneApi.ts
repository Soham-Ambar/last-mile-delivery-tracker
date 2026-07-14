import { api } from './api';

export function createZone(payload: { name: string; description?: string }) {
  return api.post('/zones', payload);
}

export function getZones() {
  return api.get('/zones');
}

export function updateZone(id: string, payload: { name?: string; description?: string; isActive?: boolean }) {
  return api.put(`/zones/${id}`, payload);
}

export function deleteZone(id: string) {
  return api.delete(`/zones/${id}`);
}
