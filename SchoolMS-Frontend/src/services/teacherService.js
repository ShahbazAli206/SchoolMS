import apiClient from './apiClient';

export const teacherAPI = {
  // Dashboard
  getStats: () => apiClient.get('/teacher/stats'),

  // Classes & Subjects
  getMyClasses: () => apiClient.get('/teacher/classes'),
  getClassStudents: classId => apiClient.get(`/teacher/classes/${classId}/students`),
  getSubjects: params => apiClient.get('/teacher/subjects', {params}),

  // Assignments
  getAssignments: params => apiClient.get('/teacher/assignments', {params}),
  createAssignment: formData =>
    apiClient.post('/teacher/assignments', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }),
  updateAssignment: (id, formData) =>
    apiClient.put(`/teacher/assignments/${id}`, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }),
  deleteAssignment: id => apiClient.delete(`/teacher/assignments/${id}`),

  // Materials
  getMaterials: params => apiClient.get('/teacher/materials', {params}),
  uploadMaterial: (formData, onProgress) =>
    apiClient.post('/teacher/materials', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
      onUploadProgress: e => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }),
  updateMaterial: (id, data) => apiClient.patch(`/teacher/materials/${id}`, data),
  deleteMaterial: id => apiClient.delete(`/teacher/materials/${id}`),

  // Marks
  getMarks: params => apiClient.get('/teacher/marks', {params}),
  upsertMark: data => apiClient.post('/teacher/marks', data),
  bulkUpsertMarks: marks => apiClient.post('/teacher/marks/bulk', {marks}),
  deleteMark: id => apiClient.delete(`/teacher/marks/${id}`),

  // Attendance
  getAttendance: params => apiClient.get('/teacher/attendance', {params}),
  getAttendanceSummary: params => apiClient.get('/teacher/attendance/summary', {params}),
  markAttendance: data => apiClient.post('/teacher/attendance', data),
  bulkMarkAttendance: data => apiClient.post('/teacher/attendance/bulk', data),
};
