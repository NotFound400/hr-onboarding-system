/**
 * Employee Mock Data
 * 更新以符合最新的 Employee API 规范
 */

import type {
  Employee,
  ApiResponse,
} from '../../types';

// Mock Employee #1: Approved Employee (employee/123) - Citizen, 已批准可访问员工门户
export const MOCK_EMPLOYEE_APPROVED: Employee = {
  id: '507f1f77bcf86cd799439100',
  userID: 100, // 对应 employee 账号
  firstName: 'Emily',
  lastName: 'Johnson',
  preferredName: 'Em',
  email: 'employee@company.com',
  cellPhone: '555-123-4567',
  alternatePhone: '555-987-6543',
  gender: 'Female',
  SSN: '987-65-4321',
  DOB: '1992-05-20',
  startDate: '2024-01-15',
  endDate: '',
  driverLicense: 'DL987654',
  driverLicenseExpiration: '2027-05-20',
  houseID: 1,
  contact: [
    {
      id: '507f1f77bcf86cd799439001',
      type: 'Reference',
      firstName: 'Robert',
      lastName: 'Williams',
      cellPhone: '555-111-2222',
      email: 'robert.williams@company.com',
      relationship: 'Former Supervisor',
    },
    {
      id: '507f1f77bcf86cd799439002',
      type: 'Emergency',
      firstName: 'Michael',
      lastName: 'Johnson',
      cellPhone: '555-333-4444',
      email: 'michael.johnson@email.com',
      relationship: 'Spouse',
    },
  ],
  address: [
    {
      id: '507f1f77bcf86cd799439003',
      addressLine1: '456 Oak Street',
      addressLine2: 'Unit 12B',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
    {
      id: '507f1f77bcf86cd799439004',
      addressLine1: '789 Pine Avenue',
      addressLine2: '',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
    },
  ],
  visaStatus: [
    {
      id: '507f1f77bcf86cd799439005',
      visaType: 'OPT',
      activeFlag: 'Yes',
      startDate: '2024-01-15',
      endDate: '2025-12-31',
      lastModificationDate: '2024-01-15T00:00:00Z',
    },
  ],
  personalDocument: [
    {
      id: '507f1f77bcf86cd799439006',
      path: 's3://bucket/documents/emily-driver-license.pdf',
      title: 'Driver License',
      comment: 'Valid until 2027',
      createDate: '2024-01-15T00:00:00Z',
    },
    {
      id: '507f1f77bcf86cd799439007',
      path: 's3://bucket/documents/emily-i9.pdf',
      title: 'I-9 Form',
      comment: 'Employment eligibility verification',
      createDate: '2024-01-15T00:00:00Z',
    },
  ],
};

export const MOCK_EMPLOYEE: ApiResponse<Employee> = {
  success: true,
  message: 'Employee retrieved successfully',
  data: MOCK_EMPLOYEE_APPROVED,
};

// Mock Employee #1.5: Pending onboarding user (new_user/123)
export const MOCK_EMPLOYEE_PENDING: Employee = {
  id: '200', // 与 Application Mock 中的 employeeId 对齐
  userID: 200,
  firstName: 'New',
  lastName: 'User',
  preferredName: '',
  email: 'newuser@company.com',
  cellPhone: '555-000-0000',
  alternatePhone: '',
  gender: 'Other',
  SSN: '',
  DOB: '2000-01-01',
  startDate: '',
  endDate: '',
  driverLicense: '',
  driverLicenseExpiration: '',
  houseID: 0,
  contact: [],
  address: [
    {
      id: '507f1f77bcf86cd799439008',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
    },
  ],
  visaStatus: [],
  personalDocument: [],
};

// Mock Employee #2: OPT Student (Non-Citizen with OPT visa) - 额外测试数据
export const MOCK_EMPLOYEE_OPT: Employee = {
  id: '507f1f77bcf86cd799439011',
  userID: 1,
  firstName: 'Alice',
  lastName: 'Wang',
  preferredName: 'Allie',
  email: 'alice.wang@example.com',
  cellPhone: '555-123-4567',
  alternatePhone: '555-987-6543',
  gender: 'Female',
  SSN: '987-65-4321',
  DOB: '1995-06-20',
  startDate: '2024-02-15',
  endDate: '',
  driverLicense: 'CA98765432',
  driverLicenseExpiration: '2027-06-20',
  houseID: 1,
  contact: [
    {
      id: '507f1f77bcf86cd799439012',
      type: 'Reference',
      firstName: 'Tom',
      lastName: 'Chen',
      cellPhone: '555-111-2222',
      email: 'tom.chen@example.com',
      relationship: 'Professor',
    },
    {
      id: '507f1f77bcf86cd799439013',
      type: 'Emergency',
      firstName: 'Linda',
      lastName: 'Wang',
      cellPhone: '555-333-4444',
      email: 'linda.wang@example.com',
      relationship: 'Mother',
    },
  ],
  address: [
    {
      id: '507f1f77bcf86cd799439014',
      addressLine1: '456 Oak Avenue',
      addressLine2: 'Unit 12',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
  ],
  visaStatus: [
    {
      id: '507f1f77bcf86cd799439015',
      visaType: 'OPT',
      activeFlag: 'Yes',
      startDate: '2024-02-01',
      endDate: '2025-02-01',
      lastModificationDate: '2024-02-01T00:00:00Z',
    },
  ],
  personalDocument: [
    {
      id: '507f1f77bcf86cd799439016',
      path: 's3://bucket/documents/alice-ead-card.pdf',
      title: 'EAD Card',
      comment: 'OPT EAD Card',
      createDate: '2024-02-01T00:00:00Z',
    },
    {
      id: '507f1f77bcf86cd799439017',
      path: 's3://bucket/documents/alice-i20.pdf',
      title: 'I-20',
      comment: 'Current I-20',
      createDate: '2024-02-01T00:00:00Z',
    },
    {
      id: '507f1f77bcf86cd799439018',
      path: 's3://bucket/documents/alice-driver-license.pdf',
      title: 'Driver License',
      comment: 'Valid until 2027',
      createDate: '2024-02-15T00:00:00Z',
    },
  ],
};

// Mock Employee #3: Green Card Holder
export const MOCK_EMPLOYEE_GREEN_CARD: Employee = {
  id: '507f1f77bcf86cd799439101',
  userID: 101,
  firstName: 'Raj',
  lastName: 'Patel',
  preferredName: '',
  email: 'raj.patel@example.com',
  cellPhone: '555-444-5555',
  alternatePhone: '',
  gender: 'Male',
  SSN: '555-44-3333',
  DOB: '1988-11-05',
  startDate: '2024-03-01',
  endDate: '',
  driverLicense: 'TX55443322',
  driverLicenseExpiration: '2028-11-05',
  houseID: 2,
  contact: [
    {
      id: '507f1f77bcf86cd799439019',
      type: 'Reference',
      firstName: 'Michael',
      lastName: 'Johnson',
      cellPhone: '555-777-8888',
      email: 'michael.johnson@example.com',
      relationship: 'Former Supervisor',
    },
    {
      id: '507f1f77bcf86cd799439020',
      type: 'Emergency',
      firstName: 'Priya',
      lastName: 'Patel',
      cellPhone: '555-999-0000',
      email: 'priya.patel@example.com',
      relationship: 'Spouse',
    },
  ],
  address: [
    {
      id: '507f1f77bcf86cd799439021',
      addressLine1: '789 Silicon Valley Dr',
      addressLine2: '',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
  ],
  visaStatus: [
    {
      id: '507f1f77bcf86cd799439022',
      visaType: 'Green Card',
      activeFlag: 'Yes',
      startDate: '2020-01-15',
      endDate: '9999-12-31',
      lastModificationDate: '2024-03-01T00:00:00Z',
    },
  ],
  personalDocument: [
    {
      id: '507f1f77bcf86cd799439023',
      path: 's3://bucket/documents/raj-green-card.pdf',
      title: 'Green Card',
      comment: 'Permanent Resident Card',
      createDate: '2024-03-01T00:00:00Z',
    },
  ],
};

// Mock Employee #4: OPT STEM Student (Mid-Process)
export const MOCK_EMPLOYEE_OPT_STEM: Employee = {
  id: '507f1f77bcf86cd799439102',
  userID: 102,
  firstName: 'Chen',
  lastName: 'Wei',
  preferredName: 'David',
  email: 'chen.wei@example.com',
  cellPhone: '555-666-7777',
  alternatePhone: '',
  gender: 'Male',
  SSN: '555-66-7777',
  DOB: '1998-03-12',
  startDate: '2024-06-01',
  endDate: '',
  driverLicense: 'CA88776655',
  driverLicenseExpiration: '2026-03-12',
  houseID: 1,
  contact: [
    {
      id: '507f1f77bcf86cd799439024',
      type: 'Emergency',
      firstName: 'Wei',
      lastName: 'Chen',
      cellPhone: '555-888-9999',
      email: 'wei.chen@example.com',
      relationship: 'Father',
    },
  ],
  address: [
    {
      id: '507f1f77bcf86cd799439025',
      addressLine1: '456 University Ave',
      addressLine2: 'Apt 3B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
  ],
  visaStatus: [
    {
      id: '507f1f77bcf86cd799439026',
      visaType: 'F1',
      activeFlag: 'Yes',
      startDate: '2024-06-01',
      endDate: '2027-06-01',
      lastModificationDate: '2024-06-01T00:00:00Z',
    },
  ],
  personalDocument: [
    {
      id: '507f1f77bcf86cd799439027',
      path: 's3://bucket/documents/chen-i983.pdf',
      title: 'I-983',
      comment: 'Training Plan for STEM OPT',
      createDate: '2024-06-05T00:00:00Z',
    },
    {
      id: '507f1f77bcf86cd799439028',
      path: 's3://bucket/documents/chen-i20.pdf',
      title: 'I-20',
      comment: 'Certificate of Eligibility',
      createDate: '2024-06-08T00:00:00Z',
    },
    {
      id: '507f1f77bcf86cd799439029',
      path: 's3://bucket/documents/chen-opt-receipt.pdf',
      title: 'OPT Receipt',
      comment: 'I-797 Receipt Notice',
      createDate: '2024-06-10T00:00:00Z',
    },
    // OPT EAD not yet uploaded - pending
  ],
};

export const MOCK_EMPLOYEE_LIST: ApiResponse<Employee[]> = {
  success: true,
  message: 'Employees retrieved successfully',
  data: [
    MOCK_EMPLOYEE_APPROVED, // userID=100, employee/123
    MOCK_EMPLOYEE_PENDING,  // userID=200, new_user
    MOCK_EMPLOYEE_OPT,      // userID=1, 额外测试
    MOCK_EMPLOYEE_GREEN_CARD, // userID=2
    MOCK_EMPLOYEE_OPT_STEM,   // userID=3
  ],
};

/**
 * Gap Fix Scenarios (Append Only)
 */

/** 登录时 Onboarding 被拒绝的场景，包含 HR feedback */
export const SCENARIO_USER_REJECTED: (Employee & { status: 'Rejected'; feedback: string }) = {
  ...MOCK_EMPLOYEE_APPROVED,
  id: '507f1f77bcf86cd799439200',
  userID: 400,
  email: 'rejected_candidate@example.com',
  preferredName: 'RejectedUser',
  status: 'Rejected',
  feedback: 'Missing signed I-983 and OPT receipt. Please upload both documents before resubmitting.',
};

/** Onboarding 数据缺少头像，测试默认图片占位符 */
export const SCENARIO_USER_NO_AVATAR: Employee = {
  ...MOCK_EMPLOYEE_APPROVED,
  id: '507f1f77bcf86cd799439201',
  userID: 401,
  email: 'noavatar@example.com',
  firstName: 'Jamie',
  lastName: 'Taylor',
  preferredName: 'NoAvatar',
};

/** 签证流程第一步：没有任何签证文档，阻塞后续步骤 */
export const SCENARIO_USER_VISA_STEP1: Employee = {
  ...MOCK_EMPLOYEE_APPROVED,
  id: '507f1f77bcf86cd799439202',
  userID: 402,
  email: 'visa-step1@example.com',
  firstName: 'Olivia',
  lastName: 'Lopez',
  preferredName: 'VisaStep1',
  visaStatus: [],
  personalDocument: [],
};

if (MOCK_EMPLOYEE_LIST.data) {
  MOCK_EMPLOYEE_LIST.data.push(SCENARIO_USER_REJECTED);
}
