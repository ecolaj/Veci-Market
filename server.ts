import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

let firebaseAdminInitialized = false;

// Initialize Firebase Admin if Service Account JSON is provided
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseAdminInitialized = true;
    console.log("Firebase Admin successfully initialized.");
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is missing. Push notifications will be disabled.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", adminInitialized: firebaseAdminInitialized });
  });

  app.post("/api/notify", async (req, res) => {
    if (!firebaseAdminInitialized) {
      return res.status(503).json({ error: "Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON to .env" });
    }

    try {
      const { vendorId, title, body, data } = req.body;

      if (!vendorId) {
        return res.status(400).json({ error: "No vendorId provided" });
      }
      
      const userDoc = await admin.firestore().collection('users').doc(vendorId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      const userData = userDoc.data();
      const tokens = userData?.fcm_tokens || [];

      if (!tokens || !tokens.length) {
        return res.status(400).json({ error: "Vendor does not have any registered devices" });
      }

      const message = {
        notification: {
          title: title || "Nueva Notificación",
          body: body || ""
        },
        data: data || {},
        tokens: tokens,
        webpush: {
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
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      return res.json({ 
        success: true, 
        successCount: response.successCount, 
        failureCount: response.failureCount 
      });

    } catch (error: any) {
      console.error("Error sending notification:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
