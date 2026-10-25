import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import IncidentActions, { StatusBadge, IncidentTimeline, ResolutionSummary } from '../../components/IncidentActions';
import { getCurrentUser, hasPermission } from '../../utils/auth';
import { useIncidents, useUnits } from '../../utils/dataStore';
import { downloadIncidentReport } from '../../utils/reportExport';
import {
  EMERGENCY_TYPES,
  PRIORITIES,
  INCIDENT_STATUS,
  getEmergencyType,
  getPriority,
  formatDateTime,
} from '../../utils/emergencyData';

const EMPTY_FORM = { type: '', priority: 'medium', address: '', callerName: '', callerPhone: '', description: '', units: [] };

const IncidentDocumentation = () => {
  const user = getCurrentUser();
  const canCreate = hasPermission(user, 'emergencies.manage');
  const { incidents, createIncident, updateIncident, changeStatus, finalizeIncident } = useIncidents();
  const [units] = useUnits();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const selected = incidents?.find((i) => i?.id === selectedId);
  const filtered = incidents?.filter((i) => statusFilter === 'all' || i?.status === statusFilter);

  // Rango de fechas del reporte estadístico
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const reportIncidents = filtered?.filter((i) => {
    const day = i?.reportedAt?.slice(0, 10);
    return (!reportFrom || day >= reportFrom) && (!reportTo || day <= reportTo);
  });

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleUnit = (unitId) => {
    updateForm('units', form?.units?.includes(unitId) ? form?.units?.filter((u) => u !== unitId) : [...form?.units, unitId]);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form?.type || !form?.address) return;
    const created = createIncident({
      type: form?.type,
      priority: form?.priority,
      address: form?.address,
      units: form?.units,
      description: form?.description,
      caller: { name: form?.callerName, phone: form?.callerPhone },
      historyNote: 'Ticket creado manualmente',
    }, user);
    setShowForm(false);
    setSelectedId(created?.id);
    setForm(EMPTY_FORM);
  };

  const toggleSelectedUnit = (unitId) => {
    const current = selected?.units || [];
    updateIncident(selected?.id, {
      units: current?.includes(unitId) ? current?.filter((u) => u !== unitId) : [...current, unitId],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tickets de Emergencia</h1>
              <p className="text-muted-foreground">Seguimiento del estado de cada emergencia hasta su dictamen final</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="block text-xs text-muted-foreground">Desde</label>
                <input type="date" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={reportFrom} onChange={(e) => setReportFrom(e?.target?.value)} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">Hasta</label>
                <input type="date" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={reportTo} onChange={(e) => setReportTo(e?.target?.value)} />
              </div>
              <Button
                variant="outline"
                iconName="Download"
                onClick={() => downloadIncidentReport(reportIncidents, units, { from: reportFrom, to: reportTo })}
                disabled={!reportIncidents?.length}
              >
                Descargar reporte PDF ({reportIncidents?.length})
              </Button>
              {canCreate && (
                <Button iconName={showForm ? 'X' : 'Plus'} variant={showForm ? 'outline' : 'default'} onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancelar' : 'Nuevo Ticket'}
                </Button>
              )}
            </div>
          </div>

          {/* Status summary / filter */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <button
              onClick={() => setStatusFilter('all')}
              className={`p-3 rounded-lg border text-left ${statusFilter === 'all' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
            >
              <div className="text-2xl font-bold text-foreground">{incidents?.length}</div>
              <div className="text-sm text-muted-foreground">Todos</div>
            </button>
            {Object.entries(INCIDENT_STATUS)?.map(([value, info]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`p-3 rounded-lg border text-left ${statusFilter === value ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
              >
                <div className="text-2xl font-bold text-foreground">{incidents?.filter((i) => i?.status === value)?.length}</div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name={info?.icon} size={14} />
                  <span>{info?.label}</span>
                </div>
              </button>
            ))}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 mb-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Nuevo Ticket de Emergencia</h2>
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
                    {units?.map((unit) => (
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
                  Crear Ticket
                </Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Ticket list */}
            <div className="xl:col-span-2 bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Historial</h2>
              <div className="space-y-2">
                {filtered?.map((incident) => {
                  const type = getEmergencyType(incident?.type);
                  const priority = getPriority(incident?.priority);
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
                          <div className="text-xs text-muted-foreground">{formatDateTime(incident?.reportedAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${priority?.className}`}>{priority?.label}</span>
                        <StatusBadge status={incident?.status} />
                      </div>
                    </button>
                  );
                })}
                {filtered?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No hay tickets en este estado.</p>
                )}
              </div>
            </div>

            {/* Ticket detail */}
            <div className="bg-card rounded-lg border border-border p-6 h-fit">
              {selected ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">{selected?.id}</div>
                      <h2 className="text-lg font-semibold text-foreground">{getEmergencyType(selected?.type)?.label}</h2>
                    </div>
                    <StatusBadge status={selected?.status} />
                  </div>

                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Dirección</dt>
                      <dd className="text-foreground">{selected?.address}</dd>
                    </div>
                    {(selected?.caller?.name || selected?.caller?.phone) && (
                      <div>
                        <dt className="text-muted-foreground">Llamante</dt>
                        <dd className="text-foreground">{selected?.caller?.name} {selected?.caller?.phone}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-muted-foreground">Unidades</dt>
                      <dd className="flex flex-wrap gap-1 mt-1">
                        {units?.map((unit) => {
                          const assigned = selected?.units?.includes(unit?.id);
                          const editable = hasPermission(user, 'incidents.update') && selected?.status !== 'closed';
                          if (!assigned && !editable) return null;
                          return (
                            <button
                              key={unit?.id}
                              disabled={!editable}
                              onClick={() => toggleSelectedUnit(unit?.id)}
                              className={`px-2 py-0.5 rounded-full text-xs border ${
                                assigned ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                              }`}
                            >
                              {unit?.name}
                            </button>
                          );
                        })}
                        {!selected?.units?.length && !hasPermission(user, 'incidents.update') && (
                          <span className="text-foreground">Sin asignar</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Descripción</dt>
                      <dd className="text-foreground whitespace-pre-line">{selected?.description || '—'}</dd>
                    </div>
                  </dl>

                  {selected?.transcript?.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary">Ver transcripción de la llamada</summary>
                      <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                        {selected?.transcript?.map((t) => (
                          <p key={t?.id}><span className="font-medium">{t?.speaker}:</span> {t?.message}</p>
                        ))}
                      </div>
                    </details>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Seguimiento</h3>
                    <IncidentTimeline incident={selected} />
                  </div>

                  <ResolutionSummary resolution={selected?.resolution} />

                  <IncidentActions
                    incident={selected}
                    user={user}
                    onChangeStatus={(id, status, note) => changeStatus(id, status, user, note)}
                    onFinalize={(id, result, notes) => finalizeIncident(id, result, notes, user)}
                  />

                  <Button variant="outline" size="sm" iconName="Printer" onClick={() => window.print()}>
                    Imprimir
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Icon name="FileSearch" size={40} className="mx-auto mb-3" />
                  <p className="text-sm">Seleccione un ticket para ver su estado y seguimiento.</p>
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
