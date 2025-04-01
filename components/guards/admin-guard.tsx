'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Lock } from 'lucide-react'
import { ADMIN_EMAILS } from '@/config/admin'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 1000) // 1 second delay

      return () => clearTimeout(timer)
    }
  }, [loading, user])

  if (!isReady) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto' />
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }

  if (user && ADMIN_EMAILS.includes(user.email)) {
    return <>{children}</>
  }

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className='flex items-center space-x-2'>
            <Lock className='h-5 w-5 text-destructive' />
            <AlertDialogTitle>Admin Access Required</AlertDialogTitle>
          </div>
          <AlertDialogDescription className='space-y-4'>
            <p>
              This area is restricted to administrators only. You do not have
              the necessary permissions to access these pages.
            </p>
            {user ? (
              <p className='text-sm text-muted-foreground'>
                Current user: {user.email}
              </p>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Please sign in with an administrator account.
              </p>
            )}
            <div className='bg-muted p-4 rounded-lg'>
              <p className='text-sm font-normal'>Need access?</p>
              <p className='text-sm text-muted-foreground'>
                Contact your system administrator if you believe you should have
                access to this area.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => router.push('/')}>
            Return to Home
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
