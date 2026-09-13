import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupAdminPage from './pages/SetupAdminPage';
import ResidentDashboard from './pages/ResidentDashboard';
import CreateRequestPage from './pages/CreateRequestPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequestDetail from './pages/AdminRequestDetail';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminAnalytics from './pages/AdminAnalytics';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-warm-bg flex items-center justify-center text-slate-gray text-sm">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'RESIDENT') return <Navigate to="/resident" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'WORKER') return <Navigate to="/worker" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-warm-bg text-charcoal flex flex-col font-sans antialiased">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/setup-admin" element={<SetupAdminPage />} />

              {/* Resident Routes */}
              <Route 
                path="/resident" 
                element={
                  <ProtectedRoute allowedRoles={['RESIDENT']}>
                    <ResidentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resident/report" 
                element={
                  <ProtectedRoute allowedRoles={['RESIDENT']}>
                    <CreateRequestPage />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } 
              />

              {/* Worker Routes */}
              <Route 
                path="/worker" 
                element={
                  <ProtectedRoute allowedRoles={['WORKER']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Shared Detail View */}
              <Route 
                path="/requests/:id" 
                element={
                  <ProtectedRoute allowedRoles={['RESIDENT', 'ADMIN', 'WORKER']}>
                    <AdminRequestDetail />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
