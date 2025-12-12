/**
 * Personal Information Page (Refactored)
 * 员工个人信息页面 - 组件化重构版
 * 
 * Architecture:
 * - 每个板块独立组件 (Name, Address, Contact, EmergencyContact, Employment)
 * - 使用 EditableSectionCard 统一封装
 * - Per-section editing 模式 (Section 6(c))
 * - Modal.confirm on Cancel (Section 6(c))
 */

import { useState, useEffect } from 'react';
import { Card, Avatar, Space, message, Form, Row, Col } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  PhoneOutlined,
  HomeOutlined,
  SafetyOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { PageContainer } from '../../../components/common/PageContainer';
import { getEmployeeById, getEmployeeByUserId, updateEmployee } from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import type { Employee, UpdateEmployeeRequest } from '../../../types';

// Import all section components
import EditableSectionCard from '../components/personal-info/EditableSectionCard';
import NameSection, { extractNameData } from '../components/personal-info/NameSection';
import AddressSection, { extractAddressData } from '../components/personal-info/AddressSection';
import ContactSection, { extractContactData } from '../components/personal-info/ContactSection';
import EmergencyContactSection, {
  extractEmergencyContactData,
} from '../components/personal-info/EmergencyContactSection';
import EmploymentSection, {
  extractEmploymentData,
} from '../components/personal-info/EmploymentSection';
import { ContactType } from '../../../types/enums';

/**
 * Section 板块标识符
 */
type SectionType = 'name' | 'address' | 'contact' | 'emergencyContact' | 'employment';

/**
 * PersonalInfoPage Component
 */
const PersonalInfoPage: React.FC = () => {
  // ========== State Management ==========
  const [nameForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [emergencyContactForm] = Form.useForm();
  const [employmentForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<SectionType | null>(null);

  // Section 6(c): "Each section should have an Edit button"
  // 每个板块独立管理编辑状态
  const [editingSection, setEditingSection] = useState<SectionType | null>(null);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('');

  // 获取当前登录用户
  const currentUser = useAppSelector(selectUser);

  // ========== Data Fetching ==========
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
    } catch (error: any) {
      message.error(error.message || 'Failed to load employee information');
    } finally {
      setLoading(false);
    }
  };

  // ========== Section Actions ==========
  /**
   * 开始编辑某个板块
   */
  const handleEdit = (section: SectionType) => {
    setEditingSection(section);
  };

  /**
   * 取消编辑 - Modal.confirm 已在 EditableSectionCard 中处理
   */
  const handleCancel = (section: SectionType) => {
    setEditingSection(null);
    // Reset form to original values
    switch (section) {
      case 'name':
        nameForm.resetFields();
        break;
      case 'address':
        addressForm.resetFields();
        break;
      case 'contact':
        contactForm.resetFields();
        break;
      case 'emergencyContact':
        emergencyContactForm.resetFields();
        break;
      case 'employment':
        employmentForm.resetFields();
        break;
    }
  };

  /**
   * 保存板块数据
   */
  const handleSave = async (section: SectionType) => {
    if (!employee) return;

    setSaving(section);
    try {
      let formValues: any;
      let updatePayload: Partial<UpdateEmployeeRequest> = {};

      // Get form values and extract data based on section
      switch (section) {
        case 'name':
          formValues = await nameForm.validateFields();
          updatePayload = extractNameData(formValues);
          break;

        case 'address':
          formValues = await addressForm.validateFields();
          const addresses = extractAddressData(formValues);
          updatePayload = { address: addresses };
          break;

        case 'contact':
          formValues = await contactForm.validateFields();
          const contactData = extractContactData(formValues, employee);
          updatePayload = contactData;
          break;

        case 'emergencyContact':
          formValues = await emergencyContactForm.validateFields();
          const emergencyContacts = extractEmergencyContactData(formValues);
          // Merge with existing non-emergency contacts
          const existingContacts = employee.contact?.filter(
            c => c.type !== ContactType.EMERGENCY
          ) || [];
          updatePayload = {
            contact: [...existingContacts, ...emergencyContacts],
          };
          break;

        case 'employment':
          formValues = await employmentForm.validateFields();
          updatePayload = extractEmploymentData(formValues);
          break;
      }

      // Call API to update
      await updateEmployee(currentEmployeeId, updatePayload as UpdateEmployeeRequest);
      message.success('Information updated successfully');

      // Refresh data and exit edit mode
      await fetchEmployeeInfo();
      setEditingSection(null);
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please check the form fields');
      } else {
        message.error(error.message || 'Failed to update information');
      }
    } finally {
      setSaving(null);
    }
  };

  // ========== Avatar Section ==========
  const renderAvatarSection = () => {
    if (!employee) return null;

    return (
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Avatar size={120} icon={<UserOutlined />} src={employee.avatar} />
          <div>
            <h2 style={{ margin: 0 }}>
              {employee.firstName} {employee.middleName && `${employee.middleName} `}
              {employee.lastName}
            </h2>
            {employee.preferredName && (
              <p style={{ color: '#666', marginTop: 8 }}>
                Preferred Name: {employee.preferredName}
              </p>
            )}
          </div>
        </Space>
      </Card>
    );
  };

  // ========== Render (Dashboard 三列布局) ==========
  return (
    <PageContainer title="Personal Information" loading={loading}>
      {renderAvatarSection()}

      {/* Dashboard Style: 三列网格布局 */}
      <Row gutter={[16, 16]}>
        {/* 左列: Name + Contact */}
        <Col xs={24} sm={24} md={8}>
          {/* Name Section (蓝色) */}
          <EditableSectionCard
            title="Name & Basic Info"
            headerColor="#1890ff"
            icon={<IdcardOutlined />}
            isEditing={editingSection === 'name'}
            onEdit={() => handleEdit('name')}
            onSave={() => handleSave('name')}
            onCancel={() => handleCancel('name')}
            loading={saving === 'name'}
            readView={<NameSection employee={employee} form={nameForm} isEditing={false} />}
          >
            <NameSection employee={employee} form={nameForm} isEditing={true} />
          </EditableSectionCard>

          {/* Contact Section (默认灰色) */}
          <EditableSectionCard
            title="Contact Information"
            headerColor="#d9d9d9"
            icon={<PhoneOutlined />}
            isEditing={editingSection === 'contact'}
            onEdit={() => handleEdit('contact')}
            onSave={() => handleSave('contact')}
            onCancel={() => handleCancel('contact')}
            loading={saving === 'contact'}
            readView={<ContactSection employee={employee} form={contactForm} isEditing={false} />}
          >
            <ContactSection employee={employee} form={contactForm} isEditing={true} />
          </EditableSectionCard>
        </Col>

        {/* 中列: Employment + Address */}
        <Col xs={24} sm={24} md={8}>
          {/* Employment Section (绿色 - 对应截图的 Status/Employment) */}
          <EditableSectionCard
            title="Employment"
            headerColor="#52c41a"
            icon={<BankOutlined />}
            isEditing={editingSection === 'employment'}
            onEdit={() => handleEdit('employment')}
            onSave={() => handleSave('employment')}
            onCancel={() => handleCancel('employment')}
            loading={saving === 'employment'}
            readView={
              <EmploymentSection employee={employee} form={employmentForm} isEditing={false} />
            }
          >
            <EmploymentSection employee={employee} form={employmentForm} isEditing={true} />
          </EditableSectionCard>

          {/* Address Section (默认灰色) */}
          <EditableSectionCard
            title="Address"
            headerColor="#d9d9d9"
            icon={<HomeOutlined />}
            isEditing={editingSection === 'address'}
            onEdit={() => handleEdit('address')}
            onSave={() => handleSave('address')}
            onCancel={() => handleCancel('address')}
            loading={saving === 'address'}
            readView={<AddressSection employee={employee} form={addressForm} isEditing={false} />}
          >
            <AddressSection employee={employee} form={addressForm} isEditing={true} />
          </EditableSectionCard>
        </Col>

        {/* 右列: Emergency Contact */}
        <Col xs={24} sm={24} md={8}>
          {/* Emergency Contact Section (橙色/红色) */}
          <EditableSectionCard
            title="Emergency Contacts"
            headerColor="#ff4d4f"
            icon={<SafetyOutlined />}
            isEditing={editingSection === 'emergencyContact'}
            onEdit={() => handleEdit('emergencyContact')}
            onSave={() => handleSave('emergencyContact')}
            onCancel={() => handleCancel('emergencyContact')}
            loading={saving === 'emergencyContact'}
            readView={
              <EmergencyContactSection
                employee={employee}
                form={emergencyContactForm}
                isEditing={false}
              />
            }
          >
            <EmergencyContactSection
              employee={employee}
              form={emergencyContactForm}
              isEditing={true}
            />
          </EditableSectionCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PersonalInfoPage;
