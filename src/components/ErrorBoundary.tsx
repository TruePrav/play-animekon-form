'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to our logger (which will show in production)
    logger.error('ErrorBoundary caught an error:', error);
    logger.error('Error info:', errorInfo);
    
    // You could also send to an error reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white flex items-center justify-center p-6">
          <Card className="bg-slate-800/50 border-red-400/50 backdrop-blur-sm max-w-md w-full">
            <CardHeader className="text-center">
              <div className="text-red-400 text-6xl mb-4">🚨</div>
              <CardTitle className="text-2xl font-bold text-red-300">Application Error</CardTitle>
              <CardDescription className="text-slate-300">
                Something unexpected happened in the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-400 text-sm">
                We&apos;ve been notified of this error and are working to fix it.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => this.setState({ hasError: false })} 
                  className="bg-red-500 hover:bg-red-400 text-white"
                >
                  Try Again
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Reload Page
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left text-xs text-slate-500 mt-4">
                  <summary className="cursor-pointer hover:text-slate-400">Error Details</summary>
                  <pre className="mt-2 p-3 bg-slate-900 rounded text-red-400 overflow-auto">
                    {this.state.error.message}
                    {'\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to use error boundaries
export function useErrorHandler() {
  return (error: Error) => {
    logger.error('Unhandled error caught by useErrorHandler:', error);
    // You could also send to an error reporting service here
  };
}
