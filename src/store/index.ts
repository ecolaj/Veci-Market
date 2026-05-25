import { create } from 'zustand';
import { UserProfile, Classified, Order, Category, Review } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateProfile: (data) => set((state) => ({ 
    user: state.user ? { ...state.user, ...data } : null 
  })),
}));

interface AppState {
  categories: Category[];
  classifieds: Classified[];
  orders: Order[];
  users: UserProfile[];
  reviews: Review[];
  
  setCategories: (data: Category[]) => void;
  setClassifieds: (data: Classified[]) => void;
  setUsers: (data: UserProfile[]) => void;
  setReviews: (data: Review[]) => void;
  setOrders: (data: Order[]) => void;
}

const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Comida y Postres', icon_name: 'utensils', color: 'bg-orange-100 text-orange-600 border-orange-200/50' },
  { id: 'c2', name: 'Despensa', icon_name: 'shopping-bag', color: 'bg-emerald-100 text-emerald-600 border-emerald-200/50' },
  { id: 'c3', name: 'Servicios de Hogar', icon_name: 'wrench', color: 'bg-blue-100 text-blue-600 border-blue-200/50' },
  { id: 'c4', name: 'Hogar y Muebles', icon_name: 'home', color: 'bg-amber-100 text-amber-600 border-amber-200/50' },
  { id: 'c5', name: 'Moda y Calzado', icon_name: 'shirt', color: 'bg-pink-100 text-pink-600 border-pink-200/50' },
  { id: 'c6', name: 'Belleza', icon_name: 'sparkles', color: 'bg-rose-100 text-rose-600 border-rose-200/50' },
  { id: 'c7', name: 'Educación', icon_name: 'graduation-cap', color: 'bg-indigo-100 text-indigo-600 border-indigo-200/50' },
  { id: 'c8', name: 'Mascotas', icon_name: 'paw-print', color: 'bg-teal-100 text-teal-600 border-teal-200/50' },
  { id: 'c9', name: 'Tecnología', icon_name: 'smartphone', color: 'bg-cyan-100 text-cyan-600 border-cyan-200/50' },
  { id: 'c10', name: 'Vehículos', icon_name: 'car', color: 'bg-slate-100 text-slate-600 border-slate-200/50' },
  { id: 'c11', name: 'Salud y Bienestar', icon_name: 'heart-pulse', color: 'bg-red-100 text-red-600 border-red-200/50' },
  { id: 'c12', name: 'Varios', icon_name: 'package', color: 'bg-neutral-100 text-neutral-600 border-neutral-200/50' },
];

export const useAppStore = create<AppState>((set, get) => ({
  categories: CATEGORIES,
  classifieds: [],
  orders: [],
  users: [],
  reviews: [],

  setCategories: (categories) => set({ categories }),
  setClassifieds: (classifieds) => set({ classifieds }),
  setUsers: (users) => set({ users }),
  setReviews: (reviews) => set({ reviews }),
  setOrders: (orders) => set({ orders }),
}));
