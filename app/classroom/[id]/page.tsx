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
  const [retryCount, setRetryCount] = useState(0) // Add retry counter

  const username = searchParams.get('username')
  const role = searchParams.get('role')
  const classroomId = params.id

  const handleRetryConnection = () => {
    setIsCheckingSession(true)
    setError(null)
    setIsActiveSession(false)
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
    // Instead of router.refresh(), increment retry counter
    setRetryCount((prev) => prev + 1)
  }

  // Fetch user data
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

  // Socket connection with delayed session check
  // Socket connection with delayed session check
  useEffect(() => {
    if (!user) return

    let statusCheckTimeout: NodeJS.Timeout
    let connectionAttemptTimeout: NodeJS.Timeout

    const connectSocket = async () => {
      try {
        setIsCheckingSession(true)

        // Clear any existing socket
        if (socket) {
          socket.disconnect()
          setSocket(null)
        }

        const newSocket = io('http://localhost:3000')
        setSocket(newSocket)

        // Set a timeout for session check
        statusCheckTimeout = setTimeout(() => {
          setIsCheckingSession(false)
          if (role === 'student') {
            setError('Connection timeout. Please try again.')
          }
        }, SESSION_CHECK_TIMEOUT)

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
              setError('No active session found')
            }
          }
        )

        newSocket.on('connect_error', (error) => {
          clearTimeout(statusCheckTimeout)
          console.error('Socket connection error:', error)
          setError('Failed to connect. Please try again.')
          setIsCheckingSession(false)
        })

        newSocket.on('error', (error) => {
          clearTimeout(statusCheckTimeout)
          console.error('Socket error:', error)
          setError(error)
          setIsCheckingSession(false)
        })
      } catch (error) {
        clearTimeout(statusCheckTimeout)
        setError('Connection failed. Please try again.')
        setIsCheckingSession(false)
      }
    }

    // Add a small delay before attempting connection
    connectionAttemptTimeout = setTimeout(connectSocket, 500)

    return () => {
      clearTimeout(statusCheckTimeout)
      clearTimeout(connectionAttemptTimeout)
      if (socket) {
        socket.disconnect()
      }
    }
  }, [classroomId, role, user, retryCount]) // Add retryCount to dependencies

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
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Card className='w-96'>
          <CardContent className='pt-6 text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>
              Checking Session Status
            </h2>
            <p className='text-gray-600 mb-4'>
              Attempting to connect to the classroom...
            </p>
            <p className='text-sm text-gray-400 mb-6'>
              Timeout in {Math.ceil(SESSION_CHECK_TIMEOUT / 1000)}s
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              variant='outline'
              className='w-full'
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Card className='w-96'>
          <CardContent className='pt-6 text-center'>
            <h2 className='text-xl font-semibold mb-4'>Connection Error</h2>
            <p className='text-red-500 mb-6'>{error}</p>
            <div className='space-y-3'>
              <Button
                onClick={handleRetryConnection}
                className='w-full mb-2'
                variant='default'
              >
                <Loader2 className='mr-2 h-4 w-4' />
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className='w-full'
                variant='outline'
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
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
              The teacher hasn't started the session yet.
            </p>
            <div className='space-y-3'>
              <Button
                onClick={handleRetryConnection}
                className='w-full mb-2'
                variant='default'
              >
                <Loader2 className='mr-2 h-4 w-4' />
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className='w-full'
                variant='outline'
              >
                Return to Dashboard
              </Button>
            </div>
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

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Loader2 className='h-8 w-8 animate-spin' />
    </div>
  )
}

export default ClassroomPage
