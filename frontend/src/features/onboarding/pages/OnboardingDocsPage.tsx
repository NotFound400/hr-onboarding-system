/**
 * Onboarding Documents Upload Page
 * 员工上传 Onboarding 所需文档页面
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert } from 'antd';
import { PageContainer } from '../../../components/common/PageContainer';
import DocumentUpload from '../components/DocumentUpload';
import type { UploadFile } from 'antd';
import { useAntdMessage } from '../../../hooks/useAntdMessage';
import { useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';

/**
 * OnboardingDocsPage Component
 * 
 * 按 frontend_requirement.md 4.2 定义:
 * - 上传文档列表
 * - 所有必填文档上传后方可提交
 * - 每份文档都必须提供 HR 的逐条评论入口（评论 Modal）
 * - "提交申请" → /onboarding/submit-result
 */
const OnboardingDocsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // 文档状态管理
  const [i983Files, setI983Files] = useState<UploadFile[]>([]);
  const [i20Files, setI20Files] = useState<UploadFile[]>([]);
  const [driverLicenseFiles, setDriverLicenseFiles] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const messageApi = useAntdMessage();

  /**
   * 检查是否所有必填文档已上传
   */
  const isAllDocumentsUploaded = () => {
    return i983Files.length > 0 && i20Files.length > 0 && driverLicenseFiles.length > 0;
  };

  /**
   * 处理提交
   */
  const handleSubmit = async () => {
    if (!isAllDocumentsUploaded()) {
      messageApi.error('Please upload all required documents');
      return;
    }

    try {
      setSubmitting(true);
      // Mock 上传逻辑
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      messageApi.success('All documents uploaded successfully!');
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      messageApi.error('Failed to submit documents');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 返回上一步
   */
  const handleBack = () => {
    navigate('/onboarding/form');
  };

  return (
    <div style={{ width: '80%', margin: '0 auto' }}>
      <PageContainer title="Upload Documents">
        <Alert
          message="Required Documents"
          description="Please upload all required documents below. All documents must be uploaded before you can submit your application."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* I-983 表单 */}
        <DocumentUpload
          title="I-983 Training Plan (OPT/STEM OPT Students)"
          required
          fileList={i983Files}
          onChange={setI983Files}
          maxCount={1}
        />

        {/* I-20 表单 */}
        <DocumentUpload
          title="I-20 Certificate of Eligibility"
          required
          fileList={i20Files}
          onChange={setI20Files}
          maxCount={1}
        />

        {/* 驾照 */}
        <DocumentUpload
          title="Driver License Copy"
          required
          fileList={driverLicenseFiles}
          onChange={setDriverLicenseFiles}
          maxCount={2}
        />

        {/* 按钮组 */}
        <div style={{ marginTop: 32, textAlign: 'right' }}>
          <Button onClick={handleBack} style={{ marginRight: 8 }}>
            Back to Form
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!isAllDocumentsUploaded()}
          >
            Submit Application
          </Button>
        </div>

        {!isAllDocumentsUploaded() && (
          <Alert
            message="Missing Required Documents"
            description="Please upload all required documents before submitting."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </PageContainer>
    </div>
  );
};

export default OnboardingDocsPage;
