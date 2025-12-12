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
} from '../../types';
import {
  MOCK_APPLICATION,
  MOCK_APPLICATION_DETAIL,
  MOCK_APPLICATION_LIST,
  MOCK_DIGITAL_DOCUMENT,
  MOCK_DIGITAL_DOCUMENTS,
} from '../mocks/applicationMocks';

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
    return applications.length > 0 ? applications : [];
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
      applicationType: data.applicationType,
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
