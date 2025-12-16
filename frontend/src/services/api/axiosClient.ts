
import axios from 'axios';
import type {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import type { ApiResponse } from '../../types';
import { getGlobalMessageApi } from '../../utils/messageApi';

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const buildHousingPath = (path: string): string =>
  `/housing${path.startsWith('/') ? path : `/${path}`}`;

const showErrorMessage = (content: string) => {
  const messageApi = getGlobalMessageApi();
  if (messageApi) {
    messageApi.error(content);
  } else {
    // eslint-disable-next-line no-console
    // fallback: do nothing in production
  }
};

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: AxiosResponse<any>) => {
    const responseData = response.data;

    if (responseData instanceof Blob) {
      return responseData;
    }

    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      if (responseData.success) {
        return responseData.data;
      } else {
        const message = responseData.message || 'Operation failed';
        showErrorMessage(message);
        return Promise.reject(new Error(message));
      }
    } else {
      return responseData;
    }
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const apiResponse = error.response.data as ApiResponse<unknown>;
      const emitError = (msg: string) => {
        showErrorMessage(msg);
      };

      switch (status) {
        case 401:
          emitError('Unauthorized, please login again');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('tokenType');
          localStorage.removeItem('tokenExpiresAt');
          localStorage.removeItem('roles');
          localStorage.removeItem('houseId');
          localStorage.removeItem('employeeId');
          window.location.href = '/login';
          break;
        case 403:
          emitError('No permission to access this resource');
          break;
        case 404:
          emitError('Resource not found');
          break;
        case 500:
          emitError('Server error, please try again later');
          break;
        default:
          emitError(apiResponse?.message || `Request failed (${status})`);
      }

      return Promise.reject(error);
    } else if (error.request) {
      showErrorMessage('Network connection failed, please check your network');
      return Promise.reject(new Error('Network connection failed'));
    } else {
      showErrorMessage('Request error occurred');
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
