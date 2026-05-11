import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../config/env';
import {store} from '../redux/store';
import {refreshToken, logoutUser} from '../redux/slices/authSlice';

const apiClient = axios.create({
  baseURL: ENV.BASE_URL,
  timeout: ENV.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: attach access token ──────────────────────────────
apiClient.interceptors.request.use(
  async config => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ── Response interceptor: handle 401 + auto token refresh ─────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const result = await store.dispatch(refreshToken());
        if (refreshToken.fulfilled.match(result)) {
          const newToken = result.payload.accessToken;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          processQueue(new Error('Refresh failed'), null);
          store.dispatch(logoutUser());
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
