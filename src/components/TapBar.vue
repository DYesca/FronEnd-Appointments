<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="home" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <!-- Solo mostrar appointments si NO es admin -->
        <ion-tab-button 
          v-if="currentUserType !== 'admin'" 
          tab="appointments" 
          :href="appointmentsRoute"
        >
          <ion-icon :icon="calendar" />
          <ion-label>Appointments</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="chats" href="/tabs/chats">
          <ion-icon :icon="chatbox" />
          <ion-label>Chats</ion-label>
        </ion-tab-button>
        
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue';
import { home, calendar, chatbox } from 'ionicons/icons';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { preferencesService } from '@/services/preferencesService';

// Estado reactivo para el tipo de usuario
const currentUserType = ref('client');

// Computed property para la ruta de appointments
const appointmentsRoute = computed(() => {
  return currentUserType.value === 'provider' ? '/tabs/appointments-provider' : '/tabs/appointments';
});

// Función para actualizar el tipo de usuario desde Preferences
const updateUserTypeFromPreferences = async () => {
  try {
    const userInfo = await preferencesService.getUserInfo();
    if (userInfo) {
      let userType = 'client'; // Valor por defecto
      
      // Detectar tipo de usuario basado en roles
      if (userInfo.roles && Array.isArray(userInfo.roles)) {
        if (userInfo.roles.includes('Admin')) {
          userType = 'admin';
        } else if (userInfo.roles.includes('Provider')) {
          userType = 'provider';
        } else {
          userType = 'client';
        }
      }
      
      currentUserType.value = userType;
    } else {
      currentUserType.value = 'client';
    }
  } catch (error) {
    console.error('TapBar - Error obteniendo información del usuario:', error);
    currentUserType.value = 'client';
  }
};

// Event listeners para cambios
const handleUserTypeChange = (event: CustomEvent) => {
  let userType = event.detail.userType || 'client';
  // Normalizar 'user' a 'client' para compatibilidad
  if (userType === 'user') {
    userType = 'client';
  }
  currentUserType.value = userType;
};

onMounted(() => {
  updateUserTypeFromPreferences();
  
  // Escuchar eventos personalizados de cambio de tipo de usuario
  window.addEventListener('userTypeChanged', handleUserTypeChange as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('userTypeChanged', handleUserTypeChange as EventListener);
});
</script>

<style scoped>

@import './TabBarStyles.css'; 

</style>