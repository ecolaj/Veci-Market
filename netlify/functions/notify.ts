import { Handler } from '@netlify/functions';
import admin from 'firebase-admin';

let firebaseAdminInitialized = false;

// Initialize Firebase Admin if Service Account JSON is provided
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    firebaseAdminInitialized = true;
    console.log("Firebase Admin successfully initialized.");
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is missing.");
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  if (!firebaseAdminInitialized) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: "Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON to .env" })
    };
  }

  try {
    const { title, body, data, tokens } = JSON.parse(event.body || '{}');

    if (!tokens || !tokens.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Vendor does not have any registered devices" })
      };
    }

    const message = {
      notification: {
        title: title || "Nueva Notificación",
        body: body || ""
      },
      data: data || {},
      tokens: tokens,
      webpush: {
        headers: {
          Urgency: "high",
          TTL: "86400"
        },
        notification: {
          title: title || "Nueva Notificación",
          body: body || "",
          icon: '/icon.svg',
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: data?.url || '/'
        }
      },
      android: {
        priority: "high" as const,
        ttl: 86400000, // 1 day
        notification: {
          sound: "default",
          clickAction: "FLUTTER_NOTIFICATION_CLICK"
        }
      },
      apns: {
        headers: {
          "apns-priority": "10",
          "apns-expiration": String(Math.floor(Date.now() / 1000) + 86400)
        },
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            "mutable-content": 1,
            "content-available": 1
          }
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        success: true, 
        successCount: response.successCount, 
        failureCount: response.failureCount 
      })
    };

  } catch (error: any) {
    console.error("Error sending notification:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
