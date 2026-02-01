import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { auth } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Request Interceptor: Tự đính kèm Firebase token ─────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get token for request:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor: Handle errors ─────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);

      // Nếu 401 → token expired hoặc invalid → có thể force logout
      if (error.response.status === 401) {
        console.warn('Unauthorized - token may have expired');
      }
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ─── Interfaces ───────────────────────────────────────────────────
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime?: number;
}

export interface ApiResponse {
  message: string;
  data?: any;
}

export interface UserVerifyResponse {
  message: string;
  user: {
    uid: string;
    email: string;
  };
}

export interface ProtectedProfileResponse {
  message: string;
  user: {
    uid: string;
    email: string;
  };
  timestamp: string;
}

// ─── API Methods ──────────────────────────────────────────────────
// Public endpoints (không cần auth)
export const healthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};

export const getRootMessage = async (): Promise<ApiResponse> => {
  const response = await apiClient.get<ApiResponse>('/');
  return response.data;
};

// Auth endpoint
export const verifyToken = async (): Promise<UserVerifyResponse> => {
  const response = await apiClient.post<UserVerifyResponse>('/auth/verify');
  return response.data;
};

// Protected endpoint
export const getProtectedProfile = async (): Promise<ProtectedProfileResponse> => {
  const response = await apiClient.get<ProtectedProfileResponse>('/protected/profile');
  return response.data;
};

export default apiClient;
