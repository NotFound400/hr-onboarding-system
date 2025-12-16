
export { default as authReducer } from './authSlice';
export {
  login,
  register,
  fetchUserProfile,
  logout,
  clearError as clearAuthError,
  restoreAuth,
  selectUser,
  selectToken,
  selectRole,
  selectRoles,
  selectIsHR,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from './authSlice';

export { default as onboardingReducer } from './onboardingSlice';
export {
  submitOnboardingForm,
  initializeOnboardingApplication,
  setCurrentStep,
  nextStep,
  prevStep,
  saveFormData,
  resetOnboarding,
  clearError as clearOnboardingError,
  selectCurrentStep,
  selectFormData,
  selectEmployee,
  selectApplicationId,
  selectOnboardingLoading,
  selectOnboardingError,
  selectSubmitSuccess,
} from './onboardingSlice';

export { default as hrReducer } from './hrSlice';
export {
  fetchAllEmployees,
  fetchAllApplications,
  reviewApplication,
  setSelectedEmployee,
  setSelectedApplication,
  clearError as clearHRError,
  resetHRState,
  selectEmployees,
  selectSelectedEmployee,
  selectApplications,
  selectSelectedApplication,
  selectEmployeesLoading,
  selectApplicationsLoading,
  selectReviewLoading,
  selectHRError,
} from './hrSlice';
