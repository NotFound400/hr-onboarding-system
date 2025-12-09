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
   * 获取状态标签颜色
   */
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ApplicationDetail> = [
    {
      title: 'Employee Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: 'Email',
      dataIndex: 'employeeEmail',
      key: 'employeeEmail',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'OPT', value: 'OPT' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type: string) => (
        <Tag color="blue">
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ApplicationStatus) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Create Date',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModificationDate',
      key: 'lastModificationDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.lastModificationDate).getTime() - new Date(b.lastModificationDate).getTime(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        if (record.status !== 'Pending') {
          return <span style={{ color: '#999' }}>-</span>;
        }

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
