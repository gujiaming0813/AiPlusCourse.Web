import React from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import router from './router'; // 引入刚才配置的路由

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
          borderRadius: 6,
        },
      }}
    >
      {/* 这里的 RouterProvider 会根据网址自动渲染 BasicLayout */}
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;
