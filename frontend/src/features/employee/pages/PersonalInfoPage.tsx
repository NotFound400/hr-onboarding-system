/**
 * Personal Information Page
 * 员工个人信息页面
 * 
 * Features:
 * - Read Mode: 展示员工信息（Avatar, Name, Contact, Employment）
 * - Edit Mode: 点击 "Edit" 按钮切换为表单
 * - Cancel: 点击 "Cancel" 弹出 Modal.confirm 询问 "Discard changes?"
 * - Save: 调用 API 更新信息
 */

import { useState, useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col, 
  Avatar, 
  Space, 
  Modal, 
  message 
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageContainer } from '../../../components/common/PageContainer';
import { getEmployeeById, getEmployeeByUserId, updateEmployee } from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type { Employee, UpdateEmployeeRequest } from '../../../types';

const { Option } = Select;

/**
 * PersonalInfoPage Component
 */
const PersonalInfoPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('');

  // 获取当前登录用户
  const currentUser = useAppSelector(selectUser);

  useEffect(() => {
    fetchEmployeeInfo();
  }, []);

  /**
   * 获取员工信息
   */
  const fetchEmployeeInfo = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      // 先通过 User ID 获取 Employee 记录
      const empData = await getEmployeeByUserId(String(currentUser.id));
      setCurrentEmployeeId(empData.id);
      
      const data = await getEmployeeById(empData.id);
      setEmployee(data);
      
      // 初始化表单数据
      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        preferredName: data.preferredName,
        email: data.email,
        cellPhone: data.cellPhone,
        alternatePhone: data.alternatePhone,
        gender: data.gender,
        SSN: data.SSN,
        DOB: data.DOB ? dayjs(data.DOB) : null,
        driverLicense: data.driverLicense,
        driverLicenseExpiration: data.driverLicenseExpiration ? dayjs(data.driverLicenseExpiration) : null,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load employee information');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 切换到编辑模式
   */
  const handleEdit = () => {
    setEditMode(true);
  };

  /**
   * 取消编辑 - 显示确认对话框
   */
  const handleCancel = () => {
    Modal.confirm({
      title: 'Discard Changes',
      content: 'Are you sure to discard all your changes?',
      okText: 'Yes, Discard',
      cancelText: 'No, Keep Editing',
      okButtonProps: { danger: true },
      onOk: () => {
        // 重置表单到原始数据
        if (employee) {
          form.setFieldsValue({
            firstName: employee.firstName,
            lastName: employee.lastName,
            middleName: employee.middleName,
            preferredName: employee.preferredName,
            email: employee.email,
            cellPhone: employee.cellPhone,
            alternatePhone: employee.alternatePhone,
            gender: employee.gender,
            SSN: employee.SSN,
            DOB: employee.DOB ? dayjs(employee.DOB) : null,
            driverLicense: employee.driverLicense,
            driverLicenseExpiration: employee.driverLicenseExpiration ? dayjs(employee.driverLicenseExpiration) : null,
          });
        }
        setEditMode(false);
      },
    });
  };

  /**
   * 保存编辑
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const updateData: UpdateEmployeeRequest = {
        id: currentEmployeeId,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName || '',
        preferredName: values.preferredName || '',
        email: values.email,
        cellPhone: values.cellPhone,
        alternatePhone: values.alternatePhone || '',
        gender: values.gender,
        // SSN is not editable for security
        DOB: values.DOB ? values.DOB.format('YYYY-MM-DD') : '',
        driverLicense: values.driverLicense || '',
        driverLicenseExpiration: values.driverLicenseExpiration ? values.driverLicenseExpiration.format('YYYY-MM-DD') : '',
      };

      await updateEmployee(updateData);
      message.success('Personal information updated successfully');
      setEditMode(false);
      fetchEmployeeInfo(); // 重新获取更新后的数据
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please check all required fields');
      } else {
        message.error(error.message || 'Failed to update personal information');
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * 渲染只读模式 - 严格按 Section 6(b) 实现
   */
  const renderReadMode = () => {
    if (!employee) return null;

    // Section 6.b.ii - 获取主地址和次地址
    const primaryAddress = employee.address?.find(addr => addr.type === 'Primary');
    const secondaryAddress = employee.address?.find(addr => addr.type === 'Secondary');

    // Section 6.b.iv - 获取活跃签证
    const activeVisa = employee.visaStatus?.find(visa => visa.activeFlag);

    // Section 6.b.i - 计算年龄
    const age = employee.DOB ? dayjs().diff(dayjs(employee.DOB), 'year') : 'N/A';

    // Section 6.b.iv - 获取紧急联系人
    const emergencyContacts = employee.contact?.filter(c => c.type === 'Emergency') || [];

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Section 6.b.i - Name Section */}
        <Card
          title="Name"
          extra={
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
          }
        >
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Avatar 
                size={80} 
                src={employee.avatar} 
                icon={<UserOutlined />} 
              />
            </Col>
            <Col flex="auto">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Legal Name (Full Name)" span={2}>
                  <strong style={{ fontSize: 16 }}>
                    {employee.firstName} {employee.middleName && `${employee.middleName} `}{employee.lastName}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Preferred Name">{employee.preferredName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Avatar">{employee.avatar ? 'Uploaded' : 'Default'}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">
                  {employee.DOB ? dayjs(employee.DOB).format('YYYY-MM-DD') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Age">{age}</Descriptions.Item>
                <Descriptions.Item label="Gender">{employee.gender}</Descriptions.Item>
                <Descriptions.Item label="SSN (Last 4 digits)">
                  ***-**-{employee.SSN?.split('-')[2] || '****'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Section 6.b.ii - Address Section */}
        <Card title="Address">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Primary Address">
              {primaryAddress ? (
                <>
                  <div>{primaryAddress.addressLine1}</div>
                  {primaryAddress.addressLine2 && <div>{primaryAddress.addressLine2}</div>}
                  <div>{`${primaryAddress.city}, ${primaryAddress.state}, ${primaryAddress.zipCode}`}</div>
                </>
              ) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Secondary Address">
              {secondaryAddress ? (
                <>
                  <div>{secondaryAddress.addressLine1}</div>
                  {secondaryAddress.addressLine2 && <div>{secondaryAddress.addressLine2}</div>}
                  <div>{`${secondaryAddress.city}, ${secondaryAddress.state}, ${secondaryAddress.zipCode}`}</div>
                </>
              ) : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Section 6.b.iii - Contact Info Section */}
        <Card title="Contact Info">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Personal Email">{employee.email}</Descriptions.Item>
            <Descriptions.Item label="Work Email">{employee.workEmail || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Cell Phone">{employee.cellPhone}</Descriptions.Item>
            <Descriptions.Item label="Work Phone">{employee.workPhone || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Section 6.b.iv - Employment Section */}
        <Card title="Employment">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Work Authorization">{activeVisa?.visaType || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Work Authorization Start Date">
              {activeVisa?.startDate ? dayjs(activeVisa.startDate).format('YYYY-MM-DD') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Work Authorization End Date">
              {activeVisa?.endDate ? dayjs(activeVisa.endDate).format('YYYY-MM-DD') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Employment Start Date">
              {employee.startDate ? dayjs(employee.startDate).format('YYYY-MM-DD') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Employment End Date">
              {employee.endDate ? dayjs(employee.endDate).format('YYYY-MM-DD') : 'Not Set'}
            </Descriptions.Item>
            <Descriptions.Item label="Title">{employee.title || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Emergency Contact (List View)" span={2}>
              {emergencyContacts.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {emergencyContacts.map((contact, index) => (
                    <Card key={index} size="small" type="inner">
                      <div><strong>Full Name:</strong> {contact.firstName} {contact.middleName && `${contact.middleName} `}{contact.lastName}</div>
                      <div><strong>Phone:</strong> {contact.phone}</div>
                      <div><strong>Email:</strong> {contact.email}</div>
                      <div><strong>Relationship:</strong> {contact.relationship}</div>
                    </Card>
                  ))}
                </Space>
              ) : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Driver License */}
        <Card title="Driver License">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="License Number">{employee.driverLicense || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Expiration Date">
              {employee.driverLicenseExpiration ? dayjs(employee.driverLicenseExpiration).format('YYYY-MM-DD') : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    );
  };

  /**
   * 渲染编辑模式
   */
  const renderEditMode = () => {
    return (
      <Card
        title="Edit Personal Information"
        extra={
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="middleName" label="Middle Name">
                <Input placeholder="Enter middle name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="preferredName" label="Preferred Name">
                <Input placeholder="Enter preferred name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Invalid email format' },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="cellPhone"
                label="Cell Phone"
                rules={[{ required: true, message: 'Cell phone is required' }]}
              >
                <Input placeholder="Enter cell phone" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="alternatePhone" label="Alternate Phone">
                <Input placeholder="Enter alternate phone" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="SSN"
                label="SSN"
                rules={[{ required: true, message: 'SSN is required' }]}
              >
                <Input placeholder="XXX-XX-XXXX" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="DOB"
                label="Date of Birth"
                rules={[{ required: true, message: 'Date of birth is required' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="driverLicense" label="Driver License">
                <Input placeholder="Enter driver license number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="driverLicenseExpiration" label="License Expiration">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  };

  return (
    <PageContainer title="Personal Information" loading={loading}>
      {editMode ? renderEditMode() : renderReadMode()}
    </PageContainer>
  );
};

export default PersonalInfoPage;
