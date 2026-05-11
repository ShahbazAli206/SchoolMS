import apiClient from './apiClient';

export const parentAPI = {
  getDashboard:         ()          => apiClient.get('/parent/dashboard'),
  getChildren:          ()          => apiClient.get('/parent/children'),
  getChildMarks:        (id, params) => apiClient.get(`/parent/children/${id}/marks`,       {params}),
  getChildAttendance:   (id, params) => apiClient.get(`/parent/children/${id}/attendance`,  {params}),
  getChildAssignments:  (id, params) => apiClient.get(`/parent/children/${id}/assignments`, {params}),
};
