import Echo from 'laravel-echo';
import { preferencesService } from './preferencesService';

let echoInstance: Echo<any> | null = null;

export async function getEchoInstance() {
  if (echoInstance) return echoInstance;

  const token = await preferencesService.getToken();

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: import.meta.env.VITE_API_BASE_URL + '/broadcasting/auth',
    wsHost: import.meta.env.VITE_PUSHER_APP_HOST,
    wsPort: import.meta.env.VITE_PUSHER_APP_PORT,
    wssPort: import.meta.env.VITE_PUSHER_APP_PORT,
    enabledTransports: ['ws', 'wss'],
    auth: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
  });

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
