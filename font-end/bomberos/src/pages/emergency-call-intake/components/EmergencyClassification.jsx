import React from 'react';
import Icon from '../../../components/AppIcon';
import { EMERGENCY_TYPES, PRIORITIES } from '../../../utils/emergencyData';

const EmergencyClassification = ({ classification, onClassificationChange }) => {
  const update = (changes) => {
    onClassificationChange({ ...classification, ...changes, manualOverride: true });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Tags" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Clasificación de la Emergencia</h3>
      </div>

      {/* AI Suggestion */}
      <div className="flex items-center justify-between p-3 mb-4 rounded-md bg-primary/5 border border-primary/20">
        <div className="flex items-center space-x-2">
          <Icon name="Bot" size={18} className="text-primary" />
          <span className="text-sm text-foreground">
            Sugerencia IA: <strong>{classification?.aiSuggestion}</strong>
          </span>
        </div>
        <span className="text-sm font-medium text-primary">{classification?.aiConfidence}% confianza</span>
      </div>

      {/* Emergency Type */}
      <p className="text-sm font-medium text-foreground mb-2">Tipo</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {EMERGENCY_TYPES?.map((type) => (
          <button
            key={type?.value}
            onClick={() => update({ type: type?.value })}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md border text-sm transition-colors ${
              classification?.type === type?.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:bg-muted'
            }`}
          >
            <Icon name={type?.icon} size={16} />
            <span className="truncate">{type?.label}</span>
          </button>
        ))}
      </div>

      {/* Priority */}
      <p className="text-sm font-medium text-foreground mb-2">Prioridad</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {PRIORITIES?.map((priority) => (
          <button
            key={priority?.value}
            onClick={() => update({ priority: priority?.value })}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
              classification?.priority === priority?.value
                ? `${priority?.className} border-current`
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {priority?.label}
          </button>
        ))}
      </div>

      {/* Estimates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border text-sm">
        <div>
          <div className="text-muted-foreground">Unidades estimadas</div>
          <div className="font-semibold text-foreground">{classification?.estimatedUnits}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Tiempo estimado</div>
          <div className="font-semibold text-foreground">{classification?.estimatedTime} min</div>
        </div>
        <div>
          <div className="text-muted-foreground">Nivel de riesgo</div>
          <div className="font-semibold text-foreground">{classification?.riskLevel}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Recursos</div>
          <div className="font-semibold text-foreground">{classification?.resourcesNeeded}</div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyClassification;
