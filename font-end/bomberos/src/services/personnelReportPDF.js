import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const SLOT_HOURS = {
  'Mañana': '06:00 - 14:00',
  'Tarde': '14:00 - 22:00',
  'Noche': '22:00 - 06:00',
};

const formatDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-GT', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

/**
 * Construye el PDF del reporte de programación de personal.
 * @param {Object} params
 * @param {Array} params.shifts   Turnos a incluir
 * @param {string} params.periodLabel  Texto del periodo (ej. "Semana del 19/10 al 25/10")
 * @param {Object} params.stats   { totalPersonal, enTurno, turnos, sinCubrir }
 */
const buildPersonnelReport = ({ shifts, periodLabel, stats }) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFontSize(18);
  doc.setTextColor(220, 38, 38);
  doc.text('REPORTE DE PROGRAMACIÓN DE PERSONAL', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Bomberos Voluntarios — Antigua Guatemala, Sacatepéquez', pageWidth / 2, 26, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(14, 30, pageWidth - 14, 30);

  doc.setFontSize(10);
  doc.text(`Periodo: ${periodLabel}`, 14, 38);
  doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, pageWidth - 14, 38, { align: 'right' });

  // Resumen
  autoTable(doc, {
    startY: 43,
    head: [['Personal registrado', 'Personal con turno', 'Turnos programados', 'Turnos sin cubrir']],
    body: [[stats.totalPersonal, stats.enTurno, stats.turnos, stats.sinCubrir]],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
    styles: { halign: 'center', fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  // Detalle de turnos
  const rows = [...shifts]
    .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot))
    .map((s) => [
      formatDate(s.date),
      s.slot,
      SLOT_HOURS[s.slot] || '',
      s.station,
      s.personnel.length ? s.personnel.join(', ') : 'SIN ASIGNAR',
      s.personnel.length,
      s.notes || '',
    ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Fecha', 'Turno', 'Horario', 'Estación', 'Personal asignado', 'Cant.', 'Observaciones']],
    body: rows.length ? rows : [['—', '—', '—', '—', 'No hay turnos en este periodo', 0, '']],
    theme: 'striped',
    headStyles: { fillColor: [55, 65, 81] },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 20 },
      2: { cellWidth: 28 },
      3: { cellWidth: 35 },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 45 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4 && data.cell.raw === 'SIN ASIGNAR') {
        data.cell.styles.textColor = [220, 38, 38];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Firmas
  let y = doc.lastAutoTable.finalY + 25;
  if (y > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    y = 40;
  }
  doc.line(30, y, 110, y);
  doc.line(pageWidth - 110, y, pageWidth - 30, y);
  doc.setFontSize(9);
  doc.text('Elaborado por', 70, y + 5, { align: 'center' });
  doc.text('Vo. Bo. Jefe de Estación', pageWidth - 70, y + 5, { align: 'center' });

  // Pie de página
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Página ${i} de ${pages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
  }

  return doc;
};

export const downloadPersonnelReport = (params) => {
  const doc = buildPersonnelReport(params);
  doc.save(`reporte_personal_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const printPersonnelReport = (params) => {
  const doc = buildPersonnelReport(params);
  doc.autoPrint();
  const url = doc.output('bloburl');
  const win = window.open(url, '_blank');
  // Si el navegador bloquea la ventana emergente, se descarga el PDF
  if (!win) doc.save(`reporte_personal_${new Date().toISOString().slice(0, 10)}.pdf`);
};
