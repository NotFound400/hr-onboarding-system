import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Table, Tag, message } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '../../../components/common/PageContainer';
import { getOngoingApplications } from '../../../services/api';
import type { Application, ApplicationStatus } from '../../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * HR Home Page - Section HR.2
 * 必须包含: Application Tracking Table (HR Section 2.a.ii)
 */
export const HRHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  /**
   * Section HR.2.a.ii - Application Tracking Table
   * "if any action needs to be taken to update an employee's visa status or onboarding process"
   */
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getOngoingApplications();
      // Filter for pending applications only (需要 HR action 的)
      const pendingApps = data.filter(app => app.status === 'Pending' || app.status === 'Open');
      setApplications(pendingApps);
    } catch (error: any) {
      message.error(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>HR Dashboard</Title>
        <Text type="secondary">Welcome to HR Onboarding System</Text>
      </div>

      {/* 快捷操作 */}
      <Card title="Quick Actions" style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => navigate('/hr/hiring')}
          >
            Generate Registration Token
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate('/hr/hiring')}
          >
            View Onboarding Applications
          </Button>
          <Button
            icon={<SafetyCertificateOutlined />}
            onClick={() => navigate('/hr/visa')}
          >
            Review Visa Applications
          </Button>
          <Button
            icon={<TeamOutlined />}
            onClick={() => navigate('/hr/employees')}
          >
            Search Employees
          </Button>
          <Button
            icon={<HomeOutlined />}
            onClick={() => navigate('/hr/housing')}
          >
            Add New House
          </Button>
        </Space>
      </Card>

      {/* Section HR.2.a.ii - Application Tracking Table (必需功能) */}
      <Card title="Application Tracking" style={{ marginBottom: 24 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          This table shows all applications that require HR action (Onboarding, Visa Status updates)
        </Text>
        <Table
          columns={[
            {
              title: 'Name (Legal Full Name)',
              dataIndex: 'employeeName',
              key: 'employeeName',
              render: (name: string) => <Text strong>{name}</Text>,
            },
            {
              title: 'Type of Application',
              dataIndex: 'applicationType',
              key: 'applicationType',
              filters: [
                { text: 'Onboarding', value: 'Onboarding' },
                { text: 'OPT', value: 'OPT' },
              ],
              onFilter: (value, record) => record.applicationType === value,
              render: (applicationType: string) => (
                <Tag color={applicationType === 'Onboarding' ? 'blue' : 'green'}>
                  {applicationType}
                </Tag>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status: ApplicationStatus) => {
                const colorMap: Record<ApplicationStatus, string> = {
                  Open: 'default',
                  Pending: 'warning',
                  Approved: 'success',
                  Rejected: 'error',
                };
                return <Tag color={colorMap[status]}>{status}</Tag>;
              },
            },
            {
              title: 'Last Modification Date',
              dataIndex: 'lastModificationDate',
              key: 'lastModificationDate',
              render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
              sorter: (a, b) => dayjs(a.lastModificationDate).unix() - dayjs(b.lastModificationDate).unix(),
            },
            {
              title: 'Action',
              key: 'action',
              render: (_, record) => (
                <Button
                  type="link"
                  onClick={() => {
                    if (record.applicationType === 'Onboarding') {
                      navigate('/hr/hiring');
                    } else if (record.applicationType === 'OPT') {
                      navigate('/hr/visa');
                    }
                  }}
                >
                  Review →
                </Button>
              ),
            },
          ]}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} pending applications`,
          }}
          locale={{
            emptyText: 'No pending applications requiring action',
          }}
        />
      </Card>
    </PageContainer>
  );
};
