<template>
  <div class="appointments-container">
    
    <!-- Título principal con icono de información -->
    <div class="header-section">
      <h1 class="page-title">Día de tus citas</h1>
      <ion-button 
        fill="clear" 
        size="small" 
        :id="infoTriggerId"
        class="info-button"
      >
        <ion-icon :icon="helpCircleOutline" slot="icon-only"></ion-icon>
      </ion-button>
    </div>

    <!-- Calendario centrado -->
    <div class="calendar-container">
      <ion-datetime 
        :id="calendarId"
        presentation="date"
        :multiple="false"
        :show-default-buttons="true"
        :show-clear-button="false"
        :show-default-title="true"
        :show-default-time="false"
        class="custom-datetime"
        @ionChange="onDateSelected"
        :highlight-today="true"
        :highlighted-dates="highlightedDates"
        :preferred-format="'DD/MM/YYYY'"
        done-text="Ver"
        cancel-text="Cancelar"
      ></ion-datetime>
    </div>

  </div>

  <!-- Modal de resumen de todas las citas -->
  <ion-modal :is-open="isAllAppointmentsModalOpen" @did-dismiss="closeAllAppointmentsModal">
    <ion-header>
      <ion-toolbar class="modal-header">
        <ion-title>{{ modalTitle }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="closeAllAppointmentsModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="modal-content">
      <div class="appointments-summary">
        <div v-if="appointments.length === 0" class="no-appointments">
          <ion-icon :icon="calendarOutline" class="no-appointments-icon"></ion-icon>
          <h3>{{ noAppointmentsTitle }}</h3>
          <p>{{ noAppointmentsText }}</p>
        </div>
        <div v-else class="appointments-list">
          <div 
            v-for="appointment in appointments" 
            :key="appointment.id"
            class="appointment-card"
          >
            <div class="appointment-date">
              <ion-icon :icon="calendarOutline" class="date-icon"></ion-icon>
              <span class="date-text">{{ formatDate(appointment.date) }}</span>
            </div>
            <div class="appointment-info">
              <h4 class="provider-name">{{ getAppointmentName(appointment) }}</h4>
              <p class="service-type">{{ appointment.serviceName || appointment.serviceType }}</p>
              <span class="appointment-time">{{ appointment.formattedTime || appointment.time }}</span>
            </div>
            <div class="appointment-status">
              <ion-badge :color="getStatusColor(appointment.status)">
                {{ appointment.status }}
              </ion-badge>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>

  <!-- Modal de detalles de cita específica -->
  <ion-modal :is-open="isAppointmentDetailModalOpen" @did-dismiss="closeAppointmentDetailModal">
    <ion-header>
      <ion-toolbar class="modal-header">
        <ion-title>Detalles de la Cita</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="closeAppointmentDetailModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="modal-content">
      <div v-if="selectedDateAppointments.length > 0" class="appointment-detail">
        
        <!-- Mostrar información general del día si hay múltiples citas -->
        <div v-if="selectedDateAppointments.length > 1" class="day-summary">
          <h3>{{ formatDate(selectedDateAppointments[0].date) }}</h3>
          <p>{{ selectedDateAppointments.length }} citas programadas</p>
        </div>

        <!-- Mostrar cada cita en su propio card -->
        <div 
          v-for="(appointment, index) in selectedDateAppointments" 
          :key="appointment.id"
          class="detail-card"
          :class="{ 'multiple-appointments': selectedDateAppointments.length > 1 }"
        >
          <div class="detail-header">
            <ion-icon :icon="detailHeaderIcon" class="detail-icon"></ion-icon>
            <h2>{{ getDetailHeaderTextForAppointment(appointment) }}</h2>
            <div v-if="selectedDateAppointments.length > 1" class="appointment-counter">
              {{ index + 1 }} de {{ selectedDateAppointments.length }}
            </div>
          </div>
          
          <div class="detail-body">
            <div class="detail-item">
              <ion-icon :icon="timeOutline" class="item-icon"></ion-icon>
              <div class="item-content">
                <span class="item-label">Fecha y Hora</span>
                <span class="item-value">{{ appointment.formattedDate || formatDate(appointment.date) }} - {{ appointment.formattedTime || appointment.time }}</span>
              </div>
            </div>
            
            <div class="detail-item">
              <ion-icon :icon="businessOutline" class="item-icon"></ion-icon>
              <div class="item-content">
                <span class="item-label">Servicio</span>
                <span class="item-value">{{ appointment.serviceName || appointment.serviceType }}</span>
              </div>
            </div>
            
            <div class="detail-item">
              <ion-icon :icon="locationOutline" class="item-icon"></ion-icon>
              <div class="item-content">
                <span class="item-label">Ubicación</span>
                <span class="item-value">{{ appointment.location }}</span>
              </div>
            </div>

            <!-- Campos específicos para proveedores -->
            <template v-if="userType === 'provider' && 'clientEmail' in appointment">
              <div class="detail-item">
                <ion-icon :icon="mailOutline" class="item-icon"></ion-icon>
                <div class="item-content">
                  <span class="item-label">Email del Cliente</span>
                  <span class="item-value">{{ (appointment as ProviderAppointment).clientEmail }}</span>
                </div>
              </div>
            </template>
            
            <div class="detail-item">
              <ion-icon :icon="informationCircleOutline" class="item-icon"></ion-icon>
              <div class="item-content">
                <span class="item-label">Estado</span>
                <ion-badge :color="getStatusColor(appointment.status)">
                  {{ appointment.status }}
                </ion-badge>
              </div>
            </div>
          </div>
          
          <div class="detail-actions">
            <!-- Botones específicos para proveedores -->
            <template v-if="userType === 'provider'">
              <ion-button 
                expand="full" 
                color="success" 
                @click="confirmSpecificAppointment(appointment)"
                :disabled="appointment.status === 'Confirmada' || appointment.status === 'Cancelada' || appointment.status === 'confirmed' || appointment.status === 'cancelled'"
                style="margin-bottom: 10px;"
              >
                <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
                Confirmar Cita
              </ion-button>
            </template>
            
            <ion-button 
              expand="full" 
              color="danger" 
              @click="cancelSpecificAppointment(appointment)"
              :disabled="appointment.status === 'Cancelada' || appointment.status === 'cancelled'"
            >
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              Cancelar Cita
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>

  <!-- Popover para mostrar modal de resumen -->
  <ion-popover :trigger="infoTriggerId" :dismiss-on-select="true">
    <ion-content>
      <ion-list>
        <ion-item button @click="openAllAppointmentsModal">
          <ion-icon :icon="listOutline" slot="start"></ion-icon>
          <ion-label>{{ allAppointmentsLabel }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import { 
  IonButton,
  IonIcon,
  IonDatetime,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonBadge,
  IonPopover,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/vue';

import {
  calendarOutline,
  helpCircleOutline,
  closeOutline,
  timeOutline,
  businessOutline,
  locationOutline,
  informationCircleOutline,
  trashOutline,
  listOutline,
  personOutline,
  mailOutline,
  checkmarkOutline
} from 'ionicons/icons';

import { ref, computed, } from 'vue';

// Interfaces actualizadas para nuevos datos del API
interface AppointmentBase {
  id: number;
  date: string;
  time: string;
  serviceType: string;
  serviceName: string;
  location: string;
  status: string;
  formattedDate: string;
  formattedTime: string;
}

interface ClientAppointment extends AppointmentBase {
  providerName: string;
}

interface ProviderAppointment extends AppointmentBase {
  clientName: string;
  clientEmail: string;
}

type Appointment = ClientAppointment | ProviderAppointment;

// Props
interface Props {
  appointments: Appointment[];
  userType: 'client' | 'provider';
  calendarId: string;
  infoTriggerId: string;
}

const props = defineProps<Props>();

// Estados para los modales
const isAllAppointmentsModalOpen = ref(false);
const isAppointmentDetailModalOpen = ref(false);
const selectedAppointment = ref<Appointment | null>(null);
const selectedDateAppointments = ref<Appointment[]>([]);

// Configuración de fechas destacadas
const highlightedDates = computed(() => {
  return props.appointments
    .filter(apt => apt.status !== 'Cancelada' && apt.status !== 'cancelled')
    .map(apt => ({
      date: apt.date,
      textColor: '#ffffff',
      backgroundColor: '#EE6C4D'
    }));
});

// Textos dinámicos según el tipo de usuario
const modalTitle = computed(() => 
  props.userType === 'provider' ? 'Mis Citas con Clientes' : 'Resumen de Citas'
);

const noAppointmentsTitle = computed(() => 
  props.userType === 'provider' ? 'No tienes citas programadas' : 'No tienes citas programadas'
);

const noAppointmentsText = computed(() => 
  props.userType === 'provider' 
    ? 'Aquí aparecerán todas las citas con tus clientes'
    : 'Aquí aparecerán todas tus citas cuando las tengas'
);

const allAppointmentsLabel = computed(() => 
  props.userType === 'provider' ? 'Ver todas mis citas' : 'Ver todas mis citas'
);

const detailHeaderIcon = computed(() => 
  props.userType === 'provider' ? personOutline : calendarOutline
);

// Funciones auxiliares
const formatDate = (dateString: string) => {
  // Crear fecha asumiendo que es fecha local para evitar problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  // Adaptar para aceptar ambos valores
  if (status === 'Confirmada' || status === 'confirmed') return 'success';
  if (status === 'Pendiente' || status === 'pending') return 'warning';
  if (status === 'Cancelada' || status === 'cancelled') return 'danger';
  return 'medium';
};

const getAppointmentName = (appointment: Appointment) => {
  return 'providerName' in appointment ? appointment.providerName : appointment.clientName;
};

const getDetailHeaderTextForAppointment = (appointment: Appointment) => {
  if (props.userType === 'provider' && 'clientName' in appointment) {
    return `Cita agendada con ${appointment.clientName}`;
  }
  if ('providerName' in appointment) {
    return appointment.providerName;
  }
  return '';
};

// Funciones del componente
const onDateSelected = (event: any) => {
  const selectedDate = event.detail.value;
  if (selectedDate) {
    // Extraer solo la fecha en formato YYYY-MM-DD
    const dateString = selectedDate.split('T')[0];
    
    // Buscar todas las citas para la fecha seleccionada
    const dayAppointments = props.appointments.filter(apt => apt.date === dateString);
    
    if (dayAppointments.length > 0) {
      selectedDateAppointments.value = dayAppointments;
      
      // Si hay solo una cita, la seleccionamos directamente
      if (dayAppointments.length === 1) {
        selectedAppointment.value = dayAppointments[0];
      } else {
        // Si hay múltiples citas, seleccionamos la primera pero guardamos todas
        selectedAppointment.value = dayAppointments[0];
      }
      
      isAppointmentDetailModalOpen.value = true;
    }
  }
};

const openAllAppointmentsModal = () => {
  isAllAppointmentsModalOpen.value = true;
};

const closeAllAppointmentsModal = () => {
  isAllAppointmentsModalOpen.value = false;
};

const closeAppointmentDetailModal = () => {
  isAppointmentDetailModalOpen.value = false;
  selectedAppointment.value = null;
  selectedDateAppointments.value = [];
};

// Emits para comunicar acciones al componente padre

const emit = defineEmits<{
  confirmAppointment: [appointment: Appointment]
  cancelAppointment: [appointment: Appointment]
  appointmentUpdated: [appointment: Appointment]
}>();

const confirmSpecificAppointment = (appointment: Appointment) => {
  emit('confirmAppointment', appointment);
};

const cancelSpecificAppointment = (appointment: Appointment) => {
  emit('cancelAppointment', appointment);
};

// Actualizar selectedDateAppointments
function updateSelectedDateAppointments(updatedAppointment: Appointment) {
  const idx = selectedDateAppointments.value.findIndex(a => a.id === updatedAppointment.id);
  if (idx !== -1) {
    selectedDateAppointments.value[idx] = { ...selectedDateAppointments.value[idx], ...updatedAppointment };
    // Forzar reactividad
    selectedDateAppointments.value = [...selectedDateAppointments.value];
  }
}


import { onMounted, onUnmounted } from 'vue';
import { preferencesService } from '@/services/preferencesService';
import { getEchoInstance } from '@/services/echoService';

const userId = ref<number | null>(null);
let echo: any = null;

onMounted(async () => {
  console.log('AppointmentsCalendar mounted');
  userId.value = await preferencesService.getUserId();
  echo = await getEchoInstance();
  if (userId.value && echo) {
    echo.private(`App.User.${userId.value}`)
      .listen('AppointmentStatusUpdated', (e: any) => {
        console.log('Evento recibido:', e.appointment);
        emit('appointmentUpdated', e.appointment);
        updateSelectedDateAppointments(e.appointment);
      });
  }
});

onUnmounted(() => {
  console.log('AppointmentsCalendar unmounted');
  if (userId.value && echo) {
    echo.private(`App.User.${userId.value}`).stopListening('AppointmentStatusUpdated');
  }
});

</script>

<style scoped>
@import '@/views/Home/AppointmentsPageStyles.css';
</style>
