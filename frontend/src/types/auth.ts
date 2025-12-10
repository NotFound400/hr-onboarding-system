/**
 * Auth-specific Types
 * 描述验证 Token 等 Auth 专属结构
 */

/** 注册 Token 验证响应 (来自 GET /api/auth/validate-token/{token}) */
export interface RegistrationTokenValidationResponse {
  id: number;
  token: string;
  email: string;
  expirationDate: string;
  createDate: string;
  createdByUserId?: string;
  createBy?: string;
}
