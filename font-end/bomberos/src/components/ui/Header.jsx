import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', href: '/emergency-dashboard', icon: 'LayoutDashboard' },
    { name: 'Emergencias', href: '/emergency-call-intake', icon: 'Phone' },
    { name: 'Recursos', href: '/resource-management', icon: 'Users' },
    { name: 'Documentación', href: '/incident-documentation', icon: 'FileText' },
  ];

  const moreItems = [
    { name: 'Personal', href: '/personnel-scheduling', icon: 'Calendar' },
  ];

  const isActive = (href) => location?.pathname === href;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = () => {
    // Limpiar datos de sesión
    localStorage.removeItem('emergencyUser');
    // Redirigir al login
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/emergency-dashboard" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="Shield" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">EmergencyHub</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.name}
              to={item?.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                isActive(item?.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.name}</span>
            </Link>
          ))}
          
          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2"
            >
              <Icon name="MoreHorizontal" size={16} />
              <span>Más</span>
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-modal z-50">
                <div className="py-1">
                  {moreItems?.map((item) => (
                    <Link
                      key={item?.name}
                      to={item?.href}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm transition-colors duration-150 ${
                        isActive(item?.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-popover-foreground hover:bg-muted'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Side - Emergency Status & User Menu */}
        <div className="flex items-center space-x-4">
          {/* Emergency Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-success/10 text-success rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Sistema Activo</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleUserMenu}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Icon name="User" size={16} />
              </div>
              <span className="hidden md:block text-sm font-medium">Dispatcher</span>
              <Icon name="ChevronDown" size={16} />
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-modal z-50">
                <div className="py-1">
                  <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border">
                    <div className="font-medium text-foreground">Juan Pérez</div>
                    <div>Despachador Principal</div>
                  </div>
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150">
                    <Icon name="Settings" size={16} />
                    <span>Configuración</span>
                  </button>
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150">
                    <Icon name="HelpCircle" size={16} />
                    <span>Ayuda</span>
                  </button>
                  <div className="border-t border-border">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors duration-150"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="lg:hidden"
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <div className="px-4 py-2 space-y-1">
            {[...navigationItems, ...moreItems]?.map((item) => (
              <Link
                key={item?.name}
                to={item?.href}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors duration-150 ${
                  isActive(item?.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon name={item?.icon} size={20} />
                <span>{item?.name}</span>
              </Link>
            ))}
          </div>
          
          {/* Mobile Emergency Status */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center space-x-2 px-3 py-2 bg-success/10 text-success rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Sistema Activo - Sin Emergencias</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;