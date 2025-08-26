<template>
  <div class="category-section" :data-category-id="category.id" :data-category-name="category.name">
    <div class="category-title">{{ category.name }}</div>
    <div class="professionals-scroll-container">
      <div class="professionals-horizontal">
        <div 
          class="professional-circle" 
          v-for="subcategory in category.subcategories" 
          :key="subcategory.id"
          :data-category-id="category.id"
          :data-subcategory-id="subcategory.id"
          :data-subcategory-name="subcategory.name"
          @click="onSubcategoryClick(subcategory)"
        >
          <div 
            class="circle" 
            :style="{ 
              backgroundImage: subcategory.img ? `url(${subcategory.img})` : 'url(https://placehold.co/70x70)' 
            }"
          ></div>
          <div class="professional-label">{{ subcategory.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  img: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  subcategories: Subcategory[];
}

interface Props {
  category: Category;
}

interface Emits {
  (e: 'subcategory-selected', subcategory: Subcategory): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const onSubcategoryClick = (subcategory: Subcategory) => {
  // Solo emitir el evento para que el componente padre maneje la navegación
  emit('subcategory-selected', subcategory);
};
</script>

<style scoped>
/* === CATEGORÍAS === */
.category-section {
  margin-bottom: var(--app-spacing-lg);
}

.category-title {
  font-size: var(--app-font-size-lg);
  font-weight: var(--app-font-weight-bold);
  margin-top: var(--app-spacing-xl);
  color: var(--app-secondary-color);
  background-color: var(--app-dark-primary);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  border-radius: var(--app-border-radius-md);
  box-shadow: var(--app-shadow-sm);
  transition: var(--app-transition-normal);
}

.category-title:hover {
  background-color: var(--app-accent-color);
  transform: translateY(-2px);
  box-shadow: var(--app-shadow-md);
}

/* === SCROLL HORIZONTAL DE PROFESIONALES === */
.professionals-scroll-container {
  margin-top: var(--app-spacing-md);
  overflow-x: auto;
  overflow-y: hidden;
  /* Ocultar scrollbar en webkit browsers */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.professionals-scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.professionals-horizontal {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--app-spacing-md);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  min-width: max-content;
}

.professional-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  transition: var(--app-transition-normal);
  cursor: pointer;
  flex: 0 0 auto;
  width: 80px;
  min-height: 120px;
}

.professional-circle:hover {
  transform: translateY(-4px);
}

.circle {
  width: 65px;
  height: 65px;
  border-radius: var(--app-border-radius-full);
  background-size: cover;
  background-position: center;
  border: 2px solid var(--app-dark-primary);
  margin: 0 auto var(--app-spacing-sm);
  box-shadow: var(--app-shadow-sm);
  transition: var(--app-transition-normal);
  background-color: var(--ion-color-light);
}

.circle:hover {
  border-color: var(--app-primary-color);
  box-shadow: var(--app-shadow-md);
  transform: scale(1.05);
}

.professional-label {
  font-size: var(--app-font-size-xs);
  color: var(--app-text-primary);
  font-weight: var(--app-font-weight-medium);
  line-height: 1.3;
  text-align: center;
  max-width: 75px;
  word-wrap: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  margin-top: var(--app-spacing-xs);
}

/* === RESPONSIVE === */
@media (max-width: 576px) {
  .professionals-horizontal {
    gap: var(--app-spacing-sm);
    padding: var(--app-spacing-sm);
  }
  
  .professional-circle {
    width: 70px;
    min-height: 110px;
  }
  
  .circle {
    width: 55px;
    height: 55px;
  }
  
  .professional-label {
    font-size: var(--app-font-size-xs);
    max-width: 65px;
  }
}

@media (max-width: 480px) {
  .professional-circle {
    width: 65px;
    min-height: 100px;
  }
  
  .circle {
    width: 50px;
    height: 50px;
  }
  
  .professional-label {
    max-width: 60px;
  }
}
</style>
