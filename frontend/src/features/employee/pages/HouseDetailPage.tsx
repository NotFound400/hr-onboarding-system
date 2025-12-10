/**
 * House Detail Page (Employee)
 * 展示房屋详细信息、房东信息以及设施列表
 */

import { useEffect, useState } from 'react';
import { Card, Descriptions, List, Tag, Space, Empty, message, Alert } from 'antd';
import { HomeOutlined, TeamOutlined, PhoneOutlined, MailOutlined, ToolOutlined } from '@ant-design/icons';
import { PageContainer } from '../../../components/common/PageContainer';
import { getEmployeeByUserId, getHouseById } from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type { Employee, HouseDetail } from '../../../types';

const HouseDetailPage: React.FC = () => {
  const currentUser = useAppSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [houseDetail, setHouseDetail] = useState<HouseDetail | null>(null);

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
        setHouseDetail(detail);
      } else {
        setHouseDetail(null);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load house detail');
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
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Address" span={2}>
              <strong>{houseDetail.address}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Max Occupant">{houseDetail.maxOccupant}</Descriptions.Item>
            <Descriptions.Item label="Current Residents">{houseDetail.numberOfEmployees}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Landlord Information" extra={<TeamOutlined />}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Name">{houseDetail.landlord.fullName}</Descriptions.Item>
            <Descriptions.Item label="Phone">
              <PhoneOutlined style={{ marginRight: 8 }} />
              {houseDetail.landlord.cellPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>
              <MailOutlined style={{ marginRight: 8 }} />
              {houseDetail.landlord.email}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Facility Summary" extra={<ToolOutlined />}>
          {houseDetail.facilitySummary && Object.keys(houseDetail.facilitySummary).length > 0 ? (
            <Space size={[8, 8]} wrap>
              {Object.entries(houseDetail.facilitySummary).map(([type, quantity]) => (
                <Tag key={type} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                  {type}: {quantity}
                </Tag>
              ))}
            </Space>
          ) : (
            <Empty description="No facility summary" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>

        <Card title="Facilities" extra={<ToolOutlined />}>
          {houseDetail.facilities.length === 0 ? (
            <Empty description="No facility records" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={houseDetail.facilities}
              renderItem={(facility) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color="green">{facility.type}</Tag>
                        <span>{facility.description}</span>
                      </Space>
                    }
                    description={`Quantity: ${facility.quantity}`}
                  />
                </List.Item>
              )}
            />
          )}
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
