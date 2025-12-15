/**
 * App Component
 * 主应用入口，配置路由结构
 * 
 * 路由结构 (按 frontend_requirement.md Section 5 定义):
 * - /login - 登录页
 * - /register - 注册页 (Token 验证)
 * - /employee/* - 员工端路由 (需要 Employee 权限)
 * - /hr/* - HR 端路由 (需要 HR 权限)
 * - /onboarding/* - Onboarding 流程路由
 */

import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { useAppDispatch } from './store/hooks';
import { restoreAuth } from './store/slices/authSlice';
import AuthGuard from './app/routes/AuthGuard';
import MainLayout from './components/layout/MainLayout';
import { LoginPage, RegistrationPage } from './features/auth';
import {
  OnboardingFormPage,
  OnboardingSubmitResultPage,
  OnboardingRejectedPage,
} from './features/onboarding';
import {
  HRHomePage,
  EmployeeProfilePage,
  EmployeeProfileDetailPage,
  HRVisaManagementPage,
  HiringPage,
  HouseManagementPage,
  ApplicationReviewDetailPage,
  HouseDetailManagementPage,
  ApplicationReviewSummaryPage,
} from './features/hr';
import { 
  EmployeeHomePage, 
  PersonalInfoPage, 
  VisaStatusPage, 
  HousingPage,
  FacilityReportPage,
} from './features/employee';
import './App.css';
import { setGlobalMessageApi } from './utils/messageApi';

function App() {
  const dispatch = useAppDispatch();

  // 从 localStorage 恢复认证状态
  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
        <AntdMessageBridge>
          <BrowserRouter>
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* Employee 路由 (HR 也可访问) */}
          <Route
            path="/employee"
            element={
              <AuthGuard allowedRoles={['Employee', 'HR']}>
                <MainLayout />
              </AuthGuard>
            }
          >
            <Route path="home" element={<EmployeeHomePage />} />
            <Route path="personal-info" element={<PersonalInfoPage />} />
            <Route path="visa" element={<VisaStatusPage />} />
            <Route path="housing" element={<HousingPage />} />
            <Route path="facility-report" element={<FacilityReportPage />} />
            <Route index element={<Navigate to="home" replace />} />
          </Route>

          {/* HR 路由 */}
          <Route
            path="/hr"
            element={
              <AuthGuard allowedRoles={['HR']}>
                <MainLayout />
              </AuthGuard>
            }
          >
            <Route path="home" element={<HRHomePage />} />
            <Route path="employees" element={<EmployeeProfilePage />} />
            <Route path="employees/:id" element={<EmployeeProfileDetailPage />} />
            <Route path="visa" element={<HRVisaManagementPage />} />
            <Route path="hiring" element={<HiringPage />} />
            {/* HR Section 5.b: Application Review Detail */}
            <Route path="applications/:employeeId/:applicationId" element={<ApplicationReviewSummaryPage />} />
            <Route path="housing" element={<HouseManagementPage />} />
            {/* HR Section 6.c: House Detail Management */}
            <Route path="houses/:id" element={<HouseDetailManagementPage />} />
            <Route index element={<Navigate to="home" replace />} />
          </Route>

          {/* Onboarding 路由 (HR 也可访问) */}
          <Route
            path="/onboarding"
            element={
              <AuthGuard allowedRoles={['Employee', 'HR']}>
                <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
                  {/* 使用 Outlet 渲染子路由 */}
                  <Outlet />
                </div>
              </AuthGuard>
            }
          >
            {/* 修复：访问 /onboarding 自动重定向到 /onboarding/form */}
            <Route index element={<Navigate to="form" replace />} />
            <Route path="form" element={<OnboardingFormPage />} />
            <Route path="submit-result" element={<OnboardingSubmitResultPage />} />
            {/* Section 3.e.iii: Show rejection feedback */}
            <Route path="rejected" element={<OnboardingRejectedPage />} />
          </Route>

          {/* 默认重定向到登录页 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
          </BrowserRouter>
        </AntdMessageBridge>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;

const AntdMessageBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setGlobalMessageApi(message);
  }, [message]);

  return <>{children}</>;
};
