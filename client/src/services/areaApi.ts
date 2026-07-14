import { api } from './api';

export function createArea(payload: { name: string; city: string; state: string; pincode: string; zone: string }) {
  return api.post('/areas', payload);
}

export function getAreas() {
  return api.get('/areas');
}

export function getArea(id: string) {
  return api.get(`/areas/${id}`);
}

export function updateArea(id: string, payload: { name?: string; city?: string; state?: string; pincode?: string; zone?: string; isActive?: boolean }) {
  return api.put(`/areas/${id}`, payload);
}

export function deleteArea(id: string) {
  return api.delete(`/areas/${id}`);
}

export function getActiveAreas() {
  return api.get('/areas/public');
}
