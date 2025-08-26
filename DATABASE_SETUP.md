# Database Setup for PLAY Barbados Form

## 🗄️ Required Database Function

The form now uses a single database function call instead of multiple table inserts. This provides better performance, atomicity, and error handling.

## 📋 Setup Steps

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Create the Database Function

Copy and paste the entire contents of `supabase_functions.sql` into the SQL editor, then click **Run**.

### 3. Verify Function Creation

After running the SQL, you should see:
- `create_player_profile` function created
- `create_player_profile_simple` function created (optional)
- Both functions granted to authenticated users

## 🔧 Function Details

### `create_player_profile`

**Returns:** UUID (the new customer ID)

**Parameters:**
- `p_full_name`: Customer's full name
- `p_date_of_birth`: Date of birth
- `p_whatsapp_country_code`: WhatsApp country code
- `p_whatsapp_number`: WhatsApp phone number
- `p_custom_country_code`: Custom country code (if "other" selected)
- `p_guardian_full_name`: Guardian name (for minors)
- `p_guardian_date_of_birth`: Guardian date of birth (for minors)
- `p_is_minor`: Whether customer is under 18
- `p_terms_accepted`: Terms acceptance status
- `p_terms_accepted_at`: When terms were accepted
- `p_shop_categories`: Array of shopping categories
- `p_gift_cards`: Array of gift card objects with `id` and `username`
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
