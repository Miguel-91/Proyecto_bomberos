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

export const MOCK_INCIDENTS = [
  { id: 'INC-2026-0412', type: 'fire', priority: 'critical', address: 'Calle del Arco, Antigua Guatemala', reportedAt: '2026-10-25T08:12:00', status: 'active', units: ['U-01', 'U-04'], description: 'Incendio en cocina de restaurante, humo visible desde la calle.' },
  { id: 'INC-2026-0411', type: 'medical', priority: 'high', address: '5a Avenida Norte, Antigua Guatemala', reportedAt: '2026-10-25T07:40:00', status: 'active', units: ['U-02'], description: 'Persona adulta con dolor torácico.' },
  { id: 'INC-2026-0410', type: 'traffic', priority: 'medium', address: 'Carretera a Ciudad Vieja, km 2', reportedAt: '2026-10-24T22:05:00', status: 'closed', units: ['U-03', 'U-05'], description: 'Colisión entre motocicleta y vehículo liviano, dos heridos leves.' },
  { id: 'INC-2026-0409', type: 'rescue', priority: 'high', address: 'Cerro de la Cruz, Antigua Guatemala', reportedAt: '2026-10-24T17:30:00', status: 'closed', units: ['U-05'], description: 'Turista con lesión en tobillo durante caminata.' },
  { id: 'INC-2026-0408', type: 'medical', priority: 'low', address: 'Jocotenango, Sacatepéquez', reportedAt: '2026-10-24T11:15:00', status: 'pending', units: [], description: 'Traslado programado de paciente a hospital nacional.' },
];

export const INCIDENT_STATUS = {
  active: { label: 'En curso', className: 'bg-destructive/10 text-destructive' },
  pending: { label: 'Pendiente', className: 'bg-warning/10 text-warning' },
  closed: { label: 'Cerrado', className: 'bg-success/10 text-success' },
};

export const formatDateTime = (iso) =>
  new Date(iso)?.toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
