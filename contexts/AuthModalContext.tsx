// contexts/AuthModalContext.tsx
import { createContext, useContext, useState } from 'react'

type ModalType = 'login' | 'register' | 'forgotPassword'

interface AuthModalContextType {
  isOpen: boolean
  type: ModalType
  onOpen: (type: ModalType) => void
  onClose: () => void
}

const AuthModalContext = createContext<AuthModalContextType | null>(null)

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: ModalType
  }>({
    isOpen: false,
    type: 'login',
  })

  const onOpen = (type: ModalType) => {
    setModalState({ isOpen: true, type })
  }

  const onClose = () => {
    setModalState({ ...modalState, isOpen: false })
  }

  return (
    <AuthModalContext.Provider value={{ ...modalState, onOpen, onClose }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider')
  }
  return context
}
