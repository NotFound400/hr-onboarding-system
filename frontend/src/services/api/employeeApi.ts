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
  PersonalDocument,
} from '../../types';

// ==================== Type Definitions ====================

/** 分页响应结构 (Spring Data Page) */
export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

/** 分页查询参数 */
export interface PageQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

const normalizeEmployeeResponse = (
  data: Employee | (Employee & { dob?: string; ssn?: string })
): Employee => {
  if (!data) {
    return data as Employee;
  }

  const { dob, ssn, ...rest } = data as Employee & { dob?: string; ssn?: string };
  return {
    ...rest,
    DOB: data.DOB ?? dob ?? '',
    SSN: data.SSN ?? ssn ?? '',
  };
};

const normalizeEmployeeArray = (employees: Employee[]): Employee[] =>
  employees.map(normalizeEmployeeResponse);

const normalizeEmployeePage = (page: PageResponse<Employee>): PageResponse<Employee> => ({
  ...page,
  content: normalizeEmployeeArray(page.content),
});

const transformEmployeeRequestPayload = <
  T extends { DOB?: string; dob?: string; SSN?: string; ssn?: string }
>(
  payload: T
) => {
  const { DOB, SSN, ...rest } = payload;
  const normalized = {
    ...rest,
    dob: DOB ?? payload.dob,
    ssn: SSN ?? payload.ssn,
  };

  const changes = (payload as unknown as { changedFields?: string[] }).changedFields;
  if (Array.isArray(changes) && changes.length > 0) {
    const allowed = new Set(['id', 'userID', 'houseID']);
    const filtered: Record<string, unknown> = {};
    changes.forEach((field) => {
      if (allowed.has(field)) {
        filtered[field] = (payload as Record<string, unknown>)[field];
      } else if (field === 'DOB' || field === 'dob') {
        filtered['dob'] = normalized.dob;
      } else if (field === 'SSN' || field === 'ssn') {
        filtered['ssn'] = normalized.ssn;
      } else {
        filtered[field] = (payload as Record<string, unknown>)[field];
      }
    });

    return filtered;
  }

  return normalized;
};

// ==================== API Functions ==

/**
 * 获取所有员工列表（无分页）
 * @returns Promise<Employee[]>
 */
export const getAllEmployees = async (
  options?: { forceReal?: boolean }
): Promise<Employee[]> => {
  const shouldUseMock = !options?.forceReal && isMockMode();
  if (shouldUseMock) {
    await delay(500);
    return EmployeeMocks.MOCK_EMPLOYEE_LIST.data!;
  }
  
  const response = (await axiosClient.get('/employees')) as Employee[];
  return normalizeEmployeeArray(response);
};

/**
 * 获取员工列表（分页）
 * Endpoint: GET /api/employees/page
 * @param params 分页查询参数
 * @returns Promise<PageResponse<Employee>>
 */
export const getEmployeesPage = async (params?: PageQueryParams): Promise<PageResponse<Employee>> => {
  if (isMockMode()) {
    await delay(500);
    const page = params?.page || 0;
    const size = params?.size || 3;
    const allEmployees = EmployeeMocks.MOCK_EMPLOYEE_LIST.data!;
    
    const start = page * size;
    const end = start + size;
    const content = allEmployees.slice(start, end);
    
    return {
      content,
      pageable: {
        sort: { sorted: true, unsorted: false, empty: false },
        pageNumber: page,
        pageSize: size,
        offset: start,
        paged: true,
        unpaged: false,
      },
      totalPages: Math.ceil(allEmployees.length / size),
      totalElements: allEmployees.length,
      last: end >= allEmployees.length,
      first: page === 0,
      size,
      number: page,
      sort: { sorted: true, unsorted: false, empty: false },
      numberOfElements: content.length,
      empty: content.length === 0,
    };
  }
  
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/employees/page?${queryString}` : '/employees/page';
  
  const pageResponse = (await axiosClient.get(url)) as PageResponse<Employee>;
  return normalizeEmployeePage(pageResponse);
};

/**
 * 根据 ID 获取员工详情
 * Endpoint: GET /api/employees/{id}
 * @param id 员工 ID (MongoDB ObjectId)
 * @returns Promise<Employee>
 */
export const getEmployeeById = async (id: string): Promise<Employee> => {
  if (isMockMode()) {
    await delay(300);
    const employee = EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.find(emp => emp.id === id);
    return employee || EmployeeMocks.MOCK_EMPLOYEE.data!;
  }
  
  const employee = (await axiosClient.get(`/employees/${id}`)) as Employee;
  return normalizeEmployeeResponse(employee);
};

/**
 * 根据 User ID 获取员工详情
 * Endpoint: GET /api/employees/user/{userID}
 * @param userId 用户 ID (Long)
 * @returns Promise<Employee>
 */
export const getEmployeeByUserId = async (
  userId: string
): Promise<Employee> => {
  if (isMockMode()) {
    await delay(300);
    const userIdNum = parseInt(userId, 10);
    const employee = EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.find(emp => emp.userID === userIdNum);
    if (!employee) {
      throw new Error(`Employee not found for userId=${userId}`);
    }
    return employee;
  }

  const employee = (await axiosClient.get(`/employees/user/${userId}`)) as Employee;
  return normalizeEmployeeResponse(employee);
};

/**
 * 搜索员工（按姓名）
 * Endpoint: GET /api/employees/search?name={name}
 * @param name 搜索关键词（First Name OR Last Name OR Preferred Name）
 * @returns Promise<Employee[]>
 */
export const searchEmployees = async (name: string): Promise<Employee[]> => {
  if (isMockMode()) {
    await delay(400);
    const searchTerm = name.toLowerCase();
    return EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.filter(emp => 
      emp.firstName.toLowerCase().includes(searchTerm) ||
      emp.lastName.toLowerCase().includes(searchTerm) ||
      (emp.preferredName?.toLowerCase() || '').includes(searchTerm)
    );
  }
  
  const result = (await axiosClient.get(`/employees/search?name=${encodeURIComponent(name)}`)) as Employee[];
  return normalizeEmployeeArray(result);
};

/**
 * 根据房屋ID获取员工列表（室友列表）
 * Endpoint: GET /api/employees/house/{houseId}
 * @param houseId 房屋 ID
 * @returns Promise<Employee[]>
 */
export const getEmployeesByHouseId = async (houseId: number): Promise<Employee[]> => {
  if (isMockMode()) {
    await delay(300);
    return EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.filter(emp => emp.houseID === houseId);
  }
  
  const employees = (await axiosClient.get(`/employees/house/${houseId}`)) as Employee[];
  return normalizeEmployeeArray(employees);
};

/**
 * 统计房屋员工数量
 * Endpoint: GET /api/employees/house/{houseId}/count
 * @param houseId 房屋 ID
 * @returns Promise<number>
 */
export const getEmployeeCountByHouseId = async (houseId: number): Promise<number> => {
  if (isMockMode()) {
    await delay(200);
    const count = EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.filter(emp => emp.houseID === houseId).length;
    return count;
  }
  
  return axiosClient.get(`/employees/house/${houseId}/count`) as Promise<number>;
};

/**
 * 创建员工 (Onboarding)
 * Endpoint: POST /api/employees
 * @param data 创建员工请求数据
 * @returns Promise<Employee>
 */
export const createEmployee = async (data: CreateEmployeeRequest): Promise<Employee> => {
  if (isMockMode()) {
    console.log('[Mock Request] createEmployee:', data);
    await delay(800);
    return {
      ...EmployeeMocks.MOCK_EMPLOYEE.data!,
      ...data,
      id: `507f1f77bcf86cd7994${Date.now().toString().slice(-5)}`,
    };
  }
  
  const employee = (await axiosClient.post(
    '/employees',
    transformEmployeeRequestPayload(data)
  )) as Employee;
  return normalizeEmployeeResponse(employee);
};

/**
 * 更新员工信息
 * Endpoint: PUT /api/employees/{id}
 * @param id 员工 ID
 * @param data 更新员工请求数据
 * @returns Promise<Employee>
 */
export const updateEmployee = async (id: string, data: UpdateEmployeeRequest): Promise<Employee> => {
  if (isMockMode()) {
    console.log('[Mock Request] updateEmployee:', { id, data });
    await delay(500);
    return {
      ...EmployeeMocks.MOCK_EMPLOYEE.data!,
      ...data,
      id,
    };
  }
  
  const employee = (await axiosClient.put(
    `/employees/${id}`,
    transformEmployeeRequestPayload(data)
  )) as Employee;
  return normalizeEmployeeResponse(employee);
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
 * Endpoint: POST /api/employees/{employeeId}/documents
 * @param employeeId 员工 ID (MongoDB ObjectId)
 * @param file 文件对象
 * @param title 文档标题 (如 "Passport", "I-94")
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
      id: `d1e2f3g4-h5i6-${Date.now()}`,
      path: `https://hr-onboarding-docs.s3.us-east-1.amazonaws.com/employees/${employeeId}/documents/${file.name}`,
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
 * Endpoint: DELETE /api/employees/{employeeId}/documents/{documentId}
 * @param employeeId 员工 ID (MongoDB ObjectId)
 * @param documentId 文档 ID (UUID)
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
