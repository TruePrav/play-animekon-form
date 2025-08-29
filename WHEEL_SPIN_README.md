# Wheel Spin and Prizes Management

This feature adds wheel spin tracking and prize management to the PLAY Barbados admin panel.

## 🎯 Features

- **Wheel Spin Tracking**: Checkbox to mark if a customer has spun the wheel
- **Prize Management**: Select what prizes customers won from the wheel
- **Filtering**: Filter customers by wheel spin status
- **Export**: Include wheel spin and prize data in CSV exports
- **Real-time Updates**: Changes are saved immediately to the database

## 🗄️ Database Setup

### 1. Run the SQL Setup

Execute the `WHEEL_SPIN_SETUP.sql` file in your Supabase SQL editor to create the necessary tables and functions.

### 2. Tables Created

- **`customer_wheel_spins`**: Tracks whether each customer has spun the wheel
- **`customer_prizes`**: Records what prizes each customer won

### 3. Functions Created

- **`update_wheel_spin_status`**: Updates wheel spin status for a customer
- **`update_customer_prize`**: Adds or updates prizes for a customer

## 🎁 Available Prizes

The system includes these predefined prizes:

- **$10 Voucher** - Digital voucher worth $10
- **$5 Voucher** - Digital voucher worth $5  
- **10% Off** - Percentage discount
- **$20 Voucher** - Digital voucher worth $20

## 🎮 How to Use

### For Each Customer:

1. **Check Wheel Spin**: 
   - Look for the "Customer spun the wheel" checkbox
   - Check it if the customer has spun the wheel
   - Uncheck it if they haven't

2. **Select Prizes** (only appears after checking wheel spin):
   - Check the appropriate prize checkboxes
   - Multiple prizes can be selected
   - Uncheck to remove prizes

### Filtering:

- Use the "Filter by wheel spin" dropdown to show:
  - All Customers
  - Spun Wheel (customers who spun)
  - Not Spun Wheel (customers who haven't spun)

### Export:

- CSV exports now include:
  - Spun Wheel (Yes/No)
  - Wheel Spin Date
  - Prizes Won

## 🔧 Technical Details

### State Management

- Wheel spin status is stored in `customer_wheel_spins` table
- Prize selections are stored in `customer_prizes` table
- All changes are immediately synced with the database

### Error Handling

- Graceful fallback if tables don't exist yet
- Logging for debugging database issues
- User-friendly error messages

### Performance

- Efficient database queries with proper indexing
- Optimistic UI updates for better user experience
- Minimal database round-trips

## 🚀 Getting Started

1. **Run the SQL setup** in your Supabase project
2. **Restart your admin panel** to load the new functionality
3. **Start tracking** wheel spins and prizes for your customers

## 📊 Statistics

The admin panel now shows:
- Total wheel spins count
- Wheel spin percentage in debug info
- Prize distribution across customers

## 🔒 Security

- All functions use `SECURITY DEFINER` for proper permissions
- Only authenticated users can access the functionality
- Input validation and sanitization in place

## 🆘 Troubleshooting

### Tables Not Found
- Ensure you ran the `WHEEL_SPIN_SETUP.sql` file
- Check that the tables appear in your Supabase dashboard

### Functions Not Working
- Verify the functions were created successfully
- Check that permissions were granted to `authenticated` role

### Data Not Saving
- Check your browser's network tab for errors
- Verify your Supabase connection is working
- Check the browser console for JavaScript errors

## 📝 Future Enhancements

Potential improvements:
- Prize claiming status tracking
- Wheel spin history with timestamps
- Custom prize types and values
- Bulk prize assignment
- Prize expiration dates
- Integration with actual wheel spin mechanics
