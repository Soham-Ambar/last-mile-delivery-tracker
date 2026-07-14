import { api } from './api';

export function getNotifications(page = 1, limit = 20) {
  return api.get(`/notifications?page=${page}&limit=${limit}`);
}

export function getUnreadCount() {
  return api.get('/notifications/unread-count');
}

export function markAsRead(id: string) {
  return api.patch(`/notifications/${id}/read`);
}

export function markAllAsRead() {
  return api.patch('/notifications/read-all');
}

export function deleteNotification(id: string) {
  return api.delete(`/notifications/${id}`);
}
