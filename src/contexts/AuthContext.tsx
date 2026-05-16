import { createContext, useContext, ReactNode } from 'react';
import { Profile } from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'farmer' | 'buyer', phone?: string, address?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static mock profile
const MOCK_PROFILE: Profile = {
  id: '1',
  email: 'demo@example.com',
  full_name: 'Demo Farmer',
  role: 'farmer',
  phone: '123-456-7890',
  address: 'Green Farm, Punjab',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    user: { id: '1', email: 'demo@example.com' },
    profile: MOCK_PROFILE,
    loading: false,
    signUp: async () => {},
    signIn: async () => {},
    signOut: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
