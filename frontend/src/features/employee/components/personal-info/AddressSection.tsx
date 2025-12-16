import React, { useEffect } from 'react';
import { Form, Input, Row, Col, Descriptions } from 'antd';
import type { FormInstance } from 'antd';
import type { Address, Employee } from '../../../../types';

interface AddressSectionProps {
  employee: Employee | null;
  form: FormInstance;
  isEditing: boolean;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  employee,
  form,
  isEditing,
}) => {
  useEffect(() => {
    if (isEditing && employee) {
      const primaryAddr = employee.address?.[0];
      const secondaryAddr = employee.address?.[1];

      form.setFieldsValue({
        primaryAddressLine1: primaryAddr?.addressLine1 || '',
        primaryAddressLine2: primaryAddr?.addressLine2 || '',
        primaryCity: primaryAddr?.city || '',
        primaryState: primaryAddr?.state || '',
        primaryZipCode: primaryAddr?.zipCode || '',
        secondaryAddressLine1: secondaryAddr?.addressLine1 || '',
        secondaryAddressLine2: secondaryAddr?.addressLine2 || '',
        secondaryCity: secondaryAddr?.city || '',
        secondaryState: secondaryAddr?.state || '',
        secondaryZipCode: secondaryAddr?.zipCode || '',
      });
    }
  }, [isEditing, employee, form]);

  const renderReadView = () => {
    if (!employee) return null;

    const primaryAddress = employee.address?.[0];
    const secondaryAddress = employee.address?.[1];

    return (
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Primary Address">
          {primaryAddress ? (
            <>
              <div>{primaryAddress.addressLine1}</div>
              {primaryAddress.addressLine2 && <div>{primaryAddress.addressLine2}</div>}
              <div>{`${primaryAddress.city}, ${primaryAddress.state}, ${primaryAddress.zipCode}`}</div>
            </>
          ) : (
            'N/A'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Secondary Address">
          {secondaryAddress ? (
            <>
              <div>{secondaryAddress.addressLine1}</div>
              {secondaryAddress.addressLine2 && <div>{secondaryAddress.addressLine2}</div>}
              <div>{`${secondaryAddress.city}, ${secondaryAddress.state}, ${secondaryAddress.zipCode}`}</div>
            </>
          ) : (
            'N/A'
          )}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const renderEditForm = () => {
    return (
      <Form form={form} layout="vertical">
        <h4 style={{ marginTop: 0, marginBottom: 16, color: '#1890ff' }}>Primary Address</h4>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="primaryAddressLine1"
              label="Address Line 1"
            >
              <Input placeholder="Enter address line 1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="primaryAddressLine2" label="Address Line 2">
              <Input placeholder="Enter address line 2 (optional)" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="primaryCity"
              label="City"
            >
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="primaryState"
              label="State"
            >
              <Input placeholder="Enter state" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="primaryZipCode"
              label="Zip Code"
              rules={[
                { pattern: /^\d{5}(-\d{4})?$/, message: 'Invalid zip code format' },
              ]}
            >
              <Input placeholder="Enter zip code" />
            </Form.Item>
          </Col>
        </Row>

        <h4 style={{ marginTop: 24, marginBottom: 16, color: '#1890ff' }}>
          Secondary Address (Optional)
        </h4>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="secondaryAddressLine1" label="Address Line 1">
              <Input placeholder="Enter address line 1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="secondaryAddressLine2" label="Address Line 2">
              <Input placeholder="Enter address line 2" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="secondaryCity" label="City">
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="secondaryState" label="State">
              <Input placeholder="Enter state" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="secondaryZipCode"
              label="Zip Code"
              rules={[
                { pattern: /^\d{5}(-\d{4})?$/, message: 'Invalid zip code format' },
              ]}
            >
              <Input placeholder="Enter zip code" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return isEditing ? renderEditForm() : renderReadView();
};

/**
 * 导出地址数据提取函数，供父组件保存时使用
 */
export const extractAddressData = (formValues: any): Address[] => {
  const addresses: Address[] = [];

  if (formValues.primaryAddressLine1) {
    addresses.push({
      id: '',
      addressLine1: formValues.primaryAddressLine1,
      addressLine2: formValues.primaryAddressLine2 || '',
      city: formValues.primaryCity,
      state: formValues.primaryState,
      zipCode: formValues.primaryZipCode,
    });
  }

  if (formValues.secondaryAddressLine1) {
    addresses.push({
      id: '',
      addressLine1: formValues.secondaryAddressLine1,
      addressLine2: formValues.secondaryAddressLine2 || '',
      city: formValues.secondaryCity,
      state: formValues.secondaryState,
      zipCode: formValues.secondaryZipCode,
    });
  }

  return addresses;
};

export default AddressSection;
