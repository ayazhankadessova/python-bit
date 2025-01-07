import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import Split from 'react-split'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Problem } from '@/types/utils'
import { problems } from '@/utils/problems'
import { useToast } from '@/hooks/use-toast'
import { Play, StopCircle, Bot, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
// import { handleTaskCompletion } from './helpers'
import {Week} from "@/types/firebase"
import { useWebSocket } from '@/hooks/websocket/useWebSocket'

export function StudentSessionView({ classroomId }: { classroomId: string }) {
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

   const { isConnected, sendMessage, on } = useWebSocket(
     classroomId,
     user?.displayName,
     false // isTeacher = false
   )

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
        // if (!classroomData.activeSession) {
        //   toast({
        //     title: 'No Active Session',
        //     description: 'Please wait for the teacher to start the session',
        //     variant: 'destructive',
        //   })
        //   onEndSession()
        //   return
        // }

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
            (w: Week) => w.weekNumber === classroomData.lastTaughtWeek
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
  }, [classroomId, user, toast])

  // WebSocket event handlers
   useEffect(() => {
     // CHECKED: Handle send-code-to-student'le receiving code from teacher
     const unsubscribeTeacherCode = on('teacher-code', (data) => {
       setStudentCode(data.code)
     })

     // Handle code requests from teacher
     const unsubscribeCodeRequest = on('request-code', () => {
       sendMessage('code-update', { studentCode })
     })

     return () => {
       unsubscribeTeacherCode()
       unsubscribeCodeRequest()
     }
   }, [on, studentCode, sendMessage])

  const handleRunCode = async () => {
    if (!currentProblem || !studentCode) return

    setIsRunning(true)
    setOutput('')

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: studentCode,
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

  const handleUpdateCode = () => {
    if (!user?.displayName) return

    sendMessage('code-update', {
      code: studentCode,
      username: user.displayName,
    })

    toast({
      title: 'Code Updated',
      description: 'Your code has been updated for the teacher to see.',
    })
  }

  // Add connection status indicator
  const connectionStatus = isConnected ? (
    <div className='text-green-500'>Connected</div>
  ) : (
    <div className='text-red-500'>Disconnected</div>
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='h-screen flex'>
      <div className='w-1/4 border-r p-4 bg-gradient-to-r from-[hsl(var(--background-start))] to-[hsl(var(--background-end))] overflow-y-auto'>
        <h2 className='text-xl font-bold mb-4'>Week {selectedWeek} Problems</h2>
        {connectionStatus}
        <div className='space-y-2'>
          {weekProblems.map((problemId) => {
            const problem = problems[problemId]
            return (
              <Card
                key={problemId}
                className={`cursor-pointer hover:bg-accent ${
                  currentProblem?.id === problemId ? 'border-primary' : ''
                }`}
                onClick={() => {
                  const problem = problems[problemId]
                  setCurrentProblem(problem)
                  setStudentCode(problem.starterCode) // Add this line
                }}
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

      <Split className='flex-1' sizes={[40, 60]} minSize={400}>
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
              </div>
            </>
          )}

          {currentProblem?.examples &&
            currentProblem.id !== 'file-processor' && (
              <div className='mt-4'>
                <h3 className='text-lg font-semibold mb-2'>Examples</h3>
                {currentProblem.examples.map((example) => (
                  <div
                    key={example.id}
                    className='bg-muted p-4 rounded-lg mb-2'
                  >
                    <p>Input: {example.inputText}</p>
                    <p>Output: {example.outputText}</p>
                    {example.explanation && (
                      <p className='text-sm text-muted-foreground mt-1'>
                        {example.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className='flex flex-col'>
          <CodeMirror
            value={studentCode}
            height='60%'
            theme={vscodeDark}
            extensions={[python()]}
            onChange={(value) => setStudentCode(value)}
          />

          {currentProblem?.id === 'file-processor' ? (
            <div className='mt-4'>
              <h3 className='text-lg font-semibold mb-2'>Test Your Solution</h3>
            </div>
          ) : (
            <div className='h-40 p-4 bg-black text-white font-mono text-sm overflow-y-auto'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='h-2 w-2 rounded-full bg-green-500' />
                <span className='text-xs text-gray-400'>Output</span>
              </div>
              <pre>{output || 'No output yet...'}</pre>
            </div>
          )}

          <div className='p-4 border-t flex justify-between'>
            <div className='space-x-2'>
              <Button variant='outline' onClick={() => setIsAiHelpOpen(true)}>
                <Bot className='mr-2 h-4 w-4' />
                AI Help
              </Button>

              <Button onClick={handleUpdateCode}>
                <RefreshCw className='mr-2 h-4 w-4' />
                Update Code
              </Button>

              {currentProblem?.id !== 'file-processor' && (
                <>
                  <Button onClick={handleRunCode} disabled={isRunning}>
                    {isRunning ? (
                      <StopCircle className='mr-2 h-4 w-4' />
                    ) : (
                      <Play className='mr-2 h-4 w-4' />
                    )}
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                  <Button disabled={isRunning}>
                    Submit Solution
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Split>

      <Dialog open={isAiHelpOpen} onOpenChange={setIsAiHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Help</DialogTitle>
            <DialogDescription>Get help with your code</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
