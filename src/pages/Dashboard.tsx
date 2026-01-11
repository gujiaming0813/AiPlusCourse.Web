import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2>仪表盘</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="待办事项" value={12} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="今日订单" value={93} prefix="¥" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
