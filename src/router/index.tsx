import { createBrowserRouter, Navigate } from 'react-router-dom';
import BasicLayout from '../layouts/BasicLayout';
import Dashboard from '../pages/Dashboard';
import Business from '../pages/Business';
import ChatPage from '@/pages/ChatPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/test1" replace />,
      },
      {
        path: 'test1',
        element: <Dashboard />,
      },
      {
        path: 'test2',
        element: <Business />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
    ],
  },
]);

export default router;
