import apiClient from './apiClient';

export const eventAPI = {
  list:    params       => apiClient.get('/events', {params}),
  get:     id           => apiClient.get(`/events/${id}`),
  create:  data         => apiClient.post('/events', data),
  update:  (id, data)   => apiClient.put(`/events/${id}`, data),
  remove:  id           => apiClient.delete(`/events/${id}`),
};
