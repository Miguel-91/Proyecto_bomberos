import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { EMERGENCY_TYPES, PRIORITIES, getEmergencyType, getPriority } from '../../../utils/emergencyData';

const PRIORITY_RANK = { low: 0, medium: 1, high: 2, critical: 3 };

// Pregunta sugerida para resolver una duda entre dos tipos de emergencia
const DISAMBIGUATION_QUESTIONS = {
  fire: '¿Ve fuego o humo en este momento?',
  medical: '¿Hay alguien herido o que no pueda respirar?',
  traffic: '¿Hay vehículos involucrados?',
  rescue: '¿Hay alguien atrapado o que no pueda salir?',
  hazmat: '¿Siente olor a gas o a químicos?',
  natural: '¿Fue por lluvia, deslave, sismo o el volcán?',
};

/**
 * Clasificación de la emergencia.
 * La IA solo SUGIERE: el operador confirma o corrige antes de crear el ticket.
 * Salvaguardas visibles:
 *  - Explicación (palabras que llevaron a la sugerencia)
 *  - Aviso de clasificación incierta con la segunda opción y una pregunta para resolverla
 *  - Prioridad elevada automáticamente ante la duda (nunca se baja sola)
 *  - Alerta si, después de confirmar, la llamada empieza a indicar algo distinto o más grave
 */
const EmergencyClassification = ({ classification, onClassificationChange, latestAnalysis = null }) => {
  const update = (changes) => {
    onClassificationChange({ ...classification, ...changes, manualOverride: true, confirmed: true });
  };

  const confirmSuggestion = () => {
    onClassificationChange({ ...classification, manualOverride: true, confirmed: true });
  };

  const hasSuggestion = !!classification?.aiType;
  const confirmed = !!classification?.confirmed;

  // ¿La llamada cambió después de que el operador confirmó?
  const latestType = latestAnalysis?.type;
  const latestPriority = latestAnalysis?.priority;
  const typeDrift = confirmed && latestType && latestType !== classification?.type;
  const priorityDrift = confirmed && latestPriority
    && PRIORITY_RANK?.[latestPriority] > (PRIORITY_RANK?.[classification?.priority] ?? -1);

  const applyLatest = () => {
    onClassificationChange({
      ...classification,
      ...(typeDrift && { type: latestType, aiSuggestion: getEmergencyType(latestType)?.label }),
      ...(priorityDrift && { priority: latestPriority }),
      manualOverride: true,
      confirmed: true,
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Tags" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Clasificación de la Emergencia</h3>
        </div>
        {hasSuggestion && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            confirmed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            {confirmed ? 'Confirmada por el operador' : 'Pendiente de confirmar'}
          </span>
        )}
      </div>

      {/* Sugerencia IA */}
      <div className="p-3 mb-3 rounded-md bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Icon name="Bot" size={18} className="text-primary" />
            <span className="text-sm text-foreground">
              Sugerencia IA: <strong>{classification?.aiSuggestion}</strong>
            </span>
          </div>
          <span className="text-sm font-medium text-primary whitespace-nowrap">{classification?.aiConfidence}% confianza</span>
        </div>
        {classification?.evidence?.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Por qué: se mencionó {classification?.evidence?.map((w) => `"${w}"`)?.join(', ')}
          </p>
        )}
        {hasSuggestion && !confirmed && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="default" iconName="Check" onClick={confirmSuggestion}>
              Confirmar {getEmergencyType(classification?.type)?.label}
            </Button>
            <span className="text-xs text-muted-foreground">o elija otro tipo abajo para corregir.</span>
          </div>
        )}
      </div>

      {/* Clasificación incierta */}
      {!confirmed && classification?.needsConfirmation && (
        <div className="p-3 mb-3 rounded-md bg-warning/10 border border-warning/30 text-sm">
          <div className="flex items-center space-x-2 font-medium text-warning">
            <Icon name="AlertTriangle" size={16} />
            <span>Clasificación incierta: confirme con el llamante</span>
          </div>
          {classification?.alternatives?.length > 0 && (
            <p className="mt-1 text-foreground">
              También podría ser: <strong>{classification?.alternatives?.map((a) => a?.label)?.join(' o ')}</strong>.
            </p>
          )}
          <p className="mt-1 text-foreground">
            Pregunte: <em>"{DISAMBIGUATION_QUESTIONS?.[classification?.alternatives?.[0]?.type || classification?.type]}"</em>
          </p>
          {classification?.priorityRaisedByDoubt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Por seguridad, la prioridad se subió a <strong>Alta</strong> mientras se aclara el tipo.
            </p>
          )}
        </div>
      )}

      {/* La llamada cambió después de confirmar */}
      {(typeDrift || priorityDrift) && (
        <div className="p-3 mb-3 rounded-md bg-destructive/10 border border-destructive/30 text-sm">
          <div className="flex items-center space-x-2 font-medium text-destructive">
            <Icon name="BellRing" size={16} />
            <span>La llamada indica algo distinto a lo confirmado</span>
          </div>
          <p className="mt-1 text-foreground">
            {typeDrift && <>La IA ahora detecta <strong>{getEmergencyType(latestType)?.label}</strong>. </>}
            {priorityDrift && <>Prioridad detectada: <strong>{getPriority(latestPriority)?.label}</strong>.</>}
          </p>
          <Button size="sm" variant="destructive" className="mt-2" iconName="RefreshCw" onClick={applyLatest}>
            Actualizar clasificación
          </Button>
        </div>
      )}

      {/* Tipo */}
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

      {/* Prioridad */}
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

      {/* Estimaciones */}
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

      <p className="mt-4 text-[11px] text-muted-foreground">
        La IA no despacha unidades: solo sugiere. El ticket se crea únicamente cuando el operador confirma la clasificación.
      </p>
    </div>
  );
};

export default EmergencyClassification;
