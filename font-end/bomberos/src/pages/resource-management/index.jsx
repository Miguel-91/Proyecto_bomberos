import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import { MOCK_EQUIPMENT, UNIT_STATUS } from '../../utils/emergencyData';
import { getCurrentUser, hasPermission } from '../../utils/auth';
import { useUnits } from '../../utils/dataStore';

const UNIT_ICONS = {
  Autobomba: 'Flame',
  Ambulancia: 'Ambulance',
  Cisterna: 'Droplets',
  Rescate: 'LifeBuoy',
};

const ResourceManagement = () => {
  const canManage = hasPermission(getCurrentUser(), 'resources.manage');
  const [units, setUnits] = useUnits();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUnits = units?.filter((u) => statusFilter === 'all' || u?.status === statusFilter);

  const updateUnitStatus = (id, status) => {
    setUnits((prev) => prev?.map((u) => (u?.id === id ? { ...u, status } : u)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Gestión de Recursos</h1>
            <p className="text-muted-foreground">Unidades, vehículos y equipo de las estaciones</p>
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              Todas ({units?.length})
            </button>
            {Object.entries(UNIT_STATUS)?.map(([value, s]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {s?.label} ({units?.filter((u) => u?.status === value)?.length})
              </button>
            ))}
          </div>

          {/* Units grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {filteredUnits?.map((unit) => (
              <div key={unit?.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Icon name={UNIT_ICONS?.[unit?.type] || 'Truck'} size={20} className="text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{unit?.name}</div>
                      <div className="text-xs text-muted-foreground">{unit?.station}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${UNIT_STATUS?.[unit?.status]?.className}`}>
                    {UNIT_STATUS?.[unit?.status]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="text-muted-foreground">Tripulación</div>
                  <div className="text-foreground text-right">{unit?.crew} personas</div>
                  <div className="text-muted-foreground">Último servicio</div>
                  <div className="text-foreground text-right">{unit?.lastService}</div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Combustible</span>
                    <span>{unit?.fuel}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div
                      className={`h-2 rounded-full ${unit?.fuel < 50 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${unit?.fuel}%` }}
                    />
                  </div>
                </div>

                {canManage && (
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={unit?.status}
                    onChange={(e) => updateUnitStatus(unit?.id, e?.target?.value)}
                  >
                    {Object.entries(UNIT_STATUS)?.map(([value, s]) => (
                      <option key={value} value={value}>{s?.label}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Equipment inventory */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Inventario de Equipo</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Equipo</th>
                    <th className="py-2 pr-4 text-right">Total</th>
                    <th className="py-2 pr-4 text-right">Disponible</th>
                    <th className="py-2 pr-4 text-right">Mínimo</th>
                    <th className="py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_EQUIPMENT?.map((item) => {
                    const isLow = item?.available < item?.minimum;
                    return (
                      <tr key={item?.id} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 text-foreground">{item?.name}</td>
                        <td className="py-3 pr-4 text-right text-foreground">{item?.quantity}</td>
                        <td className="py-3 pr-4 text-right text-foreground">{item?.available}</td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">{item?.minimum}</td>
                        <td className="py-3">
                          {isLow ? (
                            <span className="flex items-center space-x-1 text-warning">
                              <Icon name="AlertTriangle" size={14} />
                              <span>Reabastecer</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-success">
                              <Icon name="CheckCircle" size={14} />
                              <span>Suficiente</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourceManagement;
