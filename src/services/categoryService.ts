/**
 * @fileoverview Servicio de categorías
 * @description Este servicio maneja la obtención de categorías y subcategorías desde la API
 * @author Integrador III - Frontend Team
 * @version 1.0.0
 */

/**
 * Interfaz que define la estructura de una subcategoría
 */
export interface Subcategory {
  /** ID único de la subcategoría */
  id: number;
  /** ID de la categoría padre */
  category_id: number;
  /** Nombre de la subcategoría */
  name: string;
  /** URL de la imagen (puede ser null) */
  img: string | null;
  /** Fecha de creación */
  created_at: string;
  /** Fecha de última actualización */
  updated_at: string;
}

/**
 * Interfaz que define la estructura de una categoría
 */
export interface Category {
  /** ID único de la categoría */
  id: number;
  /** Nombre de la categoría */
  name: string;
  /** Fecha de creación */
  created_at: string;
  /** Fecha de última actualización */
  updated_at: string;
  /** Array de subcategorías asociadas */
  subcategories: Subcategory[];
}

/**
 * Interfaz para la respuesta del servicio
 */
export interface CategoriesResponse {
  /** Indica si la petición fue exitosa */
  success: boolean;
  /** Mensaje de respuesta */
  message: string;
  /** Array de categorías (solo presente si success es true) */
  data?: Category[];
}

/** URL base de la API obtenida desde las variables de entorno */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Servicio para el manejo de categorías
 */
export const categoryService = {
  /**
   * Obtiene todas las categorías con sus subcategorías desde la API
   */
  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      const categories: Category[] = await response.json();
      return {
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: categories
      };
    } catch (error: any) {
      console.error('❌ Error al obtener categorías:', error);
      
      return {
        success: false,
        message: error.message || 'Error al obtener las categorías. Verifique su conexión.',
        data: undefined
      };
    }
  }
};

export default categoryService;
