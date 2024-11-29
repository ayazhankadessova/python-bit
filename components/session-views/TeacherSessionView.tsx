import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Socket } from 'socket.io-client'
import { problems } from '@/utils/problems'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { ShareLink } from '@/components/share-link'
import { useToast } from '@/hooks/use-toast'
import { Send, Play, StopCircle, RefreshCw } from 'lucide-react'
import { WeekSelector } from './WeekSelector' // You'll need to extract this to a separate component
import { fireStore } from '@/firebase/firebase'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { Week } from '@/utils/types/firebase'
import { Problem } from '@/utils/types/problem'

interface TeacherSessionViewProps {
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
}

interface Student {
  id: string
  displayName: string
  email: string
  currentCode?: string
  solvedProblems?: string[]
}

interface WeeklyProgress {
  taskCompletions: {
    [taskId: string]: string[] // Array of user IDs who completed the task
  }
  activeSession?: boolean
  lastUpdated?: string
}

export function TeacherSessionView({
  classroomId,
  onEndSession,
  socket,
}: TeacherSessionViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [teacherCode, setTeacherCode] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [weekProblems, setWeekProblems] = useState<string[]>([])
  const [isWeekSelectionOpen, setIsWeekSelectionOpen] = useState(false)
  const [totalWeeks, setTotalWeeks] = useState(0)
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(
    null
  )
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const joinedRoom = useRef(false)
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${classroomId}`

  const updateWeekProblems = async () => {
    if (!selectedWeek) return

    try {
      const classroomRef = doc(fireStore, 'classrooms', classroomId)
      const classroomDoc = await getDoc(classroomRef)

      if (classroomDoc.exists()) {
        const classroomData = classroomDoc.data()
        const curriculumRef = doc(
          fireStore,
          'curricula',
          classroomData.curriculumId
        )
        const curriculumDoc = await getDoc(curriculumRef)

        if (curriculumDoc.exists()) {
          const curriculumData = curriculumDoc.data()
          const weekData = curriculumData.weeks.find(
            (w: Week) => w.weekNumber === selectedWeek
          )

          if (weekData) {
            setWeekProblems(weekData.assignmentIds)
            if (weekData.assignmentIds.length > 0) {
              const firstProblem = problems[weekData.assignmentIds[0]]
              setCurrentProblem(firstProblem)
              setTeacherCode(firstProblem.starterCode)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating week problems:', error)
      toast({
        title: 'Error',
        description: 'Failed to load week problems',
        variant: 'destructive',
      })
    }
  }

  const handleStartWeek = async () => {
    if (!selectedWeek || !user) return

    try {
      const classroomRef = doc(fireStore, 'classrooms', classroomId)
      await updateDoc(classroomRef, {
        lastTaughtWeek: selectedWeek,
        activeSession: true,
      })

      const weeklyProgressRef = doc(
        fireStore,
        'weeklyProgress',
        `${classroomId}-${selectedWeek}`
      )
      await setDoc(
        weeklyProgressRef,
        {
          activeSession: true,
          lastUpdated: new Date().toISOString(),
          taskCompletions: {},
        },
        { merge: true }
      )

      await updateWeekProblems()

      setIsWeekSelectionOpen(false)
      toast({
        title: 'Week Started',
        description: `Week ${selectedWeek} started successfully.`,
      })
    } catch (error) {
      console.error('Error starting week:', error)
      toast({
        title: 'Error',
        description: 'Failed to start the week',
        variant: 'destructive',
      })
    }
  }

  const handleRunCode = () => {
    if (!socket) return
    setIsRunning(true)
    setOutput('')
    socket.emit('execute-code', {
      code: teacherCode,
      language: 'python',
    })
  }

  const handleProblemSelect = (problemId: string) => {
    const problem = problems[problemId]
    setCurrentProblem(problem)
    setTeacherCode(problem.starterCode)
  }

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const classroomRef = doc(fireStore, 'classrooms', classroomId)
        const classroomDoc = await getDoc(classroomRef)

        if (!classroomDoc.exists()) {
          toast({
            title: 'Error',
            description: 'Classroom not found',
            variant: 'destructive',
          })
          return
        }

        const classroomData = classroomDoc.data()
        const curriculumRef = doc(
          fireStore,
          'curricula',
          classroomData.curriculumId
        )
        const curriculumDoc = await getDoc(curriculumRef)

        if (curriculumDoc.exists()) {
          const curriculumData = curriculumDoc.data()
          setTotalWeeks(curriculumData.weeks.length)
          setSelectedWeek(classroomData.lastTaughtWeek || 1)

          const weekData = curriculumData.weeks.find(
            (w: any) => w.weekNumber === (classroomData.lastTaughtWeek || 1)
          )
          if (weekData) {
            setWeekProblems(weekData.assignmentIds)
            if (weekData.assignmentIds.length > 0) {
              const firstProblem = problems[weekData.assignmentIds[0]]
              setCurrentProblem(firstProblem)
              setTeacherCode(firstProblem.starterCode)
            }
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load classroom data',
          variant: 'destructive',
        })
      }
    }

    fetchData()
  }, [classroomId, toast])
  // Socket event handlers
  useEffect(() => {
    if (!socket || !user) return

    if (!joinedRoom.current) {
      socket.emit('join-room', classroomId, user.displayName, true)
      joinedRoom.current = true
    }

    socket.on(
      'update-participants',
      (data: { teacher: string | null; students: Student[] }) => {
        setStudents(data.students)
      }
    )

    socket.on(
      'student-code-update',
      (data: { studentId: string; code: string }) => {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === data.studentId ? { ...s, currentCode: data.code } : s
          )
        )
      }
    )

    socket.on('execution-output', (data: { output: string }) => {
      setOutput((prev) => prev + data.output)
    })

    socket.on('execution-complete', () => {
      setIsRunning(false)
    })

    return () => {
      socket.off('update-participants')
      socket.off('student-code-update')
      socket.off('execution-output')
      socket.off('execution-complete')
    }
  }, [socket, user, classroomId])

  const refreshProgress = async () => {
    if (!selectedWeek) return

    setIsRefreshing(true)
    try {
      const weeklyProgressRef = doc(
        fireStore,
        'weeklyProgress',
        `${classroomId}-${selectedWeek}`
      )
      const weeklyProgressDoc = await getDoc(weeklyProgressRef)
      if (weeklyProgressDoc.exists()) {
        setWeeklyProgress(weeklyProgressDoc.data() as WeeklyProgress)
      }
    } catch (error) {
      console.error('Error refreshing progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh progress',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSendCode = () => {
    if (!socket) return

    if (selectedStudent) {
      socket.emit('send-code', {
        studentId: selectedStudent.id,
        code: teacherCode,
      })
      toast({
        title: 'Code Sent',
        description: `Code sent to ${selectedStudent.displayName}`,
      })
    } else {
      socket.emit('broadcast-code', {
        code: teacherCode,
      })
      toast({
        title: 'Code Broadcast',
        description: 'Code sent to all students',
      })
    }
  }

  return (
    <div className='h-screen flex'>
      {/* Part 1: Students and Session Management */}
      <div className='w-1/4 border-r bg-background p-4 flex flex-col'>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-bold'>Session Control</h2>
            <Button variant='destructive' onClick={onEndSession}>
              End Session
            </Button>
          </div>
          <ShareLink fullLink={inviteLink} />
          <WeekSelector
            selectedWeek={selectedWeek}
            totalWeeks={totalWeeks}
            onSelectWeek={(weekNumber) => {
              setSelectedWeek(weekNumber)
              handleStartWeek()
            }}
          />
          <div className='space-y-2'>
            <h3 className='font-semibold'>Connected Students</h3>
            {students.map((student) => (
              <Card
                key={student.id}
                className={`cursor-pointer hover:bg-accent ${
                  selectedStudent?.id === student.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <CardHeader>
                  <CardTitle className='text-sm'>
                    {student.displayName}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Part 2: Progress and Code Management */}
      <div className='flex-1 flex flex-col'>
        <div className='border-b p-4'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold'>Week {selectedWeek} Progress</h2>
            <Button
              onClick={refreshProgress}
              disabled={isRefreshing}
              variant='outline'
            >
              <RefreshCw
                className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh Progress
            </Button>
          </div>

          {weeklyProgress && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
              {weekProblems.map((problemId) => {
                const completions =
                  weeklyProgress.taskCompletions[problemId] || []
                return (
                  <Card key={problemId}>
                    <CardHeader>
                      <CardTitle className='text-sm'>
                        {problems[problemId].title}
                        <span className='text-muted-foreground ml-2'>
                          {completions.length}/{students.length} completed
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          )}

          <div className='flex flex-col gap-4'>
            <CodeMirror
              value={
                selectedStudent
                  ? selectedStudent.currentCode || ''
                  : teacherCode
              }
              height='300px'
              theme={vscodeDark}
              extensions={[python()]}
              onChange={setTeacherCode}
              readOnly={selectedStudent !== null}
            />

            <div className='flex justify-between items-center'>
              <div className='space-x-2'>
                <Button onClick={handleRunCode} disabled={isRunning}>
                  {isRunning ? (
                    <StopCircle className='mr-2' />
                  ) : (
                    <Play className='mr-2' />
                  )}
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
                <Button variant='outline' onClick={handleSendCode}>
                  <Send className='mr-2' />
                  {selectedStudent
                    ? `Send to ${selectedStudent.displayName}`
                    : 'Send to All'}
                </Button>
              </div>
            </div>

            {output && (
              <div className='p-4 bg-black text-white font-mono text-sm rounded'>
                <pre>{output}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Part 3: Problem Selection and Details */}
      <div className='w-1/4 border-l bg-background p-4'>
        <h2 className='text-xl font-bold mb-4'>Week Problems</h2>
        <div className='space-y-2'>
          {weekProblems.map((problemId) => {
            const problem = problems[problemId]
            return (
              <Card
                key={problemId}
                className={`cursor-pointer hover:bg-accent ${
                  currentProblem?.id === problemId ? 'border-primary' : ''
                }`}
                onClick={() => handleProblemSelect(problemId)}
              >
                <CardHeader>
                  <CardTitle className='text-sm'>{problem.title}</CardTitle>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {currentProblem && (
          <div className='mt-4 prose dark:prose-invert'>
            <h3>Problem Description</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: currentProblem.problemStatement,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
