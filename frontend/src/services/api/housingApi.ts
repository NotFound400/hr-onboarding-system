/**
 * Housing API Service
 * 处理房屋管理和设施报修的 API 请求
 */

import axiosClient from './axiosClient';
import { isMockMode, delay } from '@/utils/mockUtils';
import type { 
  House,
  HouseDetail,
  Landlord,
  Facility,
  FacilityReport,
  FacilityReportDetail,
  CreateFacilityReportRequest,
  UpdateFacilityReportRequest,
  AddFacilityReportCommentRequest,
  FacilityReportStatus
} from '@/types';
import type { FacilityReportComment } from '@/types/housing';

// ==================== Mock Data ====================
const MOCK_LANDLORD: Landlord = {
  id: 1,
  firstName: 'Robert',
  lastName: 'Williams',
  email: 'robert.williams@example.com',
  cellPhone: '555-123-4567',
};

const MOCK_FACILITY: Facility = {
  id: 1,
  houseId: 1,
  type: 'Bed',
  description: 'Queen size bed',
  quantity: 2,
};

const MOCK_HOUSE: House = {
  id: 1,
  landlordId: 1,
  address: '123 Maple Street, New York, NY 10001',
  maxOccupant: 4,
};

const MOCK_HOUSE_DETAIL: HouseDetail = {
  ...MOCK_HOUSE,
  landlord: MOCK_LANDLORD,
  facilities: [
    MOCK_FACILITY,
    {
      id: 2,
      houseId: 1,
      type: 'Mattress',
      description: 'Memory foam mattress',
      quantity: 2,
    },
    {
      id: 3,
      houseId: 1,
      type: 'Table',
      description: 'Dining table',
      quantity: 1,
    },
  ],
};

const MOCK_FACILITY_REPORT: FacilityReport = {
  id: 1,
  facilityId: 1,
  employeeId: 1,
  title: 'Broken bed frame',
  description: 'The bed frame has a broken slat that needs replacement',
  createDate: '2024-01-01T00:00:00Z',
  status: 'Open' as FacilityReportStatus,
};

const MOCK_FACILITY_REPORT_COMMENT: FacilityReportComment = {
  id: 1,
  facilityReportId: 1,
  employeeId: 1,
  comment: 'The issue is getting worse, please fix ASAP',
  createDate: '2024-01-02T00:00:00Z',
  lastModificationDate: '2024-01-02T00:00:00Z',
};

const MOCK_FACILITY_REPORT_DETAIL: FacilityReportDetail = {
  ...MOCK_FACILITY_REPORT,
  facility: MOCK_FACILITY,
  employeeName: 'John Doe',
  comments: [MOCK_FACILITY_REPORT_COMMENT],
};

// ==================== House APIs ====================

/**
 * 获取所有房屋列表
 * @returns Promise<House[]>
 */
export const getAllHouses = async (): Promise<House[]> => {
  if (isMockMode()) {
    await delay(500);
    return [MOCK_HOUSE];
  }
  
  return axiosClient.get('/houses') as Promise<House[]>;
};

/**
 * 根据 ID 获取房屋详情（包含房东和设施信息）
 * @param id 房屋 ID
 * @returns Promise<HouseDetail>
 */
export const getHouseById = async (id: string): Promise<HouseDetail> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_HOUSE_DETAIL;
  }
  
  return axiosClient.get(`/houses/${id}`) as Promise<HouseDetail>;
};

/**
 * 创建房屋
 * @param data 房屋数据
 * @returns Promise<House>
 */
export const createHouse = async (data: Omit<House, 'id'>): Promise<House> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...data,
      id: Date.now(),
    };
  }
  
  return axiosClient.post('/houses', data) as Promise<House>;
};

/**
 * 更新房屋信息
 * @param id 房屋 ID
 * @param data 更新数据
 * @returns Promise<House>
 */
export const updateHouse = async (id: string, data: Partial<House>): Promise<House> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...MOCK_HOUSE,
      ...data,
      id,
    };
  }
  
  return axiosClient.put(`/houses/${id}`, data) as Promise<House>;
};

/**
 * 删除房屋
 * @param id 房屋 ID
 * @returns Promise<void>
 */
export const deleteHouse = async (id: string): Promise<void> => {
  if (isMockMode()) {
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
    return [MOCK_LANDLORD];
  }
  
  return axiosClient.get('/landlords') as Promise<Landlord[]>;
};

/**
 * 根据 ID 获取房东详情
 * @param id 房东 ID
 * @returns Promise<Landlord>
 */
export const getLandlordById = async (id: string): Promise<Landlord> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_LANDLORD;
  }
  
  return axiosClient.get(`/landlords/${id}`) as Promise<Landlord>;
};

/**
 * 创建房东
 * @param data 房东数据
 * @returns Promise<Landlord>
 */
export const createLandlord = async (data: Omit<Landlord, 'id'>): Promise<Landlord> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...data,
      id: Date.now(),
    };
  }
  
  return axiosClient.post('/landlords', data) as Promise<Landlord>;
};

// ==================== Facility APIs ====================

/**
 * 根据房屋 ID 获取设施列表
 * @param houseId 房屋 ID
 * @returns Promise<Facility[]>
 */
export const getFacilitiesByHouseId = async (houseId: string): Promise<Facility[]> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_HOUSE_DETAIL.facilities;
  }
  
  return axiosClient.get(`/facilities/house/${houseId}`) as Promise<Facility[]>;
};

/**
 * 创建设施
 * @param data 设施数据
 * @returns Promise<Facility>
 */
export const createFacility = async (data: Omit<Facility, 'id'>): Promise<Facility> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...data,
      id: Date.now(),
    };
  }
  
  return axiosClient.post('/facilities', data) as Promise<Facility>;
};

/**
 * 更新设施
 * @param id 设施 ID
 * @param data 更新数据
 * @returns Promise<Facility>
 */
export const updateFacility = async (id: string, data: Partial<Facility>): Promise<Facility> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...MOCK_FACILITY,
      ...data,
      id,
    };
  }
  
  return axiosClient.put(`/facilities/${id}`, data) as Promise<Facility>;
};

/**
 * 删除设施
 * @param id 设施 ID
 * @returns Promise<void>
 */
export const deleteFacility = async (id: string): Promise<void> => {
  if (isMockMode()) {
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/facilities/${id}`);
};

// ==================== Facility Report APIs ====================

/**
 * 获取所有设施报修工单
 * @returns Promise<FacilityReport[]>
 */
export const getAllFacilityReports = async (): Promise<FacilityReport[]> => {
  if (isMockMode()) {
    await delay(500);
    return [MOCK_FACILITY_REPORT];
  }
  
  return axiosClient.get('/facility-reports') as Promise<FacilityReport[]>;
};

/**
 * 根据状态获取设施报修工单
 * @param status 报修状态
 * @returns Promise<FacilityReport[]>
 */
export const getFacilityReportsByStatus = async (
  status: FacilityReportStatus
): Promise<FacilityReport[]> => {
  if (isMockMode()) {
    await delay(500);
    return [MOCK_FACILITY_REPORT].filter(report => report.status === status);
  }
  
  return axiosClient.get(`/facility-reports?status=${status}`) as Promise<FacilityReport[]>;
};

/**
 * 根据 ID 获取设施报修详情（包含评论列表）
 * @param id 报修 ID
 * @returns Promise<FacilityReportDetail>
 */
export const getFacilityReportById = async (id: string): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(300);
    return MOCK_FACILITY_REPORT_DETAIL;
  }
  
  return axiosClient.get(`/facility-reports/${id}`) as Promise<FacilityReportDetail>;
};

/**
 * 根据员工 ID 获取报修工单列表
 * @param employeeId 员工 ID
 * @returns Promise<FacilityReport[]>
 */
export const getFacilityReportsByEmployeeId = async (
  employeeId: string
): Promise<FacilityReport[]> => {
  if (isMockMode()) {
    await delay(300);
    return [MOCK_FACILITY_REPORT];
  }
  
  return axiosClient.get(`/facility-reports/employee/${employeeId}`) as Promise<FacilityReport[]>;
};

/**
 * 创建设施报修工单
 * @param data 创建报修请求数据
 * @returns Promise<FacilityReport>
 */
export const createFacilityReport = async (
  data: CreateFacilityReportRequest
): Promise<FacilityReport> => {
  if (isMockMode()) {
    await delay(500);
    return {
      id: Date.now(),
      facilityId: data.facilityId,
      employeeId: data.employeeId,
      title: data.title,
      description: data.description,
      createDate: new Date().toISOString(),
      status: 'Open' as FacilityReportStatus,
    };
  }
  
  return axiosClient.post('/facility-reports', data) as Promise<FacilityReport>;
};

/**
 * 更新报修工单状态
 * @param data 更新报修状态请求数据
 * @returns Promise<FacilityReport>
 */
export const updateFacilityReportStatus = async (
  data: UpdateFacilityReportRequest
): Promise<FacilityReport> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...MOCK_FACILITY_REPORT,
      id: data.id,
      status: data.status,
    };
  }
  
  return axiosClient.patch(`/facility-reports/${data.id}/status`, {
    status: data.status,
  }) as Promise<FacilityReport>;
};

/**
 * 添加报修工单评论
 * @param data 添加评论请求数据
 * @returns Promise<FacilityReportDetail>
 */
export const addFacilityReportComment = async (
  data: AddFacilityReportCommentRequest
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(500);
    return MOCK_FACILITY_REPORT_DETAIL;
  }
  
  return axiosClient.post(
    `/facility-reports/${data.facilityReportId}/comments`,
    {
      employeeId: data.employeeId,
      comment: data.comment,
    }
  ) as Promise<FacilityReportDetail>;
};

/**
 * 删除报修工单
 * @param id 报修 ID
 * @returns Promise<void>
 */
export const deleteFacilityReport = async (id: string): Promise<void> => {
  if (isMockMode()) {
    await delay(300);
    return;
  }
  
  await axiosClient.delete(`/facility-reports/${id}`);
};

