<template>
  <ion-page>
    <!-- Header reutilizable -->
    <PageHeader profile-trigger-id="appointments-profile-trigger" />

    <!-- Menú desplegable del perfil -->
    <ProfilePopover 
      trigger-id="appointments-profile-trigger" 
      :user-type="currentUserType" 
    />

    <ion-content class="ion-padding">
      <!-- Indicador de carga -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Cargando tus citas...</p>
      </div>
      
      <!-- Mensaje de error -->
      <div v-else-if="error" class="error-container">
        <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
        <p>{{ error }}</p>
        <ion-button @click="loadAppointments" fill="outline" color="primary">
          Reintentar
        </ion-button>
      </div>
      
      <!-- Componente de calendario optimizado -->
      <AppointmentsCalendar
  v-else
  :appointments="appointments"
  user-type="client"
  calendar-id="appointments-calendar"
  info-trigger-id="appointments-info-trigger"
  @confirm-appointment="confirmAppointment"
  @cancel-appointment="cancelAppointment"
  @appointment-updated="onAppointmentUpdated"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonContent,
  IonSpinner,
  IonIcon,
  IonButton
} from '@ionic/vue';

import { onMounted, onUnmounted } from 'vue';

// Importar componentes optimizados
import PageHeader from '@/components/PageHeader.vue';
import ProfilePopover from '@/components/ProfilePopover.vue';
import AppointmentsCalendar from '@/components/AppointmentsCalendar.vue';

// Importar composables
import { useProfileActions } from '@/composables/useProfileActions';
import { Appointment, useAppointments } from '@/composables/useAppointments';

// Usar composables optimizados
const { currentUserType, setupEventListeners, cleanupEventListeners } = useProfileActions();
const { appointments, loading, error, loadAppointments, confirmAppointment, cancelAppointment } = useAppointments('client');

function onAppointmentUpdated(updatedAppointment: Appointment) {
  const idx = appointments.value.findIndex(a => a.id === updatedAppointment.id);
  if (idx !== -1) {
    appointments.value[idx] = { ...appointments.value[idx], ...updatedAppointment };
    appointments.value = [...appointments.value]; // Forzar reactividad
  } else {
    appointments.value.push(updatedAppointment);
    appointments.value = [...appointments.value];
  }
}

onMounted(() => {
  setupEventListeners();
});

onUnmounted(() => {
  cleanupEventListeners();
});
</script>

<style scoped>
@import './AppointmentsPageStyles.css';
</style>