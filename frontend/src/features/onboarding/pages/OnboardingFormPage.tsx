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
  Alert,
} from 'antd';
import type { UploadFile } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
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
import { uploadDocument } from '../../../services/api/applicationApi';

/**
 * Format phone number to (XXX) XXX-XXXX
 * Only allows digits, max 10 digits
 */
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

/**
 * Format SSN to XXX-XX-XXXX
 * Only allows digits, max 9 digits
 */
const formatSSN = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

/**
 * Validate phone number has exactly 10 digits
 */
const validatePhone = (_: any, value: string) => {
  if (!value) return Promise.resolve();
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10) {
    return Promise.reject(new Error('Phone number must be exactly 10 digits'));
  }
  return Promise.resolve();
};

/**
 * Validate SSN has exactly 9 digits
 */
const validateSSN = (_: any, value: string) => {
  if (!value) return Promise.resolve();
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 9) {
    return Promise.reject(new Error('SSN must be exactly 9 digits'));
  }
  return Promise.resolve();
};

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
  const [eadFiles, setEadFiles] = useState<UploadFile[]>([]);
  const [driverLicenseFiles, setDriverLicenseFiles] = useState<UploadFile[]>([]);
  const [eadPreviewUrl, setEadPreviewUrl] = useState<string | null>(null);
  const [driverLicensePreviewUrl, setDriverLicensePreviewUrl] = useState<string | null>(null);
  const [initializingApp, setInitializingApp] = useState(false);

  const updatePreview = (
    file: File | undefined,
    setPreview: (url: string | null) => void,
    currentUrl: string | null
  ) => {
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setPreview(newUrl);
    } else {
      setPreview(null);
    }
  };

  const normalizeSingleFile = (
    event: UploadChangeParam<UploadFile> | UploadFile[]
  ): UploadFile[] => {
    if (Array.isArray(event)) {
      return event;
    }
    return event?.fileList?.slice(-1) || [];
  };

  const handleDriverLicenseUploadChange = (info: UploadChangeParam<UploadFile>) => {
    const list = info.fileList.slice(-1);
    setDriverLicenseFiles(list);
    updatePreview(
      list[0]?.originFileObj as File | undefined,
      setDriverLicensePreviewUrl,
      driverLicensePreviewUrl
    );
  };

  const handleEadUploadChange = (info: UploadChangeParam<UploadFile>) => {
    const list = info.fileList.slice(-1);
    setEadFiles(list);
    updatePreview(list[0]?.originFileObj as File | undefined, setEadPreviewUrl, eadPreviewUrl);
  };

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

  const handleInitializeApplication = async () => {
    try {
      setInitializingApp(true);
      await dispatch(initializeOnboardingApplication()).unwrap();
      messageApi.success('Application initialized successfully!');
    } catch (error: any) {
      messageApi.error(error || 'Failed to initialize application');
    } finally {
      setInitializingApp(false);
    }
  };

  useEffect(() => {
    if (hasDriverLicense !== 'Yes') {
      setDriverLicenseFiles([]);
      form.setFieldValue('driverLicenseCopy', []);
      if (driverLicensePreviewUrl) {
        URL.revokeObjectURL(driverLicensePreviewUrl);
        setDriverLicensePreviewUrl(null);
      }
    }
  }, [hasDriverLicense, form, driverLicensePreviewUrl]);

  useEffect(() => {
    if (isCitizenOrPR !== 'No') {
      setEadFiles([]);
      form.setFieldValue('eadDocument', []);
      if (eadPreviewUrl) {
        URL.revokeObjectURL(eadPreviewUrl);
        setEadPreviewUrl(null);
      }
    }
  }, [isCitizenOrPR, form, eadPreviewUrl]);

  useEffect(() => {
    return () => {
      if (eadPreviewUrl) {
        URL.revokeObjectURL(eadPreviewUrl);
      }
      if (driverLicensePreviewUrl) {
        URL.revokeObjectURL(driverLicensePreviewUrl);
      }
    };
  }, [eadPreviewUrl, driverLicensePreviewUrl]);

  useEffect(() => {
    if (error) {
      messageApi.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch, messageApi]);

  const uploadSupportingDocuments = async (appId: number) => {
    const uploads: Promise<unknown>[] = [];

    if (isCitizenOrPR === 'No') {
      const eadFile = eadFiles[0]?.originFileObj as File | undefined;
      if (eadFile) {
        uploads.push(
          uploadDocument({
            file: eadFile,
            metadata: {
              applicationId: appId,
              type: 'EAD',
              title: 'EAD Document',
              description: 'Employment Authorization Document',
            },
          })
        );
      }
    }

    if (hasDriverLicense === 'Yes') {
      const driverLicenseFile = driverLicenseFiles[0]?.originFileObj as File | undefined;
      if (driverLicenseFile) {
        uploads.push(
          uploadDocument({
            file: driverLicenseFile,
            metadata: {
              applicationId: appId,
              type: 'driverLicense',
              title: 'Driver License',
              description: 'Driver License Copy',
            },
          })
        );
      }
    }

    await Promise.all(uploads);
  };

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

      const values = await form.validateFields();

      const isCitizen = values.isCitizenOrPR === 'Yes';
      const hasLicense = values.hasDriverLicense === 'Yes';

      const formatDateTime = (input?: Dayjs) =>
        input ? dayjs(input).format('YYYY-MM-DD[T]HH:mm:ss') : '';

      const onboardingData: OnboardingFormDTO = {
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName || '',
        preferredName: values.preferredName || '',
        
        avatar: avatarFileList.length > 0 ? avatarFileList[0].url || '' : '',
        
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || '',
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        
        cellPhone: values.cellPhone,
        workPhone: values.workPhone || '',
        
        email: values.email,
        
        ssn: values.ssn,
        dob: formatDateTime(values.dob),
        gender: values.gender,
        
        startDate: formatDateTime(values.startDate) || formatDateTime(dayjs()),
        
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
        hasDriverLicense: hasLicense,
        driverLicense: hasLicense ? values.driverLicenseNumber : undefined,
        driverLicenseExpiration: hasLicense && values.driverLicenseExpiration
          ? formatDateTime(values.driverLicenseExpiration)
          : undefined,
        driverLicenseCopy: hasLicense ? values.driverLicenseCopy : undefined,
        
        referenceFirstName: values.referenceFirstName,
        referenceLastName: values.referenceLastName,
        referenceMiddleName: values.referenceMiddleName || '',
        referencePhone: values.referencePhone,
        referenceAddress: values.referenceAddress || '',
        referenceEmail: values.referenceEmail,
        referenceRelationship: values.referenceRelationship,
        
        emergencyFirstName: values.emergencyContacts[0]?.firstName || '',
        emergencyLastName: values.emergencyContacts[0]?.lastName || '',
        emergencyMiddleName: values.emergencyContacts[0]?.middleName || '',
        emergencyPhone: values.emergencyContacts[0]?.cellPhone || '',
        emergencyEmail: values.emergencyContacts[0]?.email || '',
        emergencyRelationship: values.emergencyContacts[0]?.relationship || '',
      };

      const employeePayload: UpdateEmployeeRequest = {
        userID: user?.id || 0,
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        middleName: onboardingData.middleName,
        preferredName: onboardingData.preferredName,
        email: onboardingData.email,
        cellPhone: onboardingData.cellPhone,
        alternatePhone: onboardingData.workPhone || undefined,
        gender: onboardingData.gender,
        SSN: onboardingData.ssn,
        DOB: onboardingData.dob,
        startDate: onboardingData.startDate,
        endDate: undefined,
        driverLicense: onboardingData.driverLicense,
        driverLicenseExpiration: onboardingData.driverLicenseExpiration,
        
        contact: [
          {
            id: '',
            type: 'Reference',
            firstName: onboardingData.referenceFirstName,
            lastName: onboardingData.referenceLastName,
            cellPhone: onboardingData.referencePhone,
            alternatePhone: '',
            email: onboardingData.referenceEmail,
            relationship: onboardingData.referenceRelationship,
          },
          {
            id: '',
            type: 'Emergency',
            firstName: onboardingData.emergencyFirstName,
            lastName: onboardingData.emergencyLastName,
            cellPhone: onboardingData.emergencyPhone,
            alternatePhone: '',
            email: onboardingData.emergencyEmail,
            relationship: onboardingData.emergencyRelationship,
          },
        ],
        
        address: [
          {
            id: '',
            addressLine1: onboardingData.addressLine1,
            addressLine2: onboardingData.addressLine2 || '',
            city: onboardingData.city,
            state: onboardingData.state,
            zipCode: onboardingData.zipCode,
          },
        ],
        
        visaStatus: onboardingData.isCitizenOrPR
          ? [
              {
                id: '',
                visaType: onboardingData.citizenshipType as VisaStatusType || 'Citizen',
                activeFlag: 'Yes',
                startDate: onboardingData.startDate,
                endDate: onboardingData.startDate,
                lastModificationDate: new Date().toISOString(),
              },
            ]
          : [
              {
                id: '',
                visaType: onboardingData.visaType as VisaStatusType || 'Other',
                activeFlag: 'Yes',
                startDate: onboardingData.visaStartDate || onboardingData.startDate,
                endDate: onboardingData.visaEndDate || '',
                lastModificationDate: new Date().toISOString(),
              },
            ],
      };

      try {
        await uploadSupportingDocuments(applicationId);
      } catch (uploadError: any) {
        messageApi.error(uploadError?.message || 'Failed to upload supporting documents');
        return;
      }

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
      navigate('/onboarding/submit-result');
      
    } catch (error) {
      messageApi.error('Please fill in all required fields');
    }
  };

  return (
    <div style={{ width: '80%', margin: '0 auto' }}>
      <PageContainer title="Employee Onboarding Application">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          {!applicationId && (
            <Button
              type="primary"
              size="large"
              loading={initializingApp}
              onClick={handleInitializeApplication}
              style={{ marginRight: 'auto' }}
            >
              Start Onboarding Application
            </Button>
          )}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={async () => {
              await dispatch(logout());
              navigate('/login', { replace: true });
            }}
            style={{ marginLeft: 'auto' }}
          >
            Back to Login
          </Button>
        </div>
        {!applicationId && (
          <Alert
            message="Click 'Start Onboarding Application' to begin"
            description="You must initialize your application before filling out the onboarding form."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Card>
          <Form 
            form={form} 
            layout="vertical"
            disabled={!applicationId}
            initialValues={{
              startDate: dayjs(),
              dob: dayjs('1995-01-01'),
              workAuthStartDate: dayjs(),
              workAuthEndDate: dayjs().add(1, 'year'),
              driverLicenseExpiration: dayjs().add(1, 'year'),
              driverLicenseCopy: [],
              eadDocument: [],
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

          <Divider><strong>Contact Information</strong></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cellPhone"
                label="Cell Phone"
                rules={[
                  { required: true, message: 'Required' },
                  { validator: validatePhone },
                ]}
                normalize={formatPhoneNumber}
              >
                <Input placeholder="(123) 456-7890" maxLength={14} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="workPhone" 
                label="Work Phone"
                rules={[{ validator: validatePhone }]}
                normalize={formatPhoneNumber}
              >
                <Input placeholder="(098) 765-4321 (optional)" maxLength={14} />
              </Form.Item>
            </Col>
          </Row>

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

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ssn"
                label="SSN"
                rules={[
                  { required: true, message: 'Required' },
                  { validator: validateSSN },
                ]}
                normalize={formatSSN}
              >
                <Input placeholder="123-45-6789" maxLength={11} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dob"
                label="Date of Birth"
                rules={[{ required: true, message: 'Required' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
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

              {workAuthType === 'Other' && (
                <Form.Item
                  name="workAuthorizationTitle"
                  label="Work Authorization Title"
                  rules={[{ required: true, message: 'Required for Other type' }]}
                >
                  <Input placeholder="Specify work authorization type" />
                </Form.Item>
              )}

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
              <Form.Item
                name="eadDocument"
                label="Upload Employment Authorization Document (EAD)"
                valuePropName="fileList"
                getValueFromEvent={normalizeSingleFile}
                rules={[{ required: true, message: 'EAD document is required' }]}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  fileList={eadFiles}
                  onChange={handleEadUploadChange}
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
              {eadPreviewUrl && (
                <Button
                  type="link"
                  style={{ paddingLeft: 0 }}
                  onClick={() => window.open(eadPreviewUrl, '_blank', 'noopener,noreferrer')}
                >
                  Preview EAD
                </Button>
              )}
            </>
          )}

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
                valuePropName="fileList"
                getValueFromEvent={normalizeSingleFile}
                rules={[{ required: true, message: 'Document upload is required' }]}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  fileList={driverLicenseFiles}
                  onChange={handleDriverLicenseUploadChange}
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
              {driverLicensePreviewUrl && (
                <Button
                  type="link"
                  style={{ paddingLeft: 0 }}
                  onClick={() =>
                    window.open(driverLicensePreviewUrl, '_blank', 'noopener,noreferrer')
                  }
                >
                  Preview Driver License
                </Button>
              )}
            </>
          )}

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
                rules={[
                  { required: true, message: 'Required' },
                  { validator: validatePhone },
                ]}
                normalize={formatPhoneNumber}
              >
                <Input placeholder="(111) 222-3333" maxLength={14} />
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
                            rules={[
                              { required: true, message: 'Required' },
                              { validator: validatePhone },
                            ]}
                            normalize={formatPhoneNumber}
                          >
                            <Input placeholder="(444) 555-6666" maxLength={14} />
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
