// TeacherSessionView.tsx
import React, { useState, useEffect } from 'react'
import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
  getDoc,
  query,
  orderBy,
  where,
  limit,
  FirestoreError,
  serverTimestamp,
  UpdateData,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { useToast } from '@/hooks/use-toast'
import { Play, StopCircle, Send, RefreshCw, LogOut } from 'lucide-react'
import { WeekSelector } from './WeekSelector'
import type {
  LiveSession,
  SessionStudent,
  ExecutionResult,
  Curriculum,
  Week,
  Assignment,
} from '@/types/classrooms/live-session'
import { Problem } from '@/types/utils'
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

interface TeacherSessionViewProps {
  classroomId: string
  onEndSession: () => void
  sessionId: string
}

export function TeacherSessionView({
  classroomId,
  sessionId,
  onEndSession,
}: TeacherSessionViewProps): JSX.Element {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [studentCode, setStudentCode] = useState<string>('')
  const [teacherCode, setTeacherCode] = useState<string>('')
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<
    string | null
  >(null)
  const [students, setStudents] = useState<
    Array<{ username: string } & SessionStudent>
  >([])
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState<boolean>(false)
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
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const [editorInitialCode, setEditorInitialCode] = useState<string>('')

  // Add this effect to manage the editor's initial code
  useEffect(() => {
    if (selectedStudentUsername && studentCode) {
      setEditorInitialCode(studentCode)
    } else if (currentAssignment?.starterCode) {
      setEditorInitialCode(formatCode(currentAssignment.starterCode))
    } else {
      setEditorInitialCode('') // Fallback empty string
    }
  }, [selectedStudentUsername, studentCode, currentAssignment])

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
        console.log('Fetching assignment with ID:', selectedAssignmentId)
        const assignmentDoc = await getDoc(
          doc(fireStore, 'assignments', selectedAssignmentId)
        )

        if (assignmentDoc.exists()) {
          const assignmentData = assignmentDoc.data() as Assignment
          console.log('Assignment loaded:', assignmentData)
          console.log('Starter code:', assignmentData.starterCode)

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
    const sessionRef = collection(
      fireStore,
      `classrooms/${classroomId}/sessions`
    )
    const q = query(
      sessionRef,
      where('endedAt', '==', null),
      orderBy('startedAt', 'desc'),
      limit(1)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIsLoading(false)

        if (!snapshot.empty) {
          const sessionData = snapshot.docs[0].data() as Omit<LiveSession, 'id'>
          const session: LiveSession = {
            id: snapshot.docs[0].id,
            ...sessionData,
          }
          setCurrentSession(session)
        } else {
          setCurrentSession(null)
        }
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [classroomId])

  useEffect(() => {
    if (!currentSession) return

    const unsubscribe = onSnapshot(
      doc(fireStore, `classrooms/${classroomId}/sessions`, currentSession.id),
      (snapshot) => {
        const data = snapshot.data() as LiveSession
        setStudents(
          Object.entries(data.students).map(([username, info]) => ({
            username,
            ...info,
          }))
        )

        if (selectedStudentUsername && data.students[selectedStudentUsername]) {
          setTeacherCode(data.students[selectedStudentUsername].code)
        }
      }
    )

    return () => unsubscribe()
  }, [classroomId, currentSession?.id, selectedStudentUsername])

  const handleStudentSelect = async (
    studentUsername: string
  ): Promise<void> => {
    console.log('handleStudentSelect called with:', studentUsername)
    console.log('Current selectedStudentUsername:', selectedStudentUsername)

    // If clicking on already selected student, deselect them
    if (selectedStudentUsername === studentUsername) {
      console.log('Attempting to deselect student')
      setSelectedStudentUsername(null)
      console.log('Current assignment:', currentAssignment)
      if (currentAssignment) {
        console.log('Setting teacher code to starter code')
        setTeacherCode(formatCode(currentAssignment.starterCode))
      }
      return
    }

    // Otherwise, select the new student
    setSelectedStudentUsername(studentUsername)
    if (currentSession) {
      const sessionDoc = await getDoc(
        doc(fireStore, `classrooms/${classroomId}/sessions`, currentSession.id)
      )
      const data = sessionDoc.data() as LiveSession
      if (data.students[studentUsername]) {
        setStudentCode(data.students[studentUsername].code)
      }
    }
  }

  const endSession = async () => {
    try {
      setIsLoading(true)
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions/${sessionId}`
      )
      await updateDoc(sessionRef, {
        endedAt: Date.now(),
      })
      toast({
        title: 'Session Ended',
        description: 'The session has been successfully ended.',
      })
      onEndSession() // Call the provided callback
    } catch (err) {
      const firebaseError = err as FirestoreError
      setError(firebaseError.message)
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunCode = async (isSubmission: boolean) => {
    setIsExecuting(true)
    setError(null)
    setOutput('')
    setIsCorrect(null)

    if (isSubmission) {
      setIsSubmitting(true)
    } else {
      setIsRunning(true)
    }

    const code = selectedStudentUsername ? studentCode : teacherCode
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
    } finally {
      setIsExecuting(false)
      setIsSubmitting(false)
      setIsRunning(false)
    }
  }

  const handleSendCode = async (): Promise<void> => {
    if (!currentSession) return

    try {
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions`,
        currentSession.id
      )

      if (selectedStudentUsername) {
        await updateDoc(sessionRef, {
          [`students.${selectedStudentUsername}.code`]: teacherCode,
          [`students.${selectedStudentUsername}.lastUpdated`]:
            serverTimestamp(),
        })

        toast({
          title: 'Code Sent',
          description: `Code sent to ${selectedStudentUsername}`,
        })
      } else {
        // Use UpdateData type from Firestore
        const updates: UpdateData<LiveSession> = {}

        students.forEach((student) => {
          updates[`students.${student.username}.code`] = teacherCode
          updates[`students.${student.username}.lastUpdated`] =
            serverTimestamp()
        })

        await updateDoc(sessionRef, updates)

        toast({
          title: 'Code Broadcast',
          description: 'Code sent to all students',
        })
      }
    } catch (error) {
      console.error('Error sending code:', error)
      toast({
        title: 'Error',
        description: 'Failed to send code',
        variant: 'destructive',
      })
    }
  }

  const handleWeekSelect = async (weekNumber: number) => {
    if (!curriculum) return

    const selectedWeek = curriculum.weeks.find(
      (week) => week.weekNumber === weekNumber
    )
    if (!selectedWeek) return

    setCurrentWeek(selectedWeek)

    try {
      // Update classroom's lastTaughtWeek
      await updateDoc(doc(fireStore, 'classrooms', classroomId), {
        lastTaughtWeek: weekNumber,
        updatedAt: Date.now(),
      })

      // Update session's weekNumber and reset activeTask
      await updateDoc(
        doc(fireStore, `classrooms/${classroomId}/sessions/${sessionId}`),
        {
          weekNumber: weekNumber,
          activeTask: selectedWeek.assignmentIds[0] || '',
        }
      )

      // Set first assignment of the week as default
      if (selectedWeek.assignmentIds.length > 0) {
        setSelectedAssignmentId(selectedWeek.assignmentIds[0])
      }
    } catch (error) {
      console.error('Error updating week:', error)
      toast({
        title: 'Error',
        description: 'Failed to update week',
        variant: 'destructive',
      })
    }
  }

  const handleAssignmentSelect = async (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId)

    try {
      // Update session's activeTask
      await updateDoc(
        doc(fireStore, `classrooms/${classroomId}/sessions/${sessionId}`),
        {
          activeTask: assignmentId,
        }
      )
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to update assignment',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='h-screen flex'>
      {/* Left Panel: Students List and Week Selection */}
      <div className='w-1/4 border-r p-4 bg-gradient-to-r from-[hsl(var(--background-start))] to-[hsl(var(--background-end))]'>
        <div className='space-y-4'>
          {/* End Session Button */}
          <Button
            onClick={endSession}
            variant='destructive'
            className='w-full'
            disabled={isLoading}
          >
            <LogOut className='mr-2 h-4 w-4' />
            {isLoading ? 'Ending Session...' : 'End Session'}
          </Button>

          {/* Week Selector */}
          {classroom && curriculum && (
            <WeekSelector
              selectedWeek={currentWeek?.weekNumber || 1}
              totalWeeks={curriculum?.weeks.length ?? 1}
              onSelectWeek={handleWeekSelect}
            />
          )}

          {/* Assignment Selector */}
          {currentWeek && currentWeek.assignmentIds.length > 0 && (
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Select Assignment</label>
              <Select
                value={selectedAssignmentId ?? undefined}
                onValueChange={handleAssignmentSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select an assignment' />
                </SelectTrigger>
                <SelectContent>
                  {currentWeek.assignmentIds.map((assignmentId) => (
                    <SelectItem key={assignmentId} value={assignmentId}>
                      {currentAssignment?.title || assignmentId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <h1>{error}</h1>
          <h1>{classroom?.curriculumId}</h1>

          {/* Connected Students */}
          <div className='space-y-2 mt-4'>
            <h3 className='font-semibold'>Connected Students</h3>
            {students.map((student) => (
              <Card
                key={student.username}
                className={`cursor-pointer hover:bg-accent ${
                  selectedStudentUsername === student.username
                    ? 'border-primary'
                    : ''
                }`}
                onClick={() => handleStudentSelect(student.username)}
              >
                <CardHeader>
                  <CardTitle className='text-sm'>{student.username}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Assignment Content and Code Editor */}
      <div className='flex-1 flex flex-col p-4'>
        {currentAssignment && (
          <div className='mb-4'>
            <h2 className='text-xl font-bold mb-2'>
              {currentAssignment.title}
            </h2>

            <MarkdownRenderer content={currentAssignment.problemStatement} />
            {/* <div
              className='prose dark:prose-invert mb-4'
              dangerouslySetInnerHTML={{
                __html: currentAssignment.problemStatement,
              }}
            /> */}
          </div>
        )}

        {/* <CodeMirror
          value={selectedStudentUsername ? studentCode : teacherCode}
          height='calc(100vh - 300px)'
          theme={vscodeDark}
          extensions={[python()]}
          onChange={setTeacherCode}
        /> */}

        <PythonEditor
          initialCode={editorInitialCode}
          onCodeChange={setTeacherCode}
          onRunCode={() => handleRunCode(false)}
          onSubmitCode={() => handleRunCode(true)}
          onSendCode={handleSendCode}
          isTeacher={true}
          selectedStudent={selectedStudentUsername}
          output={output}
          error={error}
          isExecuting={isExecuting}
          isCorrect={isCorrect}
          title={currentAssignment?.title}
        />

        {/* <div className='mt-4 space-x-2'>
          <Button onClick={() => handleRunCode(false)} disabled={isExecuting}>
            {isRunning ? (
              <StopCircle className='mr-2 h-4 w-4' />
            ) : (
              <Play className='mr-2 h-4 w-4' />
            )}
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          <Button
            onClick={() => handleRunCode(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white'
            disabled={isExecuting}
          >
            {isSubmitting ? (
              <StopCircle className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Play className='w-4 h-4 mr-2' />
            )}
            Submit
          </Button>

          <Button onClick={handleSendCode}>
            <Send className='mr-2 h-4 w-4' />
            {selectedStudentUsername
              ? `Send to ${selectedStudentUsername}`
              : 'Send to All'}
          </Button>
        </div> */}

        {output && (
          <div className='mt-4 p-4 bg-black text-white font-mono rounded-md'>
            <pre>{output}</pre>
          </div>
        )}

        {isCorrect !== null && !error && (
          <div
            className={`mt-4 p-2 rounded ${
              isCorrect
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
            }`}
          >
            {isCorrect
              ? '✅ All tests passed!'
              : '❌ Some tests failed. Check the output above for details.'}
          </div>
        )}
      </div>
    </div>
  )
}
