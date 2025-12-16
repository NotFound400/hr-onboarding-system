import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Row, Col, Descriptions, Tag } from 'antd';
import type { FormInstance } from 'antd';
import type { Employee } from '../../../../types';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface EmploymentSectionProps {
  employee: Employee | null;
  form: FormInstance;
  isEditing: boolean;
}

const EmploymentSection: React.FC<EmploymentSectionProps> = ({
  employee,
  form,
  isEditing,
}) => {
  useEffect(() => {
    if (isEditing && employee) {
      form.setFieldsValue({
        title: (employee as any).title || '',
        startDate: employee.startDate ? dayjs(employee.startDate) : null,
        endDate: employee.endDate ? dayjs(employee.endDate) : null,
      });
    }
  }, [isEditing, employee, form]);

  const getCurrentVisa = () => {
    if (!employee?.visaStatus || employee.visaStatus.length === 0) {
      return null;
    }

    const sortedVisas = [...employee.visaStatus].sort((a, b) => {
      const dateA = a.startDate || '';
      const dateB = b.startDate || '';
      return dateB.localeCompare(dateA);
    });

    return sortedVisas[0];
  };

  const renderReadView = () => {
    if (!employee) return null;

    const currentVisa = getCurrentVisa();

    return (
      <Descriptions column={1} size="small" colon={false}>
        <Descriptions.Item label="Title">
          <strong>{(employee as any).title || 'N/A'}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Start Date">
          {employee.startDate ? dayjs(employee.startDate).format('YYYY-MM-DD') : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="End Date">
          {employee.endDate ? dayjs(employee.endDate).format('YYYY-MM-DD') : 'Ongoing'}
        </Descriptions.Item>
        <Descriptions.Item label="Current Visa">
          {currentVisa ? (
            <div>
              <Tag color="blue" style={{ marginBottom: 4 }}>{currentVisa.visaType}</Tag>
              {currentVisa.startDate && currentVisa.endDate && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  Valid: {dayjs(currentVisa.startDate).format('YYYY-MM-DD')} to{' '}
                  {dayjs(currentVisa.endDate).format('YYYY-MM-DD')}
                </div>
              )}
            </div>
          ) : (
            'N/A'
          )}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const renderEditForm = () => {
    const currentVisa = getCurrentVisa();

    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Job Title"
        >
          <Input placeholder="e.g., Software Engineer" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder="Select Start Date"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="End Date">
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder="Select End Date (optional)"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Current Visa Status">
          {currentVisa ? (
            <div>
              <Tag color="blue">{currentVisa.visaType}</Tag>
              {currentVisa.startDate && currentVisa.endDate && (
                <span style={{ marginLeft: 8, color: '#666' }}>
                  Valid from {dayjs(currentVisa.startDate).format('YYYY-MM-DD')} to{' '}
                  {dayjs(currentVisa.endDate).format('YYYY-MM-DD')}
                </span>
              )}
              <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
                * To update visa status, please use the Visa Status Management section
              </div>
            </div>
          ) : (
            <span style={{ color: '#999' }}>No visa status recorded</span>
          )}
        </Form.Item>
      </Form>
    );
  };

  return isEditing ? renderEditForm() : renderReadView();
};

/**
 * 导出雇佣信息数据提取函数
 */
const formatDateTime = (value?: Dayjs) =>
  value ? dayjs(value).startOf('day').format('YYYY-MM-DD[T]HH:mm:ss') : undefined;

export const extractEmploymentData = (formValues: any) => {
  return {
    title: formValues.title,
    startDate: formatDateTime(formValues.startDate),
    endDate: formatDateTime(formValues.endDate),
  };
};

export default EmploymentSection;
