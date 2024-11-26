// atoms/authModalAtom.ts
import { atom } from 'recoil'

export interface User {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthState {
  user: User | null
  loading: boolean
}

export const authState = atom<AuthState>({
  key: 'authState',
  default: {
    user: null,
    loading: true,
  },
})

export interface AuthModalState {
  isOpen: boolean
  type: 'login' | 'register' | 'forgotPassword'
}

export const authModalState = atom<AuthModalState>({
  key: 'authModalState',
  default: {
    isOpen: false,
    type: 'login',
  },
})
