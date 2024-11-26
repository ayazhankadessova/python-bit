// components/AuthModal.tsx
'use client'
import { authModalState } from '@/atoms/authModalAtom'
import { IoClose } from 'react-icons/io5'
import Login from './LoginForm'
// import ResetPassword from './ResetPassword'
import Signup from './SignupForm'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useEffect } from 'react'

type AuthModalProps = {}

const AuthModal: React.FC<AuthModalProps> = () => {
  const authModal = useRecoilValue(authModalState)
  const setAuthModal = useSetRecoilState(authModalState)

  const handleClose = () => {
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  if (!authModal.isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60'
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className='w-full sm:w-[450px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='relative w-full h-full mx-auto flex items-center justify-center'>
            <div className='bg-white rounded-lg shadow relative w-full bg-gradient-to-b from-brand-orange to-slate-900 mx-6'>
              <div className='flex justify-end p-2'>
                <button
                  type='button'
                  className='bg-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-800 hover:text-white text-white'
                  onClick={handleClose}
                >
                  <IoClose />
                </button>
              </div>

              {/* Auth Forms */}
              {authModal.type === 'login' ? (
                <Login />
              ) : authModal.type === 'register' ? (
                <Signup />
              ) : (
                <Signup />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthModal

// useCloseModal hook (optional - you can keep the close logic in the component)
function useCloseModal() {
  const setAuthModal = useSetRecoilState(authModalState)

  const closeModal = () => {
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
      type: 'login',
    }))
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return closeModal
}
