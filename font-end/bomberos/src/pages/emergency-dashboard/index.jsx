import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { APP_NAME } from '../../utils/brand';
import {
  MOCK_INCIDENTS,
  MOCK_UNITS,
  MOCK_PERSONNEL,
  INCIDENT_STATUS,
  UNIT_STATUS,
  getEmergencyType,
  getPriority,
  formatDateTime,
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
  const user = JSON.parse(localStorage.getItem('emergencyUser') || 'null');

  const activeIncidents = MOCK_INCIDENTS?.filter((i) => i?.status === 'active');
  const availableUnits = MOCK_UNITS?.filter((u) => u?.status === 'available');
  const onDutyPersonnel = MOCK_PERSONNEL?.filter((p) => p?.status === 'on-duty' || p?.status === 'on-call');

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
                {user?.name ? `Bienvenido, ${user?.name}. ` : ''}{APP_NAME}
              </p>
            </div>
            <Button variant="destructive" iconName="PhoneIncoming" onClick={() => navigate('/emergency-call-intake')}>
              Atender Nueva Emergencia
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="Siren" iconClass="text-destructive" value={activeIncidents?.length} label="Incidentes activos" />
            <StatCard icon="Truck" iconClass="text-success" value={`${availableUnits?.length}/${MOCK_UNITS?.length}`} label="Unidades disponibles" />
            <StatCard icon="Users" iconClass="text-primary" value={onDutyPersonnel?.length} label="Personal disponible" />
            <StatCard icon="Clock" iconClass="text-warning" value="7:45" label="Tiempo de respuesta promedio" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent incidents */}
            <div className="xl:col-span-2 bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Incidentes Recientes</h2>
                <Button variant="link" size="sm" onClick={() => navigate('/incident-documentation')}>
                  Ver todos
                </Button>
              </div>
              <div className="space-y-3">
                {MOCK_INCIDENTS?.map((incident) => {
                  const type = getEmergencyType(incident?.type);
                  const priority = getPriority(incident?.priority);
                  const status = INCIDENT_STATUS?.[incident?.status];
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
                        <span className={`px-2 py-0.5 rounded-full font-medium ${status?.className}`}>{status?.label}</span>
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
                  <Button variant="link" size="sm" onClick={() => navigate('/resource-management')}>
                    Gestionar
                  </Button>
                </div>
                <ul className="space-y-2">
                  {MOCK_UNITS?.map((unit) => (
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
                <h2 className="text-lg font-semibold text-foreground mb-4">Accesos Rápidos</h2>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" iconName="Calendar" onClick={() => navigate('/personnel-scheduling')}>
                    Personal
                  </Button>
                  <Button variant="outline" size="sm" iconName="FileText" onClick={() => navigate('/incident-documentation')}>
                    Reportes
                  </Button>
                  <Button variant="outline" size="sm" iconName="Truck" onClick={() => navigate('/resource-management')}>
                    Recursos
                  </Button>
                  <Button variant="outline" size="sm" iconName="Phone" onClick={() => navigate('/emergency-call-intake')}>
                    Llamadas
                  </Button>
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
