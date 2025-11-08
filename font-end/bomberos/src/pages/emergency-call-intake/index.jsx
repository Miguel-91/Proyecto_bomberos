import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';

const EmergencyCallIntake = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('active-call');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              📞 Recepción de Llamadas de Emergencia
            </h1>
            <p className="text-muted-foreground">
              Sistema de gestión y clasificación de llamadas de emergencia
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-card rounded-lg border border-border p-2 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('queue')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'queue'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Cola de Llamadas
              </button>

              <button
                onClick={() => setViewMode('active-call')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'active-call'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Llamada Activa
              </button>

              <button
                onClick={() => setViewMode('ai-assistant')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'ai-assistant'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Asistente IA
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Call Information Card */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Información de la Llamada
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Nombre del llamante
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      placeholder="Ingrese el nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Número de teléfono
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      placeholder="Ingrese el teléfono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Dirección de la emergencia
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      placeholder="Ingrese la dirección"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Classification */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Clasificación de Emergencia
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Tipo de Emergencia
                    </label>
                    <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                      <option>Incendio</option>
                      <option>Rescate</option>
                      <option>Accidente</option>
                      <option>Médica</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Prioridad
                    </label>
                    <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                      <option>Crítica</option>
                      <option>Alta</option>
                      <option>Media</option>
                      <option>Baja</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics Card */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Llamadas en espera</span>
                    <span className="text-lg font-bold text-foreground">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Atendidas hoy</span>
                    <span className="text-lg font-bold text-foreground">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tiempo promedio</span>
                    <span className="text-lg font-bold text-foreground">2:30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado IA</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm text-foreground">Activo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <Button variant="default" className="w-full">
                    🚒 Despachar Unidades
                  </Button>
                  <Button variant="outline" className="w-full">
                    📋 Crear Incidente
                  </Button>
                  <Button variant="outline" className="w-full">
                    📞 Transferir Llamada
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    ⬅️ Volver al Login
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Nota:</strong> Esta es una versión simplificada del módulo de recepción de llamadas.
              Los componentes completos con IA, mapas, transcripción en tiempo real y más funcionalidades
              pueden ser desarrollados según tus necesidades.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmergencyCallIntake;
