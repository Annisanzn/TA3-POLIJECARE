import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { ScrollParticles } from './components/ui/scroll-particles';
import Sidebar from './components/layout/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/user/dashboard';
import KonselorDashboard from './pages/konselor/dashboard';
import OperatorDashboard from './pages/operator/dashboard';
import UserManagementPage from './pages/operator/user-management';
import ComplaintsManagementPage from './pages/operator/complaints-management';
import OperatorComplaintDetail from './pages/operator/complaint-detail';
import MaterialsManagement from './pages/operator/materials-management';
import HistoriPengaduan from './pages/user/histori-pengaduan';
import DetailPengaduan from './pages/user/detail-pengaduan';
import BuatLaporan from './pages/user/buat-laporan';
import CreateComplaintPage from './pages/user/CreateComplaintPage';
import ViolenceCategoriesManagement from './pages/operator/violence-categories-management';
import CounselingManagementPage from './pages/operator/counseling-management';
import CounselorScheduleManagementPage from './pages/operator/counselor-schedule-management';
import CounselingRequestPage from './pages/user/counseling-request';
import CounselorCounselingDashboard from './pages/konselor/counseling-dashboard';
import MyScheduleManagementPage from './pages/konselor/my-schedule-management';
import ArticleManagementPage from './pages/operator/article-management';
import NewLoginPage from './pages/NewLoginPage';
import NewRedirectDashboard from './components/NewRedirectDashboard';
import NewUserDashboard from './pages/NewUserDashboard';
import NewProtectedRoute from './components/NewProtectedRoute';
import ArticleDetail from './components/ArticleDetail';
import KonselorJadwal from './pages/konselor/jadwal-konseling';
import KonselorPengaduan from './pages/konselor/pengaduan';
import KonselorComplaintDetail from './pages/konselor/complaint-detail';
import KonselorMateri from './pages/konselor/materi';

function App() {
  return (
    <ThemeProvider>
      <ScrollParticles />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<LandingPage />} />
            <Route path="/services" element={<LandingPage />} />
            <Route path="/articles" element={<LandingPage />} />
            <Route path="/contact" element={<LandingPage />} />

            {/* Article Detail - public reading page */}
            <Route path="/artikel/:slug" element={<ArticleDetail />} />

            {/* New Login System Routes */}
            <Route path="/login-new" element={<NewLoginPage />} />
            <Route path="/redirect-new" element={<NewRedirectDashboard />} />

            {/* New Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <NewProtectedRoute>
                  <UserDashboard />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <NewProtectedRoute requiredRole="admin">
                  <UserDashboard />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/konselor/dashboard"
              element={
                <NewProtectedRoute requiredRole="konselor">
                  <KonselorDashboard />
                </NewProtectedRoute>
              }
            />

            {/* Konselor: Jadwal */}
            <Route
              path="/konselor/jadwal"
              element={
                <NewProtectedRoute requiredRole="konselor">
                  <KonselorJadwal />
                </NewProtectedRoute>
              }
            />

            {/* Konselor: Pengaduan */}
            <Route
              path="/konselor/pengaduan"
              element={
                <NewProtectedRoute requiredRole="konselor">
                  <KonselorPengaduan />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/konselor/complaint-detail/:id"
              element={
                <NewProtectedRoute requiredRole="konselor">
                  <KonselorComplaintDetail />
                </NewProtectedRoute>
              }
            />

            {/* Konselor: Jadwal Konseling */}
            <Route
              path="/konselor/counseling-dashboard"
              element={
                <NewProtectedRoute requiredRole="konselor">
                  <CounselorCounselingDashboard />
                </NewProtectedRoute>
              }
            />

            {/* Konselor: Materi */}
            <Route
              path="/konselor/materi"
              element={
                <NewProtectedRoute requiredRole="konselor">
                  <KonselorMateri />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/operator/dashboard"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <OperatorDashboard />
                </NewProtectedRoute>
              }
            />

            {/* User Management Route for Operator */}
            <Route
              path="/operator/user-management"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <UserManagementPage />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/operator/complaints-management"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <ComplaintsManagementPage />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/operator/complaint-detail/:id"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <OperatorComplaintDetail />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/operator/materials-management"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <MaterialsManagement />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/operator/article-management"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <ArticleManagementPage />
                </NewProtectedRoute>
              }
            />

            <Route
              path="/operator/violence-categories-management"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <ViolenceCategoriesManagement />
                </NewProtectedRoute>
              }
            />

            {/* Counseling Management for Operator */}
            <Route
              path="/operator/counseling-management"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <CounselingManagementPage />
                </NewProtectedRoute>
              }
            />

            {/* Counselor Schedule Management for Operator (and also accessible by counselors for admin view) */}
            <Route
              path="/operator/counselor-schedule-management"
              element={
                <NewProtectedRoute requiredRole={['operator', 'konselor']}>
                  <CounselorScheduleManagementPage />
                </NewProtectedRoute>
              }
            />

            {/* Counseling Request for User */}
            <Route
              path="/user/counseling-request"
              element={
                <NewProtectedRoute requiredRole="user">
                  <CounselingRequestPage />
                </NewProtectedRoute>
              }
            />

            {/* Counseling Dashboard for Counselor (also accessible by operators to monitor counseling sessions) */}
            <Route
              path="/konselor/counseling-dashboard"
              element={
                <NewProtectedRoute requiredRole={['konselor', 'operator']}>
                  <CounselorCounselingDashboard />
                </NewProtectedRoute>
              }
            />

            {/* My Schedule Management for Counselor (also accessible by operators to view counselor perspective) */}
            <Route
              path="/konselor/my-schedule-management"
              element={
                <NewProtectedRoute requiredRole={['konselor', 'operator']}>
                  <MyScheduleManagementPage />
                </NewProtectedRoute>
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/user/dashboard"
              element={
                <NewProtectedRoute requiredRole="user">
                  <UserDashboard />
                </NewProtectedRoute>
              }
            />
            <Route
              path="/user/buat-laporan"
              element={
                <NewProtectedRoute requiredRole="user">
                  <BuatLaporan />
                </NewProtectedRoute>
              }
            />
            <Route
              path="/user/report/create"
              element={
                <NewProtectedRoute requiredRole="user">
                  <CreateComplaintPage />
                </NewProtectedRoute>
              }
            />
            <Route
              path="/user/histori-pengaduan"
              element={
                <NewProtectedRoute requiredRole="user">
                  <HistoriPengaduan />
                </NewProtectedRoute>
              }
            />
            <Route
              path="/user/histori-pengaduan/:id"
              element={
                <NewProtectedRoute requiredRole="user">
                  <DetailPengaduan />
                </NewProtectedRoute>
              }
            />
            {/* Routes di bawah ini sudah digantikan oleh NewProtectedRoute di atas */}
            {/* <Route
              path="/konselor/dashboard"
              element={
                <ProtectedRoute requiredRole="konselor">
                  <KonselorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/dashboard"
              element={
                <ProtectedRoute requiredRole="operator">
                  <OperatorDashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Redirect */}
            <Route path="/redirect" element={<RedirectDashboard />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Redirect component for role-based navigation
const RedirectDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  switch (user.role) {
    case 'user':
      return <Navigate to="/user/dashboard" replace />;
    case 'konselor':
      return <Navigate to="/konselor/dashboard" replace />;
    case 'operator':
      return <Navigate to="/operator/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default App;
