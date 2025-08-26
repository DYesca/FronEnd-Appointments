<template>
  <ion-page>
    <!-- Header reutilizable -->
    <PageHeader profile-trigger-id="provider-appointments-profile-trigger" />

    <!-- Menú desplegable del perfil -->
    <ProfilePopover 
      trigger-id="provider-appointments-profile-trigger" 
      :user-type="currentUserType" 
    />

    <ion-content class="ion-padding">
      <!-- Componente de calendario optimizado para proveedores -->
      <AppointmentsCalendar
  :appointments="appointments"
  user-type="provider"
  calendar-id="provider-appointments-calendar"
  info-trigger-id="provider-appointments-info-trigger"
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
  IonContent
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
const { appointments, confirmAppointment, cancelAppointment } = useAppointments('provider');

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
@import '../Home/AppointmentsPageStyles.css';
</style>
