import { api } from './api';

export function createRateCard(payload: {
  name: string;
  sourceZone: string;
  destinationZone: string;
  pricing?: {
    b2b?: { baseRate: number; ratePerKg: number; minimumCharge: number; codCharge: number };
    b2c?: { baseRate: number; ratePerKg: number; minimumCharge: number; codCharge: number };
  };
  baseRate?: number;
  ratePerKg?: number;
  minimumCharge?: number;
  codCharge?: number;
  estimatedDeliveryDays: number;
}) {
  return api.post('/rate-cards', payload);
}

export function getRateCards() {
  return api.get('/rate-cards');
}

export function getRateCard(id: string) {
  return api.get(`/rate-cards/${id}`);
}

export function updateRateCard(
  id: string,
  payload: {
    name?: string;
    sourceZone?: string;
    destinationZone?: string;
    pricing?: {
      b2b?: { baseRate: number; ratePerKg: number; minimumCharge: number; codCharge: number };
      b2c?: { baseRate: number; ratePerKg: number; minimumCharge: number; codCharge: number };
    };
    baseRate?: number;
    ratePerKg?: number;
    minimumCharge?: number;
    codCharge?: number;
    estimatedDeliveryDays?: number;
    isActive?: boolean;
  }
) {
  return api.put(`/rate-cards/${id}`, payload);
}

export function deleteRateCard(id: string) {
  return api.delete(`/rate-cards/${id}`);
}
