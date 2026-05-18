importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  "projectId": "gen-lang-client-0089159185",
  "appId": "1:224877652809:web:3f8a3b31be2f3a006e0898",
  "apiKey": "AIzaSyA7uaimZrC9O46C7A-KW73CK6R8fOn0yrI",
  "authDomain": "gen-lang-client-0089159185.firebaseapp.com",
  "storageBucket": "gen-lang-client-0089159185.firebasestorage.app",
  "messagingSenderId": "224877652809"
});

const messaging = firebase.messaging();

// Firebase automatically handles 'push' events when 'notification' payload is received from the server.
// If we send data-only messages, this handler will be called:
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  if (!payload.notification) {
    const title = payload.data?.title || 'Nueva Notificación';
    const options = {
      body: payload.data?.body || '',
      icon: '/icon.svg',
      data: payload.data || {},
      vibrate: [200, 100, 200]
    };
    self.registration.showNotification(title, options);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
