import apiClient from './apiClient';

export const authAPI = {
  login: credentials => apiClient.post('/auth/login', credentials),
  register: userData => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refresh: token => apiClient.post('/auth/refresh', {refreshToken: token}),
  sendOTP: payload => apiClient.post('/auth/otp/send', payload),
  verifyOTP: payload => apiClient.post('/auth/otp/verify', payload),
  resendOTP: payload => apiClient.post('/auth/otp/resend', payload),
  forgotPassword: email => apiClient.post('/auth/forgot-password', {email}),
  resetPassword: payload => apiClient.post('/auth/reset-password', payload),
  changePassword: payload => apiClient.post('/auth/change-password', payload),
  updateFcmToken: fcmToken => apiClient.post('/auth/fcm-token', {fcmToken}),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: profileData => apiClient.put('/users/me', profileData),
};
