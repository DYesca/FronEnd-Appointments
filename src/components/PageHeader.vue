<template>
  <ion-header>
    <ion-toolbar class="custom-header">
      <ion-buttons slot="start">
        <ion-menu-button class="menu-button"></ion-menu-button>
      </ion-buttons>

      <ion-title class="header-title">{{ title }}</ion-title>

      <ion-buttons slot="end">
        <ion-button fill="clear" :id="profileTriggerId" class="profile-button">
          <ion-icon :icon="personCircleOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon
} from '@ionic/vue';
import { personCircleOutline } from 'ionicons/icons';

interface Props {
  profileTriggerId: string;
  title?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'App para Profesionales'
});
</script>

<style scoped>
.custom-header {
  --background: var(--app-primary-color);
  --color: var(--app-secondary-color);
  --border-width: 0;
  box-shadow: var(--app-shadow-md);
}

.menu-button {
  --color: var(--app-secondary-color);
  font-size: var(--app-font-size-xl);
  width: 48px;
  height: 48px;
  margin-right: var(--app-spacing-sm);
}

.header-title {
  color: var(--app-secondary-color);
  font-weight: var(--app-font-weight-bold);
  font-size: var(--app-font-size-lg);
  text-align: center;
}

.profile-button {
  --color: var(--app-secondary-color);
  font-size: var(--app-font-size-2xl);
  width: 48px;
  height: 48px;
  margin-left: var(--app-spacing-sm);
  transition: var(--app-transition-normal);
}

.profile-button:hover {
  --color: var(--app-accent-color);
  transform: scale(1.1);
}
</style>
