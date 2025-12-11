/**
 * Housing API Service
 * 基于后端 HousingDTO 的 API 请求处理
 */

import axiosClient, { buildHousingPath } from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import * as HousingMocks from '../mocks/housingMocks';
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
  FacilityReportStatus
} from '../../types';

// ==================== House APIs (HR) ====================

/**
 * 获取所有房屋列表 (HR 视角)
 * @returns Promise<HouseListItem[]>
 */
export const getAllHouses = async (): Promise<HouseListItem[]> => {
  if (isMockMode()) {
    await delay(500);
    // return HousingMocks.MOCK_HOUSE_LIST.data!; // 🟢 标准房屋列表
    // return [HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD].map(house => ({
    //   id: house.id,
    //   address: house.address,
    //   maxOccupant: house.maxOccupant,
    //   numberOfEmployees: house.numberOfEmployees,
    //   landlordId: house.landlord.id,
    //   landlordFullName: house.landlord.fullName,
    //   landlordPhone: house.landlord.cellPhone,
    //   landlordEmail: house.landlord.email,
    // })); // 🔴 场景：HR 重载分页
    return HousingMocks.MOCK_HOUSE_LIST.data!;
  }
  
  return axiosClient.get(buildHousingPath('/houses')) as Promise<HouseListItem[]>;
};

/**
 * 根据 ID 获取房屋详情 (HR 视角)
 * @param id 房屋 ID
 * @returns Promise<HouseDetail>
 */
export const getHouseById = async (id: number): Promise<HouseDetail> => {
  if (isMockMode()) {
    await delay(300);
    // return HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD; // 🔴 场景：包含 12 条报修记录
    return HousingMocks.MOCK_HOUSE_DETAIL.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/houses/${id}`)) as Promise<HouseDetail>;
};

/**
 * 获取员工的房屋信息 (员工视角)
 * @param employeeId 员工 ID
 * @returns Promise<HouseEmployeeView>
 */
export const getEmployeeHouse = async (employeeId: number): Promise<HouseEmployeeView> => {
  if (isMockMode()) {
    await delay(300);
    // return HousingMocks.MOCK_HOUSE_EMPLOYEE_VIEW.data!; // 🟢 默认员工视图
    return HousingMocks.MOCK_HOUSE_EMPLOYEE_VIEW.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/houses/employee/${employeeId}`)) as Promise<HouseEmployeeView>;
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
    // return HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD; // 🔴 直接返回压力测试房屋
    return {
      ...HousingMocks.MOCK_HOUSE_DETAIL.data!,
      id: Date.now(),
      address: data.address,
      maxOccupant: data.maxOccupant || 4,
      numberOfEmployees: 0,
    };
  }
  
  return axiosClient.post(buildHousingPath('/houses'), data) as Promise<HouseDetail>;
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
    // return { ...HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD, ...data, id }; // 🔴 检查分页后的房屋
    return {
      ...HousingMocks.MOCK_HOUSE_DETAIL.data!,
      ...data,
      id,
    };
  }
  
  return axiosClient.put(buildHousingPath(`/houses/${id}`), data) as Promise<HouseDetail>;
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
  
  await axiosClient.delete(buildHousingPath(`/houses/${id}`));
};

// ==================== Landlord APIs ====================

/**
 * 获取所有房东列表
 * @returns Promise<Landlord[]>
 */
export const getAllLandlords = async (): Promise<Landlord[]> => {
  if (isMockMode()) {
    await delay(300);
    // return [HousingMocks.MOCK_LANDLORD.data!, HousingMocks.MOCK_LANDLORD_2.data!]; // 🟢
    return [HousingMocks.MOCK_LANDLORD.data!, HousingMocks.MOCK_LANDLORD_2.data!];
  }
  
  return axiosClient.get(buildHousingPath('/landlords')) as Promise<Landlord[]>;
};

/**
 * 根据 ID 获取房东详情
 * @param id 房东 ID
 * @returns Promise<Landlord>
 */
export const getLandlordById = async (id: number): Promise<Landlord> => {
  if (isMockMode()) {
    await delay(300);
    // return HousingMocks.MOCK_LANDLORD.data!; // 🟢
    return HousingMocks.MOCK_LANDLORD.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/landlords/${id}`)) as Promise<Landlord>;
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
  
  return axiosClient.post(buildHousingPath('/landlords'), data) as Promise<Landlord>;
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
      ...HousingMocks.MOCK_LANDLORD.data!,
      ...data,
      fullName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : HousingMocks.MOCK_LANDLORD.data!.fullName,
      id,
    };
  }
  
  return axiosClient.put(buildHousingPath(`/landlords/${id}`), data) as Promise<Landlord>;
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
  
  await axiosClient.delete(buildHousingPath(`/landlords/${id}`));
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
    // return HousingMocks.MOCK_FACILITIES.data!; // 🟢
    return HousingMocks.MOCK_FACILITIES.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/houses/${houseId}/facilities`)) as Promise<Facility[]>;
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
  
  return axiosClient.post(buildHousingPath(`/houses/${houseId}/facilities`), data) as Promise<Facility>;
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
    // return HousingMocks.MOCK_FACILITIES.data![0]; // 🟢
    return {
      ...HousingMocks.MOCK_FACILITIES.data![0],
      ...data,
      id: facilityId,
    };
  }
  
  return axiosClient.put(buildHousingPath(`/houses/${houseId}/facilities/${facilityId}`), data) as Promise<Facility>;
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
  
  await axiosClient.delete(buildHousingPath(`/houses/${houseId}/facilities/${facilityId}`));
};

// ==================== Facility Report APIs ====================

/**
 * 获取所有设施报修工单列表
 * @returns Promise<FacilityReportListItem[]>
 */
export const getAllFacilityReports = async (): Promise<FacilityReportListItem[]> => {
  if (isMockMode()) {
    await delay(500);
    // return HousingMocks.MOCK_FACILITY_REPORT_LIST.data!; // 🟢 默认报修列表
    // return HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD.reports.map(report => ({
    //   id: report.id,
    //   title: report.title,
    //   createDate: report.createDate,
    //   status: report.status,
    //   statusDisplayName: report.statusDisplayName,
    // })); // 🔴 12 条工单分页测试
    return HousingMocks.MOCK_FACILITY_REPORT_LIST.data!;
  }
  
  return axiosClient.get(buildHousingPath('/facility-reports')) as Promise<FacilityReportListItem[]>;
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
    // return HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD.reports
    //   .filter(report => report.status === status)
    //   .map(report => ({
    //     id: report.id,
    //     title: report.title,
    //     createDate: report.createDate,
    //     status: report.status,
    //     statusDisplayName: report.statusDisplayName,
    //   })); // 🔴 结合分页筛选
    return HousingMocks.MOCK_FACILITY_REPORT_LIST.data!.filter(report => report.status === status);
  }
  
  return axiosClient.get(buildHousingPath(`/facility-reports?status=${status}`)) as Promise<FacilityReportListItem[]>;
};

/**
 * 根据 ID 获取设施报修详情（包含评论列表）
 * @param id 报修 ID
 * @returns Promise<FacilityReportDetail>
 */
export const getFacilityReportById = async (id: number): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(300);
     // return HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD.reports[0]; // 🔴 报修包含多条评论
    return HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/facility-reports/${id}`)) as Promise<FacilityReportDetail>;
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
    // return HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD.reports
    //   .filter(report => report.employeeId === employeeId)
    //   .map(report => ({
    //     id: report.id,
    //     title: report.title,
    //     createDate: report.createDate,
    //     status: report.status,
    //     statusDisplayName: report.statusDisplayName,
    //   })); // 🔴 员工维度工单
    return HousingMocks.MOCK_FACILITY_REPORT_LIST.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/facility-reports/employee/${employeeId}`)) as Promise<FacilityReportListItem[]>;
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
    // return HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD.reports[1]; // 🔴 直接返回已有工单
    return {
      ...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!,
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
  
  return axiosClient.post(buildHousingPath('/facility-reports'), data) as Promise<FacilityReportDetail>;
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
      ...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!,
      id,
      status: data.status,
      statusDisplayName: statusDisplayNames[data.status],
    };
  }
  
  return axiosClient.patch(buildHousingPath(`/facility-reports/${id}/status`), data) as Promise<FacilityReportDetail>;
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
      ...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!,
      comments: [...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!.comments, newComment],
    };
  }
  
  return axiosClient.post(buildHousingPath(`/facility-reports/${reportId}/comments`), data) as Promise<FacilityReportDetail>;
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
    // return HousingMocks.SCENARIO_HOUSE_HEAVY_LOAD.reports[0]; // 🔴 复用多评论工单
    return HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!;
  }
  
  return axiosClient.put(
    buildHousingPath(`/facility-reports/${reportId}/comments/${commentId}`),
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
      ...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!,
      comments: HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!.comments.filter(c => c.id !== commentId),
    };
  }
  
  return axiosClient.delete(buildHousingPath(`/facility-reports/${reportId}/comments/${commentId}`)) as Promise<FacilityReportDetail>;
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
  
  await axiosClient.delete(buildHousingPath(`/facility-reports/${id}`));
};

