import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MockCredentialsDisplay = () => {
  const [isVisible, setIsVisible] = useState(false);

  const mockCredentials = [
    {
      role: 'Despachador',
      username: 'dispatcher01',
      password: 'Emergency2024!',
      description: 'Acceso completo al sistema de emergencias'
    },
    {
      role: 'Jefe de Bomberos',
      username: 'chief.rodriguez',
      password: 'FireChief2024!',
      description: 'Supervisión y gestión de recursos'
    },
    {
      role: 'Bombero Voluntario',
      username: 'volunteer.garcia',
      password: 'Volunteer2024!',
      description: 'Acceso básico y actualización de estado'
    },
    {
      role: 'Administrador',
      username: 'admin.system',
      password: 'Admin2024!',
      description: 'Configuración del sistema'
    }
  ];

  return (
    <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Key" size={16} />
          <span>Credenciales de Prueba</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          iconName={isVisible ? "EyeOff" : "Eye"}
          iconPosition="left"
        >
          {isVisible ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>
      {isVisible && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">
            Utilice estas credenciales para probar diferentes roles en el sistema:
          </p>
          
          {mockCredentials?.map((cred, index) => (
            <div key={index} className="p-3 bg-card border border-border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">{cred?.role}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => navigator.clipboard?.writeText(cred?.username)}
                    className="p-1 hover:bg-muted rounded"
                    title="Copiar usuario"
                  >
                    <Icon name="Copy" size={12} />
                  </button>
                  <button
                    onClick={() => navigator.clipboard?.writeText(cred?.password)}
                    className="p-1 hover:bg-muted rounded"
                    title="Copiar contraseña"
                  >
                    <Icon name="Key" size={12} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Icon name="User" size={12} className="text-muted-foreground" />
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {cred?.username}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Lock" size={12} className="text-muted-foreground" />
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {cred?.password}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                {cred?.description}
              </p>
            </div>
          ))}

          <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-md">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={14} color="var(--color-warning)" />
              <p className="text-xs text-warning">
                <strong>Nota:</strong> Estas son credenciales de demostración únicamente. 
                En un entorno de producción, utilice credenciales seguras proporcionadas por su administrador.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockCredentialsDisplay;