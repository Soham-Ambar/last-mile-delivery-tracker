import { api } from './api';

export function adminCreateOrder(payload: any) {
  return api.post('/orders/admin', payload);
}

export function createOrder(payload: {
  pickupName: string;
  pickupPhone: string;
  pickupAddress: string;
  pickupArea: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  deliveryArea: string;
  parcelType: string;
  parcelWeight: number;
  paymentMode: string;
  notes?: string;
}) {
  return api.post('/orders', payload);
}

export function getMyOrders() {
  return api.get('/orders/my-orders');
}

export function getOrder(id: string) {
  return api.get(`/orders/${id}`);
}

export function getAllOrders() {
  return api.get('/orders/admin');
}

export function updateOrder(id: string, payload: { status?: string; assignedAgent?: string; notes?: string }) {
  return api.put(`/orders/${id}`, payload);
}

export function cancelOrder(id: string) {
  return api.patch(`/orders/${id}/cancel`);
}

export function assignOrder(id: string, agentId: string) {
  return api.patch(`/orders/${id}/assign`, { agentId });
}

export function autoAssignOrder(id: string) {
  return api.post(`/orders/${id}/auto-assign`);
}

export function unassignOrder(id: string) {
  return api.patch(`/orders/${id}/unassign`);
}

export function getTrackingTimeline(id: string) {
  return api.get(`/orders/${id}/tracking`);
}

export function markFailed(id: string, failedReason: string) {
  return api.patch(`/orders/${id}/fail`, { failedReason });
}

export function rescheduleOrder(id: string, newDate: string) {
  return api.patch(`/orders/${id}/reschedule`, { newDate });
}
