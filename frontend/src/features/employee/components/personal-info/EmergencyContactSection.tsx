import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Space, Descriptions, Empty } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { Contact, Employee } from '../../../../types';

interface EmergencyContactSectionProps {
  employee: Employee | null;
  form: FormInstance;
  isEditing: boolean;
}

const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({
  employee,
  form,
  isEditing,
}) => {
  useEffect(() => {
    if (isEditing && employee) {
      const emergencyContacts = employee.contact?.filter(c => c.type === 'Emergency') || [];
      
      const formattedContacts = emergencyContacts.map(contact => ({
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.cellPhone,
        email: contact.email,
        relationship: contact.relationship,
      }));

      form.setFieldsValue({
        emergencyContacts: formattedContacts.length > 0 ? formattedContacts : [{}],
      });
    }
  }, [isEditing, employee, form]);

  const renderReadView = () => {
    if (!employee) return null;

    const emergencyContacts = employee.contact?.filter(c => c.type === 'Emergency') || [];

    if (emergencyContacts.length === 0) {
      return <Empty description="No emergency contacts" />;
    }

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {emergencyContacts.map((contact, index) => (
          <Card key={index} size="small" type="inner">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Full Name" span={2}>
                <strong>
                  {contact.firstName} {contact.lastName}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">{contact.cellPhone}</Descriptions.Item>
              <Descriptions.Item label="Email">{contact.email}</Descriptions.Item>
              <Descriptions.Item label="Relationship" span={2}>
                {contact.relationship}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ))}
      </Space>
    );
  };

  const renderEditForm = () => {
    return (
      <Form form={form} layout="vertical">
        <Form.List
          name="emergencyContacts"
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Card
                  key={field.key}
                  size="small"
                  type="inner"
                  title={
                    <Space>
                      <UserOutlined />
                      <span>Emergency Contact #{index + 1}</span>
                    </Space>
                  }
                  extra={
                    fields.length > 1 ? (
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                      >
                        Remove
                      </Button>
                    ) : null
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Space.Compact style={{ width: '100%' }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'firstName']}
                        label="First Name"
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="First Name" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'middleName']}
                        label="Middle Name"
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="Middle Name (optional)" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'lastName']}
                        label="Last Name"
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="Last Name" />
                      </Form.Item>
                    </Space.Compact>

                    <Space style={{ width: '100%' }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'phone']}
                        label="Phone"
                        rules={[
                          {
                            pattern: /^\d{3}-\d{3}-\d{4}$/,
                            message: 'Format: 123-456-7890',
                          },
                        ]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="123-456-7890" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'email']}
                        label="Email"
                        rules={[
                          { type: 'email', message: 'Invalid email format' },
                        ]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="email@example.com" />
                      </Form.Item>
                    </Space>

                    <Form.Item
                      {...field}
                      name={[field.name, 'relationship']}
                      label="Relationship"
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="e.g., Spouse, Parent, Sibling" />
                    </Form.Item>
                  </Space>
                </Card>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Emergency Contact
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    );
  };

  return isEditing ? renderEditForm() : renderReadView();
};

/**
 * 导出紧急联系人数据提取函数，供父组件保存时使用
 */
export const extractEmergencyContactData = (formValues: any): Contact[] => {
  const emergencyContacts = formValues.emergencyContacts || [];

  return emergencyContacts.map((contact: any) => ({
    id: '',
    type: 'Emergency',
    firstName: contact.firstName,
    lastName: contact.lastName,
    cellPhone: contact.phone,
    alternatePhone: '',
    email: contact.email,
    relationship: contact.relationship,
  }));
};

export default EmergencyContactSection;
