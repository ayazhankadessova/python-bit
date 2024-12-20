// // app/page.tsx
// 'use client'
// import React from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/contexts/AuthContext'
// import { Loader2 } from 'lucide-react'
// import AuthModal from '@/components/AuthModal'
// import { useAuthModal } from '@/contexts/AuthModalContext'

// // Role Badge Component
// const RoleBadge = ({ role }: { role: string }) => (
//   <span
//     className={`
//     px-2 py-1 text-xs rounded-full
//     ${
//       role === 'teacher'
//         ? 'bg-blue-100 text-blue-800'
//         : 'bg-green-100 text-green-800'
//     }
//   `}
//   >
//     {role}
//   </span>
// )

// // User Stats Component
// const UserStats = ({ user }: { user: any }) => (
//   <div className='grid grid-cols-2 gap-4 mt-4'>
//     <Card>
//       <CardContent className='p-4'>
//         <div className='text-sm text-muted-foreground'>Solved Problems</div>
//         <div className='text-2xl font-bold'>
//           {user.solvedProblems?.length || 0}
//         </div>
//       </CardContent>
//     </Card>
//     <Card>
//       <CardContent className='p-4'>
//         <div className='text-sm text-muted-foreground'>Liked Problems</div>
//         <div className='text-2xl font-bold'>
//           {user.likedProblems?.length || 0}
//         </div>
//       </CardContent>
//     </Card>
//   </div>
// )

// export default function HomePage() {
//   const { user, loading, signOut } = useAuth()
//   const router = useRouter()
//   const { onOpen } = useAuthModal()

//   const handleAuth = (type: 'login' | 'register') => {
//     onOpen(type)
//   }

//   if (loading) {
//     return (
//       <div className='min-h-screen flex items-center justify-center'>
//         <Loader2 className='h-8 w-8 animate-spin' />
//       </div>
//     )
//   }

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

//           {user ? (
//             <div className='space-y-4'>
//               <div className='text-center'>
//                 <div className='flex items-center justify-center gap-2 mb-2'>
//                   <span className='font-medium'>
//                     {user.displayName || user.email}
//                   </span>
//                   <RoleBadge role={user.role || 'student'} />
//                 </div>
//               </div>

//               <UserStats user={user} />

//               <Button
//                 variant='default'
//                 onClick={() => router.push('/dashboard')}
//                 className='w-full mt-4'
//               >
//                 Go to Dashboard
//               </Button>
//               <Button variant='outline' onClick={signOut} className='w-full'>
//                 Sign Out
//               </Button>
//             </div>
//           ) : (
//             <>
//               <Card className='mb-6'>
//                 <CardContent className='pt-6'>
//                   <div className='flex gap-4'>
//                     <Button
//                       variant='default'
//                       className='flex-1'
//                       onClick={() => handleAuth('login')}
//                     >
//                       Login
//                     </Button>
//                     <Button
//                       variant='outline'
//                       className='flex-1'
//                       onClick={() => handleAuth('register')}
//                     >
//                       Sign Up
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//               <div className='text-center text-sm text-muted-foreground'>
//                 <p>Sign in to access all features and start learning!</p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//       <AuthModal />
//     </div>
//   )
// }
'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { RoleBadge } from '@/components/user/RoleBadge'
import { UserStats } from '@/components/user/UserStats'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { onOpen } = useAuthModal()

  const handleAuth = (type: 'login' | 'register' | 'forgotPassword') => {
    onOpen(type)
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
                  <Button
                    variant='ghost'
                    className='w-full mt-4'
                    onClick={() => handleAuth('forgotPassword')}
                  >
                    Forgot Password?
                  </Button>
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
