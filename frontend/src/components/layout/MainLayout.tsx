import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Modal } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  FileProtectOutlined,
  UsergroupAddOutlined,
  BankOutlined,
  LogoutOutlined,
  SettingOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectUser, selectRole } from '../../store/slices/authSlice';
import { getEmployeeByUserId } from '../../services/api';
import { VisaStatusType } from '../../types/enums';
import type { Employee, VisaStatus } from '../../types/employee';
import { useAntdMessage } from '../../hooks/useAntdMessage';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const messageApi = useAntdMessage();

  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectRole);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (role === 'Employee' && user?.id) {
        try {
          const employee = await getEmployeeByUserId(String(user.id));
          setEmployeeData(employee);
        } catch (error) {
        }
      }
    };
    fetchEmployeeData();
  }, [role, user?.id]);

  const hrMenuItems: MenuProps['items'] = [
    {
      key: '/hr/home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/hr/home'),
    },
    {
      key: '/hr/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
      onClick: () => navigate('/hr/employees'),
    },
    {
      key: '/hr/visa',
      icon: <FileProtectOutlined />,
      label: 'Visa',
      onClick: () => navigate('/hr/visa'),
    },
    {
      key: '/hr/hiring',
      icon: <UsergroupAddOutlined />,
      label: 'Hiring',
      onClick: () => navigate('/hr/hiring'),
    },
    {
      key: '/hr/housing',
      icon: <BankOutlined />,
      label: 'Housing',
      onClick: () => navigate('/hr/housing'),
    },
  ];

  const shouldShowVisaMenu = (): boolean => {
    if (!employeeData || !employeeData.visaStatus || employeeData.visaStatus.length === 0) {
      return false;
    }
    const activeVisa = employeeData.visaStatus.find(
      (v: VisaStatus) => v.activeFlag === 'Yes'
    );
    if (!activeVisa) return false;
    
    return activeVisa.visaType !== VisaStatusType.CITIZEN && 
           activeVisa.visaType !== VisaStatusType.GREEN_CARD;
  };

  const employeeMenuItems: MenuProps['items'] = [
    {
      key: '/employee/home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/employee/home'),
    },
    {
      key: '/employee/personal-info',
      icon: <IdcardOutlined />,
      label: 'Personal Info',
      onClick: () => navigate('/employee/personal-info'),
    },
    ...(shouldShowVisaMenu() ? [{
      key: '/employee/visa',
      icon: <FileProtectOutlined />,
      label: 'Visa Status Management',
      onClick: () => navigate('/employee/visa'),
      children: [
        {
          key: '/employee/visa/opt-stem',
          label: 'OPT STEM Management',
          onClick: () => navigate('/employee/visa'),
        },
      ],
    }] : []),
    {
      key: '/employee/housing',
      icon: <BankOutlined />,
      label: 'Housing',
      onClick: () => navigate('/employee/housing'),
    },
    {
      key: '/employee/facility-report',
      icon: <SettingOutlined />,
      label: 'Report Issue',
      onClick: () => navigate('/employee/facility-report'),
    },
  ];

  const menuItems = role === 'HR' ? hrMenuItems : employeeMenuItems;

  const getSelectedKey = () => {
    const matchedItem = menuItems?.find((item) => {
      if (item && 'key' in item) {
        return location.pathname.startsWith(item.key as string);
      }
      return false;
    });
    return matchedItem && 'key' in matchedItem ? [matchedItem.key as string] : [];
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dispatch(logout()).unwrap();
          messageApi.success('Logged out successfully');
          navigate('/login', { replace: true });
        } catch (error) {
          messageApi.error('Logout failed');
        }
      },
    });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        if (role === 'HR') {
          navigate('/hr/profile');
        } else {
          navigate('/employee/personal-info');
        }
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => messageApi.info('Settings page coming soon'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 16 : 18,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {collapsed ? 'HR' : 'HR System'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
          style={{ marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: 64,
            lineHeight: 'normal',
          }}
        >
          <div>
            <Text strong style={{ fontSize: 16 }}>
              {role === 'HR' ? 'HR Portal' : 'Employee Portal'}
            </Text>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Space direction="vertical" size={0} style={{ lineHeight: 1.2, textAlign: 'right' }}>
                <Text strong style={{ lineHeight: '1.2' }}>{user?.username || 'User'}</Text>
                <Text type="secondary" style={{ fontSize: 12, lineHeight: '1.2' }}>
                  {role || 'Employee'}
                </Text>
              </Space>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
