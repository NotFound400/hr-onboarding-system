/**
 * Application Service Types
 * 对应 MySQL 中的 ApplicationWorkFlow 和 DigitalDocument 表
 * 负责管理 Onboarding 和 VISA 申请的状态流转
 */

import { ApplicationStatus, ApplicationType } from './enums';

/** 申请工作流表 */
export interface ApplicationWorkFlow {
  /** Primary Key */
  id: number;
  /** 员工 ID (Foreign Key -> Employee.ID) */
  employeeId: number;
  /** 创建时间 */
  createDate: string;
  /** 最后修改时间 */
  lastModificationDate: string;
  /** 申请状态 */
  status: ApplicationStatus;
  /** 备注 (拒绝原因或 HR 备注) */
  comment: string;
  /** 申请类型 */
  type: ApplicationType;
}

/** 数字文档 (系统要求的文档模板配置表) */
export interface DigitalDocument {
  /** Primary Key */
  id: number;
  /** 文档类型 (e.g., 'I-983', 'I-20') */
  type: string;
  /** 是否必需 */
  isRequired: boolean;
  /** 模板 S3 URL */
  path: string;
  /** 文档描述 */
  description: string;
  /** 文档标题 */
  title: string;
}

/** 创建申请请求 */
export interface CreateApplicationRequest {
  employeeId: number;
  type: ApplicationType;
  comment?: string;
}

/** 更新申请状态请求 */
export interface UpdateApplicationStatusRequest {
  id: number;
  status: ApplicationStatus;
  comment?: string;
}

/** 申请详情 (包含员工信息) */
export interface ApplicationDetail extends ApplicationWorkFlow {
  employeeName: string;
  employeeEmail: string;
}
