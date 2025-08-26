import { useRouter } from 'vue-router';
import { updateGlobalUserType } from '@/composables/useUserType';
import { preferencesService } from '@/services/preferencesService';
import { ref } from 'vue';

// Composable para manejar acciones comunes del perfil
export const useProfileActions = () => {
  const router = useRouter();
  const currentUserType = ref('client');

  // Función para actualizar el tipo de usuario desde Preferences
  const updateUserTypeFromPreferences = async () => {
    try {
      const userInfo = await preferencesService.getUserInfo();
      if (userInfo) {
        let userType = 'client'; // Valor por defecto
        
        // Detectar tipo de usuario basado en roles
        if (userInfo.roles && Array.isArray(userInfo.roles)) {
          if (userInfo.roles.includes('Admin')) {
            userType = 'admin';
          } else if (userInfo.roles.includes('Provider')) {
            userType = 'provider';
          } else {
            userType = 'client';
          }
        }
        
        currentUserType.value = userType;
      } else {
        currentUserType.value = 'client';
      }
    } catch (error) {
      console.error('Error obteniendo información del usuario desde Preferences:', error);
      currentUserType.value = 'client';
    }
  };

  // Event listeners para cambios
  const handleUserTypeChange = (event: CustomEvent) => {
    let userType = event.detail.userType || 'client';
    // Normalizar 'user' a 'client' para compatibilidad
    if (userType === 'user') {
      userType = 'client';
    }
    currentUserType.value = userType;
  };

  const handleRouteChange = () => {
    updateUserTypeFromPreferences();
  };

  // Setup y cleanup de event listeners
  const setupEventListeners = () => {
    updateUserTypeFromPreferences();
    
    // Escuchar eventos personalizados de cambio de tipo de usuario
    window.addEventListener('userTypeChanged', handleUserTypeChange as EventListener);
    
    // Escuchar cambios de ruta
    router.afterEach(handleRouteChange);
  };

  const cleanupEventListeners = () => {
    window.removeEventListener('userTypeChanged', handleUserTypeChange as EventListener);
  };

  // Acciones comunes para todos los tipos de usuario
  const editProfile = () => {
    router.push('/tabs/edit-profile');
  };

  // Función de logout mejorada con llamada al API
  const logout = async () => {
    try {
      // Obtener token antes de limpiar
      const token = await preferencesService.getToken();
      
      if (token) {
        // Llamar al API de logout
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.warn('⚠️ Error en logout del servidor, pero continuando con logout local');
        }
      }
    } catch (error) {
      console.error('❌ Error al hacer logout en el servidor:', error);
    } finally {
      // Limpiar datos locales usando Preferences
      await preferencesService.logout();
      
      // Emitir evento de logout para limpiar datos en otros composables
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      // Actualizar estado global
      updateGlobalUserType();
      
      // Redirigir al login
      router.push('/login');
      
      console.log('✅ Logout completado');
    }
  };

  // Acciones específicas para clientes
  const viewFavorites = () => {
    // TODO: Implementar navegación a favoritos
  };

  const viewHistory = () => {
    // TODO: Implementar navegación a historial
  };

  // Acciones específicas para proveedores
  const manageSchedule = () => {
    // TODO: Implementar navegación a gestión de horarios
  };

  // Acciones específicas para administradores
  const manageUsers = () => {
    // TODO: Implementar navegación a gestión de usuarios
  };

  const manageCategories = () => {
    // TODO: Implementar navegación a gestión de categorías
  };

  // Función principal para manejar cualquier acción
  const handleProfileAction = (actionType: string) => {
    const actions: { [key: string]: () => void } = {
      editProfile,
      logout,
      favorites: viewFavorites,
      history: viewHistory,
      manageSchedule,
      manageUsers,
      manageCategories
    };

    const action = actions[actionType];
    if (action) {
      action();
    } else {
      console.warn(`Acción no reconocida: ${actionType}`);
    }
  };

  return {
    currentUserType,
    editProfile,
    logout,
    viewFavorites,
    viewHistory,
    manageSchedule,
    manageUsers,
    manageCategories,
    handleProfileAction,
    setupEventListeners,
    cleanupEventListeners
  };
};
