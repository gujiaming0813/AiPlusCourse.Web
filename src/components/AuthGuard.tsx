import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // 如果没有 token，且当前不在登录页，就强制跳去登录页
  if (!token) {
    // replace: true 防止用户点“后退”又回到需要权限的页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果有 token，就放行，显示子组件
  return <>{children}</>;
};

export default AuthGuard;
