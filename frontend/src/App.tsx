import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppLayout } from './layouts/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { ApprovalPlanPage } from './pages/ApprovalPlanPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { CompliancePage } from './pages/CompliancePage';
import { SchemesPage } from './pages/SchemesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminSlaRiskPage } from './pages/admin/AdminSlaRiskPage';
import { AdminInspectionsPage } from './pages/admin/AdminInspectionsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-600 font-medium">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleRoute: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-600 font-medium">Validating permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Strict Role-Based UI Isolation: redirect unauthorized user to applicant dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const RoleIndexRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'officer') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Workspace Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleIndexRedirect />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="business/profile" element={<BusinessProfilePage />} />
              <Route path="approvals" element={<ApprovalPlanPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="applications/:id" element={<ApplicationDetailPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="inspections" element={<InspectionsPage />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="schemes" element={<SchemesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="ai-assistant" element={<AiAssistantPage />} />

              {/* Officer & Admin Protected Routes - Blocked for Applicants */}
              <Route
                path="audit-logs"
                element={
                  <RoleRoute allowedRoles={['admin', 'officer']}>
                    <AuditLogsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/dashboard"
                element={
                  <RoleRoute allowedRoles={['admin', 'officer']}>
                    <AdminDashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/analytics"
                element={
                  <RoleRoute allowedRoles={['admin', 'officer']}>
                    <AdminDashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/applications"
                element={
                  <RoleRoute allowedRoles={['admin', 'officer']}>
                    <AdminApplicationsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/review"
                element={
                  <RoleRoute allowedRoles={['admin', 'officer']}>
                    <AdminApplicationsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/sla-risk"
                element={
                  <RoleRoute allowedRoles={['admin', 'officer']}>
                    <AdminSlaRiskPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/sla"
                element={
                  <RoleRoute allowedRoles={['admin', 'officer']}>
                    <AdminSlaRiskPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/inspections"
                element={
                  <RoleRoute allowedRoles={['admin', 'officer']}>
                    <AdminInspectionsPage />
                  </RoleRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

