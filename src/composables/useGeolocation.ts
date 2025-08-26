/**
 * @fileoverview Composable para manejar geolocalización
 * @description Composable simplificado para obtener y guardar coordenadas del usuario
 */

import { ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { preferencesService } from '@/services/preferencesService';

/**
 * Interfaz para la ubicación del usuario
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Composable para manejar geolocalización
 */
export const useGeolocation = () => {
  // Estados reactivos
  const currentLocation = ref<UserLocation | null>(null);
  const isLoading = ref(false);
  const error = ref<string>('');

  /**
   * Computed para verificar si tenemos una ubicación válida
   */
  const hasLocation = computed(() => {
    return currentLocation.value !== null;
  });

  /**
   * Computed para obtener la ubicación como string
   */
  const locationString = computed(() => {
    if (!currentLocation.value) return '';
    return `${currentLocation.value.latitude}, ${currentLocation.value.longitude}`;
  });

  /**
   * Obtiene la ubicación actual del usuario
   */
  const getCurrentPosition = async (): Promise<UserLocation | null> => {
    isLoading.value = true;
    error.value = '';

    try {
      // Obtener posición
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      const userLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      // Actualizar estado
      currentLocation.value = userLocation;
      
      // Guardar en preferences
      await saveLocationToStorage(userLocation);
      
      console.log('✅ Ubicación obtenida:', userLocation);
      return userLocation;

    } catch (err: any) {
      console.error('❌ Error obteniendo ubicación:', err);
      error.value = err.message || 'Error obteniendo ubicación actual';
      const defaultLocation = {
        latitude: 10.630481337192835,
        longitude: -85.44473882979119
      };
      currentLocation.value = defaultLocation;
      return defaultLocation;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Guarda la ubicación en preferences
   */
  const saveLocationToStorage = async (location: UserLocation): Promise<void> => {
    try {
      await preferencesService.set('user_location', JSON.stringify(location));
      console.log('✅ Ubicación guardada en preferences');
    } catch (err: any) {
      console.error('❌ Error guardando ubicación:', err);
    }
  };

  /**
   * Carga la ubicación guardada desde preferences
   */
  const loadLocationFromStorage = async (): Promise<UserLocation | null> => {
    try {
      const locationString = await preferencesService.get('user_location');
      
      if (locationString) {
        const location: UserLocation = JSON.parse(locationString);
        currentLocation.value = location;
        console.log('✅ Ubicación cargada desde preferences:', location);
        return location;
      }
      
      return null;
    } catch (err: any) {
      console.error('❌ Error cargando ubicación desde preferences:', err);
      return null;
    }
  };

  /**
   * Obtiene la ubicación (desde cache o nueva)
   */
  const getLocation = async (forceRefresh: boolean = false): Promise<UserLocation | null> => {
    try {
      // Si no se fuerza refresh, intentar cargar desde preferences
      if (!forceRefresh && !currentLocation.value) {
        const cachedLocation = await loadLocationFromStorage();
        if (cachedLocation) {
          console.log('✅ Usando ubicación desde preferences');
          return cachedLocation;
        }
      }
      
      // Obtener nueva ubicación
      console.log('🔄 Obteniendo nueva ubicación...');
      return await getCurrentPosition();
      
    } catch (err: any) {
      console.error('❌ Error en getLocation:', err);
      error.value = err.message || 'Error obteniendo ubicación';
      return null;
    }
  };

  /**
   * Limpia la ubicación almacenada
   */
  const clearLocation = async (): Promise<void> => {
    try {
      await preferencesService.remove('user_location');
      currentLocation.value = null;
      console.log('✅ Ubicación limpiada');
    } catch (err: any) {
      console.error('❌ Error limpiando ubicación:', err);
    }
  };

  /**
   * Inicializa el composable cargando datos previos
   */
  const initialize = async (): Promise<void> => {
    try {
      // Cargar ubicación desde preferences
      await loadLocationFromStorage();
    } catch (err: any) {
      console.error('❌ Error inicializando geolocalización:', err);
    }
  };

  return {
    // Estados
    currentLocation,
    isLoading,
    error,
    
    // Computed
    hasLocation,
    locationString,
    
    // Métodos
    getCurrentPosition,
    getLocation,
    loadLocationFromStorage,
    saveLocationToStorage,
    clearLocation,
    initialize
  };
};
