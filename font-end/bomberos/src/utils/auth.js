// Usuarios, roles y permisos del sistema.
// IMPORTANTE: mientras no exista un backend, estas credenciales viven en el código del
// navegador. Para producción deben validarse en un servidor (por ejemplo Supabase Auth).

export const ROLES = {
  admin: {
    label: 'Administrador',
    description: 'Configuración del sistema',
    permissions: ['*'],
  },
  chief: {
    label: 'Jefe de Bomberos',
    description: 'Supervisión y gestión de recursos',
    permissions: [
      'dashboard.view',
      'emergencies.manage',
      'incidents.view',
      'incidents.update',
      'incidents.finalize',
      'resources.view',
      'resources.manage',
      'personnel.view',
      'personnel.manage',
      'shifts.manage',
    ],
  },
  dispatcher: {
    label: 'Despachador',
    description: 'Acceso completo al sistema de emergencias',
    permissions: [
      'dashboard.view',
      'emergencies.manage',
      'incidents.view',
      'incidents.update',
      'resources.view',
      'personnel.view',
    ],
  },
  volunteer: {
    label: 'Bombero Voluntario',
    description: 'Acceso básico y actualización de estado',
    permissions: [
      'dashboard.view',
      'incidents.view',
      'personnel.view',
      'personnel.updateOwnStatus',
    ],
  },
};

export const PERMISSION_LABELS = {
  'dashboard.view': 'Ver panel de control',
  'emergencies.manage': 'Atender llamadas y crear tickets',
  'incidents.view': 'Ver tickets de emergencia',
  'incidents.update': 'Actualizar estado de tickets',
  'incidents.finalize': 'Finalizar tickets (dictamen)',
  'resources.view': 'Ver recursos',
  'resources.manage': 'Gestionar recursos',
  'personnel.view': 'Ver personal',
  'personnel.manage': 'Agregar o quitar personal',
  'shifts.manage': 'Crear y modificar turnos',
  'personnel.updateOwnStatus': 'Actualizar su propio estado',
  'settings.manage': 'Configuración del sistema',
};

export const USERS = [
  { username: 'ADMIN', password: 'Cuerpobomberos2026@', role: 'admin', name: 'Administrador del Sistema' },
  { username: 'Jefe de Bombero', password: 'Jefe2026@', role: 'chief', name: 'María Rodríguez', personnelId: 'P-01' },
  { username: 'Despachador', password: 'Voluntariado2026@', role: 'dispatcher', name: 'Juan Pérez', personnelId: 'P-02' },
  { username: 'Bombero', password: 'Bombero1@', role: 'volunteer', name: 'Carlos García', personnelId: 'P-03' },
];

// El usuario no distingue mayúsculas ni espacios extra; la contraseña sí es exacta.
const normalizeUsername = (value) => value?.trim()?.replace(/\s+/g, ' ')?.toLowerCase();

export const authenticate = (username, password) =>
  USERS?.find((u) => normalizeUsername(u?.username) === normalizeUsername(username) && u?.password === password) || null;

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('emergencyUser') || 'null');
  } catch {
    return null;
  }
};

export const hasPermission = (user, permission) => {
  const permissions = ROLES?.[user?.role]?.permissions || [];
  return permissions?.includes('*') || permissions?.includes(permission);
};

export const getRoleLabel = (role) => ROLES?.[role]?.label || 'Usuario';
