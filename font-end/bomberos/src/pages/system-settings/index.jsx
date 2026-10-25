import React from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { APP_NAME, ORGANIZATION, EMERGENCY_NUMBERS } from '../../utils/brand';
import { USERS, ROLES, PERMISSION_LABELS } from '../../utils/auth';
import { resetDemoData } from '../../utils/dataStore';
import { STORAGE_KEYS } from '../../utils/emergencyData';

const SystemSettings = () => {
  const handleExport = () => {
    const data = Object.fromEntries(
      Object.entries(STORAGE_KEYS)?.map(([name, key]) => [name, JSON.parse(localStorage.getItem(key) || 'null')])
    );
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `respaldo-emergencias-${new Date()?.toISOString()?.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    if (window.confirm('Se borrarán los tickets, personal, turnos y actividades guardados en este navegador y se cargarán los datos de ejemplo. ¿Continuar?')) {
      resetDemoData();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Configuración del Sistema</h1>
            <p className="text-muted-foreground">{APP_NAME} · {ORGANIZATION}</p>
          </div>

          {/* Users and roles */}
          <section className="bg-card rounded-lg border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Usuarios y Permisos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USERS?.map((u) => {
                const role = ROLES?.[u?.role];
                const permissions = role?.permissions?.includes('*') ? Object.keys(PERMISSION_LABELS) : role?.permissions;
                return (
                  <div key={u?.username} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-foreground">{role?.label}</div>
                        <div className="text-sm text-muted-foreground">Usuario: <span className="font-mono">{u?.username}</span> · {u?.name}</div>
                      </div>
                      <Icon name="UserCog" size={20} className="text-primary" />
                    </div>
                    <p className="text-sm text-foreground mb-2">{role?.description}</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {permissions?.map((p) => (
                        <li key={p} className="flex items-center space-x-1">
                          <Icon name="Check" size={12} className="text-success" />
                          <span>{PERMISSION_LABELS?.[p]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Las contraseñas se cambian en <span className="font-mono">src/utils/auth.js</span>. Para producción se recomienda un
              servidor de autenticación (por ejemplo Supabase Auth).
            </p>
          </section>

          {/* Emergency numbers */}
          <section className="bg-card rounded-lg border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Números de Emergencia</h2>
            <div className="flex flex-wrap gap-4">
              {EMERGENCY_NUMBERS?.map((n) => (
                <div key={n?.number} className="flex items-center space-x-2 text-sm">
                  <Icon name="Phone" size={16} className="text-destructive" />
                  <span className="font-bold text-foreground">{n?.number}</span>
                  <span className="text-muted-foreground">{n?.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Data */}
          <section className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Datos del Sistema</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Los tickets, personal, turnos y actividades se guardan en este navegador.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" iconName="Download" onClick={handleExport}>Descargar respaldo (JSON)</Button>
              <Button variant="destructive" iconName="RotateCcw" onClick={handleReset}>Restablecer datos de ejemplo</Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SystemSettings;
