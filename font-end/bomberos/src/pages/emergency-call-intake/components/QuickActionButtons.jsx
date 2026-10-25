import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DISPATCH_OPTIONS = [
  { type: 'fire-engine', label: 'Autobomba', icon: 'Flame', variant: 'destructive' },
  { type: 'ambulance', label: 'Ambulancia', icon: 'Ambulance', variant: 'default' },
  { type: 'rescue', label: 'Rescate', icon: 'LifeBuoy', variant: 'warning' },
  { type: 'water-tanker', label: 'Cisterna', icon: 'Droplets', variant: 'secondary' },
];

const QuickActionButtons = ({ onDispatchResources, onTransferCall, onCreateIncident }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="Zap" size={18} className="text-primary" />
        <h4 className="font-semibold text-foreground">Acciones Rápidas</h4>
      </div>

      <p className="text-xs text-muted-foreground mb-2">Despachar unidad</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {DISPATCH_OPTIONS?.map((option) => (
          <Button
            key={option?.type}
            variant={option?.variant}
            size="sm"
            iconName={option?.icon}
            onClick={() => onDispatchResources(option?.type)}
          >
            {option?.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          iconName="PhoneForwarded"
          onClick={() => onTransferCall({ target: 'PNC 110', reason: 'Apoyo policial' })}
        >
          Transferir a PNC (110)
        </Button>
        {onCreateIncident && (
          <Button variant="success" size="sm" fullWidth iconName="TicketPlus" onClick={onCreateIncident}>
            Crear Ticket de Emergencia
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuickActionButtons;
