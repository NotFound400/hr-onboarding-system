/**
 * Login Page
 * 用户登录页面，支持根据角色和 onboarding 状态进行智能跳转
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { login, selectIsAuthenticated, selectAuthLoading, selectUser } from '../../../store/slices/authSlice';
import { getApplicationsByEmployeeId, getEmployeeByUserId } from '../../../services/api';
import type { LoginRequest } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';
import { setApplicationContext } from '../../../store/slices/onboardingSlice';

const { Title, Text } = Typography;

/**
 * LoginPage Component
 * 
 * 跳转逻辑 (按 frontend_requirement.md 4.1 定义):
 * - HR → /hr/home
 * - Employee (Unapproved / No Application) → /onboarding/form
 * - Employee (Approved) → /employee/home
 */
const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const messageApi = useAntdMessage();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const user = useAppSelector(selectUser);

  // 登录成功后根据角色和 onboarding 状态跳转
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated || !user) return;

      const redirect = searchParams.get('redirect');
      
      // 如果有 redirect 参数，优先跳转
      if (redirect) {
        navigate(redirect, { replace: true });
        return;
      }

      const role = localStorage.getItem('role');
      
      // HR 用户直接跳转
      if (role === 'HR') {
        navigate('/hr/home', { replace: true });
        return;
      }

      // Employee 用户需要检查 onboarding 状态
      if (role === 'Employee') {
        try {
          setCheckingOnboarding(true);
          
          // 1. 先通过 User.id 获取 Employee 记录（获取 MongoDB ObjectId）
          console.log('[Login] User ID:', user.id);
          const employee = await getEmployeeByUserId(String(user.id));
          console.log('[Login] Employee ID:', employee.id);

          if (!employee.id) {
            // 没有 Employee 记录，跳转到 Onboarding 表单
            navigate('/onboarding/form', { replace: true });
            return;
          }
          
          // 2. 通过 Employee.id 查询 Application
          const applications = await getApplicationsByEmployeeId(employee.id);

          if (!applications || applications.length === 0) {
            dispatch(setApplicationContext({ id: null, status: null }));
            navigate('/onboarding/form', { replace: true });
            return;
          }

          const latestApplication = applications[0];
          dispatch(
            setApplicationContext({
              id: latestApplication.id,
              status: latestApplication.status,
            })
          );

          switch (latestApplication.status) {
            case 'Approved':
              navigate('/employee/personal-info', { replace: true });
              break;
            case 'Rejected':
              navigate('/onboarding/rejected', { replace: true });
              break;
            case 'Pending':
              navigate('/onboarding/submit-result', { replace: true });
              break;
            default:
              // Includes "Open" and other pending-like states
              navigate('/onboarding/form', { replace: true });
          }
        } catch (error) {
          // 查询失败或没有 Employee 记录，静默跳转到 Onboarding 表单
          dispatch(setApplicationContext({ id: null, status: null }));
          navigate('/onboarding/form', { replace: true });
        } finally {
          setCheckingOnboarding(false);
        }
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user, navigate, searchParams]);

  /**
   * 处理登录表单提交
   */
  const handleLogin = async (values: LoginRequest) => {
    try {
      const resultAction = await dispatch(login(values));
      
      if (login.fulfilled.match(resultAction)) {
        console.log('[Login] JWT Token:', resultAction.payload.token);
        messageApi.success('Login successful');
        // 跳转逻辑由 useEffect 处理
      } else if (login.rejected.match(resultAction)) {
        messageApi.error(resultAction.payload || 'Login failed');
      }
    } catch (error) {
      messageApi.error('An unexpected error occurred');
    }
  };

  // 显示加载状态（检查 onboarding 状态时）
  if (checkingOnboarding) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Text>Checking onboarding status...</Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: 8,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            HR Onboarding System
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="usernameOrEmail"
            rules={[
              { required: true, message: 'Please input your username or email!' },
              { min: 3, message: 'Must be at least 3 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username or Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 3, message: 'Password must be at least 3 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Don't have an account? Contact HR to get started.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
