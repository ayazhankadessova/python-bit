'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Lock, LogIn } from 'lucide-react'
import { useAuthModal } from '@/contexts/AuthModalContext'

export default function CustomLoginRequired() {
  const router = useRouter()
  const { onOpen } = useAuthModal()

  return (
    <div className='min-h-[70vh] flex items-center justify-center p-4'>
      <div className='text-center space-y-6'>
        <div className='flex justify-center'>
          <Lock
            className='h-24 w-24 text-primary animate-pulse'
            strokeWidth={1.5}
          />
        </div>

        {/* Message */}
        <div>
          <h2 className='text-4xl font-semibold text-foreground mb-2'>
            Login Required
          </h2>
          <p className='text-muted-foreground max-w-md mx-auto text-md'>
            Please sign in to access this content. Your learning journey
            continues just a click away!
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button
            variant='default'
            onClick={() => onOpen('login')}
            className='text-base'
          >
            <LogIn className='h-4 w-4 mr-2' />
            Log in
          </Button>
          <Button
            variant='outline'
            onClick={() => onOpen('register')}
            className='text-base'
          >
            Sign up
          </Button>
          <Button
            variant='outline'
            onClick={() => router.push('/')}
            className='space-x-2'
          >
            <Home className='h-4 w-4' />
            <span>Return Home</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
