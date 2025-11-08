import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'Cifrado SSL/TLS',
      description: 'Conexión segura certificada'
    },
    {
      icon: 'Lock',
      title: 'Autenticación Segura',
      description: 'Protección de credenciales'
    },
    {
      icon: 'Eye',
      title: 'Monitoreo 24/7',
      description: 'Supervisión continua del sistema'
    }
  ];

  const certifications = [
    {
      name: 'ISO 27001',
      description: 'Gestión de Seguridad de la Información'
    },
    {
      name: 'SOC 2 Tipo II',
      description: 'Controles de Seguridad Auditados'
    },
    {
      name: 'GDPR Compliant',
      description: 'Protección de Datos Personales'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Security Features */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Características de Seguridad
        </h3>
        {securityFeatures?.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name={feature?.icon} size={16} color="var(--color-primary)" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">{feature?.title}</h4>
              <p className="text-xs text-muted-foreground">{feature?.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Certifications */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Certificaciones y Cumplimiento
        </h3>
        <div className="space-y-2">
          {certifications?.map((cert, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-success/5 border border-success/20 rounded-md">
              <div>
                <span className="text-sm font-medium text-success">{cert?.name}</span>
                <p className="text-xs text-muted-foreground">{cert?.description}</p>
              </div>
              <Icon name="CheckCircle" size={16} color="var(--color-success)" />
            </div>
          ))}
        </div>
      </div>
      {/* Emergency Services Badge */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Icon name="Shield" size={20} color="white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Certificado para Servicios de Emergencia
            </h4>
            <p className="text-xs text-muted-foreground">
              Cumple con estándares internacionales de seguridad para sistemas críticos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;