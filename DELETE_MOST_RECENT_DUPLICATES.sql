-- Delete Most Recent Duplicates - Keep Oldest Entries
-- This script will remove the most recently created duplicate phone numbers
-- Run this in your Supabase SQL editor

-- 1. First, let's see what we're about to delete
WITH duplicates_to_remove AS (
    SELECT 
        id,
        full_name,
        whatsapp_country_code,
        whatsapp_number,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY whatsapp_country_code, whatsapp_number 
            ORDER BY created_at DESC
        ) as rn
    FROM customers
    WHERE (whatsapp_country_code, whatsapp_number) IN (
        ('+1 (246)', '284-5321'),
        ('+1 (246)', '244-9663'),
        ('+1 (246)', '233-2632')
    )
)
SELECT 
    id,
    full_name,
    whatsapp_country_code,
    whatsapp_number,
    created_at,
    CASE WHEN rn = 1 THEN 'WILL DELETE - Most Recent' ELSE 'WILL KEEP - Oldest' END as action
FROM duplicates_to_remove
ORDER BY whatsapp_country_code, whatsapp_number, created_at DESC;

-- 2. Now delete the most recent duplicates (keeping the oldest entries)
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
        WHERE (whatsapp_country_code, whatsapp_number) IN (
            ('+1 (246)', '284-5321'),
            ('+1 (246)', '244-9663'),
            ('+1 (246)', '233-2632')
        )
    ) ranked
    WHERE rn = 1  -- This will delete the most recent (rn = 1)
)
DELETE FROM customers WHERE id IN (SELECT id FROM duplicates_to_remove);

-- 3. Verify the duplicates are resolved
SELECT 
    whatsapp_country_code,
    whatsapp_number,
    COUNT(*) as count
FROM customers 
WHERE (whatsapp_country_code, whatsapp_number) IN (
    ('+1 (246)', '284-5321'),
    ('+1 (246)', '244-9663'),
    ('+1 (246)', '233-2632')
)
GROUP BY whatsapp_country_code, whatsapp_number
ORDER BY whatsapp_country_code, whatsapp_number;

-- 4. Check if there are any other duplicates in the system
SELECT 
    whatsapp_country_code,
    whatsapp_number,
    COUNT(*) as duplicate_count
FROM customers 
GROUP BY whatsapp_country_code, whatsapp_number
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 5. After running this successfully, you can now run ADD_MOBILE_AND_PHONE_CONSTRAINT.sql
