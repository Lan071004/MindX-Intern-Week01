import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor để xử lý lỗi thống nhất
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server trả về response với status code lỗi
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('API Error: No response received', error.request);
    } else {
      // Lỗi xảy ra khi setup request
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Interface cho API responses
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime?: number;
}

export interface ApiResponse {
  message: string;
  data?: any;
}

// API Methods
export const healthCheck = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRootMessage = async (): Promise<ApiResponse> => {
  try {
    const response = await apiClient.get<ApiResponse>('/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export default client để sử dụng cho các custom requests
export default apiClient;