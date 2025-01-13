import React from 'react'
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
import { useSessionActions } from '@/hooks/classroom/sessions/useSessionActions'
import { formatDate, calculateDuration } from '@/lib/utils'
import { useSessions } from '@/hooks/classroom/sessions/useSessions'
import { useSessionFiltering, SortMethod } from '@/hooks/classroom/sessions/useSessionFiltering'
import { useToast } from '@/hooks/use-toast'

interface SessionManagementProps {
  classroomId: string
  isTeacher: boolean
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  classroomId,
  isTeacher,
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const { activeSession, sessionHistory, isLoading, error } =
    useSessions(classroomId)

  const {
    searchText,
    setSearchText,
    sortMethod,
    setSortMethod,
    filteredAndSortedSessions,
  } = useSessionFiltering(sessionHistory)

  const { createSession, endSession, joinSession } = useSessionActions(
    classroomId,
    user?.displayName,
    isTeacher
  )

  const handleJoinSession = async () => {
    if (!activeSession) return
    const success = await joinSession(activeSession.id)
    if (success) {
      router.push(`/classrooms/${classroomId}/session/${activeSession.id}`)
    } else {
      toast({
        title: 'Error',
        description: 'Failed to join session',
        variant: 'destructive',
      })
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
          <AlertDescription>{error.message}</AlertDescription>
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
                <Button onClick={handleJoinSession} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : null}
                  Join Session
                </Button>

                {isTeacher && (
                  <Button
                    onClick={() => endSession(activeSession.id)}
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
            <Select
              onValueChange={(value) => setSortMethod(value as SortMethod)}
              value={sortMethod}
            >
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
          {sessionHistory.length === 0 ? (
            <p className='text-muted-foreground'>No sessions found</p>
          ) : (
            <div className='space-y-2'>
              {filteredAndSortedSessions.map((session) => (
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
