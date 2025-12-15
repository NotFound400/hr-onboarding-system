import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Descriptions,
  Card,
  Button,
  Table,
  Tag,
  Space,
  Spin,
  Modal,
  Input,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, CommentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageContainer } from '../../../components/common/PageContainer';
import { getEmployeeById, getActiveApplications } from '../../../services/api';
import type { Employee, Application, ApplicationDocument } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

// Type aliases for better readability
type App = Application;
type Document = ApplicationDocument & { filename?: string; uploadDate?: string; status?: string; comment?: string };

const { TextArea } = Input;

/**
 * HR 员工详情页面
 * 路由: /hr/employees/:id
 * - 展示员工完整 Profile
 * - 展示上传的文档列表（支持 HR 评论）
 * - 展示 Visa 状态
 */
export const EmployeeProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [comment, setComment] = useState('');
  const messageApi = useAntdMessage();

  useEffect(() => {
    if (id) {
      fetchEmployeeDetail(id);
    }
  }, [id]);

  /**
   * 获取员工详细信息
   * Section HR.3.a.i - Must display <10/100> format based on user_id ordering
   */
  const fetchEmployeeDetail = async (employeeId: string) => {
    try {
      setLoading(true);
      
      // 获取所有员工 (for <10/100> navigation)
      const { getAllEmployees } = await import('../../../services/api');
      const allEmps = await getAllEmployees({ forceReal: true });
      // Sort by userID per Section HR.3.a.ii requirement
      const sortedEmps = allEmps.sort((a, b) => (a.userID || 0) - (b.userID || 0));
      setAllEmployees(sortedEmps);

      // 获取员工信息
      const empData = await getEmployeeById(employeeId);
      setEmployee(empData);

      // 获取该员工的 Onboarding Application
      const applications = await getActiveApplications(employeeId);
      if (applications.length > 0) {
        // 取最新的 application
        setApplication(applications[0]);
      }
    } catch (error) {
      messageApi.error('Failed to load employee details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开评论弹窗
   */
  const handleOpenComment = (doc: Document) => {
    setCurrentDocument(doc);
    setComment(doc.comment || '');
    setCommentModalVisible(true);
  };

  /**
   * 提交评论
   */
  const handleSubmitComment = () => {
    if (!currentDocument) return;

    // 在实际项目中，这里应该调用 API 更新文档评论
    messageApi.success('Comment saved successfully');
    console.log('Document:', currentDocument.id, 'Comment:', comment);

    // 更新本地状态
    if (application && application.documents) {
      const updatedDocs = application.documents.map((doc: Document) =>
        doc.id === currentDocument.id ? { ...doc, comment } : doc
      );
      setApplication({ ...application, documents: updatedDocs });
    }

    setCommentModalVisible(false);
    setCurrentDocument(null);
    setComment('');
  };

  /**
   * 下载文档
   */
  const handleDownload = (doc: Document) => {
    messageApi.info(`Downloading: ${doc.filename}`);
    // 实际项目中应该触发文件下载
    console.log('Download document:', doc);
  };

  /**
   * 文档列表表格列定义
   */
  const documentColumns: ColumnsType<Document> = [
    {
      title: 'Document Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'Driver License': 'blue',
          'Work Authorization': 'green',
          'I-20': 'purple',
          'I-983': 'orange',
          'OPT Receipt': 'cyan',
          'OPT EAD': 'geekblue',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: 120,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          Pending: 'orange',
          Approved: 'green',
          Rejected: 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (text: string) => text || <span style={{ color: '#ccc' }}>No comment</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            Download
          </Button>
          <Button
            type="link"
            icon={<CommentOutlined />}
            onClick={() => handleOpenComment(record)}
          >
            Comment
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (!employee) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <h3>Employee not found</h3>
          <Button type="primary" onClick={() => navigate('/hr/employees')}>
            Back to Employee List
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Section HR.3.a.i - Calculate <current/total> display based on user_id ordering
  const currentIndex = allEmployees.findIndex(emp => emp.id === id);
  const totalEmployees = allEmployees.length;
  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigate(`/hr/employees/${allEmployees[currentIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalEmployees - 1) {
      navigate(`/hr/employees/${allEmployees[currentIndex + 1].id}`);
    }
  };

  return (
    <PageContainer>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/hr/employees')}
        >
          Back to Employee List
        </Button>

        {/* Section HR.3.a.i - <10/100> Navigation Display */}
        {totalEmployees > 0 && (
          <Space>
            <Button 
              onClick={handlePrevious} 
              disabled={currentIndex <= 0}
            >
              Previous
            </Button>
            <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>
              &lt;{displayIndex}/{totalEmployees}&gt;
            </span>
            <Button 
              onClick={handleNext} 
              disabled={currentIndex >= totalEmployees - 1}
            >
              Next
            </Button>
          </Space>
        )}
      </div>

      <h2 style={{ marginBottom: 24 }}>
        {employee.firstName} {employee.lastName} {employee.preferredName && `(${employee.preferredName})`}
      </h2>

      {/* 基本信息 */}
      <Card title="Personal Information" style={{ marginBottom: 24 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Employee ID">{employee.id}</Descriptions.Item>
          <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
          <Descriptions.Item label="Cell Phone">{employee.cellPhone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Alternate Phone">{employee.alternatePhone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Gender">{employee.gender || '-'}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {employee.DOB ? dayjs(employee.DOB).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="SSN">
            {employee.SSN ? `***-**-${employee.SSN.slice(-4)}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Driver License">{employee.driverLicense || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 地址信息 */}
      {employee.address && employee.address.length > 0 && (() => {
        const primaryAddress = employee.address.find(addr => addr.type === 'Primary') || employee.address[0];
        return (
          <Card title="Address" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Address Line 1" span={2}>
                {primaryAddress.addressLine1 || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Address Line 2" span={2}>
                {primaryAddress.addressLine2 || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="City">{primaryAddress.city || '-'}</Descriptions.Item>
              <Descriptions.Item label="State">{primaryAddress.state || '-'}</Descriptions.Item>
              <Descriptions.Item label="Zip Code">{primaryAddress.zipCode || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        );
      })()}

      {/* 签证状态 */}
      <Card title="Visa Status" style={{ marginBottom: 24 }}>
        {(() => {
          const activeVisa = employee.visaStatus && employee.visaStatus.length > 0 
            ? employee.visaStatus.find(v => v.activeFlag === 'Yes') || employee.visaStatus[0]
            : null;
          // Check if visa type suggests citizenship
          const isCitizen = !activeVisa || activeVisa.visaType === 'Other';
          
          return (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Citizenship Status">
                {isCitizen ? (
                  <Tag color="green">U.S. Citizen or Green Card Holder</Tag>
                ) : (
                  <Tag color="blue">Work Authorization Holder</Tag>
                )}
              </Descriptions.Item>
              {!isCitizen && activeVisa && (
                <>
                  <Descriptions.Item label="Visa Type">
                    {activeVisa.visaType || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Start Date">
                    {activeVisa.startDate
                      ? dayjs(activeVisa.startDate).format('YYYY-MM-DD')
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Date">
                    {activeVisa.endDate
                      ? dayjs(activeVisa.endDate).format('YYYY-MM-DD')
                      : '-'}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          );
        })()}

      </Card>

      {/* 文档列表 */}
      {application && application.documents && application.documents.length > 0 && (
        <Card title="Uploaded Documents" style={{ marginBottom: 24 }}>
          <Table
            columns={documentColumns}
            dataSource={application.documents}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Card>
      )}

      {/* 紧急联系人 */}
      {employee.contact && employee.contact.length > 0 && (() => {
        const emergencyContact = employee.contact.find(c => c.type === 'Emergency');
        return emergencyContact && (
          <Card title="Emergency Contact" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Name">
                {emergencyContact.firstName} {emergencyContact.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Relationship">
                {emergencyContact.relationship || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">{emergencyContact.cellPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{emergencyContact.email || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        );
      })()}

      {/* HR 评论弹窗 */}
      <Modal
        title={`Add Comment - ${currentDocument?.type || ''}`}
        open={commentModalVisible}
        onOk={handleSubmitComment}
        onCancel={() => {
          setCommentModalVisible(false);
          setCurrentDocument(null);
          setComment('');
        }}
        okText="Save Comment"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <p><strong>Filename:</strong> {currentDocument?.filename}</p>
          <p>
            <strong>Status:</strong>{' '}
            <Tag color={currentDocument?.status === 'Approved' ? 'green' : 'orange'}>
              {currentDocument?.status}
            </Tag>
          </p>
        </div>
        <TextArea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your comment here..."
        />
      </Modal>
    </PageContainer>
  );
};
