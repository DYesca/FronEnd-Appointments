<template>
  <ion-page>
    <!-- Header reutilizable -->
    <PageHeader profile-trigger-id="chats-profile-trigger" />

    <!-- Menú desplegable del perfil -->
    <ProfilePopover 
      trigger-id="chats-profile-trigger" 
      :user-type="currentUserType" 
    />

    <ion-content class="ion-padding">
      <div class="example-content">
        <h1>Chats Page</h1>
        <p>Chats Content for {{ currentUserType === 'provider' ? 'Proveedor' : currentUserType === 'admin' ? 'Administrador' : 'Cliente' }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonContent
} from '@ionic/vue';

import { onMounted, onUnmounted } from 'vue';

// Importar componentes optimizados
import PageHeader from '@/components/PageHeader.vue';
import ProfilePopover from '@/components/ProfilePopover.vue';

// Importar composable para acciones de perfil
import { useProfileActions } from '@/composables/useProfileActions';

// Usar composables optimizados
const { currentUserType, setupEventListeners, cleanupEventListeners } = useProfileActions();

onMounted(() => {
  setupEventListeners();
});

onUnmounted(() => {
  cleanupEventListeners();
});
</script>

<style scoped>
@import '@/styles/common.css';

.example-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>