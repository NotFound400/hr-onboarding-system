/**
 * Onboarding Slice
 * 处理员工 Onboarding 流程和表单提交
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Employee, OnboardingFormDTO, CreateEmployeeRequest } from '../../types';
import { createEmployee, getEmployeeByUserId } from '../../services/api';

// ==================== State Interface ====================

interface OnboardingState {
  /** 当前步骤 (0-based index) */
  currentStep: number;
  /** 表单数据 (临时存储) */
  formData: Partial<OnboardingFormDTO> | null;
  /** 提交后的 Employee 信息 (Employee ID 为 string - MongoDB) */
  employee: Employee | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否提交成功 */
  submitSuccess: boolean;
}

// ==================== Initial State ====================

const initialState: OnboardingState = {
  currentStep: 0,
  formData: null,
  employee: null,
  loading: false,
  error: null,
  submitSuccess: false,
};

// ==================== Async Thunks ====================

/**
 * 提交 Onboarding 表单
 * 接收已转换完成的 CreateEmployeeRequest (嵌套结构)
 * 
 * 注意：数据转换逻辑已移至 OnboardingFormPage.handleSubmit
 */
export const submitOnboardingForm = createAsyncThunk<
  Employee,
  CreateEmployeeRequest,
  { rejectValue: string }
>(
  'onboarding/submitForm',
  async (createEmployeeRequest, { rejectWithValue }) => {
    try {
      // 直接调用 API，不再执行数据转换
      const employee = await createEmployee(createEmployeeRequest);
      return employee;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit onboarding form');
    }
  }
);

/**
 * 根据 User ID 获取 Employee 信息
 * 用于检查用户是否已完成 Onboarding
 */
export const fetchEmployeeByUserId = createAsyncThunk<
  Employee,
  number, // userId 参数 (User.id 为 number，传给 API 时转为 string)
  { rejectValue: string }
>(
  'onboarding/fetchEmployeeByUserId',
  async (userId, { rejectWithValue }) => {
    try {
      // User.id 是 number，转换为 string 传给 API (API 内部会转为 MongoDB 查询)
      const employee = await getEmployeeByUserId(String(userId));
      return employee;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch employee');
    }
  }
);

// ==================== Slice ====================

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    /**
     * 设置当前步骤
     */
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    /**
     * 进入下一步
     */
    nextStep: (state) => {
      state.currentStep += 1;
    },
    /**
     * 返回上一步
     */
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    /**
     * 保存表单数据 (用于多步骤表单暂存)
     */
    saveFormData: (state, action: PayloadAction<Partial<OnboardingFormDTO>>) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },
    /**
     * 重置 Onboarding 状态
     */
    resetOnboarding: (state) => {
      state.currentStep = 0;
      state.formData = null;
      state.employee = null;
      state.loading = false;
      state.error = null;
      state.submitSuccess = false;
    },
    /**
     * 清除错误信息
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Submit Onboarding Form =====
    builder
      .addCase(submitOnboardingForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitOnboardingForm.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        state.employee = action.payload;
        state.submitSuccess = true;
        state.error = null;
        // 清空表单数据
        state.formData = null;
      })
      .addCase(submitOnboardingForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit onboarding form';
        state.submitSuccess = false;
      });

    // ===== Fetch Employee By UserId =====
    builder
      .addCase(fetchEmployeeByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeByUserId.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        state.employee = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch employee';
      });
  },
});

// ==================== Selectors ====================

export const selectCurrentStep = (state: { onboarding: OnboardingState }) => state.onboarding.currentStep;
export const selectFormData = (state: { onboarding: OnboardingState }) => state.onboarding.formData;
export const selectEmployee = (state: { onboarding: OnboardingState }) => state.onboarding.employee;
export const selectOnboardingLoading = (state: { onboarding: OnboardingState }) => state.onboarding.loading;
export const selectOnboardingError = (state: { onboarding: OnboardingState }) => state.onboarding.error;
export const selectSubmitSuccess = (state: { onboarding: OnboardingState }) => state.onboarding.submitSuccess;

// ==================== Exports ====================

export const {
  setCurrentStep,
  nextStep,
  prevStep,
  saveFormData,
  resetOnboarding,
  clearError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
