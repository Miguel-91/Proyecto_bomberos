# 📊 Usar tu Tabla Existente: ticket_emergencia

## ✅ Buenas Noticias

No necesitas crear una nueva tabla. El sistema está configurado para usar tu tabla existente `ticket_emergencia`.

---

## 🔧 PASO 1: Agregar Campos Faltantes (RECOMENDADO)

Tu tabla actual tiene estos campos básicos, pero para aprovechar TODAS las funcionalidades (transcripción de voz, GPS, etc.), necesitas agregar algunos campos:

### Ejecuta este script en Supabase:

1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido de `migrar_ticket_emergencia.sql`
3. Click en **Run** ▶️

Esto agregará:
- `tipo_emergencia` - Tipo de emergencia (incendio, rescate, etc.)
- `descripcion` - Descripción detallada
- `transcripcion` - Transcripción de audio (JSONB)
- `ubicacion_latitud` y `ubicacion_longitud` - Coordenadas GPS
- `nivel_riesgo` - Nivel de riesgo
- `recursos_necesarios` - Recursos necesarios
- `unidades_estimadas` - Número de unidades
- `tiempo_estimado` - Tiempo estimado de respuesta

---

## 📋 MAPEO DE CAMPOS

El código está configurado para mapear automáticamente los campos:

| Campo en el Código | Campo en tu Tabla |
|-------------------|-------------------|
| `nombreLlamante` | `solicitante` |
| `telefonoLlamante` | `telefono_solicitante` |
| `direccionLlamante` | `ubicacion` |
| `prioridad` | `prioridad` (convertido 1-4) |
| `estado` | `estado` |
| `tipoEmergencia` | `tipo_emergencia` (nuevo) |
| `descripcion` | `descripcion` (nuevo) |
| `transcripcion` | `transcripcion` (nuevo) |
| `ubicacionLatitud` | `ubicacion_latitud` (nuevo) |
| `ubicacionLongitud` | `ubicacion_longitud` (nuevo) |

---

## 🔢 CONVERSIÓN DE PRIORIDAD

Tu tabla usa números (1-5), pero el código usa texto. La conversión es automática:

| Texto | Número |
|-------|--------|
| `critical` / `critica` | 1 |
| `high` / `alta` | 2 |
| `medium` / `media` | 3 |
| `low` / `baja` | 4 |

---

## 🚀 CÓMO USAR

### 1. **Ejecuta la Migración**
```sql
-- Ejecuta en Supabase SQL Editor
-- El archivo: migrar_ticket_emergencia.sql
```

### 2. **Descarga los Cambios**
```bash
cd C:\Users\Rafael\Proyecto_bomberos
git pull origin claude/new-version-help-011CUvLxkrsR6uVdvXJwKZQy
```

### 3. **Ejecuta el Proyecto**
```bash
cd font-end\bomberos
npm run dev
```

### 4. **Prueba Crear un Ticket**
- Ve a http://localhost:4028/emergency-call-intake
- Llena los campos
- Click en "Completar Llamada"
- ✅ Se guardará en tu tabla `ticket_emergencia`

---

## 📊 EJEMPLO DE CÓMO QUEDA LA TABLA

Después de la migración, tu tabla tendrá:

```
ticket_emergencia
├── id_ticket (PK)
├── solicitante
├── telefono_solicitante
├── ubicacion
├── prioridad (1-4)
├── estado (PENDIENTE, EN_PROCESO, etc.)
├── tipo_emergencia (nuevo) ✨
├── descripcion (nuevo) ✨
├── transcripcion (nuevo) ✨
├── ubicacion_latitud (nuevo) ✨
├── ubicacion_longitud (nuevo) ✨
├── nivel_riesgo (nuevo) ✨
├── recursos_necesarios (nuevo) ✨
├── unidades_estimadas (nuevo) ✨
├── tiempo_estimado (nuevo) ✨
├── fecha_creacion
├── fecha_atencion
├── id_operador_creador
├── id_jefe_asignado
├── created_at
└── updated_at
```

---

## 🔍 VERIFICAR QUE FUNCIONA

### En Supabase:
1. Ve a **Table Editor**
2. Selecciona `ticket_emergencia`
3. Deberías ver los nuevos campos

### En tu Aplicación:
1. Crea un ticket de prueba
2. Ve a Supabase Table Editor
3. Verás el ticket con todos los datos

---

## 💡 FUNCIONALIDADES DISPONIBLES

Con todos los campos agregados tendrás:

✅ Transcripción de voz automática
✅ Auto-completado de formularios desde audio
✅ Ubicación GPS
✅ Clasificación de emergencias
✅ Generación de reportes PDF
✅ Gestión de recursos
✅ Estadísticas en tiempo real

---

## ⚙️ MÉTODOS ADICIONALES

El servicio incluye métodos específicos para tu tabla:

```javascript
// Asignar jefe a un ticket
await ticketsEmergenciaService.asignarJefe(idTicket, idJefe);

// Marcar como atendido
await ticketsEmergenciaService.marcarComoAtendido(idTicket);

// Obtener estadísticas
const stats = await ticketsEmergenciaService.obtenerEstadisticasDelDia();
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "column does not exist"
- Ejecuta el script `migrar_ticket_emergencia.sql`

### Error: "invalid input syntax for type integer"
- La conversión de prioridad es automática, no debería pasar

### Los datos no se guardan
- Verifica las políticas RLS en Supabase
- Verifica las credenciales en `.env`

---

## 📚 MÁS INFORMACIÓN

- Servicio completo: `src/services/supabaseClient.js`
- Script de migración: `database/migrar_ticket_emergencia.sql`
- Componente principal: `src/pages/emergency-call-intake/index.jsx`

---

¿Necesitas ayuda? Todos los métodos están documentados en el código.
