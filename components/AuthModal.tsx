'use client'

import { useEffect } from 'react'
import { useAuthModal } from '@/contexts/AuthModalContext'
import Login from './LoginForm'
import Signup from './SignupForm'
import ResetPassword from '@/components/auth/ResetPassword'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const AuthModal = () => {
  const { isOpen, type, onClose } = useAuthModal()

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
      <DialogContent className='sm:max-w-[425px] gap-0 p-0 border-none'>
        <div className='flex flex-col w-full'>

          {/* Content */}
          <div className='p-0 overflow-y-auto max-h-[80vh]'>
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
