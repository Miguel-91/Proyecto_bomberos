import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Credenciales de Supabase no encontradas en las variables de entorno');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Servicio de Llamadas de Emergencia
export const llamadasEmergenciaService = {
  // Crear una nueva llamada de emergencia
  async crearLlamada(datosLlamada) {
    const { data, error } = await supabase
      .from('llamadas_emergencia')
      .insert([{
        nombre_llamante: datosLlamada.nombreLlamante,
        telefono_llamante: datosLlamada.telefonoLlamante,
        direccion_llamante: datosLlamada.direccionLlamante,
        tipo_emergencia: datosLlamada.tipoEmergencia,
        prioridad: datosLlamada.prioridad,
        descripcion: datosLlamada.descripcion,
        transcripcion: datosLlamada.transcripcion,
        ubicacion_latitud: datosLlamada.ubicacionLatitud,
        ubicacion_longitud: datosLlamada.ubicacionLongitud,
        estado: datosLlamada.estado || 'activa',
        nivel_riesgo: datosLlamada.nivelRiesgo,
        recursos_necesarios: datosLlamada.recursosNecesarios,
        unidades_estimadas: datosLlamada.unidadesEstimadas,
        tiempo_estimado: datosLlamada.tiempoEstimado
      }])
      .select();

    if (error) {
      console.error('Error al crear llamada:', error);
      throw error;
    }
    return data[0];
  },

  // Obtener todas las llamadas con filtros opcionales
  async obtenerTodasLasLlamadas(filtros = {}) {
    let query = supabase
      .from('llamadas_emergencia')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros.prioridad) {
      query = query.eq('prioridad', filtros.prioridad);
    }

    if (filtros.tipoEmergencia) {
      query = query.eq('tipo_emergencia', filtros.tipoEmergencia);
    }

    if (filtros.fechaDesde) {
      query = query.gte('fecha_creacion', filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      query = query.lte('fecha_creacion', filtros.fechaHasta);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener llamadas:', error);
      throw error;
    }
    return data;
  },

  // Obtener una llamada específica por ID
  async obtenerLlamadaPorId(id) {
    const { data, error } = await supabase
      .from('llamadas_emergencia')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener llamada:', error);
      throw error;
    }
    return data;
  },

  // Actualizar una llamada existente
  async actualizarLlamada(id, actualizaciones) {
    const { data, error } = await supabase
      .from('llamadas_emergencia')
      .update(actualizaciones)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al actualizar llamada:', error);
      throw error;
    }
    return data[0];
  },

  // Eliminar una llamada
  async eliminarLlamada(id) {
    const { error } = await supabase
      .from('llamadas_emergencia')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar llamada:', error);
      throw error;
    }
    return true;
  },

  // Agregar entrada a la transcripción
  async agregarEntradaTranscripcion(idLlamada, entrada) {
    const llamada = await this.obtenerLlamadaPorId(idLlamada);
    const transcripcion = llamada.transcripcion || [];
    transcripcion.push(entrada);

    return this.actualizarLlamada(idLlamada, { transcripcion });
  },

  // Obtener estadísticas del día
  async obtenerEstadisticasDelDia() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('llamadas_emergencia')
      .select('id, estado, prioridad, tipo_emergencia')
      .gte('fecha_creacion', hoy.toISOString());

    if (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }

    return {
      total: data.length,
      activas: data.filter(l => l.estado === 'activa').length,
      completadas: data.filter(l => l.estado === 'completada').length,
      porTipo: data.reduce((acc, l) => {
        acc[l.tipo_emergencia] = (acc[l.tipo_emergencia] || 0) + 1;
        return acc;
      }, {}),
      porPrioridad: data.reduce((acc, l) => {
        acc[l.prioridad] = (acc[l.prioridad] || 0) + 1;
        return acc;
      }, {})
    };
  }
};

// Servicio de Reportes
export const reportesService = {
  async crearReporte(datosReporte) {
    const { data, error } = await supabase
      .from('reportes_emergencia')
      .insert([datosReporte])
      .select();

    if (error) {
      console.error('Error al crear reporte:', error);
      throw error;
    }
    return data[0];
  },

  async obtenerReportesPorLlamada(idLlamada) {
    const { data, error } = await supabase
      .from('reportes_emergencia')
      .select('*')
      .eq('llamada_id', idLlamada);

    if (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
    return data;
  }
};

export default supabase;
