import { api } from './api';

export function createAgent(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleType: string;
  assignedAreas?: string[];
  status?: string;
}) {
  return api.post('/agents', payload);
}

export function getAgents() {
  return api.get('/agents');
}

export function getAgent(id: string) {
  return api.get(`/agents/${id}`);
}

export function updateAgent(
  id: string,
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    vehicleType?: string;
    assignedAreas?: string[];
    status?: string;
    isActive?: boolean;
  }
) {
  return api.put(`/agents/${id}`, payload);
}

export function deleteAgent(id: string) {
  return api.delete(`/agents/${id}`);
}

export function updateStatus(id: string, status: string) {
  return api.patch(`/agents/${id}/status`, { status });
}

export function updateAreas(id: string, assignedAreas: string[]) {
  return api.patch(`/agents/${id}/areas`, { assignedAreas });
}
