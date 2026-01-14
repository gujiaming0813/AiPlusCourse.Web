import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DownOutlined,
  ReadOutlined,
  RobotOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Layout, Button, Menu, Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// --- Claymorphism Layout Styles ---

const layoutBackgroundStyle: React.CSSProperties = {
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #F5F7FA 0%, #E0E7FF 100%)', // Clean, airy background
};

const floatingContainerStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '8px 8px 24px 0 rgba(31, 38, 135, 0.05)',
  borderRadius: '24px',
};

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <ReadOutlined style={{ fontSize: '22px', color: '#FF9F43' }} />,
      label: <span style={{ fontSize: '16px', fontWeight: 600 }}>学习仪表盘</span>,
    },
    {
      key: '/chat',
      icon: <RobotOutlined style={{ fontSize: '22px', color: '#54A0FF' }} />,
      label: <span style={{ fontSize: '16px', fontWeight: 600 }}>AI 辅导</span>,
    },
  ];

  return (
    <Layout style={layoutBackgroundStyle}>
      {/* Inject custom CSS for Menu to handle collapsed state gracefully */}
      <style>{`
        /* Custom Menu Item Styles */
        .custom-sider-menu .ant-menu-item {
          height: 56px !important;
          line-height: 56px !important;
          margin-bottom: 24px !important; /* Increased from 12px to 24px */
          border-radius: 16px !important;
          display: flex !important;
          align-items: center !important;
        }

        /* Selected State */
        .custom-sider-menu .ant-menu-item-selected {
          background-color: #F0EBF8 !important;
          color: #7C5CFF !important;
          box-shadow: 0 4px 12px rgba(124, 92, 255, 0.15) !important; /* The purple shadow you wanted */
        }

        /* Collapsed State Fixes */
        .ant-menu-inline-collapsed.custom-sider-menu .ant-menu-item {
          padding: 0 !important;
          justify-content: center !important;
          width: 56px !important; /* Make it square-ish */
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        .ant-menu-inline-collapsed.custom-sider-menu .ant-menu-item .ant-menu-item-icon {
          min-width: 0 !important;
          margin: 0 !important;
          line-height: 56px !important;
        }
        
        .ant-menu-inline-collapsed.custom-sider-menu .ant-menu-item .ant-menu-title-content {
          display: none !important;
        }
      `}</style>

      {/* --- Floating Sider --- */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        collapsedWidth={100} // Give it enough width in collapsed mode
        theme="light"
        style={{
          ...floatingContainerStyle,
          margin: '16px 0 16px 16px',
          height: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease', // Smooth transition for the sider itself
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            height: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            flexShrink: 0,
            marginBottom: 8, // Reduced from 24px to 8px to balance visual spacing
          }}
        >
          <div
            style={{
              width: collapsed ? 50 : '100%',
              height: collapsed ? 50 : '100%',
              background: 'linear-gradient(135deg, #7C5CFF 0%, #5D3FD3 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: collapsed ? 18 : 22,
              boxShadow: '4px 4px 10px rgba(124, 92, 255, 0.3)',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {collapsed ? 'AI' : 'AI 学习伙伴'}
          </div>
        </div>

        {/* Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname === '/' ? '/' : location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="custom-sider-menu" // Apply our custom class
            style={{
              background: 'transparent',
              borderRight: 'none',
              fontSize: '16px',
            }}
          />
        </div>
      </Sider>

      <Layout
        style={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
        }}
      >
        {/* --- Floating Header --- */}
        <Header
          style={{
            ...floatingContainerStyle,
            margin: '0 0 16px 16px',
            padding: '0 24px',
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Collapse Trigger */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '20px',
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: '#fff',
              boxShadow: '4px 4px 8px rgba(0,0,0,0.05)',
            }}
          />

          {/* Right: User Profile & Actions */}
          <Space size="large">
            {/* Notification Badge */}
            <Badge count={3} offset={[-4, 4]} color="#FF6B6B">
              <Button
                shape="circle"
                icon={<BellOutlined />}
                style={{
                  border: 'none',
                  background: '#fff',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.05)',
                  color: '#57606F',
                  width: 40,
                  height: 40,
                }}
              />
            </Badge>

            {/* User Dropdown */}
            <Dropdown
              menu={{
                items: [
                  { key: '1', label: '个人资料', icon: <UserOutlined /> },
                  { key: '2', label: '设置', icon: <SettingOutlined /> },
                  { type: 'divider' },
                  { key: 'logout', label: '退出登录', danger: true, icon: <LogoutOutlined /> },
                ],
                onClick: onMenuClick,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '16px',
                  background: '#fff',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s',
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: '#FF9F43',
                    marginRight: 12,
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                  }}
                  icon={<UserOutlined />}
                  size="large"
                />
                <div style={{ display: 'flex', flexDirection: 'column', marginRight: 8 }}>
                  <Text strong style={{ fontSize: 15, lineHeight: 1.2 }}>
                    明星学员
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Lv.5 学者
                  </Text>
                </div>
                <DownOutlined style={{ fontSize: '12px', color: '#B2BEC3' }} />
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* --- Main Content Area --- */}
        <Content
          style={{
            ...floatingContainerStyle,
            margin: '0 0 0 16px',
            padding: 32,
            flex: 1,
            overflowY: 'auto', // Scrollable content
            background: 'rgba(255, 255, 255, 0.5)', // Slightly more transparent to show content depth
            position: 'relative',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
