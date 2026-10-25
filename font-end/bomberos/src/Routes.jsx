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

// Redirige al login si no hay una sesión guardada
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('emergencyUser');
  return user ? children : <Navigate to="/login" replace />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<Navigate to="/emergency-dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/emergency-dashboard" element={<ProtectedRoute><EmergencyDashboard /></ProtectedRoute>} />
        <Route path="/emergency-call-intake" element={<ProtectedRoute><EmergencyCallIntake /></ProtectedRoute>} />
        <Route path="/personnel-scheduling" element={<ProtectedRoute><PersonnelScheduling /></ProtectedRoute>} />
        <Route path="/resource-management" element={<ProtectedRoute><ResourceManagement /></ProtectedRoute>} />
        <Route path="/incident-documentation" element={<ProtectedRoute><IncidentDocumentation /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
