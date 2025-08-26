# Database Setup for PLAY Barbados Form

## 📋 Required Database Tables

You need to create these tables in your Supabase database:

### 1. `customers` Table
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  whatsapp_country_code TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  custom_country_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `customer_consoles` Table
```sql
CREATE TABLE customer_consoles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  console_type TEXT NOT NULL,
  is_retro BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. `customer_shopping_categories` Table
```sql
CREATE TABLE customer_shopping_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Function Details

### `create_player_profile`

**Returns:** UUID (the new customer ID)

**Parameters:**
- `p_full_name`: Customer's full name
- `p_email`: Customer's email address
- `p_whatsapp_country_code`: WhatsApp country code
- `p_whatsapp_number`: WhatsApp phone number
- `p_custom_country_code`: Custom country code (if "other" selected)
- `p_terms_accepted`: Terms acceptance status
- `p_terms_accepted_at`: When terms were accepted
- `p_shop_categories`: Array of shopping categories (only 'video_games')
- `p_consoles`: Array of console types
- `p_retro_consoles`: Array of retro console types

### `create_player_profile_simple`

**Returns:** BOOLEAN (success/failure)

A wrapper function that calls `create_player_profile` and returns a simple success/failure indicator.

## 🚀 Benefits

1. **Atomicity**: All inserts succeed or fail together
2. **Performance**: Single database round-trip instead of 4+ separate calls
3. **Error Handling**: Automatic rollback on any failure
4. **Security**: Uses `SECURITY DEFINER` for proper permissions
5. **Maintainability**: Centralized database logic

## 🧪 Testing

After creating the function, test it with a simple call:

```sql
SELECT create_player_profile(
  'Test User',
  '2000-01-01',
  '+1 (246)',
  '1234567',
  NULL,
  NULL,
  NULL,
  FALSE,
  TRUE,
  NOW(),
  ARRAY['gift_cards'],
  ARRAY['{"id": "amazon", "username": "testuser"}'::jsonb],
  ARRAY['xboxone'],
  ARRAY['ps1']
);
```

## 🔒 Security Notes

- Functions use `SECURITY DEFINER` to run with creator's privileges
- Only authenticated users can execute the functions
- All input parameters are properly typed and validated
- Transaction rollback ensures data consistency

## 🆘 Troubleshooting

### Function Not Found
- Ensure you ran the SQL in the correct Supabase project
- Check that the function appears in **Database > Functions**

### Permission Denied
- Verify the function was granted to `authenticated` role
- Check your Supabase RLS policies

### Type Errors
- Ensure your database tables match the expected schema
- Check that all required columns exist with correct types

## 📚 Related Files

- `supabase_functions.sql` - Database function definitions
- `src/components/customer-info/CustomerInfoForm.tsx` - Updated form submission logic
- `QUICK_DEPLOY.md` - Deployment guide with recent changes
