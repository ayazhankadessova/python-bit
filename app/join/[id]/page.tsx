// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { useToast } from '@/components/hooks/use-toast'

// const JoinClassroomPage = ({ params }: { params: { id: string } }) => {
//   const router = useRouter()
//   const { toast } = useToast()
//   const [studentId, setStudentId] = useState('')
//   const [username, setUsername] = useState('')
//   const [isJoining, setIsJoining] = useState(false)

//   const handleJoinClassroom = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsJoining(true)
//     try {
//       // const response = await fetch(`/api/classroom/${params.id}/invite`, {
//       //   method: 'PUT',
//       //   headers: {
//       //     'Content-Type': 'application/json',
//       //   },
//       // })
//       // if (!response.ok) {
//       //   throw new Error('Failed to join classroom')
//       // }
//       router.push(
//         `/classroom/${params.id}?role=student&id=${studentId}&username=${username}`
//       )
//     } catch (error) {
//       console.error('Error joining classroom:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to join classroom. Please try again.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsJoining(false)
//     }
//   }

//   return (
//     <div className='container mx-auto mt-10 max-w-md'>
//       <h1 className='text-2xl font-bold mb-4'>Join Classroom</h1>
//       <form onSubmit={handleJoinClassroom}>
//         <Input
//           type='text'
//           placeholder='Enter your username'
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className='mb-4'
//           required
//         />
//         <Button type='submit' disabled={isJoining}>
//           {isJoining ? 'Joining...' : 'Join Classroom'}
//         </Button>
//       </form>
//     </div>
//   )
// }

// export default JoinClassroomPage
// app/join/[id]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Student } from '@/models/types'

const JoinClassroomPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter()
  const { toast } = useToast()
  const [isJoining, setIsJoining] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<Student | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push(`/login?redirect=/join/${params.id}`)
        return
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error('Failed to fetch user')
        const userData = await response.json()
        if (userData.role !== 'student') {
          toast({
            title: 'Error',
            description: 'Only students can join classrooms',
            variant: 'destructive',
          })
          router.push('/dashboard')
          return
        }
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, params.id, toast])

  const handleJoinClassroom = async () => {
    if (!user) return

    setIsJoining(true)
    try {
      router.push(`/classroom/${params.id}`)
    } catch (error) {
      console.error('Error joining classroom:', error)
      toast({
        title: 'Error',
        description: 'Failed to join classroom. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className='container mx-auto mt-10 flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='container mx-auto mt-10 max-w-md'>
      <h1 className='text-2xl font-bold mb-4'>Join Classroom</h1>
      <div className='text-center space-y-4'>
        <p>
          Join as <span className='font-bold'>{user?.username}</span>
        </p>
        <Button
          onClick={handleJoinClassroom}
          disabled={isJoining}
          className='w-full'
        >
          {isJoining ? 'Joining...' : 'Join Classroom'}
        </Button>
      </div>
    </div>
  )
}

export default JoinClassroomPage
