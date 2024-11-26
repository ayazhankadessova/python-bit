// 'use client'
// import React, { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import LoginForm from '@/components/LoginForm'
// import SignupForm from '@/components/SignupForm'
// import { useRouter } from 'next/navigation'

// export default function HomePage() {
//   const [showLoginForm, setShowLoginForm] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     // Check if user is already logged in
//     const token = localStorage.getItem('token')
//     if (token) {
//       router.push('/dashboard')
//     }
//   }, [router])

//   return (
//     <div className='min-h-screen bg-gradient-to-b from-background to-muted'>
//       <div className='container mx-auto px-4 py-16'>
//         <div className='max-w-md mx-auto'>
//           <div className='text-center mb-8'>
//             <h1 className='text-4xl font-bold mb-4'>Welcome to PythonBit</h1>
//             <p className='text-xl text-muted-foreground'>
//               Your platform for teaching Python with micro:bit
//             </p>
//           </div>

//           <Card className='mb-6'>
//             <CardContent className='pt-6'>
//               <div className='flex gap-4 mb-6'>
//                 <Button
//                   variant={showLoginForm ? 'default' : 'outline'}
//                   className='flex-1'
//                   onClick={() => setShowLoginForm(true)}
//                 >
//                   Login
//                 </Button>
//                 <Button
//                   variant={!showLoginForm ? 'default' : 'outline'}
//                   className='flex-1'
//                   onClick={() => setShowLoginForm(false)}
//                 >
//                   Sign Up
//                 </Button>
//               </div>

//               {showLoginForm ? <LoginForm /> : <SignupForm />}
//             </CardContent>
//           </Card>

//           <div className='text-center text-sm text-muted-foreground'>
//             <p>
//               {showLoginForm
//                 ? "Don't have an account? "
//                 : 'Already have an account? '}
//               <button
//                 onClick={() => setShowLoginForm(!showLoginForm)}
//                 className='text-primary hover:underline'
//               >
//                 {showLoginForm ? 'Sign up' : 'Log in'}
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// app/page.tsx
'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { authModalState } from '@/atoms/authModalAtom'
import { useSetRecoilState } from 'recoil'

// Role Badge Component
const RoleBadge = ({ role }: { role: string }) => (
  <span
    className={`
    px-2 py-1 text-xs rounded-full 
    ${
      role === 'teacher'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800'
    }
  `}
  >
    {role}
  </span>
)

// User Stats Component
const UserStats = ({ user }: { user: any }) => (
  <div className='grid grid-cols-2 gap-4 mt-4'>
    <Card>
      <CardContent className='p-4'>
        <div className='text-sm text-muted-foreground'>Solved Problems</div>
        <div className='text-2xl font-bold'>
          {user.solvedProblems?.length || 0}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className='p-4'>
        <div className='text-sm text-muted-foreground'>Liked Problems</div>
        <div className='text-2xl font-bold'>
          {user.likedProblems?.length || 0}
        </div>
      </CardContent>
    </Card>
  </div>
)

// Last Login Component
const LastLogin = ({ timestamp }: { timestamp: number }) => (
  <div className='text-sm text-muted-foreground mt-2'>
    Last login: {new Date(timestamp).toLocaleDateString()}
  </div>
)

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const setAuthModalState = useSetRecoilState(authModalState)

  const handleAuth = (type: 'login' | 'register') => {
    setAuthModalState((prev) => ({
      ...prev,
      isOpen: true,
      type,
    }))
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-md mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold mb-4'>Welcome to PythonBit</h1>
            <p className='text-xl text-muted-foreground'>
              Your platform for teaching Python with micro:bit
            </p>
          </div>

          {user ? (
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-2 mb-2'>
                  <span className='font-medium'>
                    {user.displayName || user.email}
                  </span>
                  <RoleBadge role={user.role || 'student'} />
                </div>
                <LastLogin timestamp={user.createdAt || Date.now()} />
              </div>

              <UserStats user={user} />

              <Button
                variant='default'
                onClick={() => router.push('/dashboard')}
                className='w-full mt-4'
              >
                Go to Dashboard
              </Button>
              <Button variant='outline' onClick={signOut} className='w-full'>
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Card className='mb-6'>
                <CardContent className='pt-6'>
                  <div className='flex gap-4'>
                    <Button
                      variant='default'
                      className='flex-1'
                      onClick={() => handleAuth('login')}
                    >
                      Login
                    </Button>
                    <Button
                      variant='outline'
                      className='flex-1'
                      onClick={() => handleAuth('register')}
                    >
                      Sign Up
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className='text-center text-sm text-muted-foreground'>
                <p>Sign in to access all features and start learning!</p>
              </div>
            </>
          )}
        </div>
      </div>
      <AuthModal />
    </div>
  )
}
