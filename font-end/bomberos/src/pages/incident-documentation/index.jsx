import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { ticketsEmergenciaService } from '../../services/supabaseClient';
import { generateEmergencyReportPDF } from '../../services/pdfGenerator';

const IncidentDocumentation = () => {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setIsLoading(true);
    try {
      const tickets = await ticketsEmergenciaService.obtenerTodos();
      setIncidents(tickets || []);
    } catch (error) {
      console.error('Error cargando incidentes:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDIENTE': return 'bg-warning/10 text-warning';
      case 'EN_PROCESO': return 'bg-primary/10 text-primary';
      case 'COMPLETADO': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleGeneratePDF = (incident) => {
    const callData = {
      nombreLlamante: incident.solicitante,
      telefonoLlamante: incident.telefono_solicitante,
      direccionLlamante: incident.ubicacion,
      tipoEmergencia: incident.tipo_emergencia,
      prioridad: getPrioridadTexto(incident.prioridad),
      descripcion: incident.descripcion,
      estado: incident.estado,
      transcripcion: incident.transcripcion,
      ubicacionLatitud: incident.ubicacion_latitud,
      ubicacionLongitud: incident.ubicacion_longitud,
      nivelRiesgo: incident.nivel_riesgo,
      recursosNecesarios: incident.recursos_necesarios,
      unidadesEstimadas: incident.unidades_estimadas,
      tiempoEstimado: incident.tiempo_estimado,
      fechaCreacion: incident.fecha_creacion
    };
    generateEmergencyReportPDF(callData);
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = filterStatus === 'all' || incident.estado === filterStatus;
    const matchesSearch =
      incident.solicitante?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.tipo_emergencia?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-8 px-4 lg:px-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/emergency-dashboard' },
            { label: 'Documentación de Incidentes', href: '/incident-documentation' }
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Documentación de Incidentes
            </h1>
            <p className="text-muted-foreground">
              Historial y registro de todos los incidentes
            </p>
          </div>
          <Button variant="default" iconName="Plus" href="/emergency-call-intake">
            Nuevo Incidente
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, ubicación o tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'PENDIENTE', 'EN_PROCESO', 'COMPLETADO'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status === 'all' ? 'Todos' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Icon name="Loader" size={48} className="animate-spin text-primary" />
          </div>
        ) : filteredIncidents.length > 0 ? (
          <div className="grid gap-4">
            {filteredIncidents.map((incident) => (
              <div key={incident.id_ticket} className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(incident.prioridad)}`}>
                      {getPrioridadTexto(incident.prioridad)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.estado)}`}>
                      {incident.estado}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(incident.fecha_creacion).toLocaleString('es-GT')}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {incident.tipo_emergencia || 'Tipo no especificado'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Icon name="User" size={16} className="text-muted-foreground" />
                        <span className="text-foreground font-medium">{incident.solicitante}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Phone" size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{incident.telefono_solicitante}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="MapPin" size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{incident.ubicacion}</span>
                      </div>
                    </div>
                  </div>

                  {incident.descripcion && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Descripción:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {incident.descripcion}
                      </p>
                    </div>
                  )}
                </div>

                {(incident.nivel_riesgo || incident.recursos_necesarios) && (
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    {incident.nivel_riesgo && (
                      <div className="flex items-center space-x-2">
                        <Icon name="AlertTriangle" size={16} className="text-warning" />
                        <span className="text-muted-foreground">
                          Nivel de Riesgo: <span className="text-foreground font-medium">{incident.nivel_riesgo}</span>
                        </span>
                      </div>
                    )}
                    {incident.recursos_necesarios && (
                      <div className="flex items-center space-x-2">
                        <Icon name="Package" size={16} className="text-primary" />
                        <span className="text-muted-foreground">
                          Recursos: <span className="text-foreground font-medium">{incident.recursos_necesarios}</span>
                        </span>
                      </div>
                    )}
                    {incident.unidades_estimadas && (
                      <div className="flex items-center space-x-2">
                        <Icon name="Truck" size={16} className="text-primary" />
                        <span className="text-muted-foreground">
                          Unidades: <span className="text-foreground font-medium">{incident.unidades_estimadas}</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="FileText"
                    onClick={() => handleGeneratePDF(incident)}
                  >
                    Generar PDF
                  </Button>
                  <Button variant="outline" size="sm" iconName="Edit">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" iconName="Eye">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Inbox" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No se encontraron incidentes
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Aún no hay incidentes documentados'}
            </p>
            <Button variant="default" iconName="Plus" href="/emergency-call-intake">
              Crear Primer Incidente
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default IncidentDocumentation;
