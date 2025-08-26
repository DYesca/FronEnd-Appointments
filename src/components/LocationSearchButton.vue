<template>
  <!-- Botón de ubicación -->
  <ion-button class="location-button" @click="openLocationModal">
    <ion-icon :icon="locationOutline" slot="start"></ion-icon>
    Ubicación
  </ion-button>

  <!-- Modal de Radio de Búsqueda -->
  <ion-modal
    :is-open="isLocationModalOpen"
    @did-dismiss="closeLocationModal"
    class="location-modal"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Radio de Búsqueda</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="closeLocationModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="location-modal-content ion-padding">
        <div class="radius-display">
          <h3>{{ searchRadius }} kilómetros</h3>
          <p>Buscar proveedores en este radio</p>
          <div class="radius-info">
            <span class="radius-description">{{
              getRadiusDescription(searchRadius)
            }}</span>
          </div>
        </div>

        <div class="slider-container">
          <ion-range
            v-model="searchRadius"
            :min="10"
            :max="100"
            :step="1"
            :pin="true"
            :snaps="false"
            :ticks="false"
            color="primary"
            class="radius-slider"
            @ionInput="onRangeChange"
          >
            <ion-label slot="start" class="range-label">10km</ion-label>
            <ion-label slot="end" class="range-label">100km</ion-label>
          </ion-range>

          <!-- Marcadores visuales del slider -->
          <div class="range-markers">
            <div class="marker" :class="{ active: searchRadius >= 5 }">
              <span>5km</span>
            </div>
            <div class="marker" :class="{ active: searchRadius >= 15 }">
              <span>15km</span>
            </div>
            <div class="marker" :class="{ active: searchRadius >= 30 }">
              <span>30km</span>
            </div>
            <div class="marker" :class="{ active: searchRadius >= 50 }">
              <span>50km</span>
            </div>
            <div class="marker" :class="{ active: searchRadius >= 75 }">
              <span>75km</span>
            </div>
          </div>

          <!-- Botones de valores predefinidos -->
          <div class="quick-values">
            <ion-button
              v-for="value in quickValues"
              :key="value"
              size="small"
              fill="outline"
              :color="searchRadius === value ? 'primary' : 'medium'"
              @click="setQuickValue(value)"
              class="quick-value-btn"
            >
              {{ value }}km
            </ion-button>
          </div>
        </div>

        <div class="location-actions">
          <ion-button fill="outline" @click="closeLocationModal">
            Cancelar
          </ion-button>
          <ion-button @click="applyRadius">
            Aplicar
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonRange,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";

import { locationOutline, closeOutline } from "ionicons/icons";
import { ref, onMounted, watch } from "vue";
import { preferencesService } from "@/services/preferencesService";

// Función utilitaria para debounce
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Props
interface Props {
  /** Radio inicial de búsqueda */
  initialRadius?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialRadius: 30,
});

// Emits
const emit = defineEmits<{
  /** Emitido cuando se cambia el radio de búsqueda */
  radiusChanged: [radius: number];
}>();

// Router para navegación
// const ionRouter = useIonRouter(); // Eliminado - ya no se necesita

// Estado del modal de ubicación
const isLocationModalOpen = ref(false);
const searchRadius = ref(props.initialRadius);

// Valores predefinidos para acceso rápido
const quickValues = ref([5, 15, 30, 50, 75]);

// Función para guardar en preferences con debounce
const saveRadiusToPreferences = debounce(async (radius: number) => {
  try {
    await preferencesService.set('search_radius', radius.toString());
    console.log('✅ Radio guardado en preferences (debounced):', radius);
  } catch (error) {
    console.warn("Error guardando radio en preferences:", error);
  }
}, 500); // 500ms de delay

// Funciones para manejar modal de ubicación
const openLocationModal = () => {
  isLocationModalOpen.value = true;
};

const closeLocationModal = () => {
  isLocationModalOpen.value = false;
};

// Función para obtener descripción del radio
const getRadiusDescription = (radius: number): string => {
  if (radius <= 5) return "Área muy cercana";
  if (radius <= 15) return "Zona local";
  if (radius <= 30) return "Área metropolitana";
  if (radius <= 50) return "Región amplia";
  if (radius <= 75) return "Área extendida";
  return "Búsqueda provincial";
};

// Función para manejar cambios en el slider
const onRangeChange = (event: any) => {
  const newRadius = event.detail.value;
  searchRadius.value = newRadius;
  
  // Emitir evento inmediatamente para feedback visual
  emit("radiusChanged", newRadius);
  
  // Guardar en preferences con debounce para evitar llamadas excesivas
  saveRadiusToPreferences(newRadius);
  
  console.log('🔄 Radio actualizado desde slider:', newRadius);
};

// Función para establecer valores rápidos
const setQuickValue = async (value: number) => {
  searchRadius.value = value;
  
  // Emitir evento inmediatamente
  emit("radiusChanged", value);
  
  try {
    // Para valores rápidos, guardar inmediatamente (sin debounce) ya que es una acción intencional
    await preferencesService.set('search_radius', value.toString());
    console.log('✅ Radio actualizado desde valor rápido (inmediato):', value);
  } catch (error) {
    console.warn("Error guardando radio desde valor rápido:", error);
  }
};

const applyRadius = () => {
  // Solo cerrar el modal - los cambios ya se guardaron inmediatamente
  console.log('✅ Aplicando radio actual:', searchRadius.value);
  closeLocationModal();
};

// Cargar radio guardado al montar el componente
onMounted(async () => {
  try {
    const savedRadiusString = await preferencesService.get('search_radius');
    if (savedRadiusString) {
      const savedRadius = parseInt(savedRadiusString);
      if (!isNaN(savedRadius) && savedRadius > 0) {
        searchRadius.value = savedRadius;
        console.log('✅ Radio cargado desde preferences:', savedRadius);
      }
    }
  } catch (error) {
    console.warn("Error cargando radio guardado:", error);
  }
});
</script>

<style scoped>
@import "@/styles/common.css";

/* === BOTÓN DE UBICACIÓN === */
.location-button {
  --border-radius: var(--app-border-radius);
  --padding-start: var(--app-spacing-md);
  --padding-end: var(--app-spacing-md);
  font-weight: var(--app-font-weight-medium);
}

/* === MODAL DE UBICACIÓN === */
.location-modal {
  --width: 90%;
  --max-width: 400px;
  --height: auto;
  --border-radius: var(--app-border-radius-lg);
  z-index: 20000;
}

.location-modal ion-content {
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
  --background: var(--ion-background-color, #ffffff);
  --color: var(--ion-text-color, #000000);
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: auto !important;
  min-height: 200px !important;
}

.location-modal-content {
  text-align: center;
  padding: var(--app-spacing-lg);
  width: 100%;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative;
  z-index: 1;
  background: transparent;
}

.radius-display {
  margin-bottom: var(--app-spacing-xl);
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.radius-display h3 {
  font-size: var(--app-font-size-2xl);
  font-weight: var(--app-font-weight-bold);
  color: var(--ion-color-primary);
  margin: 0 0 var(--app-spacing-xs) 0;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.radius-display p {
  color: var(--app-text-secondary);
  margin: 0 0 var(--app-spacing-xs) 0;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.radius-info {
  margin-top: var(--app-spacing-xs);
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.radius-description {
  display: inline-block !important;
  background: var(--ion-color-primary-tint);
  color: var(--ion-color-primary-contrast);
  padding: var(--app-spacing-xs) var(--app-spacing-md);
  border-radius: var(--app-border-radius);
  font-size: var(--app-font-size-sm);
  font-weight: var(--app-font-weight-medium);
  visibility: visible !important;
  opacity: 1 !important;
}

/* === SLIDER CONTAINER === */
.slider-container {
  margin: var(--app-spacing-xl) 0;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  width: 100%;
}

.radius-slider {
  margin: var(--app-spacing-lg) 0;
  --knob-size: 28px;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.range-label {
  font-size: var(--app-font-size-sm);
  font-weight: var(--app-font-weight-medium);
  color: var(--app-text-secondary);
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* === MARCADORES DEL SLIDER === */
.range-markers {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--app-spacing-md) var(--app-spacing-md) 0 var(--app-spacing-md);
  position: relative;
}

.marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.marker.active {
  opacity: 1;
  color: var(--ion-color-primary);
}

.marker span {
  font-size: var(--app-font-size-xs);
  font-weight: var(--app-font-weight-medium);
  background: var(--ion-color-light);
  padding: 2px 6px;
  border-radius: var(--app-border-radius-sm);
  border: 1px solid var(--ion-color-medium-tint);
  transition: all 0.3s ease;
}

.marker.active span {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border-color: var(--ion-color-primary);
}

/* === BOTONES DE VALORES RÁPIDOS === */
.quick-values {
  display: flex;
  gap: var(--app-spacing-xs);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--app-spacing-lg);
}

.quick-value-btn {
  --padding-start: var(--app-spacing-sm);
  --padding-end: var(--app-spacing-sm);
  --padding-top: var(--app-spacing-xs);
  --padding-bottom: var(--app-spacing-xs);
  --border-radius: var(--app-border-radius);
  font-size: var(--app-font-size-sm);
  font-weight: var(--app-font-weight-medium);
  min-width: 45px;
  transition: all 0.2s ease;
}

.quick-value-btn:hover {
  transform: translateY(-1px);
}

.location-actions {
  display: flex !important;
  gap: var(--app-spacing-md);
  justify-content: center;
  margin-top: var(--app-spacing-xl);
  visibility: visible !important;
  opacity: 1 !important;
  width: 100%;
}

.location-actions ion-button {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .location-actions {
    flex-direction: column;
  }

  .range-markers {
    margin: var(--app-spacing-sm) var(--app-spacing-xs) 0 var(--app-spacing-xs);
  }

  .marker span {
    font-size: 10px;
    padding: 1px 4px;
  }

  .quick-values {
    gap: var(--app-spacing-xs);
  }

  .quick-value-btn {
    min-width: 40px;
    --padding-start: var(--app-spacing-xs);
    --padding-end: var(--app-spacing-xs);
  }
}

@media (max-width: 480px) {
  .location-modal-content {
    padding: var(--app-spacing-md);
  }

  .radius-display h3 {
    font-size: var(--app-font-size-xl);
  }

  .range-markers {
    display: none; /* Ocultar marcadores en pantallas muy pequeñas */
  }
}
</style>
