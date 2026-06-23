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
        if ('Notification' in window && Notification.permission === 'granted') {
          requestNotificationPermission(user.uid);
        }

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
              role: 'buyer', // default
              saved_ads: [],
              created_at: new Date().toISOString()
            });
          }
        }, (error) => {
          console.error("Error subscribing to user doc:", error);
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
    }, (error) => {
      console.error("Error subscribing to classifieds collection:", error);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (error) => {
      console.error("Error subscribing to users collection:", error);
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (error) => {
      console.error("Error subscribing to reviews collection:", error);
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

            // We can now safely overwrite all orders without worrying about merging!
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
          },
          (error) => {
            console.error("Error subscribing to orders collection:", error);
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
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-50 space-y-6">
        <div className="relative animate-bounce">
          <svg 
            viewBox="0 0 100 100" 
            className="w-20 h-20 drop-shadow-xl"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Speed lines */}
            <path d="M 20 40 L 35 40" stroke="#373567" strokeWidth="6" strokeLinecap="round" />
            <path d="M 12 50 L 30 50" stroke="#373567" strokeWidth="6" strokeLinecap="round" />
            <path d="M 20 60 L 35 60" stroke="#373567" strokeWidth="6" strokeLinecap="round" />
            
            {/* Handle */}
            <circle cx="28" cy="28" r="5" fill="#E8483B" />
            <path d="M 28 28 L 30 30" stroke="#373567" strokeWidth="6" strokeLinecap="round" />
            
            {/* Cart frame */}
            <path d="M 30 30 L 85 30 L 78 65 L 38 65 L 30 30 Z" stroke="#373567" strokeWidth="6" strokeLinejoin="round" fill="white" />
            
            {/* Cart inner lines (grid) */}
            <path d="M 45 30 L 43 65" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
            <path d="M 60 30 L 58 65" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
            <path d="M 75 30 L 73 65" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
            
            <path d="M 35 42 L 82 42" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
            <path d="M 37 54 L 80 54" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
            
            {/* Wheels */}
            <circle cx="45" cy="78" r="6" stroke="#373567" strokeWidth="4" fill="#6985C1" />
            <circle cx="70" cy="78" r="6" stroke="#373567" strokeWidth="4" fill="#6985C1" />
            
            {/* Cart base frame to wheel */}
            <path d="M 38 65 L 75 65" stroke="#373567" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-black text-neutral-800 tracking-tight">Cargando <span className="animate-pulse">. . .</span></span>
          <span className="text-sm font-medium text-neutral-500 mt-2">Preparando VeciMarket para ti</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
