/**
 * NameSection - 姓名与基本信息板块组件
 * 
 * Section 6(b).i: Name (Legal Full Name)
 * 
 * 基础字段：
 * - firstName, lastName, middleName, preferredName
 * - Gender, Date of Birth
 * - SSN (masked display: ***-**-1234)
 */

import React, { useEffect } from 'react';
import { Form, Input, Row, Col, DatePicker, Select, Descriptions } from 'antd';
import type { FormInstance } from 'antd';
import type { Employee } from '../../../../types';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Option } = Select;

interface NameSectionProps {
  employee: Employee | null;
  form: FormInstance;
  isEditing: boolean;
}

/**
 * NameSection Component
 */
const NameSection: React.FC<NameSectionProps> = ({ employee, form, isEditing }) => {
  useEffect(() => {
    if (isEditing && employee) {
      form.setFieldsValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        middleName: employee.middleName || '',
        preferredName: employee.preferredName || '',
        gender: employee.gender,
        dateOfBirth: employee.DOB ? dayjs(employee.DOB) : null,
      });
    }
  }, [isEditing, employee, form]);

  /**
   * Mask SSN for display: ***-**-1234
   */
  const maskSSN = (ssn?: string): string => {
    if (!ssn) return 'N/A';
    const cleaned = ssn.replace(/\D/g, '');
    if (cleaned.length !== 9) return 'Invalid SSN';
    return `***-**-${cleaned.slice(-4)}`;
  };

  /**
   * 渲染只读视图 (Dashboard Style: 紧凑 Key-Value 对齐)
   */
  const renderReadView = () => {
    if (!employee) return null;

    return (
      <Descriptions column={1} size="small" colon={false}>
        <Descriptions.Item label="First Name">
          <strong>{employee.firstName}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Last Name">
          <strong>{employee.lastName}</strong>
        </Descriptions.Item>
        {employee.middleName && (
          <Descriptions.Item label="Middle Name">{employee.middleName}</Descriptions.Item>
        )}
        {employee.preferredName && (
          <Descriptions.Item label="Preferred Name">{employee.preferredName}</Descriptions.Item>
        )}
        <Descriptions.Item label="Gender">{employee.gender}</Descriptions.Item>
        <Descriptions.Item label="Date of Birth">
          {employee.DOB ? dayjs(employee.DOB).format('YYYY-MM-DD') : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="SSN">{maskSSN(employee.SSN)}</Descriptions.Item>
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
          <Col span={8}>
            <Form.Item
              name="firstName"
              label="First Name"
            >
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="middleName" label="Middle Name">
              <Input placeholder="Middle Name (optional)" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="lastName"
              label="Last Name"
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="preferredName" label="Preferred Name">
              <Input placeholder="Preferred Name (optional)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Gender"
            >
              <Select placeholder="Select Gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="I do not wish to answer">I do not wish to answer</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder="Select Date"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* SSN is not editable per requirement (Section 3.c.viii: SSN displayed but not editable) */}
        <Form.Item label="SSN">
          <Input disabled value={maskSSN(employee?.SSN)} />
        </Form.Item>
      </Form>
    );
  };

  return isEditing ? renderEditForm() : renderReadView();
};

/**
 * 导出姓名数据提取函数
 */
export const extractNameData = (formValues: any) => {
  const formatDate = (value?: Dayjs) =>
    value ? dayjs(value).startOf('day').format('YYYY-MM-DD[T]HH:mm:ss') : undefined;

  return {
    firstName: formValues.firstName,
    lastName: formValues.lastName,
    middleName: formValues.middleName || '',
    preferredName: formValues.preferredName || '',
    gender: formValues.gender,
    DOB: formValues.dateOfBirth
      ? formatDate(formValues.dateOfBirth)
      : undefined,
  };
};

export default NameSection;
