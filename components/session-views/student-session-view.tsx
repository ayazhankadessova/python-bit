import React, { useState, useEffect } from 'react'
import { doc, onSnapshot, updateDoc} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { useToast } from '@/hooks/use-toast'
import { Play, StopCircle, RefreshCw, Bot } from 'lucide-react'
import Split from 'react-split'
import type {
  LiveSession,
  CodeSubmission,
} from '@/types/classrooms/live-session'
import type { Problem } from '@/types/utils'
import { problems } from '@/utils/problems'

interface StudentSessionViewProps {
  classroomId: string
  sessionId: string
  onEndSession: () => void
}

export function StudentSessionView({
  classroomId,
  sessionId, 
  onEndSession,
}: StudentSessionViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [studentCode, setStudentCode] = useState<string>('')
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [isAiHelpOpen, setIsAiHelpOpen] = useState<boolean>(false)

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
        if (session.activeTask && problems['hello-world']) {
          setCurrentProblem(problems['hello-world'])
        }

        // Set student code if available
        if (user?.displayName && session.students[user.displayName]) {
          setStudentCode(session.students[user.displayName].code)
        }
      }
    })

    return () => unsubscribe()
  }, [sessionId, classroomId, user?.displayName])

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

  const handleRunCode = async (): Promise<void> => {
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
          testCases: currentProblem.testCases,
        }),
      })

      const result = await response.json()
      setOutput(result.success ? result.output : `Error: ${result.error}`)
    } catch (error) {
      setOutput(
        `Error: ${
          error instanceof Error ? error.message : 'Unknown error occurred'
        }`
      )
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmitCode = async (): Promise<void> => {
    if (!currentSession || !user?.displayName || !currentProblem) return

    try {
      const now = Date.now()
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions/${sessionId}`
      )

      // Create new submission
      const newSubmission: CodeSubmission = {
        code: studentCode,
        submittedAt: now,
        task: currentProblem.id,
      }

      // Get current submissions array or initialize empty
      const currentSubmissions =
        currentSession.students[user.displayName]?.submissions || []

      // Update session with new submission
      await updateDoc(sessionRef, {
        [`students.${user.displayName}`]: {
          code: studentCode,
          lastUpdated: now,
          submissions: [...currentSubmissions, newSubmission],
        },
      })

      toast({
        title: 'Success!',
        description: 'Solution submitted successfully.',
      })
    } catch (error) {
      console.error('Error submitting code:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit solution',
        variant: 'destructive',
      })
    }
  }

  if (!currentSession) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p>Loading session...</p>
        <Button
          className='mt-4'
          onClick={onEndSession}
        >Go back to Classroom</Button>
      </div>
    )
  }

  // Check if session has ended
  if (currentSession.endedAt) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p>This session has ended.</p>
        <Button className='mt-4' onClick={onEndSession}>
          Go back to Classroom
        </Button>
      </div>
    )
  }

  return (
    <Split className='h-screen flex' sizes={[40, 60]} minSize={400}>
      {/* Left Panel: Problem Description */}
      <div className='overflow-y-auto p-6 bg-background'>
        <div className='max-w-2xl mx-auto'>
          {/* <h1 className='text-2xl font-bold mb-4'>{currentProblem?.title}</h1>
          <div className='prose dark:prose-invert'>
            <div
              dangerouslySetInnerHTML={{
                __html: currentProblem.problemStatement,
              }}
            />
          </div>

          {currentProblem.examples && (
            <div className='mt-6'>
              <h2 className='text-xl font-semibold mb-4'>Examples</h2>
              <div className='space-y-4'>
                {currentProblem.examples.map((example) => (
                  <Card key={example.id} className='p-4'>
                    <h3 className='font-medium mb-2'>Input:</h3>
                    <pre className='bg-muted p-2 rounded-md mb-2'>
                      {example.inputText}
                    </pre>
                    <h3 className='font-medium mb-2'>Output:</h3>
                    <pre className='bg-muted p-2 rounded-md mb-2'>
                      {example.outputText}
                    </pre>
                    {example.explanation && (
                      <>
                        <h3 className='font-medium mb-2'>Explanation:</h3>
                        <p className='text-muted-foreground'>
                          {example.explanation}
                        </p>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Right Panel: Code Editor and Output */}
      <div className='flex flex-col'>
        <div className='flex-1'>
          <CodeMirror
            value={studentCode}
            height='60vh'
            theme={vscodeDark}
            extensions={[python()]}
            onChange={setStudentCode}
          />
        </div>

        <div className='h-[30vh] bg-black p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-white font-semibold'>Output</h3>
            <div className='space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsAiHelpOpen(true)}
              >
                <Bot className='w-4 h-4 mr-2' />
                AI Help
              </Button>
              <Button variant='outline' size='sm' onClick={handleUpdateCode}>
                <RefreshCw className='w-4 h-4 mr-2' />
                Update Code
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRunCode}
                disabled={isRunning}
              >
                {isRunning ? (
                  <StopCircle className='w-4 h-4 mr-2' />
                ) : (
                  <Play className='w-4 h-4 mr-2' />
                )}
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button
                variant='default'
                size='sm'
                onClick={handleSubmitCode}
                disabled={isRunning}
              >
                Submit Solution
              </Button>
            </div>
          </div>
          <div className='font-mono text-sm text-white overflow-y-auto max-h-[calc(30vh-4rem)]'>
            <pre>{output || 'No output yet...'}</pre>
          </div>
        </div>
      </div>
    </Split>
  )
}

export default StudentSessionView
