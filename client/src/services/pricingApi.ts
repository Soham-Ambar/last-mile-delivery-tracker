import { api } from './api';

export function getPricingEstimate(payload: {
  sourceZone: string;
  destinationZone: string;
  weight: number;
  length?: number;
  breadth?: number;
  height?: number;
  paymentMode: string;
  orderType: string;
}) {
  return api.post('/pricing/estimate', payload);
}
