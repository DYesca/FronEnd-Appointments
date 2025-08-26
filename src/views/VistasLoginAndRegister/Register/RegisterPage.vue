<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-header">
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="goBack">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="header-title">Registro</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="register-container">
        
        <!-- Logo o título de la app -->
        <div class="app-logo">
          <ion-icon :icon="briefcaseOutline" class="logo-icon"></ion-icon>
          <h1 class="app-title">Únete a Nosotros</h1>
          <p class="app-subtitle">Elige el tipo de cuenta que deseas crear</p>
        </div>

        <!-- Opciones de registro -->
        <div class="register-options">
          
          <!-- Opción Usuario -->
          <div class="option-card" @click="goToUserRegister">
            <div class="option-icon">
              <ion-icon :icon="personOutline"></ion-icon>
            </div>
            <div class="option-content">
              <h2 class="option-title">Usuario</h2>
              <p class="option-description">
                Busca y contrata profesionales para tus necesidades
              </p>
              <div class="option-features">
                <div class="feature">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  <span>Buscar profesionales</span>
                </div>
                <div class="feature">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  <span>Solicitar servicios</span>
                </div>
                <div class="feature">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  <span>Calificar servicios</span>
                </div>
              </div>
            </div>
            <div class="option-arrow">
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </div>
          </div>

          <!-- Opción Proveedor -->
          <div class="option-card" @click="goToProviderRegister">
            <div class="option-icon provider">
              <ion-icon :icon="briefcaseOutline"></ion-icon>
            </div>
            <div class="option-content">
              <h2 class="option-title">Proveedor</h2>
              <p class="option-description">
                Ofrece tus servicios profesionales y encuentra clientes
              </p>
              <div class="option-features">
                <div class="feature">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  <span>Crear perfil profesional</span>
                </div>
                <div class="feature">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  <span>Gestionar horarios</span>
                </div>
                <div class="feature">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  <span>Recibir solicitudes</span>
                </div>
              </div>
            </div>
            <div class="option-arrow">
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </div>
          </div>

        </div>

        <!-- Enlace a login -->
        <div class="login-link">
          <span>¿Ya tienes una cuenta? </span>
          <a @click="goToLogin" class="link">Inicia sesión aquí</a>
        </div>

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
  IonButtons,
  IonIcon 
} from '@ionic/vue';

import {
  briefcaseOutline,
  personOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { useRouter } from 'vue-router';

const router = useRouter();

// Navegación
const goBack = () => {
  router.push('/login');
};

const goToLogin = () => {
  router.push('/login');
};

const goToUserRegister = () => {
  router.push('/register/user');
};

const goToProviderRegister = () => {
  router.push('/register/provider');
};
</script>

<style scoped>
@import './RegisterPageStyles.css';
</style>
