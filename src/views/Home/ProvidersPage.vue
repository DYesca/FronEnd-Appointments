<template>
  <ion-page>
    <!-- Header reutilizable -->
    <PageHeader profile-trigger-id="client-profile-trigger" />

    <!-- Menú desplegable del perfil -->
    <ProfilePopover 
      trigger-id="client-profile-trigger" 
      user-type="client" 
    />

    <ion-content class="ion-padding">
      <div class="search-location-container">
        <SearchBarWithFilters 
          placeholder="Buscar profesional..."
          searchbar-id="main-searchbar"
          target-page="providers"
          :auto-navigate="false"
          @search="handleSearch"
          @filters-applied="handleFiltersApplied"
        />
        <LocationSearchButton 
          :initial-radius="30"
          :filters="currentFilters"
          @search="handleLocationSearch"
        />
      </div>

      <!-- Información de la subcategoría seleccionada -->
      <div v-if="subcategoryInfo" class="subcategory-header">
        <div class="breadcrumb">
          <span class="category-name">{{ subcategoryInfo.category }}</span>
          <ion-icon :icon="chevronForwardOutline" class="breadcrumb-separator"></ion-icon>
          <span class="subcategory-name">{{ subcategoryInfo.name }}</span>
        </div>
        <h2 class="page-title">Proveedores de {{ subcategoryInfo.name }}</h2>
      </div>

      <!-- Lista de proveedores -->
      <ProvidersList
        :providers="providers"
        :loading="loading"
        :error="error"
        @provider-selected="handleProviderSelected"
        @contact-provider="handleContactProvider"
        @view-profile="handleViewProfile"
        @retry="loadProviders"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonContent,
  IonIcon
} from '@ionic/vue';

import { chevronForwardOutline } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useIonRouter } from '@ionic/vue';

// Importar componentes
import PageHeader from '@/components/PageHeader.vue';
import ProfilePopover from '@/components/ProfilePopover.vue';
import ProvidersList from '@/components/ProvidersList.vue';
import LocationSearchButton from '@/components/LocationSearchButton.vue';
import SearchBarWithFilters from '@/components/SearchBarWithFilters.vue';

// Importar servicios
import { providerService, type Provider } from '@/services/providerService';

// Estado para filtros actuales
const currentFilters = ref({});

// Estado de los proveedores
const providers = ref<Provider[]>([]);
const loading = ref(false);
const error = ref('');

// Información de la subcategoría
const subcategoryInfo = ref<{
  id: number;
  name: string;
  category: string;
  category_id: number;
} | null>(null);

// Router - useRoute para obtener parámetros, useIonRouter para navegación
const route = useRoute();
const ionRouter = useIonRouter();

// Función para manejar búsqueda desde el searchbar
const handleSearch = (query: string, filters: any) => {
  console.log('🔍 Búsqueda desde searchbar en ProvidersPage:', { query, filters });
  
  // Actualizar filtros actuales
  currentFilters.value = filters;
  
  // Aquí podrías implementar lógica de búsqueda específica
  // Por ejemplo, filtrar providers.value basado en el query y filtros
};

// Función para manejar aplicación de filtros
const handleFiltersApplied = (filters: any) => {
  console.log('Filtros aplicados desde ProvidersPage:', filters);
  
  // Actualizar filtros actuales
  currentFilters.value = filters;
  
  // TODO: Aplicar filtros y recargar proveedores
  // Podrías llamar a loadProviders() con los nuevos filtros
};

// Función para manejar búsqueda con ubicación desde el componente
const handleLocationSearch = (params: { radius: number; filters: Record<string, any> }) => {
  console.log('🔍 Búsqueda con ubicación iniciada desde ProvidersPage:', params);
  currentFilters.value = params.filters;
  // Aquí podrías agregar lógica específica para la búsqueda geográfica si es necesario
};

/**
 * Carga los proveedores según la subcategoría
 */
const loadProviders = async () => {
  // Obtener el subcategoryId de los parámetros de la ruta
  const subcategory = Number(route.params.subcategoryId);
  const category = Number(route.params.categoryId);
  
  if (!subcategory) {
    error.value = 'ID de subcategoría no válido';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await providerService.getProvidersBySubcategory(category,subcategory);
    
    if (response.success && response.data) {
      providers.value = response.data;
      
      // Si hay proveedores, usar la información del primero para obtener datos de la subcategoría
      if (response.data.length > 0) {
        const firstProvider = response.data[0];
        subcategoryInfo.value = {
          id: firstProvider.subcategory.id,
          name: firstProvider.subcategory.name,
          category: firstProvider.category.name,
          category_id: firstProvider.category.id
        };
      }
    } else {
      error.value = response.message || 'Error al cargar proveedores';
    }
  } catch (err: any) {
    error.value = 'Error de conexión al cargar proveedores';
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * Maneja la selección de un proveedor
 */
const handleProviderSelected = (provider: Provider) => {
  console.log('🔄 Proveedor seleccionado:', {
    nombre: `${provider.user.first_name} ${provider.user.last_name}`,
    especialidad: provider.subcategory.name,
    email: provider.user.email,
    telefono: provider.provider.phone_number,
    ubicacion: provider.provider.location,
    experiencia: provider.provider.experience_years,
    provider: provider
  });
};

/**
 * Maneja el contacto con un proveedor
 */
const handleContactProvider = (provider: Provider) => {
  console.log('📞 Contactar proveedor:', provider.user.first_name, provider.user.last_name);
  // TODO: Implementar lógica de contacto (chat, email, etc.)
};

/**
 * Maneja ver el perfil de un proveedor
 */
const handleViewProfile = (provider: Provider) => {
  console.log('👤 Ver perfil de:', provider.user.first_name, provider.user.last_name);
  // TODO: Navegar a página de perfil del proveedor
};

// Cargar proveedores al montar el componente
onMounted(() => {
  loadProviders();
});
</script>

<style scoped>
@import '@/styles/common.css';

/* === HEADER DE SUBCATEGORÍA === */
.subcategory-header {
  margin-bottom: var(--app-spacing-lg);
  padding: var(--app-spacing-md) 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-xs);
  margin-bottom: var(--app-spacing-sm);
  font-size: var(--app-font-size-sm);
}

.category-name {
  color: var(--app-text-secondary);
  font-weight: var(--app-font-weight-medium);
}

.breadcrumb-separator {
  font-size: 14px;
  color: var(--app-text-secondary);
}

.subcategory-name {
  color: var(--app-primary-color);
  font-weight: var(--app-font-weight-bold);
}

.page-title {
  font-size: var(--app-font-size-xl);
  font-weight: var(--app-font-weight-bold);
  color: var(--app-text-primary);
  margin: 0;
  line-height: 1.2;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .subcategory-header {
    padding: var(--app-spacing-sm) 0;
  }
  
  .page-title {
    font-size: var(--app-font-size-lg);
  }
}
</style>
