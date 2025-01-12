import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  FirestoreError,
  where,
  limit,
  arrayUnion,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import type { LiveSession } from '@/types/classrooms/live-session'
import { formatDate, calculateDuration } from '@/lib/utils'

interface SessionManagementProps {
  classroomId: string
  isTeacher: boolean
}

interface SessionWithDuration extends LiveSession {
  duration?: string
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  classroomId,
  isTeacher,
}) => {
  const { user } = useAuth()
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<SessionWithDuration[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsRef = collection(
          fireStore,
          `classrooms/${classroomId}/sessions`
        )

        // Active session listener
        const activeSessionQuery = query(
          sessionsRef,
          where('endedAt', '==', null),
          orderBy('startedAt', 'desc'),
          limit(1)
        )

        const unsubscribeActive = onSnapshot(
          activeSessionQuery,
          (snapshot) => {
            if (!snapshot.empty) {
              const sessionData = snapshot.docs[0].data() as Omit<
                LiveSession,
                'id'
              >
              setActiveSession({
                id: snapshot.docs[0].id,
                ...sessionData,
              })
            } else {
              setActiveSession(null)
            }
            setIsLoading(false)
          },
          (error) => {
            console.error('Error listening to active session:', error)
            setError(error.message)
            setIsLoading(false)
          }
        )

        // Session history listener
        const historyQuery = query(
          sessionsRef,
          orderBy('endedAt', 'desc'),
          // limit(10)
        )

        const unsubscribeHistory = onSnapshot(
          historyQuery,
          (snapshot) => {
            const sessions = snapshot.docs.map((doc) => {
              const data = doc.data() as Omit<LiveSession, 'id'>
              return {
                id: doc.id,
                ...data,
                duration: calculateDuration(data.startedAt, data.endedAt),
              }
            })
            setSessionHistory(sessions)
          },
          (error) => {
            console.error('Error listening to session history:', error)
          }
        )

        return () => {
          unsubscribeActive()
          unsubscribeHistory()
        }
      } catch (err) {
        const firebaseError = err as FirestoreError
        setError(firebaseError.message)
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [classroomId])

  const createSession = async () => {
    if (activeSession) {
      setError('A session is already in progress')
      return
    }

    try {
      setIsLoading(true)
      const sessionRef = collection(
        fireStore,
        `classrooms/${classroomId}/sessions`
      )

      const newSession: Omit<LiveSession, 'id'> = {
        startedAt: Date.now(),
        endedAt: null,
        weekNumber: 1,
        activeTask: '',
        students: {},
        activeStudents: [],
      }

      await addDoc(sessionRef, newSession)
      setError(null)
    } catch (err) {
      const firebaseError = err as FirestoreError
      setError(firebaseError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const endSession = async () => {
    if (!activeSession) return

    try {
      setIsLoading(true)
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions/${activeSession.id}`
      )
      await updateDoc(sessionRef, {
        endedAt: Date.now(),
      })
      setError(null)
    } catch (err) {
      const firebaseError = err as FirestoreError
      setError(firebaseError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const joinSession = async () => {
    if (!activeSession) return

    try {
      setIsLoading(true)

      if (!isTeacher) {
        const sessionRef = doc(
          fireStore,
          `classrooms/${classroomId}/sessions/${activeSession.id}`
        )

        await updateDoc(sessionRef, {
          activeStudents: arrayUnion(user?.displayName),
          [`students.${user?.displayName}`]: {
            currentTask: activeSession.activeTask || '',
            joinedAt: Date.now(),
            progress: [],
          },
        })
      }

      router.push(`/classrooms/${classroomId}/session/${activeSession.id}`)
    } catch (err) {
      console.error('Error joining session:', err)
      setError('Failed to join session')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {error && (
        <Alert variant='destructive'>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <div className='space-y-4'>
              <div>
                <h4 className='text-green-600 font-medium'>
                  Session in progress
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Started {formatDate(activeSession.startedAt)}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Duration: {calculateDuration(activeSession.startedAt, null)}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Week: {activeSession.weekNumber}
                </p>
                {activeSession.activeTask && (
                  <p className='text-sm text-muted-foreground'>
                    Current Task: {activeSession.activeTask}
                  </p>
                )}
              </div>

              <div className='space-x-4'>
                <Button onClick={joinSession} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : null}
                  Join Session
                </Button>

                {isTeacher && (
                  <Button
                    onClick={endSession}
                    disabled={isLoading}
                    variant='destructive'
                  >
                    {isLoading ? (
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    ) : null}
                    End Session
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <p className='text-muted-foreground'>No Active Session</p>
              {isTeacher && (
                <Button onClick={createSession} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : null}
                  Start New Session
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>History of past sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionHistory.length === 0 ? (
            <p className='text-muted-foreground'>No previous sessions</p>
          ) : (
            <div className='space-y-2'>
              {sessionHistory.map((session) => (
                <div
                  key={session.id}
                  className='p-4 rounded-lg border bg-card hover:bg-accent transition-colors'
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <h4 className='font-medium'>
                        Week {session.weekNumber} -{' '}
                        {formatDate(session.startedAt)}
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        {formatDate(session.startedAt)} -{' '}
                        {session.endedAt
                          ? formatDate(session.endedAt)
                          : 'In Progress'}
                      </p>
                      {session.activeTask && (
                        <p className='text-sm text-muted-foreground'>
                          Task: {session.activeTask}
                        </p>
                      )}
                    </div>
                    <span className='text-sm font-medium text-muted-foreground'>
                      {session.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionManagement
