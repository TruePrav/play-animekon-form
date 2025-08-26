'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white flex items-center justify-center p-6">
      <Card className="bg-slate-800/50 border-red-400/50 backdrop-blur-sm max-w-md w-full">
        <CardHeader className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <CardTitle className="text-2xl font-bold text-red-300">Something went wrong</CardTitle>
          <CardDescription className="text-slate-300">
            {process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred. Please try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-400 text-sm">
            {process.env.NODE_ENV === 'development' 
              ? `Error: ${error.message}` 
              : 'We apologize for the inconvenience. Please try refreshing the page.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => reset()} 
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              Try Again
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Go Home
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left text-xs text-slate-500 mt-4">
              <summary className="cursor-pointer hover:text-slate-400">Error Details</summary>
              <pre className="mt-2 p-3 bg-slate-900 rounded text-red-400 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
