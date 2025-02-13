'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function Custom404() {
  const router = useRouter()

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='text-center space-y-8'>
        {/* Large 404 Text */}
        <h1 className='text-7xl font-bold bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text'>
          404
        </h1>

        {/* Message */}
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold text-foreground'>
            Page Not Found
          </h2>
          <p className='text-muted-foreground max-w-md mx-auto'>
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button
            onClick={() => router.back()}
            variant='softTeal'
            className='space-x-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Go Back</span>
          </Button>
          <Button onClick={() => router.push('/')} className='space-x-2'>
            <Home className='h-4 w-4' />
            <span>Return Home</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
