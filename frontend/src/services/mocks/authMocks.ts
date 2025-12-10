/**
 * Auth Mock Data
 * 从 authApi.ts 抽离的模拟用户与注册 Token 数据
 */

import type { ApiResponse, User, RegistrationToken, RoleType } from '../../types';

/**
 * Mock 用户账户库
 * - admin/admin1: HR 管理员
 * - employee/123: 已批准员工
 * - new_user/123: 新员工待 Onboarding
 */
export const MOCK_USERS = {
  admin: {
    user: {
      id: 999,
      username: 'admin',
      email: 'admin@company.com',
      password: '',
      active: true,
      roles: ['HR'] as RoleType[],
      createDate: '2024-01-01T00:00:00Z',
      lastModificationDate: '2024-01-01T00:00:00Z',
    },
    role: 'HR' as const,
    password: 'admin1',
    onboardingStatus: undefined,
  },
  employee: {
    user: {
      id: 100,
      username: 'employee',
      email: 'employee@company.com',
      password: '',
      active: true,
      roles: ['Employee'] as RoleType[],
      createDate: '2024-01-01T00:00:00Z',
      lastModificationDate: '2024-01-01T00:00:00Z',
    },
    role: 'Employee' as const,
    password: '123',
    onboardingStatus: 'Approved',
  },
  new_user: {
    user: {
      id: 200,
      username: 'new_user',
      email: 'newuser@company.com',
      password: '',
      active: true,
      roles: ['Employee'] as RoleType[],
      createDate: '2024-12-01T00:00:00Z',
      lastModificationDate: '2024-12-01T00:00:00Z',
    },
    role: 'Employee' as const,
    password: '123',
    onboardingStatus: 'Pending',
  },
  rejected_user: {
    user: {
      id: 400,
      username: 'rejected_user',
      email: 'rejected_candidate@example.com',
      password: '123',
      active: true,
      roles: ['Employee'] as RoleType[],
      createDate: '2024-12-15T00:00:00Z',
      lastModificationDate: '2024-12-15T00:00:00Z',
    },
    role: 'Employee' as const,
    password: '123',
    onboardingStatus: 'Rejected',
  },
};

/**
 * 根据用户名或邮箱查找 Mock 用户
 * @param identifier username 或 email
 */
export const findMockUserByIdentifier = (identifier: string) => {
  const normalized = identifier.toLowerCase();
  return Object.values(MOCK_USERS).find(
    (record) =>
      record.user.username.toLowerCase() === normalized ||
      record.user.email.toLowerCase() === normalized
  );
};

export const MOCK_USER_PROFILE: ApiResponse<User> = {
  success: true,
  message: 'User profile retrieved',
  data: MOCK_USERS.employee.user,
};

export const MOCK_REGISTRATION_TOKEN: ApiResponse<RegistrationToken> = {
  success: true,
  message: 'Registration token retrieved',
  data: {
    id: 1,
    token: 'mock-token-abc123',
    email: 'newuser@example.com',
    expirationDate: '2025-12-31T23:59:59Z',
    createdByUserId: 'hr-user-1',
    createBy: 'hr-user-1',
    createDate: '2024-01-01T00:00:00Z',
  },
};
