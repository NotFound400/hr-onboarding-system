import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Typography, Modal, Image } from 'antd';
import { FileTextOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageContainer } from '../../../components/common/PageContainer';
import { useAntdMessage } from '../../../hooks/useAntdMessage';
import {
  getApplicationsWithEmployeesByStatus,
  getDocumentsByApplicationId,
  updateApplication,
  updateDocument,
  downloadDocument,
} from '../../../services/api';
import {
  type ApplicationWithEmployeeInfo,
  type ApplicationDocument,
} from '../../../types';

const { Text, Link } = Typography;

const VisaDocumentType = {
  OPT: 'OPT',
  I983: 'I983',
  I20: 'I20',
  OPTREC: 'OPTREC',
  STEMEAD: 'STEMEAD',
  Terminate: 'Terminate'
} as const;
type VisaDocumentType = typeof VisaDocumentType[keyof typeof VisaDocumentType];

const VISA_STEP_SEQUENCE: VisaDocumentType[] = [
  VisaDocumentType.I983,
  VisaDocumentType.I20,
  VisaDocumentType.OPTREC,
  VisaDocumentType.STEMEAD
];

interface VisaTableRow {
  key: string;
  applicationId: number;
  employeeId: string;
  employeeName: string;
  workAuthorization: string;
  expirationDate: string | null;
  daysLeft: number | null;
  nextStep: VisaDocumentType | 'None';
  currentDocument: ApplicationDocument | null;
  documents: ApplicationDocument[];
  application: ApplicationWithEmployeeInfo;
}

const HRVisaManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<VisaTableRow[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const messageApi = useAntdMessage();

  useEffect(() => {
    loadVisaData();
  }, []);

  const loadVisaData = async () => {
    try {
      setLoading(true);

      const applications = await getApplicationsWithEmployeesByStatus('Approved');

      const rows: VisaTableRow[] = [];
      const last10Applications = applications.slice(0, 10);
      
      for (const app of last10Applications) {
        try {
          const documents = await getDocumentsByApplicationId(app.id);

          const activeVisa = app.employee?.visaStatus?.find(
            visa => visa.activeFlag === 'Yes' || visa.activeFlag === 'No'
          );
          const expirationDate = activeVisa?.endDate || null;
          const daysLeft = expirationDate && dayjs(expirationDate).isValid()
            ? dayjs(expirationDate).diff(dayjs(), 'day')
            : null;

          const isValidVisaType = (type: string): type is VisaDocumentType => 
            VISA_STEP_SEQUENCE.includes(type as VisaDocumentType);
          
          const nextStep = isValidVisaType(app.comment)
            ? app.comment
            : 'None';

          rows.push({
            key: `${app.id}`,
            applicationId: app.id,
            employeeId: app.employeeId,
            employeeName: app.employeeName || 'N/A',
            workAuthorization: activeVisa?.visaType || 'OPT',
            expirationDate,
            daysLeft,
            nextStep,
            currentDocument: null, // Will be set after merge
            documents,
            application: app,
          });
        } catch (docError) {
        }
      }

      rows.forEach(row => {
        if (row.application.comment === VisaDocumentType.OPT || 
            row.application.comment === 'pending' || 
            !row.application.comment) {
          row.application.comment = VisaDocumentType.I983;
          row.nextStep = VisaDocumentType.I983;
        }
      });

      rows.forEach(row => {
        row.currentDocument = row.documents.find(
          doc => doc.type === row.application.comment
        ) || null;
      });

      const filteredRows = rows.filter(row => row.currentDocument !== null);

      setTableData(filteredRows);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load visa management data');
    } finally {
      setLoading(false);
    }
  };

  const getNextApplicationType = (current: VisaDocumentType | 'None'): VisaDocumentType => {
    if (current === 'None') return VisaDocumentType.Terminate;
    
    const currentIndex = VISA_STEP_SEQUENCE.indexOf(current as VisaDocumentType);
    if (currentIndex === -1 || currentIndex === VISA_STEP_SEQUENCE.length - 1) {
      return VisaDocumentType.Terminate;
    }
    
    return VISA_STEP_SEQUENCE[currentIndex + 1];
  };

  const handleApprove = async (record: VisaTableRow) => {
    if (!record.currentDocument) {
      messageApi.warning('No document found for this application');
      return;
    }

    const currentDoc = record.currentDocument;

    Modal.confirm({
      title: 'Approve Document',
      content: `Are you sure you want to approve ${record.nextStep} for ${record.employeeName}?`,
      okText: 'Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setActionLoading(record.applicationId);

          const nextType = getNextApplicationType(record.nextStep);

          await updateApplication(record.applicationId, {
            comment: nextType as any,
          });

          const fileBlob = await downloadDocument(currentDoc.id);
          const file = new File([fileBlob], `${currentDoc.type}.pdf`, {
            type: fileBlob.type,
          });

          await updateDocument(currentDoc.id, {
            file,
            metadata: {
              applicationId: record.applicationId,
              type: currentDoc.type,
              title: currentDoc.type,
              description: 'approved',
            },
          });

          messageApi.success(`${record.nextStep} approved successfully. Email notification sent.`);
          
          await loadVisaData();
        } catch (error: any) {
          messageApi.error(error.message || 'Failed to approve document');
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleReject = async (record: VisaTableRow) => {
    if (!record.currentDocument) {
      messageApi.warning('No document found for this application');
      return;
    }

    const currentDoc = record.currentDocument;

    Modal.confirm({
      title: 'Reject Document',
      content: `Are you sure you want to reject ${record.nextStep} for ${record.employeeName}?`,
      okText: 'Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setActionLoading(record.applicationId);

          const fileBlob = await downloadDocument(currentDoc.id);
          const file = new File([fileBlob], `${currentDoc.type}.pdf`, {
            type: fileBlob.type,
          });

          await updateDocument(currentDoc.id, {
            file,
            metadata: {
              applicationId: record.applicationId,
              type: currentDoc.type,
              title: currentDoc.type,
              description: 'reject',
            },
          });

          messageApi.success(`${record.nextStep} rejected. Email notification sent.`);
          
          await loadVisaData();
        } catch (error: any) {
          messageApi.error(error.message || 'Failed to reject document');
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handlePreview = async (document: ApplicationDocument) => {
    try {
      const blob = await downloadDocument(document.id);
      
      const documentUrl = URL.createObjectURL(blob);
      
      Modal.info({
        title: `Document Preview: ${document.title || document.type}`,
        width: 800,
        content: (
          <div style={{ marginTop: 16 }}>
            <Image
              src={documentUrl}
              alt={document.title || document.type}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              style={{ maxWidth: '100%' }}
            />
          </div>
        ),
        onOk: () => {
          URL.revokeObjectURL(documentUrl);
        },
        onCancel: () => {
          URL.revokeObjectURL(documentUrl);
        },
      });
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to preview document');
    }
  };


  const columns: ColumnsType<VisaTableRow> = [
    {
      title: 'Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
      width: 200,
    },
    {
      title: 'Work Authorization',
      dataIndex: 'workAuthorization',
      key: 'workAuthorization',
      width: 150,
      render: (visaType: string) => (
        <Tag color="blue">{visaType}</Tag>
      ),
    },
    {
      title: 'Expiration Date',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      width: 150,
      render: (date: string | null) => 
        date ? dayjs(date).format('YYYY-MM-DD') : 'N/A',
    },
    {
      title: 'Days Left',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      width: 120,
      sorter: (a, b) => (a.daysLeft || 0) - (b.daysLeft || 0),
      render: (days: number | null) => {
        if (days === null) return <Text type="secondary">N/A</Text>;
        
        const color = days < 30 ? 'red' : days < 90 ? 'orange' : 'green';
        return (
          <Text style={{ color, fontWeight: 'bold' }}>
            {days} days
          </Text>
        );
      },
    },
    {
      title: 'Next Step (Documents)',
      dataIndex: 'nextStep',
      key: 'nextStep',
      width: 150,
      filters: [
        { text: 'I983', value: VisaDocumentType.I983 },
        { text: 'I20', value: VisaDocumentType.I20 },
        { text: 'OPTREC', value: VisaDocumentType.OPTREC },
        { text: 'STEMEAD', value: VisaDocumentType.STEMEAD },
        { text: 'None', value: 'None' },
      ],
      onFilter: (value, record) => record.nextStep === value,
      render: (step: VisaDocumentType | 'None') => {
        if (step === 'None') {
          return <Tag>None</Tag>;
        }
        return <Tag color="processing">{step}</Tag>;
      },
    },
    {
      title: 'Preview',
      key: 'preview',
      width: 100,
      render: (_, record) => {
        if (!record.currentDocument) {
          return <Text type="secondary">No document</Text>;
        }
        return (
          <Link onClick={() => handlePreview(record.currentDocument!)}>
            <FileTextOutlined /> View
          </Link>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => {
        const isLoading = actionLoading === record.applicationId;
        const hasDocument = !!record.currentDocument;
        const isNone = record.nextStep === 'None';
        const isPending = record.currentDocument?.description?.toLowerCase() === 'pending';
        const canTakeAction = hasDocument && !isNone && isPending;

        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={isLoading}
              disabled={!canTakeAction}
              onClick={() => handleApprove(record)}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              loading={isLoading}
              disabled={!canTakeAction}
              onClick={() => handleReject(record)}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer 
      title="Visa Status Management" 
      loading={loading}
    >
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} applications`,
        }}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: 'No approved visa applications found',
        }}
      />
    </PageContainer>
  );
};

export { HRVisaManagementPage };
