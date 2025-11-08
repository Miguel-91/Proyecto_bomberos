import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CallerInformationForm = ({ callerInfo, onCallerInfoChange, onLocationValidate }) => {
  const [localInfo, setLocalInfo] = useState({
    name: '',
    phone: '',
    address: '',
    additionalInfo: '',
    callStatus: 'En línea',
    ...callerInfo
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setLocalInfo({ ...localInfo, ...callerInfo });
  }, [callerInfo]);

  const handleChange = (field, value) => {
    const updated = { ...localInfo, [field]: value };
    setLocalInfo(updated);
    onCallerInfoChange(updated);

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validatePhone = (phone) => {
    // Basic phone validation (accepts various formats)
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
    return phoneRegex.test(phone);
  };

  const handleValidateLocation = async () => {
    setIsValidating(true);

    try {
      // Simulate geocoding API call
      // In production, you would use Google Maps Geocoding API or similar
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockLocation = {
        lat: -34.6037 + (Math.random() - 0.5) * 0.1,
        lng: -58.3816 + (Math.random() - 0.5) * 0.1,
        formatted_address: localInfo.address,
        verified: true
      };

      onLocationValidate(mockLocation);

    } catch (error) {
      console.error('Error validating location:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!localInfo.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!localInfo.phone?.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!validatePhone(localInfo.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (!localInfo.address?.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Información del Llamante
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            localInfo.callStatus === 'En línea' ? 'bg-success animate-pulse' : 'bg-muted'
          }`}></div>
          <span className="text-sm text-muted-foreground">{localInfo.callStatus}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Caller Name */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Nombre del Llamante <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            value={localInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ingrese el nombre completo"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Número de Teléfono <span className="text-destructive">*</span>
          </label>
          <Input
            type="tel"
            value={localInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+54 9 11 1234-5678"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-xs text-destructive mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Dirección de la Emergencia <span className="text-destructive">*</span>
          </label>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={localInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Calle, número, ciudad"
              className={`flex-1 ${errors.address ? 'border-destructive' : ''}`}
            />
            <Button
              variant="outline"
              onClick={handleValidateLocation}
              disabled={!localInfo.address || isValidating}
            >
              {isValidating ? '🔄' : '📍'} Validar
            </Button>
          </div>
          {errors.address && (
            <p className="text-xs text-destructive mt-1">{errors.address}</p>
          )}
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Información Adicional
          </label>
          <textarea
            value={localInfo.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            placeholder="Detalles adicionales sobre el llamante o la ubicación..."
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Call Status Selector */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Estado de la Llamada
          </label>
          <select
            value={localInfo.callStatus}
            onChange={(e) => handleChange('callStatus', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="En línea">En línea</option>
            <option value="En espera">En espera</option>
            <option value="Transferida">Transferida</option>
            <option value="Finalizada">Finalizada</option>
          </select>
        </div>

        {/* Quick Info Summary */}
        <div className="bg-muted/50 rounded-md p-3 mt-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Resumen Rápido</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Nombre:</span>
              <span className="ml-2 text-foreground">{localInfo.name || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Teléfono:</span>
              <span className="ml-2 text-foreground">{localInfo.phone || '-'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Dirección:</span>
              <span className="ml-2 text-foreground">{localInfo.address || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallerInformationForm;
