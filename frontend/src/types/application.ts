/**
 * Application Service Types
 * 对应 MySQL 中的 ApplicationWorkFlow 和 DigitalDocument 表
 * 负责管理 Onboarding 和 VISA 申请的状态流转
 */

import { ApplicationStatus, ApplicationType } from './enums';

// Re-export request types
export type { CreateApplicationRequest, UpdateApplicationStatusRequest } from './request';

/** 申请工作流表 */
export interface ApplicationWorkFlow {
  /** Primary Key */
  id: number;
  /** 员工 ID (Foreign Key -> Employee.ID) */
  employeeId: string;
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

/** OPT 文档状态 */
export interface OPTDocumentStatus {
  status: 'Pending' | 'Approved' | 'Rejected';
  uploadDate?: string;
  comment?: string;
}

/** 申请详情 (包含员工信息) */
export interface ApplicationDetail extends ApplicationWorkFlow {
  employeeName: string;
  employeeEmail: string;
  // OPT 申请相关字段
  optReceipts?: OPTDocumentStatus;
  optEAD?: OPTDocumentStatus;
  i983?: OPTDocumentStatus;
  i20?: OPTDocumentStatus;
  // 文档列表
  documents?: Array<DigitalDocument & { filename?: string; uploadDate?: string; status?: string; comment?: string }>;
}
