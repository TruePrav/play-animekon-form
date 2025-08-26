-- Sample data for PLAY Barbados Admin Panel
-- Run this in your Supabase SQL editor

-- Insert sample customers
INSERT INTO customers (full_name, email, whatsapp_country_code, whatsapp_number) VALUES
('John Doe', 'john.doe@example.com', '+1 (246)', '1234567'),
('Jane Smith', 'jane.smith@example.com', '+1 (246)', '7654321'),
('Bob Johnson', 'bob.johnson@example.com', '+1 (246)', '9876543'),
('Alice Brown', 'alice.brown@example.com', '+1 (246)', '5551234'),
('Charlie Wilson', 'charlie.wilson@example.com', '+1 (246)', '4445678');

-- Insert sample consoles
INSERT INTO customer_consoles (customer_id, console_type, is_retro) VALUES
((SELECT id FROM customers WHERE full_name = 'John Doe'), 'ps5', false),
((SELECT id FROM customers WHERE full_name = 'John Doe'), 'pc', false),
((SELECT id FROM customers WHERE full_name = 'Jane Smith'), 'nintendoswitch', false),
((SELECT id FROM customers WHERE full_name = 'Bob Johnson'), 'xboxone', false),
((SELECT id FROM customers WHERE full_name = 'Alice Brown'), 'ps4', false),
((SELECT id FROM customers WHERE full_name = 'Charlie Wilson'), 'nintendoswitch', false);

-- Insert sample shopping categories
INSERT INTO customer_shopping_categories (customer_id, category) VALUES
((SELECT id FROM customers WHERE full_name = 'John Doe'), 'video_games'),
((SELECT id FROM customers WHERE full_name = 'Jane Smith'), 'video_games'),
((SELECT id FROM customers WHERE full_name = 'Bob Johnson'), 'video_games'),
((SELECT id FROM customers WHERE full_name = 'Alice Brown'), 'video_games'),
((SELECT id FROM customers WHERE full_name = 'Charlie Wilson'), 'video_games');

-- Create customer_gift_cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer_gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  gift_card_type TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample gift cards
INSERT INTO customer_gift_cards (customer_id, gift_card_type, username) VALUES
((SELECT id FROM customers WHERE full_name = 'John Doe'), 'amazon', 'johndoe123'),
((SELECT id FROM customers WHERE full_name = 'Jane Smith'), 'fortnite', NULL),
((SELECT id FROM customers WHERE full_name = 'Bob Johnson'), 'steam', 'bobjohnson'),
((SELECT id FROM customers WHERE full_name = 'Alice Brown'), 'itunes', 'alicebrown'),
((SELECT id FROM customers WHERE full_name = 'Charlie Wilson'), 'roblox', 'charliewilson');
