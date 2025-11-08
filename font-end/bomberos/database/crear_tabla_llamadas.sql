-- =====================================================
-- TABLA: llamadas_emergencia
-- Sistema de Gestión de Emergencias - Bomberos
-- =====================================================

CREATE TABLE llamadas_emergencia (
  id BIGSERIAL PRIMARY KEY,
  nombre_llamante TEXT,
  telefono_llamante TEXT,
  direccion_llamante TEXT,
  tipo_emergencia TEXT,
  prioridad TEXT,
  descripcion TEXT,
  transcripcion JSONB,
  ubicacion_latitud DECIMAL(10, 8),
  ubicacion_longitud DECIMAL(11, 8),
  estado TEXT DEFAULT 'activa',
  nivel_riesgo TEXT,
  recursos_necesarios TEXT,
  unidades_estimadas INTEGER,
  tiempo_estimado TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_llamadas_estado ON llamadas_emergencia(estado);
CREATE INDEX idx_llamadas_prioridad ON llamadas_emergencia(prioridad);
CREATE INDEX idx_llamadas_fecha ON llamadas_emergencia(fecha_creacion);
CREATE INDEX idx_llamadas_tipo ON llamadas_emergencia(tipo_emergencia);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_fecha
BEFORE UPDATE ON llamadas_emergencia
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

-- =====================================================
-- TABLA: reportes_emergencia (Opcional - para PDFs)
-- =====================================================

CREATE TABLE reportes_emergencia (
  id BIGSERIAL PRIMARY KEY,
  llamada_id BIGINT REFERENCES llamadas_emergencia(id) ON DELETE CASCADE,
  nombre_archivo TEXT,
  url_pdf TEXT,
  fecha_generacion TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios para documentación
COMMENT ON TABLE llamadas_emergencia IS 'Registro de todas las llamadas de emergencia recibidas';
COMMENT ON COLUMN llamadas_emergencia.nombre_llamante IS 'Nombre completo de la persona que llama';
COMMENT ON COLUMN llamadas_emergencia.telefono_llamante IS 'Número de teléfono del llamante';
COMMENT ON COLUMN llamadas_emergencia.direccion_llamante IS 'Dirección donde ocurre la emergencia';
COMMENT ON COLUMN llamadas_emergencia.tipo_emergencia IS 'Tipo: incendio, rescate, accidente, medica, etc.';
COMMENT ON COLUMN llamadas_emergencia.prioridad IS 'Nivel de prioridad: critical, high, medium, low';
COMMENT ON COLUMN llamadas_emergencia.transcripcion IS 'Transcripción completa de la llamada en formato JSON';
COMMENT ON COLUMN llamadas_emergencia.estado IS 'Estado actual: activa, completada, finalizada';
