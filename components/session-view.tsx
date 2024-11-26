// // import React, { useState, useEffect, useRef, useCallback } from 'react'
// // import { Button } from '@/components/ui/button'
// // import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// // import CodeExecutor from '@/components/codeExecutor'
// // import { Socket } from 'socket.io-client'
// // import { ShareLink } from '@/components/share-link'
// // import { LessonProgressCard } from '@/components/lesson-progress-card'
// // import { useToast } from '@/hooks/use-toast'
// // import {
// //   User,
// //   Task,
// //   Classroom,
// //   Curriculum,
// //   Assignment,
// //   WeeklyProgress,
// // } from '@/models/types'
// // import { BookOpen, CheckCircle2, MessageSquareMore, Play } from 'lucide-react'
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// // } from '@/components/ui/dialog'
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from '@/components/ui/select'
// // import CodeMirror from '@uiw/react-codemirror'
// // import { vscodeDark } from '@uiw/codemirror-theme-vscode'
// // import { python } from '@codemirror/lang-python'

// // interface SessionViewProps {
// //   classroomId: string
// //   onEndSession: () => void
// //   socket: Socket | null
// //   role: 'teacher' | 'student'
// //   username: string
// // }

// // export function SessionView({
// //   classroomId,
// //   onEndSession,
// //   socket,
// //   role,
// //   username,
// // }: SessionViewProps) {
// //   const { toast } = useToast()
// //   const [classroom, setClassroom] = useState<Classroom | null>(null)
// //   const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
// //   const [studentCode, setStudentCode] = useState('')
// //   const [students, setStudents] = useState<User[]>([])
// //   const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
// //   const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${classroomId}`
// //   const [completedTasks, setCompletedTasks] = useState<number[]>([])
// //   const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
// //   const [tasks, setTasks] = useState<Task[]>([])
// //   const [isLoading, setIsLoading] = useState(true)
// //   const joinedRoom = useRef(false)
// //   const [isWeekSelectionOpen, setIsWeekSelectionOpen] = useState(false)
// //   const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
// //   const [totalWeeks, setTotalWeeks] = useState(0)
// //   const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(
// //     null
// //   )
// //   const [teacherCode, setTeacherCode] = useState('')

// //   useEffect(() => {
// //     const currentTask = tasks[currentTaskIndex]
// //     if (currentTask?.starterCode && !studentCode) {
// //       setStudentCode(currentTask.starterCode)
// //     }
// //   }, [currentTaskIndex, tasks, studentCode])

// //   const fetchTasks = useCallback(
// //     async (weekNumber: number, curriculumData: Curriculum) => {
// //       const weekData = curriculumData.weeks.find(
// //         (week) => week.weekNumber === weekNumber
// //       )
// //       if (!weekData) {
// //         console.error('Week data not found')
// //         return
// //       }

// //       try {
// //         const tasksResponse = await fetch(
// //           `/api/assignments/${weekData.assignmentId}`
// //         )
// //         if (!tasksResponse.ok) {
// //           throw new Error('Failed to fetch week tasks')
// //         }
// //         const weekTasks = await tasksResponse.json()
// //         setTasks(weekTasks.tasks || [])
// //       } catch (error) {
// //         console.error('Error fetching tasks:', error)
// //         toast({
// //           title: 'Error',
// //           description: 'Failed to fetch tasks',
// //           variant: 'destructive',
// //         })
// //       }
// //     },
// //     [toast]
// //   )

// //   const fetchClassroomData = useCallback(async () => {
// //     try {
// //       setIsLoading(true)

// //       // Fetch classroom data
// //       const classroomResponse = await fetch(`/api/classroom/${classroomId}`)
// //       if (!classroomResponse.ok) {
// //         throw new Error('Failed to fetch classroom data')
// //       }
// //       const classroomData: Classroom = await classroomResponse.json()
// //       setClassroom(classroomData)

// //       // Fetch curriculum data
// //       const curriculumResponse = await fetch(
// //         `/api/curriculum/${classroomData.curriculumId}`
// //       )
// //       if (!curriculumResponse.ok) {
// //         throw new Error('Failed to fetch curriculum data')
// //       }
// //       const curriculumData: Curriculum = await curriculumResponse.json()
// //       setCurriculum(curriculumData)
// //       setTotalWeeks(curriculumData.weeks.length)

// //       if (classroomData.lastTaughtWeek > 0 && role == 'student') {
// //         // Fetch weekly progress
// //         const progressResponse = await fetch(
// //           `/api/weekly-progress?classroomId=${classroomId}&weekNumber=${classroomData.lastTaughtWeek}`
// //         )
// //         if (!progressResponse.ok) {
// //           throw new Error('Failed to fetch weekly progress')
// //         }
// //         const progressData: WeeklyProgress = await progressResponse.json()
// //         setWeeklyProgress(progressData)

// //         // Fetch assignment data
// //         const weekData = curriculumData.weeks.find(
// //           (week) => week.weekNumber === classroomData.lastTaughtWeek
// //         )
// //         if (weekData) {
// //           const assignmentResponse = await fetch(
// //             `/api/assignments/${weekData.assignmentId}`
// //           )
// //           if (!assignmentResponse.ok) {
// //             throw new Error('Failed to fetch assignment data')
// //           }
// //           const assignmentData: Assignment = await assignmentResponse.json()
// //           setTasks(assignmentData.tasks)

// //           // Handle student-specific data
// //           if (role === 'student') {
// //             const completedTasks = progressData.tasks
// //               .filter((task) =>
// //                 task.completedBy.some((completion) => completion === username)
// //               )
// //               .map((task) => task.taskId)
// //             setCompletedTasks(completedTasks)

// //             // Set the code for the current task if it exists
// //             const currentTask = progressData.tasks.find(
// //               (task) =>
// //                 task.taskId === assignmentData.tasks[currentTaskIndex]?.id
// //             )
// //             const userCompletion = currentTask?.completedBy.find(
// //               (completion) => completion === username
// //             )
// //             // if (userCompletion) {
// //             //   setStudentCode(userCompletion.code)
// //             // }
// //           }
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error fetching data:', error)
// //       toast({
// //         title: 'Error',
// //         description: 'Failed to fetch classroom or curriculum data',
// //         variant: 'destructive',
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }, [classroomId, role, username, toast, currentTaskIndex])

// //   useEffect(() => {
// //     fetchClassroomData()
// //   }, [fetchClassroomData])

// //   const handleStartWeek = async () => {
// //     if (selectedWeek === null || !classroom || !curriculum) return

// //     try {
// //       const updateResponse = await fetch(`/api/classroom/${classroomId}`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ lastTaughtWeek: selectedWeek }),
// //       })

// //       if (!updateResponse.ok) {
// //         throw new Error('Failed to update last taught week')
// //       }

// //       const updatedClassroom = await updateResponse.json()
// //       setClassroom(updatedClassroom)

// //       await fetchTasks(selectedWeek, curriculum)
// //       setCurrentTaskIndex(0)

// //       setIsWeekSelectionOpen(false)
// //       toast({
// //         title: 'Week Started',
// //         description: `Week ${selectedWeek} has been started. You can now invite students.`,
// //         variant: 'light',
// //       })
// //     } catch (error) {
// //       console.error('Error starting week:', error)
// //       toast({
// //         title: 'Error',
// //         description: 'Failed to start the week. Please try again.',
// //         variant: 'destructive',
// //       })
// //     }
// //   }

// //   useEffect(() => {
// //     if (!socket) return

// //     if (!joinedRoom.current) {
// //       console.log('Emitting join-room event')
// //       socket.emit('join-room', classroomId, username, role === 'teacher')
// //       joinedRoom.current = true
// //     }

// //     socket.on(
// //       'update-participants',
// //       (data: { teacher: string; students: User[] }) => {
// //         setStudents(data.students)
// //       }
// //     )

// //     socket.on('student-code', (data: { username: string; code: string }) => {
// //       console.log('Received student-code event:', data)
// //       if (selectedStudent && selectedStudent.username === data.username) {
// //         setStudentCode(data.code)
// //       }
// //       // Also update the students array to keep it in sync
// //       setStudents((prevStudents) =>
// //         prevStudents.map((student) =>
// //           student.username === data.username
// //             ? { ...student, code: data.code }
// //             : student
// //         )
// //       )

// //       if (selectedStudent?.username === data.username) {
// //         setStudentCode(data.code)
// //       }

// //       if (username === data.username) {
// //         setStudentCode(data.code)
// //       }
// //     })

// //     socket.on(
// //       'execution-complete',
// //       (data: {
// //         id: string
// //         exitCode: number
// //         output: string
// //         error: string
// //       }) => {
// //         console.log('Execution complete:', data)
// //         if (data.error || data.exitCode !== 0) {
// //           toast({
// //             title: 'Execution Error',
// //             description:
// //               data.error || 'An error occurred during code execution.',
// //             variant: 'destructive',
// //           })
// //         } else {
// //           toast({
// //             title: 'Code Executed',
// //             description: 'Your code has been executed successfully.',
// //             variant: 'light',
// //           })
// //         }
// //       }
// //     )

// //     socket.on('participant-left', (leftUsername: string) => {
// //       setStudents((prevStudents) =>
// //         prevStudents.filter((student) => student.username !== leftUsername)
// //       )
// //       if (selectedStudent?.username === leftUsername) {
// //         setSelectedStudent(null)
// //       }
// //     })

// //     socket.on('session-ended', () => {
// //       toast({
// //         title: 'Session Ended',
// //         description: 'The teacher has ended the session.',
// //         variant: 'light',
// //       })
// //       onEndSession()
// //     })

// //     return () => {
// //       socket.off('update-participants')
// //       socket.off('student-code-updated')
// //       socket.off('execution-complete')
// //       socket.off('participant-left')
// //       socket.off('session-ended')
// //       socket.off('student-progress-updated')
// //       socket.off('student-code')
// //     }
// //   }, [
// //     socket,
// //     role,
// //     toast,
// //     onEndSession,
// //     selectedStudent,
// //     username,
// //     classroomId,
// //   ])

// //   const handleSendCode = () => {
// //     if (socket) {
// //       if (selectedStudent) {
// //         console.log(`Sending code to ${selectedStudent.username}:`, studentCode)
// //         socket.emit(
// //           'update-code',
// //           classroomId,
// //           selectedStudent.username,
// //           studentCode
// //         )
// //         toast({
// //           title: 'Code Sent',
// //           description: `Code sent to ${selectedStudent.username}.`,
// //           variant: 'light',
// //         })
// //       } else {
// //         console.log('Sending code to all students:', teacherCode)
// //         socket.emit('send-code-to-all', classroomId, teacherCode)
// //         // Update all student codes in the local state
// //         setStudents((prevStudents) =>
// //           prevStudents.map((student) => ({
// //             ...student,
// //             code: teacherCode,
// //           }))
// //         )
// //         toast({
// //           title: 'Code Sent',
// //           description: 'Code sent to all students.',
// //           variant: 'light',
// //         })
// //       }
// //     }
// //   }

// //   const handleSubmitCode = async () => {
// //     if (role === 'student' && tasks.length > 0 && classroom) {
// //       try {
// //         // Update code in socket server before submission
// //         socket?.emit('update-code', classroomId, username, studentCode)

// //         const response = await fetch('/api/submit-code', {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({
// //             code: studentCode,
// //             classroomId,
// //             username,
// //             taskId: tasks[currentTaskIndex].id,
// //             weekNumber: classroom.lastTaughtWeek,
// //           }),
// //         })

// //         if (!response.ok) {
// //           throw new Error('Failed to submit code')
// //         }

// //         const result = await response.json()

// //         if (result.passed) {
// //           toast({
// //             title: 'Task Completed',
// //             description: 'Your code passed all test cases!',
// //             variant: 'success',
// //           })
// //           setCompletedTasks((prev) => [...prev, tasks[currentTaskIndex].id])
// //           if (currentTaskIndex < tasks.length - 1) {
// //             setCurrentTaskIndex(currentTaskIndex + 1)
// //           }
// //         } else {
// //           toast({
// //             title: 'Task Not Completed',
// //             description: 'Your code did not pass all test cases. Try again!',
// //             variant: 'destructive',
// //           })
// //         }
// //       } catch (error) {
// //         console.error('Error submitting code:', error)
// //         toast({
// //           title: 'Error',
// //           description: 'Failed to submit code. Please try again.',
// //           variant: 'destructive',
// //         })
// //       }
// //     }
// //   }

// //   const handleWeekSelect = (week: string) => {
// //     setSelectedWeek(parseInt(week))
// //   }

// //   const handleStudentSelect = (student: User | null) => {
// //     // If clicking the already selected student, deselect them
// //     if (selectedStudent?.username === student?.username) {
// //       setSelectedStudent(null)
// //       setStudentCode(teacherCode)
// //       return
// //     }

// //     setSelectedStudent(student)
// //     if (student) {
// //       console.log('Requesting code for student:', student.username)
// //       socket?.emit('get-student-code', classroomId, student.username)

// //       const currentStudent = students.find(
// //         (s) => s.username === student.username
// //       )
// //       if (currentStudent?.code) {
// //         setStudentCode(currentStudent.code)
// //       }
// //     } else {
// //       setStudentCode(teacherCode)
// //     }
// //   }

// //   const renderTeacherView = () => {
// //     if (isLoading) {
// //       return (
// //         <div className='w-2/3 p-4'>
// //           <Card className='mb-4'>
// //             <CardContent>
// //               <p>Loading session data...</p>
// //             </CardContent>
// //           </Card>
// //         </div>
// //       )
// //     }

// //     return (
// //       <div className='w-2/3 p-4'>
// //         <div className='flex justify-between mb-4'>
// //           <ShareLink fullLink={inviteLink} />
// //           <Button onClick={() => setIsWeekSelectionOpen(true)}>
// //             Select Week
// //           </Button>
// //           <Button onClick={onEndSession} variant='destructive'>
// //             End Session
// //           </Button>
// //         </div>

// //         <Dialog
// //           open={isWeekSelectionOpen}
// //           onOpenChange={setIsWeekSelectionOpen}
// //         >
// //           <DialogContent>
// //             <DialogHeader>
// //               <DialogTitle>Select Week to Start</DialogTitle>
// //               <DialogDescription>
// //                 Last taught week: {classroom?.lastTaughtWeek || 'None'}
// //               </DialogDescription>
// //             </DialogHeader>
// //             <Select onValueChange={handleWeekSelect}>
// //               <SelectTrigger>
// //                 <SelectValue placeholder='Select a week' />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {[...Array(totalWeeks)].map((_, i) => (
// //                   <SelectItem key={i} value={(i + 1).toString()}>
// //                     Week {i + 1}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //             <Button onClick={handleStartWeek}>Start Week</Button>
// //           </DialogContent>
// //         </Dialog>

// //         {selectedWeek && classroom && classroom.students && (
// //           <LessonProgressCard
// //             classroomId={classroomId}
// //             weekNumber={selectedWeek}
// //             tasks={tasks}
// //             classroom={classroom}
// //           />
// //         )}

// //         <CodeExecutor
// //           code={selectedStudent ? studentCode : teacherCode}
// //           onChange={selectedStudent ? setStudentCode : setTeacherCode} // Changed from setStarterCode to setTeacherCode
// //           socket={socket}
// //           classroomId={classroomId}
// //           username={username}
// //           role={role}
// //         />
// //       <Button onClick={handleSendCode} className='mt-4'>
// //           {selectedStudent
// //             ? `Send Code to ${selectedStudent.username}`
// //             : 'Send Code to All Students'}
// //         </Button>
// //       </div>
// //     )
// //   }

// //   const renderStudentView = () => {
// //     if (isLoading) {
// //       return (
// //         <div className='w-2/3 p-4'>
// //           <Card className='mb-4'>
// //             <CardContent>
// //               <p>Loading session data...</p>
// //             </CardContent>
// //           </Card>
// //         </div>
// //       )
// //     }

// //     const currentTask = tasks[currentTaskIndex]

// //     return (
// //       <div className='w-2/3 p-4'>
// //         <div className='flex justify-between mb-4'>
// //           <div className='flex gap-2'>
// //             <Button variant='outline'>
// //               <BookOpen className='mr-2 h-4 w-4' />
// //               Reference Guide
// //             </Button>
// //             <Button className='bg-zinc-950'>
// //               <MessageSquareMore className='mr-2 h-4 w-4' />
// //               Ask AI Help
// //             </Button>
// //           </div>
// //           <Button onClick={onEndSession} variant='destructive'>
// //             Leave Room
// //           </Button>
// //         </div>

// //         <Card className='mb-4'>
// //           <CardHeader>
// //             <CardTitle className='flex items-center justify-between'>
// //               {currentTask?.title}
// //               <span className='text-sm font-normal'>
// //                 Task {currentTaskIndex + 1}/{tasks.length}
// //               </span>
// //             </CardTitle>
// //           </CardHeader>
// //           <CardContent>
// //             <p className='mb-4'>{currentTask?.description}</p>

// //             {/* Starter Code Section */}
// //             {currentTask?.starterCode && (
// //               <div className='mb-4'>
// //                 <div className='flex items-center justify-between mb-2'>
// //                   <h3 className='text-sm font-medium text-gray-500'>
// //                     Starter Code
// //                   </h3>
// //                   <Button
// //                     variant='outline'
// //                     size='sm'
// //                     onClick={() => setStudentCode(currentTask.starterCode)}
// //                   >
// //                     Reset to Starter Code
// //                   </Button>
// //                 </div>
// //                 <div className='bg-gray-100 p-4 rounded-md'>
// //                   <pre className='text-sm overflow-x-auto'>
// //                     <code>{currentTask.starterCode}</code>
// //                   </pre>
// //                 </div>
// //               </div>
// //             )}

// //             <CodeExecutor
// //               code={studentCode}
// //               onChange={setStudentCode}
// //               socket={socket}
// //               classroomId={classroomId}
// //               username={username}
// //               role={role}
// //             />

// //             <div className='flex justify-between mt-4'>
// //               <Button onClick={handleSubmitCode}>
// //                 Submit Code
// //                 <CheckCircle2 className='ml-2 h-4 w-4' />
// //               </Button>

// //               {currentTask?.starterCode && (
// //                 <Button
// //                   variant='outline'
// //                   onClick={() => setStudentCode(currentTask.starterCode)}
// //                 >
// //                   Reset Code
// //                 </Button>
// //               )}
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className='flex h-screen'>
// //       <div className='w-1/3 p-4 border-r'>
// //         <h2 className='text-2xl font-bold mb-4'>
// //           {role === 'teacher'
// //             ? `${username}'s Classroom`
// //             : `${username}'s Progress`}
// //         </h2>

// //         {isLoading ? (
// //           <Card className='mb-4'>
// //             <CardContent>
// //               <p>Loading session data...</p>
// //             </CardContent>
// //           </Card>
// //         ) : role === 'student' ? (
// //           <Card className='mb-4'>
// //             <CardHeader>
// //               <CardTitle>Your Progress</CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className='space-y-2'>
// //                 {tasks.map((task, index) => (
// //                   <div key={task.id} className='flex items-center'>
// //                     <div
// //                       className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
// //                         completedTasks.includes(task.id)
// //                           ? 'bg-green-500'
// //                           : index === currentTaskIndex
// //                           ? 'bg-blue-500'
// //                           : 'bg-gray-200'
// //                       }`}
// //                     >
// //                       {completedTasks.includes(task.id) && (
// //                         <CheckCircle2 className='h-4 w-4 text-white' />
// //                       )}
// //                     </div>
// //                     <span>{task.title}</span>
// //                   </div>
// //                 ))}
// //               </div>
// //             </CardContent>
// //           </Card>
// //         ) : (
// //           <>
// //             {students.map((student) => (
// //               <Card
// //                 key={student.username}
// //                 className={`mb-2 cursor-pointer ${
// //                   selectedStudent?.username === student.username
// //                     ? 'border-blue-500'
// //                     : ''
// //                 }`}
// //                 onClick={() => handleStudentSelect(student)}
// //               >
// //                 <CardHeader>
// //                   <CardTitle className='flex items-center justify-between'>
// //                     {student.username}
// //                     <span className='text-sm font-normal'>
// //                       {/* {student.completedTasks?.length || 0}/{tasks.length}{' '} */}
// //                       completed
// //                     </span>
// //                   </CardTitle>
// //                 </CardHeader>
// //               </Card>
// //             ))}
// //           </>
// //         )}
// //       </div>

// //       {role === 'teacher' ? renderTeacherView() : renderStudentView()}
// //     </div>
// //   )
// // }

// // export default SessionView
// import React, { useState, useEffect, useRef, useCallback } from 'react'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardFooter,
// } from '@/components/ui/card'
// import { Socket } from 'socket.io-client'
// import { ShareLink } from '@/components/share-link'
// import { LessonProgressCard } from '@/components/lesson-progress-card'
// import { useToast } from '@/hooks/use-toast'
// import Split from 'react-split'
// import CodeMirror from '@uiw/react-codemirror'
// import { vscodeDark } from '@uiw/codemirror-theme-vscode'
// import { python } from '@codemirror/lang-python'
// import {
//   doc,
//   getDoc,
//   collection,
//   query,
//   where,
//   getDocs,
//   updateDoc,
//   arrayUnion,
// } from 'firebase/firestore'
// import { fireStore } from '@/firebase/firebase'
// import { BookOpen, CheckCircle2, MessageSquareMore, Play } from 'lucide-react'

// interface Task {
//   id: string
//   title: string
//   description: string
//   problemStatement: string
//   starterCode: string
//   handlerFunction: string
//   examples: {
//     id: number
//     inputText: string
//     outputText: string
//     explanation?: string
//   }[]
//   constraints: string
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
//   const [tasks, setTasks] = useState<Task[]>([])
//   const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
//   const [studentCode, setStudentCode] = useState('')
//   const [isLoading, setIsLoading] = useState(true)
//   const [completedTasks, setCompletedTasks] = useState<string[]>([])
//   const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
//   const [currentTask, setCurrentTask] = useState<Task | null>(null)

//   // Fetch classroom and curriculum data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const classroomRef = doc(fireStore, 'classrooms', classroomId)
//         const classroomDoc = await getDoc(classroomRef)

//         if (!classroomDoc.exists()) {
//           toast({
//             title: 'Error',
//             description: 'Classroom not found',
//             variant: 'destructive',
//           })
//           return
//         }

//         const classroomData = classroomDoc.data()
//         const curriculumRef = doc(
//           fireStore,
//           'curricula',
//           classroomData.curriculumId
//         )
//         const curriculumDoc = await getDoc(curriculumRef)

//         if (!curriculumDoc.exists()) {
//           toast({
//             title: 'Error',
//             description: 'Curriculum not found',
//             variant: 'destructive',
//           })
//           return
//         }

//         const curriculumData = curriculumDoc.data()
//         const currentWeek = classroomData.lastTaughtWeek || 1
//         setSelectedWeek(currentWeek)

//         // Get task IDs for the current week
//         const weekData = curriculumData.weeks.find(
//           (w: any) => w.weekNumber === currentWeek
//         )
//         if (weekData) {
//           // Fetch all tasks for the week
//           const tasksPromises = weekData.assignmentIds.map((taskId: string) =>
//             getDoc(doc(fireStore, 'problems', taskId))
//           )
//           const taskDocs = await Promise.all(tasksPromises)
//           const tasksData = taskDocs
//             .filter((doc) => doc.exists())
//             .map((doc) => ({
//               id: doc.id,
//               ...doc.data(),
//             })) as Task[]

//           setTasks(tasksData)
//           if (tasksData.length > 0) {
//             setCurrentTask(tasksData[0])
//             setStudentCode(tasksData[0].starterCode)
//           }
//         }

//         // Fetch completed tasks for student
//         if (role === 'student') {
//           const progressQuery = query(
//             collection(fireStore, 'progress'),
//             where('classroomId', '==', classroomId),
//             where('studentId', '==', username),
//             where('weekNumber', '==', currentWeek)
//           )
//           const progressSnapshot = await getDocs(progressQuery)
//           const completedTaskIds =
//             progressSnapshot.docs.length > 0
//               ? progressSnapshot.docs[0].data().completedTasks || []
//               : []
//           setCompletedTasks(completedTaskIds)
//         }

//         setIsLoading(false)
//       } catch (error) {
//         console.error('Error fetching data:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to load session data',
//           variant: 'destructive',
//         })
//       }
//     }

//     fetchData()
//   }, [classroomId, username, role, toast])

//   const handleTaskClick = (task: Task) => {
//     setCurrentTask(task)
//     setStudentCode(task.starterCode)
//   }

//   const handleSubmitCode = async () => {
//     if (!currentTask) return

//     try {
//       // Execute the handler function to test the code
//       const handlerFn = new Function(`return ${currentTask.handlerFunction}`)()
//       const success = handlerFn(new Function(`return ${studentCode}`)())

//       if (success) {
//         // Update progress in Firebase
//         const progressRef = doc(
//           fireStore,
//           'progress',
//           `${classroomId}_${username}_${selectedWeek}`
//         )
//         await updateDoc(progressRef, {
//           completedTasks: arrayUnion(currentTask.id),
//         })

//         setCompletedTasks((prev) => [...prev, currentTask.id])
//         toast({
//           title: 'Success!',
//           description: 'Task completed successfully!',
//           variant: 'default',
//         })
//       } else {
//         toast({
//           title: 'Try Again',
//           description: 'Your solution did not pass all test cases.',
//           variant: 'destructive',
//         })
//       }
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       })
//     }
//   }

//   if (isLoading) {
//     return <div>Loading...</div>
//   }

//   return (
//     <div className='h-screen flex'>
//       {/* Task List Sidebar */}
//       <div className='w-1/4 border-r p-4 bg-background overflow-y-auto'>
//         <h2 className='text-xl font-bold mb-4'>Week {selectedWeek} Tasks</h2>
//         <div className='space-y-2'>
//           {tasks.map((task) => (
//             <Card
//               key={task.id}
//               className={`cursor-pointer hover:bg-accent ${
//                 currentTask?.id === task.id ? 'border-primary' : ''
//               }`}
//               onClick={() => handleTaskClick(task)}
//             >
//               <CardHeader>
//                 <CardTitle className='text-sm flex items-center justify-between'>
//                   {task.title}
//                   {completedTasks.includes(task.id) && (
//                     <CheckCircle2 className='h-4 w-4 text-green-500' />
//                   )}
//                 </CardTitle>
//               </CardHeader>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {/* Main Workspace */}
//       <Split
//         className='flex-1'
//         direction='horizontal'
//         sizes={[40, 60]}
//         minSize={400}
//       >
//         {/* Problem Description */}
//         <div className='p-4 overflow-y-auto'>
//           {currentTask && (
//             <>
//               <h1 className='text-2xl font-bold mb-4'>{currentTask.title}</h1>
//               <div className='prose dark:prose-invert'>
//                 <div
//                   dangerouslySetInnerHTML={{
//                     __html: currentTask.problemStatement,
//                   }}
//                 />

//                 {/* <h3 className='mt-6 mb-2'>Examples:</h3>
//                 {currentTask.examples.map((example) => (
//                   <div
//                     key={example.id}
//                     className='my-4 p-4 bg-muted rounded-lg'
//                   >
//                     <p>
//                       <strong>Input:</strong> {example.inputText}
//                     </p>
//                     <p>
//                       <strong>Output:</strong> {example.outputText}
//                     </p>
//                     {example.explanation && (
//                       <p>
//                         <strong>Explanation:</strong> {example.explanation}
//                       </p>
//                     )}
//                   </div>
//                 ))} */}

//                 <h3 className='mt-6 mb-2'>Constraints:</h3>
//                 <div
//                   dangerouslySetInnerHTML={{ __html: currentTask.constraints }}
//                 />
//               </div>
//             </>
//           )}
//         </div>

//         {/* Code Editor */}
//         <div className='flex flex-col'>
//           <div className='flex-1'>
//             <CodeMirror
//               value={studentCode}
//               height='100%'
//               theme={vscodeDark}
//               extensions={[python()]}
//               onChange={(value) => setStudentCode(value)}
//             />
//           </div>
//           <div className='p-4 border-t'>
//             <Button onClick={handleSubmitCode} className='w-full'>
//               Submit Solution
//             </Button>
//           </div>
//         </div>
//       </Split>
//     </div>
//   )
// }

// export default SessionView
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Socket } from 'socket.io-client'
import { ShareLink } from '@/components/share-link'
import { useToast } from '@/hooks/use-toast'
import Split from 'react-split'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { BookOpen, CheckCircle2, MessageSquareMore } from 'lucide-react'
import { Problem } from '@/utils/types/problem'
import { problems } from '@/utils/problems'
import { useAuth } from '@/contexts/AuthContext'
// import useLocalStorage from '@/hooks/useLocalStorage'

interface SessionViewProps {
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
}

interface WeeklyProgress {
  taskCompletions: {
    [taskId: string]: string[] // Array of user IDs who completed the task
  }
}

export function SessionView({
  classroomId,
  onEndSession,
  socket,
}: SessionViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [studentCode, setStudentCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [completedProblems, setCompletedProblems] = useState<string[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [weekProblems, setWeekProblems] = useState<string[]>([])
  const joinedRoom = useRef(false)
  // const [fontSize] = useLocalStorage('code-fontSize', '16px')

  // Fetch classroom data and problems for the current week
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

        if (!curriculumDoc.exists()) {
          toast({
            title: 'Error',
            description: 'Curriculum not found',
            variant: 'destructive',
          })
          return
        }

        const curriculumData = curriculumDoc.data()
        const currentWeek = classroomData.lastTaughtWeek || 1
        setSelectedWeek(currentWeek)

        // Get problem IDs for the current week
        const weekData = curriculumData.weeks.find(
          (w: any) => w.weekNumber === currentWeek
        )
        if (weekData) {
          setWeekProblems(weekData.assignmentIds)
          if (weekData.assignmentIds.length > 0) {
            const firstProblem = problems[weekData.assignmentIds[0]]
            setCurrentProblem(firstProblem)
            setStudentCode(firstProblem.starterCode)
          }
        }

        if (user && user.role === 'student') {
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
          description: 'Failed to load session data',
          variant: 'destructive',
        })
      }
    }

    fetchData()
  }, [classroomId, user, toast])

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    if (!joinedRoom.current) {
      socket.emit(
        'join-room',
        classroomId,
        user?.displayName,
        user?.role === 'teacher'
      )
      joinedRoom.current = true
    }

    socket.on('student-code', (data: { username: string; code: string }) => {
      if (user?.displayName === data.username) {
        setStudentCode(data.code)
      }
    })

    socket.on(
      'execution-complete',
      (data: { exitCode: number; output: string; error: string }) => {
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
            variant: 'default',
          })
        }
      }
    )

    socket.on('session-ended', () => {
      toast({
        title: 'Session Ended',
        description: 'The teacher has ended the session.',
        variant: 'default',
      })
      onEndSession()
    })

    return () => {
      socket.off('student-code')
      socket.off('execution-complete')
      socket.off('session-ended')
    }
  }, [socket, user, toast, onEndSession, classroomId])

  const handleProblemSelect = (problemId: string) => {
    const problem = problems[problemId]
    setCurrentProblem(problem)
    setStudentCode(problem.starterCode)

    // Emit code update to socket
    if (socket) {
      socket.emit(
        'update-code',
        classroomId,
        user?.displayName,
        problem.starterCode
      )
    }
  }

  // const handleSubmitCode = async () => {
  //   if (!currentProblem) return

  //   try {
  //     // Get the handler function from the problem
  //     const handler = currentProblem.handlerFunction

  //     // Extract the actual function from the student's code
  //     const userCode = studentCode.slice(
  //       studentCode.indexOf(currentProblem.starterFunctionName)
  //     )
  //     // const fn = new Function(`return ${userCode}`)()

  //     // // Run the handler
  //     // const success = handler(fn)

  //     const handlerFn = new Function(
  //       `return ${currentProblem.handlerFunction}`
  //     )()
  //     const success = handlerFn(new Function(`return ${studentCode}`)())

  //     if (success) {
  //       // Update progress in Firebase
  //       const userRef = doc(fireStore, 'users', username)
  //       await updateDoc(userRef, {
  //         solvedProblems: arrayUnion(currentProblem.id),
  //       })

  //       setCompletedProblems((prev) => [...prev, currentProblem.id])
  //       toast({
  //         title: 'Success!',
  //         description: 'All test cases passed!',
  //         variant: 'default',
  //       })
  //     }
  //   } catch (error: any) {
  //     toast({
  //       title: 'Error',
  //       description: error.message,
  //       variant: 'destructive',
  //     })
  //   }
  // }
  // const handleSubmitCode = async () => {
  //   if (!currentProblem) return

  //   try {
  //     const success = currentProblem.handlerFunction(studentCode)

  //     if (success) {
  //       const userRef = doc(fireStore, 'users', user.id)
  //       await updateDoc(userRef, {
  //         solvedProblems: arrayUnion(currentProblem.id),
  //       })

  //       setCompletedProblems((prev) => [...prev, currentProblem.id])
  //       toast({
  //         title: 'Success!',
  //         description: 'All test cases passed!',
  //         variant: 'default',
  //       })
  //     }
  //   } catch (error: any) {
  //     toast({
  //       title: 'Error',
  //       description: error.message,
  //       variant: 'destructive',
  //     })
  //   }
  // }

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
          // Update existing document
          await updateDoc(weeklyProgressRef, {
            [`taskCompletions.${currentProblem.id}`]: arrayUnion(user.uid),
          })
        } else {
          // Create new document
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
          variant: 'default',
        })

        // Optionally notify teacher through socket
        socket?.emit('task-completed', {
          classroomId,
          weekNumber: selectedWeek,
          taskId: currentProblem.id,
          userId: user.uid,
          userName: user.displayName || user.email,
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

  if (isLoading) {
    return <div>Loading...</div>
  }

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
                      <CheckCircle2 className='h-4 w-4 text-green-500' />
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <Split
        className='flex-1'
        direction='horizontal'
        sizes={[40, 60]}
        minSize={400}
      >
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

                <h3 className='mt-6 mb-2'>Examples:</h3>
                {currentProblem.examples.map((example) => (
                  <div
                    key={example.id}
                    className='my-4 p-4 bg-muted rounded-lg'
                  >
                    <p>
                      <strong>Input:</strong> {example.inputText}
                    </p>
                    <p>
                      <strong>Output:</strong> {example.outputText}
                    </p>
                    {example.explanation && (
                      <p>
                        <strong>Explanation:</strong> {example.explanation}
                      </p>
                    )}
                  </div>
                ))}

                <h3 className='mt-6 mb-2'>Constraints:</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentProblem.constraints,
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Code Editor */}
        <div className='flex flex-col'>
          <div className='flex-1'>
            <CodeMirror
              value={studentCode}
              height='100%'
              theme={vscodeDark}
              extensions={[python()]}
              onChange={(value) => {
                setStudentCode(value)
                socket?.emit(
                  'update-code',
                  classroomId,
                  user?.displayName,
                  value
                )
              }}
            />
          </div>
          <div className='p-4 border-t flex justify-between'>
            <Button variant='outline'>
              <BookOpen className='mr-2 h-4 w-4' />
              Reference Guide
            </Button>
            <Button onClick={handleSubmitCode}>Submit Solution</Button>
          </div>
        </div>
      </Split>
    </div>
  )
}

export default SessionView
