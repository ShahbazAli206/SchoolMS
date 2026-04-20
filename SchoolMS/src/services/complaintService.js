import apiClient from './apiClient';

export const complaintAPI = {
  // Parent
  submit:         data    => apiClient.post('/complaints', data, {headers: {'Content-Type': 'multipart/form-data'}}),
  getMyList:      params  => apiClient.get('/complaints/my', {params}),
  getMyOne:       id      => apiClient.get(`/complaints/my/${id}`),
  deleteOne:      id      => apiClient.delete(`/complaints/my/${id}`),

  // Admin
  adminGetStats:  ()      => apiClient.get('/complaints/admin/stats'),
  adminGetAll:    params  => apiClient.get('/complaints/admin', {params}),
  adminGetOne:    id      => apiClient.get(`/complaints/admin/${id}`),
  adminUpdate:    (id, data) => apiClient.patch(`/complaints/admin/${id}`, data),
};
