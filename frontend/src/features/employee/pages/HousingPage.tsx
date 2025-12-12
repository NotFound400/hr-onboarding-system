/**
 * Housing Page
 * 员工房屋信息页面
 * 
 * Features:
 * - 展示房屋地址、设施信息
 * - 展示室友列表
 * - "Report Issue" 按钮，点击跳转到报修页
 */

import { useState, useEffect } from 'react';
import { Card, Descriptions, List, Avatar, Button, Empty, Space, Tag, message, Alert } from 'antd';
import { HomeOutlined, UserOutlined, ToolOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../../components/common/PageContainer';
import { getHouseById, getMyHouse } from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type { HouseDetail, HouseEmployeeView } from '../../../types';

/**
 * HousingPage Component
 */
const HousingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [houseInfo, setHouseInfo] = useState<HouseEmployeeView | null>(null);

  // 获取当前登录用户
  const currentUser = useAppSelector(selectUser);
  const assignedEmployeeId = useAppSelector((state) => state.auth.employeeId);
  const assignedHouseId = useAppSelector((state) => state.auth.houseId);

  useEffect(() => {
    fetchHousingInfo();
  }, [currentUser?.id, assignedHouseId]);

  /**
   * 获取房屋信息
   */
  const fetchHousingInfo = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      let houseData: HouseEmployeeView | null = null;

      if (assignedHouseId) {
        const detail: HouseDetail = await getHouseById(Number(assignedHouseId));
        if ('roommates' in detail) {
          houseData = detail as HouseEmployeeView;
        } else {
          houseData = await getMyHouse();
        }
      } else {
        houseData = await getMyHouse();
      }

      setHouseInfo(houseData);
    } catch (error: any) {
      setHouseInfo(null);
      message.error(error.message || 'Failed to load housing information');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 跳转到报修页面
   */
  const handleReportIssue = () => {
    if (houseInfo) {
      navigate(`/employee/facility-report?houseId=${houseInfo.id}`);
    }
  };

  /**
   * 渲染无房屋分配提示
   */
  const renderNoHousingAssigned = () => (
    <Empty
      image={<HomeOutlined style={{ fontSize: 80, color: '#999' }} />}
      description={
        <Space direction="vertical">
          <span style={{ fontSize: 16, fontWeight: 'bold' }}>No Housing Assigned</span>
          <span style={{ color: '#666' }}>
            You have not been assigned to any housing facility yet. Please contact HR for assistance.
          </span>
        </Space>
      }
    >
      <Button type="primary" onClick={() => navigate('/employee/home')}>
        Back to Home
      </Button>
    </Empty>
  );

  /**
   * 渲染房屋信息
   */
  const renderHousingContent = () => {
    if (!houseInfo) return null;

    const candidateIds = [
      assignedEmployeeId ?? undefined,
      currentUser ? currentUser.id.toString() : undefined,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toString());

    const currentResident = houseInfo.roommates.find((roommate) => {
      if (roommate.employeeId === undefined || roommate.employeeId === null) {
        return false;
      }
      const roommateId = roommate.employeeId.toString();
      return candidateIds.includes(roommateId);
    });
    
    // 过滤出室友（排除当前用户）
    const roommates = houseInfo.roommates.filter(
      (roommate) => roommate !== currentResident
    );

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 房屋基本信息 */}
        <Card
          title="Housing Details"
          extra={
            <Button
              type="primary"
              icon={<ToolOutlined />}
              onClick={handleReportIssue}
            >
              Report Issue
            </Button>
          }
        >
          <Descriptions column={1} bordered>
            <Descriptions.Item label={<><HomeOutlined /> Address</>}>
              <strong style={{ fontSize: 16 }}>{houseInfo.address}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total Residents">
              <Tag color="blue" style={{ fontSize: 14 }}>
                {houseInfo.roommates.length}{' '}
                {houseInfo.roommates.length === 1 ? 'person' : 'people'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 当前用户信息 */}
        {currentResident && (
          <Card title="Your Information">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Name">{currentResident.name}</Descriptions.Item>
              <Descriptions.Item label="Phone">{currentResident.cellPhone}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* 室友列表 */}
        <Card 
          title={`Roommates (${roommates.length})`}
          extra={<UserOutlined style={{ fontSize: 20 }} />}
        >
          {roommates.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No roommates - You have this place to yourself!"
            />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={roommates}
              renderItem={(roommate) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} size={48} />}
                    title={
                      <Space>
                        <span style={{ fontSize: 16, fontWeight: 'bold' }}>{roommate.name}</span>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <span>
                          <PhoneOutlined style={{ marginRight: 8 }} />
                          {roommate.cellPhone}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* 报修提示 */}
        <Card>
          <Alert
            message="Need to Report a Facility Issue?"
            description={
              <Space direction="vertical">
                <span>
                  If you encounter any problems with facilities in your housing (broken appliances, 
                  plumbing issues, electrical problems, etc.), please use the "Report Issue" button above.
                </span>
                <span style={{ fontSize: 12, color: '#666' }}>
                  HR and your landlord will be notified and will work to resolve the issue promptly.
                </span>
              </Space>
            }
            type="info"
            showIcon
            icon={<ToolOutlined />}
          />
        </Card>
      </Space>
    );
  };

  return (
    <PageContainer title="Housing Details" loading={loading}>
      {!houseInfo ? renderNoHousingAssigned() : renderHousingContent()}
    </PageContainer>
  );
};

export default HousingPage;
