import React, { useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { LogOut } from 'lucide-react'
import type { LiveSession, Assignment } from '@/types/classrooms/live-session'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { formatCode } from '@/lib/utils'
import { PythonEditor } from '@/components/session-views/live-session-code-editor'
import { useAuth } from '@/contexts/AuthContext'
import { handleAssignmentCompletion } from '@/lib/live-classroom/utils'
import { ActiveStudent } from '@/types/classrooms/live-session'

interface TeacherSessionViewProps {
  classroomId: string
  onEndSession: () => void
  sessionId: string
}


export function StudentSessionView({
  classroomId,
  sessionId,
  onEndSession,
}: TeacherSessionViewProps): JSX.Element {
  const { user } = useAuth()
  const { toast } = useToast()
  const [studentCode, setStudentCode] = useState<string>('')
  const [students, setStudents] = useState<ActiveStudent[]>([])
  const [output, setOutput] = useState<string>('')
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState<number | null>(null)
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(
    null
  )
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const [editorInitialCode, setEditorInitialCode] = useState<string>('')

  const handleUpdateCode = useCallback(async (): Promise<void> => {
    if (!currentSession || !user?.uid) return
    try {
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions/${sessionId}`
      )
      const now = Date.now()

      // Update student's code and lastUpdated timestamp
      await updateDoc(sessionRef, {
        [`students.${user.uid}`]: {
          code: studentCode,
          lastUpdated: now,
          submissions: currentSession.students[user.uid]?.submissions || [],
          displayName:
            user.displayName || user.email?.split('@')[0] || user.uid,
        },
      })

      toast({
        title: 'Code Updated',
        description: 'Your code has been updated for the teacher to see.',
      })
    } catch (error) {
      console.error('Error updating code:', error)
      toast({
        title: 'Error',
        description: 'Failed to update code',
        variant: 'destructive',
      })
    }
  }, [
    classroomId,
    sessionId,
    studentCode,
    currentSession,
    user?.uid,
    user?.displayName,
    user?.email,
    toast,
  ])

  // Listen to specific session using sessionId
  useEffect(() => {
    if (!sessionId || !classroomId) return

    const sessionRef = doc(
      fireStore,
      `classrooms/${classroomId}/sessions/${sessionId}`
    )

    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data() as Omit<LiveSession, 'id'>
        const session: LiveSession = {
          id: doc.id,
          ...sessionData,
        }
        setCurrentSession(session)

        // Set current problem based on active task
        if (session.activeTask) {
          setSelectedAssignmentId(session.activeTask)
        }

        if (session.weekNumber) {
          setCurrentWeek(session.weekNumber)
        }

        if (user?.uid && session.students?.[user.uid]) {
          const studentData = session.students[user.uid]
          setStudentCode(studentData.code)
          // Only set initial code if student has code
          if (studentData.code) {
            setEditorInitialCode(studentData.code)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [sessionId, classroomId, user?.displayName, user?.uid])

  // Fetch assignment when selected
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!selectedAssignmentId) return

      try {
        const assignmentDoc = await getDoc(
          doc(fireStore, 'assignments', selectedAssignmentId)
        )

        if (assignmentDoc.exists()) {
          const assignmentData = assignmentDoc.data() as Assignment
          setCurrentAssignment(assignmentData)

          // Only set initial code if student has no code
          if (!studentCode) {
            const formattedStarterCode = formatCode(assignmentData.starterCode)
            setEditorInitialCode(formattedStarterCode)
            setStudentCode(formattedStarterCode)
          }
        }
      } catch (error) {
        console.error('Error fetching assignment:', error)
        toast({
          title: 'Error',
          description: 'Failed to load assignment',
          variant: 'destructive',
        })
      }
    }

    fetchAssignment()
  }, [selectedAssignmentId, studentCode, toast])

  useEffect(() => {
    const sessionRef = doc(
      fireStore,
      `classrooms/${classroomId}/sessions/${sessionId}`
    )

    const unsubscribe = onSnapshot(
      sessionRef,
      (snapshot) => {
        setIsLoading(false)
        if (snapshot.exists()) {
          const sessionData = snapshot.data() as Omit<LiveSession, 'id'>
          const session: LiveSession = {
            id: snapshot.id,
            ...sessionData,
          }
          setCurrentSession(session)

          setStudents(sessionData.activeStudents)
        } else {
          setCurrentSession(null)
          setError('Session not found')
        }
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [classroomId, sessionId])

  const leaveSession = async () => {
    try {
      if (!user?.displayName || !currentSession) return

      setIsLoading(true)
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions/${sessionId}`
      )

      await updateDoc(sessionRef, {
        activeStudents: currentSession.activeStudents.filter(
          (student) => student.displayName !== user.displayName
        ),
      })

      toast({
        title: 'Session Left',
        description: 'You have successfully left the session.',
      })
      onEndSession() // Call the provided callback
    } catch (error) {
      console.error('Error leaving session:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to leave session'
      )
      toast({
        title: 'Error',
        description: 'Failed to leave session',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunCode = async (isSubmission: boolean) => {
    setError(null)
    setOutput('')
    setIsCorrect(null)

    const code = studentCode
    const id = currentAssignment?.id
    try {
      const requestPayload = {
        code: code,
        assignment_id: id,
      }

      const endpoint = isSubmission
        ? '/api/py/test-assignment'
        : '/api/py/execute'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      const data = await response.json()

      setOutput(data.output)
      setError(data.error ? data.output : null)

      if (isSubmission) {
        setIsCorrect(data.success)
      }

      if (user && id && isSubmission && code) {
        handleUpdateCode()
        await handleAssignmentCompletion(user, id, code, data.success)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      if (isSubmission) {
        setIsCorrect(false)
      }
    }
  }

  return (
    <div className='h-screen flex flex-col xl:px-12 lg:px-8 md:px-4 sm:px-4 pt-8 mb-16'>
      {/* Top Navigation Bar */}
      <nav className='border-b px-4 py-2 shrink-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            {currentWeek && (
              <div className='text-sm text-muted-foreground'>
                Week {currentWeek}
              </div>
            )}

            {currentAssignment && (
              <div className='text-sm font-normal'>
                Current Task: {currentAssignment.title}
              </div>
            )}

            {/* <MonitoringIndicator state={monitoringState} /> */}
          </div>

          <Button
            variant='softTeal'
            size='sm'
            disabled={isLoading}
            onClick={leaveSession}
          >
            <LogOut className='mr-2 h-4 w-4' />
            {isLoading ? 'Leaving Session...' : 'Leave Session'}
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Panel - Single scrollbar for entire content */}
        <div className='w-[45%] border-r flex flex-col h-full'>
          {/* Problem Description - Fixed height with scroll */}
          <div className='flex-1 overflow-y-auto p-4 max-h-[calc(60vh)]'>
            {currentAssignment && (
              <div className='prose dark:prose-invert max-w-none'>
                <h1 className='text-xl mb-4'>
                  {currentAssignment.title}
                </h1>
                <MarkdownRenderer
                  content={currentAssignment.problemStatement}
                />
              </div>
            )}
          </div>

          {/* Connected Students - Always visible */}
          <div className='border-t bg-muted/50 p-4 max-h-[40vh] flex flex-col'>
            <h3 className='font-semibold mb-3'>Your Classmates</h3>
            <div className='space-y-2 overflow-y-auto flex-1'>
              {students.map((student) => (
                <Card
                  key={student.uid}
                  className={`cursor-pointer hover:bg-accent transition-colors ${'border-softBlue bg-accent'}`}
                >
                  <CardHeader className='py-2 px-3'>
                    <CardTitle className='text-sm'>
                      {student.displayName === user?.displayName
                        ? 'Me'
                        : student.displayName}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className='flex-1'>
          <PythonEditor
            initialCode={editorInitialCode}
            onCodeChange={setStudentCode} 
            onRunCode={() => handleRunCode(false)}
            onSubmitCode={() => handleRunCode(true)}
            isTeacher={false} 
            onUpdateCode={handleUpdateCode} 
            output={output}
            error={error}
            isCorrect={isCorrect}
            title={currentAssignment?.title}
          />
        </div>
      </div>
    </div>
  )
}
