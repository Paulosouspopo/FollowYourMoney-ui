import { createBrowserRouter, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { GuestOnly, RequireAuth } from '@/shared/auth/RequireAuth';
import { AppShell } from './layout/AppShell';

const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const Portfolios = lazy(() => import('@/features/portfolios/pages/PortfoliosPage'));
const PortfolioDetail = lazy(() => import('@/features/portfolios/pages/PortfolioDetailPage'));
const PositionDetail = lazy(() => import('@/features/positions/pages/PositionDetailPage'));
const Settings = lazy(() => import('@/features/settings/pages/SettingsPage'));
const Import = lazy(() => import('@/features/imports/pages/ImportPage'));
const Alerts = lazy(() => import('@/features/notifications/pages/AlertsPage'));
const Login = lazy(() => import('@/features/auth/pages/LoginPage'));
const Register = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const VerifyEmail = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));

/** Pages hors de l'app (auth) : chargement différé sans squelette. */
const PublicLayout = () => <Suspense fallback={null}><Outlet /></Suspense>;

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        element: <GuestOnly />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
          { path: '/forgot-password', element: <ForgotPassword /> },
        ],
      },
      // Liens reçus par email : accessibles connecté ou non
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/reset-password', element: <ResetPassword /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [{
      element: <AppShell />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'portfolios', element: <Portfolios /> },
        { path: 'portfolios/:portfolioId', element: <PortfolioDetail /> },
        { path: 'portfolios/:portfolioId/positions/:symbol', element: <PositionDetail /> },
        { path: 'portfolios/:portfolioId/import', element: <Import /> },
        { path: 'alerts', element: <Alerts /> },
        { path: 'settings', element: <Settings /> },
      ],
    }],
  },
]);
