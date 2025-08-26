<template>
  <ion-modal 
    :is-open="isOpen" 
    @did-dismiss="handleDismiss" 
    class="filter-modal"
    :can-dismiss="true"
    :keyboard-close="true"
    :backdrop-dismiss="true"
  >
    <ion-header>
      <ion-toolbar class="modal-header">
        <ion-title class="modal-title">Filtros de Búsqueda</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="closeModal" class="close-modal-btn">
            <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content">
      <!-- Searchbar del modal -->
      <div class="modal-search-container">
        <ion-searchbar 
          v-model="searchQuery"
          class="modal-searchbar" 
          placeholder="Buscar categoría o subcategoría..."
          show-clear-button="focus">
        </ion-searchbar>
      </div>

      <!-- Categorías con checkboxes -->
      <div class="filters-container">
        
        <!-- Médico -->
        <div class="filter-category">
          <div class="category-header">Médico</div>
          <ion-grid>
            <ion-row>
              <ion-col size="6" v-for="medico in medicos" :key="medico.label">
                <ion-item class="checkbox-item">
                  <ion-checkbox 
                    slot="start" 
                    :checked="selectedMedicos.includes(medico.label)"
                    @ionChange="toggleMedico(medico.label)"
                    class="custom-checkbox">
                  </ion-checkbox>
                  <ion-label class="checkbox-label">{{ medico.label }}</ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- Servicios Informáticos -->
        <div class="filter-category">
          <div class="category-header">Servicios Informáticos</div>
          <ion-grid>
            <ion-row>
              <ion-col size="6" v-for="informatico in informaticos" :key="informatico.label">
                <ion-item class="checkbox-item">
                  <ion-checkbox 
                    slot="start" 
                    :checked="selectedInformaticos.includes(informatico.label)"
                    @ionChange="toggleInformatico(informatico.label)"
                    class="custom-checkbox">
                  </ion-checkbox>
                  <ion-label class="checkbox-label">{{ informatico.label }}</ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- Construcción -->
        <div class="filter-category">
          <div class="category-header">Construcción</div>
          <ion-grid>
            <ion-row>
              <ion-col size="6" v-for="construccionItem in construccion" :key="construccionItem.label">
                <ion-item class="checkbox-item">
                  <ion-checkbox 
                    slot="start" 
                    :checked="selectedConstruccion.includes(construccionItem.label)"
                    @ionChange="toggleConstruccion(construccionItem.label)"
                    class="custom-checkbox">
                  </ion-checkbox>
                  <ion-label class="checkbox-label">{{ construccionItem.label }}</ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- Transporte y Logística -->
        <div class="filter-category">
          <div class="category-header">Transporte y Logística</div>
          <ion-grid>
            <ion-row>
              <ion-col size="6" v-for="transporteItem in transporte" :key="transporteItem.label">
                <ion-item class="checkbox-item">
                  <ion-checkbox 
                    slot="start" 
                    :checked="selectedTransporte.includes(transporteItem.label)"
                    @ionChange="toggleTransporte(transporteItem.label)"
                    class="custom-checkbox">
                  </ion-checkbox>
                  <ion-label class="checkbox-label">{{ transporteItem.label }}</ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- Años de Experiencia -->
        <div class="filter-category">
          <div class="category-header">Años de Experiencia</div>
          <ion-radio-group v-model="selectedExperience">
            <ion-item v-for="option in experienceOptions" :key="option.value" class="radio-item">
              <ion-radio 
                slot="start" 
                :value="option.value"
                class="custom-radio">
              </ion-radio>
              <ion-label class="radio-label">{{ option.label }}</ion-label>
            </ion-item>
          </ion-radio-group>
        </div>

      </div>

      <!-- Botones de acción - disposición vertical -->
      <div class="modal-actions">
        <ion-button 
          fill="outline" 
          @click="handleClearFilters"
          class="clear-btn">
          Limpiar Filtros
        </ion-button>
        <ion-button 
          @click="handleApplyFilters"
          class="search-btn">
          <ion-icon :icon="searchOutline" slot="start"></ion-icon>
          Buscar
        </ion-button>
      </div>

    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonCheckbox,
  IonLabel,
  IonRadio,
  IonRadioGroup
} from '@ionic/vue';
import { closeOutline, searchOutline } from 'ionicons/icons';
import { useProfessionalCategories } from '@/composables/useProfessionalCategories';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
  applyFilters: [filters: any];
}>();

// Usar el composable centralizado
const {
  experienceOptions,
  medicos,
  informaticos,
  construccion,
  transporte,
  searchQuery,
  selectedExperience,
  selectedMedicos,
  selectedInformaticos,
  selectedConstruccion,
  selectedTransporte,
  toggleMedico,
  toggleInformatico,
  toggleConstruccion,
  toggleTransporte,
  clearFilters,
  getActiveFilters
} = useProfessionalCategories();

const closeModal = () => {
  emit('close');
};

const handleDismiss = () => {
  emit('close');
};

const handleClearFilters = () => {
  clearFilters();
};

const handleApplyFilters = () => {
  const filters = getActiveFilters();
  console.log('Aplicar filtros:', filters);
  emit('applyFilters', filters);
  closeModal();
};
</script>

<style scoped>
.filter-modal {
  --width: 100%;
  --height: 85%;
  --border-radius: var(--app-border-radius-xl) var(--app-border-radius-xl) 0 0;
}

.modal-header {
  --background: var(--app-primary-color);
  --color: var(--app-secondary-color);
  --border-width: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-weight: var(--app-font-weight-bold);
  color: var(--app-secondary-color);
  font-size: var(--app-font-size-xl);
}

.close-modal-btn {
  --color: var(--app-secondary-color);
  font-size: var(--app-font-size-xl);
}

.close-modal-btn:hover {
  --color: var(--app-accent-color);
}

.modal-content {
  --background: var(--app-primary-color);
}

/* === SEARCHBAR DEL MODAL === */
.modal-search-container {
  padding: var(--app-spacing-md);
  background: var(--app-primary-color);
}

.modal-searchbar {
  --background: var(--app-background-main);
  --color: var(--app-text-primary);
  --placeholder-color: var(--app-text-primary);
  --border-radius: var(--app-border-radius-lg);
  --box-shadow: var(--app-shadow-md);
}

/* === CONTENEDOR DE FILTROS === */
.filters-container {
  padding: var(--app-spacing-md);
}

.filter-category {
  margin-bottom: var(--app-spacing-lg);
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.category-header {
  font-size: var(--app-font-size-lg);
  font-weight: var(--app-font-weight-bold);
  color: var(--app-secondary-color);
  margin-bottom: var(--app-spacing-md);
  padding-bottom: var(--app-spacing-sm);
  border-bottom: 1px solid var(--app-secondary-color);
}

/* === CHECKBOXES === */
.checkbox-item {
  --background: transparent;
  --border-color: transparent;
  --inner-border-width: 0;
  --padding-start: 0;
  --padding-end: 0;
  --min-height: 40px;
  margin: var(--app-spacing-xs) 0;
}

.custom-checkbox {
  --background: var(--app-accent-color);
  --background-checked: var(--app-accent-color);
  --border-color: var(--app-accent-color);
  --border-color-checked: var(--app-accent-color);
  --checkmark-color: white;
  --checkmark-color-checked: white;
  --border-radius: var(--app-border-radius-sm);
  --border-width: 2px;
  margin-right: var(--app-spacing-md);
  width: 20px;
  height: 20px;
}

.checkbox-label {
  color: var(--app-secondary-color);
  font-size: var(--app-font-size-base);
  font-weight: var(--app-font-weight-normal);
  line-height: 1.4;
}

/* === RADIO BUTTONS === */
.radio-item {
  --background: transparent;
  --border-color: transparent;
  --inner-border-width: 0;
  --padding-start: var(--app-spacing-sm);
  --padding-end: 0;
  --min-height: 45px;
  margin: var(--app-spacing-sm) 0;
}

.custom-radio {
  --background: transparent;
  --background-checked: var(--app-accent-color);
  --border-color: var(--app-accent-color);
  --border-color-checked: var(--app-accent-color);
  --color: var(--app-accent-color);
  --color-checked: white;
  --border-width: 3px;
  margin-right: var(--app-spacing-md);
  width: 24px;
  height: 24px;
  opacity: 1 !important;
  transform: scale(1.2);
}

/* Asegurar que el checkbox sea visible y tenga forma correcta */
.custom-checkbox::part(container) {
  border: 2px solid var(--app-accent-color) !important;
  background: transparent !important;
  width: 20px;
  height: 20px;
  border-radius: var(--app-border-radius-sm) !important;
  margin-left: 2px;
}

.custom-checkbox::part(mark) {
  background: var(--app-accent-color) !important;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  transform: scale(0);
  transition: transform 0.2s ease;
}

.custom-checkbox.checkbox-checked::part(mark) {
  transform: scale(1);
}

/* Asegurar que el radio button sea visible y circular */
.custom-radio::part(container) {
  border: 3px solid var(--app-accent-color) !important;
  background: transparent !important;
  width: 18px;
  height: 18px;
  border-radius: 50% !important;
  margin-left: 2px;
}

.custom-radio::part(mark) {
  background: var(--app-accent-color) !important;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.2s ease;
}

.custom-radio.radio-checked::part(mark) {
  transform: scale(1);
}

.radio-label {
  color: var(--app-secondary-color);
  font-size: var(--app-font-size-base);
  font-weight: var(--app-font-weight-normal);
  line-height: 1.4;
}

/* === BOTONES DE ACCIÓN === */
.modal-actions {
  position: sticky;
  bottom: 0;
  background: var(--app-primary-color);
  padding: var(--app-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-md);
  border-top: 1px solid var(--app-secondary-color);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.clear-btn {
  --border-color: var(--app-secondary-color);
  --color: var(--app-secondary-color);
  --border-radius: var(--app-border-radius-lg);
  --border-width: 1px;
  font-weight: var(--app-font-weight-medium);
  height: 48px;
}

.clear-btn:hover {
  --background: var(--app-secondary-transparent);
  --border-color: var(--app-accent-color);
  --color: var(--app-accent-color);
}

.search-btn {
  --background: var(--app-accent-color);
  --color: white;
  --border-radius: var(--app-border-radius-lg);
  font-weight: var(--app-font-weight-semibold);
  height: 48px;
}

.search-btn:hover {
  --background: var(--app-secondary-color);
  --color: var(--app-primary-color);
  transform: translateY(-1px);
  box-shadow: var(--app-shadow-md);
}
</style>
