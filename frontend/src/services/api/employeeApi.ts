/**
 * Employee API Service
 * 处理员工相关的 API 请求
 * 包含数据映射逻辑：将扁平表单数据转换为符合 DB 设计的嵌套结构
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '@/utils/mockUtils';
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
  Gender
} from '@/types';

// ==================== Mock Data ====================
const MOCK_EMPLOYEE: Employee = {
  id: 1,
  userId: 1,
  firstName: 'John',
  lastName: 'Doe',
  middleName: 'Michael',
  preferredName: 'Johnny',
  email: 'john.doe@example.com',
  cellPhone: '123-456-7890',
  alternatePhone: '098-765-4321',
  gender: 'Male' as Gender,
  ssn: '123-45-6789',
  dob: '1990-01-15',
  startDate: '2024-01-01',
  endDate: '',
  driverLicense: 'DL123456',
  driverLicenseExpiration: '2026-01-15',
  houseId: 1,
  contacts: [
    {
      type: 'Reference' as ContactType,
      name: 'Jane Smith',
      phone: '111-222-3333',
      email: 'jane.smith@example.com',
      relationship: 'Former Manager',
    },
    {
      type: 'Emergency' as ContactType,
      name: 'Mary Doe',
      phone: '444-555-6666',
      email: 'mary.doe@example.com',
      relationship: 'Spouse',
    },
  ],
  addresses: [
    {
      type: 'Primary' as AddressType,
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
  ],
  visaStatuses: [
    {
      visaType: 'H1B' as VisaStatusType,
      activeFlag: true,
      startDate: '2024-01-01',
      endDate: '2027-01-01',
      lastModificationDate: '2024-01-01T00:00:00Z',
    },
  ],
  personalDocuments: [
    {
      id: 1,
      path: 's3://bucket/documents/driver-license.pdf',
      title: 'Driver License',
      comment: 'Valid until 2026',
      createDate: '2024-01-01T00:00:00Z',
    },
  ],
};

const MOCK_EMPLOYEE_LIST: Employee[] = [
  MOCK_EMPLOYEE,
  {
    ...MOCK_EMPLOYEE,
    id: 2,
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
  },
];

// ==================== API Functions ==

/**
 * 获取所有员工列表
 * @returns Promise<Employee[]>
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_EMPLOYEE_LIST;
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
    return MOCK_EMPLOYEE;
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
    return MOCK_EMPLOYEE;
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
    await delay(800);
    return {
      ...MOCK_EMPLOYEE,
      ...data,
      id: Date.now(),
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
    await delay(500);
    return {
      ...MOCK_EMPLOYEE,
      ...data,
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
  // 构建 contacts 数组
  const contacts: Contact[] = [
    {
      type: 'Reference' as ContactType,
      name: formData.refName,
      phone: formData.refPhone,
      email: formData.refEmail,
      relationship: formData.refRelationship,
    },
    {
      type: 'Emergency' as ContactType,
      name: formData.emergencyName,
      phone: formData.emergencyPhone,
      email: formData.emergencyEmail,
      relationship: formData.emergencyRelationship,
    },
  ];
  
  // 构建 addresses 数组
  const addresses: Address[] = [
    {
      type: 'Primary' as AddressType,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || '',
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
    },
  ];
  
  // 构建 visaStatuses 数组
  const visaStatuses: VisaStatus[] = [
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
    ssn: formData.ssn,
    dob: formData.dob,
    startDate: formData.startDate,
    driverLicense: formData.driverLicense,
    driverLicenseExpiration: formData.driverLicenseExpiration,
    contacts,
    addresses,
    visaStatuses,
  };
};
