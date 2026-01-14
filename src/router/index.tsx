import { createBrowserRouter } from 'react-router-dom';
import BasicLayout from '../layouts/BasicLayout';
import ChatPage from '@/pages/ChatPage.tsx';
import Login from '@/pages/Login.tsx';
import Dashboard from '@/pages/Dashboard.tsx';
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
        element: <Dashboard />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
    ],
  },
]);

export default router;
