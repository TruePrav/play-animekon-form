# Database Setup for Admin Panel

## Required Tables

The admin panel requires these tables to be present in your Supabase database:

### 1. customers
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  whatsapp_country_code TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  custom_country_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_minor BOOLEAN DEFAULT false,
  guardian_full_name TEXT,
  guardian_date_of_birth DATE
);
```

### 2. customer_gift_cards
```sql
CREATE TABLE customer_gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  gift_card_type TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. customer_consoles
```sql
CREATE TABLE customer_consoles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  console_type TEXT NOT NULL,
  is_retro BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. customer_shopping_categories
```sql
CREATE TABLE customer_shopping_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Sample Data

### Insert sample customers:
```sql
INSERT INTO customers (full_name, date_of_birth, whatsapp_country_code, whatsapp_number, is_minor) VALUES
('John Doe', '1990-05-15', '+1 (246)', '1234567', false),
('Jane Smith', '2005-08-20', '+1 (246)', '7654321', true),
('Bob Johnson', '1985-12-10', '+1 (246)', '9876543', false);
```

### Insert sample gift cards:
```sql
INSERT INTO customer_gift_cards (customer_id, gift_card_type, username) VALUES
((SELECT id FROM customers WHERE full_name = 'John Doe'), 'amazon', 'johndoe123'),
((SELECT id FROM customers WHERE full_name = 'Jane Smith'), 'fortnite', NULL),
((SELECT id FROM customers WHERE full_name = 'Bob Johnson'), 'steam', 'bobjohnson');
```

### Insert sample consoles:
```sql
INSERT INTO customer_consoles (customer_id, console_type, is_retro) VALUES
((SELECT id FROM customers WHERE full_name = 'John Doe'), 'ps5', false),
((SELECT id FROM customers WHERE full_name = 'Jane Smith'), 'nintendoswitch', false),
((SELECT id FROM customers WHERE full_name = 'Bob Johnson'), 'pc', false);
```

### Insert sample categories:
```sql
INSERT INTO customer_shopping_categories (customer_id, category) VALUES
((SELECT id FROM customers WHERE full_name = 'John Doe'), 'gift_cards'),
((SELECT id FROM customers WHERE full_name = 'Jane Smith'), 'video_games'),
((SELECT id FROM customers WHERE full_name = 'Bob Johnson'), 'video_games');
```

## Row Level Security (Optional)

For production, you might want to enable RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_shopping_categories ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
CREATE POLICY "Allow all operations for authenticated users" ON customers
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON customer_gift_cards
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON customer_consoles
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON customer_shopping_categories
  FOR ALL USING (true);
```

## Testing

1. Run the SQL commands above in your Supabase SQL editor
2. Navigate to `/admin` in your application
3. You should see the customer data displayed
4. Test editing customer information and gift card usernames

## Troubleshooting

### If no data appears:
1. Check the browser console for errors
2. Verify your Supabase environment variables are correct
3. Ensure the tables exist and have data
4. Check if RLS is blocking access

### If editing doesn't work:
1. Check the browser console for errors
2. Verify your Supabase permissions allow updates
3. Ensure the customer ID relationships are correct
