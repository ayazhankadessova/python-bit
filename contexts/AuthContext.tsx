// AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { auth, fireStore } from '@/firebase/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { User } from '@/types/firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authUnsubscribe = useRef<(() => void) | null>(null)
  const userDocUnsubscribe = useRef<(() => void) | null>(null)

  const subscribeToUserData = useCallback(async (uid: string) => {
    try {
      if (userDocUnsubscribe.current) {
        userDocUnsubscribe.current()
      }

      const userRef = doc(fireStore, 'users', uid)
      userDocUnsubscribe.current = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as User

            if (
              !data.email ||
              !data.displayName ||
              !data.role ||
              !data.school
            ) {
              setUserData(null)
              return
            }

            setUserData({
              uid,
              email: data.email,
              displayName: data.displayName,
              role: data.role,
              school: data.school,
              likedProblems: data.likedProblems || [],
              dislikedProblems: data.dislikedProblems || [],
              solvedProblems: data.solvedProblems || [],
              starredProblems: data.starredProblems || [],
              classrooms: data.classrooms || [],
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt || Date.now(),
            })
          } else {
            setUserData(null)
          }
        },
        (error) => {
          console.error('Error fetching user data:', error)
          setUserData(null)
        }
      )
    } catch (error) {
      console.error('Error setting up user data subscription:', error)
      setUserData(null)
    }
  }, [])

  useEffect(() => {
    authUnsubscribe.current = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await subscribeToUserData(firebaseUser.uid)
        } else {
          setUserData(null)
          if (userDocUnsubscribe.current) {
            userDocUnsubscribe.current()
            userDocUnsubscribe.current = null
          }
        }
      } finally {
        setLoading(false)
      }
    })

    return () => {
      if (authUnsubscribe.current) {
        authUnsubscribe.current()
      }
      if (userDocUnsubscribe.current) {
        userDocUnsubscribe.current()
      }
    }
  }, [subscribeToUserData])

  const signOut = useCallback(async () => {
    try {
      await auth.signOut()
      setUserData(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }, [])

  const refreshUserData = useCallback(async () => {
    if (!auth.currentUser) return
    await subscribeToUserData(auth.currentUser.uid)
  }, [subscribeToUserData])

  const value = useMemo(
    () => ({
      user: userData,
      loading,
      signOut,
      refreshUserData,
    }),
    [userData, loading, signOut, refreshUserData]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
