import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { APP_NAME, ORGANIZATION, LOGO_SRC } from './brand';
import {
  INCIDENT_STATUS,
  RESOLUTION_RESULTS,
  getEmergencyType,
  getPriority,
} from './emergencyData';

// Reporte de tickets en PDF con resumen estadístico y detalle de cada emergencia

const RED = [220, 38, 38];

const formatDate = (iso) => (iso ? new Date(iso)?.toLocaleDateString('es-GT') : '');
const formatTime = (iso) => (iso ? new Date(iso)?.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '');
const minutesBetween = (from, to) => (from && to ? Math.round((new Date(to) - new Date(from)) / 60000) : null);

const countBy = (items, getKey) => items?.reduce((acc, item) => {
  const key = getKey(item);
  acc[key] = (acc?.[key] || 0) + 1;
  return acc;
}, {});

const percent = (n, total) => `${Math.round((n / (total || 1)) * 100)}%`;

// Carga el logo como imagen para insertarlo en el PDF
const loadLogo = () => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = LOGO_SRC;
});

export const downloadIncidentReport = async (incidents, units = [], { from, to } = {}) => {
  const unitName = (id) => units?.find((u) => u?.id === id)?.name || id;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado
  const logo = await loadLogo();
  if (logo) doc.addImage(logo, 'PNG', 14, 10, 22, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Reporte Estadístico de Emergencias', 40, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${APP_NAME} · ${ORGANIZATION}`, 40, 23);
  const period = `${from ? formatDate(`${from}T00:00:00`) : 'Inicio'} - ${to ? formatDate(`${to}T00:00:00`) : 'Hoy'}`;
  doc.text(`Periodo: ${period}`, 40, 29);
  doc.text(`Generado: ${formatDate(new Date())} ${formatTime(new Date())}`, pageWidth - 14, 17, { align: 'right' });
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
  doc.line(14, 35, pageWidth - 14, 35);

  // Resumen general
  const total = incidents?.length;
  const finalized = incidents?.filter((i) => i?.resolution);
  const satisfactory = finalized?.filter((i) => i?.resolution?.result === 'satisfactory')?.length;
  const durations = finalized?.map((i) => minutesBetween(i?.reportedAt, i?.resolution?.at))?.filter((m) => m !== null);
  const average = durations?.length ? Math.round(durations?.reduce((a, b) => a + b, 0) / durations?.length) : null;

  const tableStyle = {
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 1.8 },
    headStyles: { fillColor: RED, textColor: 255, fontStyle: 'bold' },
  };

  autoTable(doc, {
    ...tableStyle,
    startY: 40,
    margin: { left: 14 },
    tableWidth: 80,
    head: [['Resumen general', '']],
    body: [
      ['Total de emergencias', total],
      ['Finalizadas', finalized?.length],
      ['Atención satisfactoria', satisfactory],
      ['Atención no satisfactoria', finalized?.length - satisfactory],
      ['Porcentaje satisfactorio', finalized?.length ? percent(satisfactory, finalized?.length) : '-'],
      ['Duración promedio hasta cierre', average !== null ? `${average} min` : '-'],
    ],
  });

  // Tablas de distribución lado a lado
  const distributions = [
    ['Por tipo de emergencia', countBy(incidents, (i) => getEmergencyType(i?.type)?.label)],
    ['Por prioridad', countBy(incidents, (i) => getPriority(i?.priority)?.label)],
    ['Por estado', countBy(incidents, (i) => INCIDENT_STATUS?.[i?.status]?.label || i?.status)],
  ];
  let bottom = doc.lastAutoTable.finalY;
  distributions?.forEach(([title, counts], index) => {
    autoTable(doc, {
      ...tableStyle,
      startY: 40,
      margin: { left: 98 + index * 56 },
      tableWidth: 53,
      head: [[title, 'Cant.', '%']],
      body: Object.entries(counts)?.map(([label, n]) => [label, n, percent(n, total)]),
    });
    bottom = Math.max(bottom, doc.lastAutoTable.finalY);
  });

  // Detalle de tickets
  autoTable(doc, {
    ...tableStyle,
    startY: bottom + 8,
    styles: { fontSize: 7.5, cellPadding: 1.5, overflow: 'linebreak' },
    head: [['Ticket', 'Fecha y hora', 'Tipo', 'Prioridad', 'Estado', 'Dirección', 'Unidades', 'Dictamen', 'Observaciones', 'Duración']],
    body: incidents?.map((i) => [
      i?.id,
      `${formatDate(i?.reportedAt)} ${formatTime(i?.reportedAt)}`,
      getEmergencyType(i?.type)?.label,
      getPriority(i?.priority)?.label,
      INCIDENT_STATUS?.[i?.status]?.label || i?.status,
      i?.address,
      i?.units?.map(unitName)?.join(', ') || '-',
      RESOLUTION_RESULTS?.[i?.resolution?.result]?.label || '-',
      i?.resolution?.notes || '',
      minutesBetween(i?.reportedAt, i?.resolution?.at) !== null ? `${minutesBetween(i?.reportedAt, i?.resolution?.at)} min` : '-',
    ]),
    columnStyles: { 5: { cellWidth: 45 }, 8: { cellWidth: 45 } },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
      doc.text(ORGANIZATION, 14, pageHeight - 8);
      doc.setTextColor(0);
    },
  });

  doc.save(`reporte-emergencias-${new Date()?.toISOString()?.slice(0, 10)}.pdf`);
};
