import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import LanguageSelector from './components/LanguageSelector';
import BrandLogo from '../../components/ui/BrandLogo';
import { APP_NAME, APP_SUBTITLE, ORGANIZATION, EMERGENCY_NUMBERS } from '../../utils/brand';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('emergencyUser');
    if (user) {
      navigate('/emergency-dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      <div className="flex min-h-screen">
        {/* Left Side - Branding and Security Info */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-accent p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-40 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-between w-full">
            {/* Logo and Branding */}
            <div>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 shadow-lg">
                  <BrandLogo size={72} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{APP_NAME}</h1>
                  <p className="text-white/80 text-sm">{APP_SUBTITLE}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold leading-tight">
                  Plataforma Integral para Bomberos Voluntarios
                </h2>
                
                <p className="text-white/90 text-lg leading-relaxed">
                  Automatice la gestión de respuesta a emergencias con nuestro sistema inteligente 
                  de manejo de llamadas, detección de tipos de emergencia y asignación de recursos.
                </p>

                {/* Key Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Icon name="Phone" size={16} color="white" />
                    </div>
                    <span className="text-white/90">Sistema automatizado de recepción de llamadas</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Icon name="Users" size={16} color="white" />
                    </div>
                    <span className="text-white/90">Gestión inteligente de recursos y personal</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Icon name="FileText" size={16} color="white" />
                    </div>
                    <span className="text-white/90">Documentación completa de incidentes</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Icon name="BarChart3" size={16} color="white" />
                    </div>
                    <span className="text-white/90">Análisis y reportes en tiempo real</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Shield" size={16} color="white" />
                  <span className="text-sm text-white/80">Certificado ISO 27001</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Lock" size={16} color="white" />
                  <span className="text-sm text-white/80">Cifrado SSL/TLS</span>
                </div>
              </div>
              
              <p className="text-xs text-white/60">
                © {new Date()?.getFullYear()} {ORGANIZATION}. Todos los derechos reservados. 
                Diseñado específicamente para servicios de emergencia.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex flex-col items-center space-y-3 mb-4">
                <BrandLogo size={80} />
                <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
              </div>
              <p className="text-muted-foreground">{APP_SUBTITLE}</p>
            </div>

            {/* Login Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-muted-foreground">
                Acceda a su cuenta para gestionar emergencias
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Security Information - Mobile */}
            <div className="lg:hidden mt-8">
              <SecurityBadges />
            </div>

            {/* Emergency Contact */}
            <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="AlertTriangle" size={20} color="var(--color-destructive)" />
                <div>
                  <h4 className="text-sm font-semibold text-destructive mb-1">
                    ¿Emergencia Real?
                  </h4>
                  <p className="text-xs text-destructive/80 mb-2">
                    Si tiene una emergencia real, no use este sistema. Llame inmediatamente:
                  </p>
                  <div className="flex items-center space-x-4">
                    {EMERGENCY_NUMBERS?.map((item) => (
                      <a
                        key={item?.number}
                        href={`tel:${item?.number}`}
                        title={item?.label}
                        className="flex items-center space-x-1 text-sm font-bold text-destructive hover:underline"
                      >
                        <Icon name="Phone" size={14} />
                        <span>{item?.number}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <button className="hover:text-foreground transition-colors duration-150">
                  Política de Privacidad
                </button>
                <span>•</span>
                <button className="hover:text-foreground transition-colors duration-150">
                  Términos de Servicio
                </button>
                <span>•</span>
                <button className="hover:text-foreground transition-colors duration-150">
                  Soporte Técnico
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Versión 2.1.0 - Última actualización: 21/09/2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;