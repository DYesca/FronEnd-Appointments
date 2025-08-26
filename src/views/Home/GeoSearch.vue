<template>
  <ion-page>
    <!-- Header reutilizable -->
    <PageHeader profile-trigger-id="client-profile-trigger" />

    <!-- Menú desplegable del perfil -->
    <ProfilePopover 
      trigger-id="client-profile-trigger" 
      :user-type="currentUserType"
    />

    <ion-content class="ion-padding">
      <!-- Barra de búsqueda -->
      <div class="search-section">
        <SearchBarWithFilters
          placeholder="Buscar profesional en esta zona..."
          target-page="geosearch"
          :auto-navigate="false"
          @filters-applied="handleFiltersApplied"
          @search="handleSearch"
        />
      </div>

      <!-- Header de búsqueda -->
      <div class="search-header">
        <div class="search-info">
          <h2 class="search-title">Resultados de Búsqueda</h2>
        </div>
        
        <!-- Botón de ubicación componentizado -->
        <LocationSearchButton
          :initial-radius="searchRadius"
          :filters="appliedFilters"
          @search="handleLocationSearch"
        />
      </div>

      <!-- Filtros aplicados -->
      <div v-if="hasActiveFilters" class="active-filters">
        <div class="filters-header">
          <h3>Filtros Aplicados:</h3>
          <ion-button 
            fill="clear" 
            size="small" 
            @click="clearAllFilters"
          >
            Limpiar Todo
          </ion-button>
        </div>
        <div class="filter-chips">
          <ion-chip 
            v-for="filter in activeFiltersDisplay" 
            :key="filter.key"
            color="primary"
          >
            <ion-label>{{ filter.label }}</ion-label>
            <ion-icon :icon="closeOutline" @click="removeFilter(filter.key)"></ion-icon>
          </ion-chip>
        </div>
      </div>

      <!-- Lista de proveedores -->
      <ProvidersList
        :providers="providers"
        :loading="loading"
        :error="error"
        @provider-selected="handleProviderSelected"
        @contact-provider="handleContactProvider"
        @view-profile="handleViewProfile"
        @retry="performSearch"
      />

      <!-- Botón flotante para nueva búsqueda -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="goBackToHome">
          <ion-icon :icon="searchOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonContent,
  IonChip,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  alertController
} from '@ionic/vue';
import { 
  closeOutline, 
  searchOutline 
} from 'ionicons/icons';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useIonRouter } from '@ionic/vue';

// Componentes
import LocationSearchButton from '@/components/LocationSearchButton.vue';
import PageHeader from '@/components/PageHeader.vue';
import ProfilePopover from '@/components/ProfilePopover.vue';
import ProvidersList from '@/components/ProvidersList.vue';
import SearchBarWithFilters from '@/components/SearchBarWithFilters.vue';

// Composables y servicios
import { useProfileActions } from '@/composables/useProfileActions';
import { useGeolocation } from '@/composables/useGeolocation';
import { geoSearchService, type GeoSearchParams } from '@/services/geoSearchService';
import type { Provider } from '@/services/providerService';

// Setup de composables
const { currentUserType } = useProfileActions();
const { 
  currentLocation, 
  getLocation,
  initialize: initializeGeolocation
} = useGeolocation();

const route = useRoute();
const ionRouter = useIonRouter();

// Estados reactivos
const providers = ref<Provider[]>([]);
const loading = ref(false);
const error = ref('');
const searchRadius = ref(30);

// Filtros de búsqueda
const appliedFilters = ref<{
  subcategories: string[];
  subcategory_ids: number[];
  experience_years: number | null;
}>({
  subcategories: [],
  subcategory_ids: [],
  experience_years: null
});

// Computed properties

const hasActiveFilters = computed(() => {
  return appliedFilters.value.subcategories.length > 0 || 
         appliedFilters.value.experience_years !== null;
});

const activeFiltersDisplay = computed(() => {
  const filters = [];
  
  // Filtros de subcategorías
  appliedFilters.value.subcategories.forEach(sub => {
    filters.push({
      key: `subcategory_${sub}`,
      label: sub
    });
  });
  
  // Filtro de experiencia
  if (appliedFilters.value.experience_years !== null) {
    filters.push({
      key: 'experience',
      label: `${appliedFilters.value.experience_years}+ años exp.`
    });
  }
  
  return filters;
});

// Métodos para los componentes
const handleFiltersApplied = (filters: any) => {
  console.log('🔍 Filtros aplicados:', filters);
  
  // Actualizar filtros aplicados
  appliedFilters.value = {
    subcategories: filters.subcategories || [],
    subcategory_ids: filters.subcategory_ids || [],
    experience_years: filters.experience_years || null
  };
  
  // Realizar búsqueda con nuevos filtros
  performSearch();
};

const handleSearch = (query: string, filters: any) => {
  console.log('🔍 Búsqueda:', query, filters);
  handleFiltersApplied(filters);
};

const handleLocationSearch = (params: { radius: number; filters: Record<string, any> }) => {
  console.log('📍 Búsqueda por ubicación:', params);
  
  // Actualizar radio - esto se sincronizará automáticamente con el valor guardado
  searchRadius.value = params.radius;
  
  // Actualizar filtros si los hay
  if (params.filters && Object.keys(params.filters).length > 0) {
    Object.assign(appliedFilters.value, params.filters);
  }
  
  // Realizar búsqueda
  performSearch();
};

const performSearch = async () => {
  if (!currentLocation.value) {
    // Intentar obtener ubicación usando el método getLocation que maneja cache y permisos
    try {
      const location = await getLocation(false); // false = no forzar refresh, usar cache si existe
      if (!location) {
        // Solo mostrar modal si realmente no se pudo obtener ubicación
        const alert = await alertController.create({
          header: 'Ubicación Requerida',
          message: 'Necesitamos tu ubicación para realizar la búsqueda.',
          buttons: [
            {
              text: 'Obtener Ubicación',
              handler: async () => {
                const newLocation = await getLocation(true); // true = forzar nueva ubicación
                if (newLocation) {
                  await performSearch();
                }
              }
            },
            {
              text: 'Cancelar',
              role: 'cancel'
            }
          ]
        });
        await alert.present();
        return;
      }
    } catch (error) {
      console.warn('Error obteniendo ubicación:', error);
      return;
    }
  }

  loading.value = true;
  error.value = '';

  try {
    // Verificar que tenemos ubicación antes de continuar
    if (!currentLocation.value) {
      error.value = 'No se pudo obtener la ubicación';
      return;
    }

    const searchParams: GeoSearchParams = {
      long: currentLocation.value.longitude,
      lat: currentLocation.value.latitude,
      range_km: searchRadius.value
    };

    // Agregar filtros opcionales
    if (appliedFilters.value.subcategory_ids.length > 0) {
      searchParams.subcategories_id = appliedFilters.value.subcategory_ids;
    }

    if (appliedFilters.value.experience_years !== null) {
      searchParams.experience_years = appliedFilters.value.experience_years;
    }

    console.log('🔍 Parámetros de búsqueda:', searchParams);

    const response = await geoSearchService.searchProviders(searchParams);

    if (response.success) {
      providers.value = response.data;
      console.log(`✅ ${response.data.length} proveedores encontrados`);
    } else {
      error.value = response.message || 'Error en la búsqueda';
    }

  } catch (err: any) {
    console.error('❌ Error en búsqueda:', err);
    error.value = 'Error de conexión. Intenta nuevamente.';
  } finally {
    loading.value = false;
  }
};

const removeFilter = (filterKey: string) => {
  if (filterKey === 'experience') {
    appliedFilters.value.experience_years = null;
  } else if (filterKey.startsWith('subcategory_')) {
    const subcategory = filterKey.replace('subcategory_', '');
    const index = appliedFilters.value.subcategories.indexOf(subcategory);
    if (index > -1) {
      appliedFilters.value.subcategories.splice(index, 1);
      appliedFilters.value.subcategory_ids.splice(index, 1);
    }
  }
  performSearch();
};

const clearAllFilters = () => {
  appliedFilters.value = {
    subcategories: [],
    subcategory_ids: [],
    experience_years: null
  };
  performSearch();
};

const handleProviderSelected = (provider: Provider) => {
  console.log('🔄 Proveedor seleccionado:', provider);
};

const handleContactProvider = (provider: Provider) => {
  console.log('📞 Contactar proveedor:', provider);
};

const handleViewProfile = (provider: Provider) => {
  console.log('👤 Ver perfil:', provider);
};

const goBackToHome = () => {
  ionRouter.push('/home');
};

// Lifecycle
onMounted(async () => {
  // Inicializar geolocalización (carga ubicación desde cache si existe)
  await initializeGeolocation();
  
  // Cargar radio guardado desde preferences
  await loadSavedRadius();
  
  // Procesar parámetros de la ruta
  const queryParams = route.query;
  
  if (queryParams.subcategories) {
    appliedFilters.value.subcategories = Array.isArray(queryParams.subcategories) 
      ? queryParams.subcategories as string[]
      : [queryParams.subcategories as string];
  }
  
  if (queryParams.subcategory_ids) {
    const ids = Array.isArray(queryParams.subcategory_ids) 
      ? queryParams.subcategory_ids 
      : [queryParams.subcategory_ids];
    appliedFilters.value.subcategory_ids = ids.map(id => parseInt(id as string));
  }
  
  if (queryParams.experience_years) {
    appliedFilters.value.experience_years = parseInt(queryParams.experience_years as string);
  }
  
  // Realizar búsqueda inicial
  await performSearch();
});

// Watch para cambios en ubicación
watch(currentLocation, (newLocation) => {
  if (newLocation && providers.value.length === 0) {
    performSearch();
  }
});

// Watch para mantener sincronizado el searchRadius con el valor guardado
watch(searchRadius, async (newRadius) => {
  try {
    // Guardar el nuevo valor en preferences automáticamente
    await geoSearchService.saveSearchRadius(newRadius);
    console.log('✅ Radio actualizado en preferences:', newRadius);
  } catch (error) {
    console.warn('Error guardando radio en preferences:', error);
  }
});

// Función para cargar el radio desde preferences
const loadSavedRadius = async () => {
  try {
    const savedRadius = await geoSearchService.getSavedSearchRadius();
    if (savedRadius !== searchRadius.value) {
      searchRadius.value = savedRadius;
      console.log('✅ Radio cargado desde preferences:', savedRadius);
    }
  } catch (error) {
    console.warn('Error cargando radio desde preferences:', error);
  }
};
</script>

<style scoped>
@import '@/styles/common.css';

/* === SECCIÓN DE BÚSQUEDA === */
.search-section {
  margin-bottom: var(--app-spacing-lg);
}

/* === HEADER DE BÚSQUEDA === */
.search-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--app-spacing-lg);
  gap: var(--app-spacing-md);
}

.search-info {
  flex: 1;
}

.search-title {
  font-size: var(--app-font-size-xl);
  font-weight: var(--app-font-weight-bold);
  color: var(--app-text-primary);
  margin: 0 0 var(--app-spacing-xs) 0;
}

.search-subtitle {
  font-size: var(--app-font-size-sm);
  color: var(--app-text-secondary);
  margin: 0;
}

/* === FILTROS ACTIVOS === */
.active-filters {
  background: var(--ion-color-light);
  border-radius: var(--app-border-radius-md);
  padding: var(--app-spacing-md);
  margin-bottom: var(--app-spacing-lg);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-spacing-sm);
}

.filters-header h3 {
  font-size: var(--app-font-size-md);
  font-weight: var(--app-font-weight-semibold);
  color: var(--app-text-primary);
  margin: 0;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-spacing-xs);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .search-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .location-button {
    align-self: flex-start;
  }
  
  .radius-actions {
    flex-direction: column;
  }
}
</style>
