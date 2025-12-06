/**
 * Redux Store Configuration
 * 使用 Redux Toolkit (RTK) 配置全局状态管理
 */

import { configureStore } from '@reduxjs/toolkit';

// TODO: 在 Phase 3 中添加具体的 slice reducers
// import authReducer from './slices/authSlice';
// import employeeReducer from './slices/employeeSlice';
// import applicationReducer from './slices/applicationSlice';

/**
 * Redux Store
 * 预留空的 reducers，后续添加具体的 slice
 */
export const store = configureStore({
  reducer: {
    // 预留位置 - 待添加具体的 reducers
    // auth: authReducer,
    // employee: employeeReducer,
    // application: applicationReducer,
    // housing: housingReducer,
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
