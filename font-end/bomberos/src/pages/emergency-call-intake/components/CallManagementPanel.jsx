import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const CallManagementPanel = ({ onTransferCall, onHoldCall, onMergeCall, onCreateConference, callData }) => {
  const [isOnHold, setIsOnHold] = useState(false);
  const [showTransferOptions, setShowTransferOptions] = useState(false);

  const transferDestinations = [
    { id: 'supervisor', label: 'Supervisor', icon: '👔' },
    { id: 'medical', label: 'Servicio Médico', icon: '🏥' },
    { id: 'police', label: 'Policía', icon: '👮' },
    { id: 'dispatch', label: 'Despacho', icon: '📡' }
  ];

  const handleHoldToggle = () => {
    const newHoldState = !isOnHold;
    setIsOnHold(newHoldState);
    onHoldCall && onHoldCall(newHoldState);
  };

  const handleTransfer = (destination) => {
    onTransferCall && onTransferCall({ destination: destination.id, label: destination.label });
    setShowTransferOptions(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Gestión de Llamada</h3>

      <div className="space-y-3">
        {/* Hold/Resume */}
        <Button
          variant={isOnHold ? 'default' : 'outline'}
          onClick={handleHoldToggle}
          className="w-full"
        >
          {isOnHold ? '▶️ Reanudar Llamada' : '⏸️ Poner en Espera'}
        </Button>

        {/* Transfer */}
        <div>
          <Button
            variant="outline"
            onClick={() => setShowTransferOptions(!showTransferOptions)}
            className="w-full"
          >
            🔄 Transferir Llamada
          </Button>

          {showTransferOptions && (
            <div className="mt-2 p-2 bg-muted/50 rounded space-y-1">
              {transferDestinations.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => handleTransfer(dest)}
                  className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted transition-colors flex items-center space-x-2"
                >
                  <span>{dest.icon}</span>
                  <span className="text-foreground">{dest.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Merge Call */}
        <Button
          variant="outline"
          onClick={() => onMergeCall && onMergeCall(callData)}
          className="w-full"
        >
          🔗 Fusionar Llamada
        </Button>

        {/* Conference */}
        <Button
          variant="outline"
          onClick={() => onCreateConference && onCreateConference([callData])}
          className="w-full"
        >
          👥 Crear Conferencia
        </Button>

        {/* Mute/Unmute */}
        <Button
          variant="outline"
          className="w-full"
        >
          🔇 Silenciar Micrófono
        </Button>

        {/* Record */}
        <Button
          variant="outline"
          className="w-full"
        >
          ⏺️ Grabar Llamada
        </Button>
      </div>

      {/* Call Info */}
      {callData && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">INFO DE LLAMADA</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Número:</span>
              <span className="text-foreground">{callData.callerNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ubicación:</span>
              <span className="text-foreground">{callData.location || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <span className={`font-medium ${isOnHold ? 'text-yellow-600' : 'text-green-600'}`}>
                {isOnHold ? 'En Espera' : 'Activa'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallManagementPanel;
