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
  isLoading: boolean
  error: string | null
}

export function useSessionActions(
  classroomId: string,
  username: string | undefined,
  isTeacher: boolean
): UseSessionActionsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = async (): Promise<boolean> => {
    if (!isTeacher) {
      setError('Only teachers can create sessions')
      return false
    }

    try {
      setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  const endSession = async (sessionId: string): Promise<boolean> => {
    if (!isTeacher) {
      setError('Only teachers can end sessions')
      return false
    }

    try {
      setIsLoading(true)
      setError(null)

      await sessionsService.endSession(classroomId, sessionId)
      return true
    } catch (err) {
      const error = err as FirestoreError
      setError(error.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const joinSession = async (sessionId: string): Promise<boolean> => {
    if (!username) {
      setError('User not authenticated')
      return false
    }

    try {
      setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  const deleteSession = async (sessionId: string): Promise<boolean> => {
    if (!isTeacher) {
      setError('Only teachers can delete sessions')
      return false
    }

    try {
      setIsLoading(true)
      setError(null)
      await sessionsService.deleteSession(classroomId, sessionId)
      return true
    } catch (err) {
      const error = err as FirestoreError
      setError(error.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createSession,
    endSession,
    joinSession,
    deleteSession,
    isLoading,
    error,
  }
}
