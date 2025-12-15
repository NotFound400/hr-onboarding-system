/**
 * HR Slice
 * 处理 HR 管理功能：员工列表、申请审批等
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Employee, Application, ApproveApplicationRequest, RejectApplicationRequest } from '../../types';
import { getAllEmployees } from '../../services/api';
import { getOngoingApplications, approveApplication, rejectApplication } from '../../services/api';

// ==================== State Interface ====================

interface HRState {
  /** 员工列表 (Employee ID 为 string - MongoDB) */
  employees: Employee[];
  /** 当前选中的员工 */
  selectedEmployee: Employee | null;
  /** 申请列表 (Application ID 为 number - SQL) */
  applications: Application[];
  /** 当前选中的申请 */
  selectedApplication: Application | null;
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
  Application[],
  void,
  { rejectValue: string }
>(
  'hr/fetchAllApplications',
  async (_, { rejectWithValue }) => {
    try {
      const applications = await getOngoingApplications();
      return applications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch applications');
    }
  }
);

/**
 * HR 批准申请
 */
export const approveApplicationThunk = createAsyncThunk<
  { status: string; comment: string },
  { applicationId: number; data: ApproveApplicationRequest },
  { rejectValue: string }
>(
  'hr/approveApplication',
  async ({ applicationId, data }, { rejectWithValue }) => {
    try {
      const result = await approveApplication(applicationId, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve application');
    }
  }
);

/**
 * HR 拒绝申请
 */
export const rejectApplicationThunk = createAsyncThunk<
  { status: string; comment: string },
  { applicationId: number; data: RejectApplicationRequest },
  { rejectValue: string }
>(
  'hr/rejectApplication',
  async ({ applicationId, data }, { rejectWithValue }) => {
    try {
      const result = await rejectApplication(applicationId, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject application');
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
    setSelectedApplication: (state, action: PayloadAction<Application | null>) => {
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
      .addCase(fetchAllApplications.fulfilled, (state, action: PayloadAction<Application[]>) => {
        state.applicationsLoading = false;
        state.applications = action.payload;
        state.error = null;
      })
      .addCase(fetchAllApplications.rejected, (state, action) => {
        state.applicationsLoading = false;
        state.error = action.payload || 'Failed to fetch applications';
      });

    // ===== Approve Application =====
    builder
      .addCase(approveApplicationThunk.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })
      .addCase(approveApplicationThunk.fulfilled, (state) => {
        state.reviewLoading = false;
        state.error = null;
      })
      .addCase(approveApplicationThunk.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload || 'Failed to approve application';
      });

    // ===== Reject Application =====
    builder
      .addCase(rejectApplicationThunk.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })
      .addCase(rejectApplicationThunk.fulfilled, (state) => {
        state.reviewLoading = false;
        state.error = null;
      })
      .addCase(rejectApplicationThunk.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload || 'Failed to reject application';
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
