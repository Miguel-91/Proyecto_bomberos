import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CallerInformationForm = ({ callerInfo, onCallerInfoChange, onLocationValidate }) => {
  const handleChange = (field) => (e) => {
    onCallerInfoChange({ ...callerInfo, [field]: e?.target?.value });
  };

  const handleValidateLocation = () => {
    if (!callerInfo?.address) return;
    onLocationValidate({
      address: callerInfo?.address,
      validated: true,
      validatedAt: new Date()?.toISOString()
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="User" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Información del Llamante</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">
          {callerInfo?.callStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          placeholder="Nombre del llamante"
          value={callerInfo?.name}
          onChange={handleChange('name')}
        />
        <Input
          label="Teléfono"
          type="tel"
          placeholder="Ej. 5555-1234"
          value={callerInfo?.phone}
          onChange={handleChange('phone')}
        />
        <div className="md:col-span-2 flex items-end space-x-2">
          <div className="flex-1">
            <Input
              label="Dirección del incidente"
              placeholder="Ej. 5a Avenida Norte #12, Antigua Guatemala"
              value={callerInfo?.address}
              onChange={handleChange('address')}
              required
            />
          </div>
          <Button
            variant="outline"
            iconName="MapPin"
            onClick={handleValidateLocation}
            disabled={!callerInfo?.address}
          >
            Validar
          </Button>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground">Información adicional</label>
          <textarea
            className="mt-2 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Referencias, puntos de acceso, número de personas afectadas..."
            value={callerInfo?.additionalInfo}
            onChange={handleChange('additionalInfo')}
          />
        </div>
      </div>
    </div>
  );
};

export default CallerInformationForm;
