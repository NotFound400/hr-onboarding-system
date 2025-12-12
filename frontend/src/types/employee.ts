/**
 * Employee Service Types
 * 对应 MongoDB 文档存储，包含大量嵌套数组
 */

// Re-export request types
export type { CreateEmployeeRequest, UpdateEmployeeRequest } from './request';

/** 联系人 (包含 Reference 和 Emergency Contact) */
export interface Contact {
  /** UUID */
  id: string;
  /** 名 */
  firstName: string;
  /** 姓 */
  lastName: string;
  /** 手机号 */
  cellPhone: string;
  /** 备用电话 */
  alternatePhone?: string;
  /** 邮箱 */
  email: string;
  /** 关系 (Spouse/Parent/Sibling/Friend) */
  relationship: string;
  /** 联系人类型 (Emergency/Reference) */
  type: string;
}

/** 地址 (包含 Primary 和 Secondary) */
export interface Address {
  /** UUID */
  id: string;
  /** 地址行 1 */
  addressLine1: string;
  /** 地址行 2 */
  addressLine2?: string;
  /** 城市 */
  city: string;
  /** 州 */
  state: string;
  /** 邮编 */
  zipCode: string;
}

/** 签证状态 */
export interface VisaStatus {
  /** UUID */
  id: string;
  /** 签证类型 (H1B/F1/L1/OPT) */
  visaType: string;
  /** 激活标志 ('Y'/'N') */
  activeFlag: 'Y' | 'N';
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
  /** 最后修改时间 */
  lastModificationDate: string;
}

/** 个人文档 */
export interface PersonalDocument {
  /** 文档 ID (UUID) */
  id: string;
  /** S3 URL 路径 */
  path: string;
  /** 文档标题 (e.g., 'Passport', 'Driver License', 'I-94') */
  title: string;
  /** 备注 */
  comment: string;
  /** 创建时间 */
  createDate: string;
}

/** 员工实体 (MongoDB Document) */
export interface Employee {
  /** MongoDB ObjectId */
  id: string;
  /** 用户 ID (关联 Auth Service) */
  userID: number;
  /** 名 */
  firstName: string;
  /** 姓 */
  lastName: string;
  /** 中间名 */
  middleName?: string;
  /** 昵称/首选名 */
  preferredName?: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  cellPhone: string;
  /** 备用电话 */
  alternatePhone?: string;
  /** 性别 (Male/Female/Other) */
  gender: string;
  /** 社会安全号 */
  SSN: string;
  /** 出生日期 (ISO 8601 格式) */
  DOB: string;
  /** 入职日期 (ISO 8601 格式) */
  startDate: string;
  /** 离职日期 (ISO 8601 格式，可为 null) */
  endDate: string | null;
  /** 驾照号码 */
  driverLicense?: string;
  /** 驾照过期日期 (ISO 8601 格式) */
  driverLicenseExpiration?: string;
  /** 房屋 ID (关联 Housing Service) */
  houseID?: number;
  /** 联系人列表 (Emergency Contact 和 Reference) */
  contact: Contact[];
  /** 地址列表 */
  address: Address[];
  /** 签证状态列表 */
  visaStatus: VisaStatus[];
  /** 个人文档列表 */
  personalDocument: PersonalDocument[];
}
