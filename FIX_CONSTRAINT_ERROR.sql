-- Fix for existing constraint error
-- Run this if you get "relation unique_customer_wheel_spin already exists"

-- Drop the existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_customer_wheel_spin'
        AND table_name = 'customer_wheel_spins'
    ) THEN
        ALTER TABLE customer_wheel_spins DROP CONSTRAINT unique_customer_wheel_spin;
        RAISE NOTICE 'Dropped existing constraint unique_customer_wheel_spin';
    ELSE
        RAISE NOTICE 'Constraint unique_customer_wheel_spin does not exist';
    END IF;
END $$;

-- Now add the constraint back
ALTER TABLE customer_wheel_spins 
ADD CONSTRAINT unique_customer_wheel_spin 
UNIQUE (customer_id);

-- Verify the constraint was added
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_name = 'unique_customer_wheel_spin';
