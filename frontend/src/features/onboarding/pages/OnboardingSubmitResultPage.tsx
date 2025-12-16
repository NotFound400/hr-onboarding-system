import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '../../../components/common/PageContainer';
import { useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { resetOnboarding } from '../../../store/slices/onboardingSlice';


const OnboardingSubmitResultPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleBackToHome = async () => {
    try {
      dispatch(resetOnboarding());
      
      await dispatch(logout()).unwrap();
      navigate('/login', { replace: true });
    } catch (error) {
      navigate('/login', { replace: true });
    }
  };

  return (
    <PageContainer>
      <Result
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        status="success"
        title="Onboarding Application Submitted Successfully!"
        subTitle={
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>
              Your onboarding application has been submitted and is now pending HR review.
            </p>
            <p style={{ fontSize: 14, color: '#666' }}>
              You will receive an email notification once the HR team has reviewed your application.
              Please check your email regularly for updates.
            </p>
            <p style={{ fontSize: 14, color: '#666', marginTop: 16 }}>
              If you have any questions, please contact HR at <strong>hr@company.com</strong>
            </p>
          </div>
        }
        extra={[
          <Button type="primary" size="large" onClick={handleBackToHome} key="home">
            Back to Login
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default OnboardingSubmitResultPage;
