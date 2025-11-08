import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
//import NotFound from "pages/NotFound";
import Login from './pages/login';
import EmergencyCallIntake from './pages/emergency-call-intake';
//import PersonnelScheduling from './pages/personnel-scheduling';
//import ResourceManagement from './pages/resource-management';
//import IncidentDocumentation from './pages/incident-documentation';
//import EmergencyDashboard from './pages/emergency-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/emergency-call-intake" element={<EmergencyCallIntake />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

/*
        <Route path="/personnel-scheduling" element={<PersonnelScheduling />} />
        <Route path="/resource-management" element={<ResourceManagement />} />
        <Route path="/incident-documentation" element={<IncidentDocumentation />} />
        <Route path="/emergency-dashboard" element={<EmergencyDashboard />} />
        <Route path="*" element={<NotFound />} />
*/