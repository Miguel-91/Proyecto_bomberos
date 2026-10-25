import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import IncidentActions, { StatusBadge, IncidentTimeline, ResolutionSummary } from '../../../components/IncidentActions';
import { getEmergencyType, getPriority } from '../../../utils/emergencyData';

// Ticket de la emergencia en curso: creación y seguimiento de su estado
const TicketPanel = ({ ticket, canCreate, missingFields = [], onCreate, user, onChangeStatus, onFinalize }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="Ticket" size={18} className="text-primary" />
          <h4 className="font-semibold text-foreground">Ticket de Emergencia</h4>
        </div>
        {ticket && <StatusBadge status={ticket?.status} />}
      </div>

      {!ticket ? (
        <div className="space-y-3">
          {missingFields?.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Falta: {missingFields?.join(', ')}. Se llena automáticamente al transcribir la llamada.
            </p>
          )}
          <Button variant="success" size="sm" fullWidth iconName="TicketPlus" onClick={onCreate} disabled={!canCreate}>
            Crear ticket de emergencia
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm">
            <div className="font-semibold text-foreground">{ticket?.id}</div>
            <div className="text-muted-foreground">
              {getEmergencyType(ticket?.type)?.label} · Prioridad {getPriority(ticket?.priority)?.label}
            </div>
            <div className="text-muted-foreground">{ticket?.address}</div>
          </div>

          <IncidentTimeline incident={ticket} />
          <ResolutionSummary resolution={ticket?.resolution} />
          <IncidentActions incident={ticket} user={user} onChangeStatus={onChangeStatus} onFinalize={onFinalize} />

          <Link to="/incident-documentation" className="block text-center text-sm text-primary hover:underline">
            Ver todos los tickets
          </Link>
        </div>
      )}
    </div>
  );
};

export default TicketPanel;
