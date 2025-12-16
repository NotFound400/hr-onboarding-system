import { useState, useEffect } from 'react';
import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '../../../components/common/PageContainer';
import { getAllEmployees } from '../../../services/api';
import type { Employee, VisaStatus } from '../../../types';
import { useAntdMessage } from '../../../hooks/useAntdMessage';
import dayjs from 'dayjs';

const { Text } = Typography;

interface VisaTableRow {
  id: string;
  employeeName: string;
  visaType: string;
  expirationDate: string | null;
  startDate: string | null;
  daysLeft: number | null;
  activeFlag: string | null;
  documentsCount: number;
  employee: Employee;
}

const VisaManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<VisaTableRow[]>([]);
  const messageApi = useAntdMessage();

  useEffect(() => {
    fetchVisaStatuses();
  }, []);

  const fetchVisaStatuses = async () => {
    try {
      setLoading(true);
      const employees = await getAllEmployees({ forceReal: true });
      const mappedRows = employees
        .filter((emp) => Boolean(emp.firstName))
        .map((emp) => buildRowFromEmployee(emp));
      setRows(mappedRows);
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to load visa statuses');
    } finally {
      setLoading(false);
    }
  };

  const buildRowFromEmployee = (employee: Employee): VisaTableRow => {
    const activeVisa = employee.visaStatus?.find(
      (visa: VisaStatus) => visa.activeFlag === 'Yes' || visa.activeFlag === 'Y'
    );
    const expirationDate = activeVisa?.endDate || null;
    const startDate = activeVisa?.startDate || null;
    const daysLeft =
      expirationDate && dayjs(expirationDate).isValid()
        ? dayjs(expirationDate).diff(dayjs(), 'day')
        : null;

    return {
      id: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      visaType: activeVisa?.visaType || 'N/A',
      expirationDate,
      startDate,
      daysLeft,
      activeFlag: activeVisa?.activeFlag || null,
      documentsCount: employee.personalDocument?.length || 0,
      employee,
    };
  };

  const columns: ColumnsType<VisaTableRow> = [
    {
      title: 'Name (Legal Full Name)',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: 'Work Authorization',
      dataIndex: 'visaType',
      key: 'visaType',
      filters: [
        { text: 'Citizen', value: 'Citizen' },
        { text: 'Green Card', value: 'Green Card' },
        { text: 'OPT', value: 'OPT' },
        { text: 'H1B', value: 'H1B' },
        { text: 'F1', value: 'F1' },
      ],
      onFilter: (value, record) => record.visaType === value,
      render: (visaType: string, record) => {
        const color =
          visaType === 'OPT'
            ? 'geekblue'
            : visaType === 'Citizen' || visaType === 'Green Card'
            ? 'green'
            : 'blue';
        return (
          <Tag color={color}>
            {visaType || 'N/A'}
          </Tag>
        );
      },
    },
    {
      title: 'Expiration Date',
      key: 'expirationDate',
      render: (_, record) =>
        record.expirationDate
          ? dayjs(record.expirationDate).format('YYYY-MM-DD')
          : 'N/A',
    },
    {
      title: 'Days Left',
      key: 'daysLeft',
      render: (_, record) => {
        if (record.daysLeft === null) {
          return 'N/A';
        }
        const color =
          record.daysLeft < 30
            ? 'red'
            : record.daysLeft < 90
            ? 'orange'
            : 'green';
        return (
          <span style={{ color }}>
            <strong>{record.daysLeft}</strong> days
          </span>
        );
      },
    },
    {
      title: 'Active STEM OPT Application',
      key: 'activeApplication',
      render: (_, record) => {
        if (record.visaType === 'OPT') {
          if (record.activeFlag === 'Yes' || record.activeFlag === 'Y') {
            return <Tag color="warning">Pending Review</Tag>;
          }
          return <Tag color="default">Inactive</Tag>;
        }
        return <Tag>NONE</Tag>;
      },
    },
    {
      title: 'Document Received',
      key: 'documents',
      render: (_, record) => (
        <Text>
          {record.documentsCount > 0
            ? `${record.documentsCount} documents on file`
            : 'No documents'}
        </Text>
      ),
    },
  ];

  return (
    <PageContainer title="Visa Management" loading={loading}>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} employees`,
        }}
        locale={{
          emptyText: 'No visa records found',
        }}
      />
    </PageContainer>
  );
};

export { VisaManagementPage };
