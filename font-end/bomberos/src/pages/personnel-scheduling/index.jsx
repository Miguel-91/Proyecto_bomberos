import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { getCurrentUser, hasPermission } from '../../utils/auth';
import { usePersonnel, useShifts, useRotation, useEvents } from '../../utils/dataStore';
import {
  PERSONNEL_STATUS,
  WEEK_DAYS,
  EVENT_CATEGORIES,
  EVENT_PRESETS,
  suggestedStaff,
} from '../../utils/emergencyData';

const RANKS = ['Bombero Voluntario', 'Paramédico', 'Piloto', 'Sargento', 'Despachador', 'Jefe de Compañía'];
const EMPTY_MEMBER = { name: '', rank: RANKS[0], specialty: '', phone: '', shift: 'A' };
const EMPTY_SHIFT = { name: '', start: '07:00', end: '19:00', notes: '' };
const EMPTY_EVENT = { name: '', category: 'religious', date: '', start: '08:00', end: '18:00', location: '', attendance: 1000, assigned: [], notes: '' };

const newId = (prefix) => `${prefix}-${Date.now()?.toString(36)?.toUpperCase()}`;

const sectionClass = 'bg-card rounded-lg border border-border p-6 mb-6';
const selectClass = 'h-9 rounded-md border border-input bg-background px-2 text-sm';

const PersonnelScheduling = () => {
  const user = getCurrentUser();
  const canManagePersonnel = hasPermission(user, 'personnel.manage');
  const canManageShifts = hasPermission(user, 'shifts.manage');
  const canUpdateOwnStatus = hasPermission(user, 'personnel.updateOwnStatus');

  const [personnel, setPersonnel] = usePersonnel();
  const [shifts, setShifts] = useShifts();
  const [rotation, setRotation] = useRotation();
  const [events, setEvents] = useEvents();

  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [memberForm, setMemberForm] = useState(null);
  const [shiftForm, setShiftForm] = useState(null); // { ...shift, id? }
  const [eventForm, setEventForm] = useState(null); // { ...event, id? }

  const shiftName = (id) => shifts?.find((s) => s?.id === id)?.name || 'Sin turno';
  const memberName = (id) => personnel?.find((p) => p?.id === id)?.name || id;

  // ---------- Personal ----------
  const filtered = personnel?.filter((p) => {
    const matchesSearch = `${p?.name} ${p?.rank} ${p?.specialty}`?.toLowerCase()?.includes(search?.toLowerCase());
    const matchesShift = shiftFilter === 'all' || p?.shift === shiftFilter;
    return matchesSearch && matchesShift;
  });

  const canEditStatus = (member) => canManagePersonnel || (canUpdateOwnStatus && member?.id === user?.personnelId);

  const updateMember = (id, changes) => {
    setPersonnel((prev) => prev?.map((p) => (p?.id === id ? { ...p, ...changes } : p)));
  };

  const saveMember = (e) => {
    e?.preventDefault();
    if (!memberForm?.name?.trim()) return;
    setPersonnel((prev) => [...prev, { ...memberForm, id: newId('P'), name: memberForm?.name?.trim(), status: 'off-duty' }]);
    setMemberForm(null);
  };

  const removeMember = (member) => {
    if (!window.confirm(`¿Quitar a ${member?.name} del personal?`)) return;
    setPersonnel((prev) => prev?.filter((p) => p?.id !== member?.id));
    setEvents((prev) => prev?.map((ev) => ({ ...ev, assigned: ev?.assigned?.filter((id) => id !== member?.id) })));
  };

  // ---------- Turnos ----------
  const saveShift = (e) => {
    e?.preventDefault();
    if (!shiftForm?.name?.trim()) return;
    if (shiftForm?.id) {
      setShifts((prev) => prev?.map((s) => (s?.id === shiftForm?.id ? shiftForm : s)));
    } else {
      setShifts((prev) => [...prev, { ...shiftForm, id: newId('T') }]);
    }
    setShiftForm(null);
  };

  const removeShift = (shift) => {
    const members = personnel?.filter((p) => p?.shift === shift?.id)?.length;
    const message = members
      ? `El ${shift?.name} tiene ${members} persona(s) asignadas; quedarán sin turno. ¿Eliminarlo?`
      : `¿Eliminar el ${shift?.name}?`;
    if (!window.confirm(message)) return;
    setShifts((prev) => prev?.filter((s) => s?.id !== shift?.id));
    setPersonnel((prev) => prev?.map((p) => (p?.shift === shift?.id ? { ...p, shift: '' } : p)));
    setRotation((prev) => prev?.map((id) => (id === shift?.id ? '' : id)));
  };

  // ---------- Eventos especiales ----------
  const saveEvent = (e) => {
    e?.preventDefault();
    if (!eventForm?.name?.trim() || !eventForm?.date) return;
    const event = { ...eventForm, attendance: Number(eventForm?.attendance) || 0 };
    if (event?.id) {
      setEvents((prev) => prev?.map((ev) => (ev?.id === event?.id ? event : ev)));
    } else {
      setEvents((prev) => [...prev, { ...event, id: newId('EV') }]);
    }
    setEventForm(null);
  };

  const removeEvent = (event) => {
    if (!window.confirm(`¿Eliminar la actividad "${event?.name}"?`)) return;
    setEvents((prev) => prev?.filter((ev) => ev?.id !== event?.id));
  };

  const toggleEventMember = (memberId) => {
    const assigned = eventForm?.assigned || [];
    setEventForm({
      ...eventForm,
      assigned: assigned?.includes(memberId) ? assigned?.filter((id) => id !== memberId) : [...assigned, memberId],
    });
  };

  const sortedEvents = [...(events || [])]?.sort((a, b) => `${a?.date}${a?.start}`?.localeCompare(`${b?.date}${b?.start}`));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Personal y Turnos</h1>
            <p className="text-muted-foreground">
              Gestión del personal voluntario, turnos y refuerzos para actividades religiosas y patronales
            </p>
          </div>

          {/* ---------- Turnos ---------- */}
          <section className={sectionClass}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground">Turnos</h2>
              {canManageShifts && !shiftForm && (
                <Button size="sm" iconName="Plus" onClick={() => setShiftForm(EMPTY_SHIFT)}>Crear turno</Button>
              )}
            </div>

            {shiftForm && (
              <form onSubmit={saveShift} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end p-4 mb-4 rounded-md border border-border">
                <Input label="Nombre" value={shiftForm?.name} onChange={(e) => setShiftForm({ ...shiftForm, name: e?.target?.value })} placeholder="Ej. Turno Feria" required />
                <Input label="Inicio" type="time" value={shiftForm?.start} onChange={(e) => setShiftForm({ ...shiftForm, start: e?.target?.value })} />
                <Input label="Fin" type="time" value={shiftForm?.end} onChange={(e) => setShiftForm({ ...shiftForm, end: e?.target?.value })} />
                <Input label="Notas" value={shiftForm?.notes} onChange={(e) => setShiftForm({ ...shiftForm, notes: e?.target?.value })} />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" iconName="Save">{shiftForm?.id ? 'Guardar' : 'Crear'}</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShiftForm(null)}>Cancelar</Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shifts?.map((shift) => {
                const members = personnel?.filter((p) => p?.shift === shift?.id);
                return (
                  <div key={shift?.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{shift?.name}</div>
                        <div className="text-sm text-muted-foreground">{shift?.start} - {shift?.end}</div>
                        {shift?.notes && <div className="text-xs text-muted-foreground">{shift?.notes}</div>}
                      </div>
                      <div className="text-2xl font-bold text-primary">{members?.length}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 truncate">
                      {members?.map((m) => m?.name)?.join(', ') || 'Sin personal asignado'}
                    </div>
                    {canManageShifts && (
                      <div className="flex gap-2 mt-3">
                        <Button size="xs" variant="outline" iconName="Pencil" onClick={() => setShiftForm(shift)}>Modificar</Button>
                        <Button size="xs" variant="ghost" iconName="Trash2" onClick={() => removeShift(shift)}>Eliminar</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- Rotación semanal ---------- */}
          <section className={`${sectionClass} overflow-x-auto`}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Rotación Semanal</h2>
            <div className="grid grid-cols-7 gap-2 min-w-[640px]">
              {WEEK_DAYS?.map((day, index) => (
                <div key={day} className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-2">{day}</div>
                  {canManageShifts ? (
                    <select
                      className="w-full py-2 rounded-md bg-primary/10 text-primary font-semibold text-sm text-center border-0"
                      value={rotation?.[index] || ''}
                      onChange={(e) => setRotation((prev) => prev?.map((id, i) => (i === index ? e?.target?.value : id)))}
                    >
                      <option value="">Sin turno</option>
                      {shifts?.map((s) => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
                    </select>
                  ) : (
                    <div className="py-2 rounded-md bg-primary/10 text-primary font-semibold text-sm">{shiftName(rotation?.[index])}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ---------- Actividades especiales ---------- */}
          <section className={sectionClass}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Actividades Especiales y Refuerzos</h2>
                <p className="text-sm text-muted-foreground">Procesiones, ferias patronales y eventos con mucha afluencia de personas</p>
              </div>
              {canManageShifts && !eventForm && (
                <Button size="sm" iconName="CalendarPlus" onClick={() => setEventForm(EMPTY_EVENT)}>Programar actividad</Button>
              )}
            </div>

            {eventForm && (
              <form onSubmit={saveEvent} className="p-4 my-4 rounded-md border border-border space-y-4">
                {!eventForm?.id && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Plantillas rápidas:</p>
                    <div className="flex flex-wrap gap-2">
                      {EVENT_PRESETS?.map((preset) => (
                        <button
                          type="button"
                          key={preset?.name}
                          onClick={() => setEventForm({ ...eventForm, ...preset })}
                          className="px-3 py-1 rounded-full border border-border text-xs text-foreground hover:bg-muted"
                        >
                          {preset?.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Nombre de la actividad" value={eventForm?.name} onChange={(e) => setEventForm({ ...eventForm, name: e?.target?.value })} required />
                  <div>
                    <label className="text-sm font-medium text-foreground">Tipo</label>
                    <select className={`${selectClass} w-full mt-2 h-10`} value={eventForm?.category} onChange={(e) => setEventForm({ ...eventForm, category: e?.target?.value })}>
                      {Object.entries(EVENT_CATEGORIES)?.map(([value, c]) => <option key={value} value={value}>{c?.label}</option>)}
                    </select>
                  </div>
                  <Input label="Lugar / recorrido" value={eventForm?.location} onChange={(e) => setEventForm({ ...eventForm, location: e?.target?.value })} />
                  <Input label="Fecha" type="date" value={eventForm?.date} onChange={(e) => setEventForm({ ...eventForm, date: e?.target?.value })} required />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Inicio" type="time" value={eventForm?.start} onChange={(e) => setEventForm({ ...eventForm, start: e?.target?.value })} />
                    <Input label="Fin" type="time" value={eventForm?.end} onChange={(e) => setEventForm({ ...eventForm, end: e?.target?.value })} />
                  </div>
                  <Input
                    label="Asistencia estimada"
                    type="number"
                    min="0"
                    value={eventForm?.attendance}
                    onChange={(e) => setEventForm({ ...eventForm, attendance: e?.target?.value })}
                    description={`Personal sugerido: ${suggestedStaff(eventForm?.attendance)} elementos`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Personal asignado ({eventForm?.assigned?.length} de {suggestedStaff(eventForm?.attendance)} sugeridos)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {personnel?.map((p) => (
                      <button
                        type="button"
                        key={p?.id}
                        onClick={() => toggleEventMember(p?.id)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          eventForm?.assigned?.includes(p?.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {p?.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Indicaciones</label>
                  <textarea
                    className="mt-2 w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={eventForm?.notes}
                    onChange={(e) => setEventForm({ ...eventForm, notes: e?.target?.value })}
                    placeholder="Puntos de ambulancia fija, rutas de evacuación, punto de reunión..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEventForm(null)}>Cancelar</Button>
                  <Button type="submit" size="sm" iconName="Save">{eventForm?.id ? 'Guardar cambios' : 'Programar'}</Button>
                </div>
              </form>
            )}

            <div className="space-y-3 mt-4">
              {sortedEvents?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No hay actividades programadas.</p>
              )}
              {sortedEvents?.map((event) => {
                const category = EVENT_CATEGORIES?.[event?.category] || EVENT_CATEGORIES.other;
                const needed = suggestedStaff(event?.attendance);
                const short = event?.assigned?.length < needed;
                return (
                  <div key={event?.id} className="flex flex-col md:flex-row md:items-start justify-between gap-3 p-4 rounded-md border border-border">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon name={category?.icon} size={20} className="text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{event?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category?.label} · {event?.date} · {event?.start} - {event?.end}
                        </div>
                        {event?.location && <div className="text-sm text-muted-foreground">{event?.location}</div>}
                        <div className="text-sm text-foreground mt-1">
                          Asistencia estimada: {Number(event?.attendance)?.toLocaleString('es-GT')} personas
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {event?.assigned?.map(memberName)?.join(', ') || 'Sin personal asignado'}
                        </div>
                        {event?.notes && <div className="text-xs text-muted-foreground mt-1">{event?.notes}</div>}
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span className={`flex items-center space-x-1 text-xs font-medium ${short ? 'text-warning' : 'text-success'}`}>
                        <Icon name={short ? 'AlertTriangle' : 'CheckCircle'} size={14} />
                        <span>{event?.assigned?.length} / {needed} elementos</span>
                      </span>
                      {canManageShifts && (
                        <div className="flex gap-2">
                          <Button size="xs" variant="outline" iconName="Pencil" onClick={() => setEventForm(event)}>Modificar</Button>
                          <Button size="xs" variant="ghost" iconName="Trash2" onClick={() => removeEvent(event)}>Eliminar</Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- Personal ---------- */}
          <section className={sectionClass}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground">Listado de Personal</h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e?.target?.value)}
                  />
                </div>
                <select className={selectClass} value={shiftFilter} onChange={(e) => setShiftFilter(e?.target?.value)}>
                  <option value="all">Todos los turnos</option>
                  {shifts?.map((s) => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
                </select>
                {canManagePersonnel && !memberForm && (
                  <Button size="sm" iconName="UserPlus" onClick={() => setMemberForm(EMPTY_MEMBER)}>Agregar personal</Button>
                )}
              </div>
            </div>

            {memberForm && (
              <form onSubmit={saveMember} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end p-4 mb-4 rounded-md border border-border">
                <Input label="Nombre completo" value={memberForm?.name} onChange={(e) => setMemberForm({ ...memberForm, name: e?.target?.value })} required />
                <div>
                  <label className="text-sm font-medium text-foreground">Cargo</label>
                  <select className={`${selectClass} w-full mt-2 h-10`} value={memberForm?.rank} onChange={(e) => setMemberForm({ ...memberForm, rank: e?.target?.value })}>
                    {RANKS?.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <Input label="Especialidad" value={memberForm?.specialty} onChange={(e) => setMemberForm({ ...memberForm, specialty: e?.target?.value })} />
                <Input label="Teléfono" value={memberForm?.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e?.target?.value })} />
                <div>
                  <label className="text-sm font-medium text-foreground">Turno</label>
                  <select className={`${selectClass} w-full mt-2 h-10`} value={memberForm?.shift} onChange={(e) => setMemberForm({ ...memberForm, shift: e?.target?.value })}>
                    {shifts?.map((s) => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" iconName="Save">Agregar</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setMemberForm(null)}>Cancelar</Button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Cargo</th>
                    <th className="py-2 pr-4">Especialidad</th>
                    <th className="py-2 pr-4">Teléfono</th>
                    <th className="py-2 pr-4">Turno</th>
                    <th className="py-2 pr-4">Estado</th>
                    {canManagePersonnel && <th className="py-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((p) => (
                    <tr key={p?.id} className={`border-b border-border last:border-0 ${p?.id === user?.personnelId ? 'bg-primary/5' : ''}`}>
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {p?.name}
                        {p?.id === user?.personnelId && <span className="ml-2 text-xs text-primary">(usted)</span>}
                      </td>
                      <td className="py-3 pr-4 text-foreground">{p?.rank}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p?.specialty}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p?.phone}</td>
                      <td className="py-3 pr-4 text-foreground">
                        {canManageShifts ? (
                          <select className={selectClass} value={p?.shift || ''} onChange={(e) => updateMember(p?.id, { shift: e?.target?.value })}>
                            <option value="">Sin turno</option>
                            {shifts?.map((s) => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
                          </select>
                        ) : shiftName(p?.shift)}
                      </td>
                      <td className="py-3 pr-4">
                        {canEditStatus(p) ? (
                          <select
                            className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${PERSONNEL_STATUS?.[p?.status]?.className}`}
                            value={p?.status}
                            onChange={(e) => updateMember(p?.id, { status: e?.target?.value })}
                          >
                            {Object.entries(PERSONNEL_STATUS)?.map(([value, s]) => (
                              <option key={value} value={value}>{s?.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${PERSONNEL_STATUS?.[p?.status]?.className}`}>
                            {PERSONNEL_STATUS?.[p?.status]?.label}
                          </span>
                        )}
                      </td>
                      {canManagePersonnel && (
                        <td className="py-3 text-right">
                          <Button size="xs" variant="ghost" iconName="UserMinus" onClick={() => removeMember(p)}>Quitar</Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">No se encontró personal.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PersonnelScheduling;
