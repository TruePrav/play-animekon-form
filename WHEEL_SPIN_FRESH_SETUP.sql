-- Fresh Wheel Spin and Prizes Database Setup for PLAY Barbados
-- This script drops everything and recreates it fresh
-- Run this in your Supabase SQL editor

-- Drop existing functions first
DROP FUNCTION IF EXISTS update_wheel_spin_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS update_customer_prize(UUID, TEXT, TEXT);

-- Drop existing tables (this will also drop any constraints)
DROP TABLE IF EXISTS customer_prizes CASCADE;
DROP TABLE IF EXISTS customer_wheel_spins CASCADE;

-- Create customer_wheel_spins table to track if customer spun the wheel
CREATE TABLE customer_wheel_spins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  has_spun_wheel BOOLEAN DEFAULT false,
  spun_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_prizes table to track what prizes customers won
CREATE TABLE customer_prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  prize_type TEXT NOT NULL,
  prize_value TEXT NOT NULL,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one wheel spin record per customer
ALTER TABLE customer_wheel_spins 
ADD CONSTRAINT unique_customer_wheel_spin 
UNIQUE (customer_id);

-- Create indexes for better performance
CREATE INDEX idx_customer_wheel_spins_customer_id 
ON customer_wheel_spins(customer_id);

CREATE INDEX idx_customer_prizes_customer_id 
ON customer_prizes(customer_id);

-- Function to update wheel spin status
CREATE OR REPLACE FUNCTION update_wheel_spin_status(
  p_customer_id UUID,
  p_has_spun_wheel BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO customer_wheel_spins (customer_id, has_spun_wheel, spun_at, updated_at)
  VALUES (p_customer_id, p_has_spun_wheel, 
          CASE WHEN p_has_spun_wheel THEN NOW() ELSE NULL END, NOW())
  ON CONFLICT (customer_id) 
  DO UPDATE SET 
    has_spun_wheel = p_has_spun_wheel,
    spun_at = CASE WHEN p_has_spun_wheel THEN NOW() ELSE NULL END,
    updated_at = NOW();
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Function to add/update customer prize - UPDATED for multiple prizes
CREATE OR REPLACE FUNCTION update_customer_prize(
  p_customer_id UUID,
  p_prize_type TEXT,
  p_prize_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Always insert new prize - allow multiple prizes per customer
  INSERT INTO customer_prizes (customer_id, prize_type, prize_value)
  VALUES (p_customer_id, p_prize_type, p_prize_value);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_wheel_spin_status(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_customer_prize(UUID, TEXT, TEXT) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_wheel_spins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_prizes TO authenticated;

-- Insert sample wheel spin data for existing customers (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM customer_wheel_spins LIMIT 1) THEN
    INSERT INTO customer_wheel_spins (customer_id, has_spun_wheel, spun_at) VALUES
    ((SELECT id FROM customers WHERE full_name = 'John Doe'), true, NOW() - INTERVAL '2 days'),
    ((SELECT id FROM customers WHERE full_name = 'Jane Smith'), true, NOW() - INTERVAL '1 day'),
    ((SELECT id FROM customers WHERE full_name = 'Bob Johnson'), false, NULL),
    ((SELECT id FROM customers WHERE full_name = 'Alice Brown'), true, NOW() - INTERVAL '3 days'),
    ((SELECT id FROM customers WHERE full_name = 'Charlie Wilson'), false, NULL);
    
    RAISE NOTICE 'Inserted sample wheel spin data';
  ELSE
    RAISE NOTICE 'Wheel spins table already has data, skipping sample insertion';
  END IF;
END $$;

-- Insert sample prizes for customers who spun the wheel (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM customer_prizes LIMIT 1) THEN
    INSERT INTO customer_prizes (customer_id, prize_type, prize_value) VALUES
    ((SELECT id FROM customers WHERE full_name = 'John Doe'), 'voucher', '$10 voucher'),
    ((SELECT id FROM customers WHERE full_name = 'Jane Smith'), 'discount', '10% off'),
    ((SELECT id FROM customers WHERE full_name = 'Alice Brown'), 'voucher', '$5 voucher');
    
    RAISE NOTICE 'Inserted sample prize data';
  ELSE
    RAISE NOTICE 'Prizes table already has data, skipping sample insertion';
  END IF;
END $$;

-- Verify the setup
SELECT 
  'Tables created successfully' as status,
  (SELECT COUNT(*) FROM customer_wheel_spins) as wheel_spins_count,
  (SELECT COUNT(*) FROM customer_prizes) as prizes_count;

-- Show the functions that were created
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('update_wheel_spin_status', 'update_customer_prize')
AND routine_schema = 'public';
