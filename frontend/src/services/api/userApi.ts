/**
 * User API Service
 * 处理用户认证相关的 API 请求
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  RegistrationToken,
  ApiResponse
} from '../../types';

// ==================== Mock Data ====================

/** Mock 用户账户库 */
const MOCK_USERS = {
  admin: {
    user: {
      id: 999,
      username: 'admin',
      email: 'admin@company.com',
      password: '', // 不返回密码
      createDate: '2024-01-01T00:00:00Z',
      lastModificationDate: '2024-01-01T00:00:00Z',
    },
    role: 'HR' as const,
    password: 'admin1', // Mock 用于验证
  },
  'john.doe': {
    user: {
      id: 1,
      username: 'john.doe',
      email: 'john.doe@example.com',
      password: '',
      createDate: '2024-01-01T00:00:00Z',
      lastModificationDate: '2024-01-01T00:00:00Z',
    },
    role: 'Employee' as const,
    password: 'password123', // Mock 用于验证
  },
  'alice.wang': {
    user: {
      id: 100,
      username: 'alice.wang',
      email: 'alice.wang@example.com',
      password: '',
      createDate: '2024-02-01T00:00:00Z',
      lastModificationDate: '2024-02-01T00:00:00Z',
    },
    role: 'Employee' as const,
    password: 'test123', // Mock 用于验证 - Onboarding Approved 用户
  },
};

const MOCK_USER_PROFILE: ApiResponse<User> = {
  success: true,
  message: 'User profile retrieved',
  data: MOCK_USERS['john.doe'].user,
};

const MOCK_REGISTRATION_TOKEN: ApiResponse<RegistrationToken> = {
  success: true,
  message: 'Registration token retrieved',
  data: {
    id: 1,
    token: 'mock-token-abc123',
    email: 'newuser@example.com',
    expirationDate: '2025-12-31T23:59:59Z',
    createBy: 'hr-user-1',
    createDate: '2024-01-01T00:00:00Z',
  },
};

// ==================== API Functions ====================

/**
 * 用户登录
 * @param credentials 登录凭证
 * @returns Promise<LoginResponse>
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  if (isMockMode()) {
    console.log('[Mock Request] login:', credentials);
    await delay(500);
    
    // Mock 账户验证
    const mockUser = MOCK_USERS[credentials.username as keyof typeof MOCK_USERS];
    
    if (!mockUser) {
      throw new Error('Invalid username or password');
    }
    
    if (mockUser.password !== credentials.password) {
      throw new Error('Invalid username or password');
    }
    
    // 返回对应角色的登录响应
    return {
      token: `mock-jwt-token-${mockUser.user.id}`,
      user: mockUser.user,
      role: mockUser.role,
    };
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
    console.log('[Mock Request] register:', data);
    await delay(500);
    return {
      ...MOCK_USER_PROFILE.data!,
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
    return MOCK_USER_PROFILE.data!;
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
    return MOCK_REGISTRATION_TOKEN.data!;
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
    console.log('[Mock Request] generateRegistrationToken:', { email });
    await delay(500);
    return {
      ...MOCK_REGISTRATION_TOKEN.data!,
      email,
      createDate: new Date().toISOString(),
    };
  }
  
  return axiosClient.post('/auth/registration-token', { email }) as Promise<RegistrationToken>;
};

/**
 * 验证注册 Token
 * @param token 注册 Token
 * @returns Promise<{ valid: boolean; email: string; message?: string }>
 */
export const validateToken = async (token: string): Promise<{ valid: boolean; email: string; message?: string }> => {
  if (isMockMode()) {
    console.log('[Mock Request] validateToken:', token);
    await delay(500);
    
    // Mock: 验证 token
    if (token === 'invalid-token') {
      return {
        valid: false,
        email: '',
        message: 'Token is invalid or expired',
      };
    }
    
    return {
      valid: true,
      email: MOCK_REGISTRATION_TOKEN.data!.email,
    };
  }
  
  const response = await axiosClient.get(`/auth/validate-token/${token}`);
  return (response as any).data as { valid: boolean; email: string; message?: string };
};

/**
 * 用户注册
 * @param data 注册数据
 * @returns Promise<User>
 */
export const registerUser = async (data: RegisterRequest): Promise<User> => {
  if (isMockMode()) {
    console.log('[Mock Request] registerUser:', data);
    await delay(500);
    return {
      ...MOCK_USER_PROFILE.data!,
      username: data.username,
      email: data.email,
    };
  }
  
  return axiosClient.post('/auth/register', data) as Promise<User>;
};
