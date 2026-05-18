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

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here if needed, but if 'notification' payload is sent from the server,
  // FCM will automatically display it. If we use data-only payload, we can display it manually:
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Nueva Notificación';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: '/pwa-192x192.png',
    data: payload.data || {}
  };

  // self.registration.showNotification(notificationTitle, notificationOptions);
  // Note: if you send purely a "notification" payload, Firebase automatically shows it.
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Try to open the provided URL, or fallback to root
  const targetUrl = event.notification.data?.url || event.notification.data?.FCM_MSG?.data?.url || '/';

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
