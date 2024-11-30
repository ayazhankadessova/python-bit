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
import { WeekSelector } from './WeekSelector'
import { fireStore } from '@/firebase/firebase'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { Week } from '@/utils/types/firebase'
import { Problem } from '@/utils/types/problem'

interface TeacherSessionViewProps {
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
}

interface WeeklyProgress {
  taskCompletions: {
    [taskId: string]: string[] // Array of user IDs who completed the task
  }
  activeSession?: boolean
  lastUpdated?: string
}

interface Student {
  username: string
  code: string
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
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<
    string | null
  >(null)
  const [studentsUsernames, setStudentsUsernames] = useState<string[]>([])
  // const [students, setStudents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [weekProblems, setWeekProblems] = useState<string[]>([])
  const [totalWeeks, setTotalWeeks] = useState(0)
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(
    null
  )
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const joinedRoom = useRef(false)
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${classroomId}`

  const updateWeekProblems = async (weekNumber: number) => {
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
            (w: Week) => w.weekNumber === weekNumber
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

  const handleStartWeek = async (weekNumber: number) => {
    if (!user) return

    try {
      const classroomRef = doc(fireStore, 'classrooms', classroomId)
      await updateDoc(classroomRef, {
        lastTaughtWeek: weekNumber, // Use the passed week number
        activeSession: true,
      })

      const weeklyProgressRef = doc(
        fireStore,
        'weeklyProgress',
        `${classroomId}-${weekNumber}` // Use the passed week number
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

      await updateWeekProblems(weekNumber)

      toast({
        title: 'Week Started',
        description: `Week ${weekNumber} started successfully.`,
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

  const handleStudentSelect = (studentUsername: string | null) => {
    setSelectedStudentUsername(studentUsername)
    if (!studentUsername) {
      setTeacherCode(currentProblem?.starterCode || '')
    } else {
      // Request the student's latest code
      if (socket) {
        socket.emit('get-student-code', classroomId, studentUsername)
      }
    }
  }

  const handleProblemSelect = (problemId: string) => {
    const problem = problems[problemId]
    setCurrentProblem(problem)
    // Only set starter code if no student is selected
    if (!selectedStudentUsername) {
      setTeacherCode(problem.starterCode)
    }
  }

  const handleRunCode = async () => {
    if (!currentProblem || !teacherCode) return

    setIsRunning(true)
    setOutput('')

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: teacherCode,
          functionName: currentProblem.starterFunctionName,
          input: currentProblem.examples[0].inputText,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setOutput(result.output)
      } else {
        setOutput(`Error: ${result.error}`)
      }
    } catch (error) {
      setOutput(
        `Error: ${
          error instanceof Error ? error.message : 'An unknown error occurred'
        }`
      )
    } finally {
      setIsRunning(false)
    }
  }

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

    if (selectedStudentUsername) {
      socket.emit('send-code-to-student', {
        classroomId,
        studentUsername: selectedStudentUsername,
        code: teacherCode,
      })
      toast({
        title: 'Code Sent',
        description: `Code sent to ${selectedStudentUsername}`,
      })
    } else {
      socket.emit('send-code-to-all', {
        classroomId,
        code: teacherCode,
      })
      toast({
        title: 'Code Broadcast',
        description: 'Code sent to all students',
      })
    }
  }

  useEffect(() => {
    console.log('Socket connection status:', {
      socketExists: !!socket,
      userDisplayName: user?.displayName,
      classroomId,
      joinedRoom: joinedRoom.current,
    })
  }, [socket, user?.displayName, classroomId])

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
    if (!socket || !user?.displayName) {
      console.log('Missing dependencies:', {
        socket: !!socket,
        userDisplayName: user?.displayName,
      })
      return
    }

    console.log('Setting up socket event listeners')

    if (!joinedRoom.current) {
      console.log('Joining room:', classroomId)
      socket.emit('join-room', classroomId, user.displayName, true)
      joinedRoom.current = true
    }

    socket.on('update-participants', (data) => {
      console.log('Received update-participants:', data)
      setStudentsUsernames(data.students)
    })

    // Add new listener for student code response
    socket.on('student-code', (data) => {
      console.log('Received student code:', data)
      setTeacherCode(data.code)
      // if (selectedStudentUsername == data.username) {
      //   setTeacherCode(data.code)
      // }
    })

    return () => {
      console.log('Cleaning up socket event listeners')
      socket.off('update-participants')
      socket.off('student-code')
    }
  }, [socket, user?.displayName, classroomId])

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='h-screen flex'>
      {/* Part 1: Students and Session Management */}
      <div className='w-1/4 border-r bg-background p-4 flex flex-col'>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-bold'>Session Control</h2>
          </div>
          <WeekSelector
            selectedWeek={selectedWeek}
            totalWeeks={totalWeeks}
            onSelectWeek={(weekNumber) => {
              setSelectedWeek(weekNumber)
              handleStartWeek(weekNumber)
            }}
          />
          <Button variant='destructive' onClick={onEndSession}>
            End Session
          </Button>
          <div className='space-y-2'>
            <h3 className='font-semibold'>Connected Students</h3>
            {studentsUsernames.map((studentUsername) => (
              <Card
                key={studentUsername}
                className={`cursor-pointer hover:bg-accent ${
                  selectedStudentUsername === studentUsername
                    ? 'border-primary'
                    : ''
                }`}
                onClick={() => {
                  // If clicking the same student, deselect them
                  if (selectedStudentUsername === studentUsername) {
                    handleStudentSelect(null)
                  } else {
                    handleStudentSelect(studentUsername)
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className='text-sm'>{studentUsername}</CardTitle>
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
                          {completions.length}/{studentsUsernames.length}{' '}
                          completed
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
              value={teacherCode}
              height='300px'
              theme={vscodeDark}
              extensions={[python()]}
              onChange={setTeacherCode}
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
                  {selectedStudentUsername
                    ? `Send to ${selectedStudentUsername}`
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
