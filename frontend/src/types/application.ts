
import { ApplicationStatus, ApplicationType } from './enums';
import type { Employee } from './employee';

export type { 
  CreateApplicationRequest, 
  UpdateApplicationRequest,
  ApproveApplicationRequest,
  RejectApplicationRequest,
  UploadDocumentRequest,
  UpdateDocumentRequest
} from './request';


/** 
 * 申请工作流 (对应 API 返回的 Application 对象)
 * Endpoints: POST /api, GET /api/{applicationId}, etc.
 */
export interface Application {
  /** 申请 ID */
  id: number;
  /** 员工 ID */
  employeeId: string;
  /** 创建时间 (ISO 8601) */
  createDate: string;
  /** 最后修改时间 (ISO 8601) */
  lastModificationDate: string;
  /** 申请状态: Open, Pending, Rejected, Approved */
  status: ApplicationStatus;
  /** 备注 (申请说明或 HR 反馈) */
  comment: string;
  /** 申请类型: ONBOARDING, OPT */
  applicationType: ApplicationType;
}

export interface ApplicationListItem {
  id: number;
  employeeId: string;
  status: ApplicationStatus;
  comment: string;
  applicationType: ApplicationType;
}

export interface ApplicationWithEmployeeInfo extends Application {
  employee?: Employee;
  employeeName?: string;
  employeeEmail?: string;
}


/** 
 * 文档对象 (对应 API 返回的 Document)
 * Endpoints: GET /api/documents/*, POST /api/documents/upload, etc.
 */
export interface ApplicationDocument {
  /** 文档 ID */
  id: number;
  /** 文档类型 (I-20, PASSPORT, RESUME, I-983, etc.) */
  type: string;
  /** 是否为必需文档 */
  isRequired: boolean;
  /** 文档存储路径 (S3 URL) */
  path: string;
  /** 文档描述 */
  description: string;
  /** 文档标题 */
  title: string;
  /** 关联的申请 ID */
  applicationId: number;
}

export interface DocumentMetadata {
  type: string;
  title: string;
  description: string;
  applicationId: number;
}


/** 
 * @deprecated 使用 Application 替代
 * 保留用于向后兼容
 */
export type ApplicationWorkFlow = Application;

/** 
 * @deprecated 使用 ApplicationDocument 替代
 * 保留用于向后兼容
 */
export type DigitalDocument = ApplicationDocument;

export interface ApplicationDetail extends Application {
  /** 员工姓名 (前端组装) */
  employeeName?: string;
  /** 员工邮箱 (前端组装) */
  employeeEmail?: string;
  /** 关联的文档列表 */
  documents?: ApplicationDocument[];
}
