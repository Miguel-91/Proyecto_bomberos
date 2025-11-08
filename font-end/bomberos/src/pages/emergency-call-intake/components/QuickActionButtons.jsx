import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { generateEmergencyReportPDF } from '../../../services/pdfGenerator';

const QuickActionButtons = ({ callData, onDispatchResources, onTransferCall, onCreateIncident }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const filename = generateEmergencyReportPDF(callData);
      alert(`✅ Reporte PDF generado exitosamente: ${filename}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Error al generar el reporte PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h3>

      <div className="space-y-2">
        {/* Dispatch Resources */}
        <Button
          variant="default"
          onClick={() => onDispatchResources && onDispatchResources('fire-truck')}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          🚒 Despachar Unidades
        </Button>

        {/* Generate PDF Report */}
        <Button
          variant="default"
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGeneratingPDF ? '⏳ Generando...' : '📄 Generar Reporte PDF'}
        </Button>

        {/* Create Incident */}
        <Button
          variant="outline"
          onClick={() => onCreateIncident && onCreateIncident()}
          className="w-full"
        >
          📋 Crear Incidente
        </Button>

        {/* Transfer Call */}
        <Button
          variant="outline"
          onClick={() => onTransferCall && onTransferCall({ destination: 'supervisor' })}
          className="w-full"
        >
          📞 Transferir Llamada
        </Button>

        {/* Quick Notes */}
        <Button
          variant="outline"
          className="w-full"
        >
          📝 Añadir Nota Rápida
        </Button>

        {/* Emergency Protocols */}
        <Button
          variant="outline"
          className="w-full"
        >
          📖 Ver Protocolos
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Estado Actual</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unidades disponibles:</span>
            <span className="font-medium text-green-600">5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unidades en ruta:</span>
            <span className="font-medium text-yellow-600">2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tiempo promedio:</span>
            <span className="font-medium text-foreground">8 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionButtons;
