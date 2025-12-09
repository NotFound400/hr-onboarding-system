import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card } from 'antd';
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
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
        maxOccupant: parseInt(values.maxOccupancy, 10),
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            onClick={() => {
              setSelectedHouse(record);
              setIsDetailModalOpen(true);
            }}
          >
            View Details
          </Button>
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
        </Space>
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

      {/* Section HR.6.c - House Detail View Modal */}
      <Modal
        title={`House Details - ${selectedHouse?.address || ''}`}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedHouse(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedHouse && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Section HR.6.c.i - Basic House Information */}
            <Card title="Basic Information" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>Address:</strong> {selectedHouse.address}</div>
                <div>
                  <strong>Landlord:</strong>{' '}
                  {selectedHouse.landlord 
                    ? `${selectedHouse.landlord.firstName} ${selectedHouse.landlord.lastName}`
                    : selectedHouse.landlordFullName || 'N/A'}
                </div>
                <div>
                  <strong>Landlord Phone:</strong>{' '}
                  {selectedHouse.landlord?.cellPhone || selectedHouse.landlordPhone || 'N/A'}
                </div>
                <div>
                  <strong>Landlord Email:</strong>{' '}
                  {selectedHouse.landlord?.email || selectedHouse.landlordEmail || 'N/A'}
                </div>
                <div>
                  <strong>Number of People Living There:</strong>{' '}
                  {selectedHouse.employeeList?.length || 0} / {selectedHouse.maxOccupancy || selectedHouse.maxOccupant || 0}
                </div>
              </Space>
            </Card>

            {/* Section HR.6.c.ii - Facility Information */}
            <Card title="Facility Information" size="small">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {selectedHouse.facilityInfo || 'No facility information provided'}
              </div>
              <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
                Note: Facility counts (Beds, Mattresses, Tables, Chairs) should be managed in the Facility service.
              </div>
            </Card>

            {/* Section HR.6.c.iii - Facility Report (List View, 3-5 per page) */}
            <Card title="Facility Reports" size="small">
              <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                Facility Reports feature pending - will display Title + Date + Status format (3-5 per page, sorted by created date).
                <br />
                <small>
                  Section HR.6.c.iii requirement: When clicking a report, show Title, Description, Created By, Report Date, Status with timestamp, and Comments.
                  HR may add or update comments they created.
                </small>
              </div>
            </Card>

            {/* Section HR.6.d - Employee Information (List) */}
            <Card title="Residents" size="small">
              {selectedHouse.employeeList && selectedHouse.employeeList.length > 0 ? (
                <Table
                  dataSource={selectedHouse.employeeList}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Name',
                      key: 'name',
                      render: (_, emp: any) => emp.preferredName || emp.firstName,
                    },
                    {
                      title: 'Phone',
                      dataIndex: 'cellPhone',
                      key: 'cellPhone',
                    },
                    {
                      title: 'Email',
                      dataIndex: 'email',
                      key: 'email',
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      render: (_, emp: any) => (
                        <Button 
                          type="link" 
                          onClick={() => {
                            setIsDetailModalOpen(false);
                            window.location.href = `/hr/employees/${emp.id}`;
                          }}
                        >
                          View Profile
                        </Button>
                      ),
                    },
                  ]}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>No residents assigned</div>
              )}
            </Card>
          </Space>
        )}
      </Modal>
    </PageContainer>
  );
};
