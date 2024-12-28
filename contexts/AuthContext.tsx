// @/contexts/AuthContext
'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, fireStore } from '@/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { FirebaseUserData, User } from '@/types/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null)
  const [user, firebaseLoading] = useAuthState(auth)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null)
        setIsLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(fireStore, 'users', user.uid))
        const data = userDoc.data() as FirebaseUserData

        if (!data.email || !data.displayName || !data.role || !data.school) {
          console.error('Missing required user data')
          setUserData(null)
          setIsLoading(false)
          return
        }

        setUserData({
          uid: user.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          school: data.school,
          likedProblems: data.likedProblems || [],
          dislikedProblems: data.dislikedProblems || [],
          solvedProblems: data.solvedProblems || [],
          starredProblems: data.starredProblems || [],
          classrooms: data.classrooms || [],
          createdAt: Date.now(),
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserData(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (!firebaseLoading) {
      fetchUserData()
    }
  }, [user, firebaseLoading])

  const signOut = useCallback(async () => {
    try {
      setUserData(null)
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      if (user && userData) {
        setUserData(userData)
      }
    }
  }, [user, userData])

  const value: AuthContextType = {
    user: userData,
    loading: isLoading || firebaseLoading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
