import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ResourceManagement = () => {
  const [activeTab, setActiveTab] = useState('vehicles');

  const vehicles = [
    { id: 1, name: 'Autobomba 1', type: 'Autobomba', status: 'Disponible', location: 'Estación Central', capacity: '2000L', crew: 5 },
    { id: 2, name: 'Ambulancia 1', type: 'Ambulancia', status: 'En Servicio', location: 'Zona 10', capacity: 'N/A', crew: 3 },
    { id: 3, name: 'Autobomba 2', type: 'Autobomba', status: 'Disponible', location: 'Estación Norte', capacity: '3000L', crew: 6 },
    { id: 4, name: 'Rescate 1', type: 'Vehículo de Rescate', status: 'Mantenimiento', location: 'Taller', capacity: 'N/A', crew: 4 },
    { id: 5, name: 'Pick-up 1', type: 'Vehículo Ligero', status: 'Disponible', location: 'Estación Sur', capacity: 'N/A', crew: 2 },
  ];

  const equipment = [
    { id: 1, name: 'Mangueras Tipo A', quantity: 25, status: 'Bueno', location: 'Estación Central', lastMaintenance: '2025-10-15' },
    { id: 2, name: 'Cascos', quantity: 40, status: 'Bueno', location: 'Almacén Principal', lastMaintenance: '2025-09-20' },
    { id: 3, name: 'Extintores CO2', quantity: 15, status: 'Requiere Mantenimiento', location: 'Estación Norte', lastMaintenance: '2025-08-10' },
    { id: 4, name: 'Equipo de Respiración', quantity: 20, status: 'Bueno', location: 'Almacén Principal', lastMaintenance: '2025-10-01' },
    { id: 5, name: 'Cuerdas de Rescate', quantity: 30, status: 'Bueno', location: 'Estación Sur', lastMaintenance: '2025-09-15' },
  ];

  const personnel = [
    { id: 1, name: 'Carlos Méndez', role: 'Comandante', status: 'Disponible', specialization: 'Incendios Estructurales', experience: '15 años' },
    { id: 2, name: 'Ana López', role: 'Paramédico', status: 'En Servicio', specialization: 'Emergencias Médicas', experience: '8 años' },
    { id: 3, name: 'Miguel Torres', role: 'Bombero', status: 'Disponible', specialization: 'Rescate en Altura', experience: '5 años' },
    { id: 4, name: 'Laura Ruiz', role: 'Operadora', status: 'En Turno', specialization: 'Comunicaciones', experience: '3 años' },
    { id: 5, name: 'José García', role: 'Bombero', status: 'Descanso', specialization: 'Materiales Peligrosos', experience: '10 años' },
  ];

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'disponible': return 'bg-success/10 text-success';
      case 'en servicio': case 'en turno': return 'bg-primary/10 text-primary';
      case 'mantenimiento': case 'requiere mantenimiento': return 'bg-warning/10 text-warning';
      case 'descanso': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-8 px-4 lg:px-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/emergency-dashboard' },
            { label: 'Gestión de Recursos', href: '/resource-management' }
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestión de Recursos
            </h1>
            <p className="text-muted-foreground">
              Administración de vehículos, equipamiento y personal
            </p>
          </div>
          <Button variant="default" iconName="Plus">
            Agregar Recurso
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-border">
          {['vehicles', 'equipment', 'personnel'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'vehicles' && 'Vehículos'}
              {tab === 'equipment' && 'Equipamiento'}
              {tab === 'personnel' && 'Personal'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'vehicles' && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Capacidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tripulación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon name="Truck" size={20} className="mr-3 text-primary" />
                          <span className="text-sm font-medium text-foreground">{vehicle.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {vehicle.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {vehicle.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {vehicle.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {vehicle.crew} personas
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button variant="ghost" size="sm" iconName="Edit">
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Equipamiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Último Mantenimiento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {equipment.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon name="Package" size={20} className="mr-3 text-primary" />
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(item.lastMaintenance).toLocaleDateString('es-GT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button variant="ghost" size="sm" iconName="Edit">
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'personnel' && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Especialización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Experiencia
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {personnel.map((person) => (
                    <tr key={person.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <Icon name="User" size={20} className="text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{person.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {person.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(person.status)}`}>
                          {person.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {person.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {person.experience}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button variant="ghost" size="sm" iconName="Edit">
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResourceManagement;
