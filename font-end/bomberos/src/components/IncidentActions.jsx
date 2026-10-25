import React, { useState } from 'react';
import Button from './ui/Button';
import Icon from './AppIcon';
import { hasPermission } from '../utils/auth';
import { INCIDENT_STATUS, RESOLUTION_RESULTS, formatDateTime } from '../utils/emergencyData';

export const StatusBadge = ({ status }) => {
  const info = INCIDENT_STATUS?.[status] || { label: status, className: 'bg-muted text-muted-foreground', icon: 'Circle' };
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${info?.className}`}>
      <Icon name={info?.icon} size={12} />
      <span>{info?.label}</span>
    </span>
  );
};

// Línea de tiempo con los cambios de estado del ticket
export const IncidentTimeline = ({ incident }) => (
  <ol className="space-y-2">
    {incident?.history?.map((entry, index) => (
      <li key={index} className="flex items-start space-x-2 text-sm">
        <Icon name={INCIDENT_STATUS?.[entry?.status]?.icon || 'Circle'} size={16} className="mt-0.5 text-muted-foreground" />
        <div>
          <div className="text-foreground">
            {INCIDENT_STATUS?.[entry?.status]?.label}
            {entry?.note && <span className="text-muted-foreground"> · {entry?.note}</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDateTime(entry?.at)}{entry?.by ? ` · ${entry?.by}` : ''}
          </div>
        </div>
      </li>
    ))}
  </ol>
);

export const ResolutionSummary = ({ resolution }) => {
  if (!resolution) return null;
  const result = RESOLUTION_RESULTS?.[resolution?.result];
  return (
    <div className="p-3 rounded-md border border-border bg-muted/40 text-sm">
      <div className={`flex items-center space-x-2 font-semibold ${result?.className}`}>
        <Icon name={result?.icon} size={16} />
        <span>Dictamen: {result?.label}</span>
      </div>
      {resolution?.notes && <p className="mt-1 text-foreground">{resolution?.notes}</p>}
      <p className="mt-1 text-xs text-muted-foreground">
        {resolution?.by} · {formatDateTime(resolution?.at)}
      </p>
    </div>
  );
};

// Botones según el estado del ticket y los permisos del usuario
const IncidentActions = ({ incident, user, onChangeStatus, onFinalize }) => {
  const [showFinalize, setShowFinalize] = useState(false);
  const [result, setResult] = useState('satisfactory');
  const [notes, setNotes] = useState('');

  if (!incident || incident?.status === 'closed') return null;

  const canUpdate = hasPermission(user, 'incidents.update');
  const canFinalize = hasPermission(user, 'incidents.finalize');

  const handleFinalize = () => {
    onFinalize(incident?.id, result, notes?.trim());
    setShowFinalize(false);
    setNotes('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {canUpdate && incident?.status === 'open' && (
          <Button size="sm" variant="destructive" iconName="Siren" onClick={() => onChangeStatus(incident?.id, 'in-progress', 'Unidades en camino')}>
            Iniciar atención
          </Button>
        )}
        {canUpdate && incident?.status === 'in-progress' && (
          <Button size="sm" variant="default" iconName="ClipboardCheck" onClick={() => onChangeStatus(incident?.id, 'awaiting-review', 'Atención concluida en el lugar')}>
            Marcar como atendido
          </Button>
        )}
        {canFinalize && !showFinalize && (
          <Button size="sm" variant="success" iconName="Gavel" onClick={() => setShowFinalize(true)}>
            Finalizar (dictamen del jefe)
          </Button>
        )}
      </div>

      {!canFinalize && incident?.status === 'awaiting-review' && (
        <p className="text-xs text-muted-foreground">Esperando el dictamen del Jefe de Bomberos para finalizar.</p>
      )}

      {showFinalize && (
        <div className="p-3 rounded-md border border-border space-y-3">
          <p className="text-sm font-medium text-foreground">¿La atención de la emergencia fue satisfactoria?</p>
          <div className="flex gap-2">
            {Object.entries(RESOLUTION_RESULTS)?.map(([value, info]) => (
              <button
                key={value}
                type="button"
                onClick={() => setResult(value)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md border text-sm font-medium ${
                  result === value ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground'
                }`}
              >
                <Icon name={info?.icon} size={16} className={info?.className} />
                <span>{info?.label}</span>
              </button>
            ))}
          </div>
          <textarea
            className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Observaciones del dictamen (obligatorio si no fue satisfactorio)"
            value={notes}
            onChange={(e) => setNotes(e?.target?.value)}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowFinalize(false)}>Cancelar</Button>
            <Button
              size="sm"
              variant="success"
              iconName="CheckCircle2"
              onClick={handleFinalize}
              disabled={result === 'unsatisfactory' && !notes?.trim()}
            >
              Confirmar y finalizar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentActions;
