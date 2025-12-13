/**
 * House Detail Page (Employee)
 * 展示房屋详细信息、房东信息以及设施列表
 */

import { useEffect, useState } from 'react';
import { Card, Descriptions, List, Space, Empty, Alert, Avatar, Tag } from 'antd';
import { HomeOutlined, TeamOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '../../../components/common/PageContainer';
import { getEmployeeByUserId, getHouseById } from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type { Employee, HouseDetail, HouseDetailEmployee } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const isEmployeeHouseDetail = (detail: HouseDetail): detail is HouseDetailEmployee =>
  detail.viewType === 'EMPLOYEE_VIEW';

const HouseDetailPage: React.FC = () => {
  const currentUser = useAppSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [houseDetail, setHouseDetail] = useState<HouseDetailEmployee | null>(null);
  const messageApi = useAntdMessage();

  useEffect(() => {
    fetchHouseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const fetchHouseDetail = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const empData = await getEmployeeByUserId(String(currentUser.id));
      setEmployee(empData);

      if (empData.houseID) {
        const detail = await getHouseById(empData.houseID);
        if (isEmployeeHouseDetail(detail)) {
          setHouseDetail(detail);
        } else {
          setHouseDetail(null);
          messageApi.warning('Unable to load employee housing data. Please contact HR.');
        }
      } else {
        setHouseDetail(null);
      }
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load house detail');
    } finally {
      setLoading(false);
    }
  };

  const renderNoHouse = () => (
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
    />
  );

  const renderContent = () => {
    if (!houseDetail) {
      return (
        <Alert
          type="warning"
          showIcon
          message="We couldn't find the detailed information for your house. Please contact HR."
        />
      );
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="House Information" extra={<HomeOutlined />}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Address">
              <strong>{houseDetail.address}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total Occupants">
              <Tag color="blue">{houseDetail.roommates.length}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Roommates" extra={<TeamOutlined />}>
          {houseDetail.roommates.length === 0 ? (
            <Empty description="No roommate information available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={houseDetail.roommates}
              renderItem={(roommate) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={<span style={{ fontWeight: 600 }}>{roommate.name}</span>}
                    description={
                      <Space>
                        <PhoneOutlined />
                        <span>{roommate.cellPhone || 'N/A'}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        <Card>
          <Alert
            type="info"
            showIcon
            message="Need help with your housing assignment?"
            description="Please reach out to HR if your roommate list or contact information looks incorrect."
          />
        </Card>
      </Space>
    );
  };

  return (
    <PageContainer title="House Detail" loading={loading}>
      {!employee?.houseID ? renderNoHouse() : renderContent()}
    </PageContainer>
  );
};

export default HouseDetailPage;
