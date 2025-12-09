/**
 * Employee API Service
 * 处理员工相关的 API 请求
 * 包含数据映射逻辑：将扁平表单数据转换为符合 DB 设计的嵌套结构
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import type { 
  Employee, 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest,
  Contact,
  Address,
  VisaStatus,
  PersonalDocument,
  ContactType,
  AddressType,
  VisaStatusType,
  Gender,
  ApiResponse
} from '../../types';

// ==================== Mock Data ====================
// Mock Employee #1: Approved Employee (employee/123) - Citizen, 已批准可访问员工门户
const MOCK_EMPLOYEE_APPROVED: Employee = {
  id: '507f1f77bcf86cd799439100',
  userID: 100, // 对应 employee 账号
  firstName: 'Emily',
  lastName: 'Johnson',
  middleName: 'Rose',
  preferredName: 'Em',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  email: 'employee@company.com',
  workEmail: 'emily.johnson@company.com',
  cellPhone: '555-123-4567',
  workPhone: '555-100-2001',
  alternatePhone: '555-987-6543',
  gender: 'Female' as Gender,
  SSN: '987-65-4321',
  DOB: '1992-05-20',
  startDate: '2024-01-15',
  endDate: '',
  title: 'Software Engineer',
  driverLicense: 'DL987654',
  driverLicenseExpiration: '2027-05-20',
  houseID: 1,
  contact: [
    {
      type: 'Reference' as ContactType,
      firstName: 'Robert',
      lastName: 'Williams',
      middleName: 'James',
      phone: '555-111-2222',
      email: 'robert.williams@company.com',
      relationship: 'Former Supervisor',
      address: '100 Business Park Dr, Austin, TX 78701',
    },
    {
      type: 'Emergency' as ContactType,
      firstName: 'Michael',
      lastName: 'Johnson',
      middleName: 'David',
      phone: '555-333-4444',
      email: 'michael.johnson@email.com',
      relationship: 'Spouse',
    },
  ],
  address: [
    {
      type: 'Primary' as AddressType,
      addressLine1: '456 Oak Street',
      addressLine2: 'Unit 12B',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
    {
      type: 'Secondary' as AddressType,
      addressLine1: '789 Pine Avenue',
      addressLine2: '',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
    },
  ],
  visaStatus: [
    {
      visaType: 'OPT' as VisaStatusType,
      activeFlag: true,
      startDate: '2024-01-15',
      endDate: '2025-12-31',
      lastModificationDate: '2024-01-15T00:00:00Z',
    },
  ],
  personalDocument: [
    {
      id: 1,
      path: 's3://bucket/documents/emily-driver-license.pdf',
      title: 'Driver License',
      comment: 'Valid until 2027',
      createDate: '2024-01-15T00:00:00Z',
    },
    {
      id: 2,
      path: 's3://bucket/documents/emily-i9.pdf',
      title: 'I-9 Form',
      comment: 'Employment eligibility verification',
      createDate: '2024-01-15T00:00:00Z',
    },
  ],
};

const MOCK_EMPLOYEE: ApiResponse<Employee> = {
  success: true,
  message: 'Employee retrieved successfully',
  data: MOCK_EMPLOYEE_APPROVED,
};

// Mock Employee #2: OPT Student (Non-Citizen with OPT visa) - 额外测试数据
const MOCK_EMPLOYEE_OPT: Employee = {
  id: '507f1f77bcf86cd799439011',
  userID: 1,
  firstName: 'Alice',
  lastName: 'Wang',
  middleName: 'Yi',
  preferredName: 'Allie',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  email: 'alice.wang@example.com',
  workEmail: 'alice.wang@company.com',
  cellPhone: '555-123-4567',
  workPhone: '555-200-2002',
  alternatePhone: '555-987-6543',
  gender: 'Female' as Gender,
  SSN: '987-65-4321',
  DOB: '1995-06-20',
  startDate: '2024-02-15',
  endDate: '',
  title: 'Junior Developer',
  driverLicense: 'CA98765432',
  driverLicenseExpiration: '2027-06-20',
  houseID: 1,
  contact: [
    {
      type: 'Reference' as ContactType,
      firstName: 'Tom',
      lastName: 'Chen',
      middleName: '',
      phone: '555-111-2222',
      email: 'tom.chen@example.com',
      relationship: 'Professor',
      address: 'Stanford University, Palo Alto, CA 94305',
    },
    {
      type: 'Emergency' as ContactType,
      firstName: 'Linda',
      lastName: 'Wang',
      middleName: '',
      phone: '555-333-4444',
      email: 'linda.wang@example.com',
      relationship: 'Mother',
    },
  ],
  address: [
    {
      type: 'Primary' as AddressType,
      addressLine1: '456 Oak Avenue',
      addressLine2: 'Unit 12',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
  ],
  visaStatus: [
    {
      visaType: 'OPT' as VisaStatusType,
      activeFlag: true,
      startDate: '2024-02-01',
      endDate: '2025-02-01',
      lastModificationDate: '2024-02-01T00:00:00Z',
    },
  ],
  personalDocument: [
    {
      id: 101,
      path: 's3://bucket/documents/alice-ead-card.pdf',
      title: 'EAD Card',
      comment: 'OPT EAD Card',
      createDate: '2024-02-01T00:00:00Z',
    },
    {
      id: 102,
      path: 's3://bucket/documents/alice-i20.pdf',
      title: 'I-20',
      comment: 'Current I-20',
      createDate: '2024-02-01T00:00:00Z',
    },
    {
      id: 103,
      path: 's3://bucket/documents/alice-driver-license.pdf',
      title: 'Driver License',
      comment: 'Valid until 2027',
      createDate: '2024-02-15T00:00:00Z',
    },
  ],
};

// Mock Employee #3: Green Card Holder
const MOCK_EMPLOYEE_GREEN_CARD: Employee = {
  id: '507f1f77bcf86cd799439101',
  userID: 101,
  firstName: 'Raj',
  lastName: 'Patel',
  middleName: '',
  preferredName: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj',
  email: 'raj.patel@example.com',
  workEmail: 'raj.patel@company.com',
  cellPhone: '555-444-5555',
  workPhone: '555-300-3003',
  alternatePhone: '',
  gender: 'Male' as Gender,
  SSN: '555-44-3333',
  DOB: '1988-11-05',
  startDate: '2024-03-01',
  endDate: '',
  title: 'DevOps Engineer',
  driverLicense: 'TX55443322',
  driverLicenseExpiration: '2028-11-05',
  houseID: 2,
  contact: [
    {
      type: 'Reference' as ContactType,
      firstName: 'Michael',
      lastName: 'Johnson',
      middleName: 'Robert',
      phone: '555-777-8888',
      email: 'michael.johnson@example.com',
      relationship: 'Former Supervisor',
      address: '321 Tech Park, Austin, TX 78701',
    },
    {
      type: 'Emergency' as ContactType,
      firstName: 'Priya',
      lastName: 'Patel',
      middleName: '',
      phone: '555-999-0000',
      email: 'priya.patel@example.com',
      relationship: 'Spouse',
    },
  ],
  address: [
    {
      type: 'Primary' as AddressType,
      addressLine1: '789 Silicon Valley Dr',
      addressLine2: '',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
  ],
  visaStatus: [
    {
      visaType: 'Green Card' as VisaStatusType,
      activeFlag: true,
      startDate: '2020-01-15',
      endDate: '9999-12-31',
      lastModificationDate: '2024-03-01T00:00:00Z',
    },
  ],
  personalDocument: [
    {
      id: 201,
      path: 's3://bucket/documents/raj-green-card.pdf',
      title: 'Green Card',
      comment: 'Permanent Resident Card',
      createDate: '2024-03-01T00:00:00Z',
    },
  ],
};

// Mock Employee #4: OPT STEM Student (Mid-Process)
const MOCK_EMPLOYEE_OPT_STEM: Employee = {
  id: '507f1f77bcf86cd799439102',
  userID: 102,
  firstName: 'Chen',
  lastName: 'Wei',
  middleName: '',
  preferredName: 'David',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen',
  email: 'chen.wei@example.com',
  workEmail: 'chen.wei@company.com',
  cellPhone: '555-666-7777',
  workPhone: '555-400-4004',
  alternatePhone: '',
  gender: 'Male' as Gender,
  SSN: '555-66-7777',
  DOB: '1998-03-12',
  startDate: '2024-06-01',
  endDate: '',
  title: 'Software Engineer',
  driverLicense: 'CA88776655',
  driverLicenseExpiration: '2026-03-12',
  houseID: 1,
  contact: [
    {
      type: 'Emergency' as ContactType,
      firstName: 'Wei',
      lastName: 'Chen',
      middleName: '',
      phone: '555-888-9999',
      email: 'wei.chen@example.com',
      relationship: 'Father',
    },
  ],
  address: [
    {
      type: 'Primary' as AddressType,
      addressLine1: '456 University Ave',
      addressLine2: 'Apt 3B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
  ],
  visaStatus: [
    {
      visaType: 'F1' as VisaStatusType,
      activeFlag: true,
      startDate: '2024-06-01',
      endDate: '2027-06-01',
      lastModificationDate: '2024-06-01T00:00:00Z',
    },
  ],
  personalDocument: [
    // Already uploaded: I-983, I-20, OPT Receipt
    {
      id: 301,
      path: 's3://bucket/documents/chen-i983.pdf',
      title: 'I-983',
      comment: 'Training Plan for STEM OPT',
      createDate: '2024-06-05T00:00:00Z',
    },
    {
      id: 302,
      path: 's3://bucket/documents/chen-i20.pdf',
      title: 'I-20',
      comment: 'Certificate of Eligibility',
      createDate: '2024-06-08T00:00:00Z',
    },
    {
      id: 303,
      path: 's3://bucket/documents/chen-opt-receipt.pdf',
      title: 'OPT Receipt',
      comment: 'I-797 Receipt Notice',
      createDate: '2024-06-10T00:00:00Z',
    },
    // OPT EAD not yet uploaded - pending
  ],
};

const MOCK_EMPLOYEE_LIST: ApiResponse<Employee[]> = {
  success: true,
  message: 'Employees retrieved successfully',
  data: [
    MOCK_EMPLOYEE_APPROVED, // userID=100, employee/123
    MOCK_EMPLOYEE_OPT,      // userID=1, 额外测试
    MOCK_EMPLOYEE_GREEN_CARD, // userID=2
    MOCK_EMPLOYEE_OPT_STEM,   // userID=3
  ],
};

// ==================== API Functions ==

/**
 * 获取所有员工列表
 * @returns Promise<Employee[]>
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_EMPLOYEE_LIST.data!;
  }
  
  return axiosClient.get('/employees') as Promise<Employee[]>;
};

/**
 * 根据 ID 获取员工详情
 * @param id 员工 ID
 * @returns Promise<Employee>
 */
export const getEmployeeById = async (id: string): Promise<Employee> => {
  if (isMockMode()) {
    await delay(300);
    // 根据 ID 返回对应的员工数据
    const employee = MOCK_EMPLOYEE_LIST.data!.find(emp => emp.id === id);
    return employee || MOCK_EMPLOYEE.data!;
  }
  
  return axiosClient.get(`/employees/${id}`) as Promise<Employee>;
};

/**
 * 根据 User ID 获取员工详情
 * @param userId 用户 ID
 * @returns Promise<Employee>
 */
export const getEmployeeByUserId = async (userId: string): Promise<Employee> => {
  if (isMockMode()) {
    await delay(300);
    // 根据 userID 查找对应的员工
    const userIdNum = parseInt(userId, 10);
    const employee = MOCK_EMPLOYEE_LIST.data!.find(emp => emp.userID === userIdNum);
    return employee || MOCK_EMPLOYEE.data!;
  }
  
  return axiosClient.get(`/employees/user/${userId}`) as Promise<Employee>;
};

/**
 * 创建员工 (Onboarding)
 * 注意: 此函数接收符合 DB 结构的嵌套数据
 * @param data 创建员工请求数据
 * @returns Promise<Employee>
 */
export const createEmployee = async (data: CreateEmployeeRequest): Promise<Employee> => {
  if (isMockMode()) {
    console.log('[Mock Request] createEmployee:', data);
    await delay(800);
    return {
      ...MOCK_EMPLOYEE.data!,
      ...data,
      id: `507f1f77bcf86cd7994${Date.now().toString().slice(-5)}`,
    };
  }
  
  return axiosClient.post('/employees', data) as Promise<Employee>;
};

/**
 * 更新员工信息
 * @param data 更新员工请求数据
 * @returns Promise<Employee>
 */
export const updateEmployee = async (data: UpdateEmployeeRequest): Promise<Employee> => {
  if (isMockMode()) {
    console.log('[Mock Request] updateEmployee:', data);
    await delay(500);
    return {
      ...MOCK_EMPLOYEE.data!,
      ...data,
      id: data.id?.toString() || MOCK_EMPLOYEE.data!.id,
    };
  }
  
  return axiosClient.put(`/employees/${data.id}`, data) as Promise<Employee>;
};

/**
 * 删除员工
 * @param id 员工 ID
 * @returns Promise<void>
 */
export const deleteEmployee = async (id: string): Promise<void> => {
  if (isMockMode()) {
    console.log('[Mock Request] deleteEmployee:', { id });
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/employees/${id}`);
};

/**
 * 上传员工个人文档
 * @param employeeId 员工 ID
 * @param file 文件对象
 * @param title 文档标题
 * @param comment 备注
 * @returns Promise<PersonalDocument>
 */
export const uploadPersonalDocument = async (
  employeeId: string,
  file: File,
  title: string,
  comment?: string
): Promise<PersonalDocument> => {
  if (isMockMode()) {
    console.log('[Mock Request] uploadPersonalDocument:', { employeeId, fileName: file.name, title, comment });
    await delay(1000);
    return {
      id: Date.now(),
      path: `s3://bucket/documents/${file.name}`,
      title,
      comment: comment || '',
      createDate: new Date().toISOString(),
    };
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  if (comment) formData.append('comment', comment);
  
  return axiosClient.post(
    `/employees/${employeeId}/documents`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  ) as Promise<PersonalDocument>;
};

/**
 * 删除员工个人文档
 * @param employeeId 员工 ID
 * @param documentId 文档 ID
 * @returns Promise<void>
 */
export const deletePersonalDocument = async (
  employeeId: string,
  documentId: string
): Promise<void> => {
  if (isMockMode()) {
    console.log('[Mock Request] deletePersonalDocument:', { employeeId, documentId });
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/employees/${employeeId}/documents/${documentId}`);
};

// ==================== 数据映射工具函数 ====================

/**
 * 将扁平的 Onboarding 表单数据转换为符合 DB 设计的嵌套结构
 * 示例: 表单中的 refName, refPhone 等字段需要转换为 contacts 数组
 */
export interface OnboardingFormData {
  // Basic Info
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
  
  // Driver License
  driverLicense: string;
  driverLicenseExpiration: string;
  
  // Reference Contact (扁平字段)
  refName: string;
  refPhone: string;
  refEmail: string;
  refRelationship: string;
  
  // Emergency Contact (扁平字段)
  emergencyName: string;
  emergencyPhone: string;
  emergencyEmail: string;
  emergencyRelationship: string;
  
  // Address (扁平字段)
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Visa Status
  visaType: VisaStatusType;
  visaStartDate: string;
  visaEndDate: string;
}

/**
 * 转换扁平表单数据为嵌套结构
 */
export const mapOnboardingFormToEmployeeRequest = (
  formData: OnboardingFormData,
  userId: number
): CreateEmployeeRequest => {
  // 构建 contact 数组
  const contact: Contact[] = [
    {
      type: 'Reference' as ContactType,
      firstName: formData.refName.split(' ')[0] || formData.refName,
      lastName: formData.refName.split(' ').slice(1).join(' ') || '',
      phone: formData.refPhone,
      email: formData.refEmail,
      relationship: formData.refRelationship,
    },
    {
      type: 'Emergency' as ContactType,
      firstName: formData.emergencyName.split(' ')[0] || formData.emergencyName,
      lastName: formData.emergencyName.split(' ').slice(1).join(' ') || '',
      phone: formData.emergencyPhone,
      email: formData.emergencyEmail,
      relationship: formData.emergencyRelationship,
    },
  ];
  
  // 构建 address 数组
  const address: Address[] = [
    {
      type: 'Primary' as AddressType,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || '',
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
    },
  ];
  
  // 构建 visaStatus 数组
  const visaStatus: VisaStatus[] = [
    {
      visaType: formData.visaType,
      activeFlag: true,
      startDate: formData.visaStartDate,
      endDate: formData.visaEndDate,
      lastModificationDate: new Date().toISOString(),
    },
  ];
  
  return {
    userId,
    firstName: formData.firstName,
    lastName: formData.lastName,
    middleName: formData.middleName,
    preferredName: formData.preferredName,
    email: formData.email,
    cellPhone: formData.cellPhone,
    alternatePhone: formData.alternatePhone,
    gender: formData.gender,
    SSN: formData.ssn,
    DOB: formData.dob,
    startDate: formData.startDate,
    driverLicense: formData.driverLicense,
    driverLicenseExpiration: formData.driverLicenseExpiration,
    contact,
    address,
    visaStatus,
  };
};
