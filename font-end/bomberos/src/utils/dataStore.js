import { useCallback } from 'react';
import useStoredState, { clearStoredState } from './useStoredState';
import {
  MOCK_INCIDENTS,
  MOCK_PERSONNEL,
  MOCK_UNITS,
  MOCK_EVENTS,
  DEFAULT_SHIFTS,
  DEFAULT_ROTATION,
  STORAGE_KEYS,
} from './emergencyData';

export const usePersonnel = () => useStoredState(STORAGE_KEYS.personnel, MOCK_PERSONNEL);
export const useUnits = () => useStoredState(STORAGE_KEYS.units, MOCK_UNITS);
export const useShifts = () => useStoredState(STORAGE_KEYS.shifts, DEFAULT_SHIFTS);
export const useRotation = () => useStoredState(STORAGE_KEYS.rotation, DEFAULT_ROTATION);
export const useEvents = () => useStoredState(STORAGE_KEYS.events, MOCK_EVENTS);

export const resetDemoData = () => clearStoredState(Object.values(STORAGE_KEYS));

// Genera un id incremental tipo INC-2026-0413
const nextIncidentId = (incidents) => {
  const year = new Date()?.getFullYear();
  const max = incidents?.reduce((acc, i) => Math.max(acc, Number(i?.id?.split('-')?.[2]) || 0), 0);
  return `INC-${year}-${String(max + 1)?.padStart(4, '0')}`;
};

// Tickets de emergencia con su historial de estados
export const useIncidents = () => {
  const [incidents, setIncidents] = useStoredState(STORAGE_KEYS.incidents, MOCK_INCIDENTS);

  const createIncident = useCallback((data, user) => {
    const now = new Date()?.toISOString();
    let created;
    setIncidents((prev) => {
      created = {
        id: nextIncidentId(prev),
        reportedAt: now,
        status: 'open',
        units: [],
        createdBy: user?.name,
        ...data,
        history: [{ status: 'open', at: now, by: user?.name, note: data?.historyNote || 'Ticket creado' }],
      };
      delete created.historyNote;
      return [created, ...prev];
    });
    return created;
  }, [setIncidents]);

  const updateIncident = useCallback((id, changes) => {
    setIncidents((prev) => prev?.map((i) => (i?.id === id ? { ...i, ...changes } : i)));
  }, [setIncidents]);

  const changeStatus = useCallback((id, status, user, note = null) => {
    const at = new Date()?.toISOString();
    setIncidents((prev) => prev?.map((i) => (
      i?.id === id
        ? { ...i, status, history: [...(i?.history || []), { status, at, by: user?.name, note }] }
        : i
    )));
  }, [setIncidents]);

  // Solo el jefe de bomberos dictamina si la atención fue satisfactoria o no
  const finalizeIncident = useCallback((id, result, notes, user) => {
    const at = new Date()?.toISOString();
    const label = result === 'satisfactory' ? 'Satisfactorio' : 'No satisfactorio';
    setIncidents((prev) => prev?.map((i) => (
      i?.id === id
        ? {
            ...i,
            status: 'closed',
            resolution: { result, notes, by: user?.name, at },
            history: [...(i?.history || []), { status: 'closed', at, by: user?.name, note: label }],
          }
        : i
    )));
  }, [setIncidents]);

  return { incidents, createIncident, updateIncident, changeStatus, finalizeIncident };
};
