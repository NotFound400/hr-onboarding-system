/**
 * Mock Utilities
 * Mock 模式工具函数
 */

/**
 * 检查是否启用 Mock 模式
 * @returns boolean
 */
export const isMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCK === 'true';
};

/**
 * 模拟网络延迟
 * @param ms 延迟毫秒数，默认 500ms
 * @returns Promise<void>
 */
export const delay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 在 Mock 模式下模拟拦截器行为
 * 检查 Mock 数据的 success 字段，如果为 false 则抛出错误
 * @param mockResponse Mock 响应数据 (包含 ApiResponse 结构)
 * @returns T (Payload)
 */
export const simulateInterceptor = <T>(mockResponse: {
  success: boolean;
  message: string;
  data: T | null;
}): T => {
  if (!mockResponse.success) {
    throw new Error(mockResponse.message || '操作失败');
  }
  
  if (mockResponse.data === null) {
    throw new Error('响应数据为空');
  }
  
  return mockResponse.data;
};

/**
 * Mock 模式包装器
 * 统一处理 Mock 模式下的延迟和数据返回
 * @param mockData Mock 数据
 * @param delayMs 延迟毫秒数
 * @returns Promise<T>
 */
export const mockWrapper = async <T>(
  mockData: T,
  delayMs: number = 500
): Promise<T> => {
  await delay(delayMs);
  return mockData;
};
