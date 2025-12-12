/**
 * Application API Service
 * 根据最新后端 API 文档实现 (api_application.md)
 * 包含申请流程管理 (10个接口) 和文档管理 (8个接口)
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import type { 
  Application,
  ApplicationListItem,
  ApplicationDocument,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApproveApplicationRequest,
  RejectApplicationRequest,
  UploadDocumentRequest,
  UpdateDocumentRequest,
} from '../../types';
import {
  MOCK_APPLICATION,
  MOCK_APPLICATION_LIST,
} from '../mocks/applicationMocks';

// ==================== Application Flow API (10 endpoints) ====================

/**
 * 1. 创建新申请
 * POST /api
 * Role: Employee
 */
export const createApplication = async (
  data: CreateApplicationRequest
): Promise<Application> => {
  if (isMockMode()) {
    console.log('[Mock] createApplication:', data);
    await delay(500);
    return {
      id: Date.now(),
      employeeId: data.employeeId,
      createDate: new Date().toISOString(),
      lastModificationDate: new Date().toISOString(),
      status: 'Open',
      comment: data.comment,
      applicationType: data.applicationType,
    };
  }
  
  return axiosClient.post('/applications', data);
};

/**
 * 2. 获取最新激活的申请
 * GET /api/employee/latest/{employeeId}
 * Role: Employee
 */
export const getLatestApplication = async (
  employeeId: string
): Promise<Application | null> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION.data || null;
  }
  
  return axiosClient.get(`/applications/employee/latest/${employeeId}`);
};

/**
 * 3. 获取员工所有激活的申请
 * GET /api/employee/{employeeId}
 * Role: Employee
 */
export const getActiveApplications = async (
  employeeId: string
): Promise<ApplicationListItem[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION_LIST.data || [];
  }
  
  return axiosClient.get(`/applications/employee/${employeeId}`);
};

/**
 * 4. 根据 ID 获取申请详情
 * GET /api/{applicationId}
 * Role: Employee
 */
export const getApplicationById = async (
  applicationId: number
): Promise<Application> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION.data!;
  }
  
  return axiosClient.get(`/applications/${applicationId}`);
};

/**
 * 5. 更新申请
 * PUT /api/{applicationId}
 * Role: Employee
 */
export const updateApplication = async (
  applicationId: number,
  data: UpdateApplicationRequest
): Promise<Application> => {
  if (isMockMode()) {
    console.log('[Mock] updateApplication:', { applicationId, data });
    await delay(500);
    return {
      ...MOCK_APPLICATION.data!,
      comment: data.comment || MOCK_APPLICATION.data!.comment,
      applicationType: data.applicationType || MOCK_APPLICATION.data!.applicationType,
      lastModificationDate: new Date().toISOString(),
    };
  }
  
  return axiosClient.put(`/applications/${applicationId}`, data);
};

/**
 * 6. 提交申请
 * POST /api/{applicationId}/submit
 * Role: Employee
 */
export const submitApplication = async (
  applicationId: number
): Promise<void> => {
  if (isMockMode()) {
    console.log('[Mock] submitApplication:', { applicationId });
    await delay(500);
    return;
  }
  
  await axiosClient.post(`/applications/${applicationId}/submit`);
};

/**
 * 7. 批准申请
 * POST /api/{applicationId}/approve
 * Role: HR
 */
export const approveApplication = async (
  applicationId: number,
  data: ApproveApplicationRequest
): Promise<{ status: string; comment: string }> => {
  if (isMockMode()) {
    console.log('[Mock] approveApplication:', { applicationId, data });
    await delay(500);
    return {
      status: 'Approved',
      comment: data.comment,
    };
  }
  
  return axiosClient.post(`/applications/${applicationId}/approve`, data);
};

/**
 * 8. 拒绝申请
 * POST /api/{applicationId}/reject
 * Role: HR
 */
export const rejectApplication = async (
  applicationId: number,
  data: RejectApplicationRequest
): Promise<{ status: string; comment: string }> => {
  if (isMockMode()) {
    console.log('[Mock] rejectApplication:', { applicationId, data });
    await delay(500);
    return {
      status: 'Rejected',
      comment: data.comment,
    };
  }
  
  return axiosClient.post(`/applications/${applicationId}/reject`, data);
};

/**
 * 9. 列出所有进行中的申请
 * GET /api/ongoing
 * Role: HR
 */
export const getOngoingApplications = async (): Promise<Application[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_APPLICATION_LIST.data || [];
  }
  
  return axiosClient.get('/applications/ongoing');
};

/**
 * 10. 获取员工的所有申请
 * GET /api/employee/{employeeId}/all
 * Role: HR or Employee
 */
export const getAllApplicationsByEmployeeId = async (
  employeeId: string
): Promise<Application[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION_LIST.data || [];
  }
  
  return axiosClient.get(`/applications/employee/${employeeId}/all`);
};

// ==================== Document Management API (8 endpoints) ====================

/**
 * 11. 根据申请 ID 获取文档列表
 * GET /api/documents/application/{applicationId}
 * Role: Employee
 */
export const getDocumentsByApplicationId = async (
  applicationId: number
): Promise<ApplicationDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return [];
  }
  
  return axiosClient.get(`/applications/documents/application/${applicationId}`);
};

/**
 * 12. 根据员工 ID 获取文档列表
 * GET /api/documents/employee/{employeeId}
 * Role: Employee
 */
export const getDocumentsByEmployeeId = async (
  employeeId: string
): Promise<ApplicationDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return [];
  }
  
  return axiosClient.get(`/applications/documents/employee/${employeeId}`);
};

/**
 * 13. 根据文档类型获取文档列表
 * GET /api/documents/type/{type}
 * Role: Employee
 */
export const getDocumentsByType = async (
  type: string
): Promise<ApplicationDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return [];
  }
  
  return axiosClient.get(`/applications/documents/type/${type}`);
};

/**
 * 14. 获取必需文档列表
 * GET /api/documents/required
 * Role: Employee
 */
export const getRequiredDocuments = async (): Promise<ApplicationDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return [];
  }
  
  return axiosClient.get('/applications/documents/required');
};

/**
 * 15. 上传文档
 * POST /api/documents/upload
 * Role: Employee
 * Content-Type: multipart/form-data
 */
export const uploadDocument = async (
  request: UploadDocumentRequest
): Promise<ApplicationDocument> => {
  if (isMockMode()) {
    console.log('[Mock] uploadDocument:', request);
    await delay(1000);
    return {
      id: Date.now(),
      type: request.metadata.type,
      isRequired: false,
      path: `s3://mock-bucket/${request.file.name}`,
      description: request.metadata.description,
      title: request.metadata.title,
      applicationId: request.metadata.applicationId,
    };
  }
  
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('metadata', JSON.stringify(request.metadata));
  
  return axiosClient.post('/applications/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 16. 下载文档
 * GET /api/documents/download/{id}
 * Role: Employee
 * Returns: Binary file data
 */
export const downloadDocument = async (id: number): Promise<Blob> => {
  if (isMockMode()) {
    console.log('[Mock] downloadDocument:', { id });
    await delay(500);
    return new Blob(['Mock document content'], { type: 'application/pdf' });
  }
  
  return axiosClient.get(`/applications/documents/download/${id}`, {
    responseType: 'blob',
  });
};

/**
 * 17. 删除文档
 * DELETE /api/documents/delete/{id}
 * Role: Employee
 */
export const deleteDocument = async (id: number): Promise<string> => {
  if (isMockMode()) {
    console.log('[Mock] deleteDocument:', { id });
    await delay(300);
    return 'Document deleted successfully';
  }
  
  return axiosClient.delete(`/applications/documents/delete/${id}`);
};

/**
 * 18. 更新文档
 * PUT /api/documents/update/{id}
 * Role: Employee
 * Content-Type: multipart/form-data
 */
export const updateDocument = async (
  id: number,
  request: UpdateDocumentRequest
): Promise<ApplicationDocument> => {
  if (isMockMode()) {
    console.log('[Mock] updateDocument:', { id, request });
    await delay(1000);
    return {
      id,
      type: request.metadata.type || 'I-20',
      isRequired: true,
      path: `s3://mock-bucket/updated_${request.file?.name || 'document.pdf'}`,
      description: request.metadata.description || 'Updated document',
      title: request.metadata.title || 'Updated Document',
      applicationId: request.metadata.applicationId || 1001,
    };
  }
  
  const formData = new FormData();
  if (request.file) {
    formData.append('file', request.file);
  }
  formData.append('metadata', JSON.stringify(request.metadata));
  
  return axiosClient.put(`/applications/documents/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ==================== Legacy API (保持向后兼容) ====================

/**
 * @deprecated 使用 getOngoingApplications 替代
 */
export const getAllApplications = getOngoingApplications;

/**
 * @deprecated 使用 getActiveApplications 替代
 */
export const getApplicationsByEmployeeId = getActiveApplications;

/**
 * @deprecated 使用 getRequiredDocuments 替代
 */
export const getAllDigitalDocuments = getRequiredDocuments;

/**
 * @deprecated 使用 getDocumentsByType 替代
 */
export const getDigitalDocumentByType = (type: string) => 
  getDocumentsByType(type).then(docs => docs[0] || null);
