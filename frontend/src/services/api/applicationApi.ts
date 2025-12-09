/**
 * Application API Service
 * 处理 Onboarding 和 VISA 申请工作流的 API 请求
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import type { 
  ApplicationWorkFlow,
  ApplicationDetail,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
  DigitalDocument,
  ApplicationStatus,
  ApplicationType,
  ApiResponse
} from '../../types';

// ==================== Mock Data ====================
const MOCK_APPLICATION: ApiResponse<ApplicationWorkFlow> = {
  success: true,
  message: 'Application retrieved successfully',
  data: {
    id: 1,
    employeeId: '1',
    createDate: '2024-01-01T00:00:00Z',
    lastModificationDate: '2024-01-01T00:00:00Z',
    status: 'Pending' as ApplicationStatus,
    comment: '',
    type: 'Onboarding' as ApplicationType,
  },
};

const MOCK_APPLICATION_DETAIL: ApiResponse<ApplicationDetail> = {
  success: true,
  message: 'Application detail retrieved successfully',
  data: {
    ...MOCK_APPLICATION.data!,
    employeeName: 'John Doe',
    employeeEmail: 'john.doe@example.com',
  },
};

const MOCK_APPLICATION_LIST: ApiResponse<ApplicationDetail[]> = {
  success: true,
  message: 'Application list retrieved successfully',
  data: [
    // Onboarding Applications
    MOCK_APPLICATION_DETAIL.data!,
    {
      ...MOCK_APPLICATION_DETAIL.data!,
      id: 2,
      employeeId: '2',
      employeeName: 'Alice Johnson',
      employeeEmail: 'alice.johnson@example.com',
      status: 'Approved' as ApplicationStatus,
      createDate: '2024-01-05T10:30:00Z',
      lastModificationDate: '2024-01-06T14:20:00Z',
    },
    {
      id: 100,
      employeeId: '507f1f77bcf86cd799439100',
      employeeName: 'Alice Wang',
      employeeEmail: 'alice.wang@example.com',
      type: 'Onboarding' as ApplicationType,
      status: 'Approved' as ApplicationStatus,
      comment: 'All documents verified and approved',
      createDate: '2024-02-05T09:00:00Z',
      lastModificationDate: '2024-02-10T14:30:00Z',
    },
    {
      ...MOCK_APPLICATION_DETAIL.data!,
      id: 3,
      employeeId: '3',
      employeeName: 'Bob Smith',
      employeeEmail: 'bob.smith@example.com',
      status: 'Rejected' as ApplicationStatus,
      comment: 'Incomplete documentation',
      createDate: '2024-01-08T09:15:00Z',
      lastModificationDate: '2024-01-09T16:45:00Z',
    },
    
    // OPT Applications (for Visa Management Page)
    {
      id: 4,
      employeeId: '4',
      employeeName: 'Chen Wei',
      employeeEmail: 'chen.wei@example.com',
      type: 'OPT' as ApplicationType,
      status: 'Pending' as ApplicationStatus,
      comment: '',
      createDate: '2024-02-01T08:00:00Z',
      lastModificationDate: '2024-02-01T08:00:00Z',
    },
    {
      id: 5,
      employeeId: '5',
      employeeName: 'Maria Garcia',
      employeeEmail: 'maria.garcia@example.com',
      type: 'OPT' as ApplicationType,
      status: 'Pending' as ApplicationStatus,
      comment: '',
      createDate: '2024-02-03T11:30:00Z',
      lastModificationDate: '2024-02-03T11:30:00Z',
    },
    {
      id: 6,
      employeeId: '6',
      employeeName: 'Raj Patel',
      employeeEmail: 'raj.patel@example.com',
      type: 'OPT' as ApplicationType,
      status: 'Approved' as ApplicationStatus,
      comment: 'All documents verified. OPT EAD card approved.',
      createDate: '2024-01-15T09:00:00Z',
      lastModificationDate: '2024-01-20T15:30:00Z',
    },
    {
      id: 7,
      employeeId: '7',
      employeeName: 'Sarah Kim',
      employeeEmail: 'sarah.kim@example.com',
      type: 'OPT' as ApplicationType,
      status: 'Rejected' as ApplicationStatus,
      comment: 'I-20 expired. Please renew your student status first.',
      createDate: '2024-01-22T10:15:00Z',
      lastModificationDate: '2024-01-25T14:00:00Z',
    },
    {
      id: 8,
      employeeId: '8',
      employeeName: 'Mohamed Ali',
      employeeEmail: 'mohamed.ali@example.com',
      type: 'OPT' as ApplicationType,
      status: 'Pending' as ApplicationStatus,
      comment: '',
      createDate: '2024-02-05T13:45:00Z',
      lastModificationDate: '2024-02-05T13:45:00Z',
    },
    {
      id: 9,
      employeeId: '9',
      employeeName: 'Emily Chen',
      employeeEmail: 'emily.chen@example.com',
      type: 'OPT' as ApplicationType,
      status: 'Approved' as ApplicationStatus,
      comment: 'STEM OPT extension approved for 24 months.',
      createDate: '2024-01-10T08:30:00Z',
      lastModificationDate: '2024-01-18T16:20:00Z',
    },
    {
      id: 10,
      employeeId: '10',
      employeeName: 'David Lee',
      employeeEmail: 'david.lee@example.com',
      type: 'OPT' as ApplicationType,
      status: 'Pending' as ApplicationStatus,
      comment: '',
      createDate: '2024-02-07T14:00:00Z',
      lastModificationDate: '2024-02-07T14:00:00Z',
    },
  ],
};

const MOCK_DIGITAL_DOCUMENT: ApiResponse<DigitalDocument> = {
  success: true,
  message: 'Digital document retrieved successfully',
  data: {
    id: 1,
    type: 'I-983',
    isRequired: true,
    path: 's3://bucket/templates/i-983-template.pdf',
    description: 'Training Plan for STEM OPT Students',
    title: 'I-983 Form',
  },
};

const MOCK_DIGITAL_DOCUMENTS: ApiResponse<DigitalDocument[]> = {
  success: true,
  message: 'Digital documents retrieved successfully',
  data: [
    MOCK_DIGITAL_DOCUMENT.data!,
    {
      id: 2,
      type: 'I-20',
      isRequired: true,
      path: 's3://bucket/templates/i-20-template.pdf',
      description: 'Certificate of Eligibility for Nonimmigrant Student Status',
      title: 'I-20 Form',
    },
  ],
};

// ==================== API Functions ==

/**
 * 获取所有申请 (HR 视角)
 * @returns Promise<ApplicationDetail[]>
 */
export const getAllApplications = async (): Promise<ApplicationDetail[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_APPLICATION_LIST.data!;
  }
  
  return axiosClient.get('/applications') as Promise<ApplicationDetail[]>;
};

/**
 * 根据状态获取申请列表
 * @param status 申请状态
 * @returns Promise<ApplicationDetail[]>
 */
export const getApplicationsByStatus = async (
  status: ApplicationStatus
): Promise<ApplicationDetail[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_APPLICATION_LIST.data!.filter(app => app.status === status);
  }
  
  return axiosClient.get(`/applications?status=${status}`) as Promise<ApplicationDetail[]>;
};

/**
 * 根据 ID 获取申请详情
 * @param id 申请 ID
 * @returns Promise<ApplicationDetail>
 */
export const getApplicationById = async (id: number): Promise<ApplicationDetail> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION_DETAIL.data!;
  }
  
  return axiosClient.get(`/applications/${id}`) as Promise<ApplicationDetail>;
};

/**
 * 根据员工 ID 获取申请列表
 * @param employeeId 员工 ID
 * @returns Promise<ApplicationWorkFlow[]>
 */
export const getApplicationsByEmployeeId = async (
  employeeId: string
): Promise<ApplicationWorkFlow[]> => {
  if (isMockMode()) {
    await delay(300);
    // 根据 employeeId 过滤申请
    const applications = MOCK_APPLICATION_LIST.data!.filter(
      app => app.employeeId === employeeId
    );
    return applications.length > 0 ? applications : [MOCK_APPLICATION.data!];
  }
  
  return axiosClient.get(`/applications/employee/${employeeId}`) as Promise<ApplicationWorkFlow[]>;
};

/**
 * 创建新申请
 * @param data 创建申请请求数据
 * @returns Promise<ApplicationWorkFlow>
 */
export const createApplication = async (
  data: CreateApplicationRequest
): Promise<ApplicationWorkFlow> => {
  if (isMockMode()) {
    console.log('[Mock Request] createApplication:', data);
    await delay(500);
    return {
      id: Date.now(),
      employeeId: data.employeeId,
      createDate: new Date().toISOString(),
      lastModificationDate: new Date().toISOString(),
      status: 'Pending' as ApplicationStatus,
      comment: data.comment || '',
      type: data.type,
    };
  }
  
  return axiosClient.post('/applications', data) as Promise<ApplicationWorkFlow>;
};

/**
 * 更新申请状态 (HR 操作)
 * @param data 更新申请状态请求数据
 * @returns Promise<ApplicationWorkFlow>
 */
export const updateApplicationStatus = async (
  data: UpdateApplicationStatusRequest
): Promise<ApplicationWorkFlow> => {
  if (isMockMode()) {
    console.log('[Mock Request] updateApplicationStatus:', data);
    await delay(500);
    return {
      ...MOCK_APPLICATION.data!,
      id: data.id,
      status: data.status,
      comment: data.comment || '',
      lastModificationDate: new Date().toISOString(),
    };
  }
  
  return axiosClient.patch(`/applications/${data.id}/status`, {
    status: data.status,
    comment: data.comment,
  }) as Promise<ApplicationWorkFlow>;
};

/**
 * 删除申请
 * @param id 申请 ID
 * @returns Promise<void>
 */
export const deleteApplication = async (id: number): Promise<void> => {
  if (isMockMode()) {
    console.log('[Mock Request] deleteApplication:', { id });
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/applications/${id}`);
};

// ==================== Digital Document APIs ====================

/**
 * 获取所有数字文档模板
 * @returns Promise<DigitalDocument[]>
 */
export const getAllDigitalDocuments = async (): Promise<DigitalDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_DIGITAL_DOCUMENTS.data!;
  }
  
  return axiosClient.get('/digital-documents') as Promise<DigitalDocument[]>;
};

/**
 * 根据类型获取数字文档模板
 * @param type 文档类型
 * @returns Promise<DigitalDocument>
 */
export const getDigitalDocumentByType = async (type: string): Promise<DigitalDocument> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_DIGITAL_DOCUMENT.data!;
  }
  
  return axiosClient.get(`/digital-documents/type/${type}`) as Promise<DigitalDocument>;
};

/**
 * 获取必需的文档列表
 * @returns Promise<DigitalDocument[]>
 */
export const getRequiredDocuments = async (): Promise<DigitalDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_DIGITAL_DOCUMENTS.data!.filter(doc => doc.isRequired);
  }
  
  return axiosClient.get('/digital-documents/required') as Promise<DigitalDocument[]>;
};
