export type UserRole = 'buyer' | 'vendor';

export interface UserProfile {
  id: string; // matches Supabase auth.users id
  email: string;
  display_name: string;
  avatar_url?: string;
  sector: string;
  house_number?: string;
  phone: string;
  secondary_phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon_name: string;
  color: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

export interface Classified {
  id: string;
  vendor_id: string; // UserProfile id
  category_id: string;
  title: string;
  description: string;
  price: number;
  payment_methods?: PaymentMethod[];
  image_url?: string;
  images?: string[];
  created_at: string;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  classified_id: string;
  buyer_id: string;
  vendor_id: string;
  status: 'pending' | 'accepted' | 'delivered' | 'cancelled';
  cancel_reason?: string;
  created_at: string;
  updated_at: string;
  delivery_address: string;
}

export interface Review {
  id: string;
  classified_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Stat {
  topClients: { id: string; name: string; count: number }[];
  mostSoldProduct: { id: string; title: string; count: number };
  totalSales: number;
}
