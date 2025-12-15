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
  Input,
  Form,
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
  deleteFacility,
  getFacilitiesByHouseId,
  getFacilityReportsByHouse,
  getFacilityReportById,
  updateFacilityReportStatus,
  addFacilityReportComment,
} from '../../../services/api';
import type {
  HouseDetail,
  HouseDetailHR,
  Employee,
  FacilityReportListItem,
  FacilityReportDetail,
  Facility,
} from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const isHouseDetailHR = (detail: HouseDetail): detail is HouseDetailHR =>
  detail.viewType === 'HR_VIEW';

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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [editingFacility, setEditingFacility] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ type: string; description: string; quantity: number } | null>(null);
  const [updatingFacility, setUpdatingFacility] = useState<number | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm, setCreateForm] = useState({ type: '', description: '', quantity: 0 });
  const [creatingFacility, setCreatingFacility] = useState(false);
  const [closingReport, setClosingReport] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [commentForm] = Form.useForm();

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
      if (!isHouseDetailHR(detail)) {
        throw new Error('Invalid house detail payload');
      }
      setHouseDetail(detail);
      fetchFacilities(houseId);
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

  const fetchFacilities = async (houseId: number) => {
    try {
      setFacilitiesLoading(true);
      const facilitiesData = await getFacilitiesByHouseId(houseId);
      setFacilities(facilitiesData);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load facilities');
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility.id);
    setEditForm({
      type: facility.type,
      description: facility.description || '',
      quantity: facility.quantity,
    });
  };

  const handleCancelEdit = () => {
    setEditingFacility(null);
    setEditForm(null);
  };

  const handleUpdateFacility = async (facilityId: number) => {
    if (!editForm || !houseDetail) return;

    try {
      setUpdatingFacility(facilityId);
      await updateFacility(facilityId, editForm);
      messageApi.success('Facility updated successfully');
      setEditingFacility(null);
      setEditForm(null);
      fetchFacilities(houseDetail.id);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to update facility');
    } finally {
      setUpdatingFacility(null);
    }
  };

  const handleDeleteFacility = async (facilityId: number, facilityType: string) => {
    if (!houseDetail) return;

    Modal.confirm({
      title: 'Delete Facility',
      content: `Are you sure you want to delete ${facilityType}?`,
      onOk: async () => {
        try {
          await deleteFacility(facilityId);
          messageApi.success('Facility deleted successfully');
          fetchFacilities(houseDetail.id);
        } catch (error: any) {
          messageApi.error(error.message || 'Failed to delete facility');
        }
      },
    });
  };

  const handleOpenCreateModal = () => {
    setCreateForm({ type: '', description: '', quantity: 0 });
    setCreateModalVisible(true);
  };

  const handleCreateFacility = async () => {
    if (!houseDetail) return;
    if (!createForm.type.trim()) {
      messageApi.warning('Please enter facility type');
      return;
    }

    try {
      setCreatingFacility(true);
      await createFacility({
        houseId: houseDetail.id,
        ...createForm,
      });
      messageApi.success('Facility created successfully');
      setCreateModalVisible(false);
      setCreateForm({ type: '', description: '', quantity: 0 });
      fetchFacilities(houseDetail.id);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to create facility');
    } finally {
      setCreatingFacility(false);
    }
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
    commentForm.resetFields();
  };

  const handleCloseReport = async () => {
    if (!selectedReportDetail || !houseDetail) return;

    Modal.confirm({
      title: 'Close Report',
      content: 'Are you sure you want to close this facility report?',
      onOk: async () => {
        try {
          setClosingReport(true);
          await updateFacilityReportStatus(selectedReportDetail.id, {
            reportId: selectedReportDetail.id,
            status: 'Closed',
          });
          messageApi.success('Report closed successfully');
          handleCloseReportModal();
          fetchFacilityReports(houseDetail.id);
        } catch (error: any) {
          messageApi.error(error.message || 'Failed to close report');
        } finally {
          setClosingReport(false);
        }
      },
    });
  };

  const handleAddComment = async (values: { comment: string }) => {
    if (!selectedReportDetail || !houseDetail) return;

    try {
      setAddingComment(true);
      await addFacilityReportComment({
        facilityReportId: selectedReportDetail.id,
        comment: values.comment,
      });
      messageApi.success('Comment added successfully');
      commentForm.resetFields();
      
      // Re-fetch the report detail to get the updated comments
      const updatedReport = await getFacilityReportById(selectedReportDetail.id);
      setSelectedReportDetail(updatedReport);
      fetchFacilityReports(houseDetail.id);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
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

          <Card 
            title="Facility Information"
            extra={
              <Button type="primary" onClick={handleOpenCreateModal}>
                Add Facility
              </Button>
            }
          >
            {facilitiesLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Spin />
              </div>
            ) : facilities.length === 0 ? (
              <Empty description="No facilities yet" />
            ) : (
              <List
                dataSource={facilities}
                renderItem={(facility) => {
                  const isEditing = editingFacility === facility.id;
                  return (
                    <List.Item
                      actions={[
                        isEditing ? (
                          <Space key="edit-actions">
                            <Button
                              type="primary"
                              size="small"
                              loading={updatingFacility === facility.id}
                              onClick={() => handleUpdateFacility(facility.id)}
                            >
                              Save
                            </Button>
                            <Button size="small" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </Space>
                        ) : (
                          <Space key="normal-actions">
                            <Button
                              type="link"
                              size="small"
                              onClick={() => handleEditFacility(facility)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="link"
                              danger
                              size="small"
                              onClick={() => handleDeleteFacility(facility.id, facility.type)}
                            >
                              Delete
                            </Button>
                          </Space>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          isEditing ? (
                            <Input
                              value={editForm?.type}
                              onChange={(e) =>
                                setEditForm((prev) => prev ? { ...prev, type: e.target.value } : null)
                              }
                              placeholder="Facility Type"
                              style={{ width: 200 }}
                            />
                          ) : (
                            <strong>{facility.type}</strong>
                          )
                        }
                        description={
                          <Space direction="vertical" size="small">
                            {isEditing ? (
                              <>
                                <Input
                                  value={editForm?.description}
                                  onChange={(e) =>
                                    setEditForm((prev) =>
                                      prev ? { ...prev, description: e.target.value } : null
                                    )
                                  }
                                  placeholder="Description"
                                  style={{ width: 400 }}
                                />
                                <Space>
                                  <span>Quantity:</span>
                                  <InputNumber
                                    min={0}
                                    value={editForm?.quantity}
                                    onChange={(value) =>
                                      setEditForm((prev) =>
                                        prev ? { ...prev, quantity: value ?? 0 } : null
                                      )
                                    }
                                  />
                                </Space>
                              </>
                            ) : (
                              <>
                                <div>{facility.description || 'No description'}</div>
                                <div>
                                  <Tag color="blue">Quantity: {facility.quantity}</Tag>
                                </div>
                              </>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
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

            {selectedReportDetail.status !== 'Closed' && (
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  danger
                  loading={closingReport}
                  onClick={handleCloseReport}
                >
                  Close Report
                </Button>
              </div>
            )}

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
              <Empty description="No comments yet" style={{ marginBottom: 16 }} />
            )}

            <Form
              form={commentForm}
              onFinish={handleAddComment}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                name="comment"
                rules={[{ required: true, message: 'Please enter a comment' }]}
              >
                <Input.TextArea
                  placeholder="Add a comment..."
                  rows={3}
                  disabled={selectedReportDetail.status === 'Closed'}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={addingComment}
                  disabled={selectedReportDetail.status === 'Closed'}
                >
                  Add Comment
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <Empty description="Unable to load report detail" />
        )}
      </Modal>

      <Modal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={handleCreateFacility}
        title="Create New Facility"
        confirmLoading={creatingFacility}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>Type *</label>
            <Input
              value={createForm.type}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, type: e.target.value }))}
              placeholder="e.g., Bed, Desk, Chair"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
            <Input.TextArea
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Queen size bed"
              rows={3}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>Quantity</label>
            <InputNumber
              min={0}
              value={createForm.quantity}
              onChange={(value) => setCreateForm((prev) => ({ ...prev, quantity: value ?? 0 }))}
              style={{ width: '100%' }}
            />
          </div>
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default HouseDetailManagementPage;
