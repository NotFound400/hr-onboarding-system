/**
 * Main Layout Component
 * 主布局组件，包含动态导航菜单和用户信息显示
 */

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Modal, message } from 'antd';
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

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * MainLayout Component
 * 
 * 根据 frontend_requirement.md 4.3/4.4 定义的菜单结构:
 * - HR 菜单: Home, Employees, Visa, Hiring, Housing
 * - Employee 菜单: Home, Personal Info, Visa Status, Housing
 */
const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectRole);

  // Fetch employee data for non-citizen check (Section 5.b)
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (role === 'Employee' && user?.id) {
        try {
          const employee = await getEmployeeByUserId(String(user.id));
          setEmployeeData(employee);
        } catch (error) {
          console.error('Failed to fetch employee data:', error);
        }
      }
    };
    fetchEmployeeData();
  }, [role, user?.id]);

  /**
   * HR 菜单配置
   */
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

  /**
   * Check if employee should see Visa menu
   * Per Section 5.b: "only if the user is NOT a citizen or green card holder"
   */
  const shouldShowVisaMenu = (): boolean => {
    if (!employeeData || !employeeData.visaStatus || employeeData.visaStatus.length === 0) {
      return false; // Default: hide if no visa data
    }
    const activeVisa = employeeData.visaStatus.find((v: VisaStatus) => v.activeFlag);
    if (!activeVisa) return false;
    
    // Hide for Citizen and Green Card holders
    return activeVisa.visaType !== VisaStatusType.CITIZEN && 
           activeVisa.visaType !== VisaStatusType.GREEN_CARD;
  };

  /**
   * Employee 菜单配置
   */
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
    // Conditional Visa Status menu (Section 5.b)
    ...(shouldShowVisaMenu() ? [{
      key: '/employee/visa',
      icon: <FileProtectOutlined />,
      label: 'Visa Status Management',
      onClick: () => navigate('/employee/visa'),
      // Submenu with hover effect (Section 5.b: "show a link to OPT STEM Management")
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
      // Submenu for House Detail (Section 4.d)
      children: [
        {
          key: '/employee/housing/list',
          label: 'My Housing',
          onClick: () => navigate('/employee/housing'),
        },
        {
          key: '/employee/house-detail',
          label: 'House Detail',
          onClick: () => navigate('/employee/house-detail'),
        },
        {
          key: '/employee/facility-report',
          label: 'Report Facility Issue',
          onClick: () => navigate('/employee/facility-report'),
        },
      ],
    },
  ];

  /**
   * 根据角色获取菜单
   */
  const menuItems = role === 'HR' ? hrMenuItems : employeeMenuItems;

  /**
   * 获取当前选中的菜单项
   */
  const getSelectedKey = () => {
    // 匹配最长路径前缀
    const matchedItem = menuItems?.find((item) => {
      if (item && 'key' in item) {
        return location.pathname.startsWith(item.key as string);
      }
      return false;
    });
    return matchedItem && 'key' in matchedItem ? [matchedItem.key as string] : [];
  };

  /**
   * 处理登出
   */
  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dispatch(logout()).unwrap();
          message.success('Logged out successfully');
          navigate('/login', { replace: true });
        } catch (error) {
          message.error('Logout failed');
        }
      },
    });
  };

  /**
   * 用户下拉菜单
   */
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
      onClick: () => message.info('Settings page coming soon'),
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
              <Space direction="vertical" size={0}>
                <Text strong>{user?.username || 'User'}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
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
