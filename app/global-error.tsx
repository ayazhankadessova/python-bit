'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='text-center space-y-8'>
        {/* Error Text */}
        <h1 className='text-9xl font-bold bg-gradient-to-r from-destructive to-destructive/50 text-transparent bg-clip-text'>
          Error
        </h1>

        {/* Message */}
        <div className='space-y-2'>
          <h2 className='text-3xl font-semibold text-foreground'>
            Something went wrong!
          </h2>
          <p className='text-muted-foreground max-w-md mx-auto'>
            We apologize for the inconvenience. Please try refreshing the page
            or return to home.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button onClick={reset} variant='outline' className='space-x-2'>
            <RefreshCcw className='h-4 w-4' />
            <span>Try Again</span>
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            className='space-x-2'
          >
            <Home className='h-4 w-4' />
            <span>Return Home</span>
          </Button>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-8 text-left max-w-md mx-auto p-4 bg-muted rounded-lg'>
            <p className='text-sm font-mono text-muted-foreground'>
              {error.message || 'An unexpected error occurred'}
            </p>
            {error.stack && (
              <pre className='mt-2 text-xs text-muted-foreground overflow-auto'>
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
