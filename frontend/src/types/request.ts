/**
 * Request DTOs (Data Transfer Objects)
 * 统一管理所有 API 请求接口
 * 注意：这些接口定义了前端向后端发送的数据结构
 * 
 * 清理标准：仅保留 raw_project_requirement.md 中明确提及的功能
 */

import type {
  Gender,
  VisaStatusType,
  ApplicationType,
  ApplicationStatus
} from './enums';
import type { Contact, Address, VisaStatus } from './employee';

// ==================== Authentication Requests ====================

/** 登录请求 (Section 2 + HR Section 1) */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

/** 注册请求 (Section 1 + Section 3.a) */
export interface RegisterRequest {
  token: string;
  username: string;
  email: string;
  password: string;
}

/**
 * HR 生成注册 Token 请求 (HR Section 5.a)
 */
export interface GenerateTokenRequest {
  email: string;
}

// ==================== Onboarding Request DTO ====================

/**
 * Onboarding 表单提交 DTO (Section 3.c)
 * 扁平结构，方便表单收集
 * Service 层会将此 DTO 映射为符合 DB 设计的嵌套结构
 */
export interface OnboardingFormDTO {
  // ===== Personal Information (Section 3.c.i) =====
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  
  // ===== Contact (Section 3.c.iv + v) =====
  email: string; // Pre-filled, not editable (Section 3.c.v)
  cellPhone: string;
  workPhone?: string;
  
  // ===== Identity (Section 3.c.vi) =====
  gender: Gender;
  ssn: string;
  dob: string; // ISO date string
  
  // ===== Employment =====
  startDate: string; // ISO date string
  
  // ===== Avatar (Section 3.c.ii) =====
  avatar?: string; // URL or base64
  
  // ===== Driver License (Section 3.c.viii) =====
  hasDriverLicense: boolean;
  driverLicense?: string;
  driverLicenseExpiration?: string; // ISO date string
  driverLicenseCopy?: string; // Document path
  
  // ===== Citizenship/Visa (Section 3.c.vii) =====
  isCitizenOrPR: boolean; // "Are you a citizen or permanent resident of the U.S.?"
  citizenshipType?: 'Citizen' | 'Green Card'; // If isCitizenOrPR = true
  visaType?: VisaStatusType; // If isCitizenOrPR = false
  workAuthorizationTitle?: string; // If visaType = 'Other'
  visaStartDate?: string; // ISO date string
  visaEndDate?: string; // ISO date string
  workAuthorizationDocument?: string; // Document path (required for non-citizens)
  
  // ===== Reference Contact (Section 3.c.ix) =====
  referenceFirstName: string;
  referenceLastName: string;
  referenceMiddleName?: string;
  referencePhone: string;
  referenceEmail: string;
  referenceRelationship: string;
  referenceAddress?: string;
  
  // ===== Emergency Contact (Section 3.c.x - at least one) =====
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyMiddleName?: string;
  emergencyPhone: string;
  emergencyEmail: string;
  emergencyRelationship: string;
  
  // ===== Current Address (Section 3.c.iii) =====
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}

// ==================== Employee Requests ====================

/** 创建员工请求 (用于 Onboarding 表单提交 - Section 3) */
export interface CreateEmployeeRequest {
  userId: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  avatar?: string;
  email: string;
  workEmail?: string;
  cellPhone: string;
  workPhone?: string;
  alternatePhone?: string;
  gender: Gender;
  SSN: string;
  DOB: string;
  startDate: string;
  endDate?: string;
  title?: string;
  driverLicense?: string;
  driverLicenseExpiration?: string;
  contact: Contact[];
  address: Address[];
  visaStatus: VisaStatus[];
}

/** 更新员工请求 (Section 6.c - Edit Functionality) */
export interface UpdateEmployeeRequest {
  id: string; // MongoDB ObjectId
  firstName?: string;
  lastName?: string;
  middleName?: string;
  preferredName?: string;
  email?: string;
  workEmail?: string;
  cellPhone?: string;
  workPhone?: string;
  alternatePhone?: string;
  gender?: Gender;
  DOB?: string;
  driverLicense?: string;
  driverLicenseExpiration?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  address?: Address[];
  contact?: Contact[];
}

// ==================== Application Requests ====================

/** 创建申请请求 (Section 3.e - Submit onboarding application) */
export interface CreateApplicationRequest {
  employeeId: string;
  type: ApplicationType;
  comment?: string;
}

/** 更新申请状态请求 (HR Section 5.b.iv - Approve/Reject) */
export interface UpdateApplicationStatusRequest {
  id: number;
  status: ApplicationStatus;
  comment?: string; // Required when rejecting (HR Section 5.b.iv)
}

// ==================== Housing Requests ====================

/** 创建房屋请求 (HR Section 6.a - Add house) */
export interface CreateHouseRequest {
  address: string;
  maxOccupant: number; // 统一使用 maxOccupant (符合 DB Design)
  landlord: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  facilityInfo?: string; // Optional (e.g., "3 beds, 2 baths")
}

/** 更新房屋请求 */
export interface UpdateHouseRequest {
  id: number;
  address?: string;
  maxOccupant?: number;
  facilityInfo?: string;
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
  type: string; // 'Bed', 'Mattress', 'Table', 'Chair'
  description: string;
  quantity: number;
}

/** 更新设施请求 */
export interface UpdateFacilityRequest {
  id: number;
  description?: string;
  quantity?: number;
}

/** 创建报修工单请求 (Section 8.c - Report facility issue) */
export interface CreateFacilityReportRequest {
  houseId: number;
  employeeId: string; // MongoDB ObjectId
  title: string;
  description: string;
}

/** 更新报修状态请求 (HR Section 6.c.iii) */
export interface UpdateFacilityReportStatusRequest {
  reportId: number;
  status: 'Open' | 'In Progress' | 'Closed'; // 明确使用字符串字面量
}

/** 添加报修评论请求 (Section 8.c - Add comments) */
export interface AddFacilityReportCommentRequest {
  reportId: number;
  employeeId: string; // MongoDB ObjectId
  comment: string;
}

/** 更新报修评论请求 (Section 8.c - Update comments they created) */
export interface UpdateFacilityReportCommentRequest {
  commentId: number;
  comment: string;
}

// ==================== Document Upload Request (Section 3.d + 7.b) ====================

/**
 * 上传个人文档请求
 * Used for:
 * - Section 3.d: Upload completed and signed documents
 * - Section 7.b: Upload I-20, OPT STEM Receipt, OPT STEM EAD
 */
export interface UploadDocumentRequest {
  employeeId: string; // MongoDB ObjectId
  file: File;
  title: string; // e.g., 'Driver License', 'I-20', 'OPT Receipt'
  comment?: string;
}

// ==================== Employee Search (HR Section 3.b.iii) ====================

/**
 * 员工搜索请求 (HR Section 3.b.iii - Search by name)
 */
export interface EmployeeSearchRequest {
  keyword: string; // Search by First Name OR Last Name OR Preferred Name
}
