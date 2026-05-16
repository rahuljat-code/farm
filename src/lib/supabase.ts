// Static mock data and types
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

const MOCK_BUYER: Profile = {
  id: '2',
  email: 'buyer@example.com',
  full_name: 'Demo Buyer',
  role: 'buyer',
  phone: '987-654-3210',
  address: 'City Market, Delhi',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock data
export const MOCK_PRODUCTS: any[] = [
  {
    id: '1',
    farmer_id: '1',
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes from the valley.',
    quantity: 100,
    unit: 'kg',
    base_price: 50,
    minimum_price: 40,
    status: 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    farmer: MOCK_PROFILE
  },
  {
    id: '2',
    farmer_id: '1',
    name: 'Sweet Potatoes',
    description: 'Naturally grown sweet potatoes.',
    quantity: 200,
    unit: 'kg',
    base_price: 30,
    minimum_price: 25,
    status: 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    farmer: MOCK_PROFILE
  }
];

export const MOCK_OFFERS: any[] = [
  {
    id: '1',
    product_id: '1',
    buyer_id: '2',
    farmer_id: '1',
    offer_price: 45,
    quantity: 50,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product: MOCK_PRODUCTS[0],
    buyer: MOCK_BUYER
  }
];

// Helper to create a promise-like chain
const createMockChain = (data: any) => {
  const chain = {
    eq: () => createMockChain(data),
    order: () => createMockChain(data),
    single: () => createMockChain(data[0] || null),
    maybeSingle: () => createMockChain(data[0] || null),
    select: () => createMockChain(data),
    update: () => createMockChain(data),
    insert: () => createMockChain(data),
    delete: () => createMockChain(data),
    // Make it thenable so 'await' works
    then: (resolve: any) => resolve({ data, error: null }),
    catch: (reject: any) => reject({ data: null, error: 'Mock error' }),
  };
  return chain as any;
};

export const supabase = {
  from: (table: string) => {
    let data = table === 'products' ? MOCK_PRODUCTS : MOCK_OFFERS;
    if (table === 'profiles') data = [MOCK_PROFILE];
    return createMockChain(data);
  },
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: { user: { id: '1' } }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: '1' } }, error: null }),
    signOut: async () => ({ error: null }),
  }
} as any;
