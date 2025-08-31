-- Quick Fix for Specific Duplicate Phone Number
-- This fixes the exact duplicate mentioned in your error: (+1 (246), 244-9663)

-- 1. First, let's see the customers with this duplicate phone number
SELECT 
    id,
    full_name,
    email,
    whatsapp_country_code,
    whatsapp_number,
    created_at
FROM customers 
WHERE whatsapp_country_code = '+1 (246)' 
AND whatsapp_number = '244-9663'
ORDER BY created_at;

-- 2. Keep the most recent entry and delete the older duplicate(s)
-- This will keep the customer who registered most recently
WITH duplicates_to_remove AS (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM customers
        WHERE whatsapp_country_code = '+1 (246)' 
        AND whatsapp_number = '244-9663'
    ) ranked
    WHERE rn > 1
)
DELETE FROM customers WHERE id IN (SELECT id FROM duplicates_to_remove);

-- 3. Verify the duplicate is resolved
SELECT 
    whatsapp_country_code,
    whatsapp_number,
    COUNT(*) as count
FROM customers 
WHERE whatsapp_country_code = '+1 (246)' 
AND whatsapp_number = '244-9663'
GROUP BY whatsapp_country_code, whatsapp_number;

-- 4. Now you can run ADD_MOBILE_AND_PHONE_CONSTRAINT.sql successfully
