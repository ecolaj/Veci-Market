import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Classified, Order, Review, UserProfile } from '../types';

export const services = {
  async addClassified(data: Omit<Classified, 'id' | 'created_at'>) {
    try {
      await addDoc(collection(db, 'classifieds'), {
        ...data,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'classifieds');
    }
  },

  async updateClassified(id: string, data: Partial<Classified>) {
    try {
      await updateDoc(doc(db, 'classifieds', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `classifieds/${id}`);
    }
  },

  async deleteClassified(id: string) {
    try {
      await deleteDoc(doc(db, 'classifieds', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `classifieds/${id}`);
    }
  },

  async placeOrder(data: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    try {
      await addDoc(collection(db, 'orders'), {
        ...data,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Call Express API to trigger native push notification
      try {
        const { getDoc } = await import('firebase/firestore');
        const vendorDoc = await getDoc(doc(db, 'users', data.vendor_id));
        const tokens = vendorDoc.exists() ? (vendorDoc.data()?.fcm_tokens || []) : [];
        
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorId: data.vendor_id,
            tokens,
            title: `Nuevo pedido de ${data.delivery_address || 'un cliente'}`,
            body: 'Tienes 1 nuevo pedido pendiente. Toca para ver los detalles.',
            data: { url: '/dashboard/orders' }
          })
        });
      } catch (notifyErr) {
        console.error("Error triggering push notification:", notifyErr);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'orders');
    }
  },

  async updateOrderStatus(id: string, status: Order['status'], cancel_reason?: string) {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (cancel_reason !== undefined) updateData.cancel_reason = cancel_reason;
      await updateDoc(doc(db, 'orders', id), updateData);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${id}`);
    }
  },

  async addReview(data: Omit<Review, 'id' | 'created_at'>) {
    try {
      await addDoc(collection(db, 'reviews'), {
        ...data,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'reviews');
    }
  },

  async addReport(data: { classified_id: string, reporter_id: string, reason: string }) {
    try {
      await addDoc(collection(db, 'reports'), {
        ...data,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'reports');
    }
  },

  async updateProfile(id: string, data: Partial<UserProfile>) {
    try {
      await updateDoc(doc(db, 'users', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${id}`);
    }
  },

  async signOut() {
    const { auth } = await import('./firebase');
    const { signOut } = await import('firebase/auth');
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out', e);
    }
  },

  async toggleFavorite(userId: string, classifiedId: string, isFavorited: boolean) {
    try {
      const { useAuthStore } = await import('../store');
      const currentUser = useAuthStore.getState().user;
      
      // Optimistic update locally
      if (currentUser) {
        const currentAds = currentUser.saved_ads || [];
        const newAds = isFavorited 
          ? currentAds.filter(id => id !== classifiedId)
          : [...currentAds, classifiedId];
          
        useAuthStore.getState().updateProfile({ saved_ads: newAds });
      }

      const { arrayUnion, arrayRemove } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', userId), {
        saved_ads: isFavorited ? arrayRemove(classifiedId) : arrayUnion(classifiedId)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
      // Since we don't have a reliable previous state, we rely on the next snapshot to fix UI if it fails
    }
  }
};
