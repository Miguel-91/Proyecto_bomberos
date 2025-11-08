import React, { useState, useEffect } from 'react';

const EmergencyProtocolGuide = ({ emergencyType, currentStep, onStepComplete }) => {
  const [activeStep, setActiveStep] = useState(currentStep || 0);

  const protocols = {
    incendio: [
      { id: 1, title: 'Confirmar ubicación exacta', description: 'Verificar dirección y puntos de referencia' },
      { id: 2, title: 'Evaluar tipo de incendio', description: 'Estructural, vehicular, forestal, etc.' },
      { id: 3, title: 'Verificar personas atrapadas', description: 'Confirmar si hay víctimas en el lugar' },
      { id: 4, title: 'Identificar materiales peligrosos', description: 'Preguntar sobre químicos o gases' },
      { id: 5, title: 'Despachar unidades apropiadas', description: 'Enviar recursos según clasificación' }
    ],
    rescate: [
      { id: 1, title: 'Determinar número de víctimas', description: 'Cuántas personas necesitan rescate' },
      { id: 2, title: 'Evaluar condición de víctimas', description: 'Heridas, conscientes, atrapadas' },
      { id: 3, title: 'Identificar tipo de rescate', description: 'Altura, agua, derrumbe, vehículo' },
      { id: 4, title: 'Solicitar equipo especial', description: 'Escaleras, cuerdas, botes, etc.' },
      { id: 5, title: 'Coordinar con servicios médicos', description: 'Alertar ambulancias si es necesario' }
    ],
    accidente: [
      { id: 1, title: 'Determinar número de vehículos', description: 'Cuántos vehículos involucrados' },
      { id: 2, title: 'Evaluar heridos', description: 'Número y condición de heridos' },
      { id: 3, title: 'Verificar riesgos adicionales', description: 'Fuego, fugas, materiales peligrosos' },
      { id: 4, title: 'Coordinar control de tráfico', description: 'Desvíos y seguridad vial' },
      { id: 5, title: 'Despachar recursos', description: 'Bomberos, ambulancias, grúas' }
    ],
    default: [
      { id: 1, title: 'Confirmar tipo de emergencia', description: 'Clasificar la situación' },
      { id: 2, title: 'Obtener ubicación exacta', description: 'Dirección y puntos de referencia' },
      { id: 3, title: 'Evaluar gravedad', description: 'Determinar prioridad' },
      { id: 4, title: 'Identificar recursos necesarios', description: 'Qué unidades despachar' },
      { id: 5, title: 'Mantener contacto', description: 'Seguimiento hasta llegada de unidades' }
    ]
  };

  const currentProtocol = protocols[emergencyType] || protocols.default;

  const handleStepComplete = (stepId) => {
    onStepComplete && onStepComplete(stepId);
    if (activeStep < currentProtocol.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const getStepStatus = (index) => {
    if (index < activeStep) return 'completed';
    if (index === activeStep) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Protocolo de Emergencia
      </h3>

      {emergencyType ? (
        <div className="space-y-3">
          {currentProtocol.map((step, index) => {
            const status = getStepStatus(index);

            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border-l-4 transition-all ${
                  status === 'completed'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : status === 'active'
                    ? 'border-primary bg-primary/10'
                    : 'border-muted bg-muted/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      status === 'completed'
                        ? 'bg-green-500 text-white'
                        : status === 'active'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {status === 'completed' ? '✓' : step.id}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${
                      status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    {status === 'active' && (
                      <button
                        onClick={() => handleStepComplete(step.id)}
                        className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90"
                      >
                        Marcar como Completado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Progress */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progreso</span>
              <span>{Math.round((activeStep / currentProtocol.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(activeStep / currentProtocol.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Seleccione un tipo de emergencia para ver el protocolo correspondiente</p>
        </div>
      )}
    </div>
  );
};

export default EmergencyProtocolGuide;
