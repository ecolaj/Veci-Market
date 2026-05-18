importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// We will fetch config dynamically but for typical setups we need config.
// Here we will rely on client caching or simply leave it placeholder.
self.addEventListener('push', function(event) {
  let payload;
  try {
    payload = event.data?.json();
  } catch (e) {
    // If not JSON, try text
    payload = { notification: { title: 'Notificación', body: event.data?.text() } };
  }
  
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

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Try to open the provided URL, or fallback to root
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If a window client is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no window client is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
