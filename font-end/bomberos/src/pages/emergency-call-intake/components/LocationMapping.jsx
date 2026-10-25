import React from 'react';
import Icon from '../../../components/AppIcon';

// Centro por defecto: Parque Central de Antigua Guatemala
const DEFAULT_QUERY = 'Parque Central, Antigua Guatemala';

const LocationMapping = ({ location, onLocationUpdate, nearbyUnits = [] }) => {
  const query = location?.address ? `${location?.address}, Antigua Guatemala` : DEFAULT_QUERY;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Map" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Ubicación</h3>
        </div>
        {location?.validated ? (
          <span className="flex items-center space-x-1 text-xs text-success">
            <Icon name="CheckCircle" size={14} />
            <span>Dirección validada</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Sin validar</span>
        )}
      </div>

      <div className="rounded-md overflow-hidden border border-border">
        <iframe
          title="Mapa de la emergencia"
          src={mapSrc}
          className="w-full h-72"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="flex items-center justify-between mt-3 text-sm">
        <span className="text-muted-foreground truncate">{query}</span>
        {location?.address && (
          <button
            className="text-primary hover:underline"
            onClick={() => onLocationUpdate(null)}
          >
            Limpiar
          </button>
        )}
      </div>

      {nearbyUnits?.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {nearbyUnits?.map((unit) => (
            <li key={unit?.id} className="flex justify-between">
              <span className="text-foreground">{unit?.name}</span>
              <span className="text-muted-foreground">{unit?.distance}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationMapping;
