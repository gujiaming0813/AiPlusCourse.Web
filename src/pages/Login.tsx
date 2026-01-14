import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { LoginInputDto } from '@/models/User/UserInputDto.ts';

const { Title, Text } = Typography;

// --- Claymorphism Styles ---

// 1. The Main Card: Floating, glass-like, soft
const clayCardStyle: React.CSSProperties = {
  width: 440,
  borderRadius: '32px',
  background: 'rgba(255, 255, 255, 0.75)', // Semi-transparent white
  backdropFilter: 'blur(24px)', // Strong blur for depth
  boxShadow: '20px 20px 60px rgba(174, 174, 192, 0.4), -20px -20px 60px rgba(255, 255, 255, 0.8)', // Soft, deep shadow
  border: '1px solid rgba(255, 255, 255, 0.6)',
  position: 'relative',
  zIndex: 10,
};

// 2. The Inputs: "Pressed" into the surface (Neumorphism/Clay hybrid)
const clayInputStyle: React.CSSProperties = {
  borderRadius: '16px',
  background: '#F0F2F5', // Slightly darker than card
  boxShadow:
    'inset 4px 4px 8px rgba(174, 174, 192, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.8)', // Inner shadow
  border: 'none',
  padding: '12px 16px',
  fontSize: '16px',
};

// 3. The Button: "Popping" out, vibrant
const clayButtonStyle: React.CSSProperties = {
  height: '56px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #7C5CFF 0%, #5D3FD3 100%)', // Vibrant Purple Gradient
  border: 'none',
  color: 'white',
  fontWeight: 600,
  fontSize: '18px',
  boxShadow: '8px 8px 16px rgba(124, 92, 255, 0.3), -4px -4px 12px rgba(255, 255, 255, 0.4)', // Colored shadow
  transition: 'all 0.3s ease',
  cursor: 'pointer',
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = (values: LoginInputDto) => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (values.Account === 'admin' && values.Password === 'admin') {
        localStorage.setItem('token', 'mock-token-123456');
        localStorage.setItem(
          'user_info',
          JSON.stringify({
            name: 'Student Star',
            email: 'student@example.com',
            id: 1001,
          }),
        );

        message.success('欢迎回来，学习伙伴！');
        navigate('/', { replace: true });
      } else {
        message.error('账号或密码错误。');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)', // Playful, educational gradient
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* --- Decorative Floating Shapes (Background) --- */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF9F43 0%, #FFB060 100%)',
          boxShadow: '10px 10px 30px rgba(255, 159, 67, 0.3)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #54A0FF 0%, #2E86DE 100%)',
          boxShadow: '10px 10px 30px rgba(84, 160, 255, 0.3)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* --- Main Login Card --- */}
      <Card style={clayCardStyle} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #7C5CFF 0%, #5D3FD3 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 32,
              boxShadow: '4px 4px 12px rgba(124, 92, 255, 0.4)',
            }}
          >
            🎓
          </div>
          <Title level={2} style={{ color: '#2D3436', marginBottom: 8, fontWeight: 800 }}>
            AI 学习伙伴
          </Title>
          <Text style={{ color: '#636E72', fontSize: '16px' }}>你的专属 AI 导师已就绪！</Text>
        </div>

        <Form name="login" size="large" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item name="Account" rules={[{ required: true, message: '请输入学生账号！' }]}>
            <Input
              style={clayInputStyle}
              prefix={<UserOutlined style={{ color: '#B2BEC3', fontSize: 18 }} />}
              placeholder="学生账号"
              variant="borderless"
            />
          </Form.Item>

          <Form.Item name="Password" rules={[{ required: true, message: '请输入密码！' }]}>
            <Input.Password
              style={clayInputStyle}
              prefix={<LockOutlined style={{ color: '#B2BEC3', fontSize: 18 }} />}
              placeholder="密码"
              variant="borderless"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 40 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={clayButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '10px 10px 20px rgba(124, 92, 255, 0.4), -4px -4px 12px rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '8px 8px 16px rgba(124, 92, 255, 0.3), -4px -4px 12px rgba(255, 255, 255, 0.4)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(1px)';
                e.currentTarget.style.boxShadow = 'inset 2px 2px 5px rgba(0,0,0,0.1)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '10px 10px 20px rgba(124, 92, 255, 0.4), -4px -4px 12px rgba(255, 255, 255, 0.4)';
              }}
            >
              开始学习
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              演示账号: admin / admin
            </Text>
          </div>
        </Form>
      </Card>

      {/* --- Animation Keyframes --- */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
