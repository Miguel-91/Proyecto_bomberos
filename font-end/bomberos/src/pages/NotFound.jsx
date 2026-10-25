import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import BrandLogo from '../components/ui/BrandLogo';
import { APP_NAME } from '../utils/brand';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <BrandLogo size={96} className="mx-auto mb-6" />
        <h1 className="text-7xl font-bold text-accent mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">
          La página que busca no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" iconName="ArrowLeft" onClick={() => window.history?.back()}>
            Regresar
          </Button>
          <Button iconName="Home" onClick={() => navigate('/emergency-dashboard')}>
            Ir al Panel de Control
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-8">{APP_NAME}</p>
      </div>
    </div>
  );
};

export default NotFound;
