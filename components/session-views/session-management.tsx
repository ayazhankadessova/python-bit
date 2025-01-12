import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, CalendarDays, Clock } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  FirestoreError,
  arrayUnion,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import type { LiveSession } from '@/types/classrooms/live-session'
import { formatDate, calculateDuration } from '@/lib/utils'
import { useSessions } from '@/hooks/classroom/sessions/useSessions'

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
  // const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  // const [sessionHistory, setSessionHistory] = useState<SessionWithDuration[]>(
  //   []
  // )
  // const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [sortMethod, setSortMethod] = useState('newest')
  const router = useRouter()

  const { activeSession, sessionHistory, isLoading, error } =
    useSessions(classroomId)

  // Filter and sort sessions
  const filteredSessions = sessionHistory.filter((session) => {
    const searchLower = searchText.toLowerCase()
    const weekMatch = session.weekNumber.toString().includes(searchLower)
    const taskMatch = session.activeTask?.toLowerCase().includes(searchLower)
    return searchText === '' || weekMatch || taskMatch
  })

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortMethod === 'newest') {
      return b.startedAt - a.startedAt
    } else {
      return a.weekNumber - b.weekNumber
    }
  })

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
          // Add student to activeStudents array
          activeStudents: arrayUnion(user?.displayName),
          // Store student details in students object
          [`students.${user?.displayName}`]: {
            code: '',
            lastUpdated: Date.now(),
            submissions: [],
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
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>History of past sessions</CardDescription>
            </div>
            <Select onValueChange={setSortMethod} value={sortMethod}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Sort By' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='newest'>
                    <div className='flex items-center'>
                      <CalendarDays className='mr-2 h-4 w-4' />
                      Newest first
                    </div>
                  </SelectItem>
                  <SelectItem value='week'>
                    <div className='flex items-center'>
                      <Clock className='mr-2 h-4 w-4' />
                      By week
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className='mt-4'>
            <Input
              type='text'
              placeholder='Search by week or task...'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className='max-w-sm'
            />
          </div>
        </CardHeader>
        <CardContent>
          {sortedSessions.length === 0 ? (
            <p className='text-muted-foreground'>No sessions found</p>
          ) : (
            <div className='space-y-2'>
              {sortedSessions.map((session) => (
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
