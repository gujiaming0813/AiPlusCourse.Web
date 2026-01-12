import { createBrowserRouter, Navigate } from 'react-router-dom';
import BasicLayout from '../layouts/BasicLayout';
import Business from '../pages/Business';
import ChatPage from '@/pages/ChatPage.tsx';
import Login from '@/pages/Login.tsx';
import AuthGuard from '@/components/AuthGuard.tsx';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <BasicLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/chat" replace />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
      // {
      //   path: 'test1',
      //   element: <Dashboard />,
      // },
      {
        path: 'business',
        element: <Business />,
      },
    ],
  },
]);

export default router;
