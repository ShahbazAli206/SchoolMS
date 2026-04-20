import apiClient from './apiClient';

export const adminAPI = {
  // Dashboard
  getStats: () => apiClient.get('/admin/stats'),

  // Students
  getStudents: params => apiClient.get('/admin/students', {params}),
  createStudent: data => apiClient.post('/admin/students', data),
  updateStudent: (id, data) => apiClient.put(`/admin/students/${id}`, data),
  deleteStudent: id => apiClient.delete(`/admin/students/${id}`),

  // Teachers
  getTeachers: params => apiClient.get('/admin/teachers', {params}),
  createTeacher: data => apiClient.post('/admin/teachers', data),
  updateTeacher: (id, data) => apiClient.put(`/admin/teachers/${id}`, data),
  deleteTeacher: id => apiClient.delete(`/admin/teachers/${id}`),

  // User management (general)
  getAllUsers: params => apiClient.get('/users', {params}),
  getUserById: id => apiClient.get(`/users/${id}`),
  createUser: data => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: id => apiClient.delete(`/users/${id}`),
  toggleUserStatus: userId => apiClient.patch(`/admin/users/${userId}/toggle-status`),
  assignRole: (userId, role) => apiClient.patch(`/admin/users/${userId}/role`, {role}),
};
