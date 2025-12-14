import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Table, Tag, Select, Modal, Input } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '../../../components/common/PageContainer';
import {
  getApplicationsWithEmployeesByStatus,
  approveApplication,
  rejectApplication,
} from '../../../services/api';
import type { ApplicationStatus, ApplicationWithEmployeeInfo } from '../../../types';
import { ApplicationStatus as ApplicationStatusEnum } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * HR Home Page - Section HR.2
 * 必须包含: Application Tracking Table (HR Section 2.a.ii)
 */
export const HRHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [applications, setApplications] = useState<ApplicationWithEmployeeInfo[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(ApplicationStatusEnum.PENDING);
  const [rejectModalState, setRejectModalState] = useState<{
    visible: boolean;
    applicationId: number | null;
    comment: string;
  }>({
    visible: false,
    applicationId: null,
    comment: '',
  });
  const messageApi = useAntdMessage();

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  /**
   * Section HR.2.a.ii - Application Tracking Table
   * "if any action needs to be taken to update an employee's visa status or onboarding process"
   */
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const mergedData = await getApplicationsWithEmployeesByStatus(selectedStatus);
      const filteredData = selectedStatus === ApplicationStatusEnum.PENDING
        ? mergedData
        : mergedData.filter((app) => Boolean(app.employee?.firstName));

      setApplications(filteredData);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (value: ApplicationStatus) => {
    setSelectedStatus(value);
  };

  const handleApprove = async (applicationId: number) => {
    try {
      setActionLoadingId(applicationId);
      await approveApplication(applicationId, { comment: 'Approved via HR Dashboard' });
      messageApi.success('Application approved');
      fetchApplications();
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to approve application');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = (applicationId: number) => {
    setRejectModalState({
      visible: true,
      applicationId,
      comment: '',
    });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalState.applicationId) return;
    try {
      setActionLoadingId(rejectModalState.applicationId);
      await rejectApplication(rejectModalState.applicationId, {
        comment: rejectModalState.comment || 'Rejected via HR Dashboard',
      });
      messageApi.success('Application rejected');
      fetchApplications();
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to reject application');
    } finally {
      setActionLoadingId(null);
      setRejectModalState({
        visible: false,
        applicationId: null,
        comment: '',
      });
    }
  };

  const handleRejectCancel = () => {
    setRejectModalState({
      visible: false,
      applicationId: null,
      comment: '',
    });
  };

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>HR Dashboard</Title>
        <Text type="secondary">Welcome to HR Onboarding System</Text>
      </div>

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

      {/* Section HR.2.a.ii - Application Tracking Table (必需功能) */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Application Tracking</span>
            <Space>
              <Text strong>Status:</Text>
              <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                style={{ width: 160 }}
                options={[
                  { label: 'Pending', value: ApplicationStatusEnum.PENDING },
                  { label: 'Approved', value: ApplicationStatusEnum.APPROVED },
                  { label: 'Rejected', value: ApplicationStatusEnum.REJECTED },
                ]}
              />
            </Space>
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          This table shows all applications that require HR action (Onboarding, Visa Status updates)
        </Text>
        <Table
          columns={[
            {
              title: 'Name (Legal Full Name)',
              dataIndex: 'employeeName',
              key: 'employeeName',
              render: (_: string, record: ApplicationWithEmployeeInfo) => (
                <Text strong>{record.employeeName || 'N/A'}</Text>
              ),
            },
            {
              title: 'Email',
              dataIndex: 'employeeEmail',
              key: 'employeeEmail',
              render: (email: string | undefined) => email || 'N/A',
            },
            {
              title: 'Type of Application',
              dataIndex: 'applicationType',
              key: 'applicationType',
              filters: [
                { text: 'Onboarding', value: 'Onboarding' },
                { text: 'OPT', value: 'OPT' },
              ],
              onFilter: (value, record) => record.applicationType === value,
              render: (applicationType: string) => (
                <Tag color={applicationType === 'Onboarding' ? 'blue' : 'green'}>
                  {applicationType}
                </Tag>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status: ApplicationStatus, record: ApplicationWithEmployeeInfo) => {
                const effectiveStatus = record.employee?.firstName ? status : 'Open';
                const colorMap: Record<ApplicationStatus | 'Open', string> = {
                  Open: 'default',
                  Pending: 'warning',
                  Approved: 'success',
                  Rejected: 'error',
                };
                return <Tag color={colorMap[effectiveStatus]}>{effectiveStatus}</Tag>;
              },
            },
            {
              title: 'Last Modification Date',
              dataIndex: 'lastModificationDate',
              key: 'lastModificationDate',
              render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
              sorter: (a, b) => dayjs(a.lastModificationDate).unix() - dayjs(b.lastModificationDate).unix(),
            },
            {
              title: 'Action',
              key: 'action',
              render: (_, record) => {
                const effectiveStatus = record.employee?.firstName ? record.status : 'Open';
                if (effectiveStatus === 'Open') {
                  return <Tag color="default">Awaiting Employee Info</Tag>;
                }
                const targetEmployeeId = record.employee?.id || record.employeeId;
                const isPending = record.status === ApplicationStatusEnum.PENDING;
                return (
                  <Space>
                    <Button
                      type="link"
                      onClick={() => {
                        if (targetEmployeeId) {
                          navigate(`/hr/applications/${targetEmployeeId}/${record.id}`);
                        }
                      }}
                    >
                      Review →
                    </Button>
                    {isPending && (
                      <Space size="small">
                        <Button
                          type="primary"
                          size="small"
                          loading={actionLoadingId === record.id}
                          onClick={() => handleApprove(record.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          danger
                          size="small"
                          loading={actionLoadingId === record.id}
                          onClick={() => handleRejectRequest(record.id)}
                        >
                          Reject
                        </Button>
                      </Space>
                    )}
                  </Space>
                );
              },
            },
          ]}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} pending applications`,
          }}
          locale={{
            emptyText: 'No pending applications requiring action',
          }}
        />
      </Card>
      <Modal
        title="Reject Application"
        open={rejectModalState.visible}
        onOk={handleRejectConfirm}
        onCancel={handleRejectCancel}
        okButtonProps={{ danger: true }}
        confirmLoading={actionLoadingId === rejectModalState.applicationId}
        okText="Confirm Reject"
      >
        <Input.TextArea
          rows={4}
          placeholder="Provide rejection reason"
          value={rejectModalState.comment}
          onChange={(e) =>
            setRejectModalState((prev) => ({ ...prev, comment: e.target.value }))
          }
        />
      </Modal>
    </PageContainer>
  );
};
