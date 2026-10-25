import React, { useState } from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';
import { LOGO_SRC, ORGANIZATION } from '../../utils/brand';

// Logo de los Bomberos Voluntarios de Guatemala.
// Si la imagen no existe, muestra un ícono de llama como respaldo.
const BrandLogo = ({ size = 48, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn('bg-accent rounded-full flex items-center justify-center', className)}
        style={{ width: size, height: size }}
      >
        <Icon name="Flame" size={Math.round(size * 0.6)} color="white" />
      </div>
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt={`Logo ${ORGANIZATION}`}
      width={size}
      height={size}
      className={cn('object-contain', className)}
      style={{ width: size, height: size }}
      onError={() => setHasError(true)}
    />
  );
};

export default BrandLogo;
