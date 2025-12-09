/**
 * Housing API Service
 * 基于后端 HousingDTO 的 API 请求处理
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import type { 
  HouseListItem,
  HouseDetail,
  HouseEmployeeView,
  Landlord,
  Facility,
  FacilityReportListItem,
  FacilityReportDetail,
  FacilityReportComment,
  CreateHouseRequest,
  UpdateHouseRequest,
  CreateLandlordRequest,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  CreateFacilityReportRequest,
  UpdateFacilityReportStatusRequest,
  AddFacilityReportCommentRequest,
  FacilityReportStatus,
  ApiResponse
} from '../../types';

// ==================== Mock Data ====================

/** Mock 房东数据 */
const MOCK_LANDLORD: ApiResponse<Landlord> = {
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

const MOCK_LANDLORD_2: ApiResponse<Landlord> = {
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
const MOCK_HOUSE_LIST: ApiResponse<HouseListItem[]> = {
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
const MOCK_FACILITIES: ApiResponse<Facility[]> = {
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
const MOCK_HOUSE_DETAIL: ApiResponse<HouseDetail> = {
  success: true,
  message: 'House detail retrieved successfully',
  data: {
    id: 1,
    address: '123 Main Street',
    maxOccupant: 4,
    numberOfEmployees: 3,
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
const MOCK_HOUSE_EMPLOYEE_VIEW: ApiResponse<HouseEmployeeView> = {
  success: true,
  message: 'House employee view retrieved successfully',
  data: {
    id: 1,
    address: '123 Main Street, City, State 12345',
    residents: [
      {
        employeeId: 100, // QA Test: employee 账号对应的 Employee
        name: 'Em', // 优先显示 Preferred Name
        phone: '555-123-4567',
      },
      {
        employeeId: 1,
        name: 'Alice Wang', // Preferred Name: Allie
        phone: '111-222-3333',
      },
      {
        employeeId: 2,
        name: 'Bob Smith',
        phone: '444-555-6666',
      },
    ],
  },
};

/** Mock 报修工单列表 */
const MOCK_FACILITY_REPORT_LIST: ApiResponse<FacilityReportListItem[]> = {
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
      status: 'In Progress', // 注意：包含空格
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
const MOCK_COMMENTS: ApiResponse<FacilityReportComment[]> = {
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
const MOCK_FACILITY_REPORT_DETAIL: ApiResponse<FacilityReportDetail> = {
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
    status: 'In Progress', // ✅ 修复：包含空格
    statusDisplayName: 'In Progress',
    comments: MOCK_COMMENTS.data!,
  },
};

// ==================== House APIs (HR) ====================

/**
 * 获取所有房屋列表 (HR 视角)
 * @returns Promise<HouseListItem[]>
 */
export const getAllHouses = async (): Promise<HouseListItem[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_HOUSE_LIST.data!;
  }
  
  return axiosClient.get('/houses') as Promise<HouseListItem[]>;
};

/**
 * 根据 ID 获取房屋详情 (HR 视角)
 * @param id 房屋 ID
 * @returns Promise<HouseDetail>
 */
export const getHouseById = async (id: number): Promise<HouseDetail> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_HOUSE_DETAIL.data!;
  }
  
  return axiosClient.get(`/houses/${id}`) as Promise<HouseDetail>;
};

/**
 * 获取员工的房屋信息 (员工视角)
 * @param employeeId 员工 ID
 * @returns Promise<HouseEmployeeView>
 */
export const getEmployeeHouse = async (employeeId: number): Promise<HouseEmployeeView> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_HOUSE_EMPLOYEE_VIEW.data!;
  }
  
  return axiosClient.get(`/houses/employee/${employeeId}`) as Promise<HouseEmployeeView>;
};

/**
 * 获取房屋列表 (别名)
 * @returns Promise<HouseListItem[]>
 */
export const getHouseList = getAllHouses;

/**
 * 获取房屋详情 (别名)
 * @param houseId 房屋 ID
 * @returns Promise<HouseDetail>
 */
export const getHouseDetail = getHouseById;

/**
 * 创建房屋
 * @param data 房屋数据
 * @returns Promise<HouseDetail>
 */
export const createHouse = async (data: CreateHouseRequest): Promise<HouseDetail> => {
  if (isMockMode()) {
    console.log('[Mock Request] createHouse:', data);
    await delay(500);
    return {
      ...MOCK_HOUSE_DETAIL.data!,
      id: Date.now(),
      address: data.address,
      maxOccupant: data.maxOccupant || 4,
      numberOfEmployees: 0,
    };
  }
  
  return axiosClient.post('/houses', data) as Promise<HouseDetail>;
};

/**
 * 更新房屋信息
 * @param id 房屋 ID
 * @param data 更新数据
 * @returns Promise<HouseDetail>
 */
export const updateHouse = async (id: number, data: Partial<UpdateHouseRequest>): Promise<HouseDetail> => {
  if (isMockMode()) {
    console.log('[Mock Request] updateHouse:', { id, data });
    await delay(500);
    return {
      ...MOCK_HOUSE_DETAIL.data!,
      ...data,
      id,
    };
  }
  
  return axiosClient.put(`/houses/${id}`, data) as Promise<HouseDetail>;
};

/**
 * 删除房屋
 * @param id 房屋 ID
 * @returns Promise<void>
 */
export const deleteHouse = async (id: number): Promise<void> => {
  if (isMockMode()) {
    console.log('[Mock Request] deleteHouse:', { id });
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/houses/${id}`);
};

// ==================== Landlord APIs ====================

/**
 * 获取所有房东列表
 * @returns Promise<Landlord[]>
 */
export const getAllLandlords = async (): Promise<Landlord[]> => {
  if (isMockMode()) {
    await delay(300);
    return [MOCK_LANDLORD.data!, MOCK_LANDLORD_2.data!];
  }
  
  return axiosClient.get('/landlords') as Promise<Landlord[]>;
};

/**
 * 根据 ID 获取房东详情
 * @param id 房东 ID
 * @returns Promise<Landlord>
 */
export const getLandlordById = async (id: number): Promise<Landlord> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_LANDLORD.data!;
  }
  
  return axiosClient.get(`/landlords/${id}`) as Promise<Landlord>;
};

/**
 * 创建房东
 * @param data 房东数据
 * @returns Promise<Landlord>
 */
export const createLandlord = async (data: CreateLandlordRequest): Promise<Landlord> => {
  if (isMockMode()) {
    console.log('[Mock Request] createLandlord:', data);
    await delay(500);
    return {
      id: Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      cellPhone: data.cellPhone,
    };
  }
  
  return axiosClient.post('/landlords', data) as Promise<Landlord>;
};

/**
 * 更新房东信息
 * @param id 房东 ID
 * @param data 更新数据
 * @returns Promise<Landlord>
 */
export const updateLandlord = async (id: number, data: Partial<CreateLandlordRequest>): Promise<Landlord> => {
  if (isMockMode()) {
    console.log('[Mock Request] updateLandlord:', { id, data });
    await delay(500);
    return {
      ...MOCK_LANDLORD.data!,
      ...data,
      fullName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : MOCK_LANDLORD.data!.fullName,
      id,
    };
  }
  
  return axiosClient.put(`/landlords/${id}`, data) as Promise<Landlord>;
};

/**
 * 删除房东
 * @param id 房东 ID
 * @returns Promise<void>
 */
export const deleteLandlord = async (id: number): Promise<void> => {
  if (isMockMode()) {
    console.log('[Mock Request] deleteLandlord:', { id });
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/landlords/${id}`);
};

// ==================== Facility APIs ====================

/**
 * 根据房屋 ID 获取设施列表
 * @param houseId 房屋 ID
 * @returns Promise<Facility[]>
 */
export const getFacilitiesByHouseId = async (houseId: number): Promise<Facility[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_FACILITIES.data!;
  }
  
  return axiosClient.get(`/houses/${houseId}/facilities`) as Promise<Facility[]>;
};

/**
 * 创建设施
 * @param houseId 房屋 ID
 * @param data 设施数据
 * @returns Promise<Facility>
 */
export const createFacility = async (houseId: number, data: CreateFacilityRequest): Promise<Facility> => {
  if (isMockMode()) {
    console.log('[Mock Request] createFacility:', { houseId, data });
    await delay(500);
    return {
      id: Date.now(),
      type: data.type,
      description: data.description,
      quantity: data.quantity,
    };
  }
  
  return axiosClient.post(`/houses/${houseId}/facilities`, data) as Promise<Facility>;
};

/**
 * 更新设施
 * @param houseId 房屋 ID
 * @param facilityId 设施 ID
 * @param data 更新数据
 * @returns Promise<Facility>
 */
export const updateFacility = async (
  houseId: number,
  facilityId: number,
  data: Partial<UpdateFacilityRequest>
): Promise<Facility> => {
  if (isMockMode()) {
    console.log('[Mock Request] updateFacility:', { houseId, facilityId, data });
    await delay(500);
    return {
      ...MOCK_FACILITIES.data![0],
      ...data,
      id: facilityId,
    };
  }
  
  return axiosClient.put(`/houses/${houseId}/facilities/${facilityId}`, data) as Promise<Facility>;
};

/**
 * 删除设施
 * @param houseId 房屋 ID
 * @param facilityId 设施 ID
 * @returns Promise<void>
 */
export const deleteFacility = async (houseId: number, facilityId: number): Promise<void> => {
  if (isMockMode()) {
    console.log('[Mock Request] deleteFacility:', { houseId, facilityId });
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/houses/${houseId}/facilities/${facilityId}`);
};

// ==================== Facility Report APIs ====================

/**
 * 获取所有设施报修工单列表
 * @returns Promise<FacilityReportListItem[]>
 */
export const getAllFacilityReports = async (): Promise<FacilityReportListItem[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_FACILITY_REPORT_LIST.data!;
  }
  
  return axiosClient.get('/facility-reports') as Promise<FacilityReportListItem[]>;
};

/**
 * 根据状态获取设施报修工单列表
 * @param status 报修状态
 * @returns Promise<FacilityReportListItem[]>
 */
export const getFacilityReportsByStatus = async (
  status: FacilityReportStatus
): Promise<FacilityReportListItem[]> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_FACILITY_REPORT_LIST.data!.filter(report => report.status === status);
  }
  
  return axiosClient.get(`/facility-reports?status=${status}`) as Promise<FacilityReportListItem[]>;
};

/**
 * 根据 ID 获取设施报修详情（包含评论列表）
 * @param id 报修 ID
 * @returns Promise<FacilityReportDetail>
 */
export const getFacilityReportById = async (id: number): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_FACILITY_REPORT_DETAIL.data!;
  }
  
  return axiosClient.get(`/facility-reports/${id}`) as Promise<FacilityReportDetail>;
};

/**
 * 根据员工 ID 获取报修工单列表
 * @param employeeId 员工 ID
 * @returns Promise<FacilityReportListItem[]>
 */
export const getFacilityReportsByEmployeeId = async (
  employeeId: number
): Promise<FacilityReportListItem[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_FACILITY_REPORT_LIST.data!;
  }
  
  return axiosClient.get(`/facility-reports/employee/${employeeId}`) as Promise<FacilityReportListItem[]>;
};

/**
 * 创建设施报修工单
 * @param data 创建报修请求数据
 * @returns Promise<FacilityReportDetail>
 */
export const createFacilityReport = async (
  data: CreateFacilityReportRequest
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    console.log('[Mock Request] createFacilityReport:', data);
    await delay(500);
    return {
      ...MOCK_FACILITY_REPORT_DETAIL.data!,
      id: Date.now(),
      title: data.title,
      description: data.description,
      // facilityId: data.facilityId, // 不在 CreateFacilityReportRequest 中
      createDate: new Date().toISOString(),
      status: 'Open',
      statusDisplayName: 'Open',
      comments: [],
    };
  }
  
  return axiosClient.post('/facility-reports', data) as Promise<FacilityReportDetail>;
};

/**
 * 更新报修工单状态
 * @param id 报修 ID
 * @param data 更新报修状态请求数据
 * @returns Promise<FacilityReportDetail>
 */
export const updateFacilityReportStatus = async (
  id: number,
  data: UpdateFacilityReportStatusRequest
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    console.log('[Mock Request] updateFacilityReportStatus:', { id, data });
    await delay(500);
    const statusDisplayNames: Record<FacilityReportStatus, string> = {
      'Open': 'Open',
      'In Progress': 'In Progress', // Key 必须与 Enum 一致
      'Closed': 'Closed',
    };
    return {
      ...MOCK_FACILITY_REPORT_DETAIL.data!,
      id,
      status: data.status,
      statusDisplayName: statusDisplayNames[data.status],
    };
  }
  
  return axiosClient.patch(`/facility-reports/${id}/status`, data) as Promise<FacilityReportDetail>;
};

/**
 * 添加报修工单评论
 * @param reportId 报修工单 ID
 * @param data 添加评论请求数据
 * @returns Promise<FacilityReportDetail>
 */
export const addFacilityReportComment = async (
  reportId: number,
  data: AddFacilityReportCommentRequest
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    console.log('[Mock Request] addFacilityReportComment:', { reportId, data });
    await delay(500);
    const newComment: FacilityReportComment = {
      id: Date.now(),
      employeeId: 1,
      createdBy: 'Current User',
      comment: data.comment,
      createDate: new Date().toISOString(),
      displayDate: new Date().toISOString(),
      canEdit: true,
    };
    return {
      ...MOCK_FACILITY_REPORT_DETAIL.data!,
      comments: [...MOCK_FACILITY_REPORT_DETAIL.data!.comments, newComment],
    };
  }
  
  return axiosClient.post(`/facility-reports/${reportId}/comments`, data) as Promise<FacilityReportDetail>;
};

/**
 * 更新报修工单评论
 * @param reportId 报修工单 ID
 * @param commentId 评论 ID
 * @param comment 评论内容
 * @returns Promise<FacilityReportDetail>
 */
export const updateFacilityReportComment = async (
  reportId: number,
  commentId: number,
  comment: string
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    console.log('[Mock Request] updateFacilityReportComment:', { reportId, commentId, comment });
    await delay(500);
    return MOCK_FACILITY_REPORT_DETAIL.data!;
  }
  
  return axiosClient.put(
    `/facility-reports/${reportId}/comments/${commentId}`,
    { comment }
  ) as Promise<FacilityReportDetail>;
};

/**
 * 删除报修工单评论
 * @param reportId 报修工单 ID
 * @param commentId 评论 ID
 * @returns Promise<FacilityReportDetail>
 */
export const deleteFacilityReportComment = async (
  reportId: number,
  commentId: number
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    console.log('[Mock Request] deleteFacilityReportComment:', { reportId, commentId });
    await delay(300);
    return {
      ...MOCK_FACILITY_REPORT_DETAIL.data!,
      comments: MOCK_FACILITY_REPORT_DETAIL.data!.comments.filter(c => c.id !== commentId),
    };
  }
  
  return axiosClient.delete(`/facility-reports/${reportId}/comments/${commentId}`) as Promise<FacilityReportDetail>;
};

/**
 * 删除报修工单
 * @param id 报修 ID
 * @returns Promise<void>
 */
export const deleteFacilityReport = async (id: number): Promise<void> => {
  if (isMockMode()) {
    console.log('[Mock Request] deleteFacilityReport:', { id });
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/facility-reports/${id}`);
};

