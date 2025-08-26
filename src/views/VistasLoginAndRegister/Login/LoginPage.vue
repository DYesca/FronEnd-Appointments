<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-header">
        <ion-title class="header-title">Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <!-- Logo -->
        <div class="app-logo">
          <ion-icon :icon="briefcaseOutline" class="logo-icon"></ion-icon>
          <h1 class="app-title">App para Profesionales</h1>
        </div>

        <!-- Formulario de login -->
        <form @submit.prevent="handleLogin" class="login-form">

          <!-- Correo Electrónico -->
          <div class="form-group">
            <label class="form-label">Correo Electrónico</label>
            <input v-model="email" type="email" placeholder="ejemplo@correo.com" class="form-input"
              :class="{ 'input-error': emailError }" @blur="validateEmail" />
            <div v-if="emailError" class="error-message">{{ emailError }}</div>
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <div class="password-input-container">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Ingrese su contraseña"
                class="form-input password-input" :class="{ 'input-error': passwordError }" @blur="validatePassword" />
              <button type="button" @click="togglePasswordVisibility" class="password-toggle-btn">
                <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
              </button>
            </div>
            <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
          </div>

          <div v-if="loginError" class="error-message general-error">
            {{ loginError }}
          </div>

          <ion-button type="submit" expand="block" class="login-btn" :disabled="loading">
            <ion-icon v-if="loading" :icon="hourglassOutline" class="loading-icon"></ion-icon>
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </ion-button>

          <!-- Registro -->
          <div class="register-link">
            <span>¿No tienes cuenta? </span>
            <a @click="goToRegister" class="link">Regístrate aquí</a>
          </div>

        </form>
      </div>
    </ion-content>
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
  IonIcon
} from '@ionic/vue';

import {
  briefcaseOutline,
  eyeOutline,
  eyeOffOutline,
  hourglassOutline
} from 'ionicons/icons';

import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import { updateGlobalUserType } from '@/composables/useUserType';
import { preferencesService } from '@/services/preferencesService';

const router = useRouter();

// States
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const emailError = ref('');
const passwordError = ref('');
const loginError = ref('');

type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    roles: string[];
    provider: {
      id: number;
      user_id: number;
      ced: string;
      contact_email: string;
      phone_number: string;
      location: string;
      long: string;
      lat: string;
      experience_years: number;
      schedule_type: number;
      img: string | null;
      likes: number;
      services: number;
      created_at: string;
      updated_at: string;
    };
  };
};

// Validaciones
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const validateEmail = () => {
  emailError.value = '';
  if (!email.value) {
    emailError.value = 'El correo electrónico es requerido';
    return false;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value)) {
    emailError.value = 'Correo electrónico inválido';
    return false;
  }
  return true;
};

const validatePassword = () => {
  passwordError.value = '';
  if (!password.value) {
    passwordError.value = 'La contraseña es requerida';
    return false;
  }
  if (password.value.length < 6) {
    passwordError.value = 'Mínimo 6 caracteres';
    return false;
  }
  return true;
};

// Ruta Raiz del API desde variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleLogin = async () => {
  loginError.value = '';
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (!isEmailValid || !isPasswordValid) return;

  loading.value = true;

  try {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/login`,
      {
        email: email.value.trim(),
        password: password.value
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    const user = response.data.user;
    const token = response.data.token;

    // Guardar en preferencesService (Capacitor) en lugar de localStorage
    await preferencesService.setToken(token);
    await preferencesService.setUserInfo(user);
    await preferencesService.set('isLoggedIn', 'true');

    // Actualizar tipo de usuario global después de guardar datos
    await updateGlobalUserType();

    // Emitir evento de login exitoso para que los composables recarguen
    window.dispatchEvent(new CustomEvent('loginSuccess', { 
      detail: { userType: user.roles.includes('Admin') ? 'admin' : user.roles.includes('Provider') ? 'provider' : 'client' } 
    }));

    console.log('Login exitoso:', {
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email
      },
      token: token ? 'Presente' : 'No recibido'
    });

    const toast = await toastController.create({
      message: `Bienvenido ${user.first_name}`,
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    // Redirección según los roles del usuario
    if (user.roles.includes('Admin')) {
      router.push('/tabs/admin');
    } else if (user.roles.includes('Provider')) {
      router.push('/tabs/provider');
    } else {
      router.push('/tabs/home');
    }

  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    if (error.response?.status === 422) {
      const errors = error.response.data.errors || {};
      loginError.value = Object.values(errors).flat().join(', ') || 'Datos inválidos';
    } else {
      loginError.value = error.response?.data?.message || 'Error en el servidor';
    }

    const toast = await toastController.create({
      message: loginError.value,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
@import './LoginStyles.css';
</style>
