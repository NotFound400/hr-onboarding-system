/**
 * Housing Service Types
 * 对应 MySQL 中的 House, Landlord, Facility, FacilityReport 表
 * 负责房屋管理及设施报修
 */

import { FacilityReportStatus } from './enums';

/** 房东表 */
export interface Landlord {
  /** Primary Key */
  id: string;
  /** 名 */
  firstName: string;
  /** 姓 */
  lastName: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  cellPhone: string;
}

/** 房屋表 */
export interface House {
  /** Primary Key */
  id: string;
  /** 房东 ID (Foreign Key -> Landlord.ID) */
  landlordId: string;
  /** 地址 */
  address: string;
  /** 最大入住人数 */
  maxOccupant: number;
}

/** 设施表 */
export interface Facility {
  /** Primary Key */
  id: string;
  /** 房屋 ID (Foreign Key -> House.ID) */
  houseId: string;
  /** 设施类型 (e.g., 'Bed', 'Mattress', 'Table') */
  type: string;
  /** 描述 */
  description: string;
  /** 数量 */
  quantity: number;
}

/** 设施报修评论 */
export interface FacilityReportComment {
  /** Primary Key */
  id: string;
  /** 报修 ID (Foreign Key -> FacilityReport.ID) */
  facilityReportId: string;
  /** 员工 ID (Foreign Key -> Employee.ID) */
  employeeId: string;
  /** 评论内容 */
  comment: string;
  /** 创建时间 */
  createDate: string;
  /** 最后修改时间 */
  lastModificationDate: string;
}

/** 设施报修工单 */
export interface FacilityReport {
  /** Primary Key */
  id: string;
  /** 设施 ID (Foreign Key -> Facility.ID) */
  facilityId: string;
  /** 员工 ID (Foreign Key -> Employee.ID) */
  employeeId: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 创建时间 */
  createDate: string;
  /** 状态 */
  status: FacilityReportStatus;
}

/** 创建报修工单请求 */
export interface CreateFacilityReportRequest {
  facilityId: string;
  employeeId: string;
  title: string;
  description: string;
}

/** 更新报修状态请求 */
export interface UpdateFacilityReportRequest {
  id: string;
  status: FacilityReportStatus;
}

/** 添加报修评论请求 */
export interface AddFacilityReportCommentRequest {
  facilityReportId: string;
  employeeId: string;
  comment: string;
}

/** 房屋详情 (包含房东和设施信息) */
export interface HouseDetail extends House {
  landlord: Landlord;
  facilities: Facility[];
}

/** 报修工单详情 (包含评论列表) */
export interface FacilityReportDetail extends FacilityReport {
  facility: Facility;
  employeeName: string;
  comments: FacilityReportComment[];
}
