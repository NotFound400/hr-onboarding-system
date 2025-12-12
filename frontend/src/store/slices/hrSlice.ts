/**
 * HR Slice
 * 处理 HR 管理功能：员工列表、申请审批等
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Employee, ApplicationDetail, ApplicationWorkFlow, UpdateApplicationStatusRequest } from '../../types';
import { getAllEmployees } from '../../services/api';
import { getAllApplications, updateApplicationStatus } from '../../services/api';

// ==================== State Interface ====================

interface HRState {
  /** 员工列表 (Employee ID 为 string - MongoDB) */
  employees: Employee[];
  /** 当前选中的员工 */
  selectedEmployee: Employee | null;
  /** 申请列表 (Application ID 为 number - SQL) */
  applications: ApplicationDetail[];
  /** 当前选中的申请 */
  selectedApplication: ApplicationDetail | null;
  /** 员工列表加载状态 */
  employeesLoading: boolean;
  /** 申请列表加载状态 */
  applicationsLoading: boolean;
  /** 审批操作加载状态 */
  reviewLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

// ==================== Initial State ====================

const initialState: HRState = {
  employees: [],
  selectedEmployee: null,
  applications: [],
  selectedApplication: null,
  employeesLoading: false,
  applicationsLoading: false,
  reviewLoading: false,
  error: null,
};

// ==================== Async Thunks ====================

/**
 * 获取所有员工列表
 */
export const fetchAllEmployees = createAsyncThunk<
  Employee[],
  void,
  { rejectValue: string }
>(
  'hr/fetchAllEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const employees = await getAllEmployees();
      return employees;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch employees');
    }
  }
);

/**
 * 获取所有申请列表
 */
export const fetchAllApplications = createAsyncThunk<
  ApplicationDetail[],
  void,
  { rejectValue: string }
>(
  'hr/fetchAllApplications',
  async (_, { rejectWithValue }) => {
    try {
      const applications = await getAllApplications();
      return applications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch applications');
    }
  }
);

/**
 * HR 审批申请 (批准/拒绝)
 */
export const reviewApplication = createAsyncThunk<
  ApplicationWorkFlow,
  UpdateApplicationStatusRequest,
  { rejectValue: string }
>(
  'hr/reviewApplication',
  async (data, { rejectWithValue }) => {
    try {
      const updatedApplication = await updateApplicationStatus(data);
      return updatedApplication;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to review application');
    }
  }
);

// ==================== Slice ====================

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    /**
     * 设置选中的员工
     */
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    /**
     * 设置选中的申请
     */
    setSelectedApplication: (state, action: PayloadAction<ApplicationDetail | null>) => {
      state.selectedApplication = action.payload;
    },
    /**
     * 清除错误信息
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * 重置 HR 状态
     */
    resetHRState: (state) => {
      state.employees = [];
      state.selectedEmployee = null;
      state.applications = [];
      state.selectedApplication = null;
      state.employeesLoading = false;
      state.applicationsLoading = false;
      state.reviewLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All Employees =====
    builder
      .addCase(fetchAllEmployees.pending, (state) => {
        state.employeesLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.employeesLoading = false;
        state.employees = action.payload;
        state.error = null;
      })
      .addCase(fetchAllEmployees.rejected, (state, action) => {
        state.employeesLoading = false;
        state.error = action.payload || 'Failed to fetch employees';
      });

    // ===== Fetch All Applications =====
    builder
      .addCase(fetchAllApplications.pending, (state) => {
        state.applicationsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllApplications.fulfilled, (state, action: PayloadAction<ApplicationDetail[]>) => {
        state.applicationsLoading = false;
        state.applications = action.payload;
        state.error = null;
      })
      .addCase(fetchAllApplications.rejected, (state, action) => {
        state.applicationsLoading = false;
        state.error = action.payload || 'Failed to fetch applications';
      });

    // ===== Review Application =====
    builder
      .addCase(reviewApplication.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })
      .addCase(reviewApplication.fulfilled, (state, action: PayloadAction<ApplicationWorkFlow>) => {
        state.reviewLoading = false;
        // 更新申请列表中对应的申请状态
        const index = state.applications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.applications[index] = {
            ...state.applications[index],
            ...action.payload,
          };
        }
        // 如果当前选中的申请是被更新的申请，同步更新
        if (state.selectedApplication?.id === action.payload.id) {
          state.selectedApplication = {
            ...state.selectedApplication,
            ...action.payload,
          };
        }
        state.error = null;
      })
      .addCase(reviewApplication.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload || 'Failed to review application';
      });
  },
});

// ==================== Selectors ====================

export const selectEmployees = (state: { hr: HRState }) => state.hr.employees;
export const selectSelectedEmployee = (state: { hr: HRState }) => state.hr.selectedEmployee;
export const selectApplications = (state: { hr: HRState }) => state.hr.applications;
export const selectSelectedApplication = (state: { hr: HRState }) => state.hr.selectedApplication;
export const selectEmployeesLoading = (state: { hr: HRState }) => state.hr.employeesLoading;
export const selectApplicationsLoading = (state: { hr: HRState }) => state.hr.applicationsLoading;
export const selectReviewLoading = (state: { hr: HRState }) => state.hr.reviewLoading;
export const selectHRError = (state: { hr: HRState }) => state.hr.error;

// ==================== Exports ====================

export const {
  setSelectedEmployee,
  setSelectedApplication,
  clearError,
  resetHRState,
} = hrSlice.actions;

export default hrSlice.reducer;
