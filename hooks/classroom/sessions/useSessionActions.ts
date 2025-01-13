// hooks/useSessionActions.ts
import { useState } from 'react'
import { FirestoreError } from 'firebase/firestore'
import { sessionsService } from '@/lib/firebase/sessions'
import type { LiveSession } from '@/types/classrooms/live-session'

interface UseSessionActionsReturn {
  createSession: () => Promise<boolean>
  endSession: (sessionId: string) => Promise<boolean>
  joinSession: (sessionId: string) => Promise<boolean>
  deleteSession: (sessionId: string) => Promise<boolean>
  isLoadingActions: {
    createSession: boolean
    endSession: boolean
    joinSession: boolean
    deleteSession: boolean
  }
  error: string | null
}

export function useSessionActions(
  classroomId: string,
  username: string | undefined,
  isTeacher: boolean
): UseSessionActionsReturn {
  const [isLoadingCreateSession, setIsLoadingCreateSession] = useState(false)
  const [isLoadingEndSession, setIsLoadingEndSession] = useState(false)
  const [isLoadingJoinSession, setIsLoadingJoinSession] = useState(false)
  const [isLoadingDeleteSession, setIsLoadingDeleteSession] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = async (): Promise<boolean> => {
    if (!isTeacher) {
      setError('Only teachers can create sessions')
      return false
    }

    try {
      setIsLoadingCreateSession(true)
      setError(null)

      const newSession: Omit<LiveSession, 'id'> = {
        startedAt: Date.now(),
        endedAt: null,
        weekNumber: 1,
        activeTask: '',
        students: {},
        activeStudents: [],
      }

      await sessionsService.createSession(classroomId, newSession)
      return true
    } catch (err) {
      const error = err as FirestoreError
      setError(error.message)
      return false
    } finally {
      setIsLoadingCreateSession(false)
    }
  }

  const endSession = async (sessionId: string): Promise<boolean> => {
    if (!isTeacher) {
      setError('Only teachers can end sessions')
      return false
    }

    try {
      setIsLoadingEndSession(true)
      setError(null)

      await sessionsService.endSession(classroomId, sessionId)
      return true
    } catch (err) {
      const error = err as FirestoreError
      setError(error.message)
      return false
    } finally {
      setIsLoadingEndSession(false)
    }
  }

  const joinSession = async (sessionId: string): Promise<boolean> => {
    if (!username) {
      setError('User not authenticated')
      return false
    }

    try {
      setIsLoadingJoinSession(true)
      setError(null)

      if (!isTeacher) {
        await sessionsService.addStudentToSession(
          classroomId,
          sessionId,
          username
        )
      }
      return true
    } catch (err) {
      const error = err as FirestoreError
      setError('Failed to join session' + error)
      return false
    } finally {
      setIsLoadingJoinSession(false)
    }
  }

  const deleteSession = async (sessionId: string): Promise<boolean> => {
    if (!isTeacher) {
      setError('Only teachers can delete sessions')
      return false
    }

    try {
      setIsLoadingDeleteSession(true)
      setError(null)
      await sessionsService.deleteSession(classroomId, sessionId)
      return true
    } catch (err) {
      const error = err as FirestoreError
      setError(error.message)
      return false
    } finally {
      setIsLoadingDeleteSession(false)
    }
  }

  return {
    createSession,
    endSession,
    joinSession,
    deleteSession,
    isLoadingActions: {
      createSession: isLoadingCreateSession,
      endSession: isLoadingEndSession,
      joinSession: isLoadingJoinSession,
      deleteSession: isLoadingDeleteSession,
    },
    error,
  }
}
