import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Avatar, Button, Descriptions, Tag, Image } from 'antd';
import { 
  UserOutlined, 
  SafetyOutlined, 
  HomeOutlined, 
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../../components/common/PageContainer';
import { getEmployeeById, getEmployeeByUserId, getDocumentsByEmployeeId, downloadDocument } from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type { Employee, ApplicationDocument } from '../../../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const EmployeeHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [documentUrls, setDocumentUrls] = useState<Record<number, string>>({});

  // 获取当前登录用户
  const currentUser = useAppSelector(selectUser);

  useEffect(() => {
    fetchEmployeeInfo();
  }, []);

  const fetchEmployeeInfo = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      // 先通过 User ID 获取 Employee 记录
      const empData = await getEmployeeByUserId(String(currentUser.id));
      const data = await getEmployeeById(empData.id);
      setEmployee(data);
      
      // Fetch documents
      try {
        const docs = await getDocumentsByEmployeeId(data.id);
        // Filter for EAD and driverLicense only
        const filteredDocs = docs.filter(
          (doc) => doc.type === 'EAD' || doc.type === 'driverLicense'
        );
        setDocuments(filteredDocs);
        
        // Fetch document images
        const urls: Record<number, string> = {};
        for (const doc of filteredDocs) {
          try {
            const blob = await downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            urls[doc.id] = url;
          } catch (err) {
          }
        }
        setDocumentUrls(urls);
      } catch (error) {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    return () => {
      Object.values(documentUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [documentUrls]);

  const quickLinks = [
    {
      title: 'Personal Information',
      description: 'View and update your personal details',
      icon: <UserOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
      path: '/employee/personal-info',
    },
    {
      title: 'Visa Status',
      description: 'Check your visa status and upload documents',
      icon: <SafetyOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
      path: '/employee/visa',
    },
    {
      title: 'Housing',
      description: 'View your housing details and roommates',
      icon: <HomeOutlined style={{ fontSize: 40, color: '#faad14' }} />,
      path: '/employee/housing',
    },
    {
      title: 'Onboarding',
      description: 'Complete your onboarding application',
      icon: <FileTextOutlined style={{ fontSize: 40, color: '#722ed1' }} />,
      path: '/onboarding/form',
    },
  ];

  const getDisplayName = () => {
    if (!employee) return 'Employee';
    const preferredName = employee.preferredName || employee.firstName;
    return preferredName;
  };

  return (
    <PageContainer loading={loading}>
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Space size="large" align="center">
          <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#fff', color: '#667eea' }} />
          <div>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              Hello {getDisplayName()}, Welcome to BeaconFire 🎉
            </Title>
            <Paragraph style={{ color: '#fff', marginTop: 8, marginBottom: 0, opacity: 0.9 }}>
              {employee?.email}
            </Paragraph>
            {employee?.startDate && (
              <Text style={{ color: '#fff', opacity: 0.8 }}>
                Member since {dayjs(employee.startDate).format('MMMM YYYY')}
              </Text>
            )}
          </div>
        </Space>
      </Card>

      {employee && (
        <>
          <Card title="Personal Information" style={{ marginTop: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Full Name" span={2}>
                <strong>
                  {employee.firstName} {employee.middleName && `${employee.middleName} `}
                  {employee.lastName}
                </strong>
                {employee.preferredName && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    Preferred: {employee.preferredName}
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Email" icon={<MailOutlined />}>
                {employee.email}
              </Descriptions.Item>
              <Descriptions.Item label="Cell Phone" icon={<PhoneOutlined />}>
                {employee.cellPhone || 'N/A'}
              </Descriptions.Item>
              {employee.alternatePhone && (
                <Descriptions.Item label="Alternate Phone" span={2}>
                  {employee.alternatePhone}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Date of Birth">
                {employee.dob ? dayjs(employee.dob).format('MMMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {employee.gender || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="SSN">
                {employee.ssn ? `***-**-${employee.ssn.slice(-4)}` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {employee.startDate ? dayjs(employee.startDate).format('MMMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Card title="Address Information">
                <Descriptions column={1} bordered>
                  {employee.address ? (
                    <>
                      <Descriptions.Item label="Street">
                        {employee.address.addressLine1}
                        {employee.address.addressLine2 && `, ${employee.address.addressLine2}`}
                      </Descriptions.Item>
                      <Descriptions.Item label="City">
                        {employee.address.city}
                      </Descriptions.Item>
                      <Descriptions.Item label="State">
                        {employee.address.stateName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Zip Code">
                        {employee.address.zipCode}
                      </Descriptions.Item>
                    </>
                  ) : (
                    <Descriptions.Item label="Address">
                      No address information available
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Work Authorization">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Visa Type">
                    {employee.visaStatus?.find(v => v.activeFlag === 'Yes')?.visaType || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Work Authorization">
                    {employee.citizenship ? (
                      <Tag color="green">US Citizen / Green Card</Tag>
                    ) : (
                      <Tag color="blue">Work Visa</Tag>
                    )}
                  </Descriptions.Item>
                  {employee.visaStatus?.find(v => v.activeFlag === 'Yes')?.startDate && (
                    <Descriptions.Item label="Visa Start Date">
                      {dayjs(employee.visaStatus.find(v => v.activeFlag === 'Yes')?.startDate).format('MMMM DD, YYYY')}
                    </Descriptions.Item>
                  )}
                  {employee.visaStatus?.find(v => v.activeFlag === 'Yes')?.endDate && (
                    <Descriptions.Item label="Visa End Date">
                      {dayjs(employee.visaStatus.find(v => v.activeFlag === 'Yes')?.endDate).format('MMMM DD, YYYY')}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {employee.driverLicense && (
            <Card title="Driver License" style={{ marginTop: 24 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="License Number">
                  {employee.driverLicense.number}
                </Descriptions.Item>
                <Descriptions.Item label="Expiration Date">
                  {dayjs(employee.driverLicense.expirationDate).format('MMMM DD, YYYY')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {employee.emergencyContacts && employee.emergencyContacts.length > 0 && (
            <Card title="Emergency Contacts" style={{ marginTop: 24 }}>
              {employee.emergencyContacts.map((contact, index) => (
                <Card 
                  key={index} 
                  type="inner" 
                  title={`Contact ${index + 1}`}
                  style={{ marginBottom: index < employee.emergencyContacts!.length - 1 ? 16 : 0 }}
                >
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Name" span={2}>
                      {contact.firstName} {contact.middleName && `${contact.middleName} `}
                      {contact.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {contact.cellPhone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {contact.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Relationship" span={2}>
                      {contact.relationship}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ))}
            </Card>
          )}

          {documents.length > 0 && (
            <Card title="Documents" style={{ marginTop: 24 }}>
              <Row gutter={[16, 16]}>
                {documents.map((doc) => (
                  <Col key={doc.id} xs={24} sm={12} md={8}>
                    <Card
                      type="inner"
                      title={doc.type === 'EAD' ? 'EAD' : 'Driver License'}
                      cover={
                        documentUrls[doc.id] ? (
                          <div style={{ padding: 16, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                            <Image
                              src={documentUrls[doc.id]}
                              alt={doc.type}
                              style={{ maxHeight: 300, objectFit: 'contain' }}
                            />
                          </div>
                        ) : (
                          <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                            <Text type="secondary">Loading...</Text>
                          </div>
                        )
                      }
                    >
                      {doc.title && <Text type="secondary">{doc.title}</Text>}
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default EmployeeHomePage;
