-- Safe Delete Most Recent Duplicates - Handle Foreign Key Constraints
-- This script will safely remove duplicates while handling related records
-- Run this in your Supabase SQL editor

-- 1. First, let's see what we're about to delete and what related records exist
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
    c.id,
    c.full_name,
    c.whatsapp_country_code,
    c.whatsapp_number,
    c.created_at,
    CASE WHEN d.rn = 1 THEN 'WILL DELETE - Most Recent' ELSE 'WILL KEEP - Oldest' END as action,
    COALESCE(cc_count.count, 0) as shopping_categories_count,
    COALESCE(consoles_count.count, 0) as consoles_count,
    COALESCE(prizes_count.count, 0) as prizes_count,
    COALESCE(wheel_spins_count.count, 0) as wheel_spins_count
FROM duplicates_to_remove d
JOIN customers c ON d.id = c.id
LEFT JOIN (
    SELECT customer_id, COUNT(*) as count 
    FROM customer_shopping_categories 
    GROUP BY customer_id
) cc_count ON c.id = cc_count.customer_id
LEFT JOIN (
    SELECT customer_id, COUNT(*) as count 
    FROM customer_consoles 
    GROUP BY customer_id
) consoles_count ON c.id = consoles_count.customer_id
LEFT JOIN (
    SELECT customer_id, COUNT(*) as count 
    FROM customer_prizes 
    GROUP BY customer_id
) prizes_count ON c.id = prizes_count.customer_id
LEFT JOIN (
    SELECT customer_id, COUNT(*) as count 
    FROM customer_wheel_spins 
    GROUP BY customer_id
) wheel_spins_count ON c.id = wheel_spins_count.customer_id
ORDER BY d.whatsapp_country_code, d.whatsapp_number, d.created_at DESC;

-- 2. Delete related records first, then delete customers
-- This will remove all related data for the duplicates we want to delete
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
DELETE FROM customer_shopping_categories 
WHERE customer_id IN (SELECT id FROM duplicates_to_remove);

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
    WHERE rn = 1
)
DELETE FROM customer_consoles 
WHERE customer_id IN (SELECT id FROM duplicates_to_remove);

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
    WHERE rn = 1
)
DELETE FROM customer_prizes 
WHERE customer_id IN (SELECT id FROM duplicates_to_remove);

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
    WHERE rn = 1
)
DELETE FROM customer_wheel_spins 
WHERE customer_id IN (SELECT id FROM duplicates_to_remove);

-- 3. Now delete the customers (safe since no foreign key references exist)
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
    WHERE rn = 1
)
DELETE FROM customers WHERE id IN (SELECT id FROM duplicates_to_remove);

-- 4. Verify the duplicates are resolved
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

-- 5. Check if there are any other duplicates in the system
SELECT 
    whatsapp_country_code,
    whatsapp_number,
    COUNT(*) as duplicate_count
FROM customers 
GROUP BY whatsapp_country_code, whatsapp_number
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 6. After running this successfully, you can now run ADD_MOBILE_AND_PHONE_CONSTRAINT.sql
