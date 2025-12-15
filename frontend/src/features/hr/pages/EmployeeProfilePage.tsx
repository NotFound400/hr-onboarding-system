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
import { getApplicationsWithEmployeesByStatus } from '../../../services/api';
import type { ApplicationWithEmployeeInfo } from '../../../types';
import { ApplicationStatus as ApplicationStatusEnum } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

const { Search } = Input;
const { Text } = Typography;

/**
 * EmployeeProfilePage Component
 */
const EmployeeProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationWithEmployeeInfo[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithEmployeeInfo[]>([]);
  const [searchText, setSearchText] = useState('');
  const messageApi = useAntdMessage();

  // 获取所有员工数据
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getApplicationsWithEmployeesByStatus(ApplicationStatusEnum.APPROVED);
      const filtered = data.filter((app) => Boolean(app.employee?.firstName));
      setApplications(filtered);
      setFilteredApplications(filtered);
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
      setFilteredApplications(applications);
      return;
    }

    const searchLower = value.toLowerCase().trim();
    const filtered = applications.filter(app => {
      const firstName = app.employee?.firstName?.toLowerCase() || '';
      const lastName = app.employee?.lastName?.toLowerCase() || '';
      const preferredName = app.employee?.preferredName?.toLowerCase() || '';
      return (
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        preferredName.includes(searchLower)
      );
    });

    setFilteredApplications(filtered);

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
   * 跳转到 Application Review Summary
   */
  const handleViewDetails = (record: ApplicationWithEmployeeInfo) => {
    const employeeId = record.employee?.id || record.employeeId;
    if (employeeId) {
      navigate(`/hr/applications/${employeeId}/${record.id}`);
    } else {
      messageApi.warning('Employee information is missing for this application');
    }
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ApplicationWithEmployeeInfo> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => {
        const emp = record.employee;
        if (!emp) return <span style={{ color: '#999' }}>Unknown</span>;
        return (
          <span>
            {emp.firstName} {emp.middleName ? `${emp.middleName} ` : ''}
            {emp.lastName}
            {emp.preferredName && ` (${emp.preferredName})`}
          </span>
        );
      },
      sorter: (a, b) => {
        const aName = `${a.employee?.firstName || ''}${a.employee?.lastName || ''}`.toLowerCase();
        const bName = `${b.employee?.firstName || ''}${b.employee?.lastName || ''}`.toLowerCase();
        return aName.localeCompare(bName);
      },
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => record.employee?.email || 'N/A',
    },
    {
      title: 'Cell Phone',
      key: 'cellPhone',
      render: (_, record) => record.employee?.cellPhone || 'N/A',
    },
    {
      title: 'Application Type',
      dataIndex: 'applicationType',
      key: 'applicationType',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
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
            Total Employees: <Text strong style={{ fontSize: 18, color: '#1890ff' }}>{applications.length}</Text>
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Note: Use search bar to filter employees by employee name, then click to view the review summary.
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
              setFilteredApplications(applications);
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
        dataSource={filteredApplications}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} applications`,
        }}
        onRow={(record) => ({
          onClick: () => handleViewDetails(record),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: searchText 
            ? `No records found matching "${searchText}"`
            : 'No applications found',
        }}
      />
    </PageContainer>
  );
};

export { EmployeeProfilePage };
