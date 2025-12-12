/**
 * Redux Store Configuration
 * 使用 Redux Toolkit (RTK) 配置全局状态管理
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import onboardingReducer from './slices/onboardingSlice';
import hrReducer from './slices/hrSlice';

/**
 * Redux Store
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    hr: hrReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些 action types 的序列化检查
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

// 导出类型定义
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
