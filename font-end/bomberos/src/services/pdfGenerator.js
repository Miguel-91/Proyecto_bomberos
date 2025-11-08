import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateEmergencyReportPDF = (callData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38); // Red color
  doc.text('REPORTE DE EMERGENCIA', 105, 20, { align: 'center' });

  // Logo/Title section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Bomberos Voluntarios', 105, 30, { align: 'center' });

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Report number and date
  doc.setFontSize(10);
  const reportDate = new Date().toLocaleString('es-ES');
  doc.text(`Fecha del Reporte: ${reportDate}`, 20, 45);
  doc.text(`Reporte #: ${callData.id || 'N/A'}`, 150, 45);

  // Caller Information Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMACIÓN DEL LLAMANTE', 20, 60);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const callerInfo = [
    ['Nombre:', callData.callerName || 'N/A'],
    ['Teléfono:', callData.callerPhone || 'N/A'],
    ['Dirección:', callData.callerAddress || 'N/A']
  ];

  doc.autoTable({
    startY: 65,
    head: [],
    body: callerInfo,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 130 }
    },
    margin: { left: 20 }
  });

  // Emergency Classification
  let currentY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('CLASIFICACIÓN DE LA EMERGENCIA', 20, currentY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const emergencyInfo = [
    ['Tipo de Emergencia:', callData.emergencyType || 'N/A'],
    ['Prioridad:', callData.priority || 'N/A'],
    ['Estado:', callData.status || 'N/A'],
    ['Nivel de Riesgo:', callData.riskLevel || 'N/A']
  ];

  doc.autoTable({
    startY: currentY + 5,
    head: [],
    body: emergencyInfo,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 130 }
    },
    margin: { left: 20 }
  });

  // Description Section
  currentY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('DESCRIPCIÓN DE LA EMERGENCIA', 20, currentY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const description = callData.description || 'Sin descripción disponible';
  const splitDescription = doc.splitTextToSize(description, 170);
  doc.text(splitDescription, 20, currentY + 7);

  currentY += 7 + (splitDescription.length * 5);

  // Transcript Section (if available)
  if (callData.transcript && callData.transcript.length > 0) {
    currentY += 5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TRANSCRIPCIÓN DE LA LLAMADA', 20, currentY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    const transcriptData = callData.transcript.map(entry => [
      entry.timestamp || '',
      entry.speaker || '',
      entry.message || ''
    ]);

    doc.autoTable({
      startY: currentY + 5,
      head: [['Hora', 'Emisor', 'Mensaje']],
      body: transcriptData,
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 115 }
      }
    });

    currentY = doc.lastAutoTable.finalY;
  }

  // Location Information (if available)
  if (callData.locationLat && callData.locationLng) {
    currentY += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('UBICACIÓN', 20, currentY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    doc.text(`Coordenadas: ${callData.locationLat}, ${callData.locationLng}`, 20, currentY + 7);
    currentY += 12;
  }

  // Resources Dispatched (if available)
  if (callData.resourcesDispatched) {
    currentY += 5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('RECURSOS DESPACHADOS', 20, currentY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    doc.text(callData.resourcesDispatched, 20, currentY + 7);
    currentY += 12;
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
    doc.text(
      'Sistema de Gestión de Emergencias - Bomberos Voluntarios',
      105,
      285,
      { align: 'center' }
    );
  }

  // Generate filename
  const filename = `Reporte_Emergencia_${callData.id || Date.now()}.pdf`;

  // Save the PDF
  doc.save(filename);

  return filename;
};

export default generateEmergencyReportPDF;
