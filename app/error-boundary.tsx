'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<string>('');
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log('Error caught by boundary:', event);
      setHasError(true);
      setError(event.error);
      setErrorInfo(`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="font-mono text-sm">{error?.toString()}</p>
            {errorInfo && (
              <p className="font-mono text-sm mt-2 text-gray-700">{errorInfo}</p>
            )}
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
            >
              Clear Cache & Reload
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
