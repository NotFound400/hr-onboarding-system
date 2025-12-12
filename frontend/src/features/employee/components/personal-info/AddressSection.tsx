/**
 * AddressSection - 地址板块组件
 * 
 * Section 6(b).ii: Address Section
 * - Primary Address
 * - Secondary Address
 * 
 * 复杂嵌套数据处理：
 * - employee.address[] 数组，根据 type 字段区分 Primary/Secondary
 * - 编辑时需要正确映射和回填数据
 */

import React, { useEffect } from 'react';
import { Form, Input, Row, Col, Descriptions } from 'antd';
import type { FormInstance } from 'antd';
import type { Address, Employee } from '../../../../types';

interface AddressSectionProps {
  /** 员工数据 */
  employee: Employee | null;
  /** 表单实例 */
  form: FormInstance;
  /** 是否处于编辑模式 */
  isEditing: boolean;
}

/**
 * AddressSection Component
 */
const AddressSection: React.FC<AddressSectionProps> = ({
  employee,
  form,
  isEditing,
}) => {
  /**
   * 当进入编辑模式时，初始化表单数据
   */
  useEffect(() => {
    if (isEditing && employee) {
      // Use array index: address[0] = Primary, address[1] = Secondary
      const primaryAddr = employee.address?.[0];
      const secondaryAddr = employee.address?.[1];

      form.setFieldsValue({
        // Primary Address
        primaryAddressLine1: primaryAddr?.addressLine1 || '',
        primaryAddressLine2: primaryAddr?.addressLine2 || '',
        primaryCity: primaryAddr?.city || '',
        primaryState: primaryAddr?.state || '',
        primaryZipCode: primaryAddr?.zipCode || '',
        // Secondary Address
        secondaryAddressLine1: secondaryAddr?.addressLine1 || '',
        secondaryAddressLine2: secondaryAddr?.addressLine2 || '',
        secondaryCity: secondaryAddr?.city || '',
        secondaryState: secondaryAddr?.state || '',
        secondaryZipCode: secondaryAddr?.zipCode || '',
      });
    }
  }, [isEditing, employee, form]);

  /**
   * 渲染只读视图
   */
  const renderReadView = () => {
    if (!employee) return null;

    // Use array index: address[0] = Primary, address[1] = Secondary
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

  /**
   * 渲染编辑表单
   */
  const renderEditForm = () => {
    return (
      <Form form={form} layout="vertical">
        {/* Primary Address */}
        <h4 style={{ marginTop: 0, marginBottom: 16, color: '#1890ff' }}>Primary Address</h4>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="primaryAddressLine1"
              label="Address Line 1"
              rules={[{ required: true, message: 'Address Line 1 is required' }]}
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
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="primaryState"
              label="State"
              rules={[{ required: true, message: 'State is required' }]}
            >
              <Input placeholder="Enter state" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="primaryZipCode"
              label="Zip Code"
              rules={[
                { required: true, message: 'Zip code is required' },
                { pattern: /^\d{5}(-\d{4})?$/, message: 'Invalid zip code format' },
              ]}
            >
              <Input placeholder="Enter zip code" />
            </Form.Item>
          </Col>
        </Row>

        {/* Secondary Address */}
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

  // Primary Address (address[0], required)
  if (formValues.primaryAddressLine1) {
    addresses.push({
      id: '', // Will be generated by backend
      addressLine1: formValues.primaryAddressLine1,
      addressLine2: formValues.primaryAddressLine2 || '',
      city: formValues.primaryCity,
      state: formValues.primaryState,
      zipCode: formValues.primaryZipCode,
    });
  }

  // Secondary Address (address[1], optional)
  if (formValues.secondaryAddressLine1) {
    addresses.push({
      id: '', // Will be generated by backend
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
