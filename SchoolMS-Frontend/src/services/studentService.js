import apiClient from './apiClient';

export const studentAPI = {
  getDashboard:  ()       => apiClient.get('/student/dashboard'),
  getAssignments: params  => apiClient.get('/student/assignments', {params}),
  getMarks:       params  => apiClient.get('/student/marks', {params}),
  getAttendance:  params  => apiClient.get('/student/attendance', {params}),
  getMaterials:   params  => apiClient.get('/student/materials', {params}),
};
