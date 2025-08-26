<template>
  <div class="categories-container">
    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <ion-spinner name="crescent"></ion-spinner>
      <p class="loading-text">Cargando categorías...</p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" class="error-state">
      <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
      <p class="error-text">{{ error }}</p>
      <ion-button @click="retryLoad" fill="outline" size="small">
        <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
        Reintentar
      </ion-button>
    </div>

    <!-- Estado exitoso: mostrar categorías -->
    <div v-else-if="categories.length > 0">
      <CategorySection 
        v-for="category in categories" 
        :key="category.id"
        :category="category"
        @subcategory-selected="handleSubcategoryClick"
      />
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <ion-icon :icon="businessOutline" class="empty-icon"></ion-icon>
      <p class="empty-text">No hay categorías disponibles</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonSpinner, 
  IonIcon, 
  IonButton 
} from '@ionic/vue';
import {
  alertCircleOutline,
  refreshOutline,
  businessOutline
} from 'ionicons/icons';

import CategorySection from './CategorySection.vue';
import { useCategories } from '@/composables/useCategories';
import type { Subcategory } from '@/services/categoryService';

// Router de Ionic para navegación
const router = useRouter();

// Usar el composable de categorías
const {
  loading,
  error,
  categories,
  loadCategories,
  retryLoad
} = useCategories();

/**
 * Manejar clic en subcategoría
 */
const handleSubcategoryClick = (subcategory: Subcategory) => {
  // Find the parent category for this subcategory
  const category = categories.value.find(cat => 
    cat.subcategories?.some(sub => sub.id === subcategory.id)
  );
  
  if (!category) {
    console.error('No se pudo encontrar la categoría padre para la subcategoría:', subcategory.name);
    return;
  }

  // Navegar a la página de proveedores de la subcategoría
  console.log('🔄 Navegando a proveedores de subcategoría:', subcategory.name);
  router.push({
    name: 'ProvidersSubcategory',
    params: { categoryId: category.id, subcategoryId: subcategory.id }
  });
};

// Cargar categorías al montar el componente
onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
/* === CONTENEDOR PRINCIPAL === */
.categories-container {
  padding-bottom: var(--app-spacing-3xl);
}

/* === ESTADOS SIMPLES === */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: var(--app-spacing-lg);
  color: var(--app-text-secondary);
}

.error-state {
  color: var(--ion-color-danger);
}
</style>