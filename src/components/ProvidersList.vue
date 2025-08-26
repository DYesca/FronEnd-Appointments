<template>
  <div class="providers-list-container">
    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <ion-spinner name="crescent"></ion-spinner>
      <p>Cargando proveedores...</p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <ion-button @click="$emit('retry')" fill="outline" size="small">
        Reintentar
      </ion-button>
    </div>

    <!-- Lista de proveedores -->
    <div v-else-if="providers.length > 0" class="providers-grid">
      <div 
        v-for="provider in providers" 
        :key="provider.provider.user_id"
        class="provider-card"
        @click="onProviderClick(provider)"
      >
        <!-- Avatar y básicos -->
        <div class="provider-header">
          <div class="provider-avatar">
            <div class="avatar-circle">
              {{ getInitials(provider.user.first_name, provider.user.last_name) }}
            </div>
          </div>
          <div class="provider-basic-info">
            <h3 class="provider-name">
              {{ provider.user.first_name }} {{ provider.user.last_name }}
            </h3>
            <p class="provider-specialty">{{ provider.subcategory.name }}</p>
            <p class="provider-category">{{ provider.category.name }}</p>
          </div>
        </div>

        <!-- Información de contacto -->
        <div class="provider-contact">
          <div class="contact-item">
            <ion-icon :icon="mailOutline" class="contact-icon"></ion-icon>
            <span class="contact-text">{{ provider.user.email }}</span>
          </div>
          <div class="contact-item">
            <ion-icon :icon="callOutline" class="contact-icon"></ion-icon>
            <span class="contact-text">{{ provider.provider.phone_number }}</span>
          </div>
          <div class="contact-item">
            <ion-icon :icon="locationOutline" class="contact-icon"></ion-icon>
            <span class="contact-text">{{ provider.provider.location }}</span>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="provider-details">
          <div class="detail-item">
            <ion-icon :icon="timeOutline" class="detail-icon"></ion-icon>
            <span class="detail-text">{{ provider.provider.experience_years }} años de experiencia</span>
          </div>
          <div class="detail-item">
            <ion-icon :icon="heartOutline" class="detail-icon"></ion-icon>
            <span class="detail-text">{{ provider.provider.likes }} likes</span>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="provider-actions">
          <ion-button 
            fill="outline" 
            size="small" 
            @click.stop="onContactProvider(provider)"
            class="action-button"
          >
            <ion-icon :icon="chatbubbleOutline" slot="start"></ion-icon>
            Contactar
          </ion-button>
          <ion-button 
            fill="solid" 
            size="small" 
            @click.stop="onViewProfile(provider)"
            class="action-button"
          >
            <ion-icon :icon="personOutline" slot="start"></ion-icon>
            Ver Perfil
          </ion-button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <ion-icon :icon="peopleOutline" class="empty-icon"></ion-icon>
      <p>No se encontraron proveedores</p>
      <p class="empty-subtitle">Intenta ajustar los filtros de búsqueda</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  IonSpinner, 
  IonButton, 
  IonIcon 
} from '@ionic/vue';
import {
  mailOutline,
  callOutline,
  locationOutline,
  timeOutline,
  heartOutline,
  chatbubbleOutline,
  personOutline,
  peopleOutline
} from 'ionicons/icons';

import type { Provider } from '@/services/providerService';

interface Props {
  /** Lista de proveedores a mostrar */
  providers: Provider[];
  /** Estado de carga */
  loading?: boolean;
  /** Mensaje de error */
  error?: string;
}

interface Emits {
  /** Evento cuando se hace clic en un proveedor */
  (e: 'provider-selected', provider: Provider): void;
  /** Evento cuando se quiere contactar a un proveedor */
  (e: 'contact-provider', provider: Provider): void;
  /** Evento cuando se quiere ver el perfil de un proveedor */
  (e: 'view-profile', provider: Provider): void;
  /** Evento para reintentar cargar */
  (e: 'retry'): void;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: ''
});

const emit = defineEmits<Emits>();

/**
 * Obtiene las iniciales del nombre y apellido
 */
const getInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

/**
 * Maneja el clic en un proveedor
 */
const onProviderClick = (provider: Provider) => {
  emit('provider-selected', provider);
};

/**
 * Maneja el evento de contactar proveedor
 */
const onContactProvider = (provider: Provider) => {
  emit('contact-provider', provider);
};

/**
 * Maneja el evento de ver perfil
 */
const onViewProfile = (provider: Provider) => {
  emit('view-profile', provider);
};
</script>

<style scoped>
/* === CONTENEDOR PRINCIPAL === */
.providers-list-container {
  padding: var(--app-spacing-md);
}

/* === ESTADOS === */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: var(--app-spacing-3xl) var(--app-spacing-lg);
  color: var(--app-text-secondary);
}

.error-state {
  color: var(--ion-color-danger);
}

.empty-icon {
  font-size: 64px;
  color: var(--app-text-secondary);
  margin-bottom: var(--app-spacing-md);
}

.empty-subtitle {
  font-size: var(--app-font-size-sm);
  opacity: 0.7;
  margin-top: var(--app-spacing-xs);
}

/* === GRID DE PROVEEDORES === */
.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--app-spacing-lg);
  padding: var(--app-spacing-md) 0;
}

/* === TARJETA DE PROVEEDOR === */
.provider-card {
  background: var(--ion-color-light);
  border-radius: var(--app-border-radius-lg);
  padding: var(--app-spacing-lg);
  box-shadow: var(--app-shadow-sm);
  transition: var(--app-transition-normal);
  cursor: pointer;
  border: 1px solid var(--ion-color-light-shade);
}

.provider-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--app-shadow-md);
  border-color: var(--app-primary-color);
}

/* === HEADER DEL PROVEEDOR === */
.provider-header {
  display: flex;
  align-items: flex-start;
  gap: var(--app-spacing-md);
  margin-bottom: var(--app-spacing-md);
}

.provider-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: var(--app-border-radius-full);
  background: linear-gradient(135deg, var(--app-primary-color), var(--app-accent-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--app-font-weight-bold);
  font-size: var(--app-font-size-lg);
  box-shadow: var(--app-shadow-sm);
}

.provider-basic-info {
  flex: 1;
  min-width: 0;
}

.provider-name {
  font-size: var(--app-font-size-lg);
  font-weight: var(--app-font-weight-bold);
  color: var(--app-text-primary);
  margin: 0 0 var(--app-spacing-xs) 0;
  line-height: 1.2;
}

.provider-specialty {
  font-size: var(--app-font-size-md);
  font-weight: var(--app-font-weight-medium);
  color: var(--app-primary-color);
  margin: 0 0 var(--app-spacing-xs) 0;
}

.provider-category {
  font-size: var(--app-font-size-sm);
  color: var(--app-text-secondary);
  margin: 0;
}

/* === INFORMACIÓN DE CONTACTO === */
.provider-contact {
  margin-bottom: var(--app-spacing-md);
  padding: var(--app-spacing-md);
  background: var(--ion-color-light-tint);
  border-radius: var(--app-border-radius-md);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  margin-bottom: var(--app-spacing-sm);
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  font-size: 16px;
  color: var(--app-primary-color);
  flex-shrink: 0;
}

.contact-text {
  font-size: var(--app-font-size-sm);
  color: var(--app-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* === DETALLES ADICIONALES === */
.provider-details {
  margin-bottom: var(--app-spacing-lg);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  margin-bottom: var(--app-spacing-sm);
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-icon {
  font-size: 16px;
  color: var(--app-accent-color);
  flex-shrink: 0;
}

.detail-text {
  font-size: var(--app-font-size-sm);
  color: var(--app-text-secondary);
}

/* === BOTONES DE ACCIÓN === */
.provider-actions {
  display: flex;
  gap: var(--app-spacing-sm);
  justify-content: space-between;
}

.action-button {
  flex: 1;
  --border-radius: var(--app-border-radius-md);
  font-size: var(--app-font-size-sm);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .providers-grid {
    grid-template-columns: 1fr;
    gap: var(--app-spacing-md);
  }
  
  .provider-card {
    padding: var(--app-spacing-md);
  }
  
  .provider-header {
    gap: var(--app-spacing-sm);
  }
  
  .avatar-circle {
    width: 50px;
    height: 50px;
    font-size: var(--app-font-size-md);
  }
  
  .provider-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .providers-list-container {
    padding: var(--app-spacing-sm);
  }
  
  .provider-card {
    padding: var(--app-spacing-sm);
  }
  
  .provider-contact {
    padding: var(--app-spacing-sm);
  }
}
</style>
