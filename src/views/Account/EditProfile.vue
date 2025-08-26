<template>
  <ion-page>
    <!-- Header reutilizable con título personalizado -->
    <PageHeader
      profile-trigger-id="edit-profile-trigger"
      title="Editar Perfil"
    />

    <!-- Menú desplegable del perfil -->
    <ProfilePopover
      trigger-id="edit-profile-trigger"
      :user-type="currentUserType"
    />

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- GoBack Arrow-->
      <div class="ion-arrow-back">
        <ion-button fill="clear" class="back-button" @click="router.go(-1)">
          <ion-icon :icon="arrowBackOutline"></ion-icon>
        </ion-button>
      </div>
      <!-- Nombre completo -->
      <div class="ion-text-center ion-margin-top">
        <ion-label class="profile-name"
          >{{ userData.nombre }} {{ userData.apellido }}</ion-label
        >
      </div>

      <!-- Imagen de perfil -->
      <div class="ion-text-center ion-margin-top" @click="abrirModalFoto">
        <ion-avatar class="profile-avatar">
          <img :src="fotoPerfilUrl" alt="Foto de perfil" />
        </ion-avatar>
      </div>

      <!-- Contenedor de datos -->
      <ion-card class="ion-margin-top data-card">
        <ion-card-content>
          <!-- Nombre -->
          <ion-item class="form-item">
            <ion-label position="stacked">Nombre:</ion-label>
            <ion-input
              id="edit-profile-nombre"
              v-model="userData.nombre"
              type="text"
              placeholder="Ingrese su nombre"
            ></ion-input>
          </ion-item>

          <!-- Apellido -->
          <ion-item class="form-item">
            <ion-label position="stacked">Apellido:</ion-label>
            <ion-input
              id="edit-profile-apellido"
              v-model="userData.apellido"
              type="text"
              placeholder="Ingrese su apellido"
            ></ion-input>
          </ion-item>

          <!-- Correo Electrónico -->
          <ion-item class="form-item">
            <ion-label position="stacked">Correo Electrónico:</ion-label>
            <ion-input
              id="edit-profile-email"
              v-model="userData.email"
              type="email"
              readonly
            ></ion-input>
          </ion-item>

          <!-- Teléfono -->
          <ion-item class="form-item">
            <ion-label position="stacked">Teléfono:</ion-label>
            <ion-input
              id="edit-profile-telefono"
              v-model="userData.telefono"
              type="tel"
              placeholder="Ingrese su teléfono"
            ></ion-input>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <!-- Botones Guardar y Limpiar -->
      <div class="button-container ion-margin-top">
        <ion-button
          id="edit-profile-save-btn"
          expand="block"
          color="primary"
          @click="guardarPerfil"
          class="save-button"
        >
          <ion-icon :icon="saveOutline" slot="start"></ion-icon>
          Guardar Cambios
        </ion-button>
        <ion-button
          id="edit-profile-reset-btn"
          expand="block"
          color="medium"
          @click="limpiarCampos"
          class="clear-button"
        >
          <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
          Restablecer
        </ion-button>
      </div>

      <!-- Modal para editar foto -->
      <ion-modal
        id="edit-profile-photo-modal"
        :is-open="modalAbierto"
        @didDismiss="cerrarModalFoto"
        :initial-breakpoint="1"
        :breakpoints="[0, 1]"
        class="profile-photo-modal"
      >
        <ion-content class="modal-content-custom">
          <div class="modal-container">
            <!-- Foto grande centrada -->
            <div class="modal-photo-wrapper">
              <ion-avatar class="modal-avatar-large">
                <img :src="fotoPerfilUrl" alt="Foto de perfil" />
              </ion-avatar>
            </div>

            <!-- Contenedor de botones verticales -->
            <div class="modal-buttons-container">
              <!-- Botón Editar -->
              <ion-button
                id="modal-edit-photo-btn"
                fill="clear"
                @click="editarFoto"
                class="modal-action-button"
              >
                <ion-icon :icon="pencilOutline" slot="icon-only"></ion-icon>
              </ion-button>

              <!-- Botón Borrar -->
              <ion-button
                id="modal-delete-photo-btn"
                fill="clear"
                @click="eliminarFoto"
                class="modal-action-button"
              >
                <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
              </ion-button>

              <!-- Botón Cerrar -->
              <ion-button
                id="modal-close-btn"
                fill="clear"
                @click="cerrarModalFoto"
                class="modal-action-button"
              >
                <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonAvatar,
  IonLabel,
  IonItem,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonModal,
  IonIcon,
  alertController,
  toastController,
} from "@ionic/vue";

import {
  pencilOutline,
  trashOutline,
  closeOutline,
  saveOutline,
  refreshOutline,
  arrowBackOutline,
} from "ionicons/icons";

import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Importar componentes optimizados
import PageHeader from "@/components/PageHeader.vue";
import ProfilePopover from "@/components/ProfilePopover.vue";

// Importar composable para acciones de perfil (que incluye user type)
import { useProfileActions } from "@/composables/useProfileActions";

// Importar servicio de preferencias
import { preferencesService } from "@/services/preferencesService";

const router = useRouter();

// Usar composables optimizados
const { currentUserType, setupEventListeners, cleanupEventListeners } =
  useProfileActions();

// Datos del perfil del usuario
const userData = ref({
  nombre: "example",
  apellido: "Example Example",
  email: "example@example.com",
  telefono: "test-test",
});

// URL de la foto de perfil
const fotoPerfilUrl = ref(
  "https://ionicframework.com/docs/img/demos/avatar.svg"
);

// Estado del modal
const modalAbierto = ref(false);

// Datos originales para restablecer
const originalUserData = ref({ ...userData.value });

// Función para cargar datos del usuario desde Preferences
const loadUserDataFromPreferences = (user: any) => {
  userData.value = {
    nombre: user.nombre || user.first_name || "Usuario",
    apellido: user.apellido || user.last_name || "Apellido",
    email: user.email || user.correo || "",
    telefono: user.telefono || user.phone || user.personal_phone_number || "",
  };
  originalUserData.value = { ...userData.value };
};

// Función para actualizar el tipo de usuario y cargar datos
const updateUserData = async () => {
  try {
    const userInfo = await preferencesService.getUserProfile();
    if (userInfo) {
      loadUserDataFromPreferences(userInfo);
    }
  } catch (error) {
    console.error(
      "Error obteniendo información del usuario desde Preferences:",
      error
    );
  }
};

onMounted(() => {
  updateUserData();
  setupEventListeners();
});

onUnmounted(() => {
  cleanupEventListeners();
});

// Métodos del perfil
const abrirModalFoto = () => {
  modalAbierto.value = true;
};

const cerrarModalFoto = () => {
  modalAbierto.value = false;
};

const editarFoto = () => {
  console.log("Editar foto - funcionalidad pendiente");
  // Aquí se implementaría la lógica para seleccionar nueva foto
  cerrarModalFoto();
};

const eliminarFoto = async () => {
  const alert = await alertController.create({
    header: "Confirmar",
    message: "¿Estás seguro de que deseas eliminar tu foto de perfil?",
    buttons: [
      {
        text: "Cancelar",
        role: "cancel",
      },
      {
        text: "Eliminar",
        handler: () => {
          fotoPerfilUrl.value =
            "https://ionicframework.com/docs/img/demos/avatar.svg";
          cerrarModalFoto();
        },
      },
    ],
  });

  await alert.present();
};

const guardarPerfil = async () => {
  try {
    // Validaciones básicas
    if (!userData.value.nombre.trim() || !userData.value.apellido.trim()) {
      const toast = await toastController.create({
        message: "El nombre y apellido son obligatorios",
        duration: 3000,
        color: "danger",
        position: "top",
      });
      await toast.present();
      return;
    }

    // Preparar datos para actualizar usando la nueva API
    const updateData = {
      first_name: userData.value.nombre,
      last_name: userData.value.apellido,
      personal_phone_number: userData.value.telefono,
    };
    //Cargar token desde preferences
    const token = await preferencesService.getToken();

    //Realizar petisión HTTP
    await axios.put(`${API_BASE_URL}/profile`, updateData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Actualizar perfil usando la nueva API
    await preferencesService.updateUserProfile(updateData);

    // Actualizar datos originales
    originalUserData.value = { ...userData.value };

    // Mostrar confirmación
    const toast = await toastController.create({
      message: "Perfil actualizado exitosamente",
      duration: 3000,
      color: "success",
      position: "top",
    });
    await toast.present();

    // Redirigir al usuario a la página de inicio después de la actualización exitosa
    setTimeout(() => {
      router.push('/tabs/home');
    }, 1500); // Esperar 1.5 segundos para que el usuario vea el mensaje de éxito

    
  } catch (error) {
    console.error("Error al guardar perfil:", error);
    const toast = await toastController.create({
      message: "Error al guardar los cambios",
      duration: 3000,
      color: "danger",
      position: "top",
    });
    await toast.present();
  }
};

const limpiarCampos = () => {
  // Restablecer a los datos originales
  userData.value = { ...originalUserData.value };
};
</script>

<style scoped>
@import "@/styles/common.css";
@import "../Account/EditProfileStyles.css";
</style>
