import apiClient from './apiClient';

export const notificationAPI = {
  getMyNotifications: params  => apiClient.get('/notifications/my', {params}),
  getUnreadCount:     ()      => apiClient.get('/notifications/unread-count'),
  markRead:           id      => apiClient.patch(`/notifications/${id}/read`),
  markAllRead:        ()      => apiClient.patch('/notifications/mark-all-read'),
  deleteOne:          id      => apiClient.delete(`/notifications/${id}`),
  adminSend:          data    => apiClient.post('/notifications/send', data),
  adminGetAll:        params  => apiClient.get('/notifications/admin/all', {params}),
};
