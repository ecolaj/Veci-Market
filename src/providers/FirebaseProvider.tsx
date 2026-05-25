import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, where, updateDoc, or } from 'firebase/firestore';
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
        const unsubUserDoc = onSnapshot(doc(db, 'users', user.uid), async (userDoc) => {
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
              saved_ads: userData.saved_ads || [],
              created_at: userData.created_at,
            });
          } else {
            // If no doc exists but they logged in, we set them as minimal user 
            // and let the app handle it (usually by redirecting to a setup screen).
            login({
              id: user.uid,
              email: user.email || '',
              display_name: user.displayName || 'Nuevo Usuario',
              avatar_url: user.photoURL || '',
              sector: '',
              phone: '',
              role: 'user', // default
              saved_ads: [],
              created_at: new Date().toISOString()
            });
          }
        });
        
        // Let's store the unsubscribe to call it when auth state changes or unmounts,
        // Actually, we can attach the unsubUserDoc to a variable and clean it up inside the else/cleanup
        (window as any)._unsubUserDoc = unsubUserDoc;
      } else {
        if ((window as any)._unsubUserDoc) {
          (window as any)._unsubUserDoc();
          (window as any)._unsubUserDoc = null;
        }
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
        const unsubOrders = onSnapshot(
          query(collection(db, 'orders'), or(where('buyer_id', '==', user.uid), where('vendor_id', '==', user.uid))),
          (snapshot) => {
            let hasNewOrders = false;
            let newOrderTitle = "";
            let newOrderBody = "";
            
            snapshot.docChanges().forEach((change) => {
               if (change.type === 'added') {
                  const data = change.doc.data();
                  // Only vendors get notifications for pending orders
                  if (data.status === 'pending' && data.vendor_id === user.uid) {
                     const created = new Date(data.created_at).getTime();
                     const now = new Date().getTime();
                     if (now - created < 15000) { 
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

            // We can now safely overwrite all orders without worrying about merging!
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
          }
        );

        // Save unsubscribe refs
        return () => {
          unsubOrders();
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
