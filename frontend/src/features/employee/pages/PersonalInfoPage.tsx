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
        SSN: values.SSN,
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
   * 渲染只读模式
   */
  const renderReadMode = () => {
    if (!employee) return null;

    // 获取主地址
    const primaryAddress = employee.address?.find(addr => addr.type === 'Primary');
    const addressStr = primaryAddress 
      ? `${primaryAddress.addressLine1}${primaryAddress.addressLine2 ? ', ' + primaryAddress.addressLine2 : ''}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zipCode}`
      : 'N/A';

    // 获取活跃签证
    const activeVisa = employee.visaStatus?.find(visa => visa.activeFlag);

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 基本信息卡片 */}
        <Card
          title={
            <Space>
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                  {employee.firstName} {employee.middleName && `${employee.middleName} `}{employee.lastName}
                  {employee.preferredName && ` (${employee.preferredName})`}
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>{employee.email}</div>
              </div>
            </Space>
          }
          extra={
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
          }
        >
          <Descriptions column={2} bordered>
            <Descriptions.Item label="First Name">{employee.firstName}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{employee.lastName}</Descriptions.Item>
            <Descriptions.Item label="Middle Name">{employee.middleName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Preferred Name">{employee.preferredName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
            <Descriptions.Item label="Cell Phone">{employee.cellPhone}</Descriptions.Item>
            <Descriptions.Item label="Alternate Phone">{employee.alternatePhone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Gender">{employee.gender}</Descriptions.Item>
            <Descriptions.Item label="SSN">***-**-{employee.SSN?.split('-')[2] || '****'}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">{employee.DOB ? dayjs(employee.DOB).format('YYYY-MM-DD') : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Start Date">{employee.startDate ? dayjs(employee.startDate).format('YYYY-MM-DD') : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Work Authorization">{activeVisa?.visaType || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 驾照信息 */}
        <Card title="Driver License Information">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="License Number">{employee.driverLicense || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Expiration Date">
              {employee.driverLicenseExpiration ? dayjs(employee.driverLicenseExpiration).format('YYYY-MM-DD') : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 地址信息 */}
        <Card title="Address Information">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Primary Address">{addressStr}</Descriptions.Item>
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
