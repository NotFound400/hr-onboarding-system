/**
 * Axios Client with Global Interceptors
 * 统一处理业务状态与 HTTP 状态分离的响应模式
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '../../types';

// 创建 Axios 实例
const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const buildHousingPath = (path: string): string =>
  `/housing${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Request Interceptor
 * 自动添加 JWT Token 到请求头
 */
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

/**
 * Response Interceptor
 * 统一处理业务状态和错误
 */
axiosClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: AxiosResponse<ApiResponse<any>>) => {
    // HTTP Status 200
    const apiResponse = response.data;

    // 检查业务状态
    if (apiResponse.success) {
      // 业务成功: 剥离 ApiResponse 外壳，直接返回 Payload
      return apiResponse.data;
    } else {
      // 业务失败: 显示错误信息并拒绝 Promise
      message.error(apiResponse.message || '操作失败');
      return Promise.reject(new Error(apiResponse.message || '操作失败'));
    }
  },
  (error: AxiosError) => {
    // HTTP Status 4xx/5xx
    if (error.response) {
      const status = error.response.status;
      const apiResponse = error.response.data as ApiResponse<unknown>;

      switch (status) {
        case 401:
          message.error('未授权，请重新登录');
          // 清除本地 Token
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('tokenType');
          localStorage.removeItem('tokenExpiresAt');
          localStorage.removeItem('roles');
          localStorage.removeItem('houseId');
          localStorage.removeItem('employeeId');
          // 可选: 跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问该资源');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误，请稍后重试');
          break;
        default:
          message.error(apiResponse?.message || `请求失败 (${status})`);
      }

      return Promise.reject(error);
    } else if (error.request) {
      // 网络错误
      message.error('网络连接失败，请检查您的网络');
      return Promise.reject(new Error('网络连接失败'));
    } else {
      // 其他错误
      message.error('请求发生错误');
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
