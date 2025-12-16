import axiosClient from './axiosClient';
import type { AxiosError } from 'axios';
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
  ApplicationWithEmployeeInfo,
  ApplicationStatus,
} from '../../types';
import {
  MOCK_APPLICATION,
  MOCK_APPLICATION_LIST,
} from '../mocks/applicationMocks';
import { getAllEmployees } from './employeeApi';

export const createApplication = async (
  data: CreateApplicationRequest
): Promise<Application> => {
  if (isMockMode()) {
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
  
  try {
    return (await axiosClient.post('/applications/', data)) as Application;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return axiosClient.post('/', data) as Promise<Application>;
    }
    throw error;
  }
};

export const getLatestApplication = async (
  employeeId: string
): Promise<Application | null> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION.data || null;
  }
  
  return axiosClient.get(`/applications/employee/latest/${employeeId}`);
};

export const getActiveApplications = async (
  employeeId: string
): Promise<ApplicationListItem[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION_LIST.data || [];
  }
  
  return axiosClient.get(`/applications/employee/${employeeId}`);
};

export const getApplicationById = async (
  applicationId: number
): Promise<Application> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION.data!;
  }
  
  return axiosClient.get(`/applications/${applicationId}`);
};

export const updateApplication = async (
  applicationId: number,
  data: UpdateApplicationRequest
): Promise<Application> => {
  if (isMockMode()) {
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

export const submitApplication = async (
  applicationId: number
): Promise<void> => {
  if (isMockMode()) {
    await delay(500);
    return;
  }
  
  await axiosClient.post(`/applications/${applicationId}/submit`);
};

export const approveApplication = async (
  applicationId: number,
  data: ApproveApplicationRequest
): Promise<{ status: string; comment: string }> => {
  if (isMockMode()) {
    await delay(500);
    return {
      status: 'Approved',
      comment: data.comment,
    };
  }
  
  return axiosClient.post(`/applications/${applicationId}/approve`, data);
};

export const rejectApplication = async (
  applicationId: number,
  data: RejectApplicationRequest
): Promise<{ status: string; comment: string }> => {
  if (isMockMode()) {
    await delay(500);
    return {
      status: 'Rejected',
      comment: data.comment,
    };
  }
  
  return axiosClient.post(`/applications/${applicationId}/reject`, data);
};

export const getOngoingApplications = async (): Promise<Application[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_APPLICATION_LIST.data || [];
  }
  
  return axiosClient.get('/applications/ongoing');
};

export const getApplicationsByStatus = async (
  status: ApplicationStatus
): Promise<Application[]> => {
  if (isMockMode()) {
    await delay(300);
    return (MOCK_APPLICATION_LIST.data || []).filter(app => app.status === status);
  }

  return axiosClient.get(`/applications/status/${status}`);
};

export const getApplicationsWithEmployeesByStatus = async (
  status: ApplicationStatus
): Promise<ApplicationWithEmployeeInfo[]> => {
  const [applications, employees] = await Promise.all([
    getApplicationsByStatus(status),
    getAllEmployees({ forceReal: true }),
  ]);

  const employeeMap = new Map<string, typeof employees[number]>();
  employees.forEach((emp) => {
    if (emp.id) {
      employeeMap.set(emp.id, emp);
    }
  });

  return applications.map((app) => {
    const employee = employeeMap.get(app.employeeId);
    const employeeName = employee
      ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A'
      : 'N/A';
    return {
      ...app,
      employee,
      employeeName,
      employeeEmail: employee?.email,
    };
  });
};

export const getAllApplicationsByEmployeeId = async (
  employeeId: string
): Promise<Application[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_APPLICATION_LIST.data || [];
  }
  
  return axiosClient.get(`/applications/employee/${employeeId}/all`);
};

export const getDocumentsByApplicationId = async (
  applicationId: number
): Promise<ApplicationDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return [];
  }
  
  return axiosClient.get(`/applications/documents/application/${applicationId}`);
};

export const getDocumentsByEmployeeId = async (
  employeeId: string
): Promise<ApplicationDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return [];
  }
  
  return axiosClient.get(`/applications/documents/employee/${employeeId}`);
};

export const getDocumentsByType = async (
  type: string
): Promise<ApplicationDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return [];
  }
  
  return axiosClient.get(`/applications/documents/type/${type}`);
};

export const getRequiredDocuments = async (): Promise<ApplicationDocument[]> => {
  if (isMockMode()) {
    await delay(300);
    return [];
  }
  
  return axiosClient.get('/applications/documents/required');
};

export const uploadDocument = async (
  request: UploadDocumentRequest
): Promise<ApplicationDocument> => {
  if (isMockMode()) {
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

export const downloadDocument = async (id: number): Promise<Blob> => {
  if (isMockMode()) {
    await delay(500);
    return new Blob(['Mock document content'], { type: 'application/pdf' });
  }
  
  return axiosClient.get(`/applications/documents/download/${id}`, {
    responseType: 'blob',
  });
};

export const deleteDocument = async (id: number): Promise<string> => {
  if (isMockMode()) {
    await delay(300);
    return 'Document deleted successfully';
  }
  
  return axiosClient.delete(`/applications/documents/delete/${id}`);
};

export const updateDocument = async (
  id: number,
  request: UpdateDocumentRequest
): Promise<ApplicationDocument> => {
  if (isMockMode()) {
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
