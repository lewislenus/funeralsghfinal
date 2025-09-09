-- Check the actual data types of columns in the database
-- This will help us identify if there's a type mismatch

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('funerals', 'condolences', 'donations', 'profiles')
AND column_name LIKE '%id%'
ORDER BY table_name, ordinal_position;

-- Also check if there are any constraints that might be causing issues
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('funerals', 'condolences', 'donations', 'profiles')
AND kcu.column_name LIKE '%id%'
ORDER BY tc.table_name, tc.constraint_type;
