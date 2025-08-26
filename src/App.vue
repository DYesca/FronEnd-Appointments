<template>
  <ion-app>
    <!-- Menú lateral global -->
    <ion-menu content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <!-- Botón cerrar menú -->
          <div class="close-menu-btn">
            <ion-button fill="clear" size="default" @click="closeMenu" class="close-btn">
              <ion-icon :icon="close" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div class="menu-wrapper">
          <!-- Lista del menú -->
          <ion-list>
            <!-- Opciones comunes para todos -->
            <ion-item button @click="navigateTo('/tabs/home')">
              <ion-icon :icon="homeOutline" slot="start"></ion-icon>
              <ion-label>Home</ion-label>
            </ion-item>

            <ion-item button @click="navigateTo('/tabs/appointments')">
              <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
              <ion-label>Appointments</ion-label>
            </ion-item>

            <ion-item button @click="navigateTo('/tabs/chats')">
              <ion-icon :icon="chatboxOutline" slot="start"></ion-icon>
              <ion-label>Chats</ion-label>
            </ion-item>

            <!-- Opciones específicas para PROVEEDOR -->
            <template v-if="userType === 'provider'">
              <!-- Opción Horario con submenú -->
              <ion-item button @click="toggleScheduleMenu">
                <ion-icon :icon="timeOutline" slot="start"></ion-icon>
                <ion-label>Horario</ion-label>
                <ion-icon 
                  :icon="scheduleMenuOpen ? chevronUpOutline : chevronDownOutline" 
                  slot="end">
                </ion-icon>
              </ion-item>
              
              <!-- Submenú de Horario (solo visible si está abierto) -->
              <div class="submenu" v-if="scheduleMenuOpen">
                <ion-item button class="submenu-item" @click="setScheduleType('strict')">
                  <div class="submenu-content">
                    <ion-label>Estricto</ion-label>
                    <ion-toggle 
                      :checked="scheduleType === 'strict'" 
                      @ionChange="setScheduleType('strict')"
                      slot="end">
                    </ion-toggle>
                  </div>
                </ion-item>
                
                <ion-item button class="submenu-item" @click="setScheduleType('flexible')">
                  <div class="submenu-content">
                    <ion-label>Flexible</ion-label>
                    <ion-toggle 
                      :checked="scheduleType === 'flexible'" 
                      @ionChange="setScheduleType('flexible')"
                      slot="end">
                    </ion-toggle>
                  </div>
                </ion-item>
              </div>
            </template>

            <!-- Opciones específicas para ADMIN -->
            <template v-if="userType === 'admin'">
              <!-- Opción Administrar con submenú -->
              <ion-item button @click="toggleAdminMenu">
                <ion-icon :icon="shieldCheckmarkOutline" slot="start"></ion-icon>
                <ion-label>Administrar</ion-label>
                <ion-icon 
                  :icon="adminMenuOpen ? chevronUpOutline : chevronDownOutline" 
                  slot="end">
                </ion-icon>
              </ion-item>
              
              <!-- Submenú de Administrar (solo visible si está abierto) -->
              <div class="submenu" v-if="adminMenuOpen">
                <ion-item button class="submenu-item" @click="navigateTo('/admin/users')">
                  <ion-icon :icon="peopleOutline" slot="start"></ion-icon>
                  <ion-label>Usuarios</ion-label>
                </ion-item>
                
                <ion-item button class="submenu-item" @click="navigateTo('/admin/categories')">
                  <ion-icon :icon="layersOutline" slot="start"></ion-icon>
                  <ion-label>Categorías</ion-label>
                </ion-item>
              </div>
            </template>

            <!-- Opciones comunes para todos -->
            <ion-item button @click="navigateTo('/nosotros')">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-label>Nosotros</ion-label>
            </ion-item>

            <ion-item button @click="navigateTo('/configuracion')">
              <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
              <ion-label>Configuración</ion-label>
            </ion-item>
          </ion-list>
        </div>
      </ion-content>
    </ion-menu>

    <!-- Contenido principal -->
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonToggle,
  menuController
} from '@ionic/vue';
import {
  homeOutline,
  calendarOutline,
  chatboxOutline,
  personOutline,
  settingsOutline,
  timeOutline,
  shieldCheckmarkOutline,
  peopleOutline,
  layersOutline,
  chevronUpOutline,
  chevronDownOutline,
  close
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserType } from '@/composables/useUserType';

const router = useRouter();
const { userType, updateUserType } = useUserType();

// Estado de los menús desplegables
const scheduleMenuOpen = ref(false);
const adminMenuOpen = ref(false);

// Estado del tipo de horario para proveedor
const scheduleType = ref('flexible');

// Listener para cambios en preferencesService
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'userInfo') {
    updateUserType();
  }
};

// Función para forzar actualización del tipo de usuario (con debounce)
let updateTimeout: NodeJS.Timeout | null = null;
const forceUserTypeUpdate = async () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  updateTimeout = setTimeout(async () => {
    await updateUserType();
  }, 50);
};

// Listener para eventos personalizados de cambio de usuario
const handleUserTypeChanged = () => {
  // La actualización ya se hace en el composable
};

// Funciones de navegación
const navigateTo = async (route: string) => {
  await menuController.close();
  router.push(route);
};

const closeMenu = async () => {
  await menuController.close();
};

// Funciones para manejar menús desplegables
const toggleScheduleMenu = () => {
  scheduleMenuOpen.value = !scheduleMenuOpen.value;
  // Cerrar el menú de admin si está abierto
  if (scheduleMenuOpen.value) {
    adminMenuOpen.value = false;
  }
};

const toggleAdminMenu = () => {
  adminMenuOpen.value = !adminMenuOpen.value;
  // Cerrar el menú de horario si está abierto
  if (adminMenuOpen.value) {
    scheduleMenuOpen.value = false;
  }
};

// Función para cambiar tipo de horario
const setScheduleType = (type: 'strict' | 'flexible') => {
  scheduleType.value = type;
  console.log('Tipo de horario cambiado a:', type);
};

// Detectar tipo de usuario al montar el componente y escuchar cambios
onMounted(async () => {
  // Actualizar tipo de usuario inicial
  await updateUserType();
  
  // Escuchar cambios en localStorage (legacy - mantener por compatibilidad)
  window.addEventListener('storage', handleStorageChange);
  
  // Escuchar eventos personalizados de cambio de usuario
  window.addEventListener('userTypeChanged', handleUserTypeChanged);
  
  // Escuchar cambios de ruta para actualizar usuario
  router.afterEach(() => {
    forceUserTypeUpdate();
  });
});

// Limpiar listeners al desmontar
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('userTypeChanged', handleUserTypeChanged);
});
</script>

<style scoped>
/* Importar estilos comunes del sistema de diseño optimizado */
@import '@/styles/common.css';

/* === ESTILOS ESPECÍFICOS DEL MENÚ LATERAL === */

/* Configuración base del menú */
ion-menu {
  --background: var(--app-primary-color);
  --color: var(--app-secondary-color);
  --min-width: var(--app-sidebar-width);
}

ion-menu ion-header {
  border-bottom: 1px solid var(--app-secondary-transparent);
}

ion-menu ion-toolbar {
  --background: var(--app-primary-color);
  --color: var(--app-secondary-color);
  --border-width: 0;
}

ion-menu ion-content {
  --background: var(--app-primary-color);
}

/* === CONTENEDOR DEL MENÚ === */
.menu-wrapper {
  padding: var(--app-spacing-md);
  background-color: transparent;
}

/* === BOTÓN CERRAR MENÚ === */
.close-menu-btn {
  display: flex;
  justify-content: flex-start;
  margin-bottom: var(--app-spacing-md);
  padding-top: var(--app-spacing-sm);
}

.close-btn {
  --color: var(--app-secondary-color);
  font-size: var(--app-font-size-2xl);
  width: 48px;
  height: 48px;
  padding: var(--app-spacing-sm);
  transition: var(--app-transition-normal);
}

.close-btn:hover {
  --color: var(--app-accent-color);
}

/* === LISTA DEL MENÚ === */
ion-menu ion-list {
  background: transparent;
}

/* Items del menú - usando clases del sistema común */
ion-menu ion-item {
  --background: transparent;
  --color: var(--app-secondary-color);
  --border-color: transparent;
  --inner-border-width: 0;
  --padding-start: var(--app-spacing-md);
  --padding-end: var(--app-spacing-md);
  margin: var(--app-spacing-xs) var(--app-spacing-sm);
  border-radius: var(--app-border-radius-md);
  transition: var(--app-transition-normal);
}

/* Estados hover consistentes con el sistema */
ion-menu ion-item:hover {
  --background: var(--app-accent-transparent);
  --color: var(--app-accent-color);
  transform: translateX(var(--app-spacing-xs));
}

/* Iconos del menú */
ion-menu ion-item ion-icon {
  color: var(--app-secondary-color);
  margin-right: var(--app-spacing-md);
  transition: color var(--app-transition-normal);
}

ion-menu ion-item:hover ion-icon {
  color: var(--app-accent-color);
}

/* Labels del menú */
ion-menu ion-item ion-label {
  color: var(--app-secondary-color);
  font-weight: var(--app-font-weight-medium);
  transition: color var(--app-transition-normal);
}

ion-menu ion-item:hover ion-label {
  color: var(--app-accent-color);
}

/* === SUBMENÚS === */
.submenu {
  margin-left: var(--app-spacing-lg);
  margin-top: var(--app-spacing-xs);
  margin-bottom: var(--app-spacing-sm);
  border-left: 2px solid var(--app-accent-transparent);
  padding-left: var(--app-spacing-sm);
}

/* Items de submenú - sin !important, usando especificidad correcta */
.submenu .submenu-item {
  --background: var(--app-secondary-transparent);
  --color: var(--app-secondary-color);
  margin: var(--app-spacing-xs) 0;
  border-radius: var(--app-border-radius-sm);
  --padding-start: var(--app-spacing-sm);
  --padding-end: var(--app-spacing-sm);
}

.submenu .submenu-item:hover {
  --background: var(--app-accent-transparent);
  --color: var(--app-accent-color);
}

/* Iconos de submenú */
.submenu .submenu-item ion-icon {
  color: var(--app-secondary-color);
  font-size: var(--app-font-size-base);
  margin-right: var(--app-spacing-sm);
}

.submenu .submenu-item:hover ion-icon {
  color: var(--app-accent-color);
}

/* Labels de submenú */
.submenu .submenu-item ion-label {
  color: var(--app-secondary-color);
  font-size: var(--app-font-size-sm);
  font-weight: var(--app-font-weight-normal);
}

.submenu .submenu-item:hover ion-label {
  color: var(--app-accent-color);
}

/* === CONTENIDO DE SUBMENÚ === */
.submenu-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* Toggles de submenú */
.submenu-content ion-toggle {
  --background: var(--app-primary-transparent);
  --background-checked: var(--app-accent-color);
  --handle-background: var(--app-secondary-color);
  --handle-background-checked: var(--app-secondary-color);
  transform: scale(0.8);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  ion-menu {
    --min-width: 240px;
  }
  
  .menu-wrapper {
    padding: var(--app-spacing-sm);
  }
  
  .close-btn {
    font-size: var(--app-font-size-xl);
    width: 40px;
    height: 40px;
  }
}
</style>
