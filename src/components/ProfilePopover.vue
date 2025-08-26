<template>
  <ion-popover 
    :trigger="triggerId" 
    :dismiss-on-select="true"
    :can-dismiss="true"
    :keyboard-close="true"
    :backdrop-dismiss="true"
    side="bottom"
    alignment="end"
  >
    <ion-content>
      <ion-list>
        <!-- Mostrar opciones según el tipo de usuario -->
        <template v-if="userType === 'client' || userType === 'user'">
          <div class="profile-title">Cliente</div>
          
          <ion-item button @click="handleAction('favorites')">
            <ion-icon :icon="heartOutline" slot="start"></ion-icon>
            <ion-label>Favoritos</ion-label>
          </ion-item>
          <ion-item button @click="handleAction('history')">
            <ion-icon :icon="timeOutline" slot="start"></ion-icon>
            <ion-label>Historial</ion-label>
          </ion-item>
          <ion-item button @click="handleAction('editProfile')">
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            <ion-label>Editar Perfil</ion-label>
          </ion-item>
          <ion-item button @click="handleAction('logout')">
            <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
            <ion-label>Cerrar Sesión</ion-label>
          </ion-item>
        </template>

        <template v-else-if="userType === 'provider'">
          <div class="profile-title">Proveedor</div>
          
          <ion-item button @click="handleAction('manageSchedule')">
            <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
            <ion-label>Gestionar Horarios</ion-label>
          </ion-item>
          <ion-item button @click="handleAction('editProfile')">
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            <ion-label>Editar Perfil</ion-label>
          </ion-item>
          <ion-item button @click="handleAction('logout')">
            <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
            <ion-label>Cerrar Sesión</ion-label>
          </ion-item>
        </template>

        <template v-else-if="userType === 'admin'">
          <div class="profile-title">Administrador</div>
          
          <ion-item button @click="handleAction('manageUsers')">
            <ion-icon :icon="peopleOutline" slot="start"></ion-icon>
            <ion-label>Gestionar Usuarios</ion-label>
          </ion-item>
          <ion-item button @click="handleAction('manageCategories')">
            <ion-icon :icon="layersOutline" slot="start"></ion-icon>
            <ion-label>Gestionar Categorías</ion-label>
          </ion-item>
          <ion-item button @click="handleAction('editProfile')">
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            <ion-label>Editar Perfil</ion-label>
          </ion-item>
          <ion-item button @click="handleAction('logout')">
            <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
            <ion-label>Cerrar Sesión</ion-label>
          </ion-item>
        </template>
      </ion-list>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import {
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/vue';
import {
  heartOutline,
  timeOutline,
  createOutline,
  logOutOutline,
  calendarOutline,
  peopleOutline,
  layersOutline
} from 'ionicons/icons';
import { useProfileActions } from '@/composables/useProfileActions';

interface Props {
  triggerId: string;
  userType: string;
}

defineProps<Props>();

const emit = defineEmits<{
  action: [actionType: string];
}>();

// Usar el composable centralizado para acciones
const { handleProfileAction } = useProfileActions();

const handleAction = (actionType: string) => {
  handleProfileAction(actionType);
  emit('action', actionType);
};
</script>

<style scoped>
ion-popover ion-list {
  padding: 0;
  background: var(--app-secondary-color);
}

ion-popover ion-item {
  --padding-start: var(--app-spacing-sm);
  --min-height: 40px;
  font-size: var(--app-font-size-sm);
  --background: transparent;
  --color: var(--app-primary-color);
  transition: var(--app-transition-fast);
}

ion-popover ion-item:hover {
  --background: var(--app-accent-transparent);
  --color: var(--app-accent-color);
}

ion-popover ion-icon {
  margin-right: var(--app-spacing-sm);
  font-size: var(--app-font-size-base);
  color: var(--app-primary-color);
  transition: var(--app-transition-fast);
}

ion-popover ion-item:hover ion-icon {
  color: var(--app-accent-color);
}

.profile-title {
  font-weight: var(--app-font-weight-bold);
  text-align: center;
  padding: var(--app-spacing-sm);
  color: var(--app-primary-color) !important;
  font-size: var(--app-font-size-base);
  background: var(--app-primary-transparent);
  border-bottom: 1px solid var(--app-primary-transparent);
  text-transform: none;
}

ion-popover ion-label {
  text-transform: none !important;
}
</style>
