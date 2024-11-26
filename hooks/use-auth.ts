// hooks/useAuth.ts
import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { authState } from '@/atoms/authModalAtom'
import { auth, fireStore } from '@/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'

export function useAuth() {
  const setAuthState = useSetRecoilState(authState)
  const [user, loading, error] = useAuthState(auth)

  useEffect(() => {
    const updateAuthState = async () => {
      if (loading) {
        setAuthState((prev) => ({ ...prev, loading: true }))
        return
      }

      if (!user) {
        setAuthState({ user: null, loading: false })
        return
      }

      try {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(fireStore, 'users', user.uid))
        const userData = userDoc.data()

        setAuthState({
          user: {
            uid: user.uid,
            email: user.email!,
            displayName: userData?.displayName || '',
            role: userData?.role || 'student',
            school: userData?.school,
            createdAt: userData?.createdAt,
            updatedAt: userData?.updatedAt,
            likedProblems: userData?.likedProblems || [],
            dislikedProblems: userData?.dislikedProblems || [],
            solvedProblems: userData?.solvedProblems || [],
            starredProblems: userData?.starredProblems || [],
          },
          loading: false,
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        setAuthState({ user: null, loading: false })
      }
    }

    updateAuthState()
  }, [user, loading, setAuthState])

  return { user, loading, error }
}
