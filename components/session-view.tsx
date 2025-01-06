import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TeacherSessionView } from './session-views/TeacherSessionView'
import { StudentSessionView } from './session-views/StudentSessionView'
// import { useWebSocket } from '@/hooks/websocket/useWebSocket'

interface SessionViewProps {
  classroomId: string
  onEndSession: () => void
}

export function SessionView({ classroomId, onEndSession }: SessionViewProps) {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'

  // const { isConnected, sendMessage, on } = useWebSocket(
  //   classroomId,
  //   user?.uid,
  //   isTeacher
  // )

  if (!user) return null

  // const props = {
  //   classroomId,
  //   onEndSession,
  //   isConnected,
  //   sendMessage,
  //   on,
  // }

  return isTeacher ? (
    <TeacherSessionView classroomId={classroomId} />
  ) : (
    <StudentSessionView classroomId={classroomId} />
  )
}
