/**
 * Employee Service Types
 * 对应 MongoDB 文档存储，包含大量嵌套数组
 */

import { ContactType, AddressType, VisaStatusType, Gender } from './enums';

/** 联系人 (包含 Reference 和 Emergency Contact) */
export interface Contact {
  /** 联系人类型 */
  type: ContactType;
  /** 姓名 */
  name: string;
  /** 电话 */
  phone: string;
  /** 邮箱 */
  email: string;
  /** 关系 */
  relationship: string;
}

/** 地址 (包含 Primary 和 Secondary) */
export interface Address {
  /** 地址类型 */
  type: AddressType;
  /** 地址行 1 */
  addressLine1: string;
  /** 地址行 2 */
  addressLine2: string;
  /** 城市 */
  city: string;
  /** 州 */
  state: string;
  /** 邮编 */
  zipCode: string;
}

/** 签证状态 */
export interface VisaStatus {
  /** 签证类型 */
  visaType: VisaStatusType;
  /** 激活标志 */
  activeFlag: boolean;
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
  /** 最后修改时间 */
  lastModificationDate: string;
}

/** 个人文档 */
export interface PersonalDocument {
  /** 文档 ID */
  id: number;
  /** S3 URL 路径 */
  path: string;
  /** 文档标题 (e.g., 'Driver License', 'OPT Receipt') */
  title: string;
  /** 备注 */
  comment: string;
  /** 创建时间 */
  createDate: string;
}

/** 员工实体 (MongoDB Document) */
export interface Employee {
  /** ObjectId (Number) */
  id: number;
  /** 用户 ID (Ref -> Auth.User.ID) */
  userId: number;
  /** 名 */
  firstName: string;
  /** 姓 */
  lastName: string;
  /** 中间名 */
  middleName: string;
  /** 昵称/首选名 */
  preferredName: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  cellPhone: string;
  /** 备用电话 */
  alternatePhone: string;
  /** 性别 */
  gender: Gender;
  /** 社会安全号 */
  ssn: string;
  /** 出生日期 */
  dob: string;
  /** 入职日期 */
  startDate: string;
  /** 离职日期 */
  endDate: string;
  /** 驾照号码 */
  driverLicense: string;
  /** 驾照过期日期 */
  driverLicenseExpiration: string;
  /** 房屋 ID (Ref -> HousingService.House.ID) */
  houseId: number;
  /** 联系人列表 (包含 Reference 和 Emergency，通过 type 区分) */
  contacts: Contact[];
  /** 地址列表 (包含 Primary 和 Secondary) */
  addresses: Address[];
  /** 签证状态列表 */
  visaStatuses: VisaStatus[];
  /** 个人文档列表 */
  personalDocuments: PersonalDocument[];
}

/** 创建员工请求 (用于 Onboarding 表单提交) */
export interface CreateEmployeeRequest {
  userId: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  cellPhone: string;
  alternatePhone?: string;
  gender: Gender;
  ssn: string;
  dob: string;
  startDate: string;
  driverLicense: string;
  driverLicenseExpiration: string;
  contacts: Contact[];
  addresses: Address[];
  visaStatuses: VisaStatus[];
}

/** 更新员工请求 */
export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  id: number;
}
