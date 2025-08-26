import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import HomePage from '../views/Home/HomePage.vue';
import TapBar from '@/components/TapBar.vue';

// ===== INTERFACES Y TIPOS =====
interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  roles: string[];
  [key: string]: any;
}

type UserType = 'provider' | 'admin' | 'client' | 'user';

// ===== UTILIDADES =====
const getUserInfo = (): UserInfo | null => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return null;
  
  try {
    return JSON.parse(userInfo) as UserInfo;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
};

// Función para determinar el tipo de usuario basado en roles
const getUserType = (user: UserInfo): UserType => {
  if (user.roles.includes('Admin')) {
    return 'admin';
  } else if (user.roles.includes('Provider')) {
    return 'provider';
  } else {
    return 'client';
  }
};

// ===== GUARDS DE NAVEGACIÓN =====
// Mapa de redirecciones por tipo de usuario
const USER_REDIRECT_MAP: Record<UserType, string> = {
  'provider': '/tabs/provider',
  'admin': '/tabs/admin',
  'client': '/tabs/home',
  'user': '/tabs/home'
};

// Guard para redirección basada en tipo de usuario
const redirectBasedOnUserType = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const user = getUserInfo();
  
  if (user) {
    const userType = getUserType(user);
    const redirectPath = USER_REDIRECT_MAP[userType];
    if (redirectPath && redirectPath !== to.path) {
      next(redirectPath);
      return;
    }
  }
  
  next();
};

// Guard para verificar acceso de admin
const adminGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const user = getUserInfo();
  
  if (!user || getUserType(user) !== 'admin') {
    next('/tabs/home');
    return;
  }
  
  next();
};

// Guard específico para appointments con lógica de redirección
const appointmentsGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const user = getUserInfo();
  
  if (user) {
    const userType = getUserType(user);
    if (userType === 'provider') {
      next('/tabs/appointments-provider');
      return;
    } else if (userType === 'admin') {
      next('/tabs/admin');
      return;
    }
  }
  
  next();
};

// ===== DEFINICIÓN DE RUTAS =====
const routes: Array<RouteRecordRaw> = [
  // === RUTA RAÍZ ===
  {
    path: '/',
    redirect: '/login'
  },
  
  // === RUTAS DE AUTENTICACIÓN ===
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/VistasLoginAndRegister/Login/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/VistasLoginAndRegister/Register/RegisterPage.vue')
  },
  {
    path: '/register/user',
    name: 'RegisterUser',
    component: () => import('@/views/VistasLoginAndRegister/Register/RegisterUser.vue')
  },
  {
    path: '/register/provider',
    name: 'RegisterProvider',
    component: () => import('@/views/VistasLoginAndRegister/Register/RegisterProvider.vue')
  },
  
  // === RUTAS PRINCIPALES CON TABS ===
  {
    path: '/tabs',
    component: TapBar,
    children: [
      // Redirección por defecto
      {
        path: '',
        redirect: 'home'
      },
      
      // === RUTAS DE USUARIOS ===
      {
        path: 'home',
        name: 'Home',
        component: HomePage,
        beforeEnter: redirectBasedOnUserType
      },
      {
        path: 'geosearch',
        name: 'GeoSearch',
        component: () => import('@/views/Home/GeoSearch.vue'),
        beforeEnter: redirectBasedOnUserType
      },
      {
        path: 'appointments',
        name: 'Appointments',
        component: () => import('@/views/Home/AppointmenstPage.vue'),
        beforeEnter: appointmentsGuard
      },
      {
        path: 'chats',
        name: 'Chats',
        component: () => import('@/views/Home/ChatsPage.vue')
      },
      
      // === RUTAS DE PROVEEDORES ===
      {
        path: 'provider',
        name: 'Provider',
        component: () => import('@/views/Provider/ProviderPage.vue'),
        beforeEnter: redirectBasedOnUserType
      },
      {
        path: 'appointments-provider',
        name: 'AppointmentsProvider',
        component: () => import('@/views/Provider/AppointmentsProvider.vue')
      },
      
      // === RUTAS DE ADMINISTRACIÓN ===
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/Admin/AdminPage.vue'),
        beforeEnter: adminGuard
      },
      
      // === RUTAS DE PERFIL ===
      {
        path: 'edit-profile',
        name: 'EditProfile',
        component: () => import('@/views/Account/EditProfile.vue')
      }
    ]
  },
  
  // === RUTAS DIRECTAS (REDIRECCIONES) ===
  {
    path: '/home',
    redirect: '/tabs/home'
  },
  {
    path: '/provider',
    redirect: '/tabs/provider'
  },
  {
    path: '/admin',
    redirect: '/tabs/admin'
  },
  {
    path: '/appointments',
    redirect: '/tabs/appointments'
  },
  {
    path: '/providers/subcategory/:categoryId/:subcategoryId',
    name: 'ProvidersSubcategory',
    component: () => import('@/views/Home/ProvidersPage.vue')
  },
  
  // === RUTAS STANDALONE ===
  {
    path: '/nosotros',
    name: 'AboutUs',
    component: () => import('@/views/NosotrosPage/AboutUs.vue')
  },
  {
    path: '/configuracion',
    name: 'Settings',
    component: () => import('@/views/Settings/SettingsPage.vue')
  },
  
  // === RUTA 404 (OPCIONAL) ===
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/tabs/home'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router


