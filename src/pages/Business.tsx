import React from 'react';
import { Table, Tag } from 'antd';

const Business: React.FC = () => {
  // 模拟一些表格数据
  const columns = [
    { title: '日期', dataIndex: 'id', key: 'id' },
    { title: '用户', dataIndex: 'client', key: 'client' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
  ];
  const data = [
    { key: '1', id: '2026-01-01', client: 'admin', status: '正常' },
    { key: '2', id: '2026-01-01', client: 'admin', status: '正常' },
  ];

  return (
    <div>
      <h2>数据记录</h2>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Business;
