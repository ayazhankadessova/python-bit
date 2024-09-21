'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionView } from '@/components/session-view'
import io from 'socket.io-client'

export default function ClassroomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [socket, setSocket] = useState<any>(null)

  const sessionId = searchParams.get('session')
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
      newSocket.emit('join-room', classroomId, 'teacher-id', true)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      // Handle connection error (e.g., show a toast message)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [classroomId, sessionId, router])

  const handleEndSession = () => {
    if (socket) {
      socket.emit('leave-room', classroomId, 'teacher-id')
      socket.disconnect()
    }
    router.push('/classrooms')
  }

  if (!sessionId) {
    return <div>Loading...</div>
  }

  return (
    <SessionView
      teacherName='Teacher Name' // You might want to fetch this from an API or context
      classroomId={classroomId}
      onEndSession={handleEndSession}
      socket={socket}
    />
  )
}
