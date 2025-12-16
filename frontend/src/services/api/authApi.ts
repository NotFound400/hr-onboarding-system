
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


export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  if (isMockMode()) {
    await delay(500);
    
    const mockUser = AuthMocks.findMockUserByIdentifier(credentials.usernameOrEmail);
    
    if (!mockUser) {
      throw new Error('Invalid username or password');
    }
    
    
    if (mockUser.password !== credentials.password) {
      throw new Error('Invalid username or password');
    }
    
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

export const register = async (data: RegisterRequest): Promise<User> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...AuthMocks.MOCK_USER_PROFILE.data!,
      username: data.username,
      email: data.email,
    };
  }
  
  return axiosClient.post('/auth/register', data) as Promise<User>;
};

export const getUserProfile = async (): Promise<User> => {
  if (isMockMode()) {
    await delay(300);
    return AuthMocks.MOCK_USER_PROFILE.data!;
  }
  
  return axiosClient.get('/auth/profile') as Promise<User>;
};

export const logout = async (): Promise<void> => {
  if (isMockMode()) {
    await delay(200);
    return;
  }
  
  await axiosClient.post('/auth/logout');
};

export const generateRegistrationToken = async (
  data: GenerateTokenRequest
): Promise<RegistrationToken> => {
  if (isMockMode()) {
    await delay(500);
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

export const validateToken = async (token: string): Promise<RegistrationTokenValidationResponse> => {
  if (isMockMode()) {
    await delay(500);
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

export const registerUser = async (data: RegisterRequest): Promise<User> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...AuthMocks.MOCK_USER_PROFILE.data!,
      username: data.username,
      email: data.email,
    };
  }
  
  return axiosClient.post('/auth/register', data) as Promise<User>;
};
