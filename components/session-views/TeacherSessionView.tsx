import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Socket } from 'socket.io-client'
import Split from 'react-split'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShareLink } from '@/components/share-link'
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Problem } from '@/utils/types/problem'
import { problems } from '@/utils/problems'
import { useToast } from '@/hooks/use-toast'
import { Send, Play, StopCircle } from 'lucide-react'

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
  const joinedRoom = useRef(false)
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${classroomId}`

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

  // Socket connection and event handlers
  useEffect(() => {
    if (!socket || !user) return

    if (!joinedRoom.current) {
      socket.emit('join-room', classroomId, user.displayName, true)
      joinedRoom.current = true
    }

    socket.on('student-joined', (student: Student) => {
      setStudents((prev) => [...prev, student])
    })

    socket.on('student-left', (studentId: string) => {
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
    })

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
      socket.off('student-joined')
      socket.off('student-left')
      socket.off('student-code-update')
      socket.off('execution-output')
      socket.off('execution-complete')
    }
  }, [socket, user, classroomId])

  // Listen to weekly progress
  useEffect(() => {
    if (!selectedWeek) return

    const weeklyProgressRef = doc(
      fireStore,
      'weeklyProgress',
      `${classroomId}-${selectedWeek}`
    )

    const unsubscribe = onSnapshot(weeklyProgressRef, (doc) => {
      if (doc.exists()) {
        setWeeklyProgress(doc.data() as WeeklyProgress)
      }
    })

    return () => unsubscribe()
  }, [classroomId, selectedWeek])

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

      setIsWeekSelectionOpen(false)
      toast({
        title: 'Week Started',
        description: 'Students can now join the session.',
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

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='h-screen flex'>
      {/* Left Sidebar - Students */}
      <div className='w-1/4 border-r p-4 bg-background overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>Students</h2>
          <Button variant='destructive' onClick={onEndSession}>
            End Session
          </Button>
        </div>

        <div className='flex justify-between items-center mb-4'>
          <ShareLink fullLink={inviteLink} />
          <Button onClick={() => setIsWeekSelectionOpen(true)}>
            Week {selectedWeek}
          </Button>
        </div>

        <div className='space-y-2'>
          {students.map((student) => (
            <Card
              key={student.id}
              className={`cursor-pointer hover:bg-accent ${
                selectedStudent?.id === student.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedStudent(student)}
            >
              <CardHeader>
                <CardTitle className='text-sm flex items-center justify-between'>
                  {student.displayName}
                  <span className='text-xs text-muted-foreground'>
                    {weeklyProgress?.taskCompletions &&
                      Object.values(weeklyProgress.taskCompletions).filter(
                        (users) => users.includes(student.id)
                      ).length}{' '}
                    / {weekProblems.length} completed
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Problems Navigation */}
        <div className='border-b p-4'>
          <div className='flex space-x-2 overflow-x-auto'>
            {weekProblems.map((problemId) => {
              const problem = problems[problemId]
              return (
                <Button
                  key={problemId}
                  variant={
                    currentProblem?.id === problemId ? 'default' : 'outline'
                  }
                  onClick={() => handleProblemSelect(problemId)}
                  className='whitespace-nowrap'
                >
                  {problem.title}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Code Editor and Problem Description */}
        <Split className='flex-1' sizes={[50, 50]} minSize={300}>
          <div className='p-4 overflow-y-auto'>
            {currentProblem && (
              <div className='prose dark:prose-invert'>
                <h1>{currentProblem.title}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentProblem.problemStatement,
                  }}
                />
                <h3>Examples:</h3>
                {currentProblem.examples.map((example) => (
                  <div key={example.id} className='bg-muted p-4 rounded-lg'>
                    <pre>Input: {example.inputText}</pre>
                    <pre>Output: {example.outputText}</pre>
                    {example.explanation && <p>{example.explanation}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='flex flex-col'>
            <CodeMirror
              value={teacherCode}
              height='100%'
              theme={vscodeDark}
              extensions={[python()]}
              onChange={setTeacherCode}
              className='flex-1'
            />
            <div className='p-4 border-t flex justify-between items-center'>
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
              <div className='p-4 bg-black text-white font-mono text-sm'>
                <pre>{output}</pre>
              </div>
            )}
          </div>
        </Split>
      </div>

      {/* Week Selection Dialog */}
      <Dialog open={isWeekSelectionOpen} onOpenChange={setIsWeekSelectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Week</DialogTitle>
            <DialogDescription>Choose which week to teach</DialogDescription>
          </DialogHeader>
          <Select onValueChange={(value) => setSelectedWeek(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder='Select week' />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalWeeks }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Week {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleStartWeek}>Start Week</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
