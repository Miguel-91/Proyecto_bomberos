import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getEmergencyType, getPriority } from '../../../utils/emergencyData';

const INITIAL_CALLS = [
  { id: 'C-101', callerNumber: '5521-4410', location: 'Calle Ancha de los Herreros', waitTime: 45, aiPrediction: { type: 'fire', urgencyLevel: 'critical', confidence: 91 } },
  { id: 'C-102', callerNumber: '4478-2201', location: '3a Calle Poniente', waitTime: 30, aiPrediction: { type: 'medical', urgencyLevel: 'high', confidence: 84 } },
  { id: 'C-103', callerNumber: '3310-9087', location: 'San Pedro Las Huertas', waitTime: 12, aiPrediction: { type: 'traffic', urgencyLevel: 'medium', confidence: 77 } },
];

const IncomingCallsQueue = ({ onAcceptCall, onRejectCall }) => {
  const [calls, setCalls] = useState(INITIAL_CALLS);

  const removeCall = (id) => setCalls((prev) => prev?.filter((c) => c?.id !== id));

  const handleAccept = (call) => {
    removeCall(call?.id);
    onAcceptCall(call);
  };

  const handleReject = (call) => {
    removeCall(call?.id);
    onRejectCall(call);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="PhoneIncoming" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Llamadas Entrantes</h3>
        </div>
        <span className="text-sm text-muted-foreground">{calls?.length} en espera</span>
      </div>

      {calls?.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No hay llamadas en espera.</p>
      ) : (
        <div className="space-y-3">
          {calls?.map((call) => {
            const type = getEmergencyType(call?.aiPrediction?.type);
            const priority = getPriority(call?.aiPrediction?.urgencyLevel);
            return (
              <div key={call?.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-md border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Icon name={type?.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{call?.callerNumber}</div>
                    <div className="text-sm text-muted-foreground">{call?.location}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">IA: {type?.label} ({call?.aiPrediction?.confidence}%)</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority?.className}`}>{priority?.label}</span>
                  <span className="flex items-center space-x-1 text-muted-foreground">
                    <Icon name="Clock" size={14} />
                    <span>{call?.waitTime}s</span>
                  </span>
                  <Button size="sm" variant="success" iconName="Phone" onClick={() => handleAccept(call)}>
                    Atender
                  </Button>
                  <Button size="sm" variant="outline" iconName="PhoneOff" onClick={() => handleReject(call)}>
                    Rechazar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IncomingCallsQueue;
