/**
 * @fileoverview Servicio para búsqueda geográfica de proveedores
 * @description Maneja las peticiones a la API de geo-búsqueda
 */

import type { Provider } from './providerService';

/**
 * Interfaz para los parámetros de búsqueda geográfica
 */
export interface GeoSearchParams {
  /** Longitud */
  long: number;
  /** Latitud */
  lat: number;
  /** Radio de búsqueda en kilómetros */
  range_km: number;
  /** Array de IDs de subcategorías (opcional) */
  subcategories_id?: number[];
  /** Años mínimos de experiencia (opcional) */
  experience_years?: number;
}

/**
 * Interfaz para la respuesta de la API
 */
export interface GeoSearchResponse {
  success: boolean;
  data: Provider[];
  message?: string;
}

class GeoSearchService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  }

  /**
   * Realiza búsqueda geográfica de proveedores
   */
  async searchProviders(params: GeoSearchParams): Promise<GeoSearchResponse> {
    try {
      console.log('🔍 Buscando proveedores geo:', params);

      const response = await fetch(`${this.baseUrl}/providers/geo-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data || [],
        message: 'Búsqueda completada exitosamente'
      };

    } catch (error: any) {
      console.error('❌ Error en búsqueda geográfica:', error);
      
      return {
        success: false,
        data: [],
        message: error.message || 'Error en la búsqueda de proveedores'
      };
    }
  }

  /**
   * Obtiene el radio de búsqueda guardado en preferences
   */
  async getSavedSearchRadius(): Promise<number> {
    try {
      const { preferencesService } = await import('./preferencesService');
      const savedRadius = await preferencesService.get('search_radius');
      return savedRadius ? parseInt(savedRadius) : 10; // Default 10km
    } catch (error) {
      console.warn('⚠️ Error obteniendo radio guardado, usando default:', error);
      return 10;
    }
  }

  /**
   * Guarda el radio de búsqueda en preferences
   */
  async saveSearchRadius(radius: number): Promise<void> {
    try {
      const { preferencesService } = await import('./preferencesService');
      await preferencesService.set('search_radius', radius.toString());
      console.log('✅ Radio de búsqueda guardado:', radius);
    } catch (error) {
      console.error('❌ Error guardando radio de búsqueda:', error);
    }
  }
}

export const geoSearchService = new GeoSearchService();
export { GeoSearchService };
