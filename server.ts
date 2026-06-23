import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import cors from "cors";
import firebaseConfig from "./firebase-applet-config.json";

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
      const { vendorId, title, body, data, tokens } = req.body;

      if (!tokens || !tokens.length) {
        return res.status(400).json({ error: "Vendor does not have any registered devices" });
      }

      let badgeCount = 1;
      if (vendorId) {
        try {
          const db = admin.firestore();
          const ordersSnapshot = await db.collection("orders")
            .where("vendor_id", "==", vendorId)
            .where("status", "==", "pending")
            .get();
          badgeCount = ordersSnapshot.size;
        } catch (dbErr) {
          console.error("Error fetching order count from firestore:", dbErr);
        }
      }

      const stringifiedData: Record<string, string> = {
        title: title || "Nueva Notificación",
        body: body || "",
        url: data?.url || '/',
        badge: String(badgeCount)
      };
      if (data) {
        for (const key of Object.keys(data)) {
          stringifiedData[key] = String(data[key]);
        }
      }

      const message = {
        data: stringifiedData,
        tokens: tokens,
        webpush: {
          headers: {
            Urgency: "high" as const,
            TTL: "86400"
          },
          fcmOptions: {
            link: data?.url || '/'
          }
        },
        android: {
          priority: "high" as const,
          ttl: 86400000, // 1 day
        },
        apns: {
          headers: {
            "apns-priority": "10",
            "apns-expiration": String(Math.floor(Date.now() / 1000) + 86400)
          },
          payload: {
            aps: {
              sound: "default",
              badge: badgeCount,
              "mutable-content": 1,
              "content-available": 1
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
