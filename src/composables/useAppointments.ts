import { ref, onMounted, onUnmounted } from 'vue';
import { alertController } from '@ionic/vue';
import { appointmentService, type ClientAppointment, type ProviderAppointment, type Appointment } from '@/services/appointmentService';
import { preferencesService } from '@/services/preferencesService';

// Composable para manejar lógica de citas
export const useAppointments = (userType?: 'client' | 'provider') => {
  // Estados reactivos
  const appointments = ref<Appointment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Variable para controlar múltiples llamadas
  let loadingTimeout: NodeJS.Timeout | null = null;
  
  // Función para obtener el tipo de usuario actual
  const getCurrentUserType = async (): Promise<string | null> => {
    try {
      const userInfo = await preferencesService.getUserInfo();
      if (userInfo && userInfo.roles && Array.isArray(userInfo.roles)) {
        if (userInfo.roles.includes('Admin')) {
          return 'admin';
        } else if (userInfo.roles.includes('Provider')) {
          return 'provider';
        } else {
          return 'client';
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  /**
   * Limpia todos los datos de citas
   */
  const clearAppointments = () => {
    appointments.value = [];
    error.value = null;
    loading.value = false;
  };

  /**
   * Carga las citas desde la API con protección contra múltiples llamadas
   */
  const loadAppointments = async () => {
    // Cancelar cualquier carga pendiente
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    // Si ya está cargando, no hacer nada
    if (loading.value) {
      return;
    }
    
    // Obtener el tipo de usuario dinámicamente cada vez que se carga
    const currentUserType = await getCurrentUserType();
    
    if (!currentUserType) {
      clearAppointments();
      return;
    }
    
    loading.value = true;
    error.value = null;

    try {
      let response;
      
      if (currentUserType === 'client') {
        response = await appointmentService.getClientAppointments();
        if (response.success && response.data) {
          appointments.value = response.data.map(appointment => 
            appointmentService.transformToClientAppointment(appointment)
          );
        } else {
          error.value = response.message;
          appointments.value = [];
        }
      } else if (currentUserType === 'provider') {
        response = await appointmentService.getProviderAppointments();
        if (response.success && response.data) {
          appointments.value = response.data.map(appointment => 
            appointmentService.transformToProviderAppointment(appointment)
          );
        } else {
          error.value = response.message;
          appointments.value = [];
        }
      } else {
        // Tipo de usuario no válido o no reconocido
        appointments.value = [];
      }
    } catch (err: any) {
      error.value = 'Error al cargar las citas. Intente nuevamente.';
      appointments.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Event listener para limpiar datos cuando se hace logout
  const handleLogout = () => {
    clearAppointments();
  };

  // Event listener para recargar cuando cambia el tipo de usuario
  const handleUserTypeChange = (event: any) => {
    // Solo recargar si el evento indica un usuario válido
    if (event.detail?.userType && !event.detail?.logout && !event.detail?.error) {
      clearAppointments();
      loadingTimeout = setTimeout(() => {
        loadAppointments();
      }, 1200);
    }
  };

  // Event listener para recargar cuando se hace login exitoso
  const handleLoginSuccess = () => {
    clearAppointments();
    loadingTimeout = setTimeout(() => {
      loadAppointments();
    }, 1500); // Tiempo más largo para login para asegurar que los datos estén listos
  };

  // Cargar citas al montar el composable
  onMounted(() => {
    loadAppointments();
    // Escuchar evento de logout
    window.addEventListener('userLoggedOut', handleLogout);
    // Escuchar evento de cambio de tipo de usuario
    window.addEventListener('userTypeChanged', handleUserTypeChange);
    // Escuchar evento de login exitoso
    window.addEventListener('loginSuccess', handleLoginSuccess);
  });

  // Limpiar listener al desmontar
  onUnmounted(() => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    window.removeEventListener('userLoggedOut', handleLogout);
    window.removeEventListener('userTypeChanged', handleUserTypeChange);
    window.removeEventListener('loginSuccess', handleLoginSuccess);
  });

  // Función para confirmar cita (específica para proveedores)
  const confirmAppointment = async (appointment: Appointment) => {
    const alert = await alertController.create({
      header: 'Confirmar Cita',
      message: userType === 'provider' && 'clientName' in appointment
        ? `¿Deseas confirmar la cita con ${appointment.clientName}?`
        : '¿Deseas confirmar esta cita?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              // Llamar al API para confirmar la cita
              const result = await appointmentService.confirmAppointment(appointment.id);
              
              if (result.success) {
                // Actualizar localmente solo si la API fue exitosa
                appointment.status = 'Confirmada';
                
                // Actualizar en la lista principal
                const index = appointments.value.findIndex(apt => apt.id === appointment.id);
                if (index !== -1) {
                  appointments.value[index].status = 'Confirmada';
                }
                
                // Mostrar confirmación
                const successAlert = await alertController.create({
                  header: 'Cita Confirmada',
                  message: result.message,
                  buttons: ['OK']
                });
                
                await successAlert.present();
              } else {
                // Mostrar error del API
                const errorAlert = await alertController.create({
                  header: 'Error',
                  message: result.message,
                  buttons: ['OK']
                });
                
                await errorAlert.present();
              }
            } catch (error) {
              console.error('Error al confirmar cita:', error);
              
              const errorAlert = await alertController.create({
                header: 'Error',
                message: 'No se pudo confirmar la cita. Intente nuevamente.',
                buttons: ['OK']
              });
              
              await errorAlert.present();
            }
          }
        }
      ]
    });
    
    await alert.present();
  };

  // Función para cancelar cita
  const cancelAppointment = async (appointment: Appointment) => {
    const clientName = 'clientName' in appointment ? appointment.clientName : null;
    const message = userType === 'provider' && clientName
      ? `¿Estás seguro de que deseas cancelar la cita con ${clientName}?`
      : '¿Estás seguro de que deseas cancelar esta cita?';

    const alert = await alertController.create({
      header: 'Confirmar Cancelación',
      message,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, Cancelar',
          handler: async () => {
            try {
              // Llamar al API para cancelar la cita
              const result = await appointmentService.cancelAppointment(appointment.id);
              
              if (result.success) {
                // Actualizar localmente solo si la API fue exitosa
                appointment.status = 'Cancelada';
                
                // Actualizar en la lista principal
                const index = appointments.value.findIndex(apt => apt.id === appointment.id);
                if (index !== -1) {
                  appointments.value[index].status = 'Cancelada';
                }
                
                // Mostrar confirmación
                const successAlert = await alertController.create({
                  header: 'Cita Cancelada',
                  message: result.message,
                  buttons: ['OK']
                });
                
                await successAlert.present();
              } else {
                // Mostrar error del API
                const errorAlert = await alertController.create({
                  header: 'Error',
                  message: result.message,
                  buttons: ['OK']
                });
                
                await errorAlert.present();
              }
            } catch (error) {
              console.error('Error al cancelar cita:', error);
              
              const errorAlert = await alertController.create({
                header: 'Error',
                message: 'No se pudo cancelar la cita. Intente nuevamente.',
                buttons: ['OK']
              });
              
              await errorAlert.present();
            }
          }
        }
      ]
    });
    
    await alert.present();
  };

  return {
    appointments,
    loading,
    error,
    loadAppointments,
    clearAppointments,
    confirmAppointment,
    cancelAppointment
  };
};

export type { Appointment, ClientAppointment, ProviderAppointment };
