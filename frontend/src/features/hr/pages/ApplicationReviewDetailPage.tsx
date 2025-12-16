import { useState, useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Modal, 
  Input, 
  Spin, 
  Tag, 
  Form,
  Image,
  Alert,
  Divider
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  FileTextOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../../components/common/PageContainer';
import { getApplicationById, getEmployeeById, approveApplication, rejectApplication } from '../../../services/api';
import type { Application, Employee } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const { TextArea } = Input;

interface DocumentCommentProps {
  documentType: string;
  documentUrl?: string;
  initialComment?: string;
  onCommentChange: (comment: string) => void;
}

const DocumentComment: React.FC<DocumentCommentProps> = ({
  documentType,
  documentUrl,
  initialComment,
  onCommentChange,
}) => {
  const [comment, setComment] = useState(initialComment || '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
    onCommentChange(value);
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <FileTextOutlined />
          {documentType}
        </Space>
      }
      extra={
        documentUrl && (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.info({
                title: `Document Preview: ${documentType}`,
                width: 800,
                content: (
                  <div style={{ marginTop: 16 }}>
                    <Image
                      src={documentUrl}
                      alt={documentType}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                ),
              });
            }}
          >
            Preview
          </Button>
        )
      }
    >
      {documentUrl ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ fontSize: 12, color: '#666' }}>
            Document URL: <code>{documentUrl}</code>
          </div>
          <TextArea
            rows={3}
            placeholder="Add HR comment for this document..."
            value={comment}
            onChange={handleChange}
          />
        </Space>
      ) : (
        <Alert
          message="Document not uploaded"
          type="warning"
          showIcon
          style={{ marginBottom: 8 }}
        />
      )}
    </Card>
  );
};

const ApplicationReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messageApi = useAntdMessage();
  
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  
  const [application, setApplication] = useState<Application | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchApplicationDetail();
    }
  }, [id]);

  const fetchApplicationDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const appData = await getApplicationById(parseInt(id));
      setApplication(appData);
      
      const empData = await getEmployeeById(appData.employeeId);
      setEmployee(empData);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Approve Application',
      content: `Are you sure you want to approve ${employee?.firstName} ${employee?.lastName}'s onboarding application?`,
      okText: 'Yes, Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setApproving(true);
          
          await approveApplication(parseInt(id!), {
            comment: 'Application approved. Welcome to the team!',
          });
          
        messageApi.success('Application approved successfully');
          
          navigate('/hr/hiring');
        } catch (error: any) {
        messageApi.error(error.message || 'Failed to approve application');
        } finally {
          setApproving(false);
        }
      },
    });
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      messageApi.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setRejecting(true);
      
      await rejectApplication(parseInt(id!), {
        comment: rejectReason,
      });
      
      messageApi.success('Application rejected');
      
      setRejectModalVisible(false);
      navigate('/hr/hiring');
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to reject application');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Application Review">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (!application || !employee) {
    return (
      <PageContainer title="Application Review">
        <Alert
          message="Application not found"
          type="error"
          showIcon
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Review Application - ${employee.firstName} ${employee.lastName}`}>
      <Space style={{ marginBottom: 16, justifyContent: 'flex-end', width: '100%' }}>
        <Button onClick={() => navigate('/hr/hiring')}>
          Back to List
        </Button>
        <Button
          type="primary"
          danger
          icon={<CloseCircleOutlined />}
          onClick={handleReject}
          loading={rejecting}
        >
          Reject
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleApprove}
          loading={approving}
        >
          Approve
        </Button>
      </Space>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Application Information">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Application ID">{application.id}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={application.status === 'Pending' ? 'warning' : 'default'}>
                {application.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Create Date">
              {new Date(application.createDate).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Modified">
              {new Date(application.lastModificationDate).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Personal Information" extra={<Tag color="blue">Read-Only</Tag>}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Legal Name">
              <strong>{employee.firstName} {employee.middleName} {employee.lastName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Preferred Name">
              {employee.preferredName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
            <Descriptions.Item label="Cell Phone">{employee.cellPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="SSN">{employee.SSN || '-'}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {employee.DOB || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">{employee.gender || '-'}</Descriptions.Item>
            <Descriptions.Item label="Work Authorization">
              {employee.visaStatus?.find(v => v.activeFlag === 'Yes')?.visaType || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Address Information" extra={<Tag color="blue">Read-Only</Tag>}>
          <Descriptions column={1} bordered>
            {employee.address?.map((addr, idx) => (
              <Descriptions.Item key={idx} label={`Address ${idx + 1}`}>
                {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}
                <br />
                {addr.city}, {addr.state} {addr.zipCode}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>

        {/* Driver License Information */}
        {employee.driverLicense && (
          <Card title="Driver License" extra={<Tag color="blue">Read-Only</Tag>}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="License Number">
                {employee.driverLicense}
              </Descriptions.Item>
              <Descriptions.Item label="Expiration Date">
                {employee.driverLicenseExpiration 
                  ? new Date(employee.driverLicenseExpiration).toLocaleDateString()
                  : '-'
                }
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Reference Contact */}
        {employee.contact && employee.contact.some(c => c.type === 'Reference') && (
          <Card title="Reference Contact" extra={<Tag color="blue">Read-Only</Tag>}>
            {employee.contact
              .filter(c => c.type === 'Reference')
              .map((contact, idx) => (
                <Descriptions key={idx} column={2} bordered style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Name">
                    {contact.firstName} {contact.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Relationship">
                    {contact.relationship}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">{contact.cellPhone}</Descriptions.Item>
                  <Descriptions.Item label="Email">{contact.email}</Descriptions.Item>
                </Descriptions>
              ))}
          </Card>
        )}

        {/* Emergency Contact */}
        {employee.contact && employee.contact.length > 0 && (
          <Card title="Emergency Contacts" extra={<Tag color="blue">Read-Only</Tag>}>
            {employee.contact
              .filter(c => c.type === 'Emergency')
              .map((contact, idx) => (
                <Descriptions key={idx} column={2} bordered style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Name">
                    {contact.firstName} {contact.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Relationship">
                    {contact.relationship}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">{contact.cellPhone}</Descriptions.Item>
                  <Descriptions.Item label="Email">{contact.email}</Descriptions.Item>
                </Descriptions>
              ))}
          </Card>
        )}

        <Divider />

        {/* Employment Information */}
        <Card title="Employment Information" extra={<Tag color="blue">Read-Only</Tag>}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Start Date">
              {employee.startDate 
                ? new Date(employee.startDate).toLocaleDateString()
                : '-'
              }
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {employee.endDate 
                ? new Date(employee.endDate).toLocaleDateString()
                : 'Ongoing'
              }
            </Descriptions.Item>
            <Descriptions.Item label="House ID" span={2}>
              {employee.houseID || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {application.comment && (
          <Card title="Previous Comments">
            <Alert
              message="HR Comment"
              description={application.comment}
              type="info"
              showIcon
            />
          </Card>
        )}
      </Space>

      {/* Reject Modal */}
      <Modal
        title="Reject Application"
        open={rejectModalVisible}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Confirm Reject"
        okButtonProps={{ danger: true, loading: rejecting }}
        cancelText="Cancel"
      >
        <Alert
          message="HR Section 5.b: Rejection Reason Required"
          description="You must provide a reason for rejecting this application. The employee will receive this feedback."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Form.Item
            label="Rejection Reason"
            required
            help="Explain what is wrong or which document is missing"
          >
            <TextArea
              rows={4}
              placeholder="Please provide detailed feedback for the employee..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ApplicationReviewDetailPage;
