/**
 * Visa Status Management Page
 * Employee Visa Document Upload and Tracking
 * 
 * Specification:
 * - Vertical layout with upload sections for I-983, I-20, OPT Receipt, STEM EAD
 * - Fetch documents and application status on load
 * - Enable/disable upload boxes based on applicationType
 * - Upload new documents via POST, update existing via PUT
 */

import { useState, useEffect } from 'react';
import { Card, Upload, Button, Space, Alert, Spin, Typography, Divider, Modal, Image } from 'antd';
import { UploadOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { PageContainer } from '../../../components/common/PageContainer';
import {
  getApplicationById,
  getDocumentsByApplicationId,
  uploadDocument,
  updateDocument,
  updateApplication,
  getActiveApplications,
  downloadDocument,
} from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import type { Application, ApplicationDocument } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const { Title, Text } = Typography;

// Visa document types - aligned with HR management page
const VisaDocumentType = {
  OPT: 'OPT',
  I983: 'I983',
  I20: 'I20',
  OPTREC: 'OPTREC',
  STEMEAD: 'STEMEAD',
  Terminate: 'Terminate'
} as const;

// Document types in specific order
const DOCUMENT_TYPES = [
  { type: VisaDocumentType.I983, title: 'I-983', description: 'Form I-983 for OPT STEM extension' },
  { type: VisaDocumentType.I20, title: 'I-20', description: 'Certificate of Eligibility for Nonimmigrant Student Status' },
  { type: VisaDocumentType.OPTREC, title: 'OPT Receipt', description: 'OPT STEM application receipt notice' },
  { type: VisaDocumentType.STEMEAD, title: 'STEM EAD', description: 'Employment Authorization Document for STEM OPT' },
] as const;

interface DocumentSlot {
  type: string;
  title: string;
  description: string;
  existingDoc: ApplicationDocument | null;
  enabled: boolean;
}

/**
 * VisaStatusPage Component
 */
const VisaStatusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [documentSlots, setDocumentSlots] = useState<DocumentSlot[]>([]);

  const employeeId = useAppSelector((state) => state.auth.employeeId);
  const messageApi = useAntdMessage();

  useEffect(() => {
    initializeVisaPage();
  }, [employeeId]);

  useEffect(() => {
    if (application) {
      updateDocumentSlots(application.comment, documents);
    }
  }, [application, documents]);

  /**
   * Initialize page: fetch application and documents
   */
  const initializeVisaPage = async () => {
    if (!employeeId) {
      messageApi.error('Employee ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch active applications for this employee
      const applications = await getActiveApplications(employeeId);
      
      // Find the active OPT application
      const optApplication = applications.find(
        app => app.applicationType === 'OPT' && app.status !== 'Rejected'
      );
      
      if (!optApplication) {
        messageApi.warning('No active OPT application found. Please contact HR.');
        setLoading(false);
        return;
      }
      
      // Fetch application details
      const appData = await getApplicationById(optApplication.id);
      setApplication(appData);

      // Fetch documents for this application
      const docsData = await getDocumentsByApplicationId(optApplication.id);
      setDocuments(docsData);

    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load visa information');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update document slots based on comment (workflow tracking field)
   * Rules:
   * - If comment matches a document type, enable that specific box
   * - If comment is 'Terminate', disable all boxes
   * - If comment is not in VisaDocumentType values (except Terminate), enable I983 box
   */
  const updateDocumentSlots = (comment: string | null, docs: ApplicationDocument[]) => {
    const visaDocumentValues = Object.values(VisaDocumentType);
    
    const slots: DocumentSlot[] = DOCUMENT_TYPES.map((docType) => {
      const existingDoc = docs.find((d) => d.type === docType.type) || null;
      
      let enabled = false;
      if (comment === VisaDocumentType.Terminate) {
        // Terminate: disable all
        enabled = false;
      } else if (comment && visaDocumentValues.includes(comment as any)) {
        // Comment matches a specific visa document type: enable that box
        enabled = comment === docType.type;
      } else {
        // Comment is not in VisaDocumentType (or null/empty): enable I983 by default
        enabled = docType.type === VisaDocumentType.I983;
      }

      return {
        type: docType.type,
        title: docType.title,
        description: docType.description,
        existingDoc,
        enabled,
      };
    });

    setDocumentSlots(slots);
  };

  /**
   * Handle file upload/update
   */
  const handleFileUpload = async (slot: DocumentSlot, file: File) => {
    if (!application) {
      messageApi.error('Application not found');
      return false;
    }

    try {
      setUploading(slot.type);

      const metadata = {
        applicationId: application.id,
        type: slot.type,
        title: slot.type,
        description: 'Pending',
      };

      if (slot.existingDoc) {
        // UPDATE existing document
        await updateDocument(slot.existingDoc.id, {
          file,
          metadata,
        });
        messageApi.success(`${slot.type} updated successfully`);
      } else {
        // CREATE new document
        await uploadDocument({
          file,
          metadata,
        });
        messageApi.success(`${slot.type} uploaded successfully`);
      }

      // Update application comment to the document type (workflow tracking)
      await updateApplication(application.id, {
        comment: slot.type,
      });

      // Refresh documents and application
      const updatedDocs = await getDocumentsByApplicationId(application.id);
      setDocuments(updatedDocs);
      
      const updatedApp = await getApplicationById(application.id);
      setApplication(updatedApp);

      return true;
    } catch (error: any) {
      messageApi.error(error.message || `Failed to upload ${slot.type}`);
      return false;
    } finally {
      setUploading(null);
    }
  };

  /**
   * Handle document preview
   * Mimics ApplicationReviewDetailPage pattern: download blob and show in Modal with Image
   */
  const handlePreview = async (doc: ApplicationDocument) => {
    if (!doc.id) {
      messageApi.error('Document ID not available');
      return;
    }
    
    try {
      // Download document as blob
      const blob = await downloadDocument(doc.id);
      
      // Create object URL from blob
      const documentUrl = URL.createObjectURL(blob);
      
      // Show in Modal with Image component (same as ApplicationReviewDetailPage)
      Modal.info({
        title: `Document Preview: ${doc.title || doc.type}`,
        width: 800,
        content: (
          <div style={{ marginTop: 16 }}>
            <Image
              src={documentUrl}
              alt={doc.title || doc.type}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              style={{ maxWidth: '100%' }}
            />
          </div>
        ),
        onOk: () => {
          // Cleanup URL when modal is closed
          URL.revokeObjectURL(documentUrl);
        },
        onCancel: () => {
          // Cleanup URL when modal is closed
          URL.revokeObjectURL(documentUrl);
        },
      });
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to preview document');
    }
  };

  /**
   * Custom upload handler
   */
  const createUploadProps = (slot: DocumentSlot): UploadProps => ({
    beforeUpload: (file) => {
      handleFileUpload(slot, file);
      return false; // Prevent automatic upload
    },
    showUploadList: false,
    disabled: !slot.enabled || uploading === slot.type,
    accept: '.pdf,.jpg,.jpeg,.png',
  });

  /**
   * Render document upload section
   */
  const renderDocumentSection = (slot: DocumentSlot) => (
    <Card
      key={slot.type}
      size="small"
      style={{
        marginBottom: 16,
        borderLeft: slot.enabled ? '4px solid #1890ff' : '4px solid #d9d9d9',
        opacity: slot.enabled ? 1 : 0.6,
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <FileTextOutlined style={{ fontSize: 20, color: slot.enabled ? '#1890ff' : '#999' }} />
            <div>
              <Text strong style={{ fontSize: 16 }}>
                {slot.title}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {slot.description}
              </Text>
            </div>
          </Space>

          <Space>
            {slot.existingDoc && (
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text type="success">Uploaded</Text>
              </Space>
            )}
            {!slot.enabled && (
              <Space>
                <CloseCircleOutlined style={{ color: '#999' }} />
                <Text type="secondary">Not Available</Text>
              </Space>
            )}
          </Space>
        </Space>

        <Space>
          <Upload {...createUploadProps(slot)}>
            <Button
              icon={<UploadOutlined />}
              loading={uploading === slot.type}
              disabled={!slot.enabled}
              type={slot.enabled ? 'primary' : 'default'}
            >
              {slot.existingDoc ? 'Update Document' : 'Upload Document'}
            </Button>
          </Upload>

          {slot.existingDoc && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => handlePreview(slot.existingDoc!)}
            >
              Preview
            </Button>
          )}
        </Space>

        {slot.existingDoc && (
          <Alert
            message={`Current file: ${slot.existingDoc.title}`}
            description={`Status: ${slot.existingDoc.description || 'Pending'}`}
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        )}
      </Space>
    </Card>
  );

  if (loading) {
    return (
      <PageContainer title="Visa Status Management">
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading visa information...</p>
        </div>
      </PageContainer>
    );
  }

  if (!application) {
    return (
      <PageContainer title="Visa Status Management">
        <Alert
          message="No Active OPT Application"
          description="You don't have an active OPT application. Please contact HR for assistance."
          type="warning"
          showIcon
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Visa Status Management">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Application Status Card */}
        <Card title="Application Status" extra={<FileTextOutlined />}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Text strong>Application Type:</Text>
              <Text>{application.applicationType || 'N/A'}</Text>
            </Space>
            <Space>
              <Text strong>Status:</Text>
              <Text>{application.status}</Text>
            </Space>
            <Space>
              <Text strong>Current Workflow Step:</Text>
              <Text>{application.comment || 'Not Started'}</Text>
            </Space>
          </Space>
        </Card>

        {/* Instructions */}
        <Alert
          message="Document Upload Instructions"
          description="Upload your visa documents in the order shown below. Only enabled sections can be uploaded based on your current application status."
          type="info"
          showIcon
          closable
        />

        {/* Document Upload Sections */}
        <Card title="Required Documents">
          {documentSlots.map(renderDocumentSection)}
        </Card>
      </Space>
    </PageContainer>
  );
};

export default VisaStatusPage;
