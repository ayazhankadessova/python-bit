import React, { useState, useEffect } from 'react'
import {
  doc,
  onSnapshot,
  getDoc,
  updateDoc
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { LogOut } from 'lucide-react'
import { WeekSelector } from './WeekSelector'
import type {
  LiveSession,
  SessionStudent,
  Curriculum,
  Week,
  Assignment,
} from '@/types/classrooms/live-session'
import { ClassroomTC } from '@/types/firebase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { formatCode } from '@/lib/utils'
import { PythonEditor } from '@/components/session-views/live-session-code-editor'
import { useAuth } from '@/contexts/AuthContext'

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
  const [teacherCode, setTeacherCode] = useState<string>('')
  const [students, setStudents] = useState<
    Array<{ username: string } & SessionStudent>
  >([])
  const [output, setOutput] = useState<string>('')
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classroom, setClassroom] = useState<ClassroomTC | null>(null)
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null)
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(
    null
  )
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const [editorInitialCode, setEditorInitialCode] = useState<string>('')

  // Add this effect to manage the editor's initial code
  useEffect(() => {
    if (studentCode) {
      setEditorInitialCode(studentCode)
    } else if (currentAssignment?.starterCode) {
      setEditorInitialCode(formatCode(currentAssignment.starterCode))
    } else {
      setEditorInitialCode('') // Fallback empty string
    }
  }, [studentCode, currentAssignment])

  useEffect(() => {
    const fetchClassroomAndCurriculum = async () => {
      try {
        // Fetch classroom data first
        const classroomDoc = await getDoc(
          doc(fireStore, 'classrooms', classroomId)
        )

        if (!classroomDoc.exists()) {
          throw new Error('Classroom not found')
        }

        const classroomData = classroomDoc.data() as ClassroomTC
        setClassroom(classroomData)

        // Make sure curriculumId exists
        if (!classroomData.curriculumId) {
          throw new Error('No curriculum assigned to this classroom')
        }

        // Fetch curriculum using the classroom's curriculumId
        const curriculumDoc = await getDoc(
          doc(fireStore, 'curricula', classroomData.curriculumId)
        )

        if (!curriculumDoc.exists()) {
          throw new Error('Curriculum not found')
        }

        const curriculumData = curriculumDoc.data() as Curriculum
        setCurriculum(curriculumData)

        // Set initial week based on lastTaughtWeek
        const initialWeek = curriculumData.weeks.find(
          (week) => week.weekNumber === classroomData.lastTaughtWeek
        )

        if (initialWeek) {
          setCurrentWeek(initialWeek)
          if (initialWeek.assignmentIds.length > 0) {
            setSelectedAssignmentId(initialWeek.assignmentIds[0])
          }
        } else {
          // If no matching week is found, default to the first week
          if (curriculumData.weeks.length > 0) {
            setCurrentWeek(curriculumData.weeks[0])
            if (curriculumData.weeks[0].assignmentIds.length > 0) {
              setSelectedAssignmentId(curriculumData.weeks[0].assignmentIds[0])
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to load data',
          variant: 'destructive',
        })
      }
    }

    if (classroomId) {
      fetchClassroomAndCurriculum()
    }
  }, [classroomId, toast])

  // Fetch assignment when selected
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!selectedAssignmentId) {
        console.log('No selectedAssignmentId, skipping fetch')
        return
      }

      try {
        const assignmentDoc = await getDoc(
          doc(fireStore, 'assignments', selectedAssignmentId)
        )

        if (assignmentDoc.exists()) {
          const assignmentData = assignmentDoc.data() as Assignment
          setCurrentAssignment(assignmentData)
          setTeacherCode(formatCode(assignmentData.starterCode))
        } else {
          console.log('Assignment document does not exist')
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
  }, [selectedAssignmentId, toast])

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

          // Update students directly from session data
          const studentArray = Object.entries(sessionData.students).map(
            ([username, info]) => ({
              username,
              ...info,
            })
          )
          setStudents(studentArray)
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

  // const leaveSession = async () => {
  //   try {
  //     setIsLoading(true)
  //     const sessionRef = doc(
  //       fireStore,
  //       `classrooms/${classroomId}/sessions/${sessionId}`
  //     )
  //     await updateDoc(sessionRef, {
  //       endedAt: Date.now(),
  //     })
  //     toast({
  //       title: 'Session Ended',
  //       description: 'The session has been successfully ended.',
  //     })
  //     onEndSession() // Call the provided callback
  //   } catch (err) {
  //     const firebaseError = err as FirestoreError
  //     setError(firebaseError.message)
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to end session',
  //       variant: 'destructive',
  //     })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const handleUpdateCode = async (): Promise<void> => {
    if (!currentSession || !user?.displayName) return

    try {
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions/${sessionId}`
      )
      const now = Date.now()

      // Update student's code and lastUpdated timestamp
      await updateDoc(sessionRef, {
        [`students.${user.displayName}`]: {
          code: studentCode,
          lastUpdated: now,
          submissions:
            currentSession.students[user.displayName]?.submissions || [],
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

      // Set output and error states
      setOutput(data.output)
      setError(data.error ? data.output : null)

      // Set correctness for submissions
      if (isSubmission) {
        setIsCorrect(data.success)
      }

      // Handle exercise completion
      //   if (user && isSubmission && !isProject && code) {
      //     await handleExerciseSubmission(
      //       user,
      //       tutorial_id,
      //       exercise_number,
      //       data.success,
      //       code
      //     )
      //     // In any component
      //     await invalidateTutorialProgress(user.uid, tutorial_id)
      //   }

      //   if (user && !isSubmission && !isProject && code) {
      //     await handleExerciseRun(user, tutorial_id)
      //   }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      if (isSubmission) {
        setIsCorrect(false)
      }
    }
  }

  return (
    <div className='h-screen flex flex-col'>
      {/* Top Navigation Bar */}
      <nav className='border-b px-4 py-2 bg-background shrink-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            {classroom && curriculum && (
              <WeekSelector
                selectedWeek={currentWeek?.weekNumber || 1}
                totalWeeks={curriculum?.weeks.length ?? 1}
              />
            )}

            {currentWeek && currentWeek.assignmentIds.length > 0 && (
              <Select
                value={selectedAssignmentId ?? undefined}
                // onValueChange={handleAssignmentSelect}
              >
                <SelectTrigger className='w-[300px]'>
                  <SelectValue placeholder='Select an assignment' />
                </SelectTrigger>
                <SelectContent>
                  {currentWeek.assignmentIds.map((assignmentId) => (
                    <SelectItem key={assignmentId} value={assignmentId}>
                      {assignmentId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            // onClick={endSession}
            variant='destructive'
            size='sm'
            disabled={isLoading}
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
                <h1 className='text-xl font-bold mb-4'>
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
                  key={student.username}
                  className={`cursor-pointer hover:bg-accent transition-colors ${'border-softBlue bg-accent'}`}
                >
                  <CardHeader className='py-2 px-3'>
                    <CardTitle className='text-sm'>
                      {student.username === user?.displayName
                        ? 'Me'
                        : student.username}
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
            onCodeChange={setStudentCode} // Change this from setTeacherCode to setStudentCode
            onRunCode={() => handleRunCode(false)}
            onSubmitCode={() => handleRunCode(true)}
            isTeacher={false} // Make sure this is false for students
            onUpdateCode={handleUpdateCode} // Pass the update handler
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
