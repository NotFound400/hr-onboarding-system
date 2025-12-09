/**
 * Hiring Page
 * HR 招聘管理页面
 * 
 * Features:
 * - Token 生成器（生成注册 Token）
 * - Onboarding 申请列表（只读）
 */

import { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, Form, message, Tag, Descriptions } from 'antd';
import { UserAddOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '../../../components/common/PageContainer';
import { getAllApplications } from '../../../services/api';
import type { ApplicationDetail, ApplicationStatus } from '../../../types';

/**
 * HiringPage Component
 */
const HiringPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [generatedToken, setGeneratedToken] = useState('');
  const [tokenExpiry, setTokenExpiry] = useState('');
  const [generating, setGenerating] = useState(false);

  // 获取 Onboarding 申请列表
  useEffect(() => {
    fetchOnboardingApplications();
  }, []);

  const fetchOnboardingApplications = async () => {
    try {
      setLoading(true);
      const data = await getAllApplications();
      
      // 过滤出 Onboarding 类型的申请
      const onboardingApps = data.filter(app => app.type === 'Onboarding');
      
      setApplications(onboardingApps);
    } catch (error: any) {
      message.error(error.message || 'Failed to load onboarding applications');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 生成注册 Token
   */
  const handleGenerateToken = async (values: { email: string; name?: string }) => {
    try {
      setGenerating(true);
      
      // Mock: 生成一个随机 Token
      const mockToken = `TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const expiryTime = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 小时后
      
      setGeneratedToken(mockToken);
      setTokenExpiry(expiryTime.toLocaleString());
      
      message.success(`Token generated successfully for ${values.email}`);
      
      // 实际实现应该调用 API
      // await generateRegistrationToken({ email: values.email, name: values.name });
    } catch (error: any) {
      message.error(error.message || 'Failed to generate token');
    } finally {
      setGenerating(false);
    }
  };

  /**
   * 复制 Token 到剪贴板
   */
  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    message.success('Token copied to clipboard');
  };

  /**
   * 获取状态标签颜色
   */
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      case 'Open':
        return 'default';
      default:
        return 'default';
    }
  };

  /**
   * Onboarding 申请列表列定义
   */
  const columns: ColumnsType<ApplicationDetail> = [
    {
      title: 'Employee Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: 'Email',
      dataIndex: 'employeeEmail',
      key: 'employeeEmail',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Open', value: 'Open' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ApplicationStatus) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Create Date',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModificationDate',
      key: 'lastModificationDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.lastModificationDate).getTime() - new Date(b.lastModificationDate).getTime(),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (comment: string) => comment || '-',
    },
  ];

  return (
    <PageContainer title="Hiring Management" loading={loading}>
      {/* Token 生成器 */}
      <Card
        title="Registration Token Generator"
        extra={<UserAddOutlined style={{ fontSize: 20 }} />}
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleGenerateToken}
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email format' },
            ]}
            style={{ width: 300 }}
          >
            <Input placeholder="Enter employee email" size="large" />
          </Form.Item>
          
          <Form.Item
            name="name"
            style={{ width: 200 }}
          >
            <Input placeholder="Name (optional)" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<UserAddOutlined />}
              loading={generating}
              size="large"
            >
              Generate Token
            </Button>
          </Form.Item>
        </Form>

        {/* Token 显示区域 */}
        {generatedToken && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Token">
              <Space>
                <code style={{ 
                  background: '#f5f5f5', 
                  padding: '4px 8px', 
                  borderRadius: 4,
                  fontSize: 12,
                  wordBreak: 'break-all'
                }}>
                  {generatedToken}
                </code>
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={handleCopyToken}
                  size="small"
                >
                  Copy
                </Button>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Valid Until">
              <strong>{tokenExpiry}</strong> <span style={{ color: '#999' }}>(3 hours)</span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {/* Onboarding 申请列表 */}
      <Card
        title="Onboarding Applications"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOnboardingApplications}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} applications`,
          }}
          locale={{
            emptyText: 'No onboarding applications found',
          }}
        />
      </Card>
    </PageContainer>
  );
};

export { HiringPage };
