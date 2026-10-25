import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { downloadPersonnelReport, printPersonnelReport } from '../../services/personnelReportPDF';

// ---------------------------------------------------------------------------
// Datos base
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'bomberos_programacion_personal_v1';

const PERSONNEL = [
  'Carlos Méndez', 'Ana López', 'Miguel Torres', 'Laura Ruiz', 'José García',
  'Pedro Martínez', 'Roberto Sánchez', 'María González', 'Luis Hernández',
  'Sofía Ramírez', 'Diego Castillo', 'Andrea Morales',
];

const STATIONS = ['Estación Central', 'Estación Norte', 'Estación Sur'];

const TIME_SLOTS = [
  { name: 'Mañana', time: '06:00 - 14:00', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { name: 'Tarde', time: '14:00 - 22:00', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { name: 'Noche', time: '22:00 - 06:00', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
];

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ---------------------------------------------------------------------------
// Utilidades de fecha (fechas locales en formato YYYY-MM-DD)
// ---------------------------------------------------------------------------
const toISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fromISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const startOfWeek = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - diff);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const shortDate = (d) => d.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit' });

const longDate = (iso) =>
  fromISO(iso).toLocaleDateString('es-GT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

// Turnos de ejemplo en la semana actual (solo la primera vez)
const buildSeedShifts = () => {
  const monday = startOfWeek(new Date());
  const day = (n) => toISO(addDays(monday, n));
  return [
    { id: 1, date: day(0), slot: 'Mañana', station: 'Estación Central', personnel: ['Carlos Méndez', 'Ana López', 'Miguel Torres'], notes: '' },
    { id: 2, date: day(0), slot: 'Tarde', station: 'Estación Central', personnel: ['Laura Ruiz', 'José García', 'Pedro Martínez'], notes: '' },
    { id: 3, date: day(0), slot: 'Noche', station: 'Estación Central', personnel: ['Roberto Sánchez', 'María González', 'Luis Hernández'], notes: '' },
    { id: 4, date: day(1), slot: 'Mañana', station: 'Estación Norte', personnel: ['Ana López', 'Miguel Torres', 'Pedro Martínez'], notes: '' },
    { id: 5, date: day(1), slot: 'Tarde', station: 'Estación Norte', personnel: ['José García', 'Carlos Méndez', 'María González'], notes: '' },
    { id: 6, date: day(2), slot: 'Noche', station: 'Estación Sur', personnel: [], notes: 'Pendiente de asignar' },
  ];
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.shifts)) return { shifts: parsed.shifts, changes: parsed.changes || [] };
    }
  } catch (e) { /* almacenamiento no disponible */ }
  return { shifts: buildSeedShifts(), changes: [] };
};

const emptyForm = (date = toISO(new Date()), slot = 'Mañana') => ({
  id: null, date, slot, station: STATIONS[0], personnel: [], notes: '',
});

// ---------------------------------------------------------------------------
// Ventana modal reutilizable
// ---------------------------------------------------------------------------
const Modal = ({ title, onClose, children, footer, wide = false }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
    <div
      className={`bg-card rounded-lg border border-border shadow-xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar">
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="px-6 py-4 overflow-y-auto">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-border flex justify-end gap-2 flex-wrap">{footer}</div>}
    </div>
  </div>
);

const fieldClass =
  'w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------
const PersonnelScheduling = () => {
  const initial = useMemo(loadState, []);
  const [shifts, setShifts] = useState(initial.shifts);
  const [changes, setChanges] = useState(initial.changes);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const [modal, setModal] = useState(null); // 'shift' | 'assign' | 'calendar' | 'report' | 'notify'
  const [form, setForm] = useState(emptyForm());
  const [assignShiftId, setAssignShiftId] = useState('');
  const [reportScope, setReportScope] = useState('week');
  const [calendarStation, setCalendarStation] = useState('Todas');
  const [toast, setToast] = useState('');

  // Guardar en el navegador cada vez que cambian los datos
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ shifts, changes }));
    } catch (e) { /* almacenamiento no disponible */ }
  }, [shifts, changes]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // --- Datos derivados ----------------------------------------------------
  const weekDays = useMemo(() => DAY_NAMES.map((name, i) => {
    const date = addDays(weekStart, i);
    return { name, date, iso: toISO(date) };
  }), [weekStart]);

  const weekISOs = weekDays.map((d) => d.iso);
  const weekShifts = shifts.filter((s) => weekISOs.includes(s.date));
  const todayISO = toISO(new Date());

  const weekLabel = `Semana del ${shortDate(weekDays[0].date)} al ${shortDate(weekDays[6].date)}/${weekDays[6].date.getFullYear()}`;

  const currentSlot = (() => {
    const h = new Date().getHours();
    if (h >= 6 && h < 14) return 'Mañana';
    if (h >= 14 && h < 22) return 'Tarde';
    return 'Noche';
  })();

  const stats = {
    totalPersonal: PERSONNEL.length,
    enTurno: shifts
      .filter((s) => s.date === todayISO && s.slot === currentSlot)
      .reduce((acc, s) => acc + s.personnel.length, 0),
    turnos: weekShifts.length,
    sinCubrir: weekShifts.filter((s) => s.personnel.length === 0).length,
  };

  const upcomingShifts = shifts
    .filter((s) => s.date >= todayISO)
    .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot))
    .slice(0, 4);

  const pendingChanges = changes.filter((c) => !c.notified);

  // --- Acciones -----------------------------------------------------------
  const logChange = (text) => {
    setChanges((prev) => [{ id: Date.now(), text, at: new Date().toISOString(), notified: false }, ...prev].slice(0, 100));
  };

  const describe = (s) => `${s.slot} ${longDate(s.date)} — ${s.station}`;

  const openNewShift = (date, slot) => {
    setForm(emptyForm(date || weekDays[0].iso, slot || 'Mañana'));
    setModal('shift');
  };

  const openEditShift = (shift) => {
    setForm({ ...shift, personnel: [...shift.personnel] });
    setModal('shift');
  };

  const togglePerson = (name) => {
    setForm((f) => ({
      ...f,
      personnel: f.personnel.includes(name) ? f.personnel.filter((p) => p !== name) : [...f.personnel, name],
    }));
  };

  const saveShift = () => {
    if (!form.date) {
      setToast('Selecciona una fecha');
      return;
    }
    const duplicate = shifts.find(
      (s) => s.id !== form.id && s.date === form.date && s.slot === form.slot && s.station === form.station,
    );
    if (duplicate) {
      setToast('Ya existe ese turno para esa estación. Edítalo en lugar de crear otro.');
      return;
    }
    if (form.id) {
      setShifts((prev) => prev.map((s) => (s.id === form.id ? { ...form } : s)));
      logChange(`Turno modificado: ${describe(form)} (${form.personnel.length} personas)`);
      setToast('Turno actualizado');
    } else {
      const created = { ...form, id: Date.now() };
      setShifts((prev) => [...prev, created]);
      logChange(`Turno creado: ${describe(created)} (${created.personnel.length} personas)`);
      setToast('Turno creado');
    }
    setWeekStart(startOfWeek(fromISO(form.date)));
    setModal(null);
  };

  const deleteShift = (shift) => {
    if (!window.confirm(`¿Eliminar el turno ${describe(shift)}?`)) return;
    setShifts((prev) => prev.filter((s) => s.id !== shift.id));
    logChange(`Turno eliminado: ${describe(shift)}`);
    setToast('Turno eliminado');
    if (modal === 'shift') setModal(null);
  };

  const openAssign = () => {
    const first = weekShifts[0] || shifts[0];
    if (!first) {
      setToast('Primero crea un turno');
      openNewShift();
      return;
    }
    setAssignShiftId(String(first.id));
    setForm({ ...first, personnel: [...first.personnel] });
    setModal('assign');
  };

  const changeAssignShift = (id) => {
    setAssignShiftId(id);
    const s = shifts.find((x) => String(x.id) === id);
    if (s) setForm({ ...s, personnel: [...s.personnel] });
  };

  const saveAssign = () => {
    setShifts((prev) => prev.map((s) => (s.id === form.id ? { ...s, personnel: form.personnel } : s)));
    logChange(`Personal asignado: ${describe(form)} → ${form.personnel.join(', ') || 'sin personal'}`);
    setToast('Personal asignado');
    setModal(null);
  };

  const reportParams = () => {
    const list = reportScope === 'week' ? weekShifts : shifts;
    const label = reportScope === 'week' ? weekLabel : 'Todos los turnos registrados';
    return {
      shifts: list,
      periodLabel: label,
      stats: {
        ...stats,
        turnos: list.length,
        sinCubrir: list.filter((s) => s.personnel.length === 0).length,
      },
    };
  };

  const handleDownload = () => {
    try {
      downloadPersonnelReport(reportParams());
      setToast('Reporte descargado');
    } catch (e) {
      console.error(e);
      setToast('No se pudo generar el PDF');
    }
  };

  const handlePrint = () => {
    try {
      printPersonnelReport(reportParams());
    } catch (e) {
      console.error(e);
      setToast('No se pudo generar el PDF');
    }
  };

  const notificationText = () =>
    [
      `AVISO DE CAMBIOS EN PROGRAMACIÓN DE PERSONAL`,
      `Bomberos Voluntarios — ${new Date().toLocaleString('es-GT')}`,
      '',
      ...pendingChanges.map((c) => `• ${c.text}`),
    ].join('\n');

  const copyNotification = async () => {
    try {
      await navigator.clipboard.writeText(notificationText());
      setToast('Aviso copiado. Pégalo en WhatsApp o correo.');
    } catch (e) {
      setToast('No se pudo copiar automáticamente');
    }
  };

  const markNotified = () => {
    setChanges((prev) => prev.map((c) => ({ ...c, notified: true })));
    setToast('Cambios marcados como notificados');
    setModal(null);
  };

  const resetData = () => {
    if (!window.confirm('¿Restaurar los turnos de ejemplo? Se perderán los cambios guardados en este navegador.')) return;
    setShifts(buildSeedShifts());
    setChanges([]);
    setWeekStart(startOfWeek(new Date()));
    setToast('Datos restaurados');
  };

  // --- Render -------------------------------------------------------------
  const calendarList = shifts
    .filter((s) => calendarStation === 'Todas' || s.station === calendarStation)
    .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));

  const renderChecklist = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {PERSONNEL.map((name) => (
        <label key={name} className="flex items-center gap-2 text-sm p-2 rounded border border-border hover:bg-muted cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={form.personnel.includes(name)}
            onChange={() => togglePerson(name)}
          />
          {name}
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-8 px-4 lg:px-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/emergency-dashboard' },
            { label: 'Programación de Personal', href: '/personnel-scheduling' },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Programación de Personal</h1>
            <p className="text-muted-foreground">Gestión de turnos y asignación de personal</p>
          </div>
          <Button variant="default" iconName="Plus" onClick={() => openNewShift()}>
            Crear Turno
          </Button>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Personal Registrado', value: stats.totalPersonal, icon: 'Users', bg: 'bg-primary/10', fg: 'text-primary' },
            { label: 'En Turno Ahora', value: stats.enTurno, icon: 'CheckCircle', bg: 'bg-success/10', fg: 'text-success' },
            { label: 'Turnos esta Semana', value: stats.turnos, icon: 'Calendar', bg: 'bg-warning/10', fg: 'text-warning' },
            { label: 'Turnos sin Cubrir', value: stats.sinCubrir, icon: 'AlertCircle', bg: 'bg-destructive/10', fg: 'text-destructive' },
          ].map((c) => (
            <div key={c.label} className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center`}>
                  <Icon name={c.icon} size={20} className={c.fg} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold text-foreground">{c.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendario semanal */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <h2 className="text-xl font-semibold text-foreground">Calendario Semanal</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" iconName="ChevronLeft" onClick={() => setWeekStart(addDays(weekStart, -7))}>
                    Anterior
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right" onClick={() => setWeekStart(addDays(weekStart, 7))}>
                    Siguiente
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {weekLabel} · Haz clic en una celda para crear o modificar un turno.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 bg-muted/50 text-xs font-medium text-muted-foreground text-left">Turno</th>
                      {weekDays.map((d) => (
                        <th
                          key={d.iso}
                          className={`border border-border p-2 text-xs font-medium text-center ${
                            d.iso === todayISO ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          <div>{d.name}</div>
                          <div className="font-normal">{shortDate(d.date)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot) => (
                      <tr key={slot.name}>
                        <td className="border border-border p-2 bg-muted/20">
                          <div className="text-xs font-medium text-foreground">{slot.name}</div>
                          <div className="text-xs text-muted-foreground">{slot.time}</div>
                        </td>
                        {weekDays.map((d) => {
                          const cellShifts = shifts.filter((s) => s.date === d.iso && s.slot === slot.name);
                          return (
                            <td
                              key={`${d.iso}-${slot.name}`}
                              className="border border-border p-1 align-top hover:bg-muted/50 cursor-pointer min-w-[110px]"
                              onClick={() => (cellShifts.length === 0 ? openNewShift(d.iso, slot.name) : null)}
                              title={cellShifts.length === 0 ? 'Crear turno' : ''}
                            >
                              {cellShifts.length > 0 ? (
                                <div className="space-y-1">
                                  {cellShifts.map((shift) => (
                                    <button
                                      key={shift.id}
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); openEditShift(shift); }}
                                      className={`w-full text-left p-2 rounded border ${
                                        shift.personnel.length === 0 ? 'bg-red-50 text-red-700 border-red-300' : slot.color
                                      } hover:opacity-80`}
                                      title="Modificar turno"
                                    >
                                      <div className="text-xs font-medium mb-1">{shift.station}</div>
                                      <div className="text-xs">
                                        {shift.personnel.length === 0 ? 'Sin personal' : `${shift.personnel.length} personas`}
                                      </div>
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); openNewShift(d.iso, slot.name); }}
                                    className="w-full text-xs text-muted-foreground hover:text-primary"
                                  >
                                    + otra estación
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground text-center py-3">+</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Próximos Turnos</h2>
              <div className="space-y-3">
                {upcomingShifts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay turnos próximos.</p>
                )}
                {upcomingShifts.map((shift) => (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => openEditShift(shift)}
                    className="w-full text-left p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="Clock" size={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">{shift.slot}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{fromISO(shift.date).toLocaleDateString('es-GT')}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{shift.station}</div>
                    <div className={`flex items-center space-x-1 text-xs ${shift.personnel.length ? 'text-primary' : 'text-destructive'}`}>
                      <Icon name="Users" size={12} />
                      <span>
                        {shift.personnel.length ? `${shift.personnel.length} personas asignadas` : 'Sin personal asignado'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                <Button variant="outline" fullWidth iconName="UserPlus" size="sm" onClick={openAssign}>
                  Asignar Personal
                </Button>
                <Button variant="outline" fullWidth iconName="Calendar" size="sm" onClick={() => setModal('calendar')}>
                  Ver Calendario Completo
                </Button>
                <Button variant="outline" fullWidth iconName="FileText" size="sm" onClick={() => setModal('report')}>
                  Generar Reporte
                </Button>
                <Button variant="outline" fullWidth iconName="Bell" size="sm" onClick={() => setModal('notify')}>
                  Notificar Cambios{pendingChanges.length > 0 ? ` (${pendingChanges.length})` : ''}
                </Button>
                <button type="button" onClick={resetData} className="w-full text-xs text-muted-foreground hover:text-destructive pt-2">
                  Restaurar datos de ejemplo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---------------- Modal: crear / modificar turno ---------------- */}
      {modal === 'shift' && (
        <Modal
          title={form.id ? 'Modificar Turno' : 'Crear Turno'}
          onClose={() => setModal(null)}
          footer={
            <>
              {form.id && (
                <Button variant="destructive" iconName="Trash2" onClick={() => deleteShift(form)}>
                  Eliminar
                </Button>
              )}
              <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
              <Button variant="default" iconName="Save" onClick={saveShift}>Guardar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="text-sm">
                <span className="block mb-1 font-medium">Fecha</span>
                <input type="date" className={fieldClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="block mb-1 font-medium">Turno</span>
                <select className={fieldClass} value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
                  {TIME_SLOTS.map((s) => <option key={s.name} value={s.name}>{s.name} ({s.time})</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="block mb-1 font-medium">Estación</span>
                <select className={fieldClass} value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })}>
                  {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div>
              <span className="block mb-2 text-sm font-medium">Personal asignado ({form.personnel.length})</span>
              {renderChecklist()}
            </div>
            <label className="text-sm block">
              <span className="block mb-1 font-medium">Observaciones</span>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>
        </Modal>
      )}

      {/* ---------------- Modal: asignar personal ---------------- */}
      {modal === 'assign' && (
        <Modal
          title="Asignar Personal"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
              <Button variant="default" iconName="UserCheck" onClick={saveAssign}>Guardar asignación</Button>
            </>
          }
        >
          <div className="space-y-4">
            <label className="text-sm block">
              <span className="block mb-1 font-medium">Turno</span>
              <select className={fieldClass} value={assignShiftId} onChange={(e) => changeAssignShift(e.target.value)}>
                {[...shifts]
                  .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot))
                  .map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {fromISO(s.date).toLocaleDateString('es-GT')} · {s.slot} · {s.station}
                    </option>
                  ))}
              </select>
            </label>
            <div>
              <span className="block mb-2 text-sm font-medium">Selecciona el personal ({form.personnel.length})</span>
              {renderChecklist()}
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- Modal: calendario completo ---------------- */}
      {modal === 'calendar' && (
        <Modal title="Calendario Completo de Turnos" onClose={() => setModal(null)} wide
          footer={<Button variant="outline" onClick={() => setModal(null)}>Cerrar</Button>}
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <label className="text-sm flex items-center gap-2">
              Estación:
              <select className={`${fieldClass} w-48`} value={calendarStation} onChange={(e) => setCalendarStation(e.target.value)}>
                <option>Todas</option>
                {STATIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <span className="text-sm text-muted-foreground">{calendarList.length} turnos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="p-2 border border-border">Fecha</th>
                  <th className="p-2 border border-border">Turno</th>
                  <th className="p-2 border border-border">Estación</th>
                  <th className="p-2 border border-border">Personal</th>
                  <th className="p-2 border border-border text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {calendarList.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="p-2 border border-border whitespace-nowrap">{fromISO(s.date).toLocaleDateString('es-GT')}</td>
                    <td className="p-2 border border-border">{s.slot}</td>
                    <td className="p-2 border border-border">{s.station}</td>
                    <td className={`p-2 border border-border ${s.personnel.length ? '' : 'text-destructive font-medium'}`}>
                      {s.personnel.length ? s.personnel.join(', ') : 'Sin asignar'}
                    </td>
                    <td className="p-2 border border-border">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="xs" iconName="Pencil" onClick={() => openEditShift(s)}>Editar</Button>
                        <Button variant="ghost" size="xs" iconName="Trash2" onClick={() => deleteShift(s)}>Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {calendarList.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No hay turnos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* ---------------- Modal: generar reporte ---------------- */}
      {modal === 'report' && (
        <Modal
          title="Generar Reporte de Personal"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setModal(null)}>Cerrar</Button>
              <Button variant="outline" iconName="Printer" onClick={handlePrint}>Imprimir</Button>
              <Button variant="default" iconName="Download" onClick={handleDownload}>Descargar PDF</Button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <p className="font-medium">¿Qué turnos incluir?</p>
            <label className="flex items-center gap-2">
              <input type="radio" checked={reportScope === 'week'} onChange={() => setReportScope('week')} />
              Semana mostrada ({weekLabel}) — {weekShifts.length} turnos
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={reportScope === 'all'} onChange={() => setReportScope('all')} />
              Todos los turnos — {shifts.length} turnos
            </label>
            <p className="text-muted-foreground pt-2">
              El reporte incluye resumen, detalle de cada turno con su personal, turnos sin cubrir resaltados y espacio para firmas.
            </p>
          </div>
        </Modal>
      )}

      {/* ---------------- Modal: notificar cambios ---------------- */}
      {modal === 'notify' && (
        <Modal
          title="Notificar Cambios"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setModal(null)}>Cerrar</Button>
              <Button variant="outline" iconName="Copy" disabled={!pendingChanges.length} onClick={copyNotification}>
                Copiar aviso
              </Button>
              <Button variant="default" iconName="Check" disabled={!pendingChanges.length} onClick={markNotified}>
                Marcar como notificado
              </Button>
            </>
          }
        >
          {pendingChanges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay cambios pendientes de notificar.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                Cambios realizados desde el último aviso. Copia el texto y envíalo al personal.
              </p>
              {pendingChanges.map((c) => (
                <div key={c.id} className="text-sm p-2 rounded border border-border bg-muted/40">
                  <div>{c.text}</div>
                  <div className="text-xs text-muted-foreground">{new Date(c.at).toLocaleString('es-GT')}</div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Mensaje flotante */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[110] bg-foreground text-background text-sm px-4 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default PersonnelScheduling;
