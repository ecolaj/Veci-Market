importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// We will fetch config dynamically but for typical setups we need config.
// Here we will rely on client caching or simply leave it placeholder.
self.addEventListener('push', function(event) {
  const payload = event.data?.json();
  if (payload) {
    const title = payload.notification?.title || 'Nueva Notificación';
    const options = {
      body: payload.notification?.body,
      icon: '/pwa-192x192.png',
      vibrate: [200, 100, 200], // Vibration pattern
      data: payload.data
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
