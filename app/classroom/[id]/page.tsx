// app/classroom/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionView } from '@/components/session-view'
import io, { Socket } from 'socket.io-client'
import { User } from '@/models/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface ClassroomPageProps {
  params: {
    id: string
  }
}

interface ClassroomData {
  _id: string
  name: string
  lastTaughtWeek: number
  teacherId: string
  isActive?: boolean
}

const ClassroomPage: React.FC<ClassroomPageProps> = ({ params }) => {
  const SESSION_CHECK_TIMEOUT = 5000 // 5 seconds

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isActiveSession, setIsActiveSession] = useState<boolean>(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [classroom, setClassroom] = useState<ClassroomData | null>(null)

  const username = searchParams.get('username')
  const role = searchParams.get('role')
  const classroomId = params.id

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Not authenticated')
          router.push('/')
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch user data')
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Error fetching user data. Please try again.')
      }
    }

    fetchUserData()
  }, [router])

  // Fetch classroom data and check session status
  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/classroom/${classroomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch classroom data')
        const data = await response.json()
        setClassroom(data)
      } catch (error) {
        console.error('Error fetching classroom:', error)
        setError('Failed to fetch classroom data')
      }
    }

    fetchClassroomData()
  }, [classroomId])

  // Socket connection with delayed session check
  // app/classroom/[id]/page.tsx - modify the socket connection effect
  useEffect(() => {
    if (!user) return

    let statusCheckTimeout: NodeJS.Timeout

    const connectSocket = async () => {
      setIsCheckingSession(true)
      const newSocket = io('http://localhost:3000')
      setSocket(newSocket)

      // Set a timeout for session check
      statusCheckTimeout = setTimeout(() => {
        setIsCheckingSession(false)
        if (role === 'student') {
          console.log('Session status check timed out')
          toast({
            title: 'Connection Error',
            description: 'Unable to check session status. Please try again.',
            variant: 'destructive',
          })
          router.push('/dashboard')
        }
      }, 5000) // 5 second timeout

      newSocket.on('connect', () => {
        console.log('Connected to socket server')
        newSocket.emit(
          'join-room',
          classroomId,
          user.username,
          role === 'teacher'
        )
      })

      newSocket.on(
        'session-status',
        (data: { active: boolean; message?: string }) => {
          clearTimeout(statusCheckTimeout)
          console.log('Received session status:', data)
          setIsActiveSession(data.active)
          setIsCheckingSession(false)

          if (!data.active && role === 'student') {
            toast({
              title: 'No Active Session',
              description:
                data.message || 'The teacher has not started the session yet.',
              variant: 'destructive',
            })
            router.push('/dashboard')
          }
        }
      )

      newSocket.on('connect_error', (error) => {
        clearTimeout(statusCheckTimeout)
        console.error('Socket connection error:', error)
        setError('Failed to connect to the classroom. Please try again.')
        setIsCheckingSession(false)
        router.push('/dashboard')
      })

      newSocket.on('error', (error) => {
        clearTimeout(statusCheckTimeout)
        console.error('Socket error:', error)
        setError(error)
        setIsCheckingSession(false)
        router.push('/dashboard')
      })
    }

    connectSocket()

    return () => {
      clearTimeout(statusCheckTimeout)
      if (socket) {
        socket.disconnect()
      }
    }
  }, [classroomId, role, user, router, toast])

  const handleEndSession = () => {
    if (socket && user) {
      if (role === 'teacher') {
        socket.emit('end-session', classroomId)
      } else {
        socket.emit('leave-room', classroomId, user.username)
      }
      socket.disconnect()
    }
    router.push('/classrooms')
  }

  // Modify the loading state render
  if (role === 'student' && isCheckingSession) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <p className='text-lg text-gray-600'>
          {isCheckingSession ? 'Checking session status...' : 'Loading...'}
        </p>
        <p className='text-sm text-gray-400'>
          {isCheckingSession
            ? `Timeout in ${Math.ceil(SESSION_CHECK_TIMEOUT / 1000)}s`
            : ''}
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <div className='text-red-500 mb-4'>Error: {error}</div>
        <Button onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  // No active session state (for students)
  if (!isActiveSession && role === 'student') {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Card className='w-96'>
          <CardContent className='pt-6 text-center'>
            <h2 className='text-xl font-semibold mb-4'>No Active Session</h2>
            <p className='text-gray-600 mb-6'>
              The teacher hasn't started the session yet. Please try again
              later.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main session view
  if (user && (isActiveSession || role === 'teacher')) {
    return (
      <SessionView
        username={user.username}
        classroomId={classroomId}
        onEndSession={handleEndSession}
        socket={socket}
        role={role === 'student' ? 'student' : 'teacher'}
      />
    )
  }
}

export default ClassroomPage
