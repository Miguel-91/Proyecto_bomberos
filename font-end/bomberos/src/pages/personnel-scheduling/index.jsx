import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import { MOCK_PERSONNEL, PERSONNEL_STATUS } from '../../utils/emergencyData';

const SHIFTS = [
  { value: 'A', label: 'Turno A', hours: '07:00 - 19:00' },
  { value: 'B', label: 'Turno B', hours: '19:00 - 07:00' },
  { value: 'C', label: 'Turno C', hours: 'Reserva / fines de semana' },
];

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
// Rotación de turnos A/B/C por día de la semana
const ROTATION = ['A', 'B', 'C', 'A', 'B', 'C', 'A'];

const PersonnelScheduling = () => {
  const [personnel, setPersonnel] = useState(MOCK_PERSONNEL);
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');

  const filtered = personnel?.filter((p) => {
    const matchesSearch = `${p?.name} ${p?.rank} ${p?.specialty}`?.toLowerCase()?.includes(search?.toLowerCase());
    const matchesShift = shiftFilter === 'all' || p?.shift === shiftFilter;
    return matchesSearch && matchesShift;
  });

  const updateStatus = (id, status) => {
    setPersonnel((prev) => prev?.map((p) => (p?.id === id ? { ...p, status } : p)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Personal y Turnos</h1>
            <p className="text-muted-foreground">Gestión del personal voluntario y programación de turnos</p>
          </div>

          {/* Shift summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {SHIFTS?.map((shift) => {
              const members = personnel?.filter((p) => p?.shift === shift?.value);
              return (
                <div key={shift?.value} className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{shift?.label}</div>
                      <div className="text-sm text-muted-foreground">{shift?.hours}</div>
                    </div>
                    <div className="text-2xl font-bold text-primary">{members?.length}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly rotation */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-foreground mb-4">Rotación Semanal</h2>
            <div className="grid grid-cols-7 gap-2 min-w-[560px]">
              {WEEK_DAYS?.map((day, index) => (
                <div key={day} className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-2">{day}</div>
                  <div className="py-3 rounded-md bg-primary/10 text-primary font-semibold">
                    Turno {ROTATION?.[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personnel list */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground">Listado de Personal</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e?.target?.value)}
                  />
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e?.target?.value)}
                >
                  <option value="all">Todos los turnos</option>
                  {SHIFTS?.map((s) => (
                    <option key={s?.value} value={s?.value}>{s?.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Cargo</th>
                    <th className="py-2 pr-4">Especialidad</th>
                    <th className="py-2 pr-4">Teléfono</th>
                    <th className="py-2 pr-4">Turno</th>
                    <th className="py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((p) => (
                    <tr key={p?.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{p?.name}</td>
                      <td className="py-3 pr-4 text-foreground">{p?.rank}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p?.specialty}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p?.phone}</td>
                      <td className="py-3 pr-4 text-foreground">{p?.shift}</td>
                      <td className="py-3">
                        <select
                          className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${PERSONNEL_STATUS?.[p?.status]?.className}`}
                          value={p?.status}
                          onChange={(e) => updateStatus(p?.id, e?.target?.value)}
                        >
                          {Object.entries(PERSONNEL_STATUS)?.map(([value, s]) => (
                            <option key={value} value={value}>{s?.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">No se encontró personal.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonnelScheduling;
