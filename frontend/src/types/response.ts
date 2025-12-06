/**
 * Standard Response Wrapper
 * 本项目后端采用业务状态与 HTTP 状态分离的模式
 * 所有 API 响应必须包裹在此接口中
 */
export interface ApiResponse<T> {
  /** true: 业务成功; false: 业务失败 (校验不通过等) */
  success: boolean;
  /** 后端返回的提示信息 (用于 Toast 展示) */
  message: string;
  /** 实际业务数据 Payload */
  data: T | null;
}
