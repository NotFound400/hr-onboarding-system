import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '../../../components/common/PageContainer';
import { getHouseList, createHouse, deleteHouse } from '../../../services/api';
import type { House, CreateHouseRequest } from '../../../types';

/**
 * HR 房屋管理页面
 * - 展示所有房屋列表
 * - 添加新房屋
 * - 删除房屋
 */
export const HouseManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [houseList, setHouseList] = useState<House[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchHouseList();
  }, []);

  /**
   * 获取房屋列表
   */
  const fetchHouseList = async () => {
    try {
      setLoading(true);
      const data = await getHouseList();
      setHouseList(data);
    } catch (error) {
      message.error('Failed to load house list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开添加房屋弹窗
   */
  const handleAddHouse = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  /**
   * 提交新房屋
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const request: CreateHouseRequest = {
        address: values.address,
        landlord: {
          firstName: values.landlordFirstName,
          lastName: values.landlordLastName,
          phoneNumber: values.landlordPhone,
          email: values.landlordEmail,
        },
        facilityInfo: values.facilityInfo || '',
        maxOccupancy: parseInt(values.maxOccupancy, 10),
      };

      await createHouse(request);
      message.success('House added successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchHouseList(); // 刷新列表
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('Failed to add house');
      console.error(error);
    }
  };

  /**
   * 删除房屋
   */
  const handleDelete = async (houseId: number) => {
    try {
      await deleteHouse(houseId);
      message.success('House deleted successfully');
      fetchHouseList(); // 刷新列表
    } catch (error) {
      message.error('Failed to delete house');
      console.error(error);
    }
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<House> = [
    {
      title: 'House ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Landlord',
      key: 'landlord',
      render: (_, record) => (
        <span>
          {record.landlord ? `${record.landlord.firstName} ${record.landlord.lastName}` : record.landlordFullName || '-'}
        </span>
      ),
    },
    {
      title: 'Landlord Phone',
      key: 'landlordPhone',
      render: (_, record) => record.landlord?.cellPhone || record.landlordPhone || '-',
    },
    {
      title: 'Max Occupancy',
      dataIndex: 'maxOccupancy',
      key: 'maxOccupancy',
      width: 120,
      align: 'center',
    },
    {
      title: 'Current Occupancy',
      key: 'currentOccupancy',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const current = record.employeeList?.length || 0;
        const max = record.maxOccupancy || record.maxOccupant;
        const isFull = current >= (max || 0);
        return (
          <span style={{ color: isFull ? '#ff4d4f' : '#52c41a' }}>
            {current} / {max}
          </span>
        );
      },
    },
    {
      title: 'Facility Info',
      dataIndex: 'facilityInfo',
      key: 'facilityInfo',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="Delete House"
          description="Are you sure you want to delete this house? All residents will be unassigned."
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <PageContainer>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>House Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddHouse}>
          Add House
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={houseList}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} houses`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* 添加房屋弹窗 */}
      <Modal
        title="Add New House"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        width={600}
        okText="Submit"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Address"
            name="address"
            rules={[
              { required: true, message: 'Please enter house address' },
              { min: 10, message: 'Address must be at least 10 characters' },
            ]}
          >
            <Input.TextArea
              placeholder="e.g., 123 Main St, Apt 4B, New York, NY 10001"
              rows={2}
            />
          </Form.Item>

          <Space.Compact block>
            <Form.Item
              label="Landlord First Name"
              name="landlordFirstName"
              rules={[{ required: true, message: 'Required' }]}
              style={{ width: '50%', marginRight: 8 }}
            >
              <Input placeholder="John" />
            </Form.Item>

            <Form.Item
              label="Landlord Last Name"
              name="landlordLastName"
              rules={[{ required: true, message: 'Required' }]}
              style={{ width: '50%' }}
            >
              <Input placeholder="Smith" />
            </Form.Item>
          </Space.Compact>

          <Space.Compact block>
            <Form.Item
              label="Landlord Phone"
              name="landlordPhone"
              rules={[
                { required: true, message: 'Required' },
                { pattern: /^\d{10}$/, message: 'Phone must be 10 digits' },
              ]}
              style={{ width: '50%', marginRight: 8 }}
            >
              <Input placeholder="1234567890" maxLength={10} />
            </Form.Item>

            <Form.Item
              label="Landlord Email"
              name="landlordEmail"
              rules={[
                { required: true, message: 'Required' },
                { type: 'email', message: 'Invalid email' },
              ]}
              style={{ width: '50%' }}
            >
              <Input placeholder="landlord@example.com" />
            </Form.Item>
          </Space.Compact>

          <Form.Item
            label="Max Occupancy"
            name="maxOccupancy"
            rules={[
              { required: true, message: 'Required' },
              {
                validator: (_, value) => {
                  const num = parseInt(value, 10);
                  if (isNaN(num) || num < 1 || num > 20) {
                    return Promise.reject('Must be between 1 and 20');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" placeholder="4" min={1} max={20} />
          </Form.Item>

          <Form.Item
            label="Facility Information (Optional)"
            name="facilityInfo"
          >
            <Input.TextArea
              placeholder="e.g., 2 bedrooms, 1 bathroom, WiFi, parking, laundry"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};
