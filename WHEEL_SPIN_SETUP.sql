-- Wheel Spin and Prizes Database Setup for PLAY Barbados
-- Run this in your Supabase SQL editor

-- Create customer_wheel_spins table to track if customer spun the wheel
CREATE TABLE IF NOT EXISTS customer_wheel_spins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  has_spun_wheel BOOLEAN DEFAULT false,
  spun_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_prizes table to track what prizes customers won
CREATE TABLE IF NOT EXISTS customer_prizes (
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
CREATE INDEX IF NOT EXISTS idx_customer_wheel_spins_customer_id 
ON customer_wheel_spins(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_prizes_customer_id 
ON customer_prizes(customer_id);

-- Insert sample wheel spin data for existing customers
DO $$
BEGIN
    -- Only insert if the table is empty
    IF NOT EXISTS (SELECT 1 FROM customer_wheel_spins LIMIT 1) THEN
        INSERT INTO customer_wheel_spins (customer_id, has_spun_wheel, spun_at) VALUES
        ((SELECT id FROM customers WHERE full_name = 'John Doe'), true, NOW() - INTERVAL '2 days'),
        ((SELECT id FROM customers WHERE full_name = 'Jane Smith'), true, NOW() - INTERVAL '1 day'),
        ((SELECT id FROM customers WHERE full_name = 'Bob Johnson'), false, NULL),
        ((SELECT id FROM customers WHERE full_name = 'Alice Brown'), true, NOW() - INTERVAL '3 days'),
        ((SELECT id FROM customers WHERE full_name = 'Charlie Wilson'), false, NULL);
    END IF;
END $$;

-- Insert sample prizes for customers who spun the wheel
DO $$
BEGIN
    -- Only insert if the table is empty
    IF NOT EXISTS (SELECT 1 FROM customer_prizes LIMIT 1) THEN
        INSERT INTO customer_prizes (customer_id, prize_type, prize_value) VALUES
        ((SELECT id FROM customers WHERE full_name = 'John Doe'), 'voucher', '$10 voucher'),
        ((SELECT id FROM customers WHERE full_name = 'Jane Smith'), 'discount', '10% off'),
        ((SELECT id FROM customers WHERE full_name = 'Alice Brown'), 'voucher', '$5 voucher');
    END IF;
END $$;

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

-- Function to add/update customer prize
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
  -- Check if prize already exists for this customer and type
  IF EXISTS (SELECT 1 FROM customer_prizes WHERE customer_id = p_customer_id AND prize_type = p_prize_type) THEN
    -- Update existing prize
    UPDATE customer_prizes 
    SET prize_value = p_prize_value, updated_at = NOW()
    WHERE customer_id = p_customer_id AND prize_type = p_prize_type;
  ELSE
    -- Insert new prize
    INSERT INTO customer_prizes (customer_id, prize_type, prize_value)
    VALUES (p_customer_id, p_prize_type, p_prize_value);
  END IF;
  
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
GRANT SELECT, INSERT, UPDATE ON customer_wheel_spins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON customer_prizes TO authenticated;
