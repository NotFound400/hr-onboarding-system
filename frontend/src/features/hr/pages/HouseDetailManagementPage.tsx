/**
 * House Detail Management Page (HR)
 * 满足 raw_project_requirement.md §6.c/6.d：查看房屋详情、设施、报修记录与住户信息
 */

import { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Button, Space, Tag } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../../components/common/PageContainer';
import { getHouseById, getAllEmployees } from '../../../services/api';
import type { HouseDetail, HouseDetailHR, Employee, Facility } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const isHouseDetailHR = (detail: HouseDetail): detail is HouseDetailHR =>
  detail.viewType === 'HR_VIEW';

const HouseDetailManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [houseDetail, setHouseDetail] = useState<HouseDetailHR | null>(null);
  const [residents, setResidents] = useState<Employee[]>([]);
  const [residentsLoading, setResidentsLoading] = useState(false);
  const messageApi = useAntdMessage();

  useEffect(() => {
    if (id) {
      const houseId = parseInt(id, 10);
      if (!Number.isNaN(houseId)) {
        fetchHouseDetail(houseId);
      }
    }
  }, [id]);

  const fetchHouseDetail = async (houseId: number) => {
    try {
      setLoading(true);
      const detail = await getHouseById(houseId);
      if (isHouseDetailHR(detail)) {
        setHouseDetail(detail);
      } else {
        throw new Error('Invalid house detail payload');
      }
      fetchResidents(houseId);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load house details');
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async (houseId: number) => {
    try {
      setResidentsLoading(true);
      const employees = await getAllEmployees();
      const assigned = employees.filter((employee) => Number(employee.houseID) === houseId);
      setResidents(assigned);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load residents');
    } finally {
      setResidentsLoading(false);
    }
  };

  const facilityColumns: ColumnsType<Facility> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
    },
  ];

  const residentColumns: ColumnsType<Employee> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, employee) =>
        employee.preferredName || `${employee.firstName} ${employee.lastName}`,
    },
    {
      title: 'Phone',
      dataIndex: 'cellPhone',
      key: 'cellPhone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, employee) => (
        <Button type="link" onClick={() => navigate(`/hr/employees/${employee.id}`)}>
          View Profile
        </Button>
      ),
    },
  ];

  if (!houseDetail && loading) {
    return (
      <PageContainer title="House Details" loading>
        <div />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`House Details - ${houseDetail?.address || ''}`} loading={loading}>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={() => navigate('/hr/housing')}>Back to List</Button>
      </div>

      {houseDetail ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title={<><HomeOutlined /> Basic Information</>}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Address" span={2}>
                <strong>{houseDetail.address}</strong>
              </Descriptions.Item>
              {houseDetail.landlord ? (
                <>
                  <Descriptions.Item label="Landlord Name">
                    {houseDetail.landlord.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Landlord Phone">
                    {houseDetail.landlord.cellPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Landlord Email">
                    {houseDetail.landlord.email}
                  </Descriptions.Item>
                </>
              ) : (
                <Descriptions.Item label="Landlord" span={2}>
                  Not Available
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Number of People Living There">
                <Tag color="blue">
                  {houseDetail.numberOfEmployees} / {houseDetail.maxOccupant}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Facility Information">
            {houseDetail.facilitySummary ? (
              <Descriptions column={4} bordered>
                {Object.entries(houseDetail.facilitySummary).map(([type, count]) => (
                  <Descriptions.Item key={type} label={type}>
                    <strong>{count}</strong>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', color: '#999' }}>No facility data</div>
            )}
          </Card>

          <Card title="Facility Details">
            {houseDetail.facilities && houseDetail.facilities.length > 0 ? (
              <Table
                columns={facilityColumns}
                dataSource={houseDetail.facilities}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: 'No facility records' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999' }}>No facility records</div>
            )}
          </Card>

          <Card title="Residents">
            <Table
              columns={residentColumns}
              dataSource={residents}
              rowKey="id"
              loading={residentsLoading}
              pagination={false}
              locale={{ emptyText: 'No residents assigned' }}
            />
          </Card>
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: 48 }}>No house data found.</div>
      )}

    </PageContainer>
  );
};

export default HouseDetailManagementPage;
