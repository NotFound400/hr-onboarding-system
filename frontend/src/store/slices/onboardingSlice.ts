/**
 * Onboarding Slice
 * 处理员工 Onboarding 流程和表单提交
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';
import type {
  Employee,
  OnboardingFormDTO,
  UpdateEmployeeRequest,
  Application,
} from '../../types';
import { updateEmployee } from '../../services/api';
import { createApplication, submitApplication } from '../../services/api/applicationApi';

// ==================== State Interface ====================

interface OnboardingState {
  /** 当前步骤 (0-based index) */
  currentStep: number;
  /** 表单数据 (临时存储) */
  formData: Partial<OnboardingFormDTO> | null;
  /** 提交后的 Employee 信息 (Employee ID 为 string - MongoDB) */
  employee: Employee | null;
  /** 新建申请 ID */
  applicationId: number | null;
  /** 当前申请状态 (登录或表单流程中获取) */
  applicationStatus: Application['status'] | null;
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
  applicationId: null,
  applicationStatus: null,
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
  { id: string; data: UpdateEmployeeRequest; applicationId: number },
  { rejectValue: string }
>(
  'onboarding/submitForm',
  async ({ id, data, applicationId }, { rejectWithValue }) => {
    try {
      const employee = await updateEmployee(id, data);
      await submitApplication(applicationId);
      return employee;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit onboarding form');
    }
  }
);

export const initializeOnboardingApplication = createAsyncThunk<
  number,
  void,
  { rejectValue: string; state: RootState }
>(
  'onboarding/initializeApplication',
  async (_, { rejectWithValue, getState }) => {
    try {
      const employeeId = getState().auth.employeeId;

      if (!employeeId) {
        return rejectWithValue('Employee ID is missing. Please log in again.');
      }

      const response = await createApplication({
        employeeId,
        applicationType: 'OPT',
        comment: 'OPT Pending 222',
      });
      return response.id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize application');
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
      state.applicationId = null;
      state.applicationStatus = null;
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
    /**
     * 保存从登录流程获取的申请信息
     */
    setApplicationContext: (
      state,
      action: PayloadAction<{ id: number | null; status: Application['status'] | null }>
    ) => {
      state.applicationId = action.payload.id;
      state.applicationStatus = action.payload.status;
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
      })
      .addCase(initializeOnboardingApplication.fulfilled, (state, action) => {
        state.applicationId = action.payload;
      })
      .addCase(initializeOnboardingApplication.rejected, (state, action) => {
        state.error = action.payload || 'Failed to initialize application';
      });

  },
});

// ==================== Selectors ====================

export const selectCurrentStep = (state: { onboarding: OnboardingState }) => state.onboarding.currentStep;
export const selectFormData = (state: { onboarding: OnboardingState }) => state.onboarding.formData;
export const selectEmployee = (state: { onboarding: OnboardingState }) => state.onboarding.employee;
export const selectApplicationId = (state: { onboarding: OnboardingState }) => state.onboarding.applicationId;
export const selectApplicationStatus = (state: { onboarding: OnboardingState }) => state.onboarding.applicationStatus;
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
  setApplicationContext,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
