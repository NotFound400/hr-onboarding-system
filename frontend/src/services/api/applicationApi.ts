/**
 * Application API Service
 * 处理 Onboarding 和 VISA 申请工作流的 API 请求
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '@/utils/mockUtils';
import type { 
  ApplicationWorkFlow,
  ApplicationDetail,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
  DigitalDocument,
  ApplicationStatus,
  ApplicationType
} from '@/types';

// ==================== Mock Data ====================
const MOCK_APPLICATION: ApplicationWorkFlow = {
  id: 'app-001',
  employeeId: 'emp-001',
  createDate: '2024-01-01T00:00:00Z',
  lastModificationDate: '2024-01-01T00:00:00Z',
  status: 'Pending' as ApplicationStatus,
  comment: '',
  type: 'Onboarding' as ApplicationType,
};

const MOCK_APPLICATION_DETAIL: ApplicationDetail = {
  ...MOCK_APPLICATION,
  employeeName: 'John Doe',
  employeeEmail: 'john.doe@example.com',
};

const MOCK_APPLICATION_LIST: ApplicationDetail[] = [
  MOCK_APPLICATION_DETAIL,
  {
    ...MOCK_APPLICATION_DETAIL,
    id: 'app-002',
    employeeId: 'emp-002',
    employeeName: 'Alice Johnson',
    employeeEmail: 'alice.johnson@example.com',
    status: 'Approved' as ApplicationStatus,
  },
  {
    ...MOCK_APPLICATION_DETAIL,
    id: 'app-003',
    employeeId: 'emp-003',
    employeeName: 'Bob Smith',
    employeeEmail: 'bob.smith@example.com',
    status: 'Rejected' as ApplicationStatus,
    comment: 'Incomplete documentation',
  },
];

const MOCK_DIGITAL_DOCUMENT: DigitalDocument = {
  id: 'doc-001',
  type: 'I-983',
  isRequired: true,
  path: 's3://bucket/templates/i-983-template.pdf',
  description: 'Training Plan for STEM OPT Students',
  title: 'I-983 Form',
};

const MOCK_DIGITAL_DOCUMENTS: DigitalDocument[] = [
  MOCK_DIGITAL_DOCUMENT,
  {
    id: 'doc-002',
    type: 'I-20',
    isRequired: true,
    path: 's3://bucket/templates/i-20-template.pdf',
    description: 'Certificate of Eligibility for Nonimmigrant Student Status',
    title: 'I-20 Form',
  },
];

// ==================== API Functions ==

/**
 * 获取所有申请 (HR 视角)
 * @returns Promise<ApplicationDetail[]>
 */
export const getAllApplications = async (): Promise<ApplicationDetail[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_APPLICATION_LIST;
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
    return MOCK_APPLICATION_LIST.filter(app => app.status === status);
  }
  
  return axiosClient.get(`/applications?status=${status}`) as Promise<ApplicationDetail[]>;
};

/**
 * 根据 ID 获取申请详情
 * @param id 申请 ID
 * @returns Promise<ApplicationDetail>
 */
export const getApplicationById = async (id: string): Promise<ApplicationDetail> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION_DETAIL;
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
    return [MOCK_APPLICATION];
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
    await delay(500);
    return {
      id: `app-${Date.now()}`,
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
    await delay(500);
    return {
      ...MOCK_APPLICATION,
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
export const deleteApplication = async (id: string): Promise<void> => {
  if (isMockMode()) {
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
    return MOCK_DIGITAL_DOCUMENTS;
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
    return MOCK_DIGITAL_DOCUMENT;
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
    return MOCK_DIGITAL_DOCUMENTS.filter(doc => doc.isRequired);
  }
  
  return axiosClient.get('/digital-documents/required') as Promise<DigitalDocument[]>;
};
