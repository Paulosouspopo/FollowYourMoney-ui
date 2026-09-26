import { createBrowserRouter, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { GuestOnly, RequireAuth, Splash } from '@/shared/auth/RequireAuth';
import { AppShell } from './layout/AppShell';
import { appPages } from './pages';

const Dashboard = lazy(appPages.dashboard);
const Portfolios = lazy(appPages.portfolios);
const PortfolioDetail = lazy(appPages.portfolioDetail);
const PositionDetail = lazy(appPages.positionDetail);
const Settings = lazy(appPages.settings);
const Import = lazy(appPages.import);
const Markets = lazy(appPages.markets);
const MarketDetail = lazy(appPages.marketDetail);
const Alerts = lazy(appPages.alerts);
const Income = lazy(appPages.income);
const Goals = lazy(appPages.goals);
const Tax = lazy(appPages.tax);
const More = lazy(appPages.more);
const Guide = lazy(appPages.guide);
const Login = lazy(() => import('@/features/auth/pages/LoginPage'));
const Register = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const VerifyEmail = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));

/** Pages hors de l'app (auth) : chargement différé sans squelette. */
const PublicLayout = () => <Suspense fallback={<Splash />}><Outlet /></Suspense>;

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
        { path: 'markets', element: <Markets /> },
        { path: 'markets/:symbol', element: <MarketDetail /> },
        { path: 'alerts', element: <Alerts /> },
        { path: 'income', element: <Income /> },
        { path: 'goals', element: <Goals /> },
        { path: 'tax', element: <Tax /> },
        { path: 'more', element: <More /> },
        { path: 'guide', element: <Guide /> },
        { path: 'settings', element: <Settings /> },
      ],
    }],
  },
]);
