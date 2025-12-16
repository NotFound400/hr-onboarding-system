import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../../components/common/PageContainer';
import {
  getHouseList,
  createHouse,
  deleteHouse,
  getAllLandlords,
  createLandlord,
  deleteLandlord,
} from '../../../services/api';
import type { House, CreateHouseRequest, Landlord, CreateLandlordRequest } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const { Option } = Select;

export const HouseManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [houseList, setHouseList] = useState<House[]>([]);
  const [landlordLoading, setLandlordLoading] = useState(false);
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLandlordModalOpen, setIsLandlordModalOpen] = useState(false);
  const [submittingLandlord, setSubmittingLandlord] = useState(false);
  const [deletingLandlordId, setDeletingLandlordId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [landlordForm] = Form.useForm();
  const messageApi = useAntdMessage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHouseList();
    fetchLandlords();
  }, []);

  const fetchHouseList = async () => {
    try {
      setLoading(true);
      const data = await getHouseList();
      const filteredData = data.filter((house) => {
        const current = house.numberOfEmployees ?? house.employeeList?.length ?? 0;
        const max = house.maxOccupant || 0;
        return max === 0 || current <= max;
      });
      setHouseList(filteredData);
    } catch (error) {
      messageApi.error('Failed to load house list');
    } finally {
      setLoading(false);
    }
  };

  const fetchLandlords = async () => {
    try {
      setLandlordLoading(true);
      const data = await getAllLandlords();
      setLandlords(data);
    } catch (error) {
      messageApi.error('Failed to load landlord list');
    } finally {
      setLandlordLoading(false);
    }
  };

  const handleAddHouse = () => {
    if (landlords.length === 0) {
      messageApi.warning('Please add a landlord before creating a new house.');
      return;
    }
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleAddLandlord = () => {
    landlordForm.resetFields();
    setIsLandlordModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!values.landlordId) {
        messageApi.error('Please select a landlord');
        return;
      }

      const selectedLandlord = landlords.find((landlord) => landlord.id === values.landlordId);
      if (!selectedLandlord) {
        messageApi.error('Selected landlord not found');
        return;
      }
      
      const request: CreateHouseRequest = {
        address: values.address,
        landlord: {
          firstName: selectedLandlord.firstName,
          lastName: selectedLandlord.lastName,
          phoneNumber: selectedLandlord.cellPhone || '',
          email: selectedLandlord.email || '',
        },
        facilityInfo: values.facilityInfo || '',
        maxOccupant: parseInt(values.maxOccupant, 10),
      };

      await createHouse(request);
      messageApi.success('House added successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchHouseList();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      messageApi.error('Failed to add house');
    }
  };

  const handleDelete = async (houseId: number) => {
    try {
      await deleteHouse(houseId);
      messageApi.success('House deleted successfully');
      fetchHouseList();
    } catch (error) {
      messageApi.error('Failed to delete house');
    }
  };

  const handleSubmitLandlord = async () => {
    try {
      const values = await landlordForm.validateFields();
      const payload: CreateLandlordRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        cellPhone: values.cellPhone,
      };

      setSubmittingLandlord(true);
      await createLandlord(payload);
      messageApi.success('Landlord added successfully');
      setIsLandlordModalOpen(false);
      landlordForm.resetFields();
      fetchLandlords();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error('Failed to add landlord');
    } finally {
      setSubmittingLandlord(false);
    }
  };

  const handleDeleteLandlord = async (id: number) => {
    try {
      setDeletingLandlordId(id);
      await deleteLandlord(id);
      messageApi.success('Landlord deleted successfully');
      fetchLandlords();
    } catch (error) {
      messageApi.error('Failed to delete landlord');
    } finally {
      setDeletingLandlordId(null);
    }
  };

  const columns: ColumnsType<House> = [
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 240,
    },
    {
      title: 'Landlord',
      key: 'landlord',
      width: 180,
      render: (_, record) =>
        record.landlord
          ? `${record.landlord.firstName} ${record.landlord.lastName}`
          : record.landlordFullName || '-',
    },
    {
      title: 'Landlord Phone',
      key: 'landlordPhone',
      width: 150,
      render: (_, record) => record.landlord?.cellPhone || record.landlordPhone || '-',
    },
    {
      title: 'Max Occupancy',
      dataIndex: 'maxOccupant',
      key: 'maxOccupant',
      width: 120,
      align: 'center',
    },
    {
      title: 'Current Occupancy',
      key: 'currentOccupancy',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const current = record.numberOfEmployees ?? record.employeeList?.length ?? 0;
        const max = record.maxOccupant || 0;
        const isFull = max !== 0 && current >= max;
        return (
          <span style={{ color: isFull ? '#ff4d4f' : '#52c41a' }}>
            {current} / {max || '-'}
          </span>
        );
      },
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
            onClick={() => navigate(`/hr/houses/${record.id}`)}
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
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const landlordColumns: ColumnsType<Landlord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Cell Phone',
      dataIndex: 'cellPhone',
      key: 'cellPhone',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Delete Landlord"
          description="Are you sure you want to delete this landlord?"
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true, loading: deletingLandlordId === record.id }}
          onConfirm={() => handleDeleteLandlord(record.id)}
        >
          <Button
            type="link"
            danger
            loading={deletingLandlordId === record.id}
            disabled={deletingLandlordId !== null && deletingLandlordId !== record.id}
          >
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
        size="small"
        columns={columns}
        dataSource={houseList}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          size: 'small',
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} houses`,
        }}
        scroll={{ x: 1200 }}
      />

      <Card
        title="Landlord Directory"
        style={{ marginTop: 24 }}
        extra={
          <Button type="primary" onClick={handleAddLandlord}>
            Add Landlord
          </Button>
        }
      >
        <Table
          columns={landlordColumns}
          dataSource={landlords}
          rowKey="id"
          loading={landlordLoading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} landlords`,
          }}
        />
      </Card>

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

          <Form.Item
            label="Select Landlord"
            name="landlordId"
            rules={[{ required: true, message: 'Please select a landlord' }]}
            extra={
              landlords.length === 0 ? (
                <span style={{ color: '#999' }}>
                  No landlords available. Please add a landlord first.
                </span>
              ) : null
            }
          >
            <Select
              placeholder="Choose an existing landlord"
              loading={landlordLoading}
              disabled={landlords.length === 0}
              optionFilterProp="children"
              showSearch
            >
              {landlords.map((landlord) => (
                <Option key={landlord.id} value={landlord.id}>
                  {landlord.fullName || `${landlord.firstName} ${landlord.lastName}`} (
                  {landlord.email || 'no-email'})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Max Occupancy"
            name="maxOccupant"
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

      <Modal
        title="Add New Landlord"
        open={isLandlordModalOpen}
        onOk={handleSubmitLandlord}
        okText="Submit"
        cancelText="Cancel"
        confirmLoading={submittingLandlord}
        onCancel={() => {
          setIsLandlordModalOpen(false);
          landlordForm.resetFields();
        }}
      >
        <Form
          form={landlordForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="John" />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Smith" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email address' },
            ]}
          >
            <Input placeholder="john.smith@example.com" />
          </Form.Item>
          <Form.Item
            label="Cell Phone"
            name="cellPhone"
            rules={[{ required: true, message: 'Please enter cell phone' }]}
          >
            <Input placeholder="555-123-4567" />
          </Form.Item>
        </Form>
      </Modal>

    </PageContainer>
  );
};
