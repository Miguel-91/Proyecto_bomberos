import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TRANSFER_TARGETS = [
  { value: 'PNC 110', label: 'Policía Nacional Civil (110)' },
  { value: 'Bomberos Municipales 123', label: 'Bomberos Municipales (123)' },
  { value: 'CONRED 119', label: 'CONRED (119)' },
  { value: 'Hospital Nacional Pedro de Bethancourt', label: 'Hospital Pedro de Bethancourt' },
];

const CallManagementPanel = ({ onTransferCall, onHoldCall, onMergeCall, onCreateConference, callData }) => {
  const [isOnHold, setIsOnHold] = useState(false);
  const [transferTarget, setTransferTarget] = useState(TRANSFER_TARGETS?.[0]?.value);

  const handleHold = () => {
    const next = !isOnHold;
    setIsOnHold(next);
    onHoldCall(next);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="Headphones" size={18} className="text-primary" />
        <h4 className="font-semibold text-foreground">Gestión de Llamada</h4>
      </div>

      {callData && (
        <p className="text-xs text-muted-foreground mb-3">Llamada {callData?.id} · {callData?.callerNumber}</p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Button variant={isOnHold ? 'warning' : 'outline'} size="sm" iconName={isOnHold ? 'Play' : 'Pause'} onClick={handleHold}>
          {isOnHold ? 'Reanudar' : 'En espera'}
        </Button>
        <Button variant="outline" size="sm" iconName="Users" onClick={() => onCreateConference([callData?.callerNumber])}>
          Conferencia
        </Button>
      </div>

      <label className="text-xs text-muted-foreground">Transferir a</label>
      <div className="flex space-x-2 mt-1">
        <select
          className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={transferTarget}
          onChange={(e) => setTransferTarget(e?.target?.value)}
        >
          {TRANSFER_TARGETS?.map((t) => (
            <option key={t?.value} value={t?.value}>{t?.label}</option>
          ))}
        </select>
        <Button size="sm" iconName="PhoneForwarded" onClick={() => onTransferCall({ target: transferTarget, call: callData })}>
          Transferir
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        fullWidth
        iconName="Merge"
        className="mt-2"
        onClick={() => onMergeCall(callData)}
      >
        Unir con incidente existente
      </Button>
    </div>
  );
};

export default CallManagementPanel;
