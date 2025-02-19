// TeacherSessionView.tsx
import React, { useState, useEffect } from 'react'
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  FirestoreError,
  serverTimestamp,
  UpdateData,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { LogOut } from 'lucide-react'
import { WeekSelector } from './WeekSelector'
import {
  LiveSession,
  Curriculum,
  Week,
  Assignment,
  SessionStudent
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
import { ActiveStudent } from '@/types/classrooms/live-session'
import AssignmentProgress from '@/components/session-views/lesson-progress-card'

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
  const { toast } = useToast()
  const [studentCode, setStudentCode] = useState<string>('')
  const [teacherCode, setTeacherCode] = useState<string>('')
  const [selectedStudent, setSelectedStudent] = useState<ActiveStudent | null>(
    null
  )
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
  const [activeStudents, setActiveStudents] = useState<ActiveStudent[]>([])
   const [sessionStudents, setSessionStudents] = useState<
     Record<string, SessionStudent>
   >({})

  // Add this effect to manage the editor's initial code
  useEffect(() => {
    if (selectedStudent && studentCode) {
      setEditorInitialCode(studentCode)
    } else if (currentAssignment?.starterCode) {
      setEditorInitialCode(formatCode(currentAssignment.starterCode))
    } else {
      setEditorInitialCode('') // Fallback empty string
    }
  }, [selectedStudent, studentCode, currentAssignment])

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

        // after u choose initial week, if it exists set if in `classrooms/${classroomId}/sessions/${sessionId}` too
        // also set active task in `classrooms/${classroomId}/sessions/${sessionId}`

        if (initialWeek) {
          setCurrentWeek(initialWeek)
          // Set initial assignment if available
          const initialAssignmentId = initialWeek.assignmentIds[0] || null
          setSelectedAssignmentId(initialAssignmentId)

          // Update the session document with initial week and active task
          try {
            await updateDoc(
              doc(fireStore, `classrooms/${classroomId}/sessions/${sessionId}`),
              {
                weekNumber: initialWeek.weekNumber,
                activeTask: initialAssignmentId || '',
              }
            )
          } catch (error) {
            console.error('Error updating session with initial week:', error)
            toast({
              title: 'Warning',
              description: 'Failed to update session with initial week',
              variant: 'destructive',
            })
          }
        } else {
          // If no matching week is found, default to the first week
          if (curriculumData.weeks.length > 0) {
            const firstWeek = curriculumData.weeks[0]
            setCurrentWeek(firstWeek)
            const firstAssignmentId = firstWeek.assignmentIds[0] || null
            setSelectedAssignmentId(firstAssignmentId)

            // Update the session document with first week and active task
            try {
              await updateDoc(
                doc(
                  fireStore,
                  `classrooms/${classroomId}/sessions/${sessionId}`
                ),
                {
                  weekNumber: firstWeek.weekNumber,
                  activeTask: firstAssignmentId || '',
                }
              )
            } catch (error) {
              console.error('Error updating session with first week:', error)
              toast({
                title: 'Warning',
                description: 'Failed to update session with first week',
                variant: 'destructive',
              })
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

  // Update the session listener effect:
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
          setActiveStudents(sessionData.activeStudents)
          setSessionStudents(sessionData.students || {}) // Add fallback empty object

          // Update selected student's code if needed
          if (selectedStudent && sessionData.students[selectedStudent.uid]) {
            setStudentCode(sessionData.students[selectedStudent.uid].code)
            setTeacherCode(sessionData.students[selectedStudent.uid].code)
          }
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
  }, [classroomId, sessionId, selectedStudent])

  const handleStudentSelect = async (student: ActiveStudent): Promise<void> => {
    console.log('handleStudentSelect called with:', student)
    console.log('Current selectedStudentId:', selectedStudent)

    // If clicking on already selected student, deselect them
    if (selectedStudent?.uid === student.uid) {
      console.log('Attempting to deselect student')
      setSelectedStudent(null)
      if (currentAssignment) {
        console.log('Setting teacher code to starter code')
        setTeacherCode(formatCode(currentAssignment.starterCode))
      }
      return
    }

    // Otherwise, select the new student
    setSelectedStudent(student)
    if (currentSession) {
      const sessionDoc = await getDoc(
        doc(fireStore, `classrooms/${classroomId}/sessions`, currentSession.id)
      )
      const data = sessionDoc.data() as LiveSession
      if (data.students[student.uid]) {
        setStudentCode(data.students[student.uid].code)
        setTeacherCode(data.students[student.uid].code)
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
    setError(null)
    setOutput('')
    setIsCorrect(null)

    const code = selectedStudent ? studentCode : teacherCode
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      if (isSubmission) {
        setIsCorrect(false)
      }
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

      if (selectedStudent) {
        await updateDoc(sessionRef, {
          [`students.${selectedStudent.uid}.code`]: teacherCode,
          [`students.${selectedStudent.uid}.lastUpdated`]: serverTimestamp(),
        })

        toast({
          title: 'Code Sent',
          description: `Code sent to ${selectedStudent.displayName}`,
        })
      } else {
        // Use UpdateData type from Firestore
        const updates: UpdateData<LiveSession> = {}

        activeStudents.forEach((student) => {
          updates[`students.${student.uid}.code`] = teacherCode
          updates[`students.${student.uid}.lastUpdated`] =
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
    <div className='h-screen flex flex-col'>
      {/* Top Navigation Bar */}
      <nav className='border-b px-4 py-6 shrink-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            {classroom && curriculum && (
              <WeekSelector
                selectedWeek={currentWeek?.weekNumber ?? 1}
                totalWeeks={curriculum?.weeks.length ?? 1}
                onSelectWeek={handleWeekSelect}
              />
            )}

            {currentWeek && currentWeek.assignmentIds.length > 0 && (
              <Select
                value={selectedAssignmentId ?? undefined}
                onValueChange={handleAssignmentSelect}
              >
                <SelectTrigger className='w-[300px] bg-secondary hover:bg-secondary/90'>
                  <SelectValue placeholder='Select an assignment' />
                </SelectTrigger>
                <SelectContent className='w-[300px] bg-popover/90'>
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
            onClick={endSession}
            variant='destructive'
            size='sm'
            disabled={isLoading}
          >
            <LogOut className='mr-2 h-4 w-4' />
            {isLoading ? 'Ending Session...' : 'End Session'}
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Panel - Single scrollbar for entire content */}
        {/* Left Panel */}
        <div className='w-[45%] border-r flex flex-col h-full'>
          {/* Problem Description - Fixed height with scroll */}
          <div className='flex-1 overflow-y-auto p-4 max-h-[calc(60vh)]'>
            {currentAssignment && (
              <div className='prose dark:prose-invert max-w-none'>
                <h2 className='mb-4'>{currentAssignment.title}</h2>
                <MarkdownRenderer
                  content={currentAssignment.problemStatement}
                />
              </div>
            )}
          </div>
          {currentAssignment && (
            <AssignmentProgress
              assignmentId={selectedAssignmentId}
              activeStudents={activeStudents}
              selectedStudent={selectedStudent}
              onStudentSelect={handleStudentSelect}
              sessionStudents={sessionStudents}
            />
          )}
        </div>

        {/* Right Panel: Code Editor */}
        <div className='flex-1'>
          <PythonEditor
            initialCode={editorInitialCode}
            onCodeChange={setTeacherCode}
            onRunCode={() => handleRunCode(false)}
            onSubmitCode={() => handleRunCode(true)}
            onSendCode={handleSendCode}
            isTeacher={true}
            selectedStudent={selectedStudent}
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
