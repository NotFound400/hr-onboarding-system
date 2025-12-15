/**
 * Employee Home Page
 * 员工端主页 - 欢迎页面和快捷入口
 * 
 * Features:
 * - 显示 "Welcome, [Name]"
 * - 快捷链接卡片
 * - 个人信息摘要
 */

import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Avatar, Button } from 'antd';
import { 
  UserOutlined, 
  SafetyOutlined, 
  HomeOutlined, 
  FileTextOutlined,
  RightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../../components/common/PageContainer';
import { getEmployeeById, getEmployeeByUserId } from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type { Employee } from '../../../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

/**
 * EmployeeHomePage Component
 */
const EmployeeHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);

  // 获取当前登录用户
  const currentUser = useAppSelector(selectUser);

  useEffect(() => {
    fetchEmployeeInfo();
  }, []);

  const fetchEmployeeInfo = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      // 先通过 User ID 获取 Employee 记录
      const empData = await getEmployeeByUserId(String(currentUser.id));
      const data = await getEmployeeById(empData.id);
      setEmployee(data);
    } catch (error) {
      console.error('Failed to load employee info:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 快捷链接配置
   */
  const quickLinks = [
    {
      title: 'Personal Information',
      description: 'View and update your personal details',
      icon: <UserOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
      path: '/employee/personal-info',
    },
    {
      title: 'Visa Status',
      description: 'Check your visa status and upload documents',
      icon: <SafetyOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
      path: '/employee/visa',
    },
    {
      title: 'Housing',
      description: 'View your housing details and roommates',
      icon: <HomeOutlined style={{ fontSize: 40, color: '#faad14' }} />,
      path: '/employee/housing',
    },
    {
      title: 'Onboarding',
      description: 'Complete your onboarding application',
      icon: <FileTextOutlined style={{ fontSize: 40, color: '#722ed1' }} />,
      path: '/onboarding/form',
    },
  ];

  const getDisplayName = () => {
    if (!employee) return 'Employee';
    const preferredName = employee.preferredName || employee.firstName;
    return preferredName;
  };

  return (
    <PageContainer loading={loading}>
      {/* 欢迎区域 */}
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Space size="large" align="center">
          <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#fff', color: '#667eea' }} />
          <div>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              Hello {getDisplayName()}, Welcome to BeaconFire 🎉
            </Title>
            <Paragraph style={{ color: '#fff', marginTop: 8, marginBottom: 0, opacity: 0.9 }}>
              {employee?.email}
            </Paragraph>
            {employee?.startDate && (
              <Text style={{ color: '#fff', opacity: 0.8 }}>
                Member since {dayjs(employee.startDate).format('MMMM YYYY')}
              </Text>
            )}
          </div>
        </Space>
      </Card>

      {/* 快捷链接卡片 */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Quick Links
      </Title>
      <Row gutter={[16, 16]}>
        {quickLinks.map((link) => (
          <Col xs={24} sm={12} lg={6} key={link.path}>
            <Card
              hoverable
              onClick={() => navigate(link.path)}
              style={{ height: '100%', textAlign: 'center' }}
              bodyStyle={{ padding: '32px 16px' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {link.icon}
                <Title level={5} style={{ margin: 0 }}>
                  {link.title}
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {link.description}
                </Text>
                <Button type="link" icon={<RightOutlined />}>
                  Go
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 个人信息摘要 */}
      {employee && (
        <Card title="Profile Summary" style={{ marginTop: 24 }}>
          <Row gutter={[24, 16]}>
            <Col span={8}>
              <Text type="secondary">Full Name</Text>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                {employee.firstName} {employee.middleName && `${employee.middleName} `}{employee.lastName}
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Contact</Text>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                {employee.cellPhone}
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Work Authorization</Text>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                {employee.visaStatus?.find(v => v.activeFlag === 'Yes')?.visaType || 'N/A'}
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </PageContainer>
  );
};

export default EmployeeHomePage;
