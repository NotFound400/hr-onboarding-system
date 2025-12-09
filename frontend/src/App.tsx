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

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useAppDispatch } from './store/hooks';
import { restoreAuth } from './store/slices/authSlice';
import AuthGuard from './app/routes/AuthGuard';
import MainLayout from './components/layout/MainLayout';
import { LoginPage, RegistrationPage } from './features/auth';
import { 
  OnboardingFormPage, 
  OnboardingDocsPage, 
  OnboardingSubmitResultPage 
} from './features/onboarding';
import {
  HRHomePage,
  EmployeeProfilePage,
  EmployeeProfileDetailPage,
  VisaManagementPage,
  HiringPage,
  HouseManagementPage,
} from './features/hr';
import { EmployeeHomePage, PersonalInfoPage, VisaStatusPage, HousingPage } from './features/employee';
import './App.css';

/**
 * 临时占位页面组件
 */
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: 24, textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

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
      <BrowserRouter>
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* Employee 路由 */}
          <Route
            path="/employee"
            element={
              <AuthGuard allowedRoles={['Employee']}>
                <MainLayout />
              </AuthGuard>
            }
          >
            <Route path="home" element={<EmployeeHomePage />} />
            <Route path="personal-info" element={<PersonalInfoPage />} />
            <Route path="visa" element={<VisaStatusPage />} />
            <Route path="housing" element={<HousingPage />} />
            <Route path="facility-report" element={<PlaceholderPage title="Facility Report" />} />
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
            <Route path="visa" element={<VisaManagementPage />} />
            <Route path="hiring" element={<HiringPage />} />
            <Route path="housing" element={<HouseManagementPage />} />
            <Route index element={<Navigate to="home" replace />} />
          </Route>

          {/* Onboarding 路由 (需要 Employee 登录) */}
          <Route
            path="/onboarding"
            element={
              <AuthGuard allowedRoles={['Employee']}>
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
            <Route path="docs" element={<OnboardingDocsPage />} />
            <Route path="submit-result" element={<OnboardingSubmitResultPage />} />
          </Route>

          {/* 默认重定向到登录页 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
