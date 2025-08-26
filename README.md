# PLAY Barbados Customer Information Form

A production-ready customer information web form built with Next.js, TypeScript, and Tailwind CSS for PLAY Barbados.

## Features

- **Multi-section form** with customer info, shopping preferences, and terms
- **Automatic minor detection** (under 18) with required guardian information
- **Dynamic form sections** based on shopping preferences (Gift Cards vs Video Games)
- **Comprehensive validation** using Zod schema validation
- **Responsive design** optimized for mobile and desktop
- **Accessibility-first** approach with proper ARIA labels and keyboard navigation
- **Modern UI components** using shadcn/ui and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: react-hook-form + @hookform/resolvers
- **Validation**: Zod
- **Date Handling**: date-fns + date-fns-tz
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd play-form
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── customer-info/
│   │   └── page.tsx          # Customer info form page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── customer-info/
│   │   ├── CustomerInfoForm.tsx  # Main form component
│   │   └── TermsDialog.tsx       # Terms & conditions modal
│   └── ui/                   # Reusable UI components
├── config/
│   └── customer-form-config.ts   # Form configuration
└── lib/
    └── utils.ts              # Utility functions
```

## Form Features

### Customer Information
- Full name (2-80 characters)
- Date of birth with validation
- Automatic age calculation using Toronto timezone
- Guardian information required for minors (under 18)

### Shopping Preferences
- **Gift Cards**: Select from predefined options with username inputs
- **Video Games**: Select gaming systems owned
- Dynamic form sections based on selection

### Validation Rules
- Required fields with appropriate error messages
- Date validation (no future dates, realistic range)
- Conditional validation based on selections
- Username requirements for gift cards

### User Experience
- Inline error messages
- Loading states during submission
- Success confirmation
- Responsive design for all devices
- Accessible form controls

## Configuration

The form options can be easily extended by modifying `src/config/customer-form-config.ts`:

```typescript
export const giftCardOptions: GiftCardOption[] = [
  // Add new gift card options here
];

export const consoleOptions: ConsoleOption[] = [
  // Add new console options here
];
```

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update CSS variables in `globals.css` for component theming
- Override component styles using Tailwind classes

### Form Logic
- Update validation schema in `CustomerInfoForm.tsx`
- Modify form submission logic in `onSubmit` function
- Add new form fields as needed

### Terms & Conditions
- Replace placeholder content in `TermsDialog.tsx`
- Update contact information and company details

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically on push

### Environment Variables
No environment variables required for basic functionality.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
