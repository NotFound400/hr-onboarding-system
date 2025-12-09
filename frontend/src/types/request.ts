/**
 * Request DTOs (Data Transfer Objects)
 * 统一管理所有 API 请求接口
 * 注意：这些接口定义了前端向后端发送的数据结构
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
import type { Contact, Address, VisaStatus } from './employee';

// ==================== Authentication Requests ====================

/** 登录请求 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 注册请求 */
export interface RegisterRequest {
  token: string;
  username: string;
  email: string;
  password: string;
}

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
  userId: number;
}

// ==================== Employee Requests ====================

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
  SSN: string;
  DOB: string;
  startDate: string;
  driverLicense: string;
  driverLicenseExpiration: string;
  contact: Contact[];
  address: Address[];
  visaStatus: VisaStatus[];
}

/** 更新员工请求 */
export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  id: string; // MongoDB ObjectId
}

// ==================== Application Requests ====================

/** 创建申请请求 */
export interface CreateApplicationRequest {
  employeeId: string;
  type: ApplicationType;
  comment?: string;
}

/** 更新申请状态请求 */
export interface UpdateApplicationStatusRequest {
  id: number;
  status: ApplicationStatus;
  comment?: string;
}

// ==================== Housing Requests ====================

/** 创建房屋请求 */
export interface CreateHouseRequest {
  address: string;
  maxOccupancy?: number;
  maxOccupant?: number;
  landlordId?: number;
  landlord?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  facilityInfo?: string;
}

/** 更新房屋请求 */
export interface UpdateHouseRequest {
  id: number;
  address?: string;
  maxOccupant?: number;
  landlordId?: number;
}

/** 创建房东请求 */
export interface CreateLandlordRequest {
  firstName: string;
  lastName: string;
  email: string;
  cellPhone: string;
}

/** 创建设施请求 */
export interface CreateFacilityRequest {
  houseId: number;
  type: string;
  description: string;
  quantity: number;
}

/** 更新设施请求 */
export interface UpdateFacilityRequest {
  id: number;
  type?: string;
  description?: string;
  quantity?: number;
}

/** 创建报修工单请求 */
export interface CreateFacilityReportRequest {
  facilityId: number;
  title: string;
  description: string;
}

/** 更新报修状态请求 */
export interface UpdateFacilityReportStatusRequest {
  status: FacilityReportStatus;
}

/** 添加报修评论请求 */
export interface AddFacilityReportCommentRequest {
  comment: string;
}

// ==================== Employee Update Request DTO ====================

/**
 * 更新员工基本信息 DTO
 */
export interface UpdateEmployeeInfoDTO {
  id: number;
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
  employeeId: number;
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
  employeeId: number;
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
  employeeId: number;
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
  employeeId: number;
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
  applicationId: number;
  status: ApplicationStatus; // 'Approved' | 'Rejected'
  comment?: string; // 拒绝原因或审批备注
}

// ==================== Housing Request DTOs ====================

/**
 * 创建房屋 DTO
 */
export interface CreateHouseDTO {
  landlordId: number;
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
  houseId: number;
  type: string; // e.g., 'Bed', 'Mattress', 'Table'
  description: string;
  quantity: number;
}

/**
 * 创建设施报修工单 DTO
 */
export interface CreateFacilityReportDTO {
  facilityId: number;
  employeeId: number;
  title: string;
  description: string;
}

/**
 * 更新报修状态 DTO
 */
export interface UpdateFacilityReportStatusDTO {
  reportId: number;
  status: FacilityReportStatus;
}

/**
 * 添加报修评论 DTO
 */
export interface AddReportCommentDTO {
  reportId: number;
  employeeId: number;
  comment: string;
}

// ==================== Search & Filter DTOs ====================

/**
 * 员工搜索条件 DTO
 */
export interface EmployeeSearchDTO {
  keyword?: string; // 搜索姓名、邮箱
  visaType?: VisaStatusType;
  houseId?: number;
  startDateFrom?: string;
  startDateTo?: string;
}

/**
 * 申请筛选条件 DTO
 */
export interface ApplicationFilterDTO {
  status?: ApplicationStatus;
  type?: ApplicationType;
  employeeId?: number;
  createDateFrom?: string;
  createDateTo?: string;
}

/**
 * 报修筛选条件 DTO
 */
export interface FacilityReportFilterDTO {
  status?: FacilityReportStatus;
  houseId?: number;
  employeeId?: number;
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
