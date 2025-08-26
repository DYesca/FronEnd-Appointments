import { Preferences } from '@capacitor/preferences';

/**
 * Interfaz para la información del usuario desde la API
 */
interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  personal_phone_number: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
  provider?: {
    id: number;
    ced: string;
    contact_email: string;
    phone_number: string;
    location: string;
    latitude: number;
    longitude: number;
    experience_years: number;
    schedule_type: boolean;
    likes: number;
    img: string | null;
    services: number;
    created_at: string;
    updated_at: string;
  } | null;
}

/**
 * Interfaz para actualizar el perfil
 */
interface UpdateProfileData {
  // Campos básicos para todos los usuarios
  first_name?: string;
  last_name?: string;
  email?: string;
  personal_phone_number?: string;
  
  // Campos para cambio de contraseña
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
  
  // Campos adicionales para providers
  ced?: string;
  contact_email?: string;
  phone_number?: string;
  location?: string;
  lat?: number;
  long?: number;
  experience_years?: number;
  schedule_type?: boolean;
  services?: number;
}

/**
 * Respuesta estándar de la API
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Servicio para manejar las preferencias de Capacitor
 * Proporciona métodos para almacenar, obtener y eliminar datos de forma persistente
 * Incluye métodos para interactuar con la API de perfil
 */
class PreferencesService {
  
  private readonly API_BASE_URL = 'http://127.0.0.1:8000/api';

  /**
   * Obtiene los headers para las peticiones autenticadas
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Realiza una petición HTTP autenticada
   */
  private async makeAuthenticatedRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o inválido
          await this.logout();
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene un valor almacenado en las preferencias
   * @param key - La clave del valor a obtener
   * @returns El valor almacenado o null si no existe
   */
  async get(key: string): Promise<string | null> {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      console.error(`Error getting preference for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Almacena un valor en las preferencias
   * @param key - La clave bajo la cual almacenar el valor
   * @param value - El valor a almacenar
   */
  async set(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error(`Error setting preference for key "${key}":`, error);
    }
  }

  /**
   * Elimina un valor específico de las preferencias
   * @param key - La clave del valor a eliminar
   */
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Error removing preference for key "${key}":`, error);
    }
  }

  /**
   * Elimina todas las preferencias almacenadas
   */
  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing all preferences:', error);
    }
  }

  /**
   * Obtiene todas las claves almacenadas
   * @returns Array de claves o array vacío si hay error
   */
  async getKeys(): Promise<string[]> {
    try {
      const result = await Preferences.keys();
      return result.keys;
    } catch (error) {
      console.error('Error getting preference keys:', error);
      return [];
    }
  }

  // === MÉTODOS ESPECÍFICOS PARA TOKENS ===

  /**
   * Obtiene el token del usuario
   * @returns El token del usuario o null si no existe
   */
  async getToken(): Promise<string | null> {
    return this.get('userToken');
  }

  /**
   * Almacena el token del usuario
   * @param token - El token a almacenar
   */
  async setToken(token: string): Promise<void> {
    await this.set('userToken', token);
  }

  // Obtener el userId actual del usuario logueado
  async getUserId(): Promise<number | null> {
    const userInfo = await this.getUserInfo();
    return userInfo?.id || null;
  }

  /**
   * Elimina el token del usuario
   */
  async removeToken(): Promise<void> {
    await this.remove('userToken');
  }

  // === MÉTODOS ESPECÍFICOS PARA DATOS DE USUARIO ===

  /**
   * Obtiene el perfil completo del usuario desde la API
   * @returns Información completa del perfil del usuario
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await this.makeAuthenticatedRequest<UserProfile>('/profile');
      
      // Guardar información del usuario en cache local
      await this.setUserInfo(response.data);
      
      console.log('✅ Perfil de usuario obtenido desde API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo perfil desde API:', error);
      
      // Intentar obtener desde cache local como fallback
      const cachedUserInfo = await this.getUserInfo();
      if (cachedUserInfo) {
        console.log('📦 Usando perfil desde cache local');
        return cachedUserInfo as UserProfile;
      }
      
      throw error;
    }
  }

  /**
   * Actualiza el perfil del usuario en la API
   * @param profileData - Datos del perfil a actualizar
   * @returns Información actualizada del perfil
   */
  async updateUserProfile(profileData: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await this.makeAuthenticatedRequest<UserProfile>('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      
      // Actualizar cache local con la información actualizada
      await this.setUserInfo(response.data);
      
      console.log('✅ Perfil actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Obtiene información básica del usuario (nombre, email, etc.)
   * Útil para mostrar información rápida sin hacer petición a API
   * @returns Información básica del usuario desde cache local
   */
  async getUserBasicInfo(): Promise<{
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    roles?: string[];
  } | null> {
    try {
      const userInfo = await this.getUserInfo();
      if (!userInfo) return null;
      
      return {
        id: userInfo.id,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        email: userInfo.email,
        roles: userInfo.roles || []
      };
    } catch (error) {
      console.error('Error obteniendo información básica del usuario:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role - Rol a verificar (ej: 'Client', 'Provider', 'Admin')
   * @returns true si el usuario tiene el rol, false en caso contrario
   */
  async hasRole(role: string): Promise<boolean> {
    try {
      const userInfo = await this.getUserBasicInfo();
      return userInfo?.roles?.includes(role) || false;
    } catch (error) {
      console.error('Error verificando rol del usuario:', error);
      return false;
    }
  }

  /**
   * Obtiene el tipo de usuario principal
   * @returns El rol principal del usuario o null
   */
  async getUserType(): Promise<string | null> {
    try {
      const userInfo = await this.getUserBasicInfo();
      const roles = userInfo?.roles || [];
      
      // Prioridad: Admin > Provider > Client
      if (roles.includes('Admin')) return 'Admin';
      if (roles.includes('Provider')) return 'Provider';
      if (roles.includes('Client')) return 'Client';
      
      return roles[0] || null;
    } catch (error) {
      console.error('Error obteniendo tipo de usuario:', error);
      return null;
    }
  }

  /**
   * Almacena información del usuario
   * @param userInfo - Objeto con información del usuario (se convierte a JSON)
   */
  async setUserInfo(userInfo: Record<string, any>): Promise<void> {
    await this.set('userInfo', JSON.stringify(userInfo));
  }

  /**
   * Obtiene información del usuario desde cache local
   * @returns Objeto con información del usuario o null si no existe
   */
  async getUserInfo(): Promise<Record<string, any> | null> {
    try {
      const userInfoString = await this.get('userInfo');
      return userInfoString ? JSON.parse(userInfoString) : null;
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  }

  /**
   * Elimina información del usuario del cache local
   */
  async removeUserInfo(): Promise<void> {
    await this.remove('userInfo');
  }

  // === MÉTODOS ESPECÍFICOS PARA CONFIGURACIÓN ===

  /**
   * Almacena configuración de la aplicación
   * @param config - Objeto con configuración (se convierte a JSON)
   */
  async setAppConfig(config: Record<string, any>): Promise<void> {
    await this.set('appConfig', JSON.stringify(config));
  }

  /**
   * Obtiene configuración de la aplicación
   * @returns Objeto con configuración o null si no existe
   */
  async getAppConfig(): Promise<Record<string, any> | null> {
    try {
      const configString = await this.get('appConfig');
      return configString ? JSON.parse(configString) : null;
    } catch (error) {
      console.error('Error parsing app config:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario está logueado
   * @returns true si existe un token, false en caso contrario
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && token.length > 0;
  }

  /**
   * Limpia todos los datos de sesión del usuario
   */
  async logout(): Promise<void> {
    await this.removeToken();
    await this.removeUserInfo();
    await this.remove('isLoggedIn');
    await this.remove('search_radius'); // Limpiar preferencias específicas también
    console.log('✅ Sesión cerrada y datos limpiados');
  }

  // === MÉTODOS ESPECÍFICOS PARA PREFERENCIAS DE BÚSQUEDA ===

  /**
   * Obtiene el radio de búsqueda guardado
   * @returns Radio de búsqueda en kilómetros (por defecto 30)
   */
  async getSearchRadius(): Promise<number> {
    try {
      const radiusString = await this.get('search_radius');
      if (radiusString) {
        const radius = parseInt(radiusString);
        return !isNaN(radius) && radius > 0 ? radius : 30;
      }
      return 30;
    } catch (error) {
      console.error('Error obteniendo radio de búsqueda:', error);
      return 30;
    }
  }

  /**
   * Guarda el radio de búsqueda
   * @param radius - Radio en kilómetros
   */
  async setSearchRadius(radius: number): Promise<void> {
    if (radius > 0 && radius <= 100) {
      await this.set('search_radius', radius.toString());
    }
  }
}

// Exportar una instancia singleton del servicio
export const preferencesService = new PreferencesService();

// También exportar la clase para casos donde se necesite una instancia específica
export { PreferencesService };
