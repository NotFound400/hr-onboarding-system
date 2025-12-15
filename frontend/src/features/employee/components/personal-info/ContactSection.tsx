/**
 * ContactSection - 联系方式板块组件
 * 
 * Section 6(b).iii: Contact (Email, Cell Phone)
 * 
 * 字段：
 * - Personal Email, Work Email
 * - Cell Phone, Work Phone
 */

import React, { useEffect } from 'react';
import { Form, Input, Row, Col, Descriptions } from 'antd';
import type { FormInstance } from 'antd';
import type { Employee } from '../../../../types';
import { ContactType } from '../../../../types/enums';

interface ContactSectionProps {
  employee: Employee | null;
  form: FormInstance;
  isEditing: boolean;
}

/**
 * ContactSection Component
 */
const ContactSection: React.FC<ContactSectionProps> = ({ employee, form, isEditing }) => {
  useEffect(() => {
    if (isEditing && employee) {
      // Personal contact from employee.contact array
      const personalContact = employee.contact?.find(c => c.type === ContactType.REFERENCE);
      
      form.setFieldsValue({
        email: personalContact?.email || employee.email || '',
        cellPhone: personalContact?.cellPhone || employee.cellPhone || '',
        alternatePhone: personalContact?.alternatePhone || employee.alternatePhone || '',
      });
    }
  }, [isEditing, employee, form]);

  /**
   * 渲染只读视图 (Dashboard Style: 紧凑布局)
   */
  const renderReadView = () => {
    if (!employee) return null;

    const personalContact = employee.contact?.find(c => c.type === ContactType.REFERENCE);

    return (
      <Descriptions column={1} size="small" colon={false}>
        <Descriptions.Item label="Email">
          <strong>{personalContact?.email || employee.email || 'N/A'}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Cell Phone">
          <strong>{personalContact?.cellPhone || employee.cellPhone || 'N/A'}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Alternate Phone">
          {personalContact?.alternatePhone || employee.alternatePhone || 'N/A'}
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
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Invalid email format' },
              ]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="cellPhone"
              label="Cell Phone"
              rules={[
                { pattern: /^\+?1?-?\d{3}-\d{3}-\d{4}$/, message: 'Format: 123-456-7890 or +1-123-456-7890' },
              ]}
            >
              <Input placeholder="123-456-7890" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="alternatePhone"
              label="Alternate Phone"
              rules={[
                { pattern: /^\+?1?-?\d{3}-\d{3}-\d{4}$/, message: 'Format: 123-456-7890 or +1-123-456-7890' },
              ]}
            >
              <Input placeholder="123-456-7890 (optional)" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return isEditing ? renderEditForm() : renderReadView();
};

/**
 * 导出联系方式数据提取函数
 */
export const extractContactData = (formValues: any, employee: Employee) => {
  // Find existing personal contact to preserve other fields
  const existingPersonalContact = employee.contact?.find(c => c.type === ContactType.REFERENCE);

  const personalContact: Contact = {
    id: existingPersonalContact?.id || '',
    type: ContactType.REFERENCE,
    firstName: existingPersonalContact?.firstName || employee.firstName,
    lastName: existingPersonalContact?.lastName || employee.lastName,
    cellPhone: formValues.cellPhone,
    alternatePhone: formValues.alternatePhone || '',
    email: formValues.email,
    relationship: existingPersonalContact?.relationship || 'Self',
  };

  return {
    email: formValues.email,
    cellPhone: formValues.cellPhone,
    alternatePhone: formValues.alternatePhone || '',
    contact: [
      personalContact,
      ...(employee.contact?.filter(c => c.type !== ContactType.REFERENCE) || []),
    ],
  };
};

export default ContactSection;
