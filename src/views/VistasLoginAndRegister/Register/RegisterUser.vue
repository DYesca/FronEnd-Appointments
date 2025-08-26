<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-header">
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="goBack">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="header-title">Registro Usuario</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="register-container">
        
        <!-- Logo -->
        <div class="app-logo">
          <ion-icon :icon="personOutline" class="logo-icon"></ion-icon>
          <h1 class="app-title">Registro de Usuario</h1>
          <p class="app-subtitle">Crea tu cuenta para buscar profesionales</p>
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
              @blur="validateField('nombre')" />
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
              @blur="validateField('apellido')" />
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
              @blur="validateField('cedula')" />
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
              @blur="validateField('email')" />
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
              @blur="validateField('telefono')" />
            <div v-if="errors.telefono" class="error-message">{{ errors.telefono }}</div>
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
          <h2>¡Bienvenido!</h2>
          <p>Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión y comenzar a buscar profesionales.</p>
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
  IonModal
} from '@ionic/vue';

import {
  personOutline,
  arrowBackOutline,
  eyeOutline,
  eyeOffOutline,
  hourglassOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { registerService, type RegisterDataClient } from '@/services/RegisterService';

const router = useRouter();

// Estados reactivos
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const generalError = ref('');
const showSuccessModal = ref(false);

// Datos del formulario
const formData = reactive({
  nombre: '',
  apellido: '',
  cedula: '',
  email: '',
  telefono: '',
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
  password: '',
  confirmPassword: ''
});

// Computed para verificar si las contraseñas coinciden
const passwordsMatch = computed(() => {
  return formData.password === formData.confirmPassword;
});

// Funciones helper
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const navigateToRoute = (route: string) => {
  router.push(route);
};

const closeModalAndNavigate = (route: string) => {
  showSuccessModal.value = false;
  router.push(route);
};

// Validaciones básicas (solo UI/UX)
const validateField = (field: keyof typeof formData) => {
  errors[field] = '';
  
  switch (field) {
    case 'nombre':
    case 'apellido':
      if (!formData[field].trim()) {
        errors[field] = `${field === 'nombre' ? 'El nombre' : 'El apellido'} es requerido`;
      }
      break;
      
    case 'cedula':
      if (!formData.cedula.trim()) {
        errors.cedula = 'La cédula es requerida';
      }
      break;
      
    case 'email':
      if (!formData.email.trim()) {
        errors.email = 'El correo electrónico es requerido';
      }
      break;
      
    case 'telefono':
      if (!formData.telefono.trim()) {
        errors.telefono = 'El teléfono es requerido';
      }
      break;
      
    case 'password':
      if (!formData.password) {
        errors.password = 'La contraseña es requerida';
      }
      break;
      
    case 'confirmPassword':
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Debe confirmar la contraseña';
      } else if (!passwordsMatch.value) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
      break;
  }
};

// Validación básica del formulario (solo campos requeridos)
const validateForm = (): boolean => {
  const requiredFields = ['nombre', 'apellido', 'cedula', 'email', 'telefono', 'password', 'confirmPassword'] as const;
  let isValid = true;
  
  requiredFields.forEach(field => {
    validateField(field);
    if (errors[field]) {
      isValid = false;
    }
  });
  
  return isValid;
};

// Función principal de registro
const handleRegister = async () => {
  generalError.value = '';
  
  // Solo validación básica de campos requeridos
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  
  try {
    // Mapear los datos del formulario a la estructura esperada por el servicio
    const userData: RegisterDataClient = {
      first_name: formData.nombre,
      last_name: formData.apellido,
      cedula: formData.cedula,
      email: formData.email,
      personal_phone_number: formData.telefono,
      password: formData.password,
      password_confirmation: formData.confirmPassword
    };

    // El servicio maneja toda la validación detallada
    await registerService.registerClient(userData);
    
    console.log('Usuario registrado exitosamente');
    showSuccessModal.value = true;
    
  } catch (error: any) {
    console.error('Error en registro:', error);
    generalError.value = error.message || 'Error al registrar el usuario. Intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Navegación
const goBack = () => navigateToRoute('/register');
const goToLogin = () => navigateToRoute('/login');
const goToLoginFromModal = () => closeModalAndNavigate('/login');
const closeSuccessModal = () => {
  showSuccessModal.value = false;
};
</script>

<style scoped>
@import './RegisterUserStyles.css';
</style>
