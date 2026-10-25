import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import {
  MOCK_INCIDENTS,
  MOCK_UNITS,
  EMERGENCY_TYPES,
  PRIORITIES,
  INCIDENT_STATUS,
  getEmergencyType,
  getPriority,
  formatDateTime,
} from '../../utils/emergencyData';

const IncidentDocumentation = () => {
  const location = useLocation();
  // Datos enviados desde la página de recepción de llamadas
  const fromCall = location?.state;

  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [showForm, setShowForm] = useState(Boolean(fromCall));
  const [form, setForm] = useState({
    type: fromCall?.classification?.type || '',
    priority: fromCall?.classification?.priority || 'medium',
    address: fromCall?.callerInfo?.address || '',
    callerName: fromCall?.callerInfo?.name || '',
    callerPhone: fromCall?.callerInfo?.phone || '',
    description: fromCall?.responses?.map((r) => `${r?.question} ${r?.answer}`)?.join('\n') || '',
    units: [],
  });
  const [selectedId, setSelectedId] = useState(null);

  const selected = incidents?.find((i) => i?.id === selectedId);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleUnit = (unitId) => {
    updateForm('units', form?.units?.includes(unitId) ? form?.units?.filter((u) => u !== unitId) : [...form?.units, unitId]);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form?.type || !form?.address) return;
    const nextNumber = String(incidents?.length + 408)?.padStart(4, '0');
    const newIncident = {
      id: `INC-${new Date()?.getFullYear()}-${nextNumber}`,
      type: form?.type,
      priority: form?.priority,
      address: form?.address,
      reportedAt: new Date()?.toISOString(),
      status: 'active',
      units: form?.units,
      description: form?.description,
      caller: { name: form?.callerName, phone: form?.callerPhone },
    };
    setIncidents([newIncident, ...incidents]);
    setShowForm(false);
    setSelectedId(newIncident?.id);
    setForm({ type: '', priority: 'medium', address: '', callerName: '', callerPhone: '', description: '', units: [] });
  };

  const closeIncident = (id) => {
    setIncidents((prev) => prev?.map((i) => (i?.id === id ? { ...i, status: 'closed' } : i)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Documentación de Incidentes</h1>
              <p className="text-muted-foreground">Registro y seguimiento de los reportes de emergencia</p>
            </div>
            <Button iconName={showForm ? 'X' : 'Plus'} variant={showForm ? 'outline' : 'default'} onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancelar' : 'Nuevo Reporte'}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 mb-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Nuevo Reporte de Incidente</h2>
              {fromCall && (
                <p className="text-sm text-primary">Datos precargados desde la llamada atendida.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Tipo de emergencia *</label>
                  <select
                    className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={form?.type}
                    onChange={(e) => updateForm('type', e?.target?.value)}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {EMERGENCY_TYPES?.map((t) => (
                      <option key={t?.value} value={t?.value}>{t?.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Prioridad</label>
                  <select
                    className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={form?.priority}
                    onChange={(e) => updateForm('priority', e?.target?.value)}
                  >
                    {PRIORITIES?.map((p) => (
                      <option key={p?.value} value={p?.value}>{p?.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Dirección"
                    value={form?.address}
                    onChange={(e) => updateForm('address', e?.target?.value)}
                    placeholder="Ej. 4a Calle Oriente, Antigua Guatemala"
                    required
                  />
                </div>
                <Input label="Nombre del llamante" value={form?.callerName} onChange={(e) => updateForm('callerName', e?.target?.value)} />
                <Input label="Teléfono del llamante" value={form?.callerPhone} onChange={(e) => updateForm('callerPhone', e?.target?.value)} />
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Descripción</label>
                  <textarea
                    className="mt-2 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form?.description}
                    onChange={(e) => updateForm('description', e?.target?.value)}
                    placeholder="Detalle de la situación, acciones tomadas, observaciones..."
                  />
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-foreground mb-2">Unidades asignadas</p>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_UNITS?.map((unit) => (
                      <button
                        type="button"
                        key={unit?.id}
                        onClick={() => toggleUnit(unit?.id)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          form?.units?.includes(unit?.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {unit?.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" iconName="Save" disabled={!form?.type || !form?.address}>
                  Guardar Reporte
                </Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Incident list */}
            <div className="xl:col-span-2 bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Historial</h2>
              <div className="space-y-2">
                {incidents?.map((incident) => {
                  const type = getEmergencyType(incident?.type);
                  const priority = getPriority(incident?.priority);
                  const status = INCIDENT_STATUS?.[incident?.status];
                  return (
                    <button
                      key={incident?.id}
                      onClick={() => setSelectedId(incident?.id)}
                      className={`w-full text-left flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-md border transition-colors ${
                        selectedId === incident?.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon name={type?.icon} size={20} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium text-foreground">{incident?.id} · {type?.label}</div>
                          <div className="text-sm text-muted-foreground">{incident?.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${priority?.className}`}>{priority?.label}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${status?.className}`}>{status?.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Incident detail */}
            <div className="bg-card rounded-lg border border-border p-6 h-fit">
              {selected ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{selected?.id}</div>
                    <h2 className="text-lg font-semibold text-foreground">{getEmergencyType(selected?.type)?.label}</h2>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Dirección</dt>
                      <dd className="text-foreground">{selected?.address}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Reportado</dt>
                      <dd className="text-foreground">{formatDateTime(selected?.reportedAt)}</dd>
                    </div>
                    {selected?.caller?.name && (
                      <div>
                        <dt className="text-muted-foreground">Llamante</dt>
                        <dd className="text-foreground">{selected?.caller?.name} {selected?.caller?.phone}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-muted-foreground">Unidades</dt>
                      <dd className="text-foreground">
                        {selected?.units?.length
                          ? selected?.units?.map((id) => MOCK_UNITS?.find((u) => u?.id === id)?.name || id)?.join(', ')
                          : 'Sin asignar'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Descripción</dt>
                      <dd className="text-foreground whitespace-pre-line">{selected?.description || '—'}</dd>
                    </div>
                  </dl>
                  <div className="flex gap-2">
                    {selected?.status !== 'closed' && (
                      <Button variant="success" size="sm" iconName="CheckCircle" onClick={() => closeIncident(selected?.id)}>
                        Cerrar incidente
                      </Button>
                    )}
                    <Button variant="outline" size="sm" iconName="Printer" onClick={() => window.print()}>
                      Imprimir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Icon name="FileSearch" size={40} className="mx-auto mb-3" />
                  <p className="text-sm">Seleccione un incidente para ver el detalle.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncidentDocumentation;
