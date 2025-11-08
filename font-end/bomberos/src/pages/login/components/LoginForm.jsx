import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Mock credentials for different user types
  const mockCredentials = [
    { username: 'dispatcher01', password: 'Emergency2024!', role: 'dispatcher', name: 'Juan Pérez' },
    { username: 'chief.rodriguez', password: 'FireChief2024!', role: 'chief', name: 'María Rodríguez' },
    { username: 'volunteer.garcia', password: 'Volunteer2024!', role: 'volunteer', name: 'Carlos García' },
    { username: 'admin.system', password: 'Admin2024!', role: 'admin', name: 'Sistema Admin' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.username?.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    }

    if (!formData?.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check credentials
      const user = mockCredentials?.find(
        cred => cred?.username === formData?.username && cred?.password === formData?.password
      );

      if (user) {
        // Store user session
        localStorage.setItem('emergencyUser', JSON.stringify({
          username: user?.username,
          role: user?.role,
          name: user?.name,
          loginTime: new Date()?.toISOString(),
          rememberMe: formData?.rememberMe
        }));

        // Navigate to dashboard
        navigate('/emergency-call-intake');
      } else {
        setLoginAttempts(prev => prev + 1);
        setErrors({
          general: 'Credenciales incorrectas. Verifique su usuario y contraseña.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Error de conexión. Intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would open a password reset modal or navigate to reset page
    alert('Funcionalidad de recuperación de contraseña próximamente disponible.');
  };

  const isAccountLocked = loginAttempts >= 3;

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Field */}
        <Input
          label="Nombre de Usuario"
          type="text"
          name="username"
          placeholder="Ingrese su nombre de usuario"
          value={formData?.username}
          onChange={handleInputChange}
          error={errors?.username}
          required
          disabled={isAccountLocked}
          className="w-full"
        />

        {/* Password Field */}
        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Ingrese su contraseña"
            value={formData?.password}
            onChange={handleInputChange}
            error={errors?.password}
            required
            disabled={isAccountLocked}
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors duration-150"
            disabled={isAccountLocked}
          >
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
          </button>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="Recordarme"
            name="rememberMe"
            checked={formData?.rememberMe}
            onChange={handleInputChange}
            disabled={isAccountLocked}
          />
          
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:text-primary/80 transition-colors duration-150"
            disabled={isAccountLocked}
          >
            ¿Olvidó su contraseña?
          </button>
        </div>

        {/* Error Messages */}
        {errors?.general && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} color="var(--color-destructive)" />
              <span className="text-sm text-destructive">{errors?.general}</span>
            </div>
          </div>
        )}

        {/* Account Lockout Warning */}
        {isAccountLocked && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
            <div className="flex items-center space-x-2">
              <Icon name="Lock" size={16} color="var(--color-warning)" />
              <span className="text-sm text-warning">
                Cuenta bloqueada temporalmente por múltiples intentos fallidos.
              </span>
            </div>
          </div>
        )}

        {/* Login Attempts Warning */}
        {loginAttempts > 0 && loginAttempts < 3 && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
              <span className="text-sm text-warning">
                Intento {loginAttempts} de 3. La cuenta se bloqueará después de 3 intentos fallidos.
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isAccountLocked}
          iconName="LogIn"
          iconPosition="left"
        >
          {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </Button>

        {/* Emergency Access */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            onClick={() => alert('Contacte al administrador del sistema para acceso de emergencia.')}
          >
            ¿Acceso de emergencia?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;