/**
 * Auth Slice
 * 处理用户认证状态管理
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginRequest, RegisterRequest, LoginResponse, RoleType } from '../../types';
import { login as loginApi, register as registerApi, logout as logoutApi, getUserProfile } from '../../services/api';

// ==================== State Interface ====================

interface AuthState {
  /** 当前登录用户信息 (User ID 为 number) */
  user: User | null;
  /** JWT Token */
  token: string | null;
  /** Token 类型 (默认为 Bearer) */
  tokenType: string | null;
  /** Token 过期时间 (ISO 字符串) */
  tokenExpiresAt: string | null;
  /** 用户角色 */
  role: RoleType | null;
  /** 角色列表 (兼容多角色返回) */
  roles: RoleType[];
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

// ==================== Initial State ====================

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  tokenType: localStorage.getItem('tokenType') || null,
  tokenExpiresAt: localStorage.getItem('tokenExpiresAt') || null,
  role: (localStorage.getItem('role') as RoleType | null) ?? null,
  roles: JSON.parse(localStorage.getItem('roles') || '[]') as RoleType[],
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// ==================== Async Thunks ====================

/**
 * 用户登录
 */
export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      // 持久化 token 和 role
      localStorage.setItem('token', response.token);
      localStorage.setItem('tokenType', response.tokenType);
      localStorage.setItem('tokenExpiresAt', response.expiresAt);
      localStorage.setItem('role', response.role);
      localStorage.setItem('roles', JSON.stringify(response.roles));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * 用户注册
 */
export const register = createAsyncThunk<
  User,
  RegisterRequest,
  { rejectValue: string }
>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const user = await registerApi(data);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

/**
 * 获取当前用户信息
 */
export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await getUserProfile();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

/**
 * 用户登出
 */
export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('roles');
    } catch (error: any) {
      // 即使 API 调用失败，也要清除本地状态
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('roles');
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// ==================== Slice ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * 清除错误信息
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * 手动设置认证状态 (用于页面刷新时从 localStorage 恢复)
     */
    restoreAuth: (state) => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role') as RoleType | null;
      if (token && role) {
        state.token = token;
        state.role = role;
        state.tokenType = localStorage.getItem('tokenType');
        state.tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
        const storedRoles = localStorage.getItem('roles');
        state.roles = storedRoles ? (JSON.parse(storedRoles) as RoleType[]) : [];
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    // ===== Login =====
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.tokenType = action.payload.tokenType;
        state.tokenExpiresAt = action.payload.expiresAt;
        state.roles = action.payload.roles;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      });

    // ===== Register =====
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // 注册成功后不自动登录，由用户跳转到登录页
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      });

    // ===== Fetch User Profile =====
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user profile';
        // 如果获取用户信息失败，可能 token 已过期
        state.isAuthenticated = false;
        state.token = null;
        state.role = null;
        state.tokenType = null;
        state.tokenExpiresAt = null;
        state.roles = [];
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('roles');
      });

    // ===== Logout =====
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.role = null;
        state.tokenType = null;
        state.tokenExpiresAt = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        // 即使登出失败，也清除本地状态
        state.user = null;
        state.token = null;
        state.role = null;
        state.tokenType = null;
        state.tokenExpiresAt = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = action.payload || 'Logout failed';
      });
  },
});

// ==================== Selectors ====================

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectRole = (state: { auth: AuthState }) => state.auth.role;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// ==================== Exports ====================

export const { clearError, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
