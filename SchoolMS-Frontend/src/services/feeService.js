import apiClient from './apiClient';

export const feeAPI = {
  // Admin
  getDashboard:      ()             => apiClient.get('/fees/dashboard'),
  getAllFees:         params         => apiClient.get('/fees', {params}),
  createFee:         data           => apiClient.post('/fees', data),
  updateFee:         (id, data)     => apiClient.put(`/fees/${id}`, data),
  deleteFee:         id             => apiClient.delete(`/fees/${id}`),
  getStudentFees:    studentId      => apiClient.get(`/fees/student/${studentId}`),
  getFeePayments:    feeId          => apiClient.get(`/fees/${feeId}/payments`),
  recordPayment:     (feeId, data)  => apiClient.post(`/fees/${feeId}/payments`, data),

  // Student
  getMyFees: () => apiClient.get('/fees/my'),

  // Parent
  getChildFees: studentId => apiClient.get(`/fees/child/${studentId}`),
};
