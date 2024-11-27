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
import { FirebaseUserData, User } from '@/utils/types/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null)
  const [user, loading] = useAuthState(auth)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null)
        return
      }

      try {
        const userDoc = await getDoc(doc(fireStore, 'users', user.uid))
        const data = userDoc.data() as FirebaseUserData

        // Ensure required fields are present, otherwise set to null
        if (!data.email || !data.displayName || !data.role || !data.school) {
          console.error('Missing required user data')
          setUserData(null)
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
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserData(null)
      }
    }

    if (!loading) {
      fetchUserData()
    }
  }, [user, loading])

  const signOut = useCallback(async () => {
    try {
      setUserData(null)
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)

      // Only restore user data if we have all required fields
      if (user && userData) {
        setUserData(userData) // Restore the previous valid state
      }
    }
  }, [user, userData])

  const value = {
    user: userData,
    loading: loading || (!loading && user && !userData),
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
