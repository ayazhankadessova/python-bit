'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionView } from '@/components/session-view'
import io, { Socket } from 'socket.io-client'

interface ClassroomPageProps {
  params: { id: string }
}

const ClassroomPage: React.FC<ClassroomPageProps> = ({ params }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const sessionId = searchParams.get('session')
  const role = searchParams.get('role')
  const studentID = role === 'student' ? searchParams.get('id') : null
  const classroomId = params.id

  useEffect(() => {
    if (!sessionId) {
      router.push('/classrooms')
      return
    }

    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to socket server')
      if (role === 'teacher') {
        newSocket.emit('join-room', classroomId, 'teacher-id', true)
      } else if (role === 'student') {
        newSocket.emit('join-room', classroomId, studentID, false)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    newSocket.on('session-ended', () => {
      console.log('Session ended by teacher')
      router.push('/classrooms')
    })

    return () => {
      newSocket.disconnect()
    }
  }, [classroomId, sessionId, router, role, studentID])

  const handleEndSession = () => {
    if (socket) {
      if (role === 'teacher') {
        socket.emit('end-session', classroomId)
      } else {
        socket.emit('leave-room', classroomId, studentID)
      }
      socket.disconnect()
    }
    router.push('/classrooms')
  }

  if (!sessionId) {
    return <div>Loading...</div>
  }

  return (
    <SessionView
      teacherName={role === 'student' ? 'Student' : 'Teacher'}
      classroomId={classroomId}
      onEndSession={handleEndSession}
      socket={socket}
      role={role === 'student' ? 'student' : 'teacher'}
    />
  )
}

export default ClassroomPage
