
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


const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    saveFormData: (state, action: PayloadAction<Partial<OnboardingFormDTO>>) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },
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
    clearError: (state) => {
      state.error = null;
    },
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


export const selectCurrentStep = (state: { onboarding: OnboardingState }) => state.onboarding.currentStep;
export const selectFormData = (state: { onboarding: OnboardingState }) => state.onboarding.formData;
export const selectEmployee = (state: { onboarding: OnboardingState }) => state.onboarding.employee;
export const selectApplicationId = (state: { onboarding: OnboardingState }) => state.onboarding.applicationId;
export const selectExistingApplicationInfo = (state: { onboarding: OnboardingState }) => ({
  id: state.onboarding.applicationId,
  status: state.onboarding.applicationStatus,
});
export const selectOnboardingLoading = (state: { onboarding: OnboardingState }) => state.onboarding.loading;
export const selectOnboardingError = (state: { onboarding: OnboardingState }) => state.onboarding.error;
export const selectSubmitSuccess = (state: { onboarding: OnboardingState }) => state.onboarding.submitSuccess;


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
