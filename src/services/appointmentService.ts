/**
 * @fileoverview Servicio de citas (appointments)
 * @description Este servicio maneja las citas tanto para clientes como proveedores,
 * incluyendo obtener, confirmar y cancelar citas a través de la API backend.
 * @author Integrador III - Frontend Team
 * @version 1.0.0
 */

import { preferencesService } from './preferencesService';

/**
 * Interfaz base para todas las citas con los datos mejorados del API
 */
export interface AppointmentBase {
  /** ID único de la cita */
  id: number;
  /** Fecha de la cita en formato YYYY-MM-DD */
  appointment_date: string;
  /** Hora de inicio en formato HH:MM:SS */
  start_at: string;
  /** Hora de finalización en formato HH:MM:SS */
  end_at: string;
  /** Estado de la cita: pending, confirmed, cancelled */
  status: 'pending' | 'confirmed' | 'cancelled';
  /** Fecha de creación */
  created_at: string;
  /** Fecha de última actualización */
  updated_at: string;
  
  /** Información completa del cliente */
  client: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
  };
  
  /** Información completa del proveedor */
  provider: {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    location: string;
    experience_years: number;
  };
  
  /** Información del servicio */
  service: {
    subcategory: {
      id: number;
      name: string;
      category_id: number;
    };
    category: {
      id: number;
      name: string;
    };
  };
  
  /** Información del horario */
  schedule: {
    id: number;
    day: string;
    hours_per_session: number;
  };
  
  /** Datos formateados para el frontend */
  status_text: string;
  formatted_date: string;
  formatted_time: string;

  // Campos de la estructura antigua (para compatibilidad)
  client_id?: number;
  provider_id?: number;
  schedule_id?: number;
}

/**
 * Interfaz para citas desde la perspectiva del cliente
 */
export interface ClientAppointment {
  id: number;
  date: string;
  time: string;
  serviceType: string;
  serviceName: string;
  location: string;
  status: string;
  providerName: string;
  formattedDate: string;
  formattedTime: string;
}

/**
 * Interfaz para citas desde la perspectiva del proveedor
 */
export interface ProviderAppointment {
  id: number;
  date: string;
  time: string;
  serviceType: string;
  serviceName: string;
  location: string;
  status: string;
  clientName: string;
  clientEmail: string;
  formattedDate: string;
  formattedTime: string;
}

/**
 * Tipo que puede ser cualquiera de los dos tipos de cita
 */
export type Appointment = ClientAppointment | ProviderAppointment;

/**
 * Interfaz para la respuesta del servicio
 */
export interface AppointmentsResponse {
  /** Indica si la petición fue exitosa */
  success: boolean;
  /** Mensaje de respuesta */
  message: string;
  /** Array de citas (solo presente si success es true) */
  data?: AppointmentBase[];
}

/** URL base de la API obtenida desde las variables de entorno */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Obtiene los headers con autenticación para las peticiones
 */
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await preferencesService.getToken();
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Servicio para el manejo de citas
 */
export const appointmentService = {
  /**
   * Obtiene todas las citas de un cliente
   */
  async getClientAppointments(clientId?: number): Promise<AppointmentsResponse> {
    try {
      // Si no se proporciona clientId, obtener el ID del usuario actual
      if (!clientId) {
        const userInfo = await preferencesService.getUserInfo();
        
        if (!userInfo) {
          throw new Error('No se encontró información del usuario. Por favor, inicie sesión nuevamente.');
        }
        
        clientId = userInfo?.id;
        
        if (!clientId) {
          throw new Error('No se pudo obtener el ID del cliente. La información del usuario no contiene un ID válido.');
        }
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/client/all/${clientId}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (response.status === 403) {
          throw new Error('No tiene permisos para ver estas citas.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const appointments: AppointmentBase[] = await response.json();
      
      return {
        success: true,
        message: 'Citas obtenidas exitosamente',
        data: appointments
      };
    } catch (error: any) {
      console.error('❌ Error al obtener citas del cliente:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener las citas. Verifique su conexión.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene citas pendientes del cliente
   */
  async getClientPendingAppointments(): Promise<AppointmentsResponse> {
    try {
      console.log('🔄 Obteniendo citas pendientes del cliente...');
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/client/pending`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const appointments: AppointmentBase[] = await response.json();
      
      return {
        success: true,
        message: 'Citas pendientes obtenidas exitosamente',
        data: appointments
      };
    } catch (error: any) {
      console.error('❌ Error al obtener citas pendientes del cliente:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener las citas pendientes.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene citas confirmadas del cliente
   */
  async getClientConfirmedAppointments(): Promise<AppointmentsResponse> {
    try {
      console.log('🔄 Obteniendo citas confirmadas del cliente...');
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/client/confirmed`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const appointments: AppointmentBase[] = await response.json();
      
      return {
        success: true,
        message: 'Citas confirmadas obtenidas exitosamente',
        data: appointments
      };
    } catch (error: any) {
      console.error('❌ Error al obtener citas confirmadas del cliente:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener las citas confirmadas.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene citas canceladas del cliente
   */
  async getClientCancelledAppointments(): Promise<AppointmentsResponse> {
    try {
      console.log('🔄 Obteniendo citas canceladas del cliente...');
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/client/cancelled`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const appointments: AppointmentBase[] = await response.json();
      
      return {
        success: true,
        message: 'Citas canceladas obtenidas exitosamente',
        data: appointments
      };
    } catch (error: any) {
      console.error('❌ Error al obtener citas canceladas del cliente:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener las citas canceladas.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene todas las citas de un proveedor específico usando el nuevo endpoint
   */
  async getProviderAppointments(): Promise<AppointmentsResponse> {
    try {
      // Obtener el ID del usuario autenticado (no necesitamos provider_id gracias al nuevo endpoint)
      const userInfo = await preferencesService.getUserInfo();
      
      if (!userInfo || !userInfo.id) {
        throw new Error('No se encontró información del usuario. Por favor, inicie sesión nuevamente.');
      }
      
      const userId = userInfo.id;
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/provider/user/${userId}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (response.status === 403) {
          throw new Error('No tiene permisos para ver estas citas.');
        } else if (response.status === 404) {
          throw new Error('Usuario no encontrado.');
        } else if (response.status === 400) {
          throw new Error('El usuario no es un proveedor válido.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Extraer las citas del nuevo formato de respuesta
      const appointments = responseData.appointments || [];
      const providerInfo = responseData.provider_info || {};
      
      console.log(`✅ Citas del proveedor obtenidas: ${appointments.length} citas (User ID ${providerInfo.user_id} → Provider ID ${providerInfo.provider_id})`);
      
      return {
        success: true,
        message: `Citas del proveedor obtenidas exitosamente (${appointments.length} citas encontradas)`,
        data: appointments
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener las citas del proveedor.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene citas pendientes del proveedor
   */
  async getProviderPendingAppointments(): Promise<AppointmentsResponse> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/provider/pending`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (response.status === 403) {
          throw new Error('No tiene permisos para ver estas citas.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const appointments: AppointmentBase[] = await response.json();
      
      return {
        success: true,
        message: 'Citas pendientes del proveedor obtenidas exitosamente',
        data: appointments
      };
    } catch (error: any) {
      console.error('❌ Error al obtener citas pendientes del proveedor:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener las citas pendientes del proveedor.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene citas confirmadas del proveedor
   */
  async getProviderConfirmedAppointments(): Promise<AppointmentsResponse> {
    try {
      console.log(`🔄 Obteniendo citas confirmadas del proveedor autenticado...`);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/provider/confirmed`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (response.status === 403) {
          throw new Error('No tiene permisos para ver estas citas.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const appointments: AppointmentBase[] = await response.json();
      
      console.log('✅ Citas confirmadas del proveedor obtenidas exitosamente:', appointments.length);
      
      return {
        success: true,
        message: 'Citas confirmadas del proveedor obtenidas exitosamente',
        data: appointments
      };
    } catch (error: any) {
      console.error('❌ Error al obtener citas confirmadas del proveedor:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener las citas confirmadas del proveedor.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene citas canceladas del proveedor
   */
  async getProviderCancelledAppointments(): Promise<AppointmentsResponse> {
    try {
      console.log(`🔄 Obteniendo citas canceladas del proveedor autenticado...`);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/provider/cancelled`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (response.status === 403) {
          throw new Error('No tiene permisos para ver estas citas.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const appointments: AppointmentBase[] = await response.json();
      
      console.log('✅ Citas canceladas del proveedor obtenidas exitosamente:', appointments.length);
      
      return {
        success: true,
        message: 'Citas canceladas del proveedor obtenidas exitosamente',
        data: appointments
      };
    } catch (error: any) {
      console.error('❌ Error al obtener citas canceladas del proveedor:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener las citas canceladas del proveedor.',
        data: undefined
      };
    }
  },

  /**
   * Transforma datos del API a formato del cliente
   */
  transformToClientAppointment(appointment: AppointmentBase): ClientAppointment {
    // Construir el nombre completo del servicio
    const serviceCategory = appointment.service.category.name;
    const serviceSubcategory = appointment.service.subcategory.name;
    const fullServiceName = `${serviceCategory} - ${serviceSubcategory}`;

    // Asegurar que la fecha esté en formato YYYY-MM-DD
    const date = appointment.appointment_date.split('T')[0];

    return {
      id: appointment.id,
      date: date,
      time: appointment.formatted_time,
      serviceType: serviceCategory,
      serviceName: fullServiceName,
      location: appointment.provider.location,
      status: appointment.status_text,
      providerName: appointment.provider.full_name,
      formattedDate: appointment.formatted_date,
      formattedTime: appointment.formatted_time
    };
  },

  /**
   * Confirma una cita (solo para proveedores)
   */
  async confirmAppointment(appointmentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/confirm`, {
        method: 'PATCH',
        headers,
      });
      
      if (!response.ok) {
        // Intentar obtener más detalles del error
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch (e) {
          // Silenciar error de lectura
        }
        
        // Manejar errores específicos
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (response.status === 403) {
          throw new Error('No tiene permisos para confirmar esta cita.');
        } else if (response.status === 500) {
          // Verificar si es el error específico de la columna 'services'
          if (errorBody.includes('Unknown column \'services\'') || errorBody.includes('Column not found')) {
            throw new Error('Error en el servidor: La base de datos necesita ser actualizada. Por favor, contacte al administrador del sistema.');
          } else {
            throw new Error('Error interno del servidor. Por favor, intente nuevamente más tarde.');
          }
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      await response.json();
      
      console.log('✅ Cita confirmada exitosamente');
      
      return {
        success: true,
        message: 'Cita confirmada exitosamente'
      };
    } catch (error: any) {
      console.error('❌ Error al confirmar cita:', error);
      
      return {
        success: false,
        message: error.message || 'Error al confirmar la cita. Verifique su conexión.'
      };
    }
  },

  /**
   * Cancela una cita (para clientes y proveedores)
   */
  async cancelAppointment(appointmentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (response.status === 403) {
          throw new Error('No tiene permisos para cancelar esta cita.');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      await response.json();
      
      console.log('✅ Cita cancelada exitosamente');
      
      return {
        success: true,
        message: 'Cita cancelada exitosamente'
      };
    } catch (error: any) {
      console.error('❌ Error al cancelar cita:', error);
      
      return {
        success: false,
        message: error.message || 'Error al cancelar la cita. Verifique su conexión.'
      };
    }
  },

  /**
   * Transforma datos del API a formato del proveedor
   */
  transformToProviderAppointment(appointment: AppointmentBase): ProviderAppointment {
    // Construir el nombre completo del servicio
    const serviceCategory = appointment.service.category.name;
    const serviceSubcategory = appointment.service.subcategory.name;
    const fullServiceName = `${serviceCategory} - ${serviceSubcategory}`;

    // Asegurar que la fecha esté en formato YYYY-MM-DD
    const date = appointment.appointment_date.split('T')[0];

    return {
      id: appointment.id,
      date: date,
      time: appointment.formatted_time,
      serviceType: serviceCategory,
      serviceName: fullServiceName,
      location: appointment.provider.location,
      status: appointment.status_text,
      clientName: appointment.client.full_name,
      clientEmail: appointment.client.email,
      formattedDate: appointment.formatted_date,
      formattedTime: appointment.formatted_time
    };
  }
};

export default appointmentService;
