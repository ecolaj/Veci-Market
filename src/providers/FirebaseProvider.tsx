import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
import { auth, db, requestNotificationPermission } from '../lib/firebase';
import { useAuthStore, useAppStore } from '../store';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { login, logout } = useAuthStore();
  const { setCategories, setClassifieds, setUsers, setReviews, setOrders } = useAppStore();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Listen to Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Handle Notifications
        requestNotificationPermission().then(token => {
          if (token) {
            updateDoc(doc(db, 'users', user.uid), { fcm_token: token }).catch(console.error);
          }
        });

        // Fetch custom user doc
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          login({
            id: user.uid,
            email: userData.email,
            display_name: userData.display_name,
            avatar_url: userData.avatar_url,
            sector: userData.sector,
            phone: userData.phone,
            secondary_phone: userData.secondary_phone,
            house_number: userData.house_number,
            role: userData.role,
            created_at: userData.created_at,
          });
        } else {
          // If no doc exists but they logged in, we set them as minimal user 
          // and let the app handle it (usually by redirecting to a setup screen).
          // We can set a temporary token or use AuthStore partial info.
          login({
            id: user.uid,
            email: user.email || '',
            display_name: user.displayName || 'Nuevo Usuario',
            avatar_url: user.photoURL || '',
            sector: '',
            phone: '',
            role: 'buyer', // default
            created_at: new Date().toISOString()
          });
        }
      } else {
        logout();
      }
      setAuthInitialized(true);
    });

    return () => unsubscribeAuth();
  }, [login, logout]);

  // Listeners for public collections
  useEffect(() => {
    const unsubClassifieds = onSnapshot(collection(db, 'classifieds'), (snapshot) => {
      setClassifieds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    return () => {
      unsubClassifieds();
      unsubUsers();
      unsubReviews();
    };
  }, [setCategories, setClassifieds, setUsers, setReviews]);

  // Listeners for protected collections (Orders)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Buyer orders
        const unsubBuyerOrders = onSnapshot(query(collection(db, 'orders'), where('buyer_id', '==', user.uid)), (snapshot) => {
          // Here we can't easily merge two snapshot streams into one Zustand array without a custom function.
          // Let's rely on a smart setOrders action that deduplicates or we can maintain maps.
          useAppStore.getState().mergeOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        });

        // Vendor orders
        const unsubVendorOrders = onSnapshot(query(collection(db, 'orders'), where('vendor_id', '==', user.uid)), (snapshot) => {
          useAppStore.getState().mergeOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        });

        // Save unsubscribe refs
        return () => {
          unsubBuyerOrders();
          unsubVendorOrders();
        };
      } else {
        setOrders([]);
      }
    });

    return () => unsubAuth();
  }, [setOrders]);

  if (!authInitialized) {
    return <div className="h-screen w-screen flex items-center justify-center bg-neutral-50">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return <>{children}</>;
}
