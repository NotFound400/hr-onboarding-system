
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginRequest, RegisterRequest, LoginResponse, RoleType } from '../../types';
import { login as loginApi, register as registerApi, logout as logoutApi, getUserProfile } from '../../services/api';

const parseStoredRoles = (): RoleType[] => {
  try {
    const raw = localStorage.getItem('roles');
    return raw ? (JSON.parse(raw) as RoleType[]) : [];
  } catch {
    return [];
  }
};

const derivePrimaryRole = (roles: RoleType[], fallback: RoleType | null): RoleType | null => {
  if (roles.includes('HR')) {
    return 'HR';
  }
  return fallback;
};


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
  /** 当前用户关联房屋 ID */
  houseId: number | null;
  /** 当前用户关联员工 ID */
  employeeId: string | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}


const initialRoles = parseStoredRoles();
const storedRole = (localStorage.getItem('role') as RoleType | null) ?? null;

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  tokenType: localStorage.getItem('tokenType') || null,
  tokenExpiresAt: localStorage.getItem('tokenExpiresAt') || null,
  role: derivePrimaryRole(initialRoles, storedRole),
  roles: initialRoles,
  houseId: localStorage.getItem('houseId')
    ? Number(localStorage.getItem('houseId'))
    : null,
  employeeId: localStorage.getItem('employeeId') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};


export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      const normalizedRole: RoleType =
        response.roles.includes('HR') ? 'HR' : response.role;
      const updatedResponse: LoginResponse = {
        ...response,
        role: normalizedRole,
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('tokenType', response.tokenType);
      localStorage.setItem('tokenExpiresAt', response.expiresAt);
      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('roles', JSON.stringify(response.roles));
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.houseId !== null && response.houseId !== undefined) {
        localStorage.setItem('houseId', String(response.houseId));
      } else {
        localStorage.removeItem('houseId');
      }
      if (response.employeeId) {
        localStorage.setItem('employeeId', response.employeeId);
      } else {
        localStorage.removeItem('employeeId');
      }
      return updatedResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

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

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('roles');
      localStorage.removeItem('houseId');
      localStorage.removeItem('employeeId');
      localStorage.removeItem('user');
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('roles');
      localStorage.removeItem('houseId');
      localStorage.removeItem('employeeId');
      localStorage.removeItem('user');
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    restoreAuth: (state) => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role') as RoleType | null;
      if (token && role) {
        state.token = token;
        const storedRoles = parseStoredRoles();
        state.role = derivePrimaryRole(storedRoles, role);
        state.tokenType = localStorage.getItem('tokenType');
        state.tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
        state.roles = storedRoles;
        const storedHouseId = localStorage.getItem('houseId');
        state.houseId = storedHouseId ? Number(storedHouseId) : null;
        state.employeeId = localStorage.getItem('employeeId');
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            state.user = JSON.parse(storedUser);
          } catch {
            state.user = null;
          }
        }
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
        state.houseId = action.payload.houseId ?? null;
        state.employeeId = action.payload.employeeId ?? null;
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
        localStorage.setItem('user', JSON.stringify(action.payload));
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
        state.houseId = null;
        state.employeeId = null;
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('roles');
        localStorage.removeItem('houseId');
        localStorage.removeItem('employeeId');
        localStorage.removeItem('user');
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
        state.houseId = null;
        state.employeeId = null;
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
        state.houseId = null;
        state.employeeId = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Logout failed';
      });
  },
});


export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectRole = (state: { auth: AuthState }) => state.auth.role;
export const selectRoles = (state: { auth: AuthState }) => state.auth.roles;
export const selectIsHR = (state: { auth: AuthState }) => state.auth.roles.includes('HR');
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;


export const { clearError, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
