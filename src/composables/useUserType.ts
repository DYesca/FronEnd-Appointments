import { ref } from 'vue';
import { preferencesService } from '@/services/preferencesService';

// Estado global del usuario
const globalUserType = ref('client');

// Función para actualizar el tipo de usuario globalmente
export const updateGlobalUserType = async () => {
  try {
    const userInfo = await preferencesService.getUserInfo();
    if (userInfo) {
      // Detectar tipo de usuario basado en roles
      let userType = 'client'; // Valor por defecto
      
      if (userInfo.roles && Array.isArray(userInfo.roles)) {
        if (userInfo.roles.includes('Admin')) {
          userType = 'admin';
        } else if (userInfo.roles.includes('Provider')) {
          userType = 'provider';
        } else {
          userType = 'client';
        }
      }
      
      globalUserType.value = userType;
      
      // Emitir evento personalizado para que App.vue se actualice
      window.dispatchEvent(new CustomEvent('userTypeChanged', { 
        detail: { userType: globalUserType.value } 
      }));
    } else {
      // Si no hay usuario, establecer como client y emitir evento
      globalUserType.value = 'client';
      
      // Emitir evento también para logout (sin log para evitar spam)
      window.dispatchEvent(new CustomEvent('userTypeChanged', { 
        detail: { userType: 'client', logout: true } 
      }));
    }
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    globalUserType.value = 'client';
    
    // Emitir evento para error también (silencioso)
    window.dispatchEvent(new CustomEvent('userTypeChanged', { 
      detail: { userType: 'client', error: true } 
    }));
  }
  
  return globalUserType.value;
};

// Composable para usar en componentes
export const useUserType = () => {
  return {
    userType: globalUserType,
    updateUserType: updateGlobalUserType
  };
};
