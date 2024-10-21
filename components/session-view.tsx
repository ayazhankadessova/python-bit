import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import CodeExecutor from '@/components/codeExecutor'
import { Socket } from 'socket.io-client'
import { ShareLink } from '@/components/share-link'
import { LessonProgressCard } from '@/components/lesson-progress-card'
import { useToast } from '@/hooks/use-toast'
import {
  User,
  Task,
  Classroom,
  Curriculum,
  Assignment,
  WeeklyProgress,
} from '@/models/types'
import { BookOpen, CheckCircle2, MessageSquareMore, Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SessionViewProps {
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
  role: 'teacher' | 'student'
  username: string
}

export function SessionView({
  classroomId,
  onEndSession,
  socket,
  role,
  username,
}: SessionViewProps) {
  const { toast } = useToast()
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [starterCode, setStarterCode] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [students, setStudents] = useState<User[]>([])
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${classroomId}`
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const joinedRoom = useRef(false)
  const [isWeekSelectionOpen, setIsWeekSelectionOpen] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [totalWeeks, setTotalWeeks] = useState(0)
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(
    null
  )

  const fetchTasks = useCallback(
    async (weekNumber: number, curriculumData: Curriculum) => {
      const weekData = curriculumData.weeks.find(
        (week) => week.weekNumber === weekNumber
      )
      if (!weekData) {
        console.error('Week data not found')
        return
      }

      try {
        const tasksResponse = await fetch(
          `/api/assignments/${weekData.assignmentId}`
        )
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch week tasks')
        }
        const weekTasks = await tasksResponse.json()
        setTasks(weekTasks.tasks || [])
      } catch (error) {
        console.error('Error fetching tasks:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch tasks',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  const fetchClassroomData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Fetch classroom data
      const classroomResponse = await fetch(`/api/classroom/${classroomId}`)
      if (!classroomResponse.ok) {
        throw new Error('Failed to fetch classroom data')
      }
      const classroomData: Classroom = await classroomResponse.json()
      setClassroom(classroomData)

      // Fetch curriculum data
      const curriculumResponse = await fetch(
        `/api/curriculum/${classroomData.curriculumId}`
      )
      if (!curriculumResponse.ok) {
        throw new Error('Failed to fetch curriculum data')
      }
      const curriculumData: Curriculum = await curriculumResponse.json()
      setCurriculum(curriculumData)
      setTotalWeeks(curriculumData.weeks.length)

      if (classroomData.lastTaughtWeek > 0 && role == 'student') {
        // Fetch weekly progress
        const progressResponse = await fetch(
          `/api/weekly-progress?classroomId=${classroomId}&weekNumber=${classroomData.lastTaughtWeek}`
        )
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch weekly progress')
        }
        const progressData: WeeklyProgress = await progressResponse.json()
        setWeeklyProgress(progressData)

        // Fetch assignment data
        const weekData = curriculumData.weeks.find(
          (week) => week.weekNumber === classroomData.lastTaughtWeek
        )
        if (weekData) {
          const assignmentResponse = await fetch(
            `/api/assignments/${weekData.assignmentId}`
          )
          if (!assignmentResponse.ok) {
            throw new Error('Failed to fetch assignment data')
          }
          const assignmentData: Assignment = await assignmentResponse.json()
          setTasks(assignmentData.tasks)

          // Handle student-specific data
          if (role === 'student') {
            const completedTasks = progressData.tasks
              .filter((task) =>
                task.completedBy.some((completion) => completion === username)
              )
              .map((task) => task.taskId)
            setCompletedTasks(completedTasks)

            // Set the code for the current task if it exists
            const currentTask = progressData.tasks.find(
              (task) =>
                task.taskId === assignmentData.tasks[currentTaskIndex]?.id
            )
            const userCompletion = currentTask?.completedBy.find(
              (completion) => completion === username
            )
            // if (userCompletion) {
            //   setStudentCode(userCompletion.code)
            // }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch classroom or curriculum data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [classroomId, role, username, toast, currentTaskIndex])

  useEffect(() => {
    fetchClassroomData()
  }, [fetchClassroomData])

  const handleStartWeek = async () => {
    if (selectedWeek === null || !classroom || !curriculum) return

    try {
      const updateResponse = await fetch(`/api/classroom/${classroomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastTaughtWeek: selectedWeek }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update last taught week')
      }

      const updatedClassroom = await updateResponse.json()
      setClassroom(updatedClassroom)

      toast({
        title: 'Error',
        description: 'updatedClassroom',
        variant: 'destructive',
      })

      await fetchTasks(selectedWeek, curriculum)
      setCurrentTaskIndex(0)

      setIsWeekSelectionOpen(false)
      toast({
        title: 'Week Started',
        description: `Week ${selectedWeek} has been started. You can now invite students.`,
        variant: 'light',
      })
    } catch (error) {
      console.error('Error starting week:', error)
      toast({
        title: 'Error',
        description: 'Failed to start the week. Please try again.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    if (!socket) return

    if (!joinedRoom.current) {
      console.log('Emitting join-room event')
      socket.emit('join-room', classroomId, username, role === 'teacher')
      joinedRoom.current = true
    }

    socket.on(
      'update-participants',
      (data: { teacher: string; students: User[] }) => {
        setStudents(data.students)
      }
    )

    socket.on('student-code', (data: { username: string; code: string }) => {
      if (selectedStudent && selectedStudent.username === data.username) {
        setStudentCode(data.code)
        setSelectedStudent((prev) => (prev ? { ...prev } : null))
      }
    })

    socket.on(
      'student-code-updated',
      (data: { username: string; code: string }) => {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.username === data.username
              ? {
                  ...student,
                  code: data.code,
                }
              : student
          )
        )
        if (selectedStudent?.username === data.username) {
          setStudentCode(data.code)
        }
        if (role === 'student' && username === data.username) {
          setStudentCode(data.code)
        }
      }
    )

    socket.on(
      'execution-complete',
      (data: {
        id: string
        exitCode: number
        output: string
        error: string
      }) => {
        console.log('Execution complete:', data)
        if (data.error || data.exitCode !== 0) {
          toast({
            title: 'Execution Error',
            description:
              data.error || 'An error occurred during code execution.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Code Executed',
            description: 'Your code has been executed successfully.',
            variant: 'light',
          })
        }
      }
    )

    socket.on('participant-left', (leftUsername: string) => {
      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.username !== leftUsername)
      )
      if (selectedStudent?.username === leftUsername) {
        setSelectedStudent(null)
      }
    })

    socket.on('session-ended', () => {
      toast({
        title: 'Session Ended',
        description: 'The teacher has ended the session.',
        variant: 'light',
      })
      onEndSession()
    })

    return () => {
      socket.off('update-participants')
      socket.off('student-code-updated')
      socket.off('execution-complete')
      socket.off('participant-left')
      socket.off('session-ended')
      socket.off('student-progress-updated')
      socket.off('student-code')
    }
  }, [
    socket,
    role,
    toast,
    onEndSession,
    selectedStudent,
    username,
    classroomId,
  ])

  const handleSendCode = () => {
    if (socket) {
      if (selectedStudent) {
        socket.emit(
          'update-code',
          classroomId,
          selectedStudent.username,
          studentCode
        )
        toast({
          title: 'Code Sent',
          description: `Code sent to ${selectedStudent.username}.`,
          variant: 'light',
        })
      } else {
        socket.emit('send-code-to-all', classroomId, starterCode)
        toast({
          title: 'Code Sent',
          description: 'Code sent to all students.',
          variant: 'light',
        })
      }
    }
  }

  const handleSubmitCode = async () => {
    if (role === 'student' && tasks.length > 0 && classroom) {
      try {
        const response = await fetch('/api/submit-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: studentCode,
            classroomId,
            username,
            taskId: tasks[currentTaskIndex].id,
            weekNumber: classroom.lastTaughtWeek,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit code')
        }

        const result = await response.json()

        if (result.passed) {
          toast({
            title: 'Task Completed',
            description: 'Your code passed all test cases!',
            variant: 'success',
          })
          setCompletedTasks((prev) => [...prev, tasks[currentTaskIndex].id])
          if (currentTaskIndex < tasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1)
          }
        } else {
          toast({
            title: 'Task Not Completed',
            description: 'Your code did not pass all test cases. Try again!',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Error submitting code:', error)
        toast({
          title: 'Error',
          description: 'Failed to submit code. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleWeekSelect = (week: string) => {
    setSelectedWeek(parseInt(week))
  }

  const handleStudentSelect = (student: User) => {
    setSelectedStudent(student)
    if (socket) {
      socket.emit('get-student-code', classroomId, student.username)
    }
  }

  const renderTeacherView = () => {
    if (isLoading) {
      return (
        <div className='w-2/3 p-4'>
          <Card className='mb-4'>
            <CardContent>
              <p>Loading session data...</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className='w-2/3 p-4'>
        <div className='flex justify-between mb-4'>
          <ShareLink fullLink={inviteLink} />
          <Button onClick={() => setIsWeekSelectionOpen(true)}>
            Select Week
          </Button>
          <Button onClick={onEndSession} variant='destructive'>
            End Session
          </Button>
        </div>

        <Dialog
          open={isWeekSelectionOpen}
          onOpenChange={setIsWeekSelectionOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Week to Start</DialogTitle>
              <DialogDescription>
                Last taught week: {classroom?.lastTaughtWeek || 'None'}
              </DialogDescription>
            </DialogHeader>
            <Select onValueChange={handleWeekSelect}>
              <SelectTrigger>
                <SelectValue placeholder='Select a week' />
              </SelectTrigger>
              <SelectContent>
                {[...Array(totalWeeks)].map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    Week {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleStartWeek}>Start Week</Button>
          </DialogContent>
        </Dialog>

        {selectedWeek && classroom && classroom.students && (
          <LessonProgressCard
            classroomId={classroomId}
            weekNumber={selectedWeek}
            tasks={tasks}
            classroom={classroom}
          />
        )}

        <CodeExecutor
          code={selectedStudent ? studentCode : starterCode}
          onChange={selectedStudent ? setStudentCode : setStarterCode}
          socket={socket}
          classroomId={classroomId}
          username={username}
          role={role}
        />

        <Button onClick={handleSendCode} className='mt-4'>
          {selectedStudent
            ? `Send Code to ${selectedStudent.username}`
            : 'Send Code to All Students'}
        </Button>
      </div>
    )
  }

  const renderStudentView = () => {
    if (isLoading) {
      return (
        <div className='w-2/3 p-4'>
          <Card className='mb-4'>
            <CardContent>
              <p>Loading session data...</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className='w-2/3 p-4'>
        <div className='flex justify-between mb-4'>
          <div className='flex gap-2'>
            <Button variant='outline'>
              <BookOpen className='mr-2 h-4 w-4' />
              Reference Guide
            </Button>
            <Button className='bg-zinc-950'>
              <MessageSquareMore className='mr-2 h-4 w-4' />
              Ask AI Help
            </Button>
          </div>
          <Button onClick={onEndSession} variant='destructive'>
            Leave Room
          </Button>
        </div>

        <Card className='mb-4'>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              {tasks[currentTaskIndex]?.title}
              <span className='text-sm font-normal'>
                Task {currentTaskIndex + 1}/{tasks.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4'>{tasks[currentTaskIndex]?.description}</p>
            <CodeExecutor
              code={studentCode}
              onChange={setStudentCode}
              socket={socket}
              classroomId={classroomId}
              username={username}
              role={role}
            />

            <div className='flex mt-4'>
              <Button onClick={handleSubmitCode}>
                Submit Code
                <CheckCircle2 className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex h-screen'>
      <div className='w-1/3 p-4 border-r'>
        <h2 className='text-2xl font-bold mb-4'>
          {role === 'teacher'
            ? `${username}'s Classroom`
            : `${username}'s Progress`}
        </h2>

        {isLoading ? (
          <Card className='mb-4'>
            <CardContent>
              <p>Loading session data...</p>
            </CardContent>
          </Card>
        ) : role === 'student' ? (
          <Card className='mb-4'>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {tasks.map((task, index) => (
                  <div key={task.id} className='flex items-center'>
                    <div
                      className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                        completedTasks.includes(task.id)
                          ? 'bg-green-500'
                          : index === currentTaskIndex
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      {completedTasks.includes(task.id) && (
                        <CheckCircle2 className='h-4 w-4 text-white' />
                      )}
                    </div>
                    <span>{task.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {students.map((student) => (
              <Card
                key={student.username}
                className={`mb-2 cursor-pointer ${
                  selectedStudent?.username === student.username
                    ? 'border-blue-500'
                    : ''
                }`}
                onClick={() => handleStudentSelect(student)}
              >
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    {student.username}
                    <span className='text-sm font-normal'>
                      {/* {student.completedTasks?.length || 0}/{tasks.length}{' '} */}
                      completed
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </>
        )}
      </div>

      {role === 'teacher' ? renderTeacherView() : renderStudentView()}
    </div>
  )
}

export default SessionView
