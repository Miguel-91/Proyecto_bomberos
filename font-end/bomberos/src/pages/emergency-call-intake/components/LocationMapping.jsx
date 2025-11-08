import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const LocationMapping = ({ location, onLocationUpdate, nearbyUnits }) => {
  const [manualCoords, setManualCoords] = useState({
    lat: location?.lat || '',
    lng: location?.lng || ''
  });

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            verified: true,
            source: 'gps'
          };
          onLocationUpdate(newLocation);
          setManualCoords({ lat: newLocation.lat, lng: newLocation.lng });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('No se pudo obtener la ubicación GPS');
        }
      );
    } else {
      alert('Geolocalización no soportada por este navegador');
    }
  };

  const handleManualUpdate = () => {
    if (manualCoords.lat && manualCoords.lng) {
      onLocationUpdate({
        lat: parseFloat(manualCoords.lat),
        lng: parseFloat(manualCoords.lng),
        verified: false,
        source: 'manual'
      });
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Mapa de Ubicación</h3>
        {location?.verified && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
            ✓ Verificada
          </span>
        )}
      </div>

      {/* Map Placeholder */}
      <div className="bg-muted/50 rounded-lg h-64 mb-4 flex items-center justify-center relative overflow-hidden">
        {location?.lat && location?.lng ? (
          <div className="text-center">
            <div className="text-6xl mb-2">📍</div>
            <p className="text-sm text-foreground font-medium">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {location.formatted_address || 'Ubicación marcada'}
            </p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm">No hay ubicación seleccionada</p>
            <p className="text-xs mt-1">Use GPS o ingrese coordenadas manualmente</p>
          </div>
        )}

        {/* Nearby Units Overlay */}
        {nearbyUnits && nearbyUnits.length > 0 && (
          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <p className="text-xs font-medium text-foreground mb-1">Unidades Cercanas</p>
            <div className="space-y-1">
              {nearbyUnits.map((unit, index) => (
                <div key={index} className="flex items-center space-x-2 text-[10px]">
                  <span className="text-green-500">●</span>
                  <span className="text-foreground">{unit.name}</span>
                  <span className="text-muted-foreground">{unit.distance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location Controls */}
      <div className="space-y-3">
        <Button
          variant="default"
          onClick={handleUseCurrentLocation}
          className="w-full"
        >
          📡 Usar Ubicación GPS
        </Button>

        {/* Manual Coordinates */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs font-medium text-foreground mb-2">Coordenadas Manuales</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitud"
              value={manualCoords.lat}
              onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
              className="px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitud"
              value={manualCoords.lng}
              onChange={(e) => setManualCoords({ ...manualCoords, lng: e.target.value })}
              className="px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualUpdate}
            disabled={!manualCoords.lat || !manualCoords.lng}
            className="w-full mt-2"
          >
            Actualizar Ubicación
          </Button>
        </div>

        {/* Location Info */}
        {location && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
              Información de Ubicación
            </p>
            <div className="space-y-1 text-[10px] text-blue-700 dark:text-blue-300">
              <div className="flex justify-between">
                <span>Latitud:</span>
                <span className="font-mono">{location.lat}</span>
              </div>
              <div className="flex justify-between">
                <span>Longitud:</span>
                <span className="font-mono">{location.lng}</span>
              </div>
              <div className="flex justify-between">
                <span>Fuente:</span>
                <span>{location.source === 'gps' ? '📡 GPS' : '✍️ Manual'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMapping;
