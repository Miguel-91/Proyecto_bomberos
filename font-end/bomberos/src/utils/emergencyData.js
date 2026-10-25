// Catálogos y datos de ejemplo compartidos entre páginas.
// Cuando exista un backend, reemplazar los datos mock por llamadas a la API.

export const EMERGENCY_TYPES = [
  { value: 'fire', label: 'Incendio', icon: 'Flame' },
  { value: 'medical', label: 'Emergencia médica', icon: 'HeartPulse' },
  { value: 'traffic', label: 'Accidente de tránsito', icon: 'Car' },
  { value: 'rescue', label: 'Rescate', icon: 'LifeBuoy' },
  { value: 'hazmat', label: 'Materiales peligrosos', icon: 'Biohazard' },
  { value: 'natural', label: 'Desastre natural', icon: 'Mountain' },
  { value: 'other', label: 'Otro', icon: 'AlertCircle' },
];

export const PRIORITIES = [
  { value: 'critical', label: 'Crítica', className: 'bg-destructive/10 text-destructive' },
  { value: 'high', label: 'Alta', className: 'bg-warning/10 text-warning' },
  { value: 'medium', label: 'Media', className: 'bg-primary/10 text-primary' },
  { value: 'low', label: 'Baja', className: 'bg-success/10 text-success' },
];

export const getEmergencyType = (value) =>
  EMERGENCY_TYPES?.find((t) => t?.value === value) || { value, label: value || 'Sin clasificar', icon: 'AlertCircle' };

export const getPriority = (value) =>
  PRIORITIES?.find((p) => p?.value === value) || { value, label: 'Sin prioridad', className: 'bg-muted text-muted-foreground' };

export const UNIT_STATUS = {
  available: { label: 'Disponible', className: 'bg-success/10 text-success' },
  dispatched: { label: 'En servicio', className: 'bg-destructive/10 text-destructive' },
  returning: { label: 'Regresando', className: 'bg-warning/10 text-warning' },
  maintenance: { label: 'Mantenimiento', className: 'bg-muted text-muted-foreground' },
};

export const MOCK_UNITS = [
  { id: 'U-01', name: 'Autobomba 01', type: 'Autobomba', station: 'Estación Central Antigua', status: 'available', crew: 5, fuel: 92, lastService: '2026-09-28' },
  { id: 'U-02', name: 'Ambulancia 12', type: 'Ambulancia', station: 'Estación Central Antigua', status: 'dispatched', crew: 3, fuel: 64, lastService: '2026-10-02' },
  { id: 'U-03', name: 'Ambulancia 15', type: 'Ambulancia', station: 'Subestación Jocotenango', status: 'available', crew: 3, fuel: 81, lastService: '2026-09-15' },
  { id: 'U-04', name: 'Cisterna 03', type: 'Cisterna', station: 'Estación Central Antigua', status: 'maintenance', crew: 2, fuel: 40, lastService: '2026-10-20' },
  { id: 'U-05', name: 'Unidad de Rescate 07', type: 'Rescate', station: 'Subestación Ciudad Vieja', status: 'returning', crew: 4, fuel: 55, lastService: '2026-08-30' },
  { id: 'U-06', name: 'Ambulancia 18', type: 'Ambulancia', station: 'Subestación San Felipe', status: 'available', crew: 3, fuel: 88, lastService: '2026-10-10' },
];

export const MOCK_EQUIPMENT = [
  { id: 'E-01', name: 'Equipos de respiración autónoma', quantity: 18, available: 14, minimum: 10 },
  { id: 'E-02', name: 'Trajes de bombero (estructural)', quantity: 30, available: 22, minimum: 20 },
  { id: 'E-03', name: 'Desfibriladores (DEA)', quantity: 6, available: 5, minimum: 4 },
  { id: 'E-04', name: 'Mangueras 2½"', quantity: 40, available: 31, minimum: 25 },
  { id: 'E-05', name: 'Camillas rígidas', quantity: 10, available: 6, minimum: 8 },
  { id: 'E-06', name: 'Kits de trauma', quantity: 15, available: 9, minimum: 10 },
];

export const MOCK_PERSONNEL = [
  { id: 'P-01', name: 'María Rodríguez', rank: 'Jefe de Compañía', specialty: 'Comando de incidentes', phone: '5555-0101', shift: 'A', status: 'on-duty' },
  { id: 'P-02', name: 'Juan Pérez', rank: 'Despachador', specialty: 'Radiocomunicaciones', phone: '5555-0102', shift: 'A', status: 'on-duty' },
  { id: 'P-03', name: 'Carlos García', rank: 'Bombero Voluntario', specialty: 'Primeros auxilios', phone: '5555-0103', shift: 'B', status: 'off-duty' },
  { id: 'P-04', name: 'Ana López', rank: 'Paramédico', specialty: 'Soporte vital avanzado', phone: '5555-0104', shift: 'A', status: 'on-call' },
  { id: 'P-05', name: 'Luis Méndez', rank: 'Piloto', specialty: 'Conducción de emergencia', phone: '5555-0105', shift: 'B', status: 'off-duty' },
  { id: 'P-06', name: 'Sofía Ramírez', rank: 'Bombero Voluntario', specialty: 'Rescate vertical', phone: '5555-0106', shift: 'C', status: 'leave' },
  { id: 'P-07', name: 'Diego Castillo', rank: 'Sargento', specialty: 'Materiales peligrosos', phone: '5555-0107', shift: 'C', status: 'off-duty' },
  { id: 'P-08', name: 'Lucía Morales', rank: 'Paramédico', specialty: 'Atención prehospitalaria', phone: '5555-0108', shift: 'B', status: 'on-call' },
];

export const PERSONNEL_STATUS = {
  'on-duty': { label: 'De turno', className: 'bg-success/10 text-success' },
  'on-call': { label: 'Disponible', className: 'bg-primary/10 text-primary' },
  'off-duty': { label: 'Libre', className: 'bg-muted text-muted-foreground' },
  leave: { label: 'Permiso', className: 'bg-warning/10 text-warning' },
};

const history = (...entries) => entries?.map(([status, at, by, note]) => ({ status, at, by, note }));

export const MOCK_INCIDENTS = [
  {
    id: 'INC-2026-0412', type: 'fire', priority: 'critical', address: 'Calle del Arco, Antigua Guatemala',
    reportedAt: '2026-10-25T08:12:00', status: 'in-progress', units: ['U-01', 'U-04'],
    description: 'Incendio en cocina de restaurante, humo visible desde la calle.',
    caller: { name: 'Rosa Gómez', phone: '5521-4410' },
    history: history(['open', '2026-10-25T08:12:00', 'Juan Pérez', 'Ticket creado desde llamada'], ['in-progress', '2026-10-25T08:15:00', 'Juan Pérez', 'Autobomba 01 en camino']),
  },
  {
    id: 'INC-2026-0411', type: 'medical', priority: 'high', address: '5a Avenida Norte, Antigua Guatemala',
    reportedAt: '2026-10-25T07:40:00', status: 'awaiting-review', units: ['U-02'],
    description: 'Persona adulta con dolor torácico. Trasladada al Hospital Pedro de Bethancourt.',
    caller: { name: 'Mario Ajú', phone: '4478-2201' },
    history: history(['open', '2026-10-25T07:40:00', 'Juan Pérez', 'Ticket creado desde llamada'], ['in-progress', '2026-10-25T07:42:00', 'Juan Pérez', null], ['awaiting-review', '2026-10-25T08:30:00', 'Juan Pérez', 'Paciente entregado en hospital']),
  },
  {
    id: 'INC-2026-0410', type: 'traffic', priority: 'medium', address: 'Carretera a Ciudad Vieja, km 2',
    reportedAt: '2026-10-24T22:05:00', status: 'closed', units: ['U-03', 'U-05'],
    description: 'Colisión entre motocicleta y vehículo liviano, dos heridos leves.',
    history: history(['open', '2026-10-24T22:05:00', 'Juan Pérez', null], ['in-progress', '2026-10-24T22:07:00', 'Juan Pérez', null], ['closed', '2026-10-24T23:40:00', 'María Rodríguez', 'Satisfactorio']),
    resolution: { result: 'satisfactory', notes: 'Heridos atendidos en el lugar, vía despejada.', by: 'María Rodríguez', at: '2026-10-24T23:40:00' },
  },
  {
    id: 'INC-2026-0409', type: 'rescue', priority: 'high', address: 'Cerro de la Cruz, Antigua Guatemala',
    reportedAt: '2026-10-24T17:30:00', status: 'closed', units: ['U-05'],
    description: 'Turista con lesión en tobillo durante caminata.',
    history: history(['open', '2026-10-24T17:30:00', 'Juan Pérez', null], ['closed', '2026-10-24T19:10:00', 'María Rodríguez', 'No satisfactorio']),
    resolution: { result: 'unsatisfactory', notes: 'Demora de 25 minutos por acceso bloqueado; revisar ruta alterna.', by: 'María Rodríguez', at: '2026-10-24T19:10:00' },
  },
  {
    id: 'INC-2026-0408', type: 'medical', priority: 'low', address: 'Jocotenango, Sacatepéquez',
    reportedAt: '2026-10-24T11:15:00', status: 'open', units: [],
    description: 'Traslado programado de paciente a hospital nacional.',
    history: history(['open', '2026-10-24T11:15:00', 'Juan Pérez', null]),
  },
];

// Flujo del ticket: Abierto -> En atención -> Pendiente de dictamen -> Finalizado (solo jefe)
export const INCIDENT_STATUS = {
  open: { label: 'Abierto', className: 'bg-warning/10 text-warning', icon: 'CircleDot' },
  'in-progress': { label: 'En atención', className: 'bg-destructive/10 text-destructive', icon: 'Siren' },
  'awaiting-review': { label: 'Pendiente de dictamen', className: 'bg-primary/10 text-primary', icon: 'ClipboardCheck' },
  closed: { label: 'Finalizado', className: 'bg-success/10 text-success', icon: 'CheckCircle2' },
};

export const RESOLUTION_RESULTS = {
  satisfactory: { label: 'Satisfactorio', className: 'text-success', icon: 'ThumbsUp' },
  unsatisfactory: { label: 'No satisfactorio', className: 'text-destructive', icon: 'ThumbsDown' },
};

export const DEFAULT_SHIFTS = [
  { id: 'A', name: 'Turno A', start: '07:00', end: '19:00', notes: 'Turno diurno' },
  { id: 'B', name: 'Turno B', start: '19:00', end: '07:00', notes: 'Turno nocturno' },
  { id: 'C', name: 'Turno C', start: '07:00', end: '19:00', notes: 'Reserva / fines de semana' },
];

export const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DEFAULT_ROTATION = ['A', 'B', 'C', 'A', 'B', 'C', 'A'];

export const EVENT_CATEGORIES = {
  religious: { label: 'Religiosa', icon: 'Church' },
  patronal: { label: 'Patronal / Feria', icon: 'PartyPopper' },
  cultural: { label: 'Cultural', icon: 'Music' },
  sports: { label: 'Deportiva', icon: 'Trophy' },
  other: { label: 'Otra', icon: 'CalendarDays' },
};

// Plantillas de actividades frecuentes en Antigua Guatemala
export const EVENT_PRESETS = [
  { name: 'Procesión de Semana Santa', category: 'religious', location: 'Recorrido procesional, centro histórico', attendance: 15000 },
  { name: 'Feria de Santiago Apóstol', category: 'patronal', location: 'Parque Central y Catedral', attendance: 8000 },
  { name: 'Procesión de Corpus Christi', category: 'religious', location: 'Catedral de San José', attendance: 3000 },
  { name: 'Quema del Diablo', category: 'cultural', location: 'Barrios del centro histórico', attendance: 5000 },
];

export const MOCK_EVENTS = [
  {
    id: 'EV-01', name: 'Procesión de Jesús Nazareno de La Merced', category: 'religious', date: '2026-11-08',
    start: '14:00', end: '23:00', location: 'Iglesia La Merced, 6a Avenida Norte', attendance: 6000,
    assigned: ['P-01', 'P-04', 'P-05', 'P-07'], notes: 'Ambulancia fija en la esquina de La Merced.',
  },
];

// Personal sugerido: 1 elemento por cada 500 asistentes (mínimo 2)
export const suggestedStaff = (attendance) => Math.max(2, Math.ceil((Number(attendance) || 0) / 500));

export const STORAGE_KEYS = {
  incidents: 'emergencyIncidents',
  personnel: 'emergencyPersonnel',
  units: 'emergencyUnits',
  shifts: 'emergencyShifts',
  rotation: 'emergencyRotation',
  events: 'emergencyEvents',
};

export const formatDateTime = (iso) =>
  new Date(iso)?.toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
