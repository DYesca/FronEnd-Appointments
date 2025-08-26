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
      <div class="search-location-container">
        <SearchBarWithFilters 
          placeholder="Buscar profesional..."
          searchbar-id="main-searchbar"
          target-page="geosearch"
          :auto-navigate="true"
          @search="handleSearch"
          @filters-applied="handleFiltersApplied"
          @before-navigate="handleBeforeNavigate"
        />
        <LocationSearchButton 
          :initial-radius="searchRadius"
          :filters="currentFilters"
          @search="handleLocationSearch"
        />
      </div>

      <!-- Categorías -->
      <CategoriesDisplay />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonContent
} from '@ionic/vue';

import { ref, onMounted, onUnmounted } from 'vue';
import { useIonRouter } from '@ionic/vue';

// Importar componentes optimizados
import PageHeader from '@/components/PageHeader.vue';
import ProfilePopover from '@/components/ProfilePopover.vue';
import CategoriesDisplay from '@/components/CategoriesDisplay.vue';
import LocationSearchButton from '@/components/LocationSearchButton.vue';
import SearchBarWithFilters from '@/components/SearchBarWithFilters.vue';
import { useProfileActions } from '@/composables/useProfileActions';

//// Importar composable optimizado
const { currentUserType, setupEventListeners, cleanupEventListeners } = useProfileActions();

// Router para navegación
const ionRouter = useIonRouter();

onMounted(() => {
  setupEventListeners();
});

onUnmounted(() => {
  cleanupEventListeners();
});

// Estado para filtros actuales
const currentFilters = ref({});

// Estado del radio de búsqueda (para sincronización con el componente)
const searchRadius = ref(30);

// Función para manejar búsqueda con ubicación desde el componente
const handleLocationSearch = (params: { radius: number; filters: Record<string, any> }) => {
  console.log('🔍 Búsqueda con ubicación iniciada:', params);
  searchRadius.value = params.radius;
  currentFilters.value = params.filters;
};

// Función para manejar búsqueda desde el searchbar
const handleSearch = (query: string, filters: any) => {
  console.log('🔍 Búsqueda desde searchbar:', { query, filters });
  
  // Actualizar filtros actuales
  currentFilters.value = filters;
  
  // La navegación ahora se maneja automáticamente por el componente
};

// Función para manejar aplicación de filtros
const handleFiltersApplied = (filters: any) => {
  console.log('Filtros aplicados desde HomePage:', filters);
  
  // Actualizar filtros actuales
  currentFilters.value = filters;
  
  // La navegación ahora se maneja automáticamente por el componente
};

// Función para manejar evento antes de navegar (opcional)
const handleBeforeNavigate = (navigationData: { route: string; query: Record<string, any> }) => {
  console.log('🧭 A punto de navegar a:', navigationData);
  
  // Aquí podrías agregar lógica adicional antes de la navegación
  // Por ejemplo, validaciones, analytics, etc.
  
  // Si quisieras cancelar la navegación, podrías hacer algo aquí
  // Pero por ahora solo registramos la navegación
};
</script>

<style scoped>
@import '@/styles/common.css';
</style>
