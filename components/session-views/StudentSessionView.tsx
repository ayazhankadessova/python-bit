import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Socket } from 'socket.io-client'
import Split from 'react-split'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Problem } from '@/utils/types/problem'
import { problems } from '@/utils/problems'
import { useToast } from '@/hooks/use-toast'
import {
  BookOpen,
  MessageSquareMore,
  Play,
  StopCircle,
  Bot,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface StudentSessionViewProps {
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
}

interface WeeklyProgress {
  taskCompletions: {
    [taskId: string]: string[] // Array of user IDs who completed the task
  }
  activeSession?: boolean
}

export function StudentSessionView({
  classroomId,
  onEndSession,
  socket,
}: StudentSessionViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [studentCode, setStudentCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [completedProblems, setCompletedProblems] = useState<string[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [weekProblems, setWeekProblems] = useState<string[]>([])
  const [isAiHelpOpen, setIsAiHelpOpen] = useState(false)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const joinedRoom = useRef(false)

  // Check if session is active and fetch initial data
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

        if (!classroomData.activeSession) {
          toast({
            title: 'No Active Session',
            description: 'Please wait for the teacher to start the session',
            variant: 'destructive',
          })
          onEndSession()
          return
        }

        setSelectedWeek(classroomData.lastTaughtWeek)

        const curriculumRef = doc(
          fireStore,
          'curricula',
          classroomData.curriculumId
        )
        const curriculumDoc = await getDoc(curriculumRef)

        if (curriculumDoc.exists()) {
          const curriculumData = curriculumDoc.data()
          const weekData = curriculumData.weeks.find(
            (w: any) => w.weekNumber === classroomData.lastTaughtWeek
          )
          if (weekData) {
            setWeekProblems(weekData.assignmentIds)
            if (weekData.assignmentIds.length > 0) {
              const firstProblem = problems[weekData.assignmentIds[0]]
              setCurrentProblem(firstProblem)
              setStudentCode(firstProblem.starterCode)
            }
          }
        }

        // Get completed problems
        if (user) {
          const userRef = doc(fireStore, 'users', user.uid)
          const userDoc = await getDoc(userRef)
          if (userDoc.exists()) {
            setCompletedProblems(userDoc.data().solvedProblems || [])
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load session data!',
          variant: 'destructive',
        })
      }
    }

    fetchData()
  }, [classroomId, user, toast, onEndSession])

  // Socket connection and events
  useEffect(() => {
    if (!socket || !user) return

    if (!joinedRoom.current) {
      socket.emit('join-room', classroomId, user.displayName, false)
      joinedRoom.current = true
    }

    socket.on('teacher-code', (code: string) => {
      setStudentCode(code)
    })

    socket.on('execution-output', (data: { output: string }) => {
      setOutput((prev) => prev + data.output)
    })

    socket.on('execution-complete', () => {
      setIsRunning(false)
    })

    socket.on('session-ended', () => {
      toast({
        title: 'Session Ended',
        description: 'The teacher has ended the session',
      })
      onEndSession()
    })

    return () => {
      socket.off('teacher-code')
      socket.off('execution-output')
      socket.off('execution-complete')
      socket.off('session-ended')
    }
  }, [socket, user, classroomId, toast, onEndSession])

  const handleProblemSelect = (problemId: string) => {
    const problem = problems[problemId]
    setCurrentProblem(problem)
    setStudentCode(problem.starterCode)
  }

  const handleRunCode = () => {
    if (!socket) return
    setIsRunning(true)
    setOutput('')
    socket.emit('execute-code', {
      code: studentCode,
      language: 'python',
    })
  }

  const handleSubmitCode = async () => {
    if (!currentProblem || !user || !selectedWeek) return

    try {
      const success = currentProblem.handlerFunction(studentCode)

      if (success) {
        // Update user's solved problems
        const userRef = doc(fireStore, 'users', user.uid)
        await updateDoc(userRef, {
          solvedProblems: arrayUnion(currentProblem.id),
        })

        // Update weekly progress
        const weeklyProgressId = `${classroomId}-${selectedWeek}`
        const weeklyProgressRef = doc(
          fireStore,
          'weeklyProgress',
          weeklyProgressId
        )
        const weeklyProgressDoc = await getDoc(weeklyProgressRef)

        if (weeklyProgressDoc.exists()) {
          await updateDoc(weeklyProgressRef, {
            [`taskCompletions.${currentProblem.id}`]: arrayUnion(user.uid),
          })
        } else {
          const initialProgress: WeeklyProgress = {
            taskCompletions: {
              [currentProblem.id]: [user.uid],
            },
          }
          await setDoc(weeklyProgressRef, initialProgress)
        }

        setCompletedProblems((prev) => [...prev, currentProblem.id])
        toast({
          title: 'Success!',
          description: 'All test cases passed!',
        })

        socket?.emit('task-completed', {
          taskId: currentProblem.id,
          studentId: user.uid,
          studentName: user.displayName,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='h-screen flex'>
      {/* Problem List Sidebar */}
      <div className='w-1/4 border-r p-4 bg-background overflow-y-auto'>
        <h2 className='text-xl font-bold mb-4'>Week {selectedWeek} Problems</h2>
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
                  <CardTitle className='text-sm flex items-center justify-between'>
                    {problem.title}
                    {completedProblems.includes(problemId) && (
                      <div className='h-2 w-2 bg-green-500 rounded-full' />
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <Split className='flex-1' sizes={[40, 60]} minSize={400}>
        {/* Problem Description */}
        <div className='p-4 overflow-y-auto'>
          {currentProblem && (
            <>
              <h1 className='text-2xl font-bold mb-4'>
                {currentProblem.title}
              </h1>
              <div className='prose dark:prose-invert'>
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentProblem.problemStatement,
                  }}
                />
                <h3 className='mt-6'>Examples:</h3>
                {currentProblem.examples.map((example) => (
                  <div
                    key={example.id}
                    className='my-4 p-4 bg-muted rounded-lg'
                  >
                    <pre className='mb-2'>Input: {example.inputText}</pre>
                    <pre className='mb-2'>Output: {example.outputText}</pre>
                    {example.explanation && (
                      <p className='text-sm'>{example.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Code Editor and Output */}
        <div className='flex flex-col'>
          <CodeMirror
            value={studentCode}
            height='60%'
            theme={vscodeDark}
            extensions={[python()]}
            onChange={(value) => {
              setStudentCode(value)
              socket?.emit('code-update', {
                code: value,
                studentId: user?.uid,
              })
            }}
          />

          <div className='h-40 p-4 bg-black text-white font-mono text-sm overflow-y-auto'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='h-2 w-2 rounded-full bg-green-500' />
              <span className='text-xs text-gray-400'>Output</span>
            </div>
            <pre>{output || 'No output yet...'}</pre>
          </div>

          <div className='p-4 border-t flex justify-between'>
            <div className='space-x-2'>
              <Button variant='outline' onClick={() => setIsAiHelpOpen(true)}>
                <Bot className='mr-2 h-4 w-4' />
                AI Help
              </Button>
              <Button onClick={handleRunCode} disabled={isRunning}>
                {isRunning ? (
                  <StopCircle className='mr-2 h-4 w-4' />
                ) : (
                  <Play className='mr-2 h-4 w-4' />
                )}
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </div>
            <Button onClick={handleSubmitCode}>Submit Solution</Button>
          </div>
        </div>
      </Split>

      {/* AI Help Dialog */}
      <Dialog open={isAiHelpOpen} onOpenChange={setIsAiHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Help</DialogTitle>
            <DialogDescription>Get help with your code</DialogDescription>
          </DialogHeader>
          {/* AI help content would go here */}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// export function StudentSessionView({
//   classroomId,
//   onEndSession,
//   socket,
// }: StudentSessionViewProps) {
//   return <div>Student Session</div>
// }
