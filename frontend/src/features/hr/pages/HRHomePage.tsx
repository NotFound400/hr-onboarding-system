import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { PageContainer } from '../../../components/common/PageContainer';

const { Title, Text } = Typography;

/**
 * HR Home Page
 * HR 仪表盘首页 - 展示系统概览和快捷入口
 */
export const HRHomePage: React.FC = () => {
  const navigate = useNavigate();

  // Mock 统计数据
  const stats = {
    totalEmployees: 156,
    pendingOnboarding: 8,
    pendingVisaApplications: 5,
    totalHouses: 12,
    availableRooms: 23,
  };

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>HR Dashboard</Title>
        <Text type="secondary">Welcome to HR Onboarding System</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Total Employees"
              value={stats.totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={() => navigate('/hr/employees')}
            >
              View All Employees →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Pending Onboarding"
              value={stats.pendingOnboarding}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={() => navigate('/hr/hiring')}
            >
              Review Applications →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Pending Visa Applications"
              value={stats.pendingVisaApplications}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={() => navigate('/hr/visa')}
            >
              Manage Visas →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Total Houses"
              value={stats.totalHouses}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={() => navigate('/hr/housing')}
            >
              Manage Housing →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Available Rooms"
              value={stats.availableRooms}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={() => navigate('/hr/housing')}
            >
              View Housing →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="System Status"
              value="Online"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
              All services operational
            </Text>
          </Card>
        </Col>
      </Row>

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

      {/* 最近活动 */}
      <Card title="Recent Activities">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20, marginRight: 12 }} />
            <div>
              <Text strong>Alice Wang</Text>
              <Text type="secondary"> onboarding approved</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>2 hours ago</Text>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
            <ClockCircleOutlined style={{ color: '#faad14', fontSize: 20, marginRight: 12 }} />
            <div>
              <Text strong>Chen Wei</Text>
              <Text type="secondary"> submitted OPT application</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>5 hours ago</Text>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
            <HomeOutlined style={{ color: '#1890ff', fontSize: 20, marginRight: 12 }} />
            <div>
              <Text strong>New house</Text>
              <Text type="secondary"> added at 456 Oak Avenue</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>1 day ago</Text>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20, marginRight: 12 }} />
            <div>
              <Text strong>Maria Garcia</Text>
              <Text type="secondary"> OPT application approved</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>2 days ago</Text>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20, marginRight: 12 }} />
            <div>
              <Text strong>Bob Smith</Text>
              <Text type="secondary"> onboarding rejected - incomplete documentation</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>3 days ago</Text>
            </div>
          </div>
        </Space>
      </Card>
    </PageContainer>
  );
};
