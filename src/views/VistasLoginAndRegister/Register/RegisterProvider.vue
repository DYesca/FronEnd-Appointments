<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-header">
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="goBack">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="header-title">Registro Proveedor</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="register-container">
        
        <!-- Logo -->
        <div class="app-logo">
          <ion-icon :icon="briefcaseOutline" class="logo-icon"></ion-icon>
          <h1 class="app-title">Registro de Proveedor</h1>
          <p class="app-subtitle">Crea tu perfil profesional</p>
        </div>

        <!-- Formulario de registro -->
        <form @submit.prevent="handleRegister" class="register-form">
          
          <!-- Nombre -->
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input 
              v-model="formData.nombre" 
              type="text" 
              placeholder="Ingrese su nombre"
              class="form-input"
              :class="{ 'input-error': errors.nombre }"
              @blur="validateField('nombre')"
            />
            <div v-if="errors.nombre" class="error-message">{{ errors.nombre }}</div>
          </div>

          <!-- Apellido -->
          <div class="form-group">
            <label class="form-label">Apellido *</label>
            <input 
              v-model="formData.apellido" 
              type="text" 
              placeholder="Ingrese su apellido"
              class="form-input"
              :class="{ 'input-error': errors.apellido }"
              @blur="validateField('apellido')"
            />
            <div v-if="errors.apellido" class="error-message">{{ errors.apellido }}</div>
          </div>

          <!-- Cédula -->
          <div class="form-group">
            <label class="form-label">Cédula *</label>
            <input 
              v-model="formData.cedula" 
              type="text" 
              placeholder="Ingrese su cédula"
              class="form-input"
              :class="{ 'input-error': errors.cedula }"
              @blur="validateField('cedula')"
            />
            <div v-if="errors.cedula" class="error-message">{{ errors.cedula }}</div>
          </div>

          <!-- Correo Electrónico -->
          <div class="form-group">
            <label class="form-label">Correo Electrónico *</label>
            <input 
              v-model="formData.email" 
              type="email" 
              placeholder="ejemplo@correo.com"
              class="form-input"
              :class="{ 'input-error': errors.email }"
              @blur="validateField('email')"
            />
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </div>

          <!-- Teléfono -->
          <div class="form-group">
            <label class="form-label">Teléfono *</label>
            <input 
              v-model="formData.telefono" 
              type="tel" 
              placeholder="Ingrese su teléfono"
              class="form-input"
              :class="{ 'input-error': errors.telefono }"
              @blur="validateField('telefono')"
            />
            <div v-if="errors.telefono" class="error-message">{{ errors.telefono }}</div>
          </div>

          <!-- Años de Experiencia -->
          <div class="form-group">
            <label class="form-label">Años de Experiencia *</label>
            <select 
              v-model="formData.anosExperiencia" 
              class="form-input form-select"
              :class="{ 'input-error': errors.anosExperiencia }"
              @blur="validateField('anosExperiencia')"
            >
              <option value="">Seleccione sus años de experiencia</option>
              <option value="0-1">0-1 años</option>
              <option value="1-3">1-3 años</option>
              <option value="3-5">3-5 años</option>
              <option value="5-10">5-10 años</option>
              <option value="10+">Más de 10 años</option>
            </select>
            <div v-if="errors.anosExperiencia" class="error-message">{{ errors.anosExperiencia }}</div>
          </div>

          <!-- Ubicación -->
          <div class="location-section">
            <div class="section-title">Ubicación *</div>
            
            <!-- Botón obtener ubicación -->
            <ion-button 
              expand="block" 
              fill="outline" 
              @click="getLocation"
              :disabled="loadingLocation"
              class="location-btn">
              <ion-icon :icon="locationOutline" slot="start"></ion-icon>
              {{ loadingLocation ? 'Obteniendo ubicación...' : 'Obtener Ubicación Automática' }}
            </ion-button>

            <!-- Ubicación escrita -->
            <div class="form-group">
              <label class="form-label">Ubicación Escrita *</label>
              <textarea 
                v-model="formData.ubicacion" 
                placeholder="Ingrese su dirección completa"
                class="form-input form-textarea"
                :class="{ 'input-error': errors.ubicacion }"
                @blur="validateField('ubicacion')"
                rows="3">
              </textarea>
              <div v-if="errors.ubicacion" class="error-message">{{ errors.ubicacion }}</div>
            </div>
          </div>

          <!-- Especialidades -->
          <div class="specialties-section">
            <div class="section-title">Especialidades *</div>
            <ion-searchbar 
              v-model="specialtySearch"
              placeholder="Buscar especialidades..."
              @ionInput="filterSpecialties"
              class="specialty-search">
            </ion-searchbar>
            
            <div class="specialty-results" v-if="filteredSpecialties.length > 0">
              <ion-item 
                v-for="specialty in filteredSpecialties" 
                :key="specialty.id"
                @click="selectSpecialty(specialty)"
                class="specialty-item">
                <ion-label>{{ specialty.name }}</ion-label>
              </ion-item>
            </div>

            <div class="selected-specialties" v-if="formData.especialidades.length > 0">
              <div class="section-subtitle">Especialidades Seleccionadas:</div>
              <ion-chip 
                v-for="specialty in formData.especialidades" 
                :key="specialty.id"
                class="specialty-chip">
                <ion-label>{{ specialty.name }}</ion-label>
                <ion-icon :icon="closeOutline" @click="removeSpecialty(specialty.id)"></ion-icon>
              </ion-chip>
            </div>
            <div v-if="errors.especialidades" class="error-message">{{ errors.especialidades }}</div>
          </div>

          <!-- Horario -->
          <div class="schedule-section">
            <div class="section-title">Tipo de Horario *</div>
            <div class="schedule-options">
              
              <!-- Horario Flexible -->
              <div class="schedule-option" :class="{ 'selected': formData.tipoHorario === 'flexible' }">
                <ion-button 
                  :fill="formData.tipoHorario === 'flexible' ? 'solid' : 'outline'"
                  @click="selectScheduleType('flexible')"
                  class="schedule-btn">
                  <ion-icon :icon="timeOutline" slot="start"></ion-icon>
                  Horario Flexible
                </ion-button>
                <ion-button 
                  fill="clear" 
                  @click="openScheduleModal('flexible')"
                  class="info-btn">
                  <ion-icon :icon="helpCircleOutline"></ion-icon>
                </ion-button>
              </div>

              <!-- Horario Estricto -->
              <div class="schedule-option" :class="{ 'selected': formData.tipoHorario === 'estricto' }">
                <ion-button 
                  :fill="formData.tipoHorario === 'estricto' ? 'solid' : 'outline'"
                  @click="selectScheduleType('estricto')"
                  class="schedule-btn">
                  <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
                  Horario Estricto
                </ion-button>
                <ion-button 
                  fill="clear" 
                  @click="openScheduleModal('estricto')"
                  class="info-btn">
                  <ion-icon :icon="helpCircleOutline"></ion-icon>
                </ion-button>
              </div>

            </div>
            <div v-if="errors.tipoHorario" class="error-message">{{ errors.tipoHorario }}</div>
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <label class="form-label">Contraseña *</label>
            <div class="password-input-container">
              <input 
                v-model="formData.password" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ingrese su contraseña"
                class="form-input password-input"
                :class="{ 'input-error': errors.password }"
                @blur="validateField('password')" />
              <button type="button" @click="togglePasswordVisibility" class="password-toggle-btn">
                <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
              </button>
            </div>
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>

          <!-- Confirmar Contraseña -->
          <div class="form-group">
            <label class="form-label">Confirmar Contraseña *</label>
            <div class="password-input-container">
              <input 
                v-model="formData.confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirme su contraseña"
                class="form-input password-input"
                :class="{ 'input-error': errors.confirmPassword }"
                @blur="validateField('confirmPassword')" />
              <button type="button" @click="toggleConfirmPasswordVisibility" class="password-toggle-btn">
                <ion-icon :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"></ion-icon>
              </button>
            </div>
            <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
          </div>

          <!-- Mensaje de error general -->
          <div v-if="generalError" class="error-message general-error">
            {{ generalError }}
          </div>

          <!-- Botón de registro -->
          <ion-button 
            type="submit"
            expand="block" 
            class="register-btn"
            :disabled="loading">
            <ion-icon v-if="loading" :icon="hourglassOutline" class="loading-icon"></ion-icon>
            {{ loading ? 'Registrando...' : 'Registrarse' }}
          </ion-button>

        </form>

        <!-- Enlace a login -->
        <div class="login-link">
          <span>¿Ya tienes una cuenta? </span>
          <a @click="goToLogin" class="link">Inicia sesión aquí</a>
        </div>

      </div>
    </ion-content>

    <!-- Modal de información de horario -->
    <ion-modal :is-open="showScheduleModal" @did-dismiss="closeScheduleModal">
      <ion-header>
        <ion-toolbar class="modal-header">
          <ion-title>{{ scheduleModalTitle }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="closeScheduleModal">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="modal-content">
          <ion-icon :icon="scheduleModalIcon" class="modal-icon"></ion-icon>
          <h2>{{ scheduleModalTitle }}</h2>
          <p>{{ scheduleModalDescription }}</p>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Modal de éxito -->
    <ion-modal :is-open="showSuccessModal" @did-dismiss="closeSuccessModal">
      <ion-header>
        <ion-toolbar class="success-header">
          <ion-title>¡Registro Exitoso!</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="success-content">
          <ion-icon :icon="checkmarkCircleOutline" class="success-icon"></ion-icon>
          <h2>¡Bienvenido Proveedor!</h2>
          <p>Tu perfil profesional ha sido creado exitosamente. Ahora puedes iniciar sesión y comenzar a ofrecer tus servicios.</p>
          <ion-button expand="block" @click="goToLoginFromModal" class="success-btn">
            Ir al Login
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonButtons,
  IonIcon,
  IonModal,
  IonSearchbar,
  IonChip
} from '@ionic/vue';

import {
  briefcaseOutline,
  arrowBackOutline,
  eyeOutline,
  eyeOffOutline,
  hourglassOutline,
  checkmarkCircleOutline,
  locationOutline,
  timeOutline,
  calendarOutline,
  helpCircleOutline,
  closeOutline
} from 'ionicons/icons';

import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Estados reactivos
const loading = ref(false);
const loadingLocation = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const generalError = ref('');
const showSuccessModal = ref(false);
const showScheduleModal = ref(false);
const specialtySearch = ref('');

// Datos del formulario
const formData = reactive({
  nombre: '',
  apellido: '',
  cedula: '',
  email: '',
  telefono: '',
  anosExperiencia: '',
  ubicacion: '',
  especialidades: [] as Array<{id: string, name: string}>,
  tipoHorario: '',
  password: '',
  confirmPassword: ''
});

// Errores de validación
const errors = reactive({
  nombre: '',
  apellido: '',
  cedula: '',
  email: '',
  telefono: '',
  anosExperiencia: '',
  ubicacion: '',
  especialidades: '',
  tipoHorario: '',
  password: '',
  confirmPassword: ''
});

// Especialidades disponibles (datos quemados)
const availableSpecialties = [
  { id: '1', name: 'Médico General' },
  { id: '2', name: 'Pediatría' },
  { id: '3', name: 'Cardiología' },
  { id: '4', name: 'Dermatología' },
  { id: '5', name: 'Desarrollo Web' },
  { id: '6', name: 'Redes y Sistemas' },
  { id: '7', name: 'Soporte Técnico' },
  { id: '8', name: 'Ciberseguridad' },
  { id: '9', name: 'Construcción' },
  { id: '10', name: 'Electricista' },
  { id: '11', name: 'Plomería' },
  { id: '12', name: 'Carpintería' },
  { id: '13', name: 'Transporte' },
  { id: '14', name: 'Mecánica Automotriz' },
  { id: '15', name: 'Logística' }
];

// Especialidades filtradas
const filteredSpecialties = computed(() => {
  if (!specialtySearch.value) return [];
  
  return availableSpecialties.filter(specialty => 
    specialty.name.toLowerCase().includes(specialtySearch.value.toLowerCase()) &&
    !formData.especialidades.some(selected => selected.id === specialty.id)
  );
});

// Modal de horario
const scheduleModalTitle = ref('');
const scheduleModalDescription = ref('');
const scheduleModalIcon = ref(timeOutline);

// Funciones de visibilidad de contraseña
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// Función para obtener ubicación
const getLocation = async () => {
  loadingLocation.value = true;
  
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          formData.ubicacion = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
          loadingLocation.value = false;
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          formData.ubicacion = 'No se pudo obtener la ubicación automática';
          loadingLocation.value = false;
        }
      );
    } else {
      formData.ubicacion = 'Geolocalización no soportada';
      loadingLocation.value = false;
    }
  } catch (error) {
    console.error('Error:', error);
    loadingLocation.value = false;
  }
};

// Funciones de especialidades
const filterSpecialties = () => {
  // La función computed ya maneja esto
};

const selectSpecialty = (specialty: {id: string, name: string}) => {
  formData.especialidades.push(specialty);
  specialtySearch.value = '';
};

const removeSpecialty = (specialtyId: string) => {
  formData.especialidades = formData.especialidades.filter(s => s.id !== specialtyId);
};

// Funciones de horario
const selectScheduleType = (type: string) => {
  formData.tipoHorario = type;
};

const openScheduleModal = (type: string) => {
  if (type === 'flexible') {
    scheduleModalTitle.value = 'Horario Flexible';
    scheduleModalDescription.value = 'Con un horario flexible, puedes establecer tu disponibilidad de forma dinámica y aceptar trabajos según tu conveniencia. Ideal para profesionales que prefieren mayor libertad en sus horarios.';
    scheduleModalIcon.value = timeOutline;
  } else {
    scheduleModalTitle.value = 'Horario Estricto';
    scheduleModalDescription.value = 'Con un horario estricto, estableces días y horas específicas de trabajo. Los clientes solo pueden solicitar servicios dentro de estos horarios predefinidos. Ideal para profesionales con horarios fijos.';
    scheduleModalIcon.value = calendarOutline;
  }
  showScheduleModal.value = true;
};

const closeScheduleModal = () => {
  showScheduleModal.value = false;
};

// Validaciones
const validateField = (field: keyof typeof formData) => {
  errors[field] = '';
  
  switch (field) {
    case 'nombre':
      if (!formData.nombre.trim()) {
        errors.nombre = 'El nombre es requerido';
      } else if (formData.nombre.trim().length < 2) {
        errors.nombre = 'El nombre debe tener al menos 2 caracteres';
      }
      break;
      
    case 'apellido':
      if (!formData.apellido.trim()) {
        errors.apellido = 'El apellido es requerido';
      } else if (formData.apellido.trim().length < 2) {
        errors.apellido = 'El apellido debe tener al menos 2 caracteres';
      }
      break;
      
    case 'cedula':
      if (!formData.cedula.trim()) {
        errors.cedula = 'La cédula es requerida';
      } else if (!/^\d{7,10}$/.test(formData.cedula)) {
        errors.cedula = 'La cédula debe contener entre 7 y 10 dígitos';
      }
      break;
      
    case 'email':
      if (!formData.email.trim()) {
        errors.email = 'El correo electrónico es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Por favor ingrese un correo electrónico válido';
      }
      break;
      
    case 'telefono':
      if (!formData.telefono.trim()) {
        errors.telefono = 'El teléfono es requerido';
      } else if (!/^\d{8}$/.test(formData.telefono)) {
        errors.telefono = 'El teléfono debe contener exactamente 8 dígitos';
      }
      break;
      
    case 'anosExperiencia':
      if (!formData.anosExperiencia) {
        errors.anosExperiencia = 'Los años de experiencia son requeridos';
      }
      break;
      
    case 'ubicacion':
      if (!formData.ubicacion.trim()) {
        errors.ubicacion = 'La ubicación es requerida';
      } else if (formData.ubicacion.trim().length < 10) {
        errors.ubicacion = 'La ubicación debe ser más específica';
      }
      break;
      
    case 'especialidades':
      if (formData.especialidades.length === 0) {
        errors.especialidades = 'Debe seleccionar al menos una especialidad';
      }
      break;
      
    case 'tipoHorario':
      if (!formData.tipoHorario) {
        errors.tipoHorario = 'Debe seleccionar un tipo de horario';
      }
      break;
      
    case 'password':
      if (!formData.password) {
        errors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      break;
      
    case 'confirmPassword':
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Debe confirmar la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
      break;
  }
};

// Validar todo el formulario
const validateForm = (): boolean => {
  let isValid = true;
  
  (Object.keys(formData) as Array<keyof typeof formData>).forEach(field => {
    if (field !== 'especialidades') {
      validateField(field);
    }
  });
  
  // Validar especialidades por separado
  validateField('especialidades');
  
  // Verificar si hay errores
  (Object.keys(errors) as Array<keyof typeof errors>).forEach(field => {
    if (errors[field]) {
      isValid = false;
    }
  });
  
  return isValid;
};

// Función principal de registro
const handleRegister = async () => {
  generalError.value = '';
  
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aquí iría la llamada a la API
    console.log('Registrando proveedor:', formData);
    
    // Simular éxito
    showSuccessModal.value = true;
    
  } catch (error) {
    console.error('Error en registro:', error);
    generalError.value = 'Error al registrar el proveedor. Intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Navegación
const goBack = () => {
  router.push('/register');
};

const goToLogin = () => {
  router.push('/login');
};

const goToLoginFromModal = () => {
  showSuccessModal.value = false;
  router.push('/login');
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};
</script>

<style scoped>
@import './RegisterProviderStyles.css';
</style>
