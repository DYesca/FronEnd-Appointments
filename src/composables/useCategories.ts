/**
 * @fileoverview Composable para manejar categorías
 * @description Composable que proporciona funcionalidades para cargar y manejar categorías desde la API
 * @author Integrador III - Frontend Team
 * @version 1.0.0
 */

import { ref, computed } from 'vue';
import { categoryService, type Category, type Subcategory } from '@/services/categoryService';

/**
 * Composable para el manejo de categorías
 * @function useCategories
 * @returns Objeto con estados reactivos y funciones para manejar categorías
 */
export const useCategories = () => {
  // Estados reactivos
  const loading = ref(false);
  const error = ref('');
  const categories = ref<Category[]>([]);

  /**
   * Cargar categorías desde la API
   */
  const loadCategories = async () => {
    loading.value = true;
    error.value = '';
    
    try {
      const response = await categoryService.getCategories();
      
      if (response.success && response.data) {
        categories.value = response.data;
        console.log('✅ Categorías cargadas exitosamente:', categories.value.length);
      } else {
        error.value = response.message;
        console.error('❌ Error en respuesta del servicio:', response.message);
      }
    } catch (err: any) {
      error.value = 'Error de conexión con el servidor';
      console.error('❌ Error de conexión:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reintentar carga de categorías
   */
  const retryLoad = () => {
    loadCategories();
  };

  /**
   * Limpiar datos de categorías
   */
  const clearCategories = () => {
    categories.value = [];
    error.value = '';
  };

  /**
   * Buscar una categoría por ID
   */
  const getCategoryById = (id: number): Category | undefined => {
    return categories.value.find(category => category.id === id);
  };

  /**
   * Buscar una subcategoría por ID
   */
  const getSubcategoryById = (id: number): Subcategory | undefined => {
    for (const category of categories.value) {
      const subcategory = category.subcategories.find(sub => sub.id === id);
      if (subcategory) {
        return subcategory;
      }
    }
    return undefined;
  };

  /**
   * Obtener todas las subcategorías de todas las categorías
   */
  const getAllSubcategories = computed((): Subcategory[] => {
    return categories.value.flatMap(category => category.subcategories);
  });

  /**
   * Verificar si hay categorías cargadas
   */
  const hasCategories = computed((): boolean => {
    return categories.value.length > 0;
  });

  /**
   * Obtener total de subcategorías
   */
  const totalSubcategories = computed((): number => {
    return getAllSubcategories.value.length;
  });

  /**
   * Verificar si hay errores
   */
  const hasError = computed((): boolean => {
    return error.value !== '';
  });

  /**
   * Verificar si está cargando
   */
  const isLoading = computed((): boolean => {
    return loading.value;
  });

  return {
    // Estados reactivos
    loading,
    error,
    categories,
    
    // Computed properties
    hasCategories,
    hasError,
    isLoading,
    getAllSubcategories,
    totalSubcategories,
    
    // Métodos
    loadCategories,
    retryLoad,
    clearCategories,
    getCategoryById,
    getSubcategoryById
  };
};

/**
 * @module useCategories
 * @description
 * Este composable centraliza toda la lógica relacionada con el manejo de categorías:
 * 
 * ## Funcionalidades principales:
 * - Carga de categorías desde la API
 * - Manejo de estados de carga y error
 * - Búsqueda de categorías y subcategorías por ID
 * - Computed properties útiles para la UI
 * - Funciones de utilidad para limpiar datos
 * 
 * ## Uso recomendado:
 * ```typescript
 * import { useCategories } from '@/composables/useCategories';
 * 
 * const {
 *   loading,
 *   error,
 *   categories,
 *   loadCategories,
 *   retryLoad
 * } = useCategories();
 * 
 * // Cargar categorías al montar el componente
 * onMounted(() => {
 *   loadCategories();
 * });
 * ```
 * 
 * @since 1.0.0
 */

export default useCategories;
