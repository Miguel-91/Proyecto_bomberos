# 📊 Configuración de Base de Datos - Supabase

## 🗄️ Crear Tabla en Supabase

Para que el sistema funcione correctamente, necesitas crear la tabla `llamadas_emergencia` en tu base de datos Supabase.

### Pasos:

1. **Accede a tu proyecto en Supabase**
   - Ve a https://supabase.com
   - Ingresa a tu proyecto: `kzuzjlagcdlqxnusjpbj`

2. **Abre el Editor SQL**
   - En el menú lateral, haz clic en **SQL Editor**
   - Haz clic en **New Query**

3. **Copia y pega el siguiente código SQL**
   - Abre el archivo `crear_tabla_llamadas.sql`
   - Copia TODO el contenido
   - Pégalo en el editor SQL de Supabase

4. **Ejecuta el script**
   - Haz clic en el botón **Run** (▶️)
   - Espera a que aparezca el mensaje "Success"

5. **Verifica que se creó correctamente**
   - Ve a **Table Editor** en el menú lateral
   - Deberías ver la tabla `llamadas_emergencia`

---

## 📋 Estructura de la Tabla

La tabla `llamadas_emergencia` contiene los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGSERIAL | ID único (auto-incremental) |
| `nombre_llamante` | TEXT | Nombre de quien llama |
| `telefono_llamante` | TEXT | Teléfono del llamante |
| `direccion_llamante` | TEXT | Dirección de la emergencia |
| `tipo_emergencia` | TEXT | Tipo: incendio, rescate, accidente, etc. |
| `prioridad` | TEXT | Prioridad: critical, high, medium, low |
| `descripcion` | TEXT | Descripción detallada |
| `transcripcion` | JSONB | Transcripción completa en formato JSON |
| `ubicacion_latitud` | DECIMAL | Latitud GPS |
| `ubicacion_longitud` | DECIMAL | Longitud GPS |
| `estado` | TEXT | Estado: activa, completada, finalizada |
| `nivel_riesgo` | TEXT | Nivel de riesgo |
| `recursos_necesarios` | TEXT | Recursos necesarios |
| `unidades_estimadas` | INTEGER | Número de unidades a despachar |
| `tiempo_estimado` | TEXT | Tiempo estimado de respuesta |
| `fecha_creacion` | TIMESTAMPTZ | Fecha y hora de creación |
| `fecha_actualizacion` | TIMESTAMPTZ | Fecha de última actualización |

---

## 🔒 Políticas de Seguridad (RLS)

Si necesitas habilitar Row Level Security (RLS):

```sql
-- Habilitar RLS
ALTER TABLE llamadas_emergencia ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a usuarios autenticados
CREATE POLICY "Permitir lectura a usuarios autenticados"
ON llamadas_emergencia FOR SELECT
TO authenticated
USING (true);

-- Permitir inserción a usuarios autenticados
CREATE POLICY "Permitir inserción a usuarios autenticados"
ON llamadas_emergencia FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir actualización a usuarios autenticados
CREATE POLICY "Permitir actualización a usuarios autenticados"
ON llamadas_emergencia FOR UPDATE
TO authenticated
USING (true);
```

---

## ✅ Verificación

Después de crear la tabla, puedes verificar que todo funciona:

1. **Ejecuta el proyecto**:
   ```bash
   npm run dev
   ```

2. **Ve a la página de emergencias**:
   - http://localhost:4028/emergency-call-intake

3. **Completa una llamada de prueba**:
   - Llena los campos
   - Haz clic en "Completar Llamada"
   - Deberías ver: "✅ Llamada guardada exitosamente"

4. **Verifica en Supabase**:
   - Ve a **Table Editor** → `llamadas_emergencia`
   - Deberías ver tu llamada de prueba guardada

---

## 🆘 Solución de Problemas

### Error: "tabla 'llamadas_emergencia' no existe"
- Verifica que ejecutaste el script SQL completo
- Revisa que el nombre de la tabla sea exactamente: `llamadas_emergencia` (en minúsculas)

### Error: "permission denied"
- Verifica que las políticas RLS estén configuradas correctamente
- O desactiva RLS temporalmente para pruebas

### Error de conexión
- Verifica que las credenciales en `.env` sean correctas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## 📝 Notas Importantes

- La tabla usa **nombres en español** para facilitar su uso
- Los campos `fecha_creacion` y `fecha_actualizacion` se llenan automáticamente
- La transcripción se guarda en formato JSONB para búsquedas eficientes
- Los índices mejoran el rendimiento de las consultas

---

## 🔄 Actualizar la Tabla

Si necesitas modificar la tabla después de crearla:

```sql
-- Ejemplo: Agregar un nuevo campo
ALTER TABLE llamadas_emergencia
ADD COLUMN operador_id INTEGER;

-- Ejemplo: Modificar un campo
ALTER TABLE llamadas_emergencia
ALTER COLUMN descripcion TYPE TEXT;
```

---

¿Necesitas ayuda? Revisa la documentación de Supabase: https://supabase.com/docs
