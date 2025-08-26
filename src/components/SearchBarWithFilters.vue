<template>
  <div class="search-container">
    <ion-searchbar 
      :class="searchbarClass"
      :placeholder="placeholder"
      :id="searchbarId"
      :value="searchQuery"
      @ionInput="handleInput"
      @ionFocus="handleFocus"
      @ionBlur="handleBlur"
      @ionClear="handleClear"
    />

    <!-- Modal de Filtros de Búsqueda -->
    <FiltersModal 
      :is-open="isFilterModalOpen" 
      @close="closeFilterModal" 
      @apply-filters="applyFilters" 
    />
  </div>
</template>

<script setup lang="ts">
import {
  IonSearchbar
} from "@ionic/vue";

import { ref } from "vue";
import { useIonRouter } from '@ionic/vue';
import FiltersModal from '@/components/FiltersModal.vue';

// Props
interface Props {
  /** Placeholder del searchbar */
  placeholder?: string;
  /** ID del searchbar */
  searchbarId?: string;
  /** Clases CSS adicionales */
  searchbarClass?: string;
  /** Valor inicial de búsqueda */
  initialValue?: string;
  /** Si debe abrir filtros al hacer focus */
  openFiltersOnFocus?: boolean;
  /** Página de destino para la navegación */
  targetPage?: 'geosearch' | 'providers' | 'results' | 'custom';
  /** Ruta personalizada si targetPage es 'custom' */
  customRoute?: string;
  /** Si debe navegar automáticamente al aplicar filtros */
  autoNavigate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Buscar profesional...",
  searchbarId: "main-searchbar",
  searchbarClass: "custom-searchbar",
  initialValue: "",
  openFiltersOnFocus: true,
  targetPage: "geosearch",
  customRoute: "",
  autoNavigate: true
});

// Emits
const emit = defineEmits<{
  /** Emitido cuando cambia el texto de búsqueda */
  input: [value: string];
  /** Emitido cuando se hace focus en el searchbar */
  focus: [];
  /** Emitido cuando se pierde el focus */
  blur: [];
  /** Emitido cuando se limpia el searchbar */
  clear: [];
  /** Emitido cuando se aplican filtros */
  filtersApplied: [filters: any];
  /** Emitido cuando se inicia una búsqueda */
  search: [query: string, filters: any];
  /** Emitido antes de navegar (permite cancelar navegación) */
  beforeNavigate: [navigationData: { route: string; query: Record<string, any> }];
}>();

// Router para navegación
const ionRouter = useIonRouter();

// Estado reactivo
const searchQuery = ref(props.initialValue);
const isFilterModalOpen = ref(false);
const currentFilters = ref({});

// Métodos del searchbar
const handleInput = (event: any) => {
  searchQuery.value = event.target.value;
  emit('input', searchQuery.value);
};

const handleFocus = () => {
  emit('focus');
  if (props.openFiltersOnFocus) {
    openFilterModal();
  }
};

const handleBlur = () => {
  emit('blur');
};

const handleClear = () => {
  searchQuery.value = "";
  emit('clear');
};

// Métodos del modal de filtros
const openFilterModal = () => {
  isFilterModalOpen.value = true;
};

const closeFilterModal = () => {
  isFilterModalOpen.value = false;
};

const applyFilters = async (filters: any) => {
  console.log('Filtros aplicados desde SearchBarWithFilters:', filters);
  
  // Actualizar filtros actuales
  currentFilters.value = filters;
  
  // Emitir eventos
  emit('filtersApplied', filters);
  emit('search', searchQuery.value, filters);
  
  // Navegar automáticamente si está habilitado
  if (props.autoNavigate) {
    await navigateToResults(filters);
  }
  
  closeFilterModal();
};

// Función para procesar filtros y crear parámetros de navegación
const processFiltersForNavigation = (filters: any) => {
  const queryParams: Record<string, any> = {};
  
  // Agregar query de texto si existe
  if (searchQuery.value && searchQuery.value.trim()) {
    queryParams.q = searchQuery.value.trim();
  }
  
  // Recopilar todas las subcategorías seleccionadas
  const allSubcategories: string[] = [];
  
  if (filters.medicos && filters.medicos.length > 0) {
    allSubcategories.push(...filters.medicos);
  }
  if (filters.informaticos && filters.informaticos.length > 0) {
    allSubcategories.push(...filters.informaticos);
  }
  if (filters.construccion && filters.construccion.length > 0) {
    allSubcategories.push(...filters.construccion);
  }
  if (filters.transporte && filters.transporte.length > 0) {
    allSubcategories.push(...filters.transporte);
  }
  
  // Agregar subcategorías si existen
  if (allSubcategories.length > 0) {
    queryParams.subcategories = allSubcategories;
    // Mapear nombres a IDs - esto debería venir de tu API o base de datos
    queryParams.subcategory_ids = allSubcategories.map((name: string, index: number) => index + 1);
  }
  
  // Procesar experiencia
  if (filters.experience && filters.experience !== 'ninguno') {
    let experienceYears = 0;
    switch (filters.experience) {
      case '1-2':
        experienceYears = 1;
        break;
      case '2-4':
        experienceYears = 2;
        break;
      case 'mas-5':
        experienceYears = 5;
        break;
    }
    if (experienceYears > 0) {
      queryParams.experience_years = experienceYears;
    }
  }
  
  return queryParams;
};

// Función para determinar la ruta de navegación
const getNavigationRoute = () => {
  switch (props.targetPage) {
    case 'geosearch':
      return '/tabs/geosearch';
    case 'providers':
      return '/tabs/providers';
    case 'results':
      return '/tabs/results';
    case 'custom':
      return props.customRoute || '/tabs/geosearch';
    default:
      return '/tabs/geosearch';
  }
};

// Función para navegar a los resultados
const navigateToResults = async (filters: any) => {
  try {
    const queryParams = processFiltersForNavigation(filters);
    const route = getNavigationRoute();
    
    const navigationData = { route, query: queryParams };
    
    // Emitir evento antes de navegar (permite al padre cancelar la navegación)
    emit('beforeNavigate', navigationData);
    
    // Realizar la navegación
    await ionRouter.push({
      path: route,
      query: queryParams
    });
    
    console.log('✅ Navegación exitosa a:', route, 'con parámetros:', queryParams);
    
  } catch (error) {
    console.error('❌ Error en navegación:', error);
  }
};

// Métodos públicos (para acceso desde el padre)
const setValue = (value: string) => {
  searchQuery.value = value;
};

const getValue = () => {
  return searchQuery.value;
};

const getFilters = () => {
  return currentFilters.value;
};

const clearSearch = () => {
  searchQuery.value = "";
  emit('clear');
};

const triggerSearch = async () => {
  emit('search', searchQuery.value, currentFilters.value);
  
  // Navegar automáticamente si está habilitado
  if (props.autoNavigate) {
    await navigateToResults(currentFilters.value);
  }
};

// Exponer métodos para el componente padre
defineExpose({
  setValue,
  getValue,
  getFilters,
  clearSearch,
  triggerSearch,
  openFilterModal,
  navigateToResults,
  processFiltersForNavigation
});
</script>

<style scoped>
@import '@/styles/common.css';

/* === CONTENEDOR DE BÚSQUEDA === */
.search-container {
  width: 100%;
  position: relative;
}

/* === SEARCHBAR PERSONALIZADO === */
.custom-searchbar {
  --background: var(--ion-color-light);
  --border-radius: var(--app-border-radius);
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --color: var(--app-text-primary);
  --placeholder-color: var(--app-text-secondary);
  --icon-color: var(--app-text-secondary);
  --clear-button-color: var(--app-text-secondary);
  margin: 0;
  padding: 0;
  transition: all 0.3s ease;
}

.custom-searchbar:hover {
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-searchbar.searchbar-focused {
  --box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.2);
  --border-color: var(--ion-color-primary);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .custom-searchbar {
    --padding-top: var(--app-spacing-sm);
    --padding-bottom: var(--app-spacing-sm);
  }
}

@media (max-width: 480px) {
  .custom-searchbar {
    --border-radius: var(--app-border-radius-sm);
  }
}
</style>
