import apiClient from './apiClient';

export const usersAPI = {
  getAll: params => apiClient.get('/users', {params}),
  getById: id => apiClient.get(`/users/${id}`),
  create: data => apiClient.post('/users', data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  remove: id => apiClient.delete(`/users/${id}`),
  toggleStatus: id => apiClient.patch(`/users/${id}/toggle-status`),
  assignRole: (id, role) => apiClient.patch(`/users/${id}/role`, {role}),
};

export const studentsAPI = {
  getAll: params => apiClient.get('/students', {params}),
  getById: id => apiClient.get(`/students/${id}`),
  getMarks: id => apiClient.get(`/students/${id}/marks`),
  getAttendance: id => apiClient.get(`/students/${id}/attendance`),
  getAssignments: id => apiClient.get(`/students/${id}/assignments`),
  getFees: id => apiClient.get(`/students/${id}/fees`),
};

export const teachersAPI = {
  getAll: params => apiClient.get('/teachers', {params}),
  getById: id => apiClient.get(`/teachers/${id}`),
};
