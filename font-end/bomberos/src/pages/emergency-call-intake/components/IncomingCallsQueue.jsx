import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';

const IncomingCallsQueue = ({ onAcceptCall, onRejectCall }) => {
  const [calls, setCalls] = useState([
    {
      id: 1,
      callerNumber: '+54 9 11 1234-5678',
      location: 'Av. Rivadavia 1234',
      waitTime: '00:45',
      priority: 'high',
      aiPrediction: {
        type: 'Incendio',
        confidence: 92,
        urgencyLevel: 'Alta'
      }
    },
    {
      id: 2,
      callerNumber: '+54 9 11 8765-4321',
      location: 'Calle San Martín 567',
      waitTime: '00:23',
      priority: 'medium',
      aiPrediction: {
        type: 'Rescate',
        confidence: 78,
        urgencyLevel: 'Media'
      }
    },
    {
      id: 3,
      callerNumber: '+54 9 11 5555-6666',
      location: 'Av. Libertador 8900',
      waitTime: '00:12',
      priority: 'critical',
      aiPrediction: {
        type: 'Accidente',
        confidence: 95,
        urgencyLevel: 'Crítica'
      }
    }
  ]);

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
      high: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
      medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      low: 'border-green-500 bg-green-50 dark:bg-green-900/20'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return icons[priority] || '🟡';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Cola de Llamadas Entrantes</h3>
        <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-medium">
          {calls.length} en espera
        </span>
      </div>

      <div className="space-y-3">
        {calls.map((call) => (
          <div
            key={call.id}
            className={`border-l-4 rounded-lg p-4 ${getPriorityColor(call.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getPriorityIcon(call.priority)}</span>
                <div>
                  <p className="font-medium text-foreground">{call.callerNumber}</p>
                  <p className="text-xs text-muted-foreground">📍 {call.location}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">⏱️ {call.waitTime}</span>
            </div>

            {call.aiPrediction && (
              <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">IA Predicción:</span>
                  <span className="font-medium text-foreground">{call.aiPrediction.type}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">Urgencia:</span>
                  <span className="font-medium text-foreground">{call.aiPrediction.urgencyLevel}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">Confianza:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${call.aiPrediction.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium">{call.aiPrediction.confidence}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAcceptCall(call)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                ✓ Atender
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onRejectCall(call);
                  setCalls(calls.filter(c => c.id !== call.id));
                }}
                className="flex-1"
              >
                ✗ Rechazar
              </Button>
            </div>
          </div>
        ))}

        {calls.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No hay llamadas en espera</p>
            <p className="text-xs mt-1">Las nuevas llamadas aparecerán aquí automáticamente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingCallsQueue;
