/**
 * Enum Definitions
 * 所有状态字段的枚举定义
 */

/** 用户角色类型 */
export const RoleType = {
  HR: 'HR',
  EMPLOYEE: 'Employee'
} as const;
export type RoleType = typeof RoleType[keyof typeof RoleType];

/** 应用申请状态 */
export const ApplicationStatus = {
  OPEN: 'Open',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const;
export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

/** 应用申请类型 */
export const ApplicationType = {
  ONBOARDING: 'Onboarding',
  OPT: 'OPT'
} as const;
export type ApplicationType = typeof ApplicationType[keyof typeof ApplicationType];

/** 签证类型 */
export const VisaStatusType = {
  OPT: 'OPT',
  H1B: 'H1B',
  L2: 'L2',
  F1: 'F1',
  H4: 'H4',
  OTHER: 'Other'
} as const;
export type VisaStatusType = typeof VisaStatusType[keyof typeof VisaStatusType];

/** 联系人类型 */
export const ContactType = {
  REFERENCE: 'Reference',
  EMERGENCY: 'Emergency'
} as const;
export type ContactType = typeof ContactType[keyof typeof ContactType];

/** 地址类型 */
export const AddressType = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary'
} as const;
export type AddressType = typeof AddressType[keyof typeof AddressType];

/** 设施报修状态 */
export const FacilityReportStatus = {
  OPEN: 'Open',
  IN_PROGRESS: 'InProgress',
  CLOSED: 'Closed'
} as const;
export type FacilityReportStatus = typeof FacilityReportStatus[keyof typeof FacilityReportStatus];

/** 性别 */
export const Gender = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other'
} as const;
export type Gender = typeof Gender[keyof typeof Gender];
