import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const PersonnelScheduling = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  const shifts = [
    {
      id: 1,
      name: 'Turno Mañana',
      time: '06:00 - 14:00',
      day: 'Lunes',
      personnel: ['Carlos Méndez', 'Ana López', 'Miguel Torres'],
      station: 'Estación Central'
    },
    {
      id: 2,
      name: 'Turno Tarde',
      time: '14:00 - 22:00',
      day: 'Lunes',
      personnel: ['Laura Ruiz', 'José García', 'Pedro Martínez'],
      station: 'Estación Central'
    },
    {
      id: 3,
      name: 'Turno Noche',
      time: '22:00 - 06:00',
      day: 'Lunes',
      personnel: ['Roberto Sánchez', 'María González', 'Luis Hernández'],
      station: 'Estación Central'
    },
    {
      id: 4,
      name: 'Turno Mañana',
      time: '06:00 - 14:00',
      day: 'Martes',
      personnel: ['Ana López', 'Miguel Torres', 'Pedro Martínez'],
      station: 'Estación Norte'
    },
    {
      id: 5,
      name: 'Turno Tarde',
      time: '14:00 - 22:00',
      day: 'Martes',
      personnel: ['José García', 'Carlos Méndez', 'María González'],
      station: 'Estación Norte'
    },
  ];

  const upcomingShifts = [
    { id: 1, date: '2025-11-09', shift: 'Mañana', station: 'Estación Central', personnel: 8 },
    { id: 2, date: '2025-11-09', shift: 'Tarde', station: 'Estación Norte', personnel: 6 },
    { id: 3, date: '2025-11-10', shift: 'Mañana', station: 'Estación Sur', personnel: 7 },
    { id: 4, date: '2025-11-10', shift: 'Noche', station: 'Estación Central', personnel: 5 },
  ];

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const timeSlots = [
    { name: 'Mañana', time: '06:00 - 14:00', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { name: 'Tarde', time: '14:00 - 22:00', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { name: 'Noche', time: '22:00 - 06:00', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-8 px-4 lg:px-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/emergency-dashboard' },
            { label: 'Programación de Personal', href: '/personnel-scheduling' }
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Programación de Personal
            </h1>
            <p className="text-muted-foreground">
              Gestión de turnos y asignación de personal
            </p>
          </div>
          <Button variant="default" iconName="Plus">
            Crear Turno
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Personal Activo</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Turno Ahora</p>
                <p className="text-2xl font-bold text-foreground">8</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Icon name="Calendar" size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnos Pendientes</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Icon name="AlertCircle" size={20} className="text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnos sin Cubrir</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Calendario Semanal
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" iconName="ChevronLeft">
                    Anterior
                  </Button>
                  <span className="text-sm font-medium text-foreground px-4">
                    Noviembre 2025
                  </span>
                  <Button variant="outline" size="sm" iconName="ChevronRight">
                    Siguiente
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 bg-muted/50 text-xs font-medium text-muted-foreground text-left">
                        Turno
                      </th>
                      {daysOfWeek.map((day) => (
                        <th key={day} className="border border-border p-2 bg-muted/50 text-xs font-medium text-muted-foreground text-center">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.name}>
                        <td className="border border-border p-2 bg-muted/20">
                          <div className="text-xs font-medium text-foreground">{slot.name}</div>
                          <div className="text-xs text-muted-foreground">{slot.time}</div>
                        </td>
                        {daysOfWeek.map((day) => {
                          const shift = shifts.find(s => s.day === day && s.name.includes(slot.name));
                          return (
                            <td key={`${day}-${slot.name}`} className="border border-border p-2 hover:bg-muted/50 cursor-pointer">
                              {shift ? (
                                <div className={`p-2 rounded border ${slot.color}`}>
                                  <div className="text-xs font-medium mb-1">{shift.station}</div>
                                  <div className="text-xs">
                                    {shift.personnel.length} personas
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground text-center">
                                  -
                                </div>
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

          {/* Upcoming Shifts */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Próximos Turnos
              </h2>
              <div className="space-y-3">
                {upcomingShifts.map((shift) => (
                  <div key={shift.id} className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="Clock" size={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {shift.shift}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(shift.date).toLocaleDateString('es-GT')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {shift.station}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-primary">
                      <Icon name="Users" size={12} />
                      <span>{shift.personnel} personas asignadas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Acciones Rápidas
              </h2>
              <div className="space-y-2">
                <Button variant="outline" fullWidth iconName="UserPlus" size="sm">
                  Asignar Personal
                </Button>
                <Button variant="outline" fullWidth iconName="Calendar" size="sm">
                  Ver Calendario Completo
                </Button>
                <Button variant="outline" fullWidth iconName="FileText" size="sm">
                  Generar Reporte
                </Button>
                <Button variant="outline" fullWidth iconName="Bell" size="sm">
                  Notificar Cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonnelScheduling;
