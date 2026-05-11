import apiClient from './apiClient';

export const chatAPI = {
  getConversations:  ()            => apiClient.get('/chat'),
  createConversation: data         => apiClient.post('/chat', data),
  getMessages:       (id, params)  => apiClient.get(`/chat/${id}/messages`, {params}),
  sendMessage:       (id, data)    => {
    // Check if data is FormData (for image uploads)
    if (data instanceof FormData) {
      return apiClient.post(`/chat/${id}/messages`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Regular JSON data
    return apiClient.post(`/chat/${id}/messages`, data);
  },
  markRead:          id            => apiClient.patch(`/chat/${id}/read`),
  addParticipants:   (id, userIds) => apiClient.post(`/chat/${id}/participants`, {userIds}),
  leaveConversation: id            => apiClient.delete(`/chat/${id}/leave`),
};
