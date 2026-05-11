import apiClient from './apiClient';

export const complaintAPI = {
  // ── Parent ──────────────────────────────────────────────────────────────
  submit:           data       => apiClient.post('/complaints', data, {headers: {'Content-Type': 'multipart/form-data'}}),
  getMyList:        params     => apiClient.get('/complaints/my', {params}),
  getReceivedList:  params     => apiClient.get('/complaints/received', {params}),
  getMyOne:         id         => apiClient.get(`/complaints/my/${id}`),
  deleteOne:        id         => apiClient.delete(`/complaints/my/${id}`),

  // ── Teacher ─────────────────────────────────────────────────────────────
  teacherSubmit:    data       => apiClient.post('/complaints/teacher', data, {headers: {'Content-Type': 'multipart/form-data'}}),
  teacherInbox:     params     => apiClient.get('/complaints/teacher/inbox', {params}),

  // ── Staff ───────────────────────────────────────────────────────────────
  staffList:        params     => apiClient.get('/complaints/staff', {params}),
  staffStats:       ()         => apiClient.get('/complaints/staff/stats'),

  // ── Principal ───────────────────────────────────────────────────────────
  principalList:    params     => apiClient.get('/complaints/principal', {params}),
  principalStats:   ()         => apiClient.get('/complaints/principal/stats'),

  // ── Admin ───────────────────────────────────────────────────────────────
  adminGetStats:    ()         => apiClient.get('/complaints/admin/stats'),
  adminGetAll:      params     => apiClient.get('/complaints/admin', {params}),
  adminGetOne:      id         => apiClient.get(`/complaints/admin/${id}`),
  adminUpdate:      (id, data) => apiClient.patch(`/complaints/admin/${id}`, data),

  // ── Shared reply (any role with visibility) ─────────────────────────────
  reply:            (id, data) => apiClient.patch(`/complaints/${id}/reply`, data),
};
