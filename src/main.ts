import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

/* Common styles for optimized components */
import './styles/common.css';

// Importar composable de geolocalización
import { useGeolocation } from '@/composables/useGeolocation';

/**
 * Inicializa servicios de la aplicación
 */
const initializeServices = async () => {
  try {
    console.log('🔄 Inicializando servicios de la aplicación...');
    
    // Inicializar geolocalización
    const { initialize, getCurrentPosition, loadLocationFromStorage } = useGeolocation();
    await initialize();
    
    // Intentar cargar ubicación guardada primero
    const cachedLocation = await loadLocationFromStorage();
    
    if (!cachedLocation) {
      // Si no hay ubicación guardada, intentar obtener una nueva
      console.log('📍 Intentando obtener ubicación actual del usuario...');
      try {
        await getCurrentPosition();
        console.log('✅ Ubicación obtenida exitosamente');
      } catch (locationError) {
        console.warn('⚠️ No se pudo obtener la ubicación:', locationError);
      }
    } else {
      console.log('✅ Ubicación cargada desde cache');
    }
    
    console.log('✅ Servicios inicializados correctamente');
  } catch (error) {
    console.error('❌ Error inicializando servicios:', error);
  }
};

const app = createApp(App)
  .use(IonicVue, {
    // Configuraciones de accesibilidad para Ionic
    mode: 'md', // Usar modo Material Design consistentemente
    animated: true
  })
  .use(router);

// Configurar eventos globales para mejorar accesibilidad
router.isReady().then(async () => {
  // Inicializar servicios antes de montar la app
  await initializeServices();
  
  app.mount('#app');
  
  // Configurar manejo global de overlays para accesibilidad
  document.addEventListener('DOMContentLoaded', () => {
    // Remover aria-hidden de overlays cuando están activos
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const element = mutation.target as HTMLElement;
          if (element.classList.contains('show-modal') || element.classList.contains('show-popover')) {
            if (element.hasAttribute('aria-hidden')) {
              element.removeAttribute('aria-hidden');
            }
          }
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'aria-hidden']
    });
  });
});


// === DATOS DE PRUEBA TEMPORALES ===
// DESCOMENTAR SOLO PARA TESTING SIN LOGIN
// COMENTAR ESTAS LÍNEAS PARA USAR LOGIN REAL
/*
import { preferencesService } from '@/services/preferencesService';
import { testAuthDebug } from '@/debug/testAuth';

preferencesService.setToken('2|ew3d4mfTitEcFGXYjzmPidTV3N7SZ1cjNfD6C5zC848051e9');

preferencesService.setUserInfo({
  id: 5,
  first_name: 'Cliente',
  last_name: 'Uno',
  email: 'client1.@example.com',
  role: 'client'
});

setTimeout(() => {
  testAuthDebug();
}, 1000);
*/
