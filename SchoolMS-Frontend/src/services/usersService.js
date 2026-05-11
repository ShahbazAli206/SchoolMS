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
  getAll: params => apiClient.get('/admin/students', {params}),
  getById: id => apiClient.get(`/admin/students/${id}`),
  getMarks: id => apiClient.get('/teacher/marks', {params: {studentId: id}}),
  getAttendance: id => apiClient.get('/teacher/attendance', {params: {studentId: id}}),
  getAssignments: id => apiClient.get('/student/assignments', {params: {studentId: id}}),
  getFees: id => apiClient.get(`/fees/student/${id}`),
};

export const teachersAPI = {
  getAll: params => apiClient.get('/admin/teachers', {params}),
  getById: id => apiClient.get(`/admin/teachers/${id}`),
};
