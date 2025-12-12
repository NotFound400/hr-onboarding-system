/**
 * Auth API Service
 * 处理用户认证相关的 API 请求
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import * as AuthMocks from '../mocks/authMocks';
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  RegistrationToken,
  RegistrationTokenValidationResponse,
  GenerateTokenRequest,
} from '../../types';

// ==================== API Functions ====================

/**
 * 用户登录
 * @param credentials 登录凭证
 * @returns Promise<LoginResponse>
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  if (isMockMode()) {
    console.log('[Mock Request] login:', credentials);
    console.log('[Mock Debug] Available users:', Object.keys(AuthMocks.MOCK_USERS));
    await delay(500);
    
    // Mock 账户验证 (支持 usernameOrEmail)
    const mockUser = AuthMocks.findMockUserByIdentifier(credentials.usernameOrEmail);
    console.log('[Mock Debug] Found user:', mockUser ? 'YES' : 'NO');
    
    if (!mockUser) {
      console.error('[Mock Error] User not found:', credentials.usernameOrEmail);
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
    console.log('[Mock Success] Login successful for:', credentials.usernameOrEmail);
    // return {
    //   token: `mock-jwt-token-${mockUser.user.id}`,
    //   user: mockUser.user,
    //   role: mockUser.role,
    // }; // 🟢 正常登录
    // return {
    //   token: '',
    //   user: mockUser.user,
    //   role: mockUser.role,
    // }; // 🔴 模拟 Token 丢失
    return {
      token: `mock-jwt-token-${mockUser.user.id}`,
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      user: mockUser.user,
      role: mockUser.role,
      roles: mockUser.user.roles,
      houseId: mockUser.user.roles.includes('Employee') ? 1 : null,
      employeeId: mockUser.user.roles.includes('Employee')
        ? `mock-employee-${mockUser.user.id}`
        : null,
    };
  }

  return axiosClient.post('/auth/login', {
    usernameOrEmail: credentials.usernameOrEmail,
    password: credentials.password,
  }) as Promise<LoginResponse>;
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
    // return AuthMocks.MOCK_USER_PROFILE.data!; // 🟢 直接沿用默认 Profile
    // return { ...AuthMocks.MOCK_USER_PROFILE.data!, email: data.email }; // 🔴 自定义邮箱
    return {
      ...AuthMocks.MOCK_USER_PROFILE.data!,
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
    // return AuthMocks.MOCK_USER_PROFILE.data!; // 🟢 标准 Profile
    // return { ...AuthMocks.MOCK_USER_PROFILE.data!, email: 'locked@example.com' }; // 🔴 锁定场景
    return AuthMocks.MOCK_USER_PROFILE.data!;
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
 * @param data HR 生成 Token 请求数据
 * @returns Promise<RegistrationToken>
 */
export const generateRegistrationToken = async (
  data: GenerateTokenRequest
): Promise<RegistrationToken> => {
  if (isMockMode()) {
    console.log('[Mock Request] generateRegistrationToken:', data);
    await delay(500);
    // return AuthMocks.MOCK_REGISTRATION_TOKEN.data!; // 🟢 默认 Token
    // return { ...AuthMocks.MOCK_REGISTRATION_TOKEN.data!, email }; // 🔴 定制邮件
    return {
      ...AuthMocks.MOCK_REGISTRATION_TOKEN.data!,
      email: data.email,
      createDate: new Date().toISOString(),
      token: `TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      houseId: data.houseId,
    };
  }
  
  return axiosClient.post('/auth/registration-token', data) as Promise<RegistrationToken>;
};

/**
 * 验证注册 Token
 * @param token 注册 Token
 * @returns Promise<{ valid: boolean; email: string; message?: string }>
 */
export const validateToken = async (token: string): Promise<RegistrationTokenValidationResponse> => {
  if (isMockMode()) {
    console.log('[Mock Request] validateToken:', token);
    await delay(500);
    // return AuthMocks.MOCK_REGISTRATION_TOKEN.data!; // 🟢 默认通过
    // throw new Error('Registration token has expired'); // 🔴 模拟过期场景
    if (token === 'invalid-token') {
      throw new Error('Invalid registration token');
    }
    const tokenData = AuthMocks.MOCK_REGISTRATION_TOKEN.data!;
    return {
      ...tokenData,
      houseId: tokenData.houseId ?? null,
      houseAddress: tokenData.houseAddress ?? null,
      houseContext: tokenData.houseId
        ? {
            id: tokenData.houseId,
            address: tokenData.houseAddress ?? undefined,
          }
        : null,
    };
  }
  
  return axiosClient.get(`/auth/validate-token/${token}`) as Promise<RegistrationTokenValidationResponse>;
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
    // return AuthMocks.MOCK_USER_PROFILE.data!; // 🟢 默认 Profile
    // return { ...AuthMocks.MOCK_USER_PROFILE.data!, username: 'duplicate' }; // 🔴 QA 冲突场景
    return {
      ...AuthMocks.MOCK_USER_PROFILE.data!,
      username: data.username,
      email: data.email,
    };
  }
  
  return axiosClient.post('/auth/register', data) as Promise<User>;
};
