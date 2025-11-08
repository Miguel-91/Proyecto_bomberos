import React, { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';

const EmergencyClassification = ({ classification, onClassificationChange }) => {
  const [localClassification, setLocalClassification] = useState({
    type: '',
    priority: '',
    aiConfidence: 0,
    aiSuggestion: '',
    manualOverride: false,
    estimatedUnits: 1,
    estimatedTime: '',
    riskLevel: '',
    resourcesNeeded: '',
    ...classification
  });

  useEffect(() => {
    setLocalClassification({ ...localClassification, ...classification });
  }, [classification]);

  const emergencyTypes = [
    { value: 'incendio', label: '🔥 Incendio', color: 'text-red-600' },
    { value: 'rescate', label: '⛑️ Rescate', color: 'text-blue-600' },
    { value: 'accidente', label: '🚗 Accidente de Tránsito', color: 'text-yellow-600' },
    { value: 'medica', label: '🏥 Emergencia Médica', color: 'text-green-600' },
    { value: 'materiales-peligrosos', label: '☢️ Materiales Peligrosos', color: 'text-purple-600' },
    { value: 'inundacion', label: '🌊 Inundación', color: 'text-cyan-600' },
    { value: 'derrumbe', label: '🏚️ Derrumbe/Colapso', color: 'text-orange-600' },
    { value: 'otro', label: '❓ Otro', color: 'text-gray-600' }
  ];

  const priorityLevels = [
    { value: 'critical', label: 'Crítica', color: 'bg-red-600', textColor: 'text-red-600' },
    { value: 'high', label: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-500' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { value: 'low', label: 'Baja', color: 'bg-green-500', textColor: 'text-green-500' }
  ];

  const riskLevels = ['Muy Alto', 'Alto', 'Moderado', 'Bajo'];
  const resourceLevels = ['Mínimo', 'Estándar', 'Reforzado', 'Máximo'];

  const handleChange = (field, value) => {
    const updated = { ...localClassification, [field]: value };

    // Auto-adjust resources based on emergency type and priority
    if (field === 'type' || field === 'priority') {
      updated.estimatedUnits = calculateEstimatedUnits(
        field === 'type' ? value : updated.type,
        field === 'priority' ? value : updated.priority
      );
      updated.estimatedTime = calculateEstimatedTime(
        field === 'priority' ? value : updated.priority
      );
    }

    setLocalClassification(updated);
    onClassificationChange(updated);
  };

  const calculateEstimatedUnits = (type, priority) => {
    let base = 1;

    if (type === 'incendio') base = 2;
    if (type === 'materiales-peligrosos') base = 3;
    if (type === 'derrumbe') base = 3;

    if (priority === 'critical') base += 2;
    if (priority === 'high') base += 1;

    return Math.min(base, 5);
  };

  const calculateEstimatedTime = (priority) => {
    const times = {
      critical: '3-5',
      high: '5-8',
      medium: '8-12',
      low: '12-15'
    };
    return times[priority] || '10-15';
  };

  const toggleManualOverride = () => {
    const updated = {
      ...localClassification,
      manualOverride: !localClassification.manualOverride
    };
    setLocalClassification(updated);
    onClassificationChange(updated);
  };

  const getCurrentPriority = () => {
    return priorityLevels.find(p => p.value === localClassification.priority);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Clasificación de Emergencia
        </h2>

        {localClassification.aiSuggestion && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">IA Sugerencia:</span>
            <span className="font-medium text-primary">{localClassification.aiSuggestion}</span>
            <span className="text-xs text-muted-foreground">
              ({localClassification.aiConfidence}% confianza)
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Emergency Type */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Tipo de Emergencia <span className="text-destructive">*</span>
          </label>
          <select
            value={localClassification.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccione un tipo</option>
            {emergencyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Nivel de Prioridad <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {priorityLevels.map(priority => (
              <button
                key={priority.value}
                onClick={() => handleChange('priority', priority.value)}
                className={`px-4 py-3 rounded-md font-medium text-sm transition-all ${
                  localClassification.priority === priority.value
                    ? `${priority.color} text-white shadow-lg scale-105`
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid with additional details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Risk Level */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Nivel de Riesgo
            </label>
            <select
              value={localClassification.riskLevel}
              onChange={(e) => handleChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar</option>
              {riskLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Resources Needed */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Recursos Necesarios
            </label>
            <select
              value={localClassification.resourcesNeeded}
              onChange={(e) => handleChange('resourcesNeeded', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar</option>
              {resourceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimated Units and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Unidades Estimadas
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={localClassification.estimatedUnits}
              onChange={(e) => handleChange('estimatedUnits', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Tiempo Est. de Respuesta (min)
            </label>
            <input
              type="text"
              value={localClassification.estimatedTime}
              onChange={(e) => handleChange('estimatedTime', e.target.value)}
              placeholder="8-12"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Manual Override Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
          <div>
            <span className="text-sm font-medium text-foreground">Anulación Manual de IA</span>
            <p className="text-xs text-muted-foreground">
              Desactivar sugerencias automáticas de inteligencia artificial
            </p>
          </div>
          <button
            onClick={toggleManualOverride}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localClassification.manualOverride ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localClassification.manualOverride ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-muted/30 rounded-md p-4 border-l-4 border-primary">
          <h4 className="text-sm font-semibold text-foreground mb-2">Resumen de Clasificación</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium text-foreground">
                {emergencyTypes.find(t => t.value === localClassification.type)?.label || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prioridad:</span>
              <span className={`font-medium ${getCurrentPriority()?.textColor || 'text-foreground'}`}>
                {getCurrentPriority()?.label || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unidades:</span>
              <span className="font-medium text-foreground">{localClassification.estimatedUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiempo Estimado:</span>
              <span className="font-medium text-foreground">{localClassification.estimatedTime} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyClassification;
