-- Test Duplicate Prevention - Verify the unique constraint is working
-- Run this in your Supabase SQL editor to test the new constraint

-- 1. First, let's verify no duplicates exist in the current data
SELECT 
    whatsapp_country_code,
    whatsapp_number,
    COUNT(*) as count,
    array_agg(full_name) as customer_names
FROM customers 
GROUP BY whatsapp_country_code, whatsapp_number
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Check the constraint was added successfully
SELECT 
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'customers' 
AND constraint_name = 'customers_phone_unique';

-- 3. Test the constraint by trying to insert a duplicate (this should fail)
-- Uncomment the lines below to test the constraint
/*
INSERT INTO customers (full_name, email, whatsapp_country_code, whatsapp_number) 
VALUES ('Test Duplicate', 'test@example.com', '+1 (246)', '284-5321');
*/

-- 4. Test the constraint by trying to update an existing phone number to a duplicate (this should fail)
-- Uncomment the lines below to test the constraint
/*
UPDATE customers 
SET whatsapp_number = '284-5321' 
WHERE full_name = 'Test Duplicate' 
AND whatsapp_country_code = '+1 (246)';
*/

-- 5. Verify the index was created for performance
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'customers' 
AND indexname LIKE '%phone%';

-- 6. Test the check_phone_exists function (if it was created)
-- This should return TRUE for existing numbers and FALSE for new ones
SELECT 
    check_phone_exists('+1 (246)', '284-5321') as existing_number_284_5321,
    check_phone_exists('+1 (246)', '9999999') as new_number_9999999;

-- 7. Summary - All tests should pass if the constraint is working properly
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No duplicates found - Constraint working!'
        ELSE '❌ Duplicates still exist - Constraint not working properly'
    END as duplicate_check_result
FROM (
    SELECT whatsapp_country_code, whatsapp_number, COUNT(*) as count
    FROM customers 
    GROUP BY whatsapp_country_code, whatsapp_number
    HAVING COUNT(*) > 1
) duplicates;
