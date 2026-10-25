import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Login from './pages/login';
import EmergencyCallIntake from './pages/emergency-call-intake';
import PersonnelScheduling from './pages/personnel-scheduling';
import ResourceManagement from './pages/resource-management';
import IncidentDocumentation from './pages/incident-documentation';
import EmergencyDashboard from './pages/emergency-dashboard';
import SystemSettings from './pages/system-settings';
import { getCurrentUser, hasPermission } from './utils/auth';

// Redirige al login si no hay sesión, y al dashboard si el rol no tiene permiso
const ProtectedRoute = ({ permission, children }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasPermission(user, permission)) return <Navigate to="/emergency-dashboard" replace />;
  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<Navigate to="/emergency-dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/emergency-dashboard" element={<ProtectedRoute permission="dashboard.view"><EmergencyDashboard /></ProtectedRoute>} />
        <Route path="/emergency-call-intake" element={<ProtectedRoute permission="emergencies.manage"><EmergencyCallIntake /></ProtectedRoute>} />
        <Route path="/personnel-scheduling" element={<ProtectedRoute permission="personnel.view"><PersonnelScheduling /></ProtectedRoute>} />
        <Route path="/resource-management" element={<ProtectedRoute permission="resources.view"><ResourceManagement /></ProtectedRoute>} />
        <Route path="/incident-documentation" element={<ProtectedRoute permission="incidents.view"><IncidentDocumentation /></ProtectedRoute>} />
        <Route path="/system-settings" element={<ProtectedRoute permission="settings.manage"><SystemSettings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
