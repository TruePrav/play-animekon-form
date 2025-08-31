# Mobile Console Option and Phone Number Validation

This update adds the "Mobile" option to the video games section and implements duplicate phone number validation to prevent users from signing up multiple times with the same phone number.

## 🎮 Changes Made

### 1. Added Mobile Console Option

**File Modified:** `src/config/customer-form-config.ts`

- Added "Mobile" as a new console option in the `consoleOptions` array
- Positioned between "PC" and "Retro" for logical grouping
- Users can now select "Mobile" as one of their gaming systems

### 2. Phone Number Uniqueness Constraint

**New File:** `ADD_MOBILE_AND_PHONE_CONSTRAINT.sql`

- Added unique constraint on `(whatsapp_country_code, whatsapp_number)` combination
- Created index for better performance on phone number lookups
- Added `check_phone_exists` function to verify phone numbers before submission

### 3. Enhanced Form Validation

**File Modified:** `src/components/customer-info/CustomerInfoForm.tsx`

- Added pre-submission phone number validation using the `check_phone_exists` function
- Enhanced error handling for phone number constraint violations
- Improved user experience with specific error messages

## 🗄️ Database Changes Required

### Run the SQL Script

Execute the following SQL in your Supabase SQL editor:

```sql
-- Run ADD_MOBILE_AND_PHONE_CONSTRAINT.sql
```

This will:
1. Add the unique constraint to prevent duplicate phone numbers
2. Create an index for better performance
3. Add the phone number checking function
4. Grant necessary permissions

## 🔒 Security Features

### Phone Number Validation

- **Pre-submission Check**: Validates phone numbers before attempting database insertion
- **Unique Constraint**: Database-level protection against duplicate phone numbers
- **Clear Error Messages**: Users get specific feedback when phone numbers are already registered

### Error Handling

- Specific error messages for different constraint violations
- Graceful fallback for unexpected errors
- Logging for debugging and monitoring

## 🧪 Testing

### Test Mobile Console Option

1. Fill out the form and select "Video Games" category
2. Verify "Mobile" appears in the console options
3. Select "Mobile" and submit the form
4. Check that "Mobile" is saved in the database

### Test Phone Number Validation

1. Submit a form with a new phone number
2. Try to submit another form with the same phone number
3. Verify the duplicate phone number error is displayed
4. Check that the second submission is blocked

## 📱 User Experience Improvements

### Better Error Messages

- **Before**: Generic "duplicate key value" errors
- **After**: Specific "phone number already exists" messages

### Mobile Gaming Support

- Users can now indicate they play games on mobile devices
- Better categorization of gaming preferences
- More accurate customer profiling

## 🔧 Technical Details

### Database Functions

- `check_phone_exists(p_country_code, p_phone_number)` - Returns boolean
- Runs with `SECURITY DEFINER` for proper permissions
- Optimized with database indexes

### Form Validation Flow

1. User fills out form
2. Pre-submission phone number check
3. If phone exists → Show error message
4. If phone is new → Proceed with profile creation
5. Database constraint as final safety net

## 🚀 Deployment

### 1. Database Updates

Run the SQL script in your Supabase project:
- Go to **SQL Editor** in your Supabase dashboard
- Copy and paste the contents of `ADD_MOBILE_AND_PHONE_CONSTRAINT.sql`
- Execute the script

### 2. Application Updates

The application changes are already included in the updated files:
- `src/config/customer-form-config.ts` - Mobile console option
- `src/components/customer-info/CustomerInfoForm.tsx` - Phone validation

### 3. Verify Changes

- Test the form with the new Mobile option
- Test duplicate phone number scenarios
- Check that error messages are clear and helpful

## 📋 Checklist

- [ ] Run `ADD_MOBILE_AND_PHONE_CONSTRAINT.sql` in Supabase
- [ ] Verify "Mobile" appears in console options
- [ ] Test phone number validation with duplicates
- [ ] Check error messages are user-friendly
- [ ] Verify database constraints are working
- [ ] Test form submission with new Mobile option

## 🆘 Troubleshooting

### Phone Number Constraint Fails

If the constraint addition fails, you may have duplicate phone numbers in your existing data:

```sql
-- Check for duplicate phone numbers
SELECT whatsapp_country_code, whatsapp_number, COUNT(*)
FROM customers 
GROUP BY whatsapp_country_code, whatsapp_number 
HAVING COUNT(*) > 1;
```

### Function Not Found

If `check_phone_exists` function is not found:
- Ensure you ran the SQL script completely
- Check that the function appears in **Database > Functions**
- Verify permissions are granted to `authenticated` role

## 📚 Related Files

- `src/config/customer-form-config.ts` - Console options configuration
- `src/components/customer-info/CustomerInfoForm.tsx` - Form validation logic
- `ADD_MOBILE_AND_PHONE_CONSTRAINT.sql` - Database schema updates
- `DATABASE_SETUP.md` - Original database setup documentation

