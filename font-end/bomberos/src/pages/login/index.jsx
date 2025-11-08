import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import LoginForm from './components/LoginForm';
import Logo360 from './components/Logo360';
import MockCredentialsDisplay from './components/MockCredentialsDisplay';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('emergencyUser');
    if (user) {
      // Redirigir a la página de llamadas de emergencia
      navigate('/emergency-call-intake');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 relative overflow-hidden">
      {/* Fondo animado con elementos de bomberos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculos decorativos */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-12 text-white relative overflow-hidden">
          {/* Patrón de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-40 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-white rounded-full"></div>
            {/* Patrón de llamas */}
            <svg className="absolute top-40 right-40 w-32 h-32 opacity-50" viewBox="0 0 100 100">
              <path d="M50,10 Q40,30 50,50 Q60,30 50,10" fill="white" />
              <path d="M50,30 Q45,40 50,50 Q55,40 50,30" fill="gold" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col justify-between w-full">
            {/* Header */}
            <div>
              {/* Imagen Institucional de Bomberos (OPCIONAL) */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm">
                <img
                  src="/images/bomberos-banner.jpg"
                  alt="Bomberos Voluntarios de Guatemala"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Si la imagen no existe, ocultar el contenedor
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>

              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm overflow-hidden">
                  {/* Logo pequeño en el header */}
                  <img
                    src="/images/logo-bomberos.png"
                    alt="Logo BVG"
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      // Si no hay imagen, mostrar el icono de llama
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <Icon name="Flame" size={36} color="gold" style={{ display: 'none' }} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Bomberos Voluntarios</h1>
                  <p className="text-white/90 text-lg">de Guatemala</p>
                </div>
              </div>

              <div className="space-y-6 max-w-lg">
                <h2 className="text-3xl font-bold leading-tight">
                  Sistema de Gestión de Emergencias
                </h2>

                <p className="text-white/90 text-lg leading-relaxed">
                  Plataforma integral para la gestión profesional de llamadas de emergencia,
                  coordinación de recursos y documentación de incidentes.
                </p>

                {/* Características Destacadas */}
                <div className="space-y-4 mt-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Phone" size={20} color="white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Recepción de Llamadas</h3>
                      <p className="text-white/80 text-sm">Sistema avanzado con transcripción de voz automática</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="MapPin" size={20} color="white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Localización GPS</h3>
                      <p className="text-white/80 text-sm">Ubicación precisa y mapeo de emergencias en tiempo real</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Users" size={20} color="white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Gestión de Recursos</h3>
                      <p className="text-white/80 text-sm">Coordinación eficiente de personal y equipamiento</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="FileText" size={20} color="white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Documentación Digital</h3>
                      <p className="text-white/80 text-sm">Reportes PDF automatizados y registro completo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Icon name="Shield" size={18} color="gold" />
                  <span className="text-sm text-white/80">Seguridad Certificada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Lock" size={18} color="gold" />
                  <span className="text-sm text-white/80">Datos Protegidos</span>
                </div>
              </div>

              <p className="text-xs text-white/60">
                © {new Date().getFullYear()} Bomberos Voluntarios de Guatemala.
                Sistema desarrollado para servicios de emergencia profesionales.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo 360 */}
            <Logo360 />

            {/* Mobile Branding */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">
                Bomberos Voluntarios
              </h1>
              <p className="text-lg font-semibold text-muted-foreground">de Guatemala</p>
              <p className="text-sm text-muted-foreground mt-2">Sistema de Gestión de Emergencias</p>
            </div>

            {/* Login Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Bienvenido
              </h2>
              <p className="text-muted-foreground">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
              <LoginForm />
            </div>

            {/* Mock Credentials Display */}
            <MockCredentialsDisplay />

            {/* Emergency Notice */}
            <div className="mt-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Icon name="AlertTriangle" size={24} color="#dc2626" />
                <div>
                  <h4 className="text-sm font-bold text-red-700 mb-1">
                    ¿Emergencia Real?
                  </h4>
                  <p className="text-xs text-red-600 mb-3">
                    Si tiene una emergencia real, no use este sistema. Llame inmediatamente:
                  </p>
                  <div className="flex items-center space-x-4">
                    <a
                      href="tel:123"
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg"
                    >
                      <Icon name="Phone" size={16} color="white" />
                      <span>123</span>
                    </a>
                    <a
                      href="tel:122"
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg"
                    >
                      <Icon name="Phone" size={16} color="white" />
                      <span>122</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Sistema Versión 3.0 - Última actualización: Noviembre 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
