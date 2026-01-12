import React, { useState } from 'react';
import { Card, Form, Input, Button, message, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { LoginInputDto } from '@/models/User/UserInputDto.ts';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // const {token: {colorPrimary}} = theme.useToken();

  const onFinish = (values: LoginInputDto) => {
    setLoading(true);

    // 模拟登录请求
    setTimeout(() => {
      console.log('Received values of form: ', values);

      if (values.Account === 'admin' && values.Password === 'admin') {
        // 1. 登录成功，存入 Token
        localStorage.setItem('token', 'mock-token-123456');
        localStorage.setItem(
          'user_info',
          JSON.stringify({
            name: '好学生',
            email: '<EMAIL>',
            phone: '13812345678',
            score: 100,
            id: 1001,
          }),
        );

        message.success('登录成功，欢迎回来！');

        // 2. 跳转到首页
        navigate('/', { replace: true });

        setLoading(false);
      } else {
        message.error('账号或密码错误！');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    // 使用 ConfigProvider 确保登录页也享受到全局的主题色配置
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b', // 保持一致的舒缓绿
          borderRadius: 6,
        },
      }}
    >
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f0f2f5', // 浅灰背景
          backgroundImage: 'linear-gradient(135deg, #f0f2f5 0%, #e1e6eb 100%)', // 稍微加点渐变质感
        }}
      >
        <Card
          style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 12 }}
          variant="borderless"
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ color: '#333', fontWeight: 600, marginBottom: 8 }}>AiPlusCourse</h2>
            <div style={{ color: '#888' }}>您身边的私人老师</div>
          </div>

          <Form name="login" size="large" onFinish={onFinish} autoComplete="off">
            <Form.Item name="Account" rules={[{ required: true, message: '请输入账号！' }]}>
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="管理员账号"
              />
            </Form.Item>

            <Form.Item name="Password" rules={[{ required: true, message: '请输入密码！' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', color: '#ccc', fontSize: 12 }}>
              测试账号密码随意输入
            </div>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default Login;
