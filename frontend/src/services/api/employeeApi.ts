
import axiosClient from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import * as EmployeeMocks from '../mocks/employeeMocks';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  PersonalDocument,
} from '../../types';


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
    dob: (data as Employee & { dob?: string }).dob ?? dob ?? '',
    ssn: (data as Employee & { ssn?: string }).ssn ?? ssn ?? '',
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

export const getEmployeeById = async (id: string): Promise<Employee> => {
  if (isMockMode()) {
    await delay(300);
    const employee = EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.find(emp => emp.id === id);
    return employee || EmployeeMocks.MOCK_EMPLOYEE.data!;
  }
  
  const employee = (await axiosClient.get(`/employees/${id}`)) as Employee;
  return normalizeEmployeeResponse(employee);
};

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

export const getEmployeesByHouseId = async (houseId: number): Promise<Employee[]> => {
  if (isMockMode()) {
    await delay(300);
    return EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.filter(emp => emp.houseID === houseId);
  }
  
  const employees = (await axiosClient.get(`/employees/house/${houseId}`)) as Employee[];
  return normalizeEmployeeArray(employees);
};

export const getEmployeeCountByHouseId = async (houseId: number): Promise<number> => {
  if (isMockMode()) {
    await delay(200);
    const count = EmployeeMocks.MOCK_EMPLOYEE_LIST.data!.filter(emp => emp.houseID === houseId).length;
    return count;
  }
  
  return axiosClient.get(`/employees/house/${houseId}/count`) as Promise<number>;
};

export const createEmployee = async (data: CreateEmployeeRequest): Promise<Employee> => {
  if (isMockMode()) {
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

export const updateEmployee = async (id: string, data: UpdateEmployeeRequest): Promise<Employee> => {
  if (isMockMode()) {
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

export const deleteEmployee = async (id: string): Promise<void> => {
  if (isMockMode()) {
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/employees/${id}`);
};

export const uploadPersonalDocument = async (
  employeeId: string,
  file: File,
  title: string,
  comment?: string
): Promise<PersonalDocument> => {
  if (isMockMode()) {
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
