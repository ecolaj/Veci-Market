import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';
import FirebaseProvider from './providers/FirebaseProvider.tsx';
import { ThemeProvider } from './providers/ThemeProvider.tsx';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Lógica para auto-actualizar la PWA sin que el usuario deba desinstalar
if ('serviceWorker' in navigator) {
  let refreshing = false;
  
  // Detecta cuando un nuevo Service Worker toma el control y refresca la página
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    // Limpieza de Service Workers duplicados
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        if (reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')) {
          console.log("Cleanup duplicate firebase-messaging-sw registration:", reg.active.scriptURL);
          reg.unregister();
        }
      }
    }).catch(console.error);

    navigator.serviceWorker.ready.then((registration) => {
      // Cuando la PWA vuelve a estar en primer plano, buscamos actualizaciones del código
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(console.error);
        }
      });
      
      // También chequeamos cada 15 minutos si la app se queda abierta
      setInterval(() => {
        registration.update().catch(console.error);
      }, 15 * 60 * 1000);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </FirebaseProvider>
  </StrictMode>,
);
