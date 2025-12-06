/**
 * Request DTOs (Data Transfer Objects)
 * 为复杂操作定义前端友好的 Request 结构
 * 注意：这些 DTO 最终需能映射回符合 DB 设计的结构
 */

import type {
  Gender,
  VisaStatusType,
  ContactType,
  AddressType,
  ApplicationType,
  ApplicationStatus,
  FacilityReportStatus
} from './enums';

// ==================== Authentication Requests ====================

/**
 * 登录请求 DTO
 */
export interface LoginRequestDTO {
  username: string;
  password: string;
}

/**
 * 注册请求 DTO
 */
export interface RegisterRequestDTO {
  token: string;
  username: string;
  email: string;
  password: string;
}

/**
 * HR 生成注册 Token 请求
 */
export interface GenerateTokenRequestDTO {
  email: string;
  name?: string;
}

// ==================== Onboarding Request DTO ====================

/**
 * Onboarding 表单提交 DTO (扁平结构，方便表单收集)
 * Service 层会将此 DTO 映射为符合 DB 设计的嵌套结构
 */
export interface OnboardingFormDTO {
  // ===== Personal Information =====
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  cellPhone: string;
  alternatePhone?: string;
  gender: Gender;
  ssn: string;
  dob: string; // ISO date string
  startDate: string; // ISO date string
  
  // ===== Driver License =====
  driverLicense: string;
  driverLicenseExpiration: string; // ISO date string
  
  // ===== Reference Contact (扁平字段) =====
  referenceName: string;
  referencePhone: string;
  referenceEmail: string;
  referenceRelationship: string;
  
  // ===== Emergency Contact (扁平字段) =====
  emergencyName: string;
  emergencyPhone: string;
  emergencyEmail: string;
  emergencyRelationship: string;
  
  // ===== Current Address (扁平字段) =====
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // ===== Visa Status =====
  visaType: VisaStatusType;
  visaStartDate: string; // ISO date string
  visaEndDate: string; // ISO date string
}

/**
 * Onboarding 提交请求 DTO (包含 userId)
 */
export interface SubmitOnboardingRequestDTO extends OnboardingFormDTO {
  userId: string;
}

// ==================== Employee Update Request DTO ====================

/**
 * 更新员工基本信息 DTO
 */
export interface UpdateEmployeeInfoDTO {
  id: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  preferredName?: string;
  email?: string;
  cellPhone?: string;
  alternatePhone?: string;
}

/**
 * 添加联系人 DTO
 */
export interface AddContactDTO {
  employeeId: string;
  type: ContactType;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

/**
 * 更新联系人 DTO
 */
export interface UpdateContactDTO extends AddContactDTO {
  contactIndex: number; // 数组索引
}

/**
 * 添加地址 DTO
 */
export interface AddAddressDTO {
  employeeId: string;
  type: AddressType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * 更新地址 DTO
 */
export interface UpdateAddressDTO extends AddAddressDTO {
  addressIndex: number; // 数组索引
}

/**
 * 更新签证状态 DTO
 */
export interface UpdateVisaStatusDTO {
  employeeId: string;
  visaType: VisaStatusType;
  startDate: string;
  endDate: string;
  activeFlag: boolean;
}

// ==================== Document Upload Request DTO ====================

/**
 * 上传个人文档 DTO
 */
export interface UploadDocumentDTO {
  employeeId: string;
  file: File;
  title: string;
  comment?: string;
}

// ==================== Application Request DTOs ====================

/**
 * 创建申请 DTO
 */
export interface CreateApplicationDTO {
  employeeId: string;
  type: ApplicationType;
  comment?: string;
}

/**
 * HR 审批申请 DTO
 */
export interface ReviewApplicationDTO {
  applicationId: string;
  status: ApplicationStatus; // 'Approved' | 'Rejected'
  comment?: string; // 拒绝原因或审批备注
}

// ==================== Housing Request DTOs ====================

/**
 * 创建房屋 DTO
 */
export interface CreateHouseDTO {
  landlordId: string;
  address: string;
  maxOccupant: number;
}

/**
 * 创建房东 DTO
 */
export interface CreateLandlordDTO {
  firstName: string;
  lastName: string;
  email: string;
  cellPhone: string;
}

/**
 * 添加设施 DTO
 */
export interface AddFacilityDTO {
  houseId: string;
  type: string; // e.g., 'Bed', 'Mattress', 'Table'
  description: string;
  quantity: number;
}

/**
 * 创建设施报修工单 DTO
 */
export interface CreateFacilityReportDTO {
  facilityId: string;
  employeeId: string;
  title: string;
  description: string;
}

/**
 * 更新报修状态 DTO
 */
export interface UpdateFacilityReportStatusDTO {
  reportId: string;
  status: FacilityReportStatus;
}

/**
 * 添加报修评论 DTO
 */
export interface AddReportCommentDTO {
  reportId: string;
  employeeId: string;
  comment: string;
}

// ==================== Search & Filter DTOs ====================

/**
 * 员工搜索条件 DTO
 */
export interface EmployeeSearchDTO {
  keyword?: string; // 搜索姓名、邮箱
  visaType?: VisaStatusType;
  houseId?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

/**
 * 申请筛选条件 DTO
 */
export interface ApplicationFilterDTO {
  status?: ApplicationStatus;
  type?: ApplicationType;
  employeeId?: string;
  createDateFrom?: string;
  createDateTo?: string;
}

/**
 * 报修筛选条件 DTO
 */
export interface FacilityReportFilterDTO {
  status?: FacilityReportStatus;
  houseId?: string;
  employeeId?: string;
  facilityType?: string;
}

// ==================== Pagination DTO ====================

/**
 * 分页请求 DTO
 */
export interface PaginationDTO {
  page: number; // 页码 (从 1 开始)
  pageSize: number; // 每页条数
  sortBy?: string; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
}

/**
 * 分页响应 DTO
 */
export interface PaginatedResponseDTO<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
