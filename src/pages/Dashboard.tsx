import React, { useState } from 'react';
import { Card, Col, Row, Typography, Button, Input } from 'antd';
import {
  PlayCircleOutlined,
  ReadOutlined,
  FireOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// --- Clay Styles ---

const clayCardStyle: React.CSSProperties = {
  borderRadius: '24px',
  background: '#ffffff',
  boxShadow: '12px 12px 24px rgba(163, 177, 198, 0.1), -12px -12px 24px rgba(255, 255, 255, 0.8)',
  border: 'none',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
};

const clayProgressContainer: React.CSSProperties = {
  padding: '4px',
  borderRadius: '12px',
  background: '#F0F2F5',
  boxShadow:
    'inset 2px 2px 5px rgba(163, 177, 198, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8)',
  marginTop: '16px',
};

const CourseCard = ({
  title,
  color,
  progress,
  icon,
}: {
  title: string;
  color: string;
  progress: number;
  icon: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      style={clayCardStyle}
      bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow =
          '16px 16px 32px rgba(163, 177, 198, 0.2), -12px -12px 24px rgba(255, 255, 255, 0.8)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow =
          '12px 12px 24px rgba(163, 177, 198, 0.1), -12px -12px 24px rgba(255, 255, 255, 0.8)';
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 28,
            boxShadow: `6px 6px 16px ${color}40`, // Colored shadow based on prop
          }}
        >
          {icon}
        </div>
        <Button
          shape="round"
          icon={<PlayCircleOutlined />}
          size="small" // Changed to small
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            color: isHovered ? '#fff' : color,
            borderColor: color,
            backgroundColor: isHovered ? color : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s',
            height: '36px', // Explicitly set height to override global config
            padding: '0 16px', // Ensure enough horizontal padding
          }}
        >
          继续播放
        </Button>
      </div>

      <div style={{ flex: 1 }}>
        <Title level={4} style={{ marginBottom: 4, color: '#2D3436' }}>
          {title}
        </Title>
        <Text type="secondary">下一课：第 3.2 章</Text>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong style={{ color: '#636E72' }}>
            进度
          </Text>
          <Text strong style={{ color: color }}>
            {progress}%
          </Text>
        </div>
        <div style={clayProgressContainer}>
          <div
            style={{
              height: 10,
              borderRadius: 5,
              width: `${progress}%`,
              background: color,
              transition: 'width 1s ease-in-out',
            }}
          />
        </div>
      </div>
    </Card>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '8px 8px 20px rgba(0,0,0,0.03)',
      border: '1px solid rgba(0,0,0,0.02)',
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '12px',
        background: `${color}15`, // Very light opacity
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        marginRight: 16,
      }}
    >
      {icon}
    </div>
    <div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
        {title}
      </Text>
      <Text strong style={{ fontSize: 20, color: '#2D3436' }}>
        {value}
      </Text>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* --- Welcome Section --- */}
      <div
        style={{
          marginBottom: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <Title level={2} style={{ color: '#2D3436', marginBottom: 8, fontWeight: 800 }}>
            你好，明星学员！👋
          </Title>
          <Text style={{ fontSize: 16, color: '#636E72' }}>准备好今天学点新知识了吗？</Text>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <StatCard title="连续学习" value="12 天" icon={<FireOutlined />} color="#FF6B6B" />
          <StatCard title="总积分" value="2,450" icon={<TrophyOutlined />} color="#FF9F43" />
        </div>
      </div>

      {/* --- Quick Action: Ask AI --- */}
      <div
        style={{
          marginBottom: 48,
          padding: '32px',
          borderRadius: '32px',
          background: 'linear-gradient(135deg, #7C5CFF 0%, #5D3FD3 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '12px 12px 32px rgba(124, 92, 255, 0.3)',
        }}
      >
        {/* Decorative Circles */}
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: 40,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />

        <Row align="middle" gutter={32}>
          <Col xs={24} md={14}>
            <Title level={3} style={{ color: '#fff', marginBottom: 12 }}>
              遇到难题了？
            </Title>
            <Text
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 16,
                display: 'block',
                marginBottom: 24,
              }}
            >
              向你的 AI 导师询问任何关于数学、科学或历史的问题。
            </Text>
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '8px 8px 8px 24px',
                display: 'flex',
                alignItems: 'center',
                maxWidth: 500,
              }}
            >
              <SearchOutlined style={{ color: '#B2BEC3', fontSize: 20 }} />
              <Input
                placeholder="圆的面积怎么算？"
                bordered={false}
                style={{ fontSize: 16 }}
                onPressEnter={() => navigate('/chat')}
              />
              <Button
                type="primary"
                shape="round"
                size="large"
                onClick={() => navigate('/chat')}
                style={{ background: '#2D3436', border: 'none' }}
              >
                立即提问
              </Button>
            </div>
          </Col>
          <Col xs={0} md={10} style={{ textAlign: 'center' }}>
            {/* Illustration placeholder */}
            <div style={{ fontSize: 80 }}>🤖</div>
          </Col>
        </Row>
      </div>

      {/* --- Course List --- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ color: '#2D3436', margin: 0 }}>
          我的课程
        </Title>
        <Button type="link" style={{ color: '#7C5CFF', fontWeight: 600 }}>
          查看全部 <ArrowRightOutlined />
        </Button>
      </div>

      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={8}>
          <CourseCard title="趣味数学 101" color="#FF9F43" progress={75} icon={<ReadOutlined />} />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <CourseCard title="快乐科学" color="#54A0FF" progress={45} icon={<ReadOutlined />} />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <CourseCard title="世界历史" color="#FF6B6B" progress={90} icon={<ReadOutlined />} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
