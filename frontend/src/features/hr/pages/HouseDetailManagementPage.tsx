/**
 * House Detail Management Page (HR)
 * 满足 raw_project_requirement.md §6.c/6.d：查看房屋详情、设施、报修记录与住户信息
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Modal,
  Input,
  message,
  Tag,
  List,
  Typography,
  Spin,
} from 'antd';
import {
  HomeOutlined,
  ToolOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../../components/common/PageContainer';
import {
  getHouseById,
  getAllFacilityReports,
  getFacilityReportById,
  addFacilityReportComment,
  updateFacilityReportComment,
  getAllEmployees,
} from '../../../services/api';
import { FacilityReportStatus } from '../../../types';
import type {
  HouseDetail,
  HouseDetailHR,
  FacilityReportDetail,
  FacilityReportComment,
  Employee,
} from '../../../types';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface FacilityReportModalProps {
  visible: boolean;
  reportId: number | null;
  onClose: () => void;
  currentUserId?: number;
  onUpdated?: () => void;
}

const FacilityReportModal: React.FC<FacilityReportModalProps> = ({
  visible,
  reportId,
  onClose,
  currentUserId,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [reportDetail, setReportDetail] = useState<FacilityReportDetail | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<FacilityReportComment | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [updatingComment, setUpdatingComment] = useState(false);

  useEffect(() => {
    if (visible && reportId) {
      fetchReportDetail(reportId);
    }
  }, [visible, reportId]);

  const fetchReportDetail = async (id: number) => {
    try {
      setLoading(true);
      const detail = await getFacilityReportById(id);
      setReportDetail(detail);
    } catch (error: any) {
      message.error(error.message || 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !reportId) {
      message.warning('Please enter a comment');
      return;
    }
    try {
      setSubmittingComment(true);
      await addFacilityReportComment({
        facilityReportId: reportId,
        comment: newComment.trim(),
      });
      message.success('Comment added');
      setNewComment('');
      fetchReportDetail(reportId);
      onUpdated?.();
    } catch (error: any) {
      message.error(error.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !reportId) return;
    if (!editingValue.trim()) {
      message.warning('Comment cannot be empty');
      return;
    }
    try {
      setUpdatingComment(true);
      await updateFacilityReportComment(editingComment.id, editingValue.trim());
      message.success('Comment updated');
      setEditingComment(null);
      setEditingValue('');
      fetchReportDetail(reportId);
      onUpdated?.();
    } catch (error: any) {
      message.error(error.message || 'Failed to update comment');
    } finally {
      setUpdatingComment(false);
    }
  };

  const isCommentOwner = (comment: FacilityReportComment) =>
    currentUserId !== undefined && Number(comment.employeeId) === Number(currentUserId);

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      );
    }

    if (!reportDetail) {
      return <div style={{ textAlign: 'center', padding: 24 }}>No report selected</div>;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small">
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space>
              <Tag color={
                reportDetail.status === FacilityReportStatus.OPEN ? 'red' :
                reportDetail.status === FacilityReportStatus.IN_PROGRESS ? 'orange' : 'green'
              }>
                {reportDetail.statusDisplayName || reportDetail.status}
              </Tag>
              <Text type="secondary">
                {new Date(reportDetail.createDate).toLocaleString()}
              </Text>
            </Space>
            <Text type="secondary">{reportDetail.houseAddress}</Text>
            <Paragraph style={{ marginBottom: 0 }}>{reportDetail.description}</Paragraph>
          </Space>
        </Card>

        <Card title="Comments" size="small">
          {reportDetail.comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999' }}>No comments yet</div>
          ) : (
            <List
              dataSource={reportDetail.comments}
              renderItem={(comment) => (
                <List.Item
                  actions={
                    isCommentOwner(comment)
                      ? editingComment?.id === comment.id
                        ? [
                            <Button
                              key="save"
                              type="link"
                              size="small"
                              onClick={handleUpdateComment}
                              loading={updatingComment}
                            >
                              Save
                            </Button>,
                            <Button
                              key="cancel"
                              type="link"
                              size="small"
                              onClick={() => {
                                setEditingComment(null);
                                setEditingValue('');
                              }}
                            >
                              Cancel
                            </Button>,
                          ]
                        : [
                            <Button
                              key="edit"
                              type="link"
                              size="small"
                              onClick={() => {
                                setEditingComment(comment);
                                setEditingValue(comment.comment);
                              }}
                            >
                              Edit
                            </Button>,
                          ]
                      : undefined
                  }
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <strong>{comment.createdBy}</strong>
                        <Text type="secondary">
                          {new Date(comment.displayDate || comment.createDate).toLocaleString()}
                        </Text>
                      </Space>
                    }
                    description={
                      editingComment?.id === comment.id ? (
                        <TextArea
                          rows={3}
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                        />
                      ) : (
                        <Paragraph style={{ marginBottom: 0 }}>{comment.comment}</Paragraph>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          )}

          <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
            <TextArea
              rows={3}
              placeholder="Add a new comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              type="primary"
              icon={<CommentOutlined />}
              onClick={handleAddComment}
              loading={submittingComment}
            >
              Submit Comment
            </Button>
          </Space>
        </Card>
      </Space>
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      title="Facility Report Detail"
      destroyOnClose
    >
      {renderContent()}
    </Modal>
  );
};

const isHouseDetailHR = (detail: HouseDetail): detail is HouseDetailHR =>
  detail.viewType === 'HR_VIEW';

const HouseDetailManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);

  const [loading, setLoading] = useState(false);
  const [houseDetail, setHouseDetail] = useState<HouseDetailHR | null>(null);
  const [facilityReports, setFacilityReports] = useState<FacilityReportDetail[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [residents, setResidents] = useState<Employee[]>([]);
  const [residentsLoading, setResidentsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

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
      fetchFacilityReports(houseId);
      fetchResidents(houseId);
    } catch (error: any) {
      message.error(error.message || 'Failed to load house details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilityReports = useCallback(async (houseId: number) => {
    try {
      setReportsLoading(true);
      const list = await getAllFacilityReports();
      const detailedReports = await Promise.all(
        list.map((report) => getFacilityReportById(report.id))
      );
      const filtered = detailedReports
        .filter((report) => report.houseId === houseId)
        .sort(
          (a, b) =>
            new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        );
      setFacilityReports(filtered);
    } catch (error: any) {
      message.error(error.message || 'Failed to load facility reports');
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const fetchResidents = async (houseId: number) => {
    try {
      setResidentsLoading(true);
      const employees = await getAllEmployees();
      const assigned = employees.filter((employee) => Number(employee.houseID) === houseId);
      setResidents(assigned);
    } catch (error: any) {
      message.error(error.message || 'Failed to load residents');
    } finally {
      setResidentsLoading(false);
    }
  };

  const handleViewReport = (reportId: number) => {
    setSelectedReportId(reportId);
    setModalVisible(true);
  };

  const reportColumns: ColumnsType<FacilityReportDetail> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '40%',
    },
    {
      title: 'Date',
      dataIndex: 'createDate',
      key: 'createDate',
      width: '30%',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '20%',
      render: (status: string, record) => (
        <Tag color={
          status === FacilityReportStatus.OPEN ? 'red' :
          status === FacilityReportStatus.IN_PROGRESS ? 'orange' : 'green'
        }>
          {record.statusDisplayName || status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewReport(record.id)}>
          View
        </Button>
      ),
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
              <Descriptions.Item label="Landlord Name">
                {houseDetail.landlord.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Landlord Phone">
                {houseDetail.landlord.cellPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Landlord Email">
                {houseDetail.landlord.email}
              </Descriptions.Item>
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

          <Card title={<><ToolOutlined /> Facility Reports</>}>
            <Table
              columns={reportColumns}
              dataSource={facilityReports}
              rowKey="id"
              loading={reportsLoading}
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ['3', '5'],
                showTotal: (total) => `Total ${total} reports`,
              }}
              locale={{ emptyText: 'No facility reports' }}
            />
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

      <FacilityReportModal
        visible={modalVisible}
        reportId={selectedReportId}
        onClose={() => {
          setModalVisible(false);
          setSelectedReportId(null);
        }}
        currentUserId={currentUser?.id}
        onUpdated={() => {
          if (houseDetail) {
            fetchFacilityReports(houseDetail.id);
          }
        }}
      />
    </PageContainer>
  );
};

export default HouseDetailManagementPage;
