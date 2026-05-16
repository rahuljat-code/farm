import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'farmer' | 'buyer';
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  farmer_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  base_price: number;
  minimum_price: number;
  status: 'available' | 'sold' | 'unavailable';
  created_at: string;
  updated_at: string;
};

export type Offer = {
  id: string;
  product_id: string;
  buyer_id: string;
  farmer_id: string;
  offer_price: number;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counter_price?: number;
  message?: string;
  response_message?: string;
  created_at: string;
  updated_at: string;
};
