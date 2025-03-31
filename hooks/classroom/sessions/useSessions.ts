import { useState, useEffect } from 'react'
import { sessionsService } from '@/lib/firebase/sessions'
import type { LiveSession, SessionWithDuration } from '@/types/classrooms/live-session'
import { calculateDuration } from '@/lib/utils'

export function useSessions(classroomId: string) {
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<SessionWithDuration[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribeActive = sessionsService.subscribeToActiveSession(
      classroomId,
      (session) => {
        setActiveSession(session)
        setIsLoading(false)
      },
      (error) => {
        setError(error)
        setIsLoading(false)
      }
    )

    const unsubscribeHistory = sessionsService.subscribeToSessionHistory(
      classroomId,
      (sessions) => {
        const sessionsWithDuration = sessions.map((session) => ({
          ...session,
          duration: calculateDuration(session.startedAt, session.endedAt),
        })) 
        setSessionHistory(sessionsWithDuration)
      },
      (error) => setError(error)
    )

    return () => {
      unsubscribeActive()
      unsubscribeHistory()
    }
  }, [classroomId])

  return {
    activeSession,
    sessionHistory,
    isLoading,
    error,
  }
}

  