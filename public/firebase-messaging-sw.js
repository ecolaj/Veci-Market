// 1. Install raw push handler FIRST to ensure synchronous execution for iOS.
self.addEventListener('push', function(event) {
  let title = 'Nueva Notificación';
  let body = '';
  let url = '/';

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload?.data?.title || payload?.notification?.title || title;
      body = payload?.data?.body || payload?.notification?.body || body;
      url = payload?.data?.url || payload?.fcmOptions?.link || url;
    } catch (e) {
      console.error('[SW] Parse push error', e);
    }
  }

  const options = {
    body,
    icon: '/icon.svg',
    data: { url },
    vibrate: [200, 100, 200]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            if (client.url !== self.location.origin + targetUrl) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// 2. Load Firebase SDKs afterwards
importScripts("/firebase-app-compat.js");
importScripts("/firebase-messaging-compat.js");

try {
  firebase.initializeApp({
    projectId: "gen-lang-client-0089159185",
    appId: "1:224877652809:web:3f8a3b31be2f3a006e0898",
    apiKey: "AIzaSyA7uaimZrC9O46C7A-KW73CK6R8fOn0yrI",
    authDomain: "gen-lang-client-0089159185.firebaseapp.com",
    storageBucket: "gen-lang-client-0089159185.firebasestorage.app",
    messagingSenderId: "224877652809",
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(() => {
    // Intentionally empty. We handle push manually above to guarantee iOS compliance.
  });
} catch(e) {
  console.error("Firebase init error", e);
}
