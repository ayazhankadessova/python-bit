'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionView } from '@/components/session-view'
import io, { Socket } from 'socket.io-client'
import { User } from '@/models/types'

interface ClassroomPageProps {
  params: {
    id: string
  }
}

const ClassroomPage: React.FC<ClassroomPageProps> = ({ params }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const username = searchParams.get('username')
  const role = searchParams.get('role')
  const classroomId = params.id

  // Separate user fetching effect
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)

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

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Error fetching user data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router]) // Only depend on router

  // Separate socket connection effect
  useEffect(() => {
    if (!user) return // Don't create socket connection until we have user data

    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to socket server')
      newSocket.emit(
        'join-room',
        classroomId,
        user.username,
        role === 'teacher'
      )
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setError('Failed to connect to the classroom. Please try again.')
    })

    return () => {
      console.log('Disconnecting socket')
      newSocket.disconnect()
    }
  }, [classroomId, role, user]) // Only depend on necessary values

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

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <div className='text-red-500 mb-4'>Error: {error}</div>
        <button
          onClick={() => router.push('/classrooms')}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Return to Classrooms
        </button>
      </div>
    )
  }

  if (isLoading || !user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Loading...
      </div>
    )
  }

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

export default ClassroomPage
