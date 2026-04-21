import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { ScrollParticles } from './components/ui/scroll-particles';
import Sidebar from './components/layout/Sidebar';
import PageTransition from './components/layout/PageTransition';

// Pages
import LandingPage from './pages/LandingPage';
import LaporUmum from './pages/public/LaporUmum';
import UserDashboard from './pages/user/dashboard';
import KonselorDashboard from './pages/konselor/dashboard';
import OperatorDashboard from './pages/operator/dashboard';
import UserManagementPage from './pages/operator/user-management';
import ComplaintsManagementPage from './pages/operator/complaints-management';
import CaseManagementPage from './pages/operator/case-management';
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
import GoogleCallback from './pages/GoogleCallback';
import NewRedirectDashboard from './components/NewRedirectDashboard';
import NewUserDashboard from './pages/NewUserDashboard';
import NewProtectedRoute from './components/NewProtectedRoute';
import ArticleDetail from './components/ArticleDetail';
import KonselorJadwal from './pages/konselor/jadwal-konseling';
import KonselorPengaduan from './pages/konselor/pengaduan';
import KonselorComplaintDetail from './pages/konselor/complaint-detail';
import KonselorMateri from './pages/konselor/materi';
import Profile from './pages/shared/Profile';
import CounselorCaseManagement from './pages/konselor/case-management';
import ManualCounseling from './pages/konselor/manual-counseling';

/* ── Animated Routes (useLocation must be inside Router) ── */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/services" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/articles" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/lapor-umum" element={<PageTransition><LaporUmum /></PageTransition>} />

        {/* Article Detail - public reading page */}
        <Route path="/artikel/:slug" element={<PageTransition><ArticleDetail /></PageTransition>} />

        {/* New Login System Routes */}
        <Route path="/login-new" element={<PageTransition><NewLoginPage /></PageTransition>} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/redirect-new" element={<NewRedirectDashboard />} />

        {/* New Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <NewProtectedRoute>
              <PageTransition><UserDashboard /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <NewProtectedRoute requiredRole="admin">
              <PageTransition><UserDashboard /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/konselor/dashboard"
          element={
            <NewProtectedRoute requiredRole="konselor">
              <PageTransition><KonselorDashboard /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Konselor: Jadwal */}
        <Route
          path="/konselor/jadwal"
          element={
            <NewProtectedRoute requiredRole="konselor">
              <PageTransition><KonselorJadwal /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Konselor: Pengaduan */}
        <Route
          path="/konselor/pengaduan"
          element={
            <NewProtectedRoute requiredRole="konselor">
              <PageTransition><KonselorPengaduan /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/konselor/complaint-detail/:id"
          element={
            <NewProtectedRoute requiredRole="konselor">
              <PageTransition><KonselorComplaintDetail /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Konselor: Jadwal Konseling */}
        <Route
          path="/konselor/counseling-dashboard"
          element={
            <NewProtectedRoute requiredRole="konselor">
              <PageTransition><CounselorCounselingDashboard /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/konselor/materi"
          element={
            <NewProtectedRoute requiredRole="konselor">
              <PageTransition><KonselorMateri /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/konselor/case-management"
          element={
            <NewProtectedRoute requiredRole="konselor">
              <PageTransition><CounselorCaseManagement /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/konselor/manual-counseling"
          element={
            <NewProtectedRoute requiredRole="konselor">
              <PageTransition><ManualCounseling /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/operator/dashboard"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><OperatorDashboard /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* User Management Route for Operator */}
        <Route
          path="/operator/user-management"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><UserManagementPage /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/operator/case-management"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><CaseManagementPage /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/operator/complaints-management"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><CaseManagementPage /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/operator/complaint-detail/:id"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><OperatorComplaintDetail /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/operator/materials-management"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><MaterialsManagement /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/operator/article-management"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><ArticleManagementPage /></PageTransition>
            </NewProtectedRoute>
          }
        />

        <Route
          path="/operator/violence-categories-management"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><ViolenceCategoriesManagement /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Counseling Management for Operator - Redirected to Unified Case Management */}
        <Route
          path="/operator/counseling-management"
          element={
            <NewProtectedRoute requiredRole="operator">
              <PageTransition><CaseManagementPage /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Counselor Schedule Management for Operator (and also accessible by counselors for admin view) */}
        <Route
          path="/operator/counselor-schedule-management"
          element={
            <NewProtectedRoute requiredRole={['operator', 'konselor']}>
              <PageTransition><CounselorScheduleManagementPage /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Counseling Request for User */}
        <Route
          path="/user/counseling-request"
          element={
            <NewProtectedRoute requiredRole="user">
              <PageTransition><CounselingRequestPage /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Counseling Dashboard for Counselor (also accessible by operators to monitor counseling sessions) */}
        <Route
          path="/konselor/counseling-dashboard"
          element={
            <NewProtectedRoute requiredRole={['konselor', 'operator']}>
              <PageTransition><CounselorCounselingDashboard /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* My Schedule Management for Counselor (also accessible by operators to view counselor perspective) */}
        <Route
          path="/konselor/my-schedule-management"
          element={
            <NewProtectedRoute requiredRole={['konselor', 'operator']}>
              <PageTransition><MyScheduleManagementPage /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/user/dashboard"
          element={
            <NewProtectedRoute requiredRole="user">
              <PageTransition><UserDashboard /></PageTransition>
            </NewProtectedRoute>
          }
        />
        <Route
          path="/user/buat-laporan"
          element={
            <NewProtectedRoute requiredRole="user">
              <PageTransition><BuatLaporan /></PageTransition>
            </NewProtectedRoute>
          }
        />
        <Route
          path="/user/report/create"
          element={
            <NewProtectedRoute requiredRole="user">
              <PageTransition><CreateComplaintPage /></PageTransition>
            </NewProtectedRoute>
          }
        />
        <Route
          path="/user/histori-pengaduan"
          element={
            <NewProtectedRoute requiredRole="user">
              <PageTransition><HistoriPengaduan /></PageTransition>
            </NewProtectedRoute>
          }
        />
        <Route
          path="/user/histori-pengaduan/:id"
          element={
            <NewProtectedRoute requiredRole="user">
              <PageTransition><DetailPengaduan /></PageTransition>
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

        <Route
          path="/profile"
          element={
            <NewProtectedRoute>
              <PageTransition><Profile /></PageTransition>
            </NewProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route path="/redirect" element={<RedirectDashboard />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ScrollParticles />
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
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
