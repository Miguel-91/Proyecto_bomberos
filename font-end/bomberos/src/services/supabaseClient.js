import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Credenciales de Supabase no encontradas en las variables de entorno');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para convertir prioridad de texto a número
const convertirPrioridadANumero = (prioridad) => {
  const mapeo = {
    'critical': 1,
    'high': 2,
    'medium': 3,
    'low': 4,
    'critica': 1,
    'alta': 2,
    'media': 3,
    'baja': 4
  };
  return mapeo[prioridad?.toLowerCase()] || 3;
};

// Helper para convertir prioridad de número a texto
const convertirPrioridadATexto = (prioridad) => {
  const mapeo = {
    1: 'critical',
    2: 'high',
    3: 'medium',
    4: 'low'
  };
  return mapeo[prioridad] || 'medium';
};

// Servicio de Tickets de Emergencia
export const ticketsEmergenciaService = {
  // Crear un nuevo ticket de emergencia
  async crearTicket(datosTicket) {
    const { data, error } = await supabase
      .from('ticket_emergencia')
      .insert([{
        solicitante: datosTicket.nombreLlamante,
        telefono_solicitante: datosTicket.telefonoLlamante,
        ubicacion: datosTicket.direccionLlamante,
        tipo_emergencia: datosTicket.tipoEmergencia,
        prioridad: convertirPrioridadANumero(datosTicket.prioridad),
        descripcion: datosTicket.descripcion,
        transcripcion: datosTicket.transcripcion,
        ubicacion_latitud: datosTicket.ubicacionLatitud,
        ubicacion_longitud: datosTicket.ubicacionLongitud,
        estado: datosTicket.estado || 'PENDIENTE',
        nivel_riesgo: datosTicket.nivelRiesgo,
        recursos_necesarios: datosTicket.recursosNecesarios,
        unidades_estimadas: datosTicket.unidadesEstimadas,
        tiempo_estimado: datosTicket.tiempoEstimado,
        fecha_creacion: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error al crear ticket:', error);
      throw error;
    }

    // Convertir el resultado a formato esperado
    const ticket = data[0];
    return {
      id: ticket.id_ticket,
      ...ticket,
      prioridad: convertirPrioridadATexto(ticket.prioridad)
    };
  },

  // Obtener todos los tickets con filtros opcionales
  async obtenerTodosLosTickets(filtros = {}) {
    let query = supabase
      .from('ticket_emergencia')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros.prioridad) {
      const prioridadNum = convertirPrioridadANumero(filtros.prioridad);
      query = query.eq('prioridad', prioridadNum);
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
      console.error('Error al obtener tickets:', error);
      throw error;
    }

    // Convertir prioridades numéricas a texto
    return data.map(ticket => ({
      ...ticket,
      id: ticket.id_ticket,
      prioridad: convertirPrioridadATexto(ticket.prioridad)
    }));
  },

  // Obtener un ticket específico por ID
  async obtenerTicketPorId(id) {
    const { data, error } = await supabase
      .from('ticket_emergencia')
      .select('*')
      .eq('id_ticket', id)
      .single();

    if (error) {
      console.error('Error al obtener ticket:', error);
      throw error;
    }

    return {
      ...data,
      id: data.id_ticket,
      prioridad: convertirPrioridadATexto(data.prioridad)
    };
  },

  // Actualizar un ticket existente
  async actualizarTicket(id, actualizaciones) {
    // Si hay prioridad en las actualizaciones, convertirla
    if (actualizaciones.prioridad) {
      actualizaciones.prioridad = convertirPrioridadANumero(actualizaciones.prioridad);
    }

    const { data, error } = await supabase
      .from('ticket_emergencia')
      .update({
        ...actualizaciones,
        updated_at: new Date().toISOString()
      })
      .eq('id_ticket', id)
      .select();

    if (error) {
      console.error('Error al actualizar ticket:', error);
      throw error;
    }

    const ticket = data[0];
    return {
      ...ticket,
      id: ticket.id_ticket,
      prioridad: convertirPrioridadATexto(ticket.prioridad)
    };
  },

  // Eliminar un ticket
  async eliminarTicket(id) {
    const { error } = await supabase
      .from('ticket_emergencia')
      .delete()
      .eq('id_ticket', id);

    if (error) {
      console.error('Error al eliminar ticket:', error);
      throw error;
    }
    return true;
  },

  // Agregar entrada a la transcripción
  async agregarEntradaTranscripcion(idTicket, entrada) {
    const ticket = await this.obtenerTicketPorId(idTicket);
    const transcripcion = ticket.transcripcion || [];
    transcripcion.push(entrada);

    return this.actualizarTicket(idTicket, { transcripcion });
  },

  // Obtener estadísticas del día
  async obtenerEstadisticasDelDia() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('ticket_emergencia')
      .select('id_ticket, estado, prioridad, tipo_emergencia')
      .gte('fecha_creacion', hoy.toISOString());

    if (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }

    return {
      total: data.length,
      pendientes: data.filter(t => t.estado === 'PENDIENTE').length,
      enProceso: data.filter(t => t.estado === 'EN_PROCESO').length,
      completados: data.filter(t => t.estado === 'COMPLETADO').length,
      porTipo: data.reduce((acc, t) => {
        acc[t.tipo_emergencia] = (acc[t.tipo_emergencia] || 0) + 1;
        return acc;
      }, {}),
      porPrioridad: data.reduce((acc, t) => {
        const prioridadTexto = convertirPrioridadATexto(t.prioridad);
        acc[prioridadTexto] = (acc[prioridadTexto] || 0) + 1;
        return acc;
      }, {})
    };
  },

  // Asignar jefe a un ticket
  async asignarJefe(idTicket, idJefe) {
    return this.actualizarTicket(idTicket, {
      id_jefe_asignado: idJefe,
      estado: 'ASIGNADO'
    });
  },

  // Marcar ticket como atendido
  async marcarComoAtendido(idTicket) {
    return this.actualizarTicket(idTicket, {
      fecha_atencion: new Date().toISOString(),
      estado: 'ATENDIDO'
    });
  }
};

// Mantener alias para compatibilidad con código existente
export const llamadasEmergenciaService = ticketsEmergenciaService;

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

  async obtenerReportesPorTicket(idTicket) {
    const { data, error } = await supabase
      .from('reportes_emergencia')
      .select('*')
      .eq('ticket_id', idTicket);

    if (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
    return data;
  }
};

export default supabase;
