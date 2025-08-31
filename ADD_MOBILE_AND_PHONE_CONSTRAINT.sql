-- Add Mobile Console Option and Phone Number Uniqueness Constraint
-- Run this in your Supabase SQL editor

-- 1. Add unique constraint to prevent duplicate phone numbers
-- This ensures the same user can't sign up with the same phone number again
ALTER TABLE customers 
ADD CONSTRAINT customers_phone_unique 
UNIQUE (whatsapp_country_code, whatsapp_number);

-- 2. Create an index for better performance on phone number lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone_lookup 
ON customers(whatsapp_country_code, whatsapp_number);

-- 3. Add a comment to document the constraint
COMMENT ON CONSTRAINT customers_phone_unique ON customers IS 
'Prevents duplicate registrations with the same phone number and country code combination';

-- 4. Optional: Add a function to check if a phone number already exists
CREATE OR REPLACE FUNCTION check_phone_exists(
  p_country_code TEXT,
  p_phone_number TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM customers 
    WHERE whatsapp_country_code = p_country_code 
    AND whatsapp_number = p_phone_number
  );
END;
$$;

-- 5. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_phone_exists(TEXT, TEXT) TO authenticated;

-- 6. Add comment to the function
COMMENT ON FUNCTION check_phone_exists(TEXT, TEXT) IS 
'Check if a phone number already exists in the system';

-- 7. Test the constraint (optional - remove after testing)
-- This will fail if you have duplicate phone numbers in your existing data
-- SELECT 'Phone number constraint added successfully' as status;

