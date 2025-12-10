/**
 * Facility Report Page (Employee)
 * 员工查看、提交房屋报修以及查看评论
 */

import { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  List,
  Tag,
  Space,
  Modal,
  Empty,
  message,
  Alert,
  Typography,
  Spin,
} from 'antd';
import {
  HomeOutlined,
  CommentOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageContainer } from '../../../components/common/PageContainer';
import {
  getEmployeeByUserId,
  getFacilityReportsByEmployeeId,
  createFacilityReport,
  getFacilityReportById,
  addFacilityReportComment,
  updateFacilityReportComment,
} from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type {
  Employee,
  FacilityReportListItem,
  FacilityReportDetail,
  FacilityReportComment,
} from '../../../types';

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

const FacilityReportPage: React.FC = () => {
  const currentUser = useAppSelector(selectUser);
  const [form] = Form.useForm();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [houseId, setHouseId] = useState<number | null>(null);
  const [reports, setReports] = useState<FacilityReportListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FacilityReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: number; value: string } | null>(null);
  const [commentUpdating, setCommentUpdating] = useState(false);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const initialize = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const empData = await getEmployeeByUserId(String(currentUser.id));
      setEmployee(empData);

      if (empData.houseID) {
        setHouseId(empData.houseID);
        fetchReports(empData.userID);
      } else {
        setHouseId(null);
        setReports([]);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load facility reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (employeeUserId: number) => {
    try {
      setReportsLoading(true);
      const list = await getFacilityReportsByEmployeeId(employeeUserId);
      setReports(list);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch reports');
    } finally {
      setReportsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'red';
      case 'In Progress':
        return 'orange';
      case 'Closed':
        return 'green';
      default:
        return 'default';
    }
  };

  const handleCreateReport = async (values?: { title: string; description: string }) => {
    if (!employee || !houseId) {
      message.warning('You need an assigned house before reporting an issue.');
      return;
    }

    try {
      const formValues = values || (await form.validateFields());
      setSubmittingReport(true);
      await createFacilityReport({
        houseId,
        employeeId: employee.id,
        title: formValues.title,
        description: formValues.description,
      });
      message.success('Facility issue reported successfully');
      form.resetFields();
      fetchReports(employee.userID);
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const openReportDetail = async (reportId: number) => {
    try {
      setDetailLoading(true);
      const detail = await getFacilityReportById(reportId);
      setSelectedReport(detail);
      setDetailVisible(true);
      setNewComment('');
      setEditingComment(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to load report detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailVisible(false);
    setSelectedReport(null);
    setEditingComment(null);
    setNewComment('');
  };

  const refreshSelectedReport = async (reportId: number) => {
    try {
      const detail = await getFacilityReportById(reportId);
      setSelectedReport(detail);
    } catch (error: any) {
      message.error(error.message || 'Failed to refresh report detail');
    }
  };

  const handleAddComment = async () => {
    if (!selectedReport || !employee) return;
    if (!newComment.trim()) {
      message.warning('Please enter a comment');
      return;
    }

    try {
      setCommentSubmitting(true);
      await addFacilityReportComment(selectedReport.id, {
        reportId: selectedReport.id,
        employeeId: employee.id,
        comment: newComment.trim(),
      });
      message.success('Comment added');
      setNewComment('');
      refreshSelectedReport(selectedReport.id);
    } catch (error: any) {
      message.error(error.message || 'Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const startEditComment = (comment: FacilityReportComment) => {
    setEditingComment({ id: comment.id, value: comment.comment });
  };

  const handleUpdateComment = async () => {
    if (!selectedReport || !editingComment) return;
    if (!editingComment.value.trim()) {
      message.warning('Comment cannot be empty');
      return;
    }

    try {
      setCommentUpdating(true);
      await updateFacilityReportComment(
        selectedReport.id,
        editingComment.id,
        editingComment.value.trim()
      );
      message.success('Comment updated');
      setEditingComment(null);
      refreshSelectedReport(selectedReport.id);
    } catch (error: any) {
      message.error(error.message || 'Failed to update comment');
    } finally {
      setCommentUpdating(false);
    }
  };

  const isCommentOwner = (comment: FacilityReportComment) => {
    if (!employee) return false;
    const commentOwner =
      typeof comment.employeeId === 'number'
        ? comment.employeeId
        : parseInt(String(comment.employeeId), 10);
    return commentOwner === employee.userID;
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

  const renderReports = () => (
    <List
      dataSource={reports}
      loading={reportsLoading}
      locale={{ emptyText: <Empty description="No facility reports" /> }}
      renderItem={(report) => (
        <List.Item
          actions={[
            <Button
              key="view"
              type="link"
              onClick={() => openReportDetail(report.id)}
              icon={<CommentOutlined />}
            >
              View Detail
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={
              <Space>
                <span style={{ fontWeight: 600 }}>{report.title}</span>
                <Tag color={getStatusColor(report.status)}>{report.statusDisplayName}</Tag>
              </Space>
            }
            description={
              <Space>
                <ClockCircleOutlined />
                {dayjs(report.createDate).format('YYYY-MM-DD HH:mm')}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderDetailModal = () => (
    <Modal
      open={detailVisible}
      onCancel={closeDetailModal}
      footer={null}
      width={800}
      title={selectedReport?.title || 'Report Detail'}
    >
      {detailLoading ? (
        <Spin />
      ) : selectedReport ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card size="small">
            <Space direction="vertical" size={4}>
              <Space>
                <Tag color={getStatusColor(selectedReport.status)}>
                  {selectedReport.statusDisplayName}
                </Tag>
                <Text type="secondary">
                  {dayjs(selectedReport.createDate).format('YYYY-MM-DD HH:mm')}
                </Text>
              </Space>
              <Text type="secondary">{selectedReport.houseAddress}</Text>
              <Paragraph>{selectedReport.description}</Paragraph>
            </Space>
          </Card>

          <Card title="Comments" size="small">
            {selectedReport.comments.length === 0 ? (
              <Empty description="No comments yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={selectedReport.comments}
                renderItem={(comment) => (
                  <List.Item
                    actions={
                      isCommentOwner(comment)
                        ? [
                            editingComment?.id === comment.id ? (
                              <Space key="edit-actions">
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={handleUpdateComment}
                                  loading={commentUpdating}
                                >
                                  Save
                                </Button>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => setEditingComment(null)}
                                >
                                  Cancel
                                </Button>
                              </Space>
                            ) : (
                              <Button
                                type="link"
                                size="small"
                                key="edit"
                                onClick={() => startEditComment(comment)}
                              >
                                Edit
                              </Button>
                            ),
                          ]
                        : undefined
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <strong>{comment.createdBy}</strong>
                          <Text type="secondary">
                            {dayjs(comment.displayDate || comment.createDate).format(
                              'YYYY-MM-DD HH:mm'
                            )}
                          </Text>
                        </Space>
                      }
                      description={
                        editingComment?.id === comment.id ? (
                          <TextArea
                            value={editingComment.value}
                            onChange={(e) =>
                              setEditingComment((prev) =>
                                prev ? { ...prev, value: e.target.value } : prev
                              )
                            }
                            rows={3}
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

            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                rows={3}
                placeholder="Add a new comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                type="primary"
                onClick={handleAddComment}
                loading={commentSubmitting}
                icon={<CommentOutlined />}
              >
                Add Comment
              </Button>
            </Space>
          </Card>
        </Space>
      ) : (
        <Empty />
      )}
    </Modal>
  );

  return (
    <PageContainer title="Facility Reports" loading={loading}>
      {!houseId ? (
        renderNoHouse()
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card
            title="Report a Facility Issue"
            extra={<PlusOutlined />}
            bordered
          >
            <Alert
              type="info"
              showIcon
              message="Describe the issue you are facing in your assigned house. HR and the landlord will be notified."
              style={{ marginBottom: 16 }}
            />
            <Form layout="vertical" form={form} onFinish={handleCreateReport} requiredMark={false}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please enter the issue title' }]}
              >
                <Input placeholder="e.g. Broken washing machine" />
              </Form.Item>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please describe the issue' }]}
              >
                <TextArea rows={4} placeholder="Provide more detail so HR can help you faster" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submittingReport}
                >
                  Submit Report
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="My Facility Reports">
            {renderReports()}
          </Card>
        </Space>
      )}

      {renderDetailModal()}
    </PageContainer>
  );
};

export default FacilityReportPage;
