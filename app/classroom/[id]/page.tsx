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

  const sessionId = searchParams.get('session')
  const role = searchParams.get('role')
  const username = searchParams.get('username')
  const classroomId = params.id

  useEffect(() => {
    const fetchUserData = async () => {
      if (username) {
        try {
          const response = await fetch(`/api/users/${username}`)
          if (response.ok) {
            const userData: User = await response.json()
            console.log('Fetched user data:', userData)
            setUser(userData)
          } else {
            const errorData = await response.json()
            console.error('Failed to fetch user data:', errorData)
            setError(`Failed to fetch user data: ${errorData.message}`)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setError('Error fetching user data. Please try again.')
        }
      } else {
        console.error('No username provided')
        console.log(username)
        setError('No username provided. Unable to fetch user data.')
      }
    }

    fetchUserData()

    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to socket server')
      if (role === 'teacher') {
        newSocket.emit('join-room', classroomId, username, true)
      } else if (role === 'student') {
        newSocket.emit('join-room', classroomId, username, false)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setError('Failed to connect to the classroom. Please try again.')
    })

    newSocket.on('session-ended', () => {
      console.log('Session ended by teacher')
      router.push('/classrooms')
    })

    return () => {
      newSocket.disconnect()
    }
  }, [classroomId, sessionId, router, role, username])

  const handleEndSession = () => {
    if (socket) {
      if (role === 'teacher') {
        socket.emit('end-session', classroomId)
      } else {
        socket.emit('leave-room', classroomId, username)
      }
      socket.disconnect()
    }
    router.push('/classrooms')
  }

  if (error) {
    return <div className='text-red-500'>Error: {error}</div>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <SessionView
      userName={username}
      classroomId={classroomId}
      onEndSession={handleEndSession}
      socket={socket}
      role={role === 'student' ? 'student' : 'teacher'}
      username={username}
    />
  )
}

export default ClassroomPage
