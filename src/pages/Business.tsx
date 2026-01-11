import React from 'react';
import { Table, Tag } from 'antd';

const Business: React.FC = () => {
  // 模拟一些表格数据
  const columns = [
    { title: '订单号', dataIndex: 'id', key: 'id' },
    { title: '客户', dataIndex: 'client', key: 'client' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
  ];
  const data = [
    { key: '1', id: 'ORD-001', client: '无锡某公司', status: '运输中' },
    { key: '2', id: 'ORD-002', client: '上海某分部', status: '待发货' },
  ];

  return (
    <div>
      <h2>业务管理</h2>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Business;
