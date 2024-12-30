'use client'

import { useEffect } from 'react'
import { useAuthModal } from '@/contexts/AuthModalContext'
import Login from './LoginForm'
import Signup from './SignupForm'
import ResetPassword from '@/components/auth/ResetPassword'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const AuthModal = () => {
  const { isOpen, type, onClose } = useAuthModal()

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close modal on escape key press
  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px] gap-0 p-0 bg-background border-none'>
        <div className='flex flex-col w-full'>
          {/* Header */}
          <div className='flex justify-between items-center p-4 border-b'>
            <h2 className='text-xl font-semibold'>
              {type === 'login'
                ? 'Login'
                : type === 'register'
                ? 'Sign Up'
                : 'Reset Password'}
            </h2>
          </div>

          {/* Content */}
          <div className='px-4 py-6 overflow-y-auto max-h-[80vh]'>
            {type === 'login' ? (
              <Login />
            ) : type === 'register' ? (
              <Signup />
            ) : (
              <ResetPassword />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal
