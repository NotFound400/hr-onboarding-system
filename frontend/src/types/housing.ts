/**
 * Housing Service Types
 * 基于后端 HousingDTO 定义的前端类型
 */

import { FacilityReportStatus } from './enums';

// Re-export request types
export type {
  CreateHouseRequest,
  UpdateHouseRequest,
  CreateLandlordRequest,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  CreateFacilityReportRequest,
  UpdateFacilityReportStatusRequest,
  AddFacilityReportCommentRequest
} from './request';

// ==================== Base Entity Types ====================

/** 房东基础信息 */
export interface Landlord {
  /** Primary Key */
  id: number;
  /** 名 */
  firstName: string;
  /** 姓 */
  lastName: string;
  /** 全名 */
  fullName: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  cellPhone: string;
}

/** 设施基础信息 */
export interface Facility {
  /** Primary Key */
  id: number;
  /** 设施类型 (e.g., 'Bed', 'Mattress', 'Table', 'Chair') */
  type: string;
  /** 描述 */
  description: string;
  /** 数量 */
  quantity: number;
}

/** 设施汇总 (按类型统计数量) */
export interface FacilitySummary {
  [facilityType: string]: number;
}

/** 房屋概要信息 (用于 HR 招聘流程房源选择) */
export interface HouseSummary {
  id: number;
  address: string;
  maxOccupant: number;
  currentOccupant: number;
  availableSpots: number;
}

/** 房屋可用状态 */
export interface HouseAvailability {
  houseId: number;
  address: string;
  maxOccupant: number;
  currentOccupants: number;
  available: boolean;
}

/** 住户信息 */
export interface Resident {
  /** 员工 ID */
  employeeId: number | string;
  /** 姓名 */
  name: string;
  /** 电话 */
  cellPhone: string;
}

// ==================== House Response Types ====================

/** 房屋列表项 (HR 视角) */
export interface HouseListItem {
  /** Primary Key */
  id: number;
  /** 地址 */
  address: string;
  /** 最大入住人数 */
  maxOccupant: number;
  /** 当前入住员工数 */
  numberOfEmployees: number;
  /** 房东 ID */
  landlordId: number;
  /** 房东全名 */
  landlordFullName: string;
  /** 房东电话 */
  landlordPhone: string;
  /** 房东邮箱 */
  landlordEmail: string;
  /** 房东信息 */
  landlord?: Landlord;
  /** 设施信息描述 */
  facilityInfo?: string;
  /** 员工列表 */
  employeeList?: any[];
}

/** House 类型别名 (兼容) */
export type House = HouseListItem;

type HouseViewType = 'HR_VIEW' | 'EMPLOYEE_VIEW';

interface HouseDetailBase {
  id: number;
  address: string;
  viewType: HouseViewType;
}

/** 房屋详情 (HR 视角) */
export interface HouseDetailHR extends HouseDetailBase {
  maxOccupant: number;
  numberOfEmployees: number;
  currentOccupant?: number;
  landlordId?: number;
  landlord?: Landlord;
  facilitySummary?: FacilitySummary;
  facilities: Facility[];
}

/** 房屋详情 (员工视角) */
export interface HouseDetailEmployee extends HouseDetailBase {
  viewType: 'EMPLOYEE_VIEW';
  roommates: Resident[];
}

/** 房屋详情 (联邦类型) */
export type HouseDetail = HouseDetailHR | HouseDetailEmployee;

/** 房屋信息 (员工视角) */
export interface HouseEmployeeView {
  /** Primary Key */
  id: number;
  /** 地址 */
  address: string;
  /** 室友列表 */
  roommates: Resident[];
}

// ==================== Facility Report Types ====================

/** 报修工单列表项 */
export interface FacilityReportListItem {
  /** Primary Key */
  id: number;
  /** 标题 */
  title: string;
  /** 创建时间 */
  createDate: string;
  /** 状态 */
  status: FacilityReportStatus;
  /** 状态显示名称 */
  statusDisplayName: string;
}

/** 报修评论 */
export interface FacilityReportComment {
  /** Primary Key */
  id: number;
  /** 员工 ID */
  employeeId: number;
  /** 创建者姓名 */
  createdBy: string;
  /** 评论内容 */
  comment: string;
  /** 创建时间 */
  createDate: string;
  /** 显示时间 */
  displayDate: string;
  /** 是否可编辑 */
  canEdit: boolean;
}

/** 报修工单详情 */
export interface FacilityReportDetail {
  /** Primary Key */
  id: number;
  /** 设施 ID */
  facilityId: number;
  /** 设施类型 */
  facilityType: string;
  /** 房屋 ID */
  houseId: number;
  /** 房屋地址 */
  houseAddress: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 员工 ID */
  employeeId: number;
  /** 创建者姓名 */
  createdBy: string;
  /** 创建时间 */
  createDate: string;
  /** 状态 */
  status: FacilityReportStatus;
  /** 状态显示名称 */
  statusDisplayName: string;
  /** 评论列表 */
  comments: FacilityReportComment[];
}

/** 设施报修分页响应 */
export interface FacilityReportPage {
  content: FacilityReportListItem[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort?: unknown;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
