/**
 * @fileoverview Servicio de proveedores
 * @description Este servicio maneja la obtención de proveedores desde la API
 * @author Integrador III - Frontend Team
 * @version 1.0.0
 */

/**
 * Interfaz que define la estructura de un usuario
 */
export interface User {
  /** Nombre del usuario */
  first_name: string;
  /** Apellido del usuario */
  last_name: string;
  /** Email del usuario */
  email: string;
}

/**
 * Interfaz que define la estructura de los datos del proveedor
 */
export interface ProviderData {
  /** ID del usuario asociado */
  user_id: number;
  /** Cédula del proveedor */
  ced: string;
  /** Email de contacto de la empresa */
  contact_email: string;
  /** Número de teléfono */
  phone_number: string;
  /** Ubicación del proveedor */
  location: string;
  /** Longitud (coordenada) */
  long: string;
  /** Latitud (coordenada) */
  lat: string;
  /** Años de experiencia */
  experience_years: number;
  /** Tipo de horario */
  schedule_type: number;
  /** Número de likes */
  likes: number;
}

/**
 * Interfaz que define la estructura de una subcategoría
 */
export interface Subcategory {
  /** ID de la subcategoría */
  id: number;
  /** ID de la categoría padre */
  category_id: number;
  /** Nombre de la subcategoría */
  name: string;
}

/**
 * Interfaz que define la estructura de una categoría
 */
export interface Category {
  /** ID de la categoría */
  id: number;
  /** Nombre de la categoría */
  name: string;
}

/**
 * Interfaz que define la estructura completa de un proveedor como lo devuelve la API
 */
export interface Provider {
  /** Información del usuario */
  user: User;
  /** Datos específicos del proveedor */
  provider: ProviderData;
  /** Información de la subcategoría */
  subcategory: Subcategory;
  /** Información de la categoría */
  category: Category;
  /** Roles del usuario */
  role: string[];
}

/**
 * Interfaz para filtros de búsqueda de proveedores
 */
export interface ProviderFilters {
  /** ID de subcategoría */
  subcategory_id?: number;
  /** ID de categoría */
  category_id?: number;
  /** Término de búsqueda */
  search?: string;
  /** Ubicación */
  location?: string;
  /** Años mínimos de experiencia */
  min_experience?: number;
  /** Página para paginación */
  page?: number;
  /** Límite de resultados por página */
  limit?: number;
  /** Latitud para búsqueda geográfica */
  lat?: string;
  /** Longitud para búsqueda geográfica */
  long?: string;
  /** Radio de búsqueda en kilómetros */
  radius?: number;
}

/**
 * Interfaz para la respuesta del servicio de proveedores
 */
export interface ProvidersResponse {
  /** Indica si la petición fue exitosa */
  success: boolean;
  /** Mensaje de respuesta */
  message: string;
  /** Array de proveedores (solo presente si success es true) */
  data?: Provider[];
  /** Información de paginación */
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

/**
 * Interfaz para la respuesta de un proveedor individual
 */
export interface ProviderResponse {
  /** Indica si la petición fue exitosa */
  success: boolean;
  /** Mensaje de respuesta */
  message: string;
  /** Datos del proveedor (solo presente si success es true) */
  data?: Provider;
}

/** URL base de la API obtenida desde las variables de entorno */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Servicio para el manejo de proveedores
 */
export const providerService = {
  /**
   * Obtiene todos los proveedores con filtros opcionales
   * @param filters - Filtros de búsqueda opcionales
   * @returns Promise con la respuesta que contiene l|os proveedores
   */
  async getProviders(filters?: ProviderFilters): Promise<ProvidersResponse> {
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      console.log(queryParams.get('category_id'), queryParams.get('subcategory_id'));
      
      const url = `${API_BASE_URL}/providers/category-search/${queryParams.get('category_id')}/${queryParams.get('subcategory_id')}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        message: 'Proveedores obtenidos exitosamente',
        data: Array.isArray(data) ? data : data.providers || data.data || [],
        pagination: data.pagination
      };
    } catch (error: any) {
      console.error('❌ Error al obtener proveedores:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener los proveedores. Verifique su conexión.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene un proveedor específico por su ID
   * @param id - ID del proveedor
   * @returns Promise con la respuesta que contiene el proveedor
   */
  async getProviderById(id: number): Promise<ProviderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        message: 'Proveedor obtenido exitosamente',
        data: data
      };
    } catch (error: any) {
      console.error('❌ Error al obtener proveedor:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener el proveedor. Verifique su conexión.',
        data: undefined
      };
    }
  },

  /**
   * Obtiene proveedores por subcategoría
   * @param category - ID de la categoría
   * @param subcategory - ID de la subcategoría
   * @param additionalFilters - Filtros adicionales opcionales
   * @returns Promise con la respuesta que contiene los proveedores
   */
  async getProvidersBySubcategory(
    category: number,
    subcategoryId: number, 
    additionalFilters?: Omit<ProviderFilters, 'subcategory_id'>
  ): Promise<ProvidersResponse> {
    const filters: ProviderFilters = {
      category_id: category,
      subcategory_id: subcategoryId,
      ...additionalFilters
    };
    
    return this.getProviders(filters);
  },

  /**
   * Obtiene proveedores por categoría
   * @param categoryId - ID de la categoría
   * @param additionalFilters - Filtros adicionales opcionales
   * @returns Promise con la respuesta que contiene los proveedores
   */
  async getProvidersByCategory(
    categoryId: number, 
    additionalFilters?: Omit<ProviderFilters, 'category_id'>
  ): Promise<ProvidersResponse> {
    const filters: ProviderFilters = {
      category_id: categoryId,
      ...additionalFilters
    };
    
    return this.getProviders(filters);
  },

  /**
   * Busca proveedores por término de búsqueda
   * @param searchTerm - Término de búsqueda
   * @param additionalFilters - Filtros adicionales opcionales
   * @returns Promise con la respuesta que contiene los proveedores
   */
  async searchProviders(
    searchTerm: string, 
    additionalFilters?: Omit<ProviderFilters, 'search'>
  ): Promise<ProvidersResponse> {
    const filters: ProviderFilters = {
      search: searchTerm,
      ...additionalFilters
    };
    
    return this.getProviders(filters);
  },

  /**
   * Busca proveedores por ubicación geográfica
   * @param lat - Latitud
   * @param long - Longitud
   * @param radius - Radio de búsqueda en kilómetros (opcional, por defecto 10km)
   * @param additionalFilters - Filtros adicionales opcionales
   * @returns Promise con la respuesta que contiene los proveedores
   */
  async getProvidersByLocation(
    lat: string,
    long: string,
    radius: number = 10,
    additionalFilters?: Omit<ProviderFilters, 'lat' | 'long' | 'radius'>
  ): Promise<ProvidersResponse> {
    const filters: ProviderFilters = {
      lat,
      long,
      radius,
      ...additionalFilters
    };
    
    return this.getProviders(filters);
  }
};

export default providerService;
