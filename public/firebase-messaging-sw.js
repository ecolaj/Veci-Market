// 1. Install raw push handler FIRST to ensure synchronous execution for iOS.
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  let title = 'Nueva Notificación';
  let body = '';
  let url = '/';
  let badgeCount = 1;

  if (event.data) {
    try {
      const payload = event.data.json();
      // Robust payload parsing for nested or top-level properties
      title = payload?.data?.title || payload?.notification?.title || payload?.title || title;
      body = payload?.data?.body || payload?.notification?.body || payload?.body || body;
      url = payload?.data?.url || payload?.fcmOptions?.link || payload?.url || url;
      
      const bVal = payload?.data?.badge || payload?.badge;
      if (bVal) {
        badgeCount = parseInt(bVal, 10) || 1;
      }
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

  // Promise for updating the badge count
  const updateBadgePromise = (typeof navigator !== 'undefined' && 'setAppBadge' in navigator)
    ? navigator.setAppBadge(badgeCount).catch(function(err) {
        console.warn("Error setting app badge in SW:", err);
      })
    : Promise.resolve();

  // Promise for displaying the notification (only when app is in background)
  const showNotificationPromise = clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
    const isForeground = clientList.some(function(client) {
      return client.focused;
    });
    if (isForeground) {
      console.log('[SW] App is in foreground, skipping native notification.');
      return;
    }
    return self.registration.showNotification(title, options);
  });

  // Wait for both promises to complete to keep the service worker alive
  event.waitUntil(
    Promise.all([updateBadgePromise, showNotificationPromise])
  );
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
