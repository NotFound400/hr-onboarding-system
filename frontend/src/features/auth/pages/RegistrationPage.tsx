import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { validateToken, registerUser } from '../../../services/api';
import { useAntdMessage } from '../../../hooks/useAntdMessage';
import type {
  RegisterRequest,
  RegistrationTokenValidationResponse,
  RegistrationTokenHouseContext,
} from '../../../types';

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [assignedHouseId, setAssignedHouseId] = useState<number | null>(null);
  const [assignedHouseAddress, setAssignedHouseAddress] = useState<string | null>(null);
  const [houseContext, setHouseContext] = useState<RegistrationTokenHouseContext | null>(null);
  const messageApi = useAntdMessage();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setErrorMessage('Registration token is missing. Please check your email link.');
      setLoading(false);
      return;
    }

    validateRegistrationToken(token);
  }, [token]);

  const validateRegistrationToken = async (tokenValue: string) => {
    try {
      setValidating(true);
      const tokenInfo: RegistrationTokenValidationResponse = await validateToken(tokenValue);

      if (tokenInfo?.email) {
        setTokenValid(true);
        setEmail(tokenInfo.email);
        setErrorMessage('');
        const houseId = tokenInfo.houseId ?? tokenInfo.houseContext?.id ?? null;
        setAssignedHouseId(houseId);
        setHouseContext(tokenInfo.houseContext ?? null);
        setAssignedHouseAddress(tokenInfo.houseContext?.address ?? tokenInfo.houseAddress ?? null);
      } else {
        setTokenValid(false);
        setErrorMessage('Token is invalid or expired. Please request a new registration link.');
      }
    } catch (error: any) {
      setTokenValid(false);
      setAssignedHouseId(null);
      setHouseContext(null);
      setErrorMessage(error.message || 'Failed to validate token. Please try again.');
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!token) {
      messageApi.error('Token is missing');
      return;
    }

    try {
      setSubmitting(true);

      const request: RegisterRequest = {
        token,
        username: values.username, // Use user-provided username (Section 1 requirement)
        email,
        password: values.password,
      };

      await registerUser(request);
      
      messageApi.success('Registration successful! Redirecting to login page...');

      ['token', 'tokenType', 'tokenExpiresAt', 'role', 'roles', 'houseId', 'employeeId', 'user'].forEach((key) =>
        localStorage.removeItem(key)
      );
      
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: email } });
      }, 1500);
    } catch (error: any) {
      messageApi.error(error.message || 'Registration failed. Please try again.');
      setTokenValid(false);
      setAssignedHouseId(null);
      setAssignedHouseAddress(null);
      setHouseContext(null);
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || validating) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Card style={{ width: 450, textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#666' }}>Validating your registration token...</p>
        </Card>
      </div>
    );
  }

  if (!tokenValid || errorMessage) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Card style={{ width: 450 }}>
          <Alert
            message="Registration Token Invalid"
            description={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Button type="primary" block onClick={() => navigate('/login')}>
            Go to Login Page
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{ width: 450 }}
        title={
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <h2 style={{ margin: 0 }}>Create Your Account</h2>
          </div>
        }
      >
        <Alert
          message="Token Validated Successfully"
          description={`Please set your password for: ${email}`}
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
        {assignedHouseId !== null && (
          <Alert
            message="Housing Assignment"
            description={
              assignedHouseAddress
                ? `You have been assigned to ${assignedHouseAddress}.`
                : 'Your housing assignment has been recorded. HR will share the address with you shortly.'
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            initialValue={email}
          >
            <Input
              prefix={<UserOutlined />}
              size="large"
              disabled
              value={email}
            />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please enter your username' },
              { min: 3, message: 'Username must be at least 3 characters' },
              { 
                pattern: /^[a-zA-Z0-9_-]+$/, 
                message: 'Username can only contain letters, numbers, hyphens and underscores' 
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              size="large"
              placeholder="Enter your unique username"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 3, message: 'Password must be at least 3 characters' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="Confirm your password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting}
            >
              Complete Registration
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span style={{ color: '#666' }}>Already have an account? </span>
          <Button type="link" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </Card>
    </div>
  );
};
