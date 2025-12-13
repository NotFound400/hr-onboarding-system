/**
 * Employee Profile Page
 * HR 员工档案列表页面
 * 
 * Features:
 * - 搜索功能（按姓名）
 * - 员工列表表格
 * - 点击行跳转到员工详情
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Space, Button, Card, Typography } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '../../../components/common/PageContainer';
import { getAllEmployees } from '../../../services/api';
import type { Employee } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const { Search } = Input;
const { Text } = Typography;

/**
 * EmployeeProfilePage Component
 */
const EmployeeProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchText, setSearchText] = useState('');
  const messageApi = useAntdMessage();

  // 获取所有员工数据
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 搜索功能 - 按 First Name / Last Name / Preferred Name 搜索
   */
  const handleSearch = (value: string) => {
    setSearchText(value);
    
    if (!value.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const searchLower = value.toLowerCase().trim();
    const filtered = employees.filter(emp => 
      emp.firstName?.toLowerCase().includes(searchLower) ||
      emp.lastName?.toLowerCase().includes(searchLower) ||
      emp.preferredName?.toLowerCase().includes(searchLower)
    );

    setFilteredEmployees(filtered);

    // 处理搜索结果状态提示
    if (filtered.length === 0) {
      messageApi.info('No records found');
    } else if (filtered.length === 1) {
      messageApi.success('1 record found');
    } else {
      messageApi.success(`${filtered.length} records found`);
    }
  };

  /**
   * 跳转到员工详情页
   */
  const handleViewDetails = (employeeId: string) => {
    navigate(`/hr/employees/${employeeId}`);
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<Employee> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <span>
          {record.firstName} {record.middleName ? `${record.middleName} ` : ''}{record.lastName}
          {record.preferredName && ` (${record.preferredName})`}
        </span>
      ),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Cell Phone',
      dataIndex: 'cellPhone',
      key: 'cellPhone',
    },
    {
      title: 'SSN',
      dataIndex: 'SSN',
      key: 'SSN',
      render: (ssn: string) => {
        // 脱敏显示 SSN: XXX-XX-1234
        if (!ssn) return '-';
        const parts = ssn.split('-');
        if (parts.length === 3) {
          return `XXX-XX-${parts[2]}`;
        }
        return '***-**-****';
      },
    },
    {
      title: 'Work Authorization',
      key: 'visa',
      render: (_, record) => {
        const activeVisa = record.visaStatus?.find(v => v.activeFlag);
        return activeVisa?.visaType || '-';
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <PageContainer title="Employee Profiles" loading={loading}>
      {/* Section HR.3.a.i - Summary with <10/100> format */}
      <Card style={{ marginBottom: 16, background: '#fafafa' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 16 }}>Employee Summary</Text>
          <Text>
            Total Employees: <Text strong style={{ fontSize: 18, color: '#1890ff' }}>{employees.length}</Text>
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Note: Use search bar to find employees by name, then click to view details. 
            The employee detail page shows navigation like <Text code>&lt;10/100&gt;</Text> based on user_id ordering.
          </Text>
        </Space>
      </Card>

      {/* Section HR.3.a.ii - Search Bar (First OR Last OR Preferred Name) */}
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search by name (First / Last / Preferred)"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              setSearchText('');
              setFilteredEmployees(employees);
            }
          }}
          style={{ width: 400 }}
        />
        <Button onClick={fetchEmployees}>
          Refresh
        </Button>
      </Space>

      {/* 员工列表表格 */}
      <Table
        columns={columns}
        dataSource={filteredEmployees}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} employees`,
        }}
        onRow={(record) => ({
          onClick: () => handleViewDetails(record.id),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: searchText 
            ? `No employees found matching "${searchText}"` 
            : 'No employees found',
        }}
      />
    </PageContainer>
  );
};

export { EmployeeProfilePage };
