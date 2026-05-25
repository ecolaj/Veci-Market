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
  { id: 'c1', name: 'Alimentos', icon_name: 'utensils', color: 'bg-orange-100 text-orange-600' },
  { id: 'c2', name: 'Productos', icon_name: 'shopping-bag', color: 'bg-blue-100 text-blue-600' },
  { id: 'c3', name: 'Servicios', icon_name: 'wrench', color: 'bg-purple-100 text-purple-600' },
  { id: 'c4', name: 'Ropa', icon_name: 'shirt', color: 'bg-pink-100 text-pink-600' },
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
