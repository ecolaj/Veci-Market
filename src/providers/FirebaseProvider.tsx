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
        requestNotificationPermission(user.uid);

        // Fetch custom user doc
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.status === 'banned') {
            alert('Tu cuenta ha sido suspendida. Comunícate con soporte.');
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
            return;
          }
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
            status: userData.status,
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
          let hasNewOrders = false;
          let newOrderTitle = "";
          let newOrderBody = "";
          
          snapshot.docChanges().forEach((change) => {
             // Only alert on newly added documents that represent pending orders
             // We need to avoid alerting on the initial fetch.
             // Usually onSnapshot fires 'added' for all initial docs.
             // We can check if the doc was created in the last 10 seconds to guess it's truly new in this session
             if (change.type === 'added') {
                const data = change.doc.data();
                if (data.status === 'pending') {
                   const created = new Date(data.created_at).getTime();
                   const now = new Date().getTime();
                   if (now - created < 15000) { // within 15 seconds
                     hasNewOrders = true;
                     newOrderTitle = `Nuevo pedido de ${data.delivery_address || 'un cliente'}`;
                     newOrderBody = `Tienes 1 nuevo pedido pendiente.`;
                   }
                }
             }
          });

          if (hasNewOrders && 'Notification' in window && Notification.permission === 'granted') {
             try {
                if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                   navigator.serviceWorker.ready.then(registration => {
                      registration.showNotification(newOrderTitle, {
                         body: newOrderBody,
                         icon: '/icon.svg',
                         tag: 'new-order'
                      } as any);
                   });
                } else {
                   new Notification(newOrderTitle, {
                      body: newOrderBody,
                      icon: '/icon.svg'
                   });
                }
             } catch(e) {
                 console.log("Notification error", e);
             }
          }

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
