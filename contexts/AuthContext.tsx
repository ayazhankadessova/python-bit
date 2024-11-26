// contexts/AuthContext.tsx
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
import { useRouter } from 'next/navigation'

// interface User {
//   uid: string
//   email: string | null
//   displayName: string | null
//   role?: 'student' | 'teacher'
//   school?: string
//   likedProblems?: string[]
//   dislikedProblems?: string[]
//   solvedProblems?: string[]
//   starredProblems?: string[]
// }
interface UserClassroom {
  classroomId: string
  joinedAt: number
}

interface User {
  uid: string
  email: string | null
  displayName: string | null
  role?: 'student' | 'teacher'
  school?: string
  solvedProblems?: string[]
  classrooms?: UserClassroom[]
  likedProblems?: string[]
  dislikedProblems?: string[]
  starredProblems?: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null)
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null)
        return
      }

      try {
        const userDoc = await getDoc(doc(fireStore, 'users', user.uid))
        const data = userDoc.data() as User

        setUserData({
          uid: user.uid,
          email: user.email,
          displayName: data.displayName || user.displayName,
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
      // Clear user data first
      setUserData(null)

      // Navigate before sign out to prevent delay
      // router.push('/')

      // Sign out from Firebase
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      // Restore user data if sign out fails
      if (user) {
        setUserData({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })
      }
    }
  }, [router, user])

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
