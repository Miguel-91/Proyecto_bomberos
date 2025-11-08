import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { ticketsEmergenciaService } from '../../services/supabaseClient';

const EmergencyDashboard = () => {
  const [stats, setStats] = useState({
    ticketsPendientes: 0,
    ticketsEnProceso: 0,
    ticketsCompletados: 0,
    ticketsTotal: 0,
    tiempoPromedioRespuesta: '0 min',
    emergenciasDelDia: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Obtener estadísticas del día
      const estadisticas = await ticketsEmergenciaService.obtenerEstadisticasDelDia();
      setStats(estadisticas || {
        ticketsPendientes: 0,
        ticketsEnProceso: 0,
        ticketsCompletados: 0,
        ticketsTotal: 0,
        tiempoPromedioRespuesta: '0 min',
        emergenciasDelDia: 0
      });

      // Obtener tickets recientes
      const tickets = await ticketsEmergenciaService.obtenerTodos();
      setRecentTickets(tickets?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, bgColor, trend }) => (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon name={icon} size={24} color={color} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend > 0 ? 'text-success' : 'text-destructive'}`}>
            <Icon name={trend > 0 ? 'TrendingUp' : 'TrendingDown'} size={16} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 1: return 'text-destructive bg-destructive/10';
      case 2: return 'text-warning bg-warning/10';
      case 3: return 'text-primary bg-primary/10';
      case 4: return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPrioridadTexto = (prioridad) => {
    switch(prioridad) {
      case 1: return 'Crítica';
      case 2: return 'Alta';
      case 3: return 'Media';
      case 4: return 'Baja';
      default: return 'Desconocida';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-8 px-4 lg:px-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/emergency-dashboard' }
          ]}
        />

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard de Emergencias
            </h1>
            <p className="text-muted-foreground">
              Vista general del sistema de gestión de emergencias
            </p>
          </div>
          <Button
            variant="default"
            onClick={loadDashboardData}
            iconName="RefreshCw"
            disabled={isLoading}
          >
            Actualizar
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="AlertCircle"
            title="Emergencias del Día"
            value={stats.emergenciasDelDia}
            color="#ef4444"
            bgColor="bg-destructive/10"
            trend={5}
          />
          <StatCard
            icon="Clock"
            title="Pendientes"
            value={stats.ticketsPendientes}
            color="#f59e0b"
            bgColor="bg-warning/10"
            trend={-2}
          />
          <StatCard
            icon="Activity"
            title="En Proceso"
            value={stats.ticketsEnProceso}
            color="#3b82f6"
            bgColor="bg-primary/10"
          />
          <StatCard
            icon="CheckCircle"
            title="Completados Hoy"
            value={stats.ticketsCompletados}
            color="#10b981"
            bgColor="bg-success/10"
            trend={8}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Tickets Recientes
                  </h2>
                  <Button variant="ghost" size="sm" href="/emergency-call-intake">
                    Ver todos
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Icon name="Loader" size={32} className="animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Cargando tickets...</p>
                  </div>
                ) : recentTickets?.length > 0 ? (
                  recentTickets.map((ticket) => (
                    <div key={ticket.id_ticket} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getPrioridadColor(ticket.prioridad)}`}>
                            {getPrioridadTexto(ticket.prioridad)}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {ticket.tipo_emergencia || 'Sin clasificar'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.fecha_creacion).toLocaleTimeString('es-GT')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground font-medium">
                            {ticket.solicitante}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.ubicacion}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.estado === 'PENDIENTE' ? 'bg-warning/10 text-warning' :
                          ticket.estado === 'EN_PROCESO' ? 'bg-primary/10 text-primary' :
                          'bg-success/10 text-success'
                        }`}>
                          {ticket.estado}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay tickets recientes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Acciones Rápidas
              </h2>
              <div className="space-y-3">
                <Button
                  variant="default"
                  fullWidth
                  iconName="Phone"
                  href="/emergency-call-intake"
                >
                  Nueva Llamada
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  iconName="FileText"
                  href="/incident-documentation"
                >
                  Documentar Incidente
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  iconName="Users"
                  href="/resource-management"
                >
                  Gestionar Recursos
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  iconName="Calendar"
                  href="/personnel-scheduling"
                >
                  Ver Calendario
                </Button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Estado del Sistema
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base de Datos</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm font-medium text-success">Activo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm font-medium text-success">Activo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unidades Disponibles</span>
                  <span className="text-sm font-medium text-foreground">12/15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Personal en Turno</span>
                  <span className="text-sm font-medium text-foreground">24</span>
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
