// components/AuthProvider.tsx
'use client'
import { auth, fireStore } from '@/firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { authState } from '@/atoms/authModalAtom'

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const setAuthState = useSetRecoilState(authState)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(fireStore, 'users', user.uid))
        const userData = userDoc.data()

        setAuthState({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: userData?.displayName || user.displayName,
          },
          loading: false,
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
        })
      }
    })

    return () => unsubscribe()
  }, [setAuthState])

  return <>{children}</>
}

export default AuthProvider
