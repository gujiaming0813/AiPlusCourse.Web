import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DownOutlined,
  AppstoreOutlined,
  ContainerOutlined,
} from '@ant-design/icons';
import { Layout, Button, theme, Menu, Avatar, Dropdown, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

// 模拟菜单数据
const items = [
  {
    key: '/test1',
    icon: <AppstoreOutlined />,
    label: '测试 1',
  },
  {
    key: '/chat',
    icon: <ContainerOutlined />,
    label: '聊天',
  },
];

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate(); // 跳转工具
  const location = useLocation(); // 获取当前网址

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 修改菜单点击事件
  const handleMenuClick = ({ key }: { key: string }) => {
    // 点击菜单时，直接跳转到对应的路由路径
    navigate(key);
  };

  return (
    <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* 左侧侧边栏 - 白色背景 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0', // 加一条极淡的分割线
        }}
      >
        {/* Logo 区域 */}
        <div
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#888',
          }}
        >
          {collapsed ? 'Ai' : 'AiPlusCourse'}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]} // 自动高亮当前页面的菜单项
          items={items}
          onClick={handleMenuClick} // 绑定点击事件
        />
      </Sider>

      {/* 右侧主体 - 这里的 Layout 默认是透明的，我们给它加个浅灰背景 */}
      <Layout style={{ background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        {/* 顶部 Header - 白色背景 */}
        <Header
          style={{
            padding: '0 24px 0 0', // 右边稍微留点空隙
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // 加一个小阴影让层级更明显
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            zIndex: 1,
          }}
        >
          {/* 左侧折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          {/* 右侧工具栏 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space size="large">
              {/*<Badge count={5} size="small">*/}
              {/*    <Button type="text" icon={<BellOutlined/>} style={{fontSize: '16px'}}/>*/}
              {/*</Badge>*/}

              <Dropdown
                menu={{
                  items: [
                    { key: '1', label: '个人中心' },
                    { key: '2', label: '系统设置' },
                    { type: 'divider' },
                    { key: '3', label: '退出登录', danger: true },
                  ],
                }}
              >
                <Space style={{ cursor: 'pointer' }}>
                  {/* 使用主题色作为头像背景 */}
                  <Avatar style={{ backgroundColor: '#00b96b' }} icon={<UserOutlined />} />
                  <span style={{ fontSize: '14px', color: '#333' }}>管理员</span>
                  <DownOutlined style={{ fontSize: '10px', color: '#999' }} />
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* 内容区域 */}
        {/* 核心修改：Content 必须使用 flex: 1 来占据剩余空间，且 overflow: hidden */}
        <Content
          // style={{
          //     margin: isChatPage ? 0 : '24px 16px',
          //     padding: isChatPage ? 0 : 24,
          //     flex: 1,
          //     // 👇 关键：强制禁止溢出
          //     overflow: isChatPage ? 'hidden' : 'auto',
          //     background: isChatPage ? 'transparent' : colorBgContainer,
          //     borderRadius: isChatPage ? 0 : borderRadiusLG,
          //     display: 'flex',
          //     flexDirection: 'column',
          // }}
          style={{
            margin: '24px 16px',
            padding: 24,
            flex: 1,
            overflow: 'auto',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
