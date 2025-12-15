/**
 * Onboarding Rejected Page
 * Section 3.e.iii: "The user should be able to log in and see what is wrong"
 * 
 * 当用户的 Onboarding 申请被 HR 拒绝时显示此页面
 * 展示拒绝原因和缺失文档信息
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Alert, Descriptions, Button, Space, Tag, Empty } from 'antd';
import { CloseCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageContainer } from '../../../components/common/PageContainer';
import { getApplicationsByEmployeeId, getEmployeeByUserId } from '../../../services/api';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logout, selectUser } from '../../../store/slices/authSlice';
import type { ApplicationWorkFlow } from '../../../types';
import { selectExistingApplicationInfo } from '../../../store/slices/onboardingSlice';

const statusTagColors: Record<string, string> = {
  Approved: 'green',
  Rejected: 'red',
  Pending: 'orange',
  Open: 'blue',
};

/**
 * OnboardingRejectedPage Component
 */
const OnboardingRejectedPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationWorkFlow | null>(null);

  const currentUser = useAppSelector(selectUser);
  const existingApplicationInfo = useAppSelector(selectExistingApplicationInfo);

  useEffect(() => {
    fetchRejectedApplication();
  }, []);

  /**
   * 获取被拒绝的 Onboarding 申请
   */
  const fetchRejectedApplication = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const employee = await getEmployeeByUserId(String(currentUser.id));
      const applications = await getApplicationsByEmployeeId(employee.id);

      let targetApplication: ApplicationWorkFlow | undefined;

      if (existingApplicationInfo.id) {
        targetApplication = applications.find(
          (app) => app.id === existingApplicationInfo.id
        );
      }

      if (!targetApplication) {
        targetApplication = applications.find(
          (app) => app.applicationType === 'Onboarding' && app.status === 'Rejected'
        );
      }

      setApplication(targetApplication || null);
    } catch (error) {
      console.error('Failed to fetch rejected application:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重新提交申请
   */
  const handleBackToLogin = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch {
      // ignore logout errors, still navigate
    } finally {
      navigate('/login', { replace: true });
    }
  };

  /**
   * 渲染拒绝原因
   * Section 3.e.iii: Show rejection comments from HR
   */
  const renderRejectionReasons = () => {
    if (!application) return null;

    const hasComment = application.comment && application.comment.trim().length > 0;

    return (
      <Card title="Rejection Details" extra={<CloseCircleOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />}>
        {hasComment ? (
          <Alert
            message="HR Feedback"
            description={application.comment}
            type="error"
            showIcon
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No specific rejection reason provided by HR"
          />
        )}
      </Card>
    );
  };

  /**
   * 渲染文档状态
   * Note: Document details would be retrieved from ApplicationDetail type
   */
  const renderDocumentStatus = () => {
    // Type assertion if application has documents property (ApplicationDetail)
    const appDetail = application as any;
    
    if (!appDetail?.documents || appDetail.documents.length === 0) return null;

    const hasRejectedDocs = appDetail.documents.some((doc: any) => doc.status === 'Rejected');

    if (!hasRejectedDocs) return null;

    return (
      <Card title="Document Issues" extra={<FileTextOutlined style={{ fontSize: 20 }} />}>
        <Alert
          message="The following documents need attention:"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Space direction="vertical" style={{ width: '100%' }}>
          {appDetail.documents
            .filter((doc: any) => doc.status === 'Rejected')
            .map((doc: any, index: number) => (
              <Card key={index} size="small" type="inner">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Tag color="red">Rejected</Tag>
                    <strong>{doc.type || doc.title}</strong>
                  </div>
                  {doc.comment && (
                    <div style={{ color: '#666', fontSize: 14 }}>
                      <strong>Feedback:</strong> {doc.comment}
                    </div>
                  )}
                </Space>
              </Card>
            ))}
        </Space>
      </Card>
    );
  };

  return (
    <PageContainer title="Onboarding Application Status" loading={loading}>
      {application ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 拒绝警告 */}
          <Alert
            message="Your Onboarding Application Has Been Rejected"
            description="Please review the feedback below and resubmit your application with the necessary corrections."
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
          />

          {/* 申请基本信息 */}
          <Card title="Application Information">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Application Type">
                <Tag color="blue">{application.applicationType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusTagColors[application.status] || 'red'}>{application.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Submission Date">
                {dayjs(application.createDate).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(application.lastModificationDate).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 拒绝原因 */}
          {renderRejectionReasons()}

          {/* 文档问题 */}
          {renderDocumentStatus()}

          {/* 操作按钮 */}
          <Card>
            <Button type="primary" size="large" onClick={handleBackToLogin}>
              Back to Login
            </Button>
          </Card>
        </Space>
      ) : (
        <Alert
          message="No Rejected Application Found"
          description="You don't have any rejected onboarding applications."
          type="info"
          showIcon
        />
      )}
    </PageContainer>
  );
};

export default OnboardingRejectedPage;
