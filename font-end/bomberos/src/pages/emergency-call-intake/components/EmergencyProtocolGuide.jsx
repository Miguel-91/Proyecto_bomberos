import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { getEmergencyType } from '../../../utils/emergencyData';

const PROTOCOLS = {
  fire: [
    'Confirmar dirección y tipo de estructura',
    'Indicar al llamante que evacúe y no regrese al inmueble',
    'Preguntar por personas atrapadas',
    'Despachar autobomba y cisterna',
    'Notificar a la Empresa Eléctrica si hay riesgo eléctrico',
  ],
  medical: [
    'Verificar estado de conciencia y respiración',
    'Dar instrucciones de RCP si no respira',
    'No mover al paciente si hay sospecha de trauma',
    'Despachar ambulancia',
    'Mantener la línea abierta hasta la llegada de la unidad',
  ],
  traffic: [
    'Confirmar número de vehículos y heridos',
    'Indicar señalizar la zona y no mover a los heridos',
    'Despachar ambulancia y unidad de rescate',
    'Notificar a PNC (110) y PMT',
  ],
  rescue: [
    'Determinar tipo de rescate (altura, barranco, agua)',
    'Indicar que nadie intente el rescate sin equipo',
    'Despachar unidad de rescate especializada',
    'Coordinar acceso y punto de encuentro',
  ],
  hazmat: [
    'Identificar sustancia si es posible',
    'Ordenar evacuación en dirección contraria al viento',
    'Despachar unidad de materiales peligrosos',
    'Notificar a CONRED (119)',
  ],
};

const DEFAULT_PROTOCOL = [
  'Confirmar ubicación exacta',
  'Identificar tipo de emergencia',
  'Evaluar número de afectados',
  'Despachar la unidad más cercana',
];

const EmergencyProtocolGuide = ({ emergencyType, currentStep = 0, onStepComplete }) => {
  const steps = PROTOCOLS?.[emergencyType] || DEFAULT_PROTOCOL;
  const [completed, setCompleted] = useState(() => new Set([...Array(currentStep)?.keys()]));

  const toggleStep = (index) => {
    const next = new Set(completed);
    if (next?.has(index)) {
      next?.delete(index);
    } else {
      next?.add(index);
      onStepComplete(steps?.[index]);
    }
    setCompleted(next);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="ClipboardList" size={18} className="text-primary" />
          <h4 className="font-semibold text-foreground">Protocolo de Atención</h4>
        </div>
        <span className="text-xs text-muted-foreground">{getEmergencyType(emergencyType)?.label}</span>
      </div>

      <ol className="space-y-2">
        {steps?.map((step, index) => (
          <li key={step}>
            <button
              onClick={() => toggleStep(index)}
              className="flex items-start space-x-2 w-full text-left text-sm"
            >
              <Icon
                name={completed?.has(index) ? 'CheckCircle2' : 'Circle'}
                size={18}
                className={completed?.has(index) ? 'text-success' : 'text-muted-foreground'}
              />
              <span className={completed?.has(index) ? 'line-through text-muted-foreground' : 'text-foreground'}>
                {index + 1}. {step}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default EmergencyProtocolGuide;
