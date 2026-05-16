/*
  # Farm Connect Database Schema

  ## Overview
  This migration creates the database schema for the Farm Connect application,
  which connects farmers directly with buyers through a product listing and 
  offer negotiation system.

  ## New Tables
  
  ### 1. `profiles`
  Extends auth.users with user profile information
  - `id` (uuid, primary key) - References auth.users(id)
  - `email` (text) - User's email address
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'farmer' or 'buyer'
  - `phone` (text) - Contact phone number
  - `address` (text) - Physical address
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `products`
  Stores product listings created by farmers
  - `id` (uuid, primary key) - Unique product identifier
  - `farmer_id` (uuid) - References profiles(id) of the farmer
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `quantity` (numeric) - Available quantity
  - `unit` (text) - Unit of measurement (kg, quintal, ton, etc.)
  - `base_price` (numeric) - Listed base price per unit
  - `minimum_price` (numeric) - Minimum acceptable price per unit
  - `status` (text) - Product status: 'available', 'sold', 'unavailable'
  - `created_at` (timestamptz) - Product creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `offers`
  Stores offer negotiations between buyers and farmers
  - `id` (uuid, primary key) - Unique offer identifier
  - `product_id` (uuid) - References products(id)
  - `buyer_id` (uuid) - References profiles(id) of the buyer
  - `farmer_id` (uuid) - References profiles(id) of the farmer
  - `offer_price` (numeric) - Current offer price per unit
  - `quantity` (numeric) - Offered quantity
  - `status` (text) - Offer status: 'pending', 'accepted', 'rejected', 'countered'
  - `counter_price` (numeric) - Counter-offer price from farmer
  - `message` (text) - Optional message with the offer
  - `response_message` (text) - Optional response message from farmer
  - `created_at` (timestamptz) - Offer creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled to ensure data security:
  
  #### profiles table:
  1. Users can view all profiles (for farmer/buyer discovery)
  2. Users can insert their own profile during signup
  3. Users can update only their own profile
  4. Users can delete their own profile
  
  #### products table:
  1. Anyone can view available products
  2. Only farmers can insert products
  3. Farmers can update only their own products
  4. Farmers can delete only their own products
  
  #### offers table:
  1. Buyers and farmers can view their own offers
  2. Only buyers can create new offers
  3. Only farmers can update offers on their products
  4. Buyers can update their own pending offers
  5. Users can delete their own offers

  ## Notes
  - All monetary values use numeric type for precision
  - Timestamps use timestamptz for timezone support
  - Foreign key constraints ensure referential integrity
  - Default values are set for timestamps and status fields
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('farmer', 'buyer')),
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  quantity numeric NOT NULL CHECK (quantity >= 0),
  unit text NOT NULL DEFAULT 'kg',
  base_price numeric NOT NULL CHECK (base_price >= 0),
  minimum_price numeric NOT NULL CHECK (minimum_price >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'unavailable')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offer_price numeric NOT NULL CHECK (offer_price >= 0),
  quantity numeric NOT NULL CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  counter_price numeric CHECK (counter_price >= 0),
  message text,
  response_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Farmers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'farmer'
      AND profiles.id = farmer_id
    )
  );

CREATE POLICY "Farmers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (farmer_id = auth.uid());

-- Offers policies
CREATE POLICY "Users can view their own offers"
  ON offers FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid());

CREATE POLICY "Buyers can create offers"
  ON offers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'buyer'
      AND profiles.id = buyer_id
    )
  );

CREATE POLICY "Farmers can update offers on their products"
  ON offers FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Buyers can update their pending offers"
  ON offers FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid() AND status = 'pending')
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can delete own offers"
  ON offers FOR DELETE
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_farmer_id ON offers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();