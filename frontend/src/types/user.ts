/**
 * Authentication Service Types
 * 对应 SQL 数据库中的 User, Role, UserRole, RegistrationToken 表
 */

import { RoleType } from './enums';

// Re-export request types
export type { LoginRequest, RegisterRequest } from './request';

/** 用户表 */
export interface User {
  /** Primary Key */
  id: number;
  /** 用户名 (唯一) */
  username: string;
  /** 邮箱 (唯一) */
  email: string;
  /** 加密密码 */
  password: string;
  /** 账号是否启用 */
  active: boolean;
  /** 用户角色集合 */
  roles: RoleType[];
  /** 创建时间 */
  createDate: string;
  /** 最后修改时间 */
  lastModificationDate: string;
}

/** 角色表 */
export interface Role {
  /** Primary Key */
  id: number;
  /** 角色名称 (e.g., 'HR', 'Employee') */
  roleName: RoleType;
  /** 角色描述 */
  roleDescription: string;
  /** 创建时间 */
  createDate: string;
  /** 最后修改时间 */
  lastModificationDate: string;
}

/** 用户角色映射表 */
export interface UserRole {
  /** Primary Key */
  id: number;
  /** 用户 ID (Foreign Key -> User.ID) */
  userId: number;
  /** 角色 ID (Foreign Key -> Role.ID) */
  roleId: number;
  /** 激活标志 */
  activeFlag: boolean;
  /** 创建时间 */
  createDate: string;
  /** 最后修改时间 */
  lastModificationDate: string;
}

/** 注册 Token 表 */
export interface RegistrationToken {
  /** Primary Key */
  id: number;
  /** Token 字符串 (唯一) */
  token: string;
  /** 目标邮箱 */
  email: string;
  /** 过期时间 */
  expirationDate: string;
  /** 创建者 (HR User ID) */
  createBy: string;
  /** 创建者 User ID (后端字段 createdByUserId) */
  createdByUserId?: string;
  /** 创建时间 */
  createDate: string;
}

/** 登录响应 */
export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: User;
  role: RoleType;
  roles: RoleType[];
}
