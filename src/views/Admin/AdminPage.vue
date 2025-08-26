<template>
  <ion-page>
    <!-- Header reutilizable -->
    <PageHeader profile-trigger-id="admin-profile-trigger" />

    <!-- Menú desplegable del perfil -->
    <ProfilePopover 
      trigger-id="admin-profile-trigger" 
      user-type="admin" 
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
        />
        <LocationSearchButton 
          :initial-radius="30"
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

import { ref } from 'vue';

// Importar componentes optimizados
import PageHeader from '@/components/PageHeader.vue';
import ProfilePopover from '@/components/ProfilePopover.vue';
import CategoriesDisplay from '@/components/CategoriesDisplay.vue';
import LocationSearchButton from '@/components/LocationSearchButton.vue';
import SearchBarWithFilters from '@/components/SearchBarWithFilters.vue';

// Estado para filtros actuales
const currentFilters = ref({});

// Función para manejar búsqueda desde el searchbar
const handleSearch = (query: string, filters: any) => {
  console.log('🔍 Búsqueda desde searchbar en AdminPage:', { query, filters });
  currentFilters.value = filters;
};

// Función para manejar aplicación de filtros
const handleFiltersApplied = (filters: any) => {
  console.log('Filtros aplicados desde AdminPage:', filters);
  currentFilters.value = filters;
};

// Función para manejar búsqueda con ubicación desde el componente
const handleLocationSearch = (params: { radius: number; filters: Record<string, any> }) => {
  console.log('🔍 Búsqueda con ubicación iniciada desde AdminPage:', params);
  currentFilters.value = params.filters;
};
</script>

<style scoped>
/* No hay estilos adicionales - se usan los estilos de common.css */
@import '@/styles/common.css';
</style>
