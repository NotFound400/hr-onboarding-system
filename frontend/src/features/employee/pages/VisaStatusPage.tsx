/**
 * Visa Status Page
 * 员工签证状态追踪页面
 * 
 * Features:
 * - 仅当用户是 Non-Citizen 时显示内容
 * - 展示当前 Visa 状态
 * - 文件上传: 复用 DocumentUpload 组件
 * - 上传后提示: "已发送邮件给 HR"
 */

import { useState, useEffect } from 'react';
import { Card, Descriptions, Empty, Space, Alert, Tag, Steps } from 'antd';
import { SafetyOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { UploadFile } from 'antd';
import { PageContainer } from '../../../components/common/PageContainer';
import { DocumentUpload } from '../../onboarding';
import { getEmployeeById, getEmployeeByUserId } from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type { Employee, VisaStatus } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

/**
 * VisaStatusPage Component
 */
const VisaStatusPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isCitizen, setIsCitizen] = useState(false);
  
  // 文档上传状态
  const [optReceiptFiles, setOptReceiptFiles] = useState<UploadFile[]>([]);
  const [optEadFiles, setOptEadFiles] = useState<UploadFile[]>([]);
  const [i983Files, setI983Files] = useState<UploadFile[]>([]);
  const [i20Files, setI20Files] = useState<UploadFile[]>([]);

  // 获取当前登录用户
  const currentUser = useAppSelector(selectUser);
  const messageApi = useAntdMessage();

  useEffect(() => {
    fetchEmployeeVisaInfo();
  }, []);

  /**
   * 获取员工签证信息
   */
  const fetchEmployeeVisaInfo = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      // 先通过 User ID 获取 Employee 记录
      const empData = await getEmployeeByUserId(String(currentUser.id));
      const data = await getEmployeeById(empData.id);
      setEmployee(data);

      // 检查是否是公民/绿卡持有者
      // 假设: 如果没有任何签证记录，则认为是公民
      const hasVisa = data.visaStatus && data.visaStatus.length > 0;
      setIsCitizen(!hasVisa);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load visa information');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取激活的签证状态
   */
  const getActiveVisaStatus = (): VisaStatus | undefined => {
    if (!employee?.visaStatus) return undefined;
    return employee.visaStatus.find(visa => visa.activeFlag === 'Yes');
  };

  /**
   * 获取签证状态标签颜色
   */
  const getVisaStatusColor = (visa: VisaStatus) => {
    const endDate = dayjs(visa.endDate);
    const now = dayjs();
    const daysUntilExpiry = endDate.diff(now, 'day');

    if (daysUntilExpiry < 0) return 'error'; // 已过期
    if (daysUntilExpiry < 90) return 'warning'; // 90天内过期
    return 'success'; // 有效
  };

  /**
   * 处理文档上传变化 - 发送邮件通知
   */
  const handleDocumentChange = (fileList: UploadFile[], docType: string) => {
    // 检查是否有新上传的文件
    const hasNewUpload = fileList.some(file => file.status === 'done' && !file.url);
    
    if (hasNewUpload) {
      messageApi.success(`${docType} uploaded successfully. Email notification sent to HR.`);
    }

    // 根据文档类型更新对应的状态
    switch (docType) {
      case 'OPT Receipt':
        setOptReceiptFiles(fileList);
        break;
      case 'OPT EAD':
        setOptEadFiles(fileList);
        break;
      case 'I-983':
        setI983Files(fileList);
        break;
      case 'I-20':
        setI20Files(fileList);
        break;
    }
  };

  /**
   * 渲染公民/绿卡持有者提示
   */
  const renderCitizenNotice = () => (
    <Empty
      image={<SafetyOutlined style={{ fontSize: 80, color: '#52c41a' }} />}
      description={
        <Space direction="vertical">
          <span style={{ fontSize: 16, fontWeight: 'bold' }}>No Visa Required</span>
          <span style={{ color: '#666' }}>
            You are a U.S. Citizen or Permanent Resident. No visa documentation is needed.
          </span>
        </Space>
      }
    />
  );

  /**
   * 渲染签证信息
   */
  const renderVisaContent = () => {
    if (!employee) return null;

    const activeVisa = getActiveVisaStatus();

    if (!activeVisa) {
      return (
        <Alert
          message="No Active Visa Status"
          description="No active visa status found in your profile. Please contact HR if this is incorrect."
          type="warning"
          showIcon
        />
      );
    }

    const endDate = dayjs(activeVisa.endDate);
    const daysUntilExpiry = endDate.diff(dayjs(), 'day');
    const isExpiringSoon = daysUntilExpiry < 90 && daysUntilExpiry > 0;
    const isExpired = daysUntilExpiry < 0;

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 过期提醒 */}
        {isExpiringSoon && (
          <Alert
            message="Visa Expiring Soon"
            description={`Your ${activeVisa.visaType} will expire in ${daysUntilExpiry} days. Please prepare renewal documents.`}
            type="warning"
            showIcon
          />
        )}
        {isExpired && (
          <Alert
            message="Visa Expired"
            description={`Your ${activeVisa.visaType} expired ${Math.abs(daysUntilExpiry)} days ago. Please contact HR immediately.`}
            type="error"
            showIcon
          />
        )}

        {/* 当前签证状态 */}
        <Card title="Current Visa Status" extra={<SafetyOutlined style={{ fontSize: 20 }} />}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Visa Type">
              <Tag color={getVisaStatusColor(activeVisa)} style={{ fontSize: 14 }}>
                {activeVisa.visaType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={activeVisa.activeFlag === 'Yes' ? 'success' : 'default'}>
                {activeVisa.activeFlag === 'Yes' ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {dayjs(activeVisa.startDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {dayjs(activeVisa.endDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="Days Remaining" span={2}>
              <strong style={{ fontSize: 16, color: isExpired ? '#ff4d4f' : isExpiringSoon ? '#faad14' : '#52c41a' }}>
                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
              </strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Section 7.b - OPT Document Upload (I-983 → I-20 → Receipt → EAD) */}
        {(activeVisa.visaType === 'OPT' || activeVisa.visaType === 'F1') && (
          <Card title="OPT Documents" extra={<FileTextOutlined style={{ fontSize: 20 }} />}>
            <Alert
              message="Document Upload Instructions"
              description="Please upload all required OPT documents in order. Each step must be completed before the next is unlocked. HR will be notified via email after each upload."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            {/* Steps Indicator */}
            <Steps
              current={
                i983Files.length > 0
                  ? i20Files.length > 0
                    ? optReceiptFiles.length > 0
                      ? optEadFiles.length > 0
                        ? 4
                        : 3
                      : 2
                    : 1
                  : 0
              }
              style={{ marginBottom: 32 }}
              items={[
                {
                  title: 'I-983',
                  icon: i983Files.length > 0 ? <CheckCircleOutlined /> : undefined,
                },
                {
                  title: 'I-20',
                  icon: i20Files.length > 0 ? <CheckCircleOutlined /> : undefined,
                },
                {
                  title: 'OPT Receipt',
                  icon: optReceiptFiles.length > 0 ? <CheckCircleOutlined /> : undefined,
                },
                {
                  title: 'OPT EAD',
                  icon: optEadFiles.length > 0 ? <CheckCircleOutlined /> : undefined,
                },
              ]}
            />

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Section 7.b.i - I-983 (Always enabled) */}
              <Card type="inner" title="Step 1: I-983 (Training Plan for STEM OPT)">
                <DocumentUpload
                  title="I-983"
                  fileList={i983Files}
                  onChange={(fileList) => handleDocumentChange(fileList, 'I-983')}
                />
              </Card>

              {/* Section 7.b.ii - I-20 (Enabled after I-983 uploaded) */}
              <Card
                type="inner"
                title="Step 2: I-20 (Certificate of Eligibility)"
                style={{ opacity: i983Files.length > 0 ? 1 : 0.5 }}
              >
                {i983Files.length > 0 ? (
                  <DocumentUpload
                    title="I-20"
                    required
                    fileList={i20Files}
                    onChange={(fileList) => handleDocumentChange(fileList, 'I-20')}
                  />
                ) : (
                  <Alert
                    message="Locked"
                    description="Please upload I-983 first to unlock this step."
                    type="warning"
                    showIcon
                  />
                )}
              </Card>

              {/* Section 7.b.iii - OPT Receipt (Enabled after I-20 uploaded) */}
              <Card
                type="inner"
                title="Step 3: OPT Receipt"
                style={{ opacity: i20Files.length > 0 ? 1 : 0.5 }}
              >
                {i20Files.length > 0 ? (
                  <DocumentUpload
                    title="OPT Receipt"
                    required
                    fileList={optReceiptFiles}
                    onChange={(fileList) => handleDocumentChange(fileList, 'OPT Receipt')}
                  />
                ) : (
                  <Alert
                    message="Locked"
                    description="Please upload I-20 first to unlock this step."
                    type="warning"
                    showIcon
                  />
                )}
              </Card>

              {/* Section 7.b.iv - OPT EAD (Enabled after OPT Receipt uploaded) */}
              <Card
                type="inner"
                title="Step 4: OPT EAD (Employment Authorization Document)"
                style={{ opacity: optReceiptFiles.length > 0 ? 1 : 0.5 }}
              >
                {optReceiptFiles.length > 0 ? (
                  <DocumentUpload
                    title="OPT EAD"
                    required
                    fileList={optEadFiles}
                    onChange={(fileList) => handleDocumentChange(fileList, 'OPT EAD')}
                  />
                ) : (
                  <Alert
                    message="Locked"
                    description="Please upload OPT Receipt first to unlock this step."
                    type="warning"
                    showIcon
                  />
                )}
              </Card>
            </Space>
          </Card>
        )}
      </Space>
    );
  };

  return (
    <PageContainer title="Visa Status Tracking" loading={loading}>
      {isCitizen ? renderCitizenNotice() : renderVisaContent()}
    </PageContainer>
  );
};

export default VisaStatusPage;
