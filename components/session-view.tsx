import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import CodeExecutor from '@/components/codeExecutor'
import { Socket } from 'socket.io-client'
import { ShareLink } from '@/components/share-link'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/models/types'
import { BookOpen, CheckCircle2, MessageSquareMore, Play } from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  starterCode: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
}

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
  const [starterCode, setStarterCode] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [students, setStudents] = useState<User[]>([])
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${classroomId}`
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [starter, setStarter] = useState(false)

  useEffect(() => {
    if (!socket) return

    socket.on(
      'session-data',
      (data: { starterCode: string; students: User[]; tasks: Task[] }) => {
        console.log('Received session data:', data)
        setStarterCode(data.starterCode)
        setStudents(data.students)
        setTasks(data.tasks)
        if (role === 'student') {
          setStudentCode(data.starterCode)
        }
        setIsLoading(false)
        console.log('Session data processed, isLoading set to false')
      }
    )

    socket.on(
      'update-participants',
      (updatedParticipants: { students: User[] }) => {
        console.log('Participants updated:', updatedParticipants)
        setStudents(updatedParticipants.students)
      }
    )

    socket.on(
      'student-code-updated',
      (data: { username: string; code: string; completedTasks: number[] }) => {
        console.log('Student code updated:', data)
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.username === data.username
              ? {
                  ...student,
                  code: data.code,
                  completedTasks: data.completedTasks,
                }
              : student
          )
        )
        if (selectedStudent?.username === data.username) {
          setStudentCode(data.code)
        }
        if (role === 'student' && username === data.username) {
          setStudentCode(data.code)
          setCompletedTasks(data.completedTasks || [])
        }
      }
    )

    socket.on(
      'student-code-updated',
      (data: { username: string; code: string; completedTasks: number[] }) => {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.username === data.username
              ? {
                  ...student,
                  code: data.code,
                  completedTasks: data.completedTasks,
                }
              : student
          )
        )
        if (selectedStudent?.username === data.username) {
          setStudentCode(data.code)
        }
        if (role === 'student' && username === data.username) {
          setStudentCode(data.code)
          if (role === 'student' && username === data.username) {
            setStudentCode(data.code)
            setCompletedTasks(data.completedTasks || [])
          }
        }
      }
    )

    socket.on(
      'execution-complete',
      (data: {
        output: string
        error: string | null
        id: string
        exitCode: number
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
          })
        }
      }
    )

    socket.on(
      'submission-result',
      (data: {
        username: string
        taskId: number
        passed: boolean
        output: string
        error: string | null
      }) => {
        console.log('Submission result:', data)
        if (role === 'student' && data.username === username) {
          if (data.passed) {
            const newCompletedTasks = [...completedTasks, data.taskId]
            setCompletedTasks(newCompletedTasks)

            if (currentTaskIndex < tasks.length - 1) {
              toast({
                title: 'Task Completed!',
                description: 'Moving to next task...',
              })
              setCurrentTaskIndex((prev) => prev + 1)
              setStudentCode(tasks[currentTaskIndex + 1].starterCode)
            } else {
              toast({
                title: 'All Tasks Completed!',
                description: 'Congratulations! You have completed all tasks.',
              })
            }
          } else {
            toast({
              title: 'Task Not Completed',
              description:
                "Your output doesn't match the expected output. Try again!",
              variant: 'destructive',
            })
          }
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

    console.log('Emitting join-room event')

    if (!starter) {
      socket.emit('join-room', classroomId, username, role === 'teacher')
      setStarter(true)
    }

    socket.on('session-ended', () => {
      toast({
        title: 'Session Ended',
        description: 'The teacher has ended the session.',
      })
      onEndSession()
    })

    return () => {
      socket.off('session-data')
      socket.off('update-participants')
      socket.off('student-code-updated')
      socket.off('execution-complete')
      socket.off('submission-result')
    }
  }, [
    socket,
    role,
    toast,
    onEndSession,
    selectedStudent,
    username,
    currentTaskIndex,
    tasks,
    completedTasks,
  ])

  const handleRunCode = () => {
    console.log('Running code:', studentCode)
    if (socket && role === 'student') {
      socket.emit('run-code', {
        id: Date.now().toString(),
        code: studentCode,
        classroomId,
        username,
      })
    }
  }

  const handleSendCode = () => {
    if (socket) {
      if (selectedStudent) {
        socket.emit(
          'update-code',
          classroomId,
          selectedStudent.username,
          studentCode,
          selectedStudent.completedTasks
        )
      } else {
        socket.emit('update-starter-code', classroomId, starterCode)
        toast({
          title: 'Code Sent',
          description: 'Code sent to all students.',
        })
      }
    }
  }

  const handleSubmitCode = () => {
    console.log('Submitting code:', studentCode)
    if (socket && role === 'student') {
      socket.emit('submit-code', {
        id: Date.now().toString(),
        code: studentCode,
        classroomId,
        username,
        taskId: tasks[currentTaskIndex].id,
      })
    }
  }

  const handleStudentSelect = (student: User | null) => {
    setSelectedStudent(student)
    if (student) {
      setStudentCode(student.code || '')
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
          <Button onClick={onEndSession} variant='destructive'>
            End Session
          </Button>
        </div>

        <Card className='mb-4'>
          <CardHeader>
            <CardTitle>Class Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className='flex items-center justify-between'
                >
                  <span>{task.title}</span>
                  <span>
                    {
                      students.filter(
                        (s) => s.completedTasks?.includes(task.id) || []
                      ).length
                    }
                    /{students.length} completed
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              {tasks[currentTaskIndex].title}
              <span className='text-sm font-normal'>
                Task {currentTaskIndex + 1}/{tasks.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4'>{tasks[currentTaskIndex].description}</p>
            <CodeExecutor
              code={studentCode}
              onChange={setStudentCode}
              socket={socket}
              classroomId={classroomId}
              username={username}
              role={role}
            />

            <div className='flex gap-2 mt-4'>
              <Button onClick={handleRunCode}>
                Run Code
                <Play className='ml-2 h-4 w-4' />
              </Button>
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

  console.log('Rendering SessionView, isLoading:', isLoading)

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
                        (completedTasks || []).includes(task.id)
                          ? 'bg-green-500'
                          : index === currentTaskIndex
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      {(completedTasks || []).includes(task.id) && (
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
                      {student.completedTasks?.length || 0}/{tasks.length}{' '}
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

// import React, { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// import { Textarea } from '@/components/ui/textarea'
// import CodeExecutor from '@/components/codeExecutor'
// import { Socket } from 'socket.io-client'
// import { ShareLink } from '@/components/share-link'
// import { useToast } from '@/components/hooks/use-toast'
// import { User } from '@/models/types'
// import {
//   CircleHelp,
//   BookOpen,
//   CheckCircle2,
//   MessageSquareMore,
// } from 'lucide-react'
// import { Alert, AlertDescription } from '@/components/ui/alert'

// // Define the task type
// interface Task {
//   id: number
//   title: string
//   description: string
//   starterCode: string
//   testCases: Array<{
//     input: string
//     expectedOutput: string
//   }>
// }

// interface SessionViewProps {
//   classroomId: string
//   onEndSession: () => void
//   socket: Socket | null
//   role: 'teacher' | 'student'
//   username: string
// }

// export function SessionView({
//   classroomId,
//   onEndSession,
//   socket,
//   role,
//   username,
// }: SessionViewProps) {
//   const { toast } = useToast()
//   const [starterCode, setStarterCode] = useState('')
//   const [studentCode, setStudentCode] = useState('')
//   const [students, setStudents] = useState<User[]>([])
//   const [codeError, setCodeError] = useState<string | null>(null)
//   const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
//   const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${classroomId}`

//   // New state for tasks
//   const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
//   const [tasks] = useState<Task[]>([
//     {
//       id: 1,
//       title: 'Draw a Square',
//       description:
//         "Write a program using loops to draw a 5x5 square using '*' characters.",
//       starterCode:
//         '# Use nested loops to create a square\n# Example output:\n# *****\n# *****\n# *****\n# *****\n# *****\n\ndef draw_square():\n    # Your code here\n    pass\n\ndraw_square()',
//       testCases: [
//         {
//           input: '',
//           expectedOutput: '*****\n*****\n*****\n*****\n*****',
//         },
//       ],
//     },
//     {
//       id: 2,
//       title: 'Number Pattern',
//       description:
//         'Create a number pattern using nested loops (1 to 5 in each row, 5 rows).',
//       starterCode:
//         '# Create a pattern like:\n# 1 2 3 4 5\n# 1 2 3 4 5\n# 1 2 3 4 5\n# 1 2 3 4 5\n# 1 2 3 4 5\n\ndef create_pattern():\n    # Your code here\n    pass\n\ncreate_pattern()',
//       testCases: [
//         {
//           input: '',
//           expectedOutput:
//             '1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5',
//         },
//       ],
//     },
//     {
//       id: 3,
//       title: 'Multiplication Table',
//       description:
//         'Create a multiplication table for numbers 1-5 using nested loops.',
//       starterCode:
//         '# Create a 5x5 multiplication table\n# Example:\n# 1  2  3  4  5\n# 2  4  6  8  10\n# 3  6  9  12 15\n# 4  8  12 16 20\n# 5  10 15 20 25\n\ndef create_multiplication_table():\n    # Your code here\n    pass\n\ncreate_multiplication_table()',
//       testCases: [
//         {
//           input: '',
//           expectedOutput:
//             '1 2 3 4 5\n2 4 6 8 10\n3 6 9 12 15\n4 8 12 16 20\n5 10 15 20 25',
//         },
//       ],
//     },
//   ])

//   const validateCode = (code: string) => {
//     // Basic syntax validation
//     try {
//       const quotes = code.match(/["']/g) || []
//       if (quotes.length % 2 !== 0) {
//         setCodeError('Mismatched quotes in your code')
//         return false
//       }

//       const brackets = code.match(/[\(\)\[\]\{\}]/g) || []
//       const stack = []
//       const bracketPairs: { [key: string]: string } = {
//         '(': ')',
//         '[': ']',
//         '{': '}',
//       }

//       for (const bracket of brackets) {
//         if (['(', '[', '{'].includes(bracket)) {
//           stack.push(bracket)
//         } else {
//           const lastOpen = stack.pop()
//           if (!lastOpen || bracketPairs[lastOpen] !== bracket) {
//             setCodeError('Mismatched brackets in your code')
//             return false
//           }
//         }
//       }

//       if (stack.length > 0) {
//         setCodeError('Unclosed brackets in your code')
//         return false
//       }

//       setCodeError(null)
//       return true
//     } catch (error) {
//       setCodeError(error.message)
//       return false
//     }
//   }

//   useEffect(() => {
//     if (socket) {
//       socket.on(
//         'session-data',
//         (data: { starterCode: string; students: User[] }) => {
//           setStarterCode(data.starterCode)
//           setStudents(data.students)
//           if (role === 'student') {
//             setStudentCode(data.starterCode)
//           }
//         }
//       )

//       socket.on(
//         'update-participants',
//         (updatedParticipants: { students: User[] }) => {
//           setStudents(updatedParticipants.students)
//         }
//       )

//       socket.on(
//         'starter-code-updated',
//         (data: { starterCode: string; students: User[] }) => {
//           setStarterCode(data.starterCode)
//           setStudents(data.students)
//           if (role === 'student') {
//             setStudentCode(data.starterCode)
//           }
//           toast({
//             title: 'Starter Code Updated',
//             description: 'The teacher has updated the starter code.',
//           })
//         }
//       )

//       socket.on(
//         'student-code-updated',
//         (data: { username: string; code: string }) => {
//           setStudents((prevStudents) =>
//             prevStudents.map((student) =>
//               student.username === data.username
//                 ? { ...student, code: data.code }
//                 : student
//             )
//           )
//           if (selectedStudent && selectedStudent.username === data.username) {
//             setStudentCode(data.code)
//           }
//           if (role === 'student' && username === data.username) {
//             setStudentCode(data.code)
//           }
//         }
//       )

//       socket.on('participant-left', (leftUsername: string) => {
//         setStudents((prevStudents) =>
//           prevStudents.filter((student) => student.username !== leftUsername)
//         )
//         if (selectedStudent && selectedStudent.username === leftUsername) {
//           setSelectedStudent(null)
//         }
//       })

//       socket.on('session-ended', () => {
//         toast({
//           title: 'Session Ended',
//           description: 'The teacher has ended the session.',
//         })
//         onEndSession()
//       })

//       socket.on('execution-complete', ({ output, error }) => {
//         if (role === 'student') {
//           const currentTask = tasks[currentTaskIndex]
//           const passed = currentTask.testCases.every(
//             (testCase) => output.trim() === testCase.expectedOutput.trim()
//           )

//           if (passed && currentTaskIndex < tasks.length - 1) {
//             toast({
//               title: 'Task Completed!',
//               description: 'Moving to next task...',
//             })
//             setCurrentTaskIndex((prev) => prev + 1)
//           }
//         }
//       })

//       return () => {
//         socket.off('session-data')
//         socket.off('update-participants')
//         socket.off('starter-code-updated')
//         socket.off('student-code-updated')
//         socket.off('participant-left')
//         socket.off('session-ended')
//         socket.off('execution-complete')
//       }
//     }
//   }, [
//     socket,
//     role,
//     toast,
//     onEndSession,
//     selectedStudent,
//     username,
//     currentTaskIndex,
//     tasks,
//   ])

//   const handleSendCode = () => {
//     if (socket) {
//       if (selectedStudent) {
//         socket.emit(
//           'update-code',
//           classroomId,
//           selectedStudent.username,
//           studentCode
//         )
//       } else {
//         socket.emit('update-starter-code', classroomId, starterCode)
//         toast({
//           title: 'Code Sent',
//           description: 'Code sent to all students.',
//         })
//       }
//     }
//   }

//   const handleUpdateCode = () => {
//     if (socket && role === 'student') {
//       socket.emit('update-code', classroomId, username, studentCode)
//     }
//   }

//   const handleStudentSelect = (student: User | null) => {
//     setSelectedStudent(student)
//     if (student) {
//       setStudentCode(student.code || '')
//     }
//   }

//   const renderTeacherView = () => (
//     <div className='w-2/3 p-4'>
//       <div className='flex justify-between mb-4'>
//         <ShareLink fullLink={inviteLink} />
//         <Button onClick={onEndSession} variant='destructive'>
//           End Session
//         </Button>
//       </div>

//       <Card className='mb-4'>
//         <CardHeader>
//           <CardTitle>Current Lesson Progress</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className='space-y-2'>
//             {tasks.map((task, index) => (
//               <div key={task.id} className='flex items-center justify-between'>
//                 <span>{task.title}</span>
//                 <span>
//                   {
//                     students.filter((s) => s.completedTasks?.includes(task.id))
//                       .length
//                   }
//                   /{students.length} completed
//                 </span>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       <CodeExecutor
//         code={selectedStudent ? studentCode : starterCode}
//         onChange={(code) => {
//           if (selectedStudent) {
//             setStudentCode(code)
//           } else {
//             setStarterCode(code)
//           }
//           validateCode(code)
//         }}
//         socket={socket}
//         classroomId={classroomId}
//         username={username}
//         role={role}
//       />

//       {codeError && (
//         <Alert variant='destructive' className='mt-4'>
//           <AlertDescription>{codeError}</AlertDescription>
//         </Alert>
//       )}

//       <Button onClick={handleSendCode} className='mt-4'>
//         {selectedStudent
//           ? `Send Code to ${selectedStudent.username}`
//           : 'Send Code to All Students'}
//       </Button>
//     </div>
//   )

//   const renderStudentView = () => (
//     <div className='w-2/3 p-4'>
//       <div className='flex justify-between mb-4'>
//         <div className='flex gap-2'>
//           <Button variant='outline'>
//             <BookOpen className='mr-2 h-4 w-4' />
//             Reference Guide
//           </Button>
//           <Button className='bg-zinc-950'>
//             <MessageSquareMore className='mr-2 h-4 w-4' />
//             Ask AI Help
//           </Button>
//         </div>
//         <Button onClick={onEndSession} variant='destructive'>
//           Leave Room
//         </Button>
//       </div>

//       <Card className='mb-4'>
//         <CardHeader>
//           <CardTitle className='flex items-center justify-between'>
//             {tasks[currentTaskIndex].title}
//             <span className='text-sm font-normal'>
//               Task {currentTaskIndex + 1}/{tasks.length}
//             </span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className='mb-4'>{tasks[currentTaskIndex].description}</p>
//           <CodeExecutor
//             code={studentCode}
//             onChange={(code) => {
//               setStudentCode(code)
//               validateCode(code)
//             }}
//             socket={socket}
//             classroomId={classroomId}
//             username={username}
//             role={role}
//           />

//           {codeError && (
//             <Alert variant='destructive' className='mt-4'>
//               <AlertDescription>{codeError}</AlertDescription>
//             </Alert>
//           )}

//           <Button onClick={handleUpdateCode} className='mt-4'>
//             Run Code
//             <CheckCircle2 className='ml-2 h-4 w-4' />
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   )

//   return (
//     <div className='flex h-screen'>
//       <div className='w-1/3 p-4 border-r'>
//         <h2 className='text-2xl font-bold mb-4'>
//           {role === 'teacher'
//             ? `${username}'s Classroom`
//             : `${username}'s Progress`}
//         </h2>

//         {role === 'student' ? (
//           <Card className='mb-4'>
//             <CardHeader>
//               <CardTitle>Your Progress</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className='space-y-2'>
//                 {tasks.map((task, index) => (
//                   <div key={task.id} className='flex items-center'>
//                     <div
//                       className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
//                         index < currentTaskIndex
//                           ? 'bg-green-500'
//                           : index === currentTaskIndex
//                           ? 'bg-blue-500'
//                           : 'bg-gray-200'
//                       }`}
//                     >
//                       {index < currentTaskIndex && (
//                         <CheckCircle2 className='h-4 w-4 text-white' />
//                       )}
//                     </div>
//                     <span>{task.title}</span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         ) : (
//           // Teacher's student list view remains the same
//           <>
//             {students.map((student) => (
//               <Card
//                 key={student.username}
//                 className={`mb-2 cursor-pointer ${
//                   selectedStudent?.username === student.username
//                     ? 'border-blue-500'
//                     : ''
//                 }`}
//                 onClick={() => handleStudentSelect(student)}
//               >
//                 <CardHeader>
//                   <CardTitle className='flex items-center justify-between'>
//                     {student.username}
//                     <span className='text-sm font-normal'>
//                       Task {(student.completedTasks?.length || 0) + 1}/
//                       {tasks.length}
//                     </span>
//                   </CardTitle>
//                 </CardHeader>
//               </Card>
//             ))}
//           </>
//         )}
//       </div>

//       {role === 'teacher' ? renderTeacherView() : renderStudentView()}
//     </div>
//   )
// }

// export default SessionView
