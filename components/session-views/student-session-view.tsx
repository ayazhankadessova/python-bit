import React, { useState, useEffect } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  addDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { useToast } from '@/hooks/use-toast'
import { Play, StopCircle, RefreshCw, Bot } from 'lucide-react'
import Split from 'react-split'
import type { LiveSession, Submission } from '@/types/classrooms/live-session'
import type { Problem } from '@/types/utils'
import { problems } from '@/utils/problems'

interface StudentSessionViewProps {
  classroomId: string
  sessionId: string
}

export function StudentSessionView({ classroomId, sessionId }: StudentSessionViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [studentCode, setStudentCode] = useState<string>('')
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [isAiHelpOpen, setIsAiHelpOpen] = useState<boolean>(false)

  // useEffect(() => {
  //   const sessionRef = collection(
  //     fireStore,
  //     `classrooms/${classroomId}/sessions`
  //   )
  //   const q = query(
  //     sessionRef,
  //     where('endedAt', '==', null),
  //     orderBy('startedAt', 'desc'),
  //     limit(1)
  //   )

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     if (!snapshot.empty) {
  //       const sessionData = snapshot.docs[0].data() as Omit<LiveSession, 'id'>
  //       const session: LiveSession = {
  //         id: snapshot.docs[0].id,
  //         ...sessionData,
  //       }
  //       setCurrentSession(session)

  //       if (user?.displayName && session.students[user.displayName]) {
  //         setStudentCode(session.students[user.displayName].code)
  //       }

  //       // Set current problem based on active task
  //       if (session.activeTask && problems[session.activeTask]) {
  //         setCurrentProblem(problems[session.activeTask])
  //       }
  //     }
  //   })

  //   return () => unsubscribe()
  // }, [classroomId, user?.displayName])

  // const handleUpdateCode = async (): Promise<void> => {
  //   if (!currentSession || !user?.displayName) return

  //   try {
  //     const sessionRef = doc(
  //       fireStore,
  //       `classrooms/${classroomId}/sessions`,
  //       currentSession.id
  //     )

  //     await updateDoc(sessionRef, {
  //       [`students.${user.displayName}.code`]: studentCode,
  //       [`students.${user.displayName}.lastUpdated`]: serverTimestamp(),
  //     })

  //     toast({
  //       title: 'Code Updated',
  //       description: 'Your code has been updated for the teacher to see.',
  //     })
  //   } catch (error) {
  //     console.error('Error updating code:', error)
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to update code',
  //       variant: 'destructive',
  //     })
  //   }
  // }

  // const handleRunCode = async (): Promise<void> => {
  //   if (!currentProblem || !studentCode) return

  //   setIsRunning(true)
  //   setOutput('')

  //   try {
  //     const response = await fetch('/api/execute-code', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         code: studentCode,
  //         functionName: currentProblem.starterFunctionName,
  //         testCases: currentProblem.testCases,
  //       }),
  //     })

  //     const result = await response.json()
  //     setOutput(result.success ? result.output : `Error: ${result.error}`)
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : 'Unknown error occurred'
  //     setOutput(`Error: ${errorMessage}`)
  //   } finally {
  //     setIsRunning(false)
  //   }
  // }

  // const handleSubmitCode = async (): Promise<void> => {
  //   if (!currentSession || !user?.displayName || !currentProblem) return

  //   try {
  //     const submissionData: Omit<Submission, 'submittedAt'> = {
  //       classroomId,
  //       sessionId: currentSession.id,
  //       studentId: user.uid,
  //       taskId: currentProblem.id,
  //       code: studentCode,
  //       weekNumber: currentSession.weekNumber,
  //       executionResult: output,
  //       passed: true, // Add validation logic
  //     }

  //     await addDoc(collection(fireStore, 'submissions'), {
  //       ...submissionData,
  //       submittedAt: serverTimestamp(),
  //     })

  //     const sessionRef = doc(
  //       fireStore,
  //       `classrooms/${classroomId}/sessions`,
  //       currentSession.id
  //     )

  //     await updateDoc(sessionRef, {
  //       [`students.${user.displayName}.submissions`]: arrayUnion({
  //         code: studentCode,
  //         submittedAt: serverTimestamp(),
  //         task: currentProblem.id,
  //       }),
  //     })

  //     toast({
  //       title: 'Success!',
  //       description: 'Solution submitted successfully.',
  //     })
  //   } catch (error) {
  //     console.error('Error submitting code:', error)
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to submit solution',
  //       variant: 'destructive',
  //     })
  //   }
  // }

  // if (!currentSession || !currentProblem) {
  //   return (
  //     <div className='h-screen flex items-center justify-center'>
  //       <p>Waiting for session to start...</p>
  //     </div>
  //   )
  // }

  return (
    <h1>Here</h1>
    // <Split className='h-screen flex' sizes={[40, 60]} minSize={400}>
    //   {/* Left Panel: Problem Description */}
    //   <div className='overflow-y-auto p-6 bg-background'>
    //     <div className='max-w-2xl mx-auto'>
    //       <h1 className='text-2xl font-bold mb-4'>{currentProblem.title}</h1>

    //       <div className='prose dark:prose-invert'>
    //         <div
    //           dangerouslySetInnerHTML={{
    //             __html: currentProblem.problemStatement,
    //           }}
    //         />
    //       </div>

    //       {currentProblem.examples && (
    //         <div className='mt-6'>
    //           <h2 className='text-xl font-semibold mb-4'>Examples</h2>
    //           <div className='space-y-4'>
    //             {currentProblem.examples.map((example) => (
    //               <Card key={example.id} className='p-4'>
    //                 <h3 className='font-medium mb-2'>Input:</h3>
    //                 <pre className='bg-muted p-2 rounded-md mb-2'>
    //                   {example.inputText}
    //                 </pre>
    //                 <h3 className='font-medium mb-2'>Output:</h3>
    //                 <pre className='bg-muted p-2 rounded-md mb-2'>
    //                   {example.outputText}
    //                 </pre>
    //                 {example.explanation && (
    //                   <>
    //                     <h3 className='font-medium mb-2'>Explanation:</h3>
    //                     <p className='text-muted-foreground'>
    //                       {example.explanation}
    //                     </p>
    //                   </>
    //                 )}
    //               </Card>
    //             ))}
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>

    //   {/* Right Panel: Code Editor and Output */}
    //   <div className='flex flex-col'>
    //     <div className='flex-1'>
    //       <CodeMirror
    //         value={studentCode}
    //         height='60vh'
    //         theme={vscodeDark}
    //         extensions={[python()]}
    //         onChange={setStudentCode}
    //       />
    //     </div>

    //     <div className='h-[30vh] bg-black p-4'>
    //       <div className='flex items-center justify-between mb-4'>
    //         <h3 className='text-white font-semibold'>Output</h3>
    //         <div className='space-x-2'>
    //           <Button
    //             variant='outline'
    //             size='sm'
    //             onClick={() => setIsAiHelpOpen(true)}
    //           >
    //             <Bot className='w-4 h-4 mr-2' />
    //             AI Help
    //           </Button>
    //           <Button variant='outline' size='sm' onClick={handleUpdateCode}>
    //             <RefreshCw className='w-4 h-4 mr-2' />
    //             Update Code
    //           </Button>
    //           <Button
    //             variant='outline'
    //             size='sm'
    //             onClick={handleRunCode}
    //             disabled={isRunning}
    //           >
    //             {isRunning ? (
    //               <StopCircle className='w-4 h-4 mr-2' />
    //             ) : (
    //               <Play className='w-4 h-4 mr-2' />
    //             )}
    //             {isRunning ? 'Running...' : 'Run Code'}
    //           </Button>
    //           <Button
    //             variant='default'
    //             size='sm'
    //             onClick={handleSubmitCode}
    //             disabled={isRunning}
    //           >
    //             Submit Solution
    //           </Button>
    //         </div>
    //       </div>
    //       <div className='font-mono text-sm text-white overflow-y-auto max-h-[calc(30vh-4rem)]'>
    //         <pre>{output || 'No output yet...'}</pre>
    //       </div>
    //     </div>
    //   </div>
    // </Split>
  )
}
