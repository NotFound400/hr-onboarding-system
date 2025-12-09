import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { validateToken, registerUser } from '../../../services/api';
import type { RegisterRequest } from '../../../types';

/**
 * 注册页面
 * 入口: /register?token=...
 * 
 * 流程:
 * 1. 从 URL 获取 token 参数
 * 2. 调用 validateToken 验证 token 有效性
 * 3. 验证通过后显示 Email，让用户输入密码
 * 4. 提交注册信息
 * 5. 成功后跳转到登录页
 */
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

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setErrorMessage('Registration token is missing. Please check your email link.');
      setLoading(false);
      return;
    }

    validateRegistrationToken(token);
  }, [token]);

  /**
   * 验证 Token
   */
  const validateRegistrationToken = async (tokenValue: string) => {
    try {
      setValidating(true);
      const result = await validateToken(tokenValue);

      if (result.valid) {
        setTokenValid(true);
        setEmail(result.email);
        setErrorMessage('');
      } else {
        setTokenValid(false);
        setErrorMessage(result.message || 'Token is invalid or expired. Please request a new registration link.');
      }
    } catch (error: any) {
      setTokenValid(false);
      setErrorMessage(error.message || 'Failed to validate token. Please try again.');
      console.error('Token validation error:', error);
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  /**
   * 提交注册表单
   */
  const handleSubmit = async (values: any) => {
    if (!token) {
      message.error('Token is missing');
      return;
    }

    try {
      setSubmitting(true);

      const request: RegisterRequest = {
        token,
        username: email.split('@')[0], // 使用 email 前缀作为 username
        email,
        password: values.password,
      };

      await registerUser(request);
      
      message.success('Registration successful! Redirecting to login page...');
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: email } });
      }, 1500);
    } catch (error: any) {
      message.error(error.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 渲染加载状态
   */
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

  /**
   * 渲染错误状态
   */
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

  /**
   * 渲染注册表单
   */
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* Email (只读) */}
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

          {/* 密码 */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="Enter your password"
            />
          </Form.Item>

          {/* 确认密码 */}
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

          {/* 提交按钮 */}
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
