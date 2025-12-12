/**
 * Employee API Service
 * 处理员工相关的 API 请求
 * 包含数据映射逻辑：将扁平表单数据转换为符合 DB 设计的嵌套结构
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import * as EmployeeMocks from '../mocks/employeeMocks';
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
} from '../../types';

// ==================== API Functions ==

/**
 * 获取所有员工列表
 * @returns Promise<Employee[]>
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  if (isMockMode()) {
    await delay(500);
    // return EmployeeMocks.MOCK_EMPLOYEE_LIST.data!; // 🟢 默认员工列表
    // return [
    //   EmployeeMocks.SCENARIO_USER_REJECTED,
    //   EmployeeMocks.SCENARIO_USER_NO_AVATAR,
    //   EmployeeMocks.SCENARIO_USER_VISA_STEP1,
    // ]; // 🔴 场景：混合拒绝/缺头像/无签证文档
    return EmployeeMocks.MOCK_EMPLOYEE_LIST.data!;
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
    const employee = EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.find(emp => emp.id === id);
    // return EmployeeMocks.SCENARIO_USER_REJECTED; // 🔴 快速切换到被拒 onboarding
    return employee || EmployeeMocks.MOCK_EMPLOYEE.data!;
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
    const employee = EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.find(emp => emp.userID === userIdNum);
    if (!employee) {
      throw new Error(`Employee not found for userId=${userId}`);
    }
    // return EmployeeMocks.SCENARIO_USER_VISA_STEP1; // 🔴 没有签证文档时锁定流程
    return employee;
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
    // return EmployeeMocks.SCENARIO_USER_NO_AVATAR; // 🔴 模拟缺少头像的 Onboarding 数据
    return {
      ...EmployeeMocks.MOCK_EMPLOYEE.data!,
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
    // return EmployeeMocks.SCENARIO_USER_REJECTED; // 🔴 强制返回带 feedback 的员工
    return {
      ...EmployeeMocks.MOCK_EMPLOYEE.data!,
      ...data,
      id: data.id?.toString() || EmployeeMocks.MOCK_EMPLOYEE.data!.id,
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
