/**
 * House Detail Management Page (HR)
 * 满足 raw_project_requirement.md §6.c/6.d：查看房屋详情、设施、报修记录与住户信息
 */

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  InputNumber,
  Modal,
  List,
  Typography,
  Empty,
  Spin,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../../components/common/PageContainer';
import {
  getHouseById,
  getAllEmployees,
  createFacility,
  updateFacility,
  getFacilityReportsByHouse,
  getFacilityReportById,
} from '../../../services/api';
import type {
  HouseDetail,
  HouseDetailHR,
  Employee,
  FacilityReportListItem,
  FacilityReportDetail,
} from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const isHouseDetailHR = (detail: HouseDetail): detail is HouseDetailHR =>
  detail.viewType === 'HR_VIEW';

const KEY_FACILITY_TYPES = ['Bed', 'Mattress', 'Desk'];

const HouseDetailManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [houseDetail, setHouseDetail] = useState<HouseDetailHR | null>(null);
  const [residents, setResidents] = useState<Employee[]>([]);
  const [facilityReports, setFacilityReports] = useState<FacilityReportListItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [residentsLoading, setResidentsLoading] = useState(false);
  const [reportDetailModalVisible, setReportDetailModalVisible] = useState(false);
  const [reportDetailLoading, setReportDetailLoading] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState<FacilityReportDetail | null>(null);
  const messageApi = useAntdMessage();
  const [facilityQuantities, setFacilityQuantities] = useState<Record<string, number>>({});
  const [editingFacilities, setEditingFacilities] = useState<Record<string, boolean>>({});
  const [updatingFacility, setUpdatingFacility] = useState<string | null>(null);

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
      await ensureFacilityTypes(houseId);
      const detail = await getHouseById(houseId);
      if (!isHouseDetailHR(detail)) {
        throw new Error('Invalid house detail payload');
      }
      setHouseDetail(detail);
      setFacilityQuantities(buildFacilityQuantities(detail));
      setEditingFacilities(buildInitialEditingState(detail));
      fetchResidents(houseId);
      fetchFacilityReports(houseId);
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

  const fetchFacilityReports = async (houseId: number, page = 0) => {
    try {
      setReportsLoading(true);
      const reportPage = await getFacilityReportsByHouse(houseId, page);
      setFacilityReports(reportPage?.content || []);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load facility reports');
    } finally {
      setReportsLoading(false);
    }
  };

  const buildFacilityQuantities = (detail: HouseDetailHR) => {
    const map: Record<string, number> = {};
    KEY_FACILITY_TYPES.forEach((type) => {
      const facility = detail.facilities?.find(
        (item) => item.type?.toLowerCase() === type.toLowerCase()
      );
      map[type] = facility?.quantity ?? 0;
    });
    return map;
  };

  const buildInitialEditingState = (detail: HouseDetailHR) => {
    const map: Record<string, boolean> = {};
    KEY_FACILITY_TYPES.forEach((type) => {
      const facilityExists = detail.facilities?.some(
        (item) => item.type?.toLowerCase() === type.toLowerCase()
      );
      map[type] = !facilityExists;
    });
    return map;
  };

  const ensureFacilityTypes = async (houseId: number) => {
    const detail = await getHouseById(houseId);
    if (!isHouseDetailHR(detail)) {
      return;
    }

    const existingTypes =
      detail.facilities?.map((facility) => facility.type?.toLowerCase() || '') || [];
    const missingTypes = KEY_FACILITY_TYPES.filter(
      (type) => !existingTypes.includes(type.toLowerCase())
    );

    for (const type of missingTypes) {
      await createFacility({
        houseId,
        type,
        description: `${type} placeholder`,
        quantity: 0,
      });
    }
  };

  const handleUpdateFacilityQuantity = async (type: string) => {
    if (!houseDetail) return;
    const facility = houseDetail.facilities?.find(
      (item) => item.type?.toLowerCase() === type.toLowerCase()
    );
    if (!facility) {
      messageApi.error(`Facility record for ${type} not found`);
      return;
    }

    try {
      setUpdatingFacility(type);
      await updateFacility(facility.id, {
        quantity: facilityQuantities[type] ?? 0,
      });
      messageApi.success(`${type} quantity updated`);
    } catch (error: any) {
      messageApi.error(error.message || `Failed to update ${type}`);
    } finally {
      setUpdatingFacility(null);
      fetchHouseDetail(houseDetail.id);
    }
  };

  const handleQuantityChange = (type: string, value: number | null) => {
    setFacilityQuantities((prev) => ({
      ...prev,
      [type]: value ?? 0,
    }));
  };

  const toggleEditFacility = (type: string) => {
    setEditingFacilities((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleViewReportDetail = async (reportId: number) => {
    setReportDetailModalVisible(true);
    setReportDetailLoading(true);
    setSelectedReportDetail(null);
    try {
      const detail = await getFacilityReportById(reportId);
      setSelectedReportDetail(detail);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load report detail');
    } finally {
      setReportDetailLoading(false);
    }
  };

  const handleCloseReportModal = () => {
    setReportDetailModalVisible(false);
    setSelectedReportDetail(null);
  };

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

  const reportColumns: ColumnsType<FacilityReportListItem> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'statusDisplayName',
      key: 'statusDisplayName',
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, report) => (
        <Button type="link" onClick={() => handleViewReportDetail(report.id)}>
          View
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '80%',
                margin: '0 auto',
                gap: 24,
              }}
            >
              {KEY_FACILITY_TYPES.map((type) => (
                <div
                  key={type}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 16,
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    background: '#fafafa',
                  }}
                >
                  <span style={{ fontWeight: 600, marginBottom: 12 }}>{type}</span>
                  <InputNumber
                    min={0}
                    disabled={!editingFacilities[type]}
                    value={facilityQuantities[type] ?? 0}
                    onChange={(value) => handleQuantityChange(type, value)}
                    style={{ width: '100%', marginBottom: 12 }}
                  />
                  {editingFacilities[type] ? (
                    <Space>
                      <Button
                        type="primary"
                        loading={updatingFacility === type}
                        onClick={() => handleUpdateFacilityQuantity(type)}
                      >
                        Update
                      </Button>
                      <Button onClick={() => toggleEditFacility(type)}>Cancel</Button>
                    </Space>
                  ) : (
                    <Button onClick={() => toggleEditFacility(type)}>Edit</Button>
                  )}
                </div>
              ))}
            </div>
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

          <Card title="Facility Reports">
            <Table
              columns={reportColumns}
              dataSource={facilityReports}
              rowKey="id"
              loading={reportsLoading}
              pagination={false}
              locale={{ emptyText: 'No facility reports for this house' }}
            />
          </Card>
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: 48 }}>No house data found.</div>
      )}

      <Modal
        open={reportDetailModalVisible}
        onCancel={handleCloseReportModal}
        footer={null}
        title={
          selectedReportDetail ? `Facility Report - ${selectedReportDetail.title}` : 'Facility Report'
        }
        width={720}
        destroyOnClose
      >
        {reportDetailLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin />
          </div>
        ) : selectedReportDetail ? (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Facility Type">
                {selectedReportDetail.facilityType}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="blue">{selectedReportDetail.statusDisplayName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(selectedReportDetail.createDate).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedReportDetail.createdBy}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5}>Description</Typography.Title>
            <Typography.Paragraph>{selectedReportDetail.description}</Typography.Paragraph>

            <Typography.Title level={5}>Comments</Typography.Title>
            {selectedReportDetail.comments?.length ? (
              <List
                itemLayout="vertical"
                dataSource={selectedReportDetail.comments}
                renderItem={(comment) => (
                  <List.Item key={comment.id}>
                    <List.Item.Meta
                      title={`${comment.createdBy} • ${dayjs(
                        comment.displayDate || comment.createDate
                      ).format('YYYY-MM-DD HH:mm')}`}
                      description={comment.comment}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No comments yet" />
            )}
          </>
        ) : (
          <Empty description="Unable to load report detail" />
        )}
      </Modal>
    </PageContainer>
  );
};

export default HouseDetailManagementPage;
