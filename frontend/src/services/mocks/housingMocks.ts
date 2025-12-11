/**
 * Housing & Facility Mock Data
 * 从 housingApi.ts 提取的所有硬编码模拟数据
 */

import type {
  ApiResponse,
  Landlord,
  HouseListItem,
  Facility,
  HouseDetail,
  HouseEmployeeView,
  FacilityReportListItem,
  FacilityReportComment,
  FacilityReportDetail,
} from '../../types';

/** Mock 房东数据 */
export const MOCK_LANDLORD: ApiResponse<Landlord> = {
  success: true,
  message: 'Landlord retrieved successfully',
  data: {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    cellPhone: '123-456-7890',
  },
};

export const MOCK_LANDLORD_2: ApiResponse<Landlord> = {
  success: true,
  message: 'Landlord retrieved successfully',
  data: {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    cellPhone: '098-765-4321',
  },
};

/** Mock 房屋列表数据 */
export const MOCK_HOUSE_LIST: ApiResponse<HouseListItem[]> = {
  success: true,
  message: 'House list retrieved successfully',
  data: [
    {
      id: 1,
      address: '123 Main Street, City, State 12345',
      maxOccupant: 4,
      numberOfEmployees: 3,
      landlordId: 1,
      landlordFullName: 'John Doe',
      landlordPhone: '123-456-7890',
      landlordEmail: 'john.doe@example.com',
    },
    {
      id: 2,
      address: '456 Oak Avenue, City, State 12345',
      maxOccupant: 6,
      numberOfEmployees: 4,
      landlordId: 2,
      landlordFullName: 'Jane Smith',
      landlordPhone: '098-765-4321',
      landlordEmail: 'jane.smith@example.com',
    },
  ],
};

/** Mock 设施数据 */
export const MOCK_FACILITIES: ApiResponse<Facility[]> = {
  success: true,
  message: 'Facilities retrieved successfully',
  data: [
    {
      id: 1,
      type: 'Bed',
      description: 'Queen size bed',
      quantity: 2,
    },
    {
      id: 2,
      type: 'Mattress',
      description: 'Memory foam mattress',
      quantity: 4,
    },
    {
      id: 3,
      type: 'Table',
      description: 'Dining table',
      quantity: 2,
    },
    {
      id: 4,
      type: 'Chair',
      description: 'Dining chairs',
      quantity: 6,
    },
  ],
};

/** Mock 房屋详情数据 */
export const MOCK_HOUSE_DETAIL: ApiResponse<HouseDetail> = {
  success: true,
  message: 'House detail retrieved successfully',
  data: {
    id: 1,
    address: '123 Main Street',
    maxOccupant: 4,
    numberOfEmployees: 3,
    landlordId: 1,
    landlord: MOCK_LANDLORD.data!,
    facilitySummary: {
      Bed: 4,
      Mattress: 4,
      Table: 2,
      Chair: 6,
    },
    facilities: MOCK_FACILITIES.data!,
  },
};

/** Mock 住户数据 */
export const MOCK_HOUSE_EMPLOYEE_VIEW: ApiResponse<HouseEmployeeView> = {
  success: true,
  message: 'House employee view retrieved successfully',
  data: {
    id: 1,
    address: '123 Main Street, City, State 12345',
    residents: [
      {
        employeeID: 100,
        name: 'Em',
        phone: '555-123-4567',
      },
      {
        employeeID: 1,
        name: 'Alice Wang',
        phone: '111-222-3333',
      },
      {
        employeeID: 2,
        name: 'Bob Smith',
        phone: '444-555-6666',
      },
    ],
  },
};

/** Mock 报修工单列表 */
export const MOCK_FACILITY_REPORT_LIST: ApiResponse<FacilityReportListItem[]> = {
  success: true,
  message: 'Facility report list retrieved successfully',
  data: [
    {
      id: 1,
      title: 'Broken bed frame',
      createDate: '2024-01-15T10:30:00Z',
      status: 'Open',
      statusDisplayName: 'Open',
    },
    {
      id: 2,
      title: 'Leaking faucet',
      createDate: '2024-01-16T14:20:00Z',
      status: 'In Progress',
      statusDisplayName: 'In Progress',
    },
    {
      id: 3,
      title: 'Broken chair',
      createDate: '2024-01-10T09:15:00Z',
      status: 'Closed',
      statusDisplayName: 'Closed',
    },
  ],
};

/** Mock 报修评论 */
export const MOCK_COMMENTS: ApiResponse<FacilityReportComment[]> = {
  success: true,
  message: 'Comments retrieved successfully',
  data: [
    {
      id: 1,
      employeeId: 1,
      createdBy: 'Alice Smith',
      comment: 'Please fix ASAP',
      createDate: '2024-01-15T10:30:00Z',
      displayDate: '2024-01-15T10:30:00Z',
      canEdit: true,
    },
    {
      id: 2,
      employeeId: 200,
      createdBy: 'HR Admin',
      comment: 'Maintenance scheduled for tomorrow',
      createDate: '2024-01-15T14:00:00Z',
      displayDate: '2024-01-15T14:00:00Z',
      canEdit: false,
    },
  ],
};

/** Mock 报修工单详情 */
export const MOCK_FACILITY_REPORT_DETAIL: ApiResponse<FacilityReportDetail> = {
  success: true,
  message: 'Facility report detail retrieved successfully',
  data: {
    id: 1,
    facilityId: 1,
    facilityType: 'Bed',
    houseId: 1,
    houseAddress: '123 Main Street',
    title: 'Broken bed frame',
    description: 'The bed frame is broken and needs repair',
    employeeId: 1,
    createdBy: 'Alice Smith',
    createDate: '2024-01-15T10:30:00Z',
    status: 'In Progress',
    statusDisplayName: 'In Progress',
    comments: MOCK_COMMENTS.data!,
  },
};

/**
 * Gap Fix Scenario: HR housing dashboard heavy load (12 reports + threaded comments)
 */
const HEAVY_LOAD_REPORTS: FacilityReportDetail[] = Array.from({ length: 12 }).map((_, index) => {
  const id = index + 1;
  const statusCycle = ['Open', 'In Progress', 'Closed'] as const;
  const status = statusCycle[index % statusCycle.length];
  const baseReport: FacilityReportDetail = {
    id: 800 + id,
    facilityId: (index % 4) + 1,
    facilityType: ['Bed', 'Chair', 'Table', 'Mattress'][index % 4],
    houseId: 99,
    houseAddress: '999 Innovation Way, Boston, MA 02110',
    title: `Stress Test Report #${id}`,
    description: `Auto-generated facility report ${id} for pagination QA.`,
    employeeId: 500 + id,
    createdBy: `QA User ${id}`,
    createDate: `2024-02-${(index % 28) + 1}T09:00:00Z`,
    status,
    statusDisplayName: status,
    comments: [
      {
        id: 7000 + id,
        employeeId: 500 + id,
        createdBy: `QA User ${id}`,
        comment: `Initial note for report #${id}`,
        createDate: `2024-02-${(index % 28) + 1}T09:30:00Z`,
        displayDate: `2024-02-${(index % 28) + 1}T09:30:00Z`,
        canEdit: true,
      },
    ],
  };

  if (index === 0) {
    baseReport.comments = [
      ...baseReport.comments,
      {
        id: 7100,
        employeeId: 900,
        createdBy: 'HR Admin',
        comment: 'Thanks for the detailed description. Vendor scheduled.',
        createDate: '2024-02-01T12:00:00Z',
        displayDate: '2024-02-01T12:00:00Z',
        canEdit: false,
      },
      {
        id: 7101,
        employeeId: 901,
        createdBy: 'Maintenance Lead',
        comment: 'Parts ordered, expect completion tomorrow.',
        createDate: '2024-02-01T16:15:00Z',
        displayDate: '2024-02-01T16:15:00Z',
        canEdit: false,
      },
    ];
  }

  return baseReport;
});

export const SCENARIO_HOUSE_HEAVY_LOAD: (HouseDetail & { reports: FacilityReportDetail[] }) = {
  ...MOCK_HOUSE_DETAIL.data!,
  id: 99,
  address: '999 Innovation Way, Boston, MA 02110',
  maxOccupant: 12,
  numberOfEmployees: 11,
  facilities: [
    {
      id: 401,
      type: 'Bed',
      description: 'Full size beds',
      quantity: 8,
    },
    {
      id: 402,
      type: 'Chair',
      description: 'Office chairs',
      quantity: 12,
    },
  ],
  facilitySummary: {
    Bed: 8,
    Chair: 12,
    Table: 4,
    Mattress: 8,
  },
  reports: HEAVY_LOAD_REPORTS,
};
