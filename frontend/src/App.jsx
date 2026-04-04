import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/layout';

import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import TodayPage from './pages/TodayPage';
import CalendarPage from './pages/CalendarPage';
import ClientPage from './pages/ClientPage';
import SimulationPage from './pages/SimulationPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MaterialPushPage from './pages/MaterialPushPage';

function ProtectedRoute({ children, requireOnboarding = true }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !user?.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.onboardingComplete) {
    return <Navigate to="/today" replace />;
  }

  if (isAuthenticated && !user?.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/today"
          element={
            <ProtectedRoute>
              <Layout title="今日">
                <TodayPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout title="日历视图" showBack>
                <CalendarPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <Layout title="客户">
                <ClientPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/simulation"
          element={
            <ProtectedRoute>
              <Layout title="AI 对练室" showBack hideTabBar>
                <SimulationPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout title="我的">
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/team"
          element={
            <ProtectedRoute>
              <Layout title="团队数据看板" showBack>
                <AdminDashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/materials"
          element={
            <ProtectedRoute>
              <Layout title="素材推送" showBack>
                <MaterialPushPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
