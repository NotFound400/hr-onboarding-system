/**
 * Auth-specific Types
 * 描述验证 Token 等 Auth 专属结构
 */

export interface RegistrationTokenHouseContext {
  id: number;
  address?: string;
}

/** 注册 Token 验证响应 (来自 GET /api/auth/validate-token/{token}) */
export interface RegistrationTokenValidationResponse {
  id: number;
  token: string;
  email: string;
  expirationDate: string;
  createDate: string;
  createdByUserId?: string;
  createBy?: string;
  /** 员工预分配到的房屋 ID (如果没有则为 null) */
  houseId: number | null;
  /** 🆕 后端返回的房屋上下文信息 */
  houseContext?: RegistrationTokenHouseContext | null;
  /** 兼容旧字段：直接提供房屋地址 */
  houseAddress?: string | null;
}
