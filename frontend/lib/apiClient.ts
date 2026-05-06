import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
const cleanBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const apiClient = axios.create({
  baseURL: cleanBaseUrl,
  withCredentials: true, // Crucial for sending the HttpOnly refresh cookie
});

// Attach Authorization header if token exists
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration intelligently
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detected a 401 Unauthorized securely
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${apiClient.defaults.baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.status === 200) {
          const { accessToken } = res.data;

          useAuthStore.getState().setAccessToken(accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Safe fallback - refresh token has either fully expired or revoked
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);