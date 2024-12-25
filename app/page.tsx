'use client'
import React, {useEffect} from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { RoleBadge } from '@/components/user/RoleBadge'
import { UserStats } from '@/components/user/UserStats'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { onOpen } = useAuthModal()

  // Remove browser extension attributes on client-side mount
  useEffect(() => {
    const removeExtensionAttributes = () => {
      document.body.removeAttribute('data-new-gr-c-s-check-loaded')
      document.body.removeAttribute('data-gr-ext-installed')
      document.documentElement.removeAttribute('data-new-gr-c-s-check-loaded')
      document.documentElement.removeAttribute('data-gr-ext-installed')
    }

    removeExtensionAttributes()
  }, [])

  const handleAuth = (type: 'login' | 'register' | 'forgotPassword') => {
    onOpen(type)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-md mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold mb-4'>Welcome to PythonBit</h1>
            <p className='text-xl text-muted-foreground'>
              Your platform for teaching Python with micro:bit
            </p>
          </div>

          {user ? (
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-2 mb-2'>
                  <span className='font-medium'>
                    {user.displayName || user.email}
                  </span>
                  <RoleBadge role={user.role || 'student'} />
                </div>
              </div>

              <UserStats user={user} />

              <Button
                variant='default'
                onClick={() => router.push('/dashboard')}
                className='w-full mt-4'
              >
                Go to Dashboard
              </Button>
              <Button variant='outline' onClick={signOut} className='w-full'>
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Card className='mb-6'>
                <CardContent className='pt-6'>
                  <div className='flex gap-4'>
                    <Button
                      variant='default'
                      className='flex-1'
                      onClick={() => handleAuth('login')}
                    >
                      Login
                    </Button>
                    <Button
                      variant='outline'
                      className='flex-1'
                      onClick={() => handleAuth('register')}
                    >
                      Sign Up
                    </Button>
                  </div>
                  <Button
                    variant='ghost'
                    className='w-full mt-4'
                    onClick={() => handleAuth('forgotPassword')}
                  >
                    Forgot Password?
                  </Button>
                </CardContent>
              </Card>
              <div className='text-center text-sm text-muted-foreground'>
                <p>Sign in to access all features and start learning!</p>
              </div>
            </>
          )}
        </div>
      </div>
      <AuthModal />
    </div>
  )
}
