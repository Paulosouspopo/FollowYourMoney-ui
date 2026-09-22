import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { RequireAuth } from '@/shared/auth/RequireAuth';
import { AppShell } from './layout/AppShell';

const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const Portfolios = lazy(() => import('@/features/portfolios/pages/PortfoliosPage'));
const PortfolioDetail = lazy(() => import('@/features/portfolios/pages/PortfolioDetailPage'));
const PositionDetail = lazy(() => import('@/features/positions/pages/PositionDetailPage'));
const Settings = lazy(() => import('@/features/settings/pages/SettingsPage'));
const Login = lazy(() => import('@/features/auth/pages/LoginPage'));
const Register = lazy(() => import('@/features/auth/pages/RegisterPage'));

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <RequireAuth />,
    children: [{
      element: <AppShell />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'portfolios', element: <Portfolios /> },
        { path: 'portfolios/:portfolioId', element: <PortfolioDetail /> },
        { path: 'portfolios/:portfolioId/positions/:symbol', element: <PositionDetail /> },
        { path: 'settings', element: <Settings /> },
      ],
    }],
  },
]);