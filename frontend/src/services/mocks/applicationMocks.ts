/**
 * Application Mock Data
 * 将 applicationApi.ts 中的所有 mock 数据集中管理
 */

import type {
  ApplicationWorkFlow,
  ApplicationDetail,
  ApplicationStatus,
  ApplicationType,
  ApiResponse,
  DigitalDocument,
} from '../../types';

export const MOCK_APPLICATION: ApiResponse<ApplicationWorkFlow> = {
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

export const MOCK_APPLICATION_DETAIL: ApiResponse<ApplicationDetail> = {
  success: true,
  message: 'Application detail retrieved successfully',
  data: {
    ...MOCK_APPLICATION.data!,
    employeeName: 'John Doe',
    employeeEmail: 'john.doe@example.com',
  },
};

export const MOCK_APPLICATION_LIST: ApiResponse<ApplicationDetail[]> = {
  success: true,
  message: 'Application list retrieved successfully',
  data: [
    // Onboarding Applications
    {
      id: 200,
      employeeId: '200',
      employeeName: 'New User',
      employeeEmail: 'newuser@company.com',
      type: 'Onboarding' as ApplicationType,
      status: 'Pending' as ApplicationStatus,
      comment: 'Waiting for employee to submit onboarding form',
      createDate: '2024-12-01T08:00:00Z',
      lastModificationDate: '2024-12-01T08:00:00Z',
    },
    {
      id: 100,
      employeeId: '507f1f77bcf86cd799439100',
      employeeName: 'Emily Johnson',
      employeeEmail: 'employee@company.com',
      type: 'Onboarding' as ApplicationType,
      status: 'Approved' as ApplicationStatus,
      comment: 'All documents verified and approved',
      createDate: '2024-01-10T09:00:00Z',
      lastModificationDate: '2024-01-15T14:30:00Z',
    },
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
    {
      id: 400,
      employeeId: '507f1f77bcf86cd799439200',
      employeeName: 'RejectedUser',
      employeeEmail: 'rejected_candidate@example.com',
      type: 'Onboarding' as ApplicationType,
      status: 'Rejected' as ApplicationStatus,
      comment: 'Missing signed I-983 and OPT receipt. Please upload both documents before resubmitting.',
      createDate: '2024-02-10T09:00:00Z',
      lastModificationDate: '2024-02-12T11:45:00Z',
    },
    // OPT Applications
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

export const MOCK_DIGITAL_DOCUMENT: ApiResponse<DigitalDocument> = {
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

export const MOCK_DIGITAL_DOCUMENTS: ApiResponse<DigitalDocument[]> = {
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
