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

/** 
 * Mock 用户账户库 
 * 按照 QA 清单标准配置:
 * - admin/admin1: HR 管理员
 * - employee/123: 已批准的老员工 (Onboarding Approved)
 * - new_user/123: 新员工 (Onboarding Pending)
 */
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
    password: 'admin1', // QA 标准密码
    onboardingStatus: undefined, // HR 无需 Onboarding
  },
  employee: {
    user: {
      id: 100,
      username: 'employee',
      email: 'employee@company.com',
      password: '',
      createDate: '2024-01-01T00:00:00Z',
      lastModificationDate: '2024-01-01T00:00:00Z',
    },
    role: 'Employee' as const,
    password: '123', // QA 标准密码
    onboardingStatus: 'Approved', // 已批准，可访问员工门户
  },
  new_user: {
    user: {
      id: 200,
      username: 'new_user',
      email: 'newuser@company.com',
      password: '',
      createDate: '2024-12-01T00:00:00Z',
      lastModificationDate: '2024-12-01T00:00:00Z',
    },
    role: 'Employee' as const,
    password: '123', // QA 标准密码
    onboardingStatus: 'Pending', // 待填写 Onboarding 表单
  },
};

const MOCK_USER_PROFILE: ApiResponse<User> = {
  success: true,
  message: 'User profile retrieved',
  data: MOCK_USERS.employee.user,
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
    console.log('[Mock Debug] Available users:', Object.keys(MOCK_USERS));
    await delay(500);
    
    // Mock 账户验证
    const mockUser = MOCK_USERS[credentials.username as keyof typeof MOCK_USERS];
    console.log('[Mock Debug] Found user:', mockUser ? 'YES' : 'NO');
    
    if (!mockUser) {
      console.error('[Mock Error] User not found:', credentials.username);
      throw new Error('Invalid username or password');
    }
    
    console.log('[Mock Debug] Expected password:', mockUser.password);
    console.log('[Mock Debug] Provided password:', credentials.password);
    console.log('[Mock Debug] Password match:', mockUser.password === credentials.password);
    
    if (mockUser.password !== credentials.password) {
      console.error('[Mock Error] Password mismatch');
      throw new Error('Invalid username or password');
    }
    
    // 返回对应角色的登录响应
    console.log('[Mock Success] Login successful for:', credentials.username);
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
 * HR 生成注册 Token (HR Section 5.a)
 * @param email 目标邮箱
 * @param name 可选名称
 * @returns Promise<RegistrationToken>
 */
export const generateRegistrationToken = async (email: string, name?: string): Promise<RegistrationToken> => {
  if (isMockMode()) {
    console.log('[Mock Request] generateRegistrationToken:', { email, name });
    await delay(500);
    return {
      ...MOCK_REGISTRATION_TOKEN.data!,
      email,
      createDate: new Date().toISOString(),
      token: `TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    };
  }
  
  return axiosClient.post('/auth/registration-token', { email, name }) as Promise<RegistrationToken>;
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
