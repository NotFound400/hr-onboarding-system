import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, List, Typography, Spin, Button, Tag, Space } from 'antd';
import { PageContainer } from '../../../components/common/PageContainer';
import {
  getEmployeeById,
  getApplicationById,
  getDocumentsByApplicationId,
  downloadDocument,
} from '../../../services/api';
import type { Employee, Application, ApplicationDocument } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const { Text } = Typography;

const inferMimeType = (path?: string): string => {
  if (!path) return 'application/octet-stream';
  const ext = path.split('.').pop()?.split('?')[0]?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
};

const ApplicationReviewSummaryPage: React.FC = () => {
  const { employeeId, applicationId } = useParams<{ employeeId: string; applicationId: string }>();
  const navigate = useNavigate();
  const messageApi = useAntdMessage();

  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId || !applicationId) return;
      try {
        setLoading(true);
        const [employeeData, applicationData, documentsData] = await Promise.all([
          getEmployeeById(employeeId),
          getApplicationById(Number(applicationId)),
          getDocumentsByApplicationId(Number(applicationId)),
        ]);
        setEmployee(employeeData);
        setApplication(applicationData);
        setDocuments(documentsData);
      } catch (error: any) {
        messageApi.error(error.message || 'Failed to load application review data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, applicationId, messageApi]);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (!employee || !application) {
    return (
      <PageContainer>
        <Card>
          <Text type="danger">Failed to load review information.</Text>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => navigate('/hr/home')}>Back to HR Home</Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Application Review">
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate(-1)}>← Back</Button>
      </div>

      <Card title="Employee Information" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Full Name">
            {employee.firstName} {employee.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Preferred Name">
            {employee.preferredName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
          <Descriptions.Item label="Cell Phone">{employee.cellPhone}</Descriptions.Item>
          <Descriptions.Item label="SSN">{employee.SSN || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Gender">{employee.gender}</Descriptions.Item>
          <Descriptions.Item label="Start Date">{employee.startDate || 'N/A'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Application Details" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Application ID">{application.id}</Descriptions.Item>
          <Descriptions.Item label="Type">{application.applicationType}</Descriptions.Item>
          <Descriptions.Item label="Status">{application.status}</Descriptions.Item>
          <Descriptions.Item label="Created">
            {application.createDate?.replace('T', ' ') || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {application.lastModificationDate?.replace('T', ' ') || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Comment" span={2}>
            {application.comment || '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Submitted Documents">
        {documents.length === 0 ? (
          <Text>No documents uploaded.</Text>
        ) : (
          <List
            dataSource={documents}
            renderItem={(doc) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <span>
                      {doc.title}{' '}
                      {doc.isRequired && (
                        <Tag color="red">Required</Tag>
                      )}
                    </span>
                  }
                  description={
                    <>
                      <div>Type: {doc.type}</div>
                      <div>Description: {doc.description || 'N/A'}</div>
                      <div>
                        File:{' '}
                        <Space size="small">
                          <Button
                            type="link"
                          onClick={async () => {
                            try {
                              const blob = await downloadDocument(doc.id);
                              const mimeType = inferMimeType(doc.path);
                              const previewBlob = new Blob([blob], { type: mimeType });
                              const url = URL.createObjectURL(previewBlob);
                              window.open(url, '_blank');
                              setTimeout(() => URL.revokeObjectURL(url), 2000);
                            } catch (error: any) {
                              messageApi.error(
                                error.message || 'Failed to preview document'
                              );
                            }
                          }}
                        >
                          Preview
                        </Button>
                          <Button
                            type="link"
                            onClick={async () => {
                              try {
                                const blob = await downloadDocument(doc.id);
                                const url = URL.createObjectURL(blob);
                                const extension =
                                  doc.path?.split('.').pop()?.split('?')[0] || 'pdf';
                                const safeTitle =
                                  doc.title?.replace(/\s+/g, '-') || 'document';
                                const filename = `${safeTitle}-${doc.id}.${extension}`;
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                setTimeout(() => URL.revokeObjectURL(url), 1000);
                              } catch (error: any) {
                                messageApi.error(
                                  error.message || 'Failed to download document'
                                );
                              }
                            }}
                          >
                            Download
                          </Button>
                        </Space>
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default ApplicationReviewSummaryPage;
