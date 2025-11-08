-- =====================================================
-- MIGRACIÓN: Agregar campos faltantes a ticket_emergencia
-- =====================================================

-- Agregar campos para tipo y clasificación de emergencia
ALTER TABLE ticket_emergencia
ADD COLUMN IF NOT EXISTS tipo_emergencia VARCHAR(50),
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS transcripcion JSONB;

-- Agregar campos para ubicación GPS
ALTER TABLE ticket_emergencia
ADD COLUMN IF NOT EXISTS ubicacion_latitud DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS ubicacion_longitud DECIMAL(11, 8);

-- Agregar campos para gestión de recursos
ALTER TABLE ticket_emergencia
ADD COLUMN IF NOT EXISTS nivel_riesgo VARCHAR(50),
ADD COLUMN IF NOT EXISTS recursos_necesarios VARCHAR(100),
ADD COLUMN IF NOT EXISTS unidades_estimadas INTEGER,
ADD COLUMN IF NOT EXISTS tiempo_estimado VARCHAR(20);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ticket_estado ON ticket_emergencia(estado);
CREATE INDEX IF NOT EXISTS idx_ticket_prioridad ON ticket_emergencia(prioridad);
CREATE INDEX IF NOT EXISTS idx_ticket_fecha ON ticket_emergencia(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_ticket_tipo ON ticket_emergencia(tipo_emergencia);

-- Comentarios para documentación
COMMENT ON COLUMN ticket_emergencia.tipo_emergencia IS 'Tipo: incendio, rescate, accidente, medica, etc.';
COMMENT ON COLUMN ticket_emergencia.descripcion IS 'Descripción detallada de la emergencia';
COMMENT ON COLUMN ticket_emergencia.transcripcion IS 'Transcripción completa de la llamada en formato JSON';
COMMENT ON COLUMN ticket_emergencia.ubicacion_latitud IS 'Latitud GPS de la emergencia';
COMMENT ON COLUMN ticket_emergencia.ubicacion_longitud IS 'Longitud GPS de la emergencia';

-- Verificar que se agregaron los campos
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ticket_emergencia'
ORDER BY ordinal_position;
