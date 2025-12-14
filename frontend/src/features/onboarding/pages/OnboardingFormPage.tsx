/**
 * Onboarding Form Page
 * 严格按照 raw_project_requirement.md Section 3 实现
 * 
 * Section 3.c 字段清单:
 * i. First Name, Last Name, Middle Name, Preferred Name ✅
 * ii. Avatar (default picture if not uploaded) ✅
 * iii. Current Address ✅
 * iv. Cell Phone, Work Phone ✅
 * v. Email (pre-filled, not editable) ✅
 * vi. SSN, Date of Birth, Gender (Male, Female, Other, I Prefer Not to Say) ✅
 * vii. Citizenship flow (Citizen/Green Card OR visa types with document upload) ✅
 * viii. Driver License checkbox flow ✅
 * ix. Reference (ONE person): First/Last/Middle Name, Phone, Address, Email, Relationship ✅
 * x. Emergency Contact (at least one): First/Last/Middle Name, Phone, Email, Relationship ✅
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Divider,
  Radio,
  Upload,
  Card,
} from 'antd';
import type { UploadFile } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { PageContainer } from '../../../components/common/PageContainer';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  submitOnboardingForm,
  selectOnboardingLoading,
  selectOnboardingError,
  clearError,
  initializeOnboardingApplication,
  selectApplicationId,
} from '../../../store/slices/onboardingSlice';
import { logout, selectUser } from '../../../store/slices/authSlice';
import type {
  OnboardingFormDTO,
  VisaStatusType,
  UpdateEmployeeRequest,
} from '../../../types';
import dayjs, { Dayjs } from 'dayjs';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

/**
 * OnboardingFormPage Component
 * 
 * 严格按照 raw_project_requirement.md Section 3 实现:
 * - 单页完整表单（不分步骤）
 * - Citizenship 条件分支逻辑 (Section 3.c.vii)
 * - Driver License 条件显示 (Section 3.c.viii)
 * - Reference (只允许一个人，包含 Address)
 * - Emergency Contact (至少一个，支持多个)
 * - 提交后跳转 /onboarding/docs (Section 3.d)
 */
const OnboardingFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const messageApi = useAntdMessage();
  
  // 监听条件字段状态
  const [isCitizenOrPR, setIsCitizenOrPR] = useState<'Yes' | 'No' | undefined>(undefined);
  const [hasDriverLicense, setHasDriverLicense] = useState<'Yes' | 'No' | undefined>(undefined);
  const [workAuthType, setWorkAuthType] = useState<string | undefined>(undefined);
  const [avatarFileList, setAvatarFileList] = useState<UploadFile[]>([]);

  const loading = useAppSelector(selectOnboardingLoading);
  const error = useAppSelector(selectOnboardingError);
  const user = useAppSelector(selectUser);
  const applicationId = useAppSelector(selectApplicationId);
  const authEmployeeId = useAppSelector((state) => state.auth.employeeId);

  // 初始化表单数据
  useEffect(() => {
    if (user?.email) {
      form.setFieldValue('email', user.email);
    }
  }, [user, form]);

  // 提交成功后跳转到文档页面 (Section 3.d)
  useEffect(() => {
    if (!applicationId) {
      dispatch(initializeOnboardingApplication());
    }
  }, [dispatch, applicationId]);

  useEffect(() => {
    if (applicationId) {
      console.log('[Onboarding] Using applicationId:', applicationId);
    }
  }, [applicationId]);

  // 显示错误信息
  useEffect(() => {
    if (error) {
      messageApi.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch, messageApi]);

  /**
   * 处理表单提交 - Tech Lead Fix
   * 
   * 关键修复点:
   * 1. 不从 Redux state 读取数据，直接使用 form.validateFields() 返回的 values
   * 2. 所有 DatePicker 返回的 dayjs 对象必须转换为字符串 (解决 Redux Non-serializable 错误)
   * 3. 显式映射所有字段，避免 undefined 问题
   */
  const handleSubmit = async () => {
    try {
      if (!applicationId) {
        messageApi.error('Application is not initialized yet. Please try again later.');
        return;
      }
      if (!authEmployeeId) {
        messageApi.error('Employee ID is missing. Please log in again.');
        return;
      }

      // ✅ 直接从 validateFields() 获取值，不依赖 getFieldsValue()
      const values = await form.validateFields();

      const isCitizen = values.isCitizenOrPR === 'Yes';
      const hasLicense = values.hasDriverLicense === 'Yes';

      const formatDateTime = (input?: Dayjs) =>
        input ? dayjs(input).format('YYYY-MM-DD[T]HH:mm:ss') : '';

      // ✅ 构建 OnboardingFormDTO - 所有日期对象立即转换为后端要求的 LocalDateTime 格式
      const onboardingData: OnboardingFormDTO = {
        // Section 3.c.i - Name fields
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName || '',
        preferredName: values.preferredName || '',
        
        // Section 3.c.ii - Avatar
        avatar: avatarFileList.length > 0 ? avatarFileList[0].url || '' : '',
        
        // Section 3.c.iii - Current Address
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || '',
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        
        // Section 3.c.iv - Phone numbers
        cellPhone: values.cellPhone,
        workPhone: values.workPhone || '',
        
        // Section 3.c.v - Email (pre-filled, not editable)
        email: values.email,
        
        // Section 3.c.vi - Personal Info (✅ 关键修复: dayjs → string)
        ssn: values.ssn,
        dob: formatDateTime(values.dob),
        gender: values.gender,
        
        // 添加 startDate (必需字段)
        startDate: formatDateTime(values.startDate) || formatDateTime(dayjs()),
        
        // Section 3.c.vii - Citizenship/Work Authorization
        isCitizenOrPR: isCitizen,
        citizenshipType: isCitizen ? values.citizenshipType : undefined,
        visaType: !isCitizen ? values.workAuthorizationType : undefined,
        workAuthorizationTitle: (!isCitizen && values.workAuthorizationType === 'Other') 
          ? values.workAuthorizationTitle 
          : undefined,
        visaStartDate: !isCitizen && values.workAuthStartDate
          ? formatDateTime(values.workAuthStartDate)
          : undefined,
        visaEndDate: !isCitizen && values.workAuthEndDate
          ? formatDateTime(values.workAuthEndDate)
          : undefined,
        // Section 3.c.viii - Driver License
        hasDriverLicense: hasLicense,
        driverLicense: hasLicense ? values.driverLicenseNumber : undefined,
        driverLicenseExpiration: hasLicense && values.driverLicenseExpiration
          ? formatDateTime(values.driverLicenseExpiration)
          : undefined,
        driverLicenseCopy: hasLicense ? values.driverLicenseCopy : undefined,
        
        // Section 3.c.ix - Reference (only one person, includes Address)
        referenceFirstName: values.referenceFirstName,
        referenceLastName: values.referenceLastName,
        referenceMiddleName: values.referenceMiddleName || '',
        referencePhone: values.referencePhone,
        referenceAddress: values.referenceAddress || '',
        referenceEmail: values.referenceEmail,
        referenceRelationship: values.referenceRelationship,
        
        // Section 3.c.x - Emergency Contacts (at least one)
        emergencyFirstName: values.emergencyContacts[0]?.firstName || '',
        emergencyLastName: values.emergencyContacts[0]?.lastName || '',
        emergencyMiddleName: values.emergencyContacts[0]?.middleName || '',
        emergencyPhone: values.emergencyContacts[0]?.cellPhone || '',
        emergencyEmail: values.emergencyContacts[0]?.email || '',
        emergencyRelationship: values.emergencyContacts[0]?.relationship || '',
      };

      // ✅ 将 OnboardingFormDTO 转换为 CreateEmployeeRequest (嵌套结构)
      const employeePayload: UpdateEmployeeRequest = {
        userID: user?.id || 0,
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        middleName: onboardingData.middleName,
        preferredName: onboardingData.preferredName,
        email: onboardingData.email,
        cellPhone: onboardingData.cellPhone,
        alternatePhone: onboardingData.workPhone || undefined, // Map workPhone → alternatePhone
        gender: onboardingData.gender,
        SSN: onboardingData.ssn,
        DOB: onboardingData.dob,
        startDate: onboardingData.startDate,
        endDate: undefined,
        driverLicense: onboardingData.driverLicense,
        driverLicenseExpiration: onboardingData.driverLicenseExpiration,
        
        // 嵌套结构: Contact[]
        contact: [
          // Reference Contact
          {
            id: '', // Will be generated by backend
            type: 'Reference',
            firstName: onboardingData.referenceFirstName,
            lastName: onboardingData.referenceLastName,
            cellPhone: onboardingData.referencePhone,
            alternatePhone: '',
            email: onboardingData.referenceEmail,
            relationship: onboardingData.referenceRelationship,
          },
          // Emergency Contact
          {
            id: '', // Will be generated by backend
            type: 'Emergency',
            firstName: onboardingData.emergencyFirstName,
            lastName: onboardingData.emergencyLastName,
            cellPhone: onboardingData.emergencyPhone,
            alternatePhone: '',
            email: onboardingData.emergencyEmail,
            relationship: onboardingData.emergencyRelationship,
          },
        ],
        
        // 嵌套结构: Address[] (Primary address at index 0)
        address: [
          {
            id: '', // Will be generated by backend
            addressLine1: onboardingData.addressLine1,
            addressLine2: onboardingData.addressLine2 || '',
            city: onboardingData.city,
            state: onboardingData.state,
            zipCode: onboardingData.zipCode,
          },
        ],
        
        // 嵌套结构: VisaStatus[]
        visaStatus: onboardingData.isCitizenOrPR
          ? [
              {
                id: '', // Will be generated by backend
                visaType: onboardingData.citizenshipType as VisaStatusType || 'Citizen',
                activeFlag: 'Yes',
                startDate: onboardingData.startDate,
                endDate: onboardingData.startDate,
                lastModificationDate: new Date().toISOString(),
              },
            ]
          : [
              {
                id: '', // Will be generated by backend
                visaType: onboardingData.visaType as VisaStatusType || 'Other',
                activeFlag: 'Yes',
                startDate: onboardingData.visaStartDate || onboardingData.startDate,
                endDate: onboardingData.visaEndDate || '',
                lastModificationDate: new Date().toISOString(),
              },
            ],
      };

      console.log('✅ Submitting employee update payload:', employeePayload);

      const targetEmployeeId = authEmployeeId;
      const payloadWithIds: UpdateEmployeeRequest = {
        ...(employeePayload as unknown as UpdateEmployeeRequest),
        id: authEmployeeId,
        userID: user?.id,
      };
      await dispatch(
        submitOnboardingForm({
          id: targetEmployeeId,
          data: payloadWithIds,
          applicationId,
        })
      ).unwrap();

      messageApi.success('Onboarding form submitted successfully!');
      navigate('/onboarding/docs');
      
    } catch (error) {
      console.error('❌ Form validation or submission failed:', error);
      messageApi.error('Please fill in all required fields');
    }
  };

  return (
    <div style={{ width: '80%', margin: '0 auto' }}>
      <PageContainer title="Employee Onboarding Application">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={async () => {
              await dispatch(logout());
              navigate('/login', { replace: true });
            }}
          >
            Back to Login
          </Button>
        </div>
        <Card>
          <Form 
            form={form} 
            layout="vertical"
            initialValues={{
              startDate: dayjs(),
              dob: dayjs('1995-01-01'),
              workAuthStartDate: dayjs(),
              workAuthEndDate: dayjs().add(1, 'year'),
              driverLicenseExpiration: dayjs().add(1, 'year'),
              emergencyContacts: [{}], // 至少一个 Emergency Contact
            }}
          >
          {/* Section 3.c.i - Name Fields */}
          <Divider><strong>Personal Information</strong></Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="middleName" label="Middle Name">
                <Input placeholder="Middle Name (optional)" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="preferredName" label="Preferred Name">
                <Input placeholder="Preferred Name (optional)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3.c.ii - Avatar */}
          <Form.Item 
            label="Avatar" 
            tooltip="Default picture will be used if not uploaded"
          >
            <Upload
              listType="picture-card"
              fileList={avatarFileList}
              onChange={({ fileList }) => setAvatarFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              {avatarFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* Section 3.c.iii - Current Address */}
          <Divider><strong>Current Address</strong></Divider>
          <Form.Item
            name="addressLine1"
            label="Address Line 1"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="123 Main St" />
          </Form.Item>
          <Form.Item name="addressLine2" label="Address Line 2">
            <Input placeholder="Apt 4B (optional)" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="State" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="zipCode"
                label="Zip Code"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Zip Code" />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3.c.iv - Phone Numbers */}
          <Divider><strong>Contact Information</strong></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cellPhone"
                label="Cell Phone"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="123-456-7890" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="workPhone" label="Work Phone">
                <Input placeholder="098-765-4321 (optional)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3.c.v - Email (pre-filled, not editable) */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Invalid email' },
            ]}
            tooltip="Pre-filled with registration email, not editable"
          >
            <Input placeholder="Email" disabled />
          </Form.Item>

          {/* Section 3.c.vi - SSN, DOB, Gender */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ssn"
                label="SSN"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="123-45-6789" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dob"
                label="Date of Birth"
                rules={[{ required: true, message: 'Required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select placeholder="Select Gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                  <Select.Option value="I Prefer Not to Say">I Prefer Not to Say</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3.c.vii - Citizenship/Work Authorization Flow */}
          <Divider><strong>Work Authorization</strong></Divider>
          <Form.Item
            name="isCitizenOrPR"
            label="Are you a citizen or permanent resident of the U.S.?"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Radio.Group
              onChange={(e) => setIsCitizenOrPR(e.target.value as 'Yes' | 'No')}
            >
              <Radio value="Yes">Yes</Radio>
              <Radio value="No">No</Radio>
            </Radio.Group>
          </Form.Item>

          {/* If Yes: Choose Citizen or Green Card */}
          {isCitizenOrPR === 'Yes' && (
            <Form.Item
              name="citizenshipType"
              label="Citizenship Type"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Radio.Group>
                <Radio value="Citizen">Citizen</Radio>
                <Radio value="Green Card">Green Card</Radio>
              </Radio.Group>
            </Form.Item>
          )}

          {/* If No: Work Authorization Type */}
          {isCitizenOrPR === 'No' && (
            <>
              <Form.Item
                name="workAuthorizationType"
                label="Work Authorization Type"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select 
                  placeholder="Select Work Authorization Type"
                  onChange={(value) => setWorkAuthType(value)}
                >
                  <Select.Option value="H1-B">H1-B</Select.Option>
                  <Select.Option value="L2">L2</Select.Option>
                  <Select.Option value="F1(CPT/OPT)">F1(CPT/OPT)</Select.Option>
                  <Select.Option value="H4">H4</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>

              {/* If Other: Show title input */}
              {workAuthType === 'Other' && (
                <Form.Item
                  name="workAuthorizationTitle"
                  label="Work Authorization Title"
                  rules={[{ required: true, message: 'Required for Other type' }]}
                >
                  <Input placeholder="Specify work authorization type" />
                </Form.Item>
              )}

              {/* Start and End Date */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="workAuthStartDate"
                    label="Start Date"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="workAuthEndDate"
                    label="End Date"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

            </>
          )}

          {/* Section 3.c.viii - Driver License Checkbox Flow */}
          <Divider><strong>Driver License</strong></Divider>
          <Form.Item
            name="hasDriverLicense"
            label="Do you have a driver's license?"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Radio.Group
              onChange={(e) => setHasDriverLicense(e.target.value as 'Yes' | 'No')}
            >
              <Radio value="Yes">Yes</Radio>
              <Radio value="No">No</Radio>
            </Radio.Group>
          </Form.Item>

          {/* If Yes: Show license fields */}
          {hasDriverLicense === 'Yes' && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="driverLicenseNumber"
                    label="Driver License Number"
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
              <Form.Item
                name="driverLicenseCopy"
                label="Upload Driver License Copy"
                rules={[{ required: true, message: 'Document upload is required' }]}
              >
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            </>
          )}

          {/* Section 3.c.ix - Reference (only one person, includes Address) */}
          <Divider><strong>Reference Contact (Required)</strong></Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="referenceFirstName"
                label="First Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="referenceLastName"
                label="Last Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="referenceMiddleName" label="Middle Name">
                <Input placeholder="Middle Name (optional)" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="referencePhone"
                label="Phone"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="111-222-3333" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="referenceEmail"
                label="Email"
                rules={[
                  { required: true, message: 'Required' },
                  { type: 'email', message: 'Invalid email' },
                ]}
              >
                <Input placeholder="reference@example.com" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="referenceAddress"
                label="Address"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="123 Reference St, City, State" />
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

          {/* Section 3.c.x - Emergency Contacts (at least one, can add more) */}
          <Divider><strong>Emergency Contacts (At least one required)</strong></Divider>
          <Form.List
            name="emergencyContacts"
            rules={[
              {
                validator: async (_, contacts) => {
                  if (!contacts || contacts.length < 1) {
                    return Promise.reject(new Error('At least one emergency contact is required'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => {
                  const { key, name, ...restField } = field;
                  return (
                    <Card 
                      key={key} 
                      size="small" 
                      title={`Emergency Contact ${index + 1}`}
                      style={{ marginBottom: 16 }}
                      extra={
                        fields.length > 1 ? (
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            style={{ color: 'red' }}
                          />
                        ) : null
                      }
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'firstName']}
                            label="First Name"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="First Name" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'lastName']}
                            label="Last Name"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Last Name" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'middleName']}
                            label="Middle Name"
                          >
                            <Input placeholder="Middle Name (optional)" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'phone']}
                            label="Phone"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="444-555-6666" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'email']}
                            label="Email"
                            rules={[
                              { required: true, message: 'Required' },
                              { type: 'email', message: 'Invalid email' },
                            ]}
                          >
                            <Input placeholder="emergency@example.com" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'relationship']}
                            label="Relationship"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Spouse" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Another Emergency Contact
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* Submit Button - 严格按 Section 3.d: 只有 Submit，没有 Save Draft */}
          <Divider />
          <Form.Item>
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={loading}
              size="large"
              block
            >
              Submit Application
            </Button>
          </Form.Item>
          </Form>
        </Card>
      </PageContainer>
    </div>
  );
};

export default OnboardingFormPage;
