/**
 * User API Service
 * 处理用户认证相关的 API 请求
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '@/utils/mockUtils';
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  RegistrationToken 
} from '@/types';

// ==================== Mock Data ====================
const MOCK_LOGIN_RESPONSE: LoginResponse = {
  token: 'mock-jwt-token-12345',
  user: {
    id: 1,
    username: 'john.doe',
    email: 'john.doe@example.com',
    password: '', // 不返回密码
    createDate: '2024-01-01T00:00:00Z',
    lastModificationDate: '2024-01-01T00:00:00Z',
  },
  role: 'Employee',
};

const MOCK_USER_PROFILE: User = {
  id: 1,
  username: 'john.doe',
  email: 'john.doe@example.com',
  password: '',
  createDate: '2024-01-01T00:00:00Z',
  lastModificationDate: '2024-01-01T00:00:00Z',
};

const MOCK_REGISTRATION_TOKEN: RegistrationToken = {
  id: 1,
  token: 'mock-token-abc123',
  email: 'newuser@example.com',
  expirationDate: '2025-12-31T23:59:59Z',
  createBy: 'hr-user-1',
  createDate: '2024-01-01T00:00:00Z',
};

// ==================== API Functions ====================

/**
 * 用户登录
 * @param credentials 登录凭证
 * @returns Promise<LoginResponse>
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  if (isMockMode()) {
    await delay(500);
    // Mock 模式下模拟拦截器行为
    return MOCK_LOGIN_RESPONSE;
  }
  
  return axiosClient.post('/auth/login', credentials) as Promise<LoginResponse>;
};

/**
 * 用户注册
 * @param data 注册数据
 * @returns Promise<User>
 */
export const register = async (data: RegisterRequest): Promise<User> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...MOCK_USER_PROFILE,
      username: data.username,
      email: data.email,
    };
  }
  
  return axiosClient.post('/auth/register', data) as Promise<User>;
};

/**
 * 获取当前用户信息
 * @returns Promise<User>
 */
export const getUserProfile = async (): Promise<User> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_USER_PROFILE;
  }
  
  return axiosClient.get('/auth/profile') as Promise<User>;
};

/**
 * 退出登录
 * @returns Promise<void>
 */
export const logout = async (): Promise<void> => {
  if (isMockMode()) {
    await delay(200);
    return;
  }
  
  await axiosClient.post('/auth/logout');
};

/**
 * 验证注册 Token 是否有效
 * @param token 注册 Token
 * @returns Promise<RegistrationToken>
 */
export const validateRegistrationToken = async (token: string): Promise<RegistrationToken> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_REGISTRATION_TOKEN;
  }
  
  return axiosClient.get(`/auth/registration-token/${token}`) as Promise<RegistrationToken>;
};

/**
 * HR 生成注册 Token
 * @param email 目标邮箱
 * @returns Promise<RegistrationToken>
 */
export const generateRegistrationToken = async (email: string): Promise<RegistrationToken> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...MOCK_REGISTRATION_TOKEN,
      email,
      createDate: new Date().toISOString(),
    };
  }
  
  return axiosClient.post('/auth/registration-token', { email }) as Promise<RegistrationToken>;
};
