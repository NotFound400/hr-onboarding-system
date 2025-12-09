/**
 * Visa Management Page
 * HR 签证管理页面
 * 
 * Features:
 * - 显示 OPT 和 VISA 类型的申请列表
 * - Approve / Reject 操作
 * - 审批后发送邮件通知
 */

import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Input, message, Tag } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '../../../components/common/PageContainer';
import { getAllApplications, updateApplicationStatus } from '../../../services/api';
import type { ApplicationDetail, ApplicationStatus } from '../../../types';

const { TextArea } = Input;

/**
 * VisaManagementPage Component
 */
const VisaManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 获取签证申请列表
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getAllApplications();
      
      // 过滤出 OPT 类型的申请（签证相关）
      const visaApplications = data.filter(
        app => app.type === 'OPT'
      );
      
      setApplications(visaApplications);
    } catch (error: any) {
      message.error(error.message || 'Failed to load visa applications');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 批准申请
   */
  const handleApprove = async (application: ApplicationDetail) => {
    try {
      setSubmitting(true);
      await updateApplicationStatus({
        id: application.id,
        status: 'Approved' as ApplicationStatus,
      });
      
      message.success(`Application approved. Email notification sent to ${application.employeeEmail}`);
      fetchApplications(); // 刷新列表
    } catch (error: any) {
      message.error(error.message || 'Failed to approve application');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 打开拒绝原因 Modal
   */
  const handleRejectClick = (application: ApplicationDetail) => {
    setSelectedApplication(application);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  /**
   * 确认拒绝申请
   */
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      message.warning('Please provide a rejection reason');
      return;
    }

    if (!selectedApplication) return;

    try {
      setSubmitting(true);
      await updateApplicationStatus({
        id: selectedApplication.id,
        status: 'Rejected' as ApplicationStatus,
        comment: rejectReason,
      });
      
      message.success(`Application rejected. Email notification sent to ${selectedApplication.employeeEmail}`);
      setRejectModalVisible(false);
      setSelectedApplication(null);
      setRejectReason('');
      fetchApplications(); // 刷新列表
    } catch (error: any) {
      message.error(error.message || 'Failed to reject application');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Section HR.4 - Visa Status Management Table Columns
   * Required fields: Name, Work Authorization, Expiration Date, Days Left, Active STEM OPT Application and Actions
   */
  const columns: ColumnsType<ApplicationDetail> = [
    {
      title: 'Name (Legal Full Name)',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: 'Work Authorization',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'OPT', value: 'OPT' },
        { text: 'F1', value: 'F1' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type: string) => (
        <Tag color="blue">
          {type}
        </Tag>
      ),
    },
    {
      title: 'Expiration Date',
      key: 'expirationDate',
      render: (_, record) => {
        // Mock - in real app, get from employee's visa status
        return record.createDate ? new Date(new Date(record.createDate).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A';
      },
    },
    {
      title: 'Days Left',
      key: 'daysLeft',
      render: (_, record) => {
        // Mock calculation
        const expiryDate = new Date(new Date(record.createDate).getTime() + 365 * 24 * 60 * 60 * 1000);
        const daysLeft = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const color = daysLeft < 30 ? 'red' : daysLeft < 90 ? 'orange' : 'green';
        return <span style={{ color }}><strong>{daysLeft}</strong> days</span>;
      },
    },
    {
      title: 'Active STEM OPT Application',
      key: 'activeApplication',
      render: (_, record) => {
        if (record.status === 'Pending') {
          return <Tag color="warning">Pending Review</Tag>;
        } else if (record.status === 'Approved') {
          return <Tag color="success">Approved</Tag>;
        } else if (record.status === 'Rejected') {
          return <Tag color="error">Rejected</Tag>;
        }
        return <Tag>NONE</Tag>;
      },
    },
    {
      title: 'Actions (Approve, Reject, NONE)',
      key: 'action',
      width: 200,
      render: (_, record) => {
        if (record.status === 'Approved') {
          return <Tag color="success">Already Approved</Tag>;
        }
        if (record.status === 'Rejected') {
          return <Tag color="error">Already Rejected</Tag>;
        }
        if (record.status !== 'Pending') {
          return <Tag>NONE</Tag>;
        }

        // Section HR.4.b.v - Approve/Reject actions with optional comment
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record)}
              loading={submitting}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleRejectClick(record)}
              loading={submitting}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Document Received',
      key: 'documents',
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => {
            message.info(`Section HR.4.b.vi: HR should be able to access all past documents submitted by ${record.employeeName}`);
            // Should show document list modal or navigate to document view
          }}
        >
          View Docs →
        </Button>
      ),
    },
  ];

  return (
    <PageContainer title="Visa Management" loading={loading}>
      {/* 签证申请列表表格 */}
      <Table
        columns={columns}
        dataSource={applications}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} applications`,
        }}
        locale={{
          emptyText: 'No visa applications found',
        }}
      />

      {/* 拒绝原因 Modal */}
      <Modal
        title="Reject Application"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedApplication(null);
          setRejectReason('');
        }}
        confirmLoading={submitting}
        okText="Confirm Reject"
        okButtonProps={{ danger: true }}
      >
        <p style={{ marginBottom: 8 }}>
          <strong>Employee:</strong> {selectedApplication?.employeeName}
        </p>
        <p style={{ marginBottom: 16 }}>
          <strong>Type:</strong> {selectedApplication?.type}
        </p>
        <TextArea
          placeholder="Please provide a reason for rejection (required)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          maxLength={500}
          showCount
        />
      </Modal>
    </PageContainer>
  );
};

export { VisaManagementPage };
