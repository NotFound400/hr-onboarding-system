/**
 * Onboarding Form Page
 * 员工 Onboarding 表单页面 - 多步骤表单
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Button, Steps, Row, Col, message, Divider } from 'antd';
import { PageContainer } from '../../../components/common/PageContainer';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  submitOnboardingForm,
  selectCurrentStep,
  selectFormData,
  selectOnboardingLoading,
  selectOnboardingError,
  selectSubmitSuccess,
  setCurrentStep,
  saveFormData,
  clearError,
} from '../../../store/slices/onboardingSlice';
import { selectUser } from '../../../store/slices/authSlice';
import type { CreateEmployeeRequest } from '../../../types';
import dayjs from 'dayjs';

/**
 * OnboardingFormPage Component
 * 
 * 按 frontend_requirement.md 4.2 定义:
 * - 分段表单（个人信息 → 紧急联系人 → 地址/签证）
 * - Reference 和 Emergency Contact 必填
 * - 驾照信息必填
 * - 保存并继续 → /onboarding/docs
 */
const OnboardingFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentStep = useAppSelector(selectCurrentStep);
  const formData = useAppSelector(selectFormData);
  const loading = useAppSelector(selectOnboardingLoading);
  const error = useAppSelector(selectOnboardingError);
  const submitSuccess = useAppSelector(selectSubmitSuccess);
  const user = useAppSelector(selectUser);

  // 初始化表单数据 - 步骤切换时恢复已保存的数据
  useEffect(() => {
    if (formData) {
      // 将日期字符串转换为 dayjs 对象
      const formValues: any = { ...formData };
      if (formData.dob) formValues.dob = dayjs(formData.dob);
      if (formData.startDate) formValues.startDate = dayjs(formData.startDate);
      if (formData.driverLicenseExpiration) {
        formValues.driverLicenseExpiration = dayjs(formData.driverLicenseExpiration);
      }
      if (formData.visaStartDate) formValues.visaStartDate = dayjs(formData.visaStartDate);
      if (formData.visaEndDate) formValues.visaEndDate = dayjs(formData.visaEndDate);
      
      // 使用 setTimeout 确保在 DOM 渲染后设置值
      setTimeout(() => {
        form.setFieldsValue(formValues);
      }, 0);
    }
  }, [formData, form, currentStep]); // 添加 currentStep，确保步骤切换时恢复数据

  // 提交成功后跳转
  useEffect(() => {
    if (submitSuccess) {
      message.success('Onboarding form submitted successfully!');
      navigate('/onboarding/docs');
    }
  }, [submitSuccess, navigate]);

  // 显示错误信息
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  /**
   * 步骤配置
   */
  const steps = [
    { title: 'Personal Info' },
    { title: 'Contacts' },
    { title: 'Address & Visa' },
  ];

  /**
   * 处理下一步
   */
  const handleNext = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      // 转换 dayjs 对象为字符串
      const serializedValues: any = {};
      Object.keys(values).forEach(key => {
        const value = values[key];
        if (value && value.format) {
          serializedValues[key] = value.format('YYYY-MM-DD');
        } else {
          serializedValues[key] = value;
        }
      });
      
      // 合并 Redux 已有数据和当前步骤数据
      const mergedData = {
        ...(formData || {}),
        ...serializedValues,
      };
      
      dispatch(saveFormData(mergedData));
      
      if (currentStep < steps.length - 1) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  /**
   * 处理上一步
   */
  const handlePrev = () => {
    if (currentStep > 0) {
      const values = form.getFieldsValue();
      
      // 转换 dayjs 对象为字符串
      const serializedValues: any = {};
      Object.keys(values).forEach(key => {
        const value = values[key];
        if (value && value.format) {
          serializedValues[key] = value.format('YYYY-MM-DD');
        } else {
          serializedValues[key] = value;
        }
      });
      
      // 合并 Redux 已有数据和当前步骤数据
      const mergedData = {
        ...(formData || {}),
        ...serializedValues,
      };
      
      dispatch(saveFormData(mergedData));
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  /**
   * 处理表单提交
   * 关键逻辑：将扁平表单数据转换为嵌套 DTO 结构
   * 
   * 数据转换 (按 requirement.md 要求在页面层实现):
   * - referenceName → contacts[0] { firstName, lastName }
   * - emergencyName → contacts[1] { firstName, lastName }
   * - addressLine1/2 → address[0] { addressLine1, addressLine2, city, state, zipCode }
   * - visaType → visaStatus[0] { visaType, startDate, endDate }
   */
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      
      // 保存当前步骤的数据
      const currentStepValues = form.getFieldsValue();
      
      // 序列化当前步骤的日期字段
      const serializedCurrentStep: any = { ...currentStepValues };
      if (currentStepValues.dob && currentStepValues.dob.format) {
        serializedCurrentStep.dob = currentStepValues.dob.format('YYYY-MM-DD');
      }
      if (currentStepValues.startDate && currentStepValues.startDate.format) {
        serializedCurrentStep.startDate = currentStepValues.startDate.format('YYYY-MM-DD');
      }
      if (currentStepValues.driverLicenseExpiration && currentStepValues.driverLicenseExpiration.format) {
        serializedCurrentStep.driverLicenseExpiration = currentStepValues.driverLicenseExpiration.format('YYYY-MM-DD');
      }
      if (currentStepValues.visaStartDate && currentStepValues.visaStartDate.format) {
        serializedCurrentStep.visaStartDate = currentStepValues.visaStartDate.format('YYYY-MM-DD');
      }
      if (currentStepValues.visaEndDate && currentStepValues.visaEndDate.format) {
        serializedCurrentStep.visaEndDate = currentStepValues.visaEndDate.format('YYYY-MM-DD');
      }
      
      // 合并 Redux 中所有步骤的数据
      const allFormData = {
        ...(formData || {}),
        ...serializedCurrentStep,
      };
      
      dispatch(saveFormData(allFormData));

      if (!user) {
        message.error('User not authenticated');
        return;
      }

      // 数据转换：扁平表单 → 嵌套 CreateEmployeeRequest 结构
      // 使用合并后的完整数据
      const values = allFormData;
      
      const createEmployeeRequest: CreateEmployeeRequest = {
        userId: user.id,
        firstName: values.firstName || '',
        lastName: values.lastName || '',
        middleName: values.middleName || '',
        preferredName: values.preferredName || '',
        email: values.email || '',
        cellPhone: values.cellPhone || '',
        alternatePhone: values.alternatePhone || '',
        gender: values.gender || 'Male',
        SSN: values.ssn || '',
        // 日期字段已经是字符串格式（从 Redux 或刚转换的）
        DOB: values.dob || '',
        startDate: values.startDate || '',
        driverLicense: values.driverLicense || '',
        driverLicenseExpiration: values.driverLicenseExpiration || '',
        
        // 转换: referenceName + emergencyName → contacts 数组
        contact: [
          {
            type: 'Reference' as const,
            firstName: values.referenceName?.split(' ')[0] || '',
            lastName: values.referenceName?.split(' ').slice(1).join(' ') || '',
            phone: values.referencePhone || '',
            email: values.referenceEmail || '',
            relationship: values.referenceRelationship || '',
          },
          {
            type: 'Emergency' as const,
            firstName: values.emergencyName?.split(' ')[0] || '',
            lastName: values.emergencyName?.split(' ').slice(1).join(' ') || '',
            phone: values.emergencyPhone || '',
            email: values.emergencyEmail || '',
            relationship: values.emergencyRelationship || '',
          },
        ],
        
        // 转换: 扁平地址字段 → address 数组
        address: [
          {
            type: 'Primary' as const,
            addressLine1: values.addressLine1 || '',
            addressLine2: values.addressLine2 || '',
            city: values.city || '',
            state: values.state || '',
            zipCode: values.zipCode || '',
          },
        ],
        
        // 转换: 扁平签证字段 → visaStatus 数组
        visaStatus: [
          {
            visaType: values.visaType || 'H1-B',
            activeFlag: true,
            // 日期字段已经是字符串格式
            startDate: values.visaStartDate || '',
            endDate: values.visaEndDate || '',
            lastModificationDate: new Date().toISOString(),
          },
        ],
      };

      // Mock API: 打印请求数据
      console.log('[Mock Request] createEmployee:', createEmployeeRequest);

      // 调用 Redux Thunk（已完成数据转换）
      await dispatch(submitOnboardingForm(createEmployeeRequest)).unwrap();

    } catch (error) {
      message.error('Failed to submit onboarding form');
    }
  };

  /**
   * 渲染步骤 0: 个人信息
   */
  const renderPersonalInfo = () => (
    <>
      <Divider><strong>Basic Information</strong></Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="middleName" label="Middle Name">
            <Input placeholder="Middle Name" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="preferredName" label="Preferred Name">
            <Input placeholder="Preferred Name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select placeholder="Select Gender">
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Female">Female</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="cellPhone"
            label="Cell Phone"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="123-456-7890" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="alternatePhone" label="Alternate Phone">
            <Input placeholder="098-765-4321" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="ssn"
            label="SSN"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="123-45-6789" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="dob"
            label="Date of Birth"
            rules={[{ required: true, message: 'Required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider><strong>Driver License</strong></Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="driverLicense"
            label="License Number"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="DL123456" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="driverLicenseExpiration"
            label="Expiration Date"
            rules={[{ required: true, message: 'Required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  /**
   * 渲染步骤 1: 联系人信息
   */
  const renderContacts = () => (
    <>
      <Divider><strong>Reference Contact (Required)</strong></Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="referenceName"
            label="Full Name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="Jane Smith" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="referencePhone"
            label="Phone"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="111-222-3333" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="referenceEmail"
            label="Email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="jane.smith@example.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="referenceRelationship"
            label="Relationship"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="Former Manager" />
          </Form.Item>
        </Col>
      </Row>

      <Divider><strong>Emergency Contact (Required)</strong></Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="emergencyName"
            label="Full Name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="Mary Doe" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="emergencyPhone"
            label="Phone"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="444-555-6666" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="emergencyEmail"
            label="Email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="mary.doe@example.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="emergencyRelationship"
            label="Relationship"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="Spouse" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  /**
   * 渲染步骤 2: 地址和签证信息
   */
  const renderAddressAndVisa = () => (
    <>
      <Divider><strong>Current Address</strong></Divider>
      <Form.Item
        name="addressLine1"
        label="Address Line 1"
        rules={[{ required: true, message: 'Required' }]}
      >
        <Input placeholder="123 Main St" />
      </Form.Item>
      <Form.Item name="addressLine2" label="Address Line 2">
        <Input placeholder="Apt 4B" />
      </Form.Item>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="New York" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="state"
            label="State"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="NY" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="zipCode"
            label="Zip Code"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="10001" />
          </Form.Item>
        </Col>
      </Row>

      <Divider><strong>Visa Information</strong></Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="visaType"
            label="Visa Type"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select placeholder="Select Visa Type">
              <Select.Option value="H1B">H1B</Select.Option>
              <Select.Option value="L2">L2</Select.Option>
              <Select.Option value="F1">F1</Select.Option>
              <Select.Option value="H4">H4</Select.Option>
              <Select.Option value="OPT">OPT</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="visaStartDate"
            label="Start Date"
            rules={[{ required: true, message: 'Required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="visaEndDate"
            label="End Date"
            rules={[{ required: true, message: 'Required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <PageContainer title="Employee Onboarding">
      {/* Steps 导航 */}
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      {/* 表单 */}
      <Form form={form} layout="vertical">
        {currentStep === 0 && renderPersonalInfo()}
        {currentStep === 1 && renderContacts()}
        {currentStep === 2 && renderAddressAndVisa()}

        {/* 按钮组 */}
        <div style={{ marginTop: 32, textAlign: 'right' }}>
          {currentStep > 0 && (
            <Button onClick={handlePrev} style={{ marginRight: 8 }}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              Save & Continue
            </Button>
          )}
        </div>
      </Form>
    </PageContainer>
  );
};

export default OnboardingFormPage;
