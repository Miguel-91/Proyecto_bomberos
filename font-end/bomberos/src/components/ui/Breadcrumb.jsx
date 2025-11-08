import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  
  const pathMap = {
    '/emergency-dashboard': 'Dashboard',
    '/emergency-call-intake': 'Emergencias',
    '/resource-management': 'Recursos',
    '/incident-documentation': 'Documentación',
    '/personnel-scheduling': 'Personal',
    '/login': 'Iniciar Sesión'
  };

  const getCurrentPageName = () => {
    return pathMap?.[location?.pathname] || 'Página';
  };

  const isHomePage = location?.pathname === '/emergency-dashboard';

  if (isHomePage) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link 
        to="/emergency-dashboard" 
        className="hover:text-foreground transition-colors duration-150"
      >
        Dashboard
      </Link>
      <Icon name="ChevronRight" size={16} />
      <span className="text-foreground font-medium">{getCurrentPageName()}</span>
    </nav>
  );
};

export default Breadcrumb;