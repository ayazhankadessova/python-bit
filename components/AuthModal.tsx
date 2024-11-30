'use client'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { IoClose } from 'react-icons/io5'
import Login from './LoginForm'
import Signup from './SignupForm'
import ResetPassword from '@/components/auth/ResetPassword'

const AuthModal: React.FC = () => {
  const { isOpen, type, onClose } = useAuthModal()

  if (!isOpen) return null

  return (
    <div
      className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60'
      onClick={onClose}
    >
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
                onClick={onClose}
              >
                <IoClose />
              </button>
            </div>

            {/* Auth Forms */}
            {type === 'login' ? (
              <Login />
            ) : type === 'register' ? (
              <Signup />
            ) : (
              <ResetPassword />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
