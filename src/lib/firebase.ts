import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export let messaging: any = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("Firebase Messaging not supported in this environment");
}

export async function requestNotificationPermission(userId?: string) {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      let registration: ServiceWorkerRegistration | undefined;
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          if (registrations.length === 0) {
            await navigator.serviceWorker.register('/sw.js');
          }
          registration = await navigator.serviceWorker.ready;
        } catch (swErr) {
          console.warn("Could not retrieve ready service worker registration", swErr);
        }
      }

      const currentToken = await getToken(messaging, { 
        serviceWorkerRegistration: registration,
        vapidKey: (import.meta as any).env.VITE_FIREBASE_VAPID_KEY || undefined
      });
      if (currentToken) {
        if (userId) {
          try {
            await updateDoc(doc(db, 'users', userId), {
              fcm_tokens: arrayUnion(currentToken)
            });
            console.log("FCM Token saved to user document.");
          } catch(err) {
            console.error("Error saving FCM token", err);
          }
        }
        return currentToken;
      }
    }
    return null;
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
