// SessionView.tsx
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TeacherSessionView } from './session-views/TeacherSessionView'
import { StudentSessionView } from './session-views/StudentSessionView'
import { Socket } from 'socket.io-client'

interface SessionViewProps {
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
}

export function SessionView(props: SessionViewProps) {
  const { user } = useAuth()

  if (!user) return null

  return user.role === 'teacher' ? (
    <TeacherSessionView {...props} />
  ) : (
    <StudentSessionView {...props} />
  )
}

// types.ts
export interface WeeklyProgress {
  taskCompletions: {
    [taskId: string]: string[] // Array of user IDs who completed the task
  }
  activeSession?: boolean
  lastUpdated?: string
}

export interface Student {
  id: string
  displayName: string
  email: string
  currentCode?: string
  solvedProblems?: string[]
}
