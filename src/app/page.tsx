import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">PLAY Barbados</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your premier destination for gaming and entertainment in Barbados. 
            From gift cards to video games, we've got everything you need for the ultimate gaming experience.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/customer-info">
            <Button size="lg" className="px-8 py-4 text-lg">
              Get Started - Customer Information
            </Button>
          </Link>
          
          <p className="text-sm text-gray-500">
            Complete our customer information form to get started with PLAY Barbados
          </p>
        </div>
      </div>
    </div>
  );
}
