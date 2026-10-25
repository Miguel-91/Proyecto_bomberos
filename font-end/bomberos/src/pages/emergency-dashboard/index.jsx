import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { APP_NAME } from '../../utils/brand';
import { getCurrentUser, getRoleLabel, hasPermission } from '../../utils/auth';
import { useIncidents, usePersonnel, useUnits, useEvents } from '../../utils/dataStore';
import { StatusBadge } from '../../components/IncidentActions';
import {
  UNIT_STATUS,
  EVENT_CATEGORIES,
  getEmergencyType,
  getPriority,
  formatDateTime,
  suggestedStaff,
} from '../../utils/emergencyData';

const StatCard = ({ icon, iconClass, value, label }) => (
  <div className="bg-card rounded-lg border border-border p-4">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
        <Icon name={icon} className={iconClass} size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  </div>
);

const EmergencyDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const can = (permission) => hasPermission(user, permission);
  const { incidents } = useIncidents();
  const [personnel] = usePersonnel();
  const [units] = useUnits();
  const [events] = useEvents();

  const activeIncidents = incidents?.filter((i) => i?.status !== 'closed');
  const awaitingReview = incidents?.filter((i) => i?.status === 'awaiting-review');
  const availableUnits = units?.filter((u) => u?.status === 'available');
  const onDutyPersonnel = personnel?.filter((p) => p?.status === 'on-duty' || p?.status === 'on-call');
  const today = new Date()?.toISOString()?.slice(0, 10);
  const upcomingEvents = events
    ?.filter((ev) => ev?.date >= today)
    ?.sort((a, b) => a?.date?.localeCompare(b?.date))
    ?.slice(0, 3);
  const quickLinks = [
    { label: 'Personal', icon: 'Calendar', href: '/personnel-scheduling', permission: 'personnel.view' },
    { label: 'Tickets', icon: 'FileText', href: '/incident-documentation', permission: 'incidents.view' },
    { label: 'Recursos', icon: 'Truck', href: '/resource-management', permission: 'resources.view' },
    { label: 'Llamadas', icon: 'Phone', href: '/emergency-call-intake', permission: 'emergencies.manage' },
    { label: 'Configuración', icon: 'Settings', href: '/system-settings', permission: 'settings.manage' },
  ]?.filter((link) => can(link?.permission));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
              <p className="text-muted-foreground">
                {user?.name ? `Bienvenido, ${user?.name} (${getRoleLabel(user?.role)}). ` : ''}{APP_NAME}
              </p>
            </div>
            {can('emergencies.manage') && (
              <Button variant="destructive" iconName="PhoneIncoming" onClick={() => navigate('/emergency-call-intake')}>
                Atender Nueva Emergencia
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="Siren" iconClass="text-destructive" value={activeIncidents?.length} label="Tickets abiertos" />
            <StatCard icon="Truck" iconClass="text-success" value={`${availableUnits?.length}/${units?.length}`} label="Unidades disponibles" />
            <StatCard icon="Users" iconClass="text-primary" value={onDutyPersonnel?.length} label="Personal disponible" />
            <StatCard icon="Gavel" iconClass="text-warning" value={awaitingReview?.length} label="Pendientes de dictamen" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent incidents */}
            <div className="xl:col-span-2 bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Tickets Recientes</h2>
                <Button variant="link" size="sm" onClick={() => navigate('/incident-documentation')}>
                  Ver todos
                </Button>
              </div>
              <div className="space-y-3">
                {incidents?.slice(0, 6)?.map((incident) => {
                  const type = getEmergencyType(incident?.type);
                  const priority = getPriority(incident?.priority);
                  return (
                    <div key={incident?.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-md border border-border">
                      <div className="flex items-center space-x-3">
                        <Icon name={type?.icon} size={20} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium text-foreground">{type?.label} · {incident?.id}</div>
                          <div className="text-sm text-muted-foreground">{incident?.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{formatDateTime(incident?.reportedAt)}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${priority?.className}`}>{priority?.label}</span>
                        <StatusBadge status={incident?.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Units status */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Estado de Unidades</h2>
                  {can('resources.view') && (
                    <Button variant="link" size="sm" onClick={() => navigate('/resource-management')}>
                      Ver
                    </Button>
                  )}
                </div>
                <ul className="space-y-2">
                  {units?.map((unit) => (
                    <li key={unit?.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{unit?.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${UNIT_STATUS?.[unit?.status]?.className}`}>
                        {UNIT_STATUS?.[unit?.status]?.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Próximas Actividades</h2>
                {upcomingEvents?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay actividades especiales programadas.</p>
                ) : (
                  <ul className="space-y-3">
                    {upcomingEvents?.map((ev) => (
                      <li key={ev?.id} className="flex items-start space-x-2 text-sm">
                        <Icon name={EVENT_CATEGORIES?.[ev?.category]?.icon || 'CalendarDays'} size={16} className="mt-0.5 text-accent" />
                        <div>
                          <div className="text-foreground">{ev?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ev?.date} · {ev?.assigned?.length}/{suggestedStaff(ev?.attendance)} elementos
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Accesos Rápidos</h2>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks?.map((link) => (
                    <Button key={link?.href} variant="outline" size="sm" iconName={link?.icon} onClick={() => navigate(link?.href)}>
                      {link?.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmergencyDashboard;
