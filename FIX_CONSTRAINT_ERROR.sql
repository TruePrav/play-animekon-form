-- Fix Duplicate Phone Numbers Before Adding Unique Constraint
-- Run this in your Supabase SQL editor BEFORE running ADD_MOBILE_AND_PHONE_CONSTRAINT.sql

-- 1. First, let's identify all duplicate phone number combinations
SELECT 
    whatsapp_country_code,
    whatsapp_number,
    COUNT(*) as duplicate_count,
    array_agg(id) as customer_ids,
    array_agg(full_name) as customer_names
FROM customers 
GROUP BY whatsapp_country_code, whatsapp_number
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Show detailed information about customers with duplicate phone numbers
WITH duplicates AS (
    SELECT 
        whatsapp_country_code,
        whatsapp_number,
        COUNT(*) as duplicate_count
    FROM customers 
    GROUP BY whatsapp_country_code, whatsapp_number
    HAVING COUNT(*) > 1
)
SELECT 
    c.id,
    c.full_name,
    c.email,
    c.whatsapp_country_code,
    c.whatsapp_number,
    c.created_at
FROM customers c
INNER JOIN duplicates d 
    ON c.whatsapp_country_code = d.whatsapp_country_code 
    AND c.whatsapp_number = d.whatsapp_number
ORDER BY c.whatsapp_country_code, c.whatsapp_number, c.created_at;

-- 3. OPTION 1: Keep the most recent entry and delete older duplicates
-- Uncomment and modify this section if you want to automatically remove duplicates
/*
WITH duplicates_to_remove AS (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY whatsapp_country_code, whatsapp_number 
                ORDER BY created_at DESC
            ) as rn
        FROM customers
    ) ranked
    WHERE rn > 1
)
DELETE FROM customers WHERE id IN (SELECT id FROM duplicates_to_remove);
*/

-- 4. OPTION 2: Manual cleanup - Update duplicate phone numbers to make them unique
-- Uncomment and modify these lines for specific duplicates you want to fix
/*
-- Example: Update a specific duplicate phone number
-- UPDATE customers 
-- SET whatsapp_number = whatsapp_number || '-duplicate-' || id::text
-- WHERE id = 'specific-uuid-here';

-- Example: Update all duplicates to add a suffix
-- UPDATE customers 
-- SET whatsapp_number = whatsapp_number || '-duplicate-' || id::text
-- WHERE id IN (
--     SELECT c.id
--     FROM customers c
--     INNER JOIN (
--         SELECT whatsapp_country_code, whatsapp_number
--         FROM customers 
--         GROUP BY whatsapp_country_code, whatsapp_number
--         HAVING COUNT(*) > 1
--     ) d ON c.whatsapp_country_code = d.whatsapp_country_code 
--         AND c.whatsapp_number = d.whatsapp_number
-- );
*/

-- 5. Verify no duplicates remain (should return 0 rows)
SELECT 
    whatsapp_country_code,
    whatsapp_number,
    COUNT(*) as duplicate_count
FROM customers 
GROUP BY whatsapp_country_code, whatsapp_number
HAVING COUNT(*) > 1;

-- 6. After running the fixes above, you can now run ADD_MOBILE_AND_PHONE_CONSTRAINT.sql
-- The unique constraint should be added successfully
