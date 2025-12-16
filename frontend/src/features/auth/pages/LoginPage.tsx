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

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const messageApi = useAntdMessage();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated || !user || !justLoggedIn) return;

      const redirect = searchParams.get('redirect');
      
      if (redirect) {
        navigate(redirect, { replace: true });
        return;
      }

      const role = localStorage.getItem('role');
      
      if (role === 'HR') {
        navigate('/hr/home', { replace: true });
        return;
      }

      if (role === 'Employee') {
        try {
          setCheckingOnboarding(true);
          
          const employee = await getEmployeeByUserId(String(user.id));

          if (!employee.id) {
            navigate('/onboarding/form', { replace: true });
            return;
          }
          
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
              navigate('/onboarding/form', { replace: true });
          }
        } catch (error) {
          dispatch(setApplicationContext({ id: null, status: null }));
          navigate('/onboarding/form', { replace: true });
        } finally {
          setCheckingOnboarding(false);
        }
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user, navigate, searchParams, justLoggedIn, dispatch, messageApi]);

  const handleLogin = async (values: LoginRequest) => {
    try {
      const resultAction = await dispatch(login(values));
      
      if (login.fulfilled.match(resultAction)) {
        messageApi.success('Login successful');
        setJustLoggedIn(true);
      } else if (login.rejected.match(resultAction)) {
        messageApi.error(resultAction.payload || 'Login failed');
      }
    } catch (error) {
      messageApi.error('An unexpected error occurred');
    }
  };

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
