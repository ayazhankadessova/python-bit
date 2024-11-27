// // components/StudentDashboard.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from '@/components/ui/card'
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
//   DocumentData,
// } from 'firebase/firestore'
// import { fireStore } from '@/firebase/firebase'
// import { BookOpen, Trophy, Users, Loader2 } from 'lucide-react'
// import { useAuth } from '@/contexts/AuthContext'

// interface User {
//   uid: string
//   email: string | null
//   displayName: string | null
//   role?: 'student' | 'teacher'
//   school?: string
//   likedProblems?: string[]
//   dislikedProblems?: string[]
//   solvedProblems?: string[]
//   starredProblems?: string[]
//    classrooms: ({
//             classroomId,
//             joinedAt: Date.now(),
//           }),
// }

// interface Classroom {
//   id: string
//   name?: string
//   curriculumId: string
//   students: string[]
//   // curriculum?: {
//   //   name?: string
//   //   description?: string
//   // }
//   [key: string]: any // For other potential fields
// }

// // interface Week {
// //   weekNumber: number
// //   topic: string
// //   assignmentIds: string[] // Array of problem IDs
// // }

// // interface CurriculumInputs {
// //   id: string
// //   name: string
// //   description: string
// //   weeks: Week[]
// // }

// interface Progress {
//   solvedProblems: number
//   completedWeeks: number
// }

// interface StudentDashboardProps {
//   onSignOut: () => void
// }

// export function StudentDashboard({ onSignOut }: StudentDashboardProps) {
//   const { user } = useAuth()
//   const router = useRouter()
//   const [enrolledClassrooms, setEnrolledClassrooms] = useState<Classroom[]>([])
//   const [loading, setLoading] = useState(true)
//   const [progress, setProgress] = useState<Progress>({
//     solvedProblems: 0,
//     completedWeeks: 0,
//   })

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!user?.classrooms?.length) {
//           setEnrolledClassrooms([])
//           setProgress({ solvedProblems: 0, completedWeeks: 0 })
//           return
//         }

//         // Fetch classrooms using user's classrooms array
//         const classroomRefs = user.classrooms.map((classroomId) =>
//           doc(fireStore, 'classrooms', classroomId)
//         )
//         const classroomDocs = await Promise.all(
//           classroomRefs.map((ref) => getDoc(ref))
//         )

//         const classroomsData: Classroom[] = await Promise.all(
//           classroomDocs
//             .filter((doc) => doc.exists())
//             .map(async (classDoc) => {
//               const data = classDoc.data()
//               const curriculumDoc = await getDoc(
//                 doc(fireStore, 'curricula', data.curriculumId)
//               )

//               return {
//                 id: classDoc.id,
//                 name: data.name,
//                 curriculumId: data.curriculumId,
//                 students: data.students || [],
//                 curriculum: curriculumDoc.data() || undefined,
//                 ...data,
//               }
//             })
//         )

//         setEnrolledClassrooms(classroomsData)

//         const totalWeeks = classroomsData.reduce((acc, classroom) => {
//           const curriculumWeeks = classroom.curriculum?.weeks?.length || 0
//           return acc + curriculumWeeks
//         }, 0)

//         setProgress({
//           solvedProblems: user.solvedProblems?.length || 0,
//           completedWeeks: Math.min(
//             totalWeeks,
//             user.solvedProblems?.length || 0
//           ),
//         })
//       } catch (error) {
//         console.error('Error fetching data:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [user?.classrooms, user?.solvedProblems])

//   const handleJoinClassroom = (classroomId: string) => {
//     router.push(`/classroom/${classroomId}`)
//   }

//   if (loading) {
//     return (
//       <div className='flex items-center justify-center min-h-screen'>
//         <Loader2 className='h-8 w-8 animate-spin' />
//       </div>
//     )
//   }

//   // Progress calculation helpers
//   const getProgressPercentage = (solved: number, total: number) =>
//     total > 0 ? Math.round((solved / total) * 100) : 0

//   const getProgressColor = (percentage: number) => {
//     if (percentage >= 75) return 'text-green-600'
//     if (percentage >= 50) return 'text-yellow-600'
//     return 'text-blue-600'
//   }

//   return (
//     <div className='container mx-auto p-6'>
//       <div className='mb-8 flex justify-between items-center'>
//         <div>
//           <h1 className='text-4xl font-bold mb-2'>
//             Welcome, {user?.displayName}!
//           </h1>
//           <p className='text-gray-600'>Ready to learn Python?</p>
//         </div>
//         <Button variant='outline' onClick={onSignOut}>
//           Sign Out
//         </Button>
//       </div>

//       <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
//         <Card>
//           <CardHeader>
//             <CardTitle className='flex items-center gap-2'>
//               <BookOpen className='h-5 w-5' />
//               My Classes
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className='space-y-4'>
//               {enrolledClassrooms.length > 0 ? (
//                 enrolledClassrooms.map((classroom) => (
//                   <Card key={classroom.id} className='p-4'>
//                     <div className='space-y-2'>
//                       <h3 className='font-semibold'>{classroom.name}</h3>
//                       <p className='text-sm text-gray-500'>
//                         Program: {classroom.curriculum?.name}
//                       </p>
//                       <Button
//                         className='w-full'
//                         onClick={() => handleJoinClassroom(classroom.id)}
//                       >
//                         Join Class
//                       </Button>
//                     </div>
//                   </Card>
//                 ))
//               ) : (
//                 <p className='text-sm text-gray-500'>No enrolled classes yet</p>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className='flex items-center gap-2'>
//               <Trophy className='h-5 w-5' />
//               My Progress
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className='space-y-4'>
//               <div>
//                 <p className='text-sm font-medium'>Problems Solved</p>
//                 <p
//                   className={`text-2xl font-bold ${getProgressColor(
//                     getProgressPercentage(
//                       progress.solvedProblems,
//                       progress.solvedProblems + 5 // Adjust target as needed
//                     )
//                   )}`}
//                 >
//                   {progress.solvedProblems}
//                 </p>
//               </div>
//               <div>
//                 <p className='text-sm font-medium'>Completed Weeks</p>
//                 <p className='text-2xl font-bold'>{progress.completedWeeks}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className='flex items-center gap-2'>
//               <Users className='h-5 w-5' />
//               School Info
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className='space-y-4'>
//               <div>
//                 <p className='text-sm font-medium'>School</p>
//                 <p className='text-2xl font-bold'>
//                   {user?.school || 'Not set'}
//                 </p>
//               </div>
//               {/* <div>
//                 <p className='text-sm font-medium'>Grade</p>
//                 <p className='text-2xl font-bold'>{user. || 'Not set'}</p>
//               </div> */}
//               <div>
//                 <p className='text-sm font-medium'>Enrolled Classes</p>
//                 <p className='text-2xl font-bold'>
//                   {enrolledClassrooms.length}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { BookOpen, Trophy, Users, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface UserClassroom {
  classroomId: string
  joinedAt: number
}

interface User {
  uid: string
  email: string | null
  displayName: string | null
  role?: 'student' | 'teacher'
  school?: string
  solvedProblems?: string[]
  classrooms?: UserClassroom[] // Make classrooms optional
}

interface Classroom {
  id: string
  name: string
  curriculumId: string
  students: string[]
  curriculum?: {
    name: string
    description: string
    weeks: any[]
  }
  lastTaughtWeek?: number
  activeSession?: boolean
}

interface Progress {
  solvedProblems: number
  completedWeeks: number
}

interface StudentDashboardProps {
  onSignOut: () => void
}

export function StudentDashboard({ onSignOut }: StudentDashboardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<Progress>({
    solvedProblems: 0,
    completedWeeks: 0,
  })

  useEffect(() => {
    const fetchClassroomsData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      // Initialize with empty arrays if classrooms doesn't exist
      if (!user.classrooms || user.classrooms.length === 0) {
        setEnrolledClassrooms([])
        setProgress({
          solvedProblems: user.solvedProblems?.length || 0,
          completedWeeks: 0,
        })
        setLoading(false)
        return
      }

      try {
        // Fetch classroom and curriculum data for each enrolled classroom
        const classroomsData = await Promise.all(
          user.classrooms.map(async (classroomId) => {
            try {
              const classroomDoc = await getDoc(
                doc(fireStore, 'classrooms', classroomId)
              )
              if (!classroomDoc.exists()) return null

              const classroomData = classroomDoc.data()
              let curriculumData = undefined

              try {
                const curriculumDoc = await getDoc(
                  doc(fireStore, 'curricula', classroomData.curriculumId)
                )
                if (curriculumDoc.exists()) {
                  curriculumData = curriculumDoc.data()
                }
              } catch (error) {
                console.error('Error fetching curriculum:', error)
              }

              return {
                id: classroomDoc.id,
                ...classroomData,
                curriculum: curriculumData,
              } as Classroom
            } catch (error) {
              console.error(`Error fetching classroom ${classroomId}:`, error)
              return null
            }
          })
        )

        // Filter out any null values from non-existent classrooms
        const validClassrooms = classroomsData.filter(
          (c): c is Classroom => c !== null
        )
        setEnrolledClassrooms(validClassrooms)

        // Calculate total weeks across all enrolled curricula
        const totalWeeks = validClassrooms.reduce(
          (acc, classroom) => acc + (classroom.curriculum?.weeks?.length || 0),
          0
        )

        setProgress({
          solvedProblems: user.solvedProblems?.length || 0,
          completedWeeks: Math.min(
            totalWeeks,
            user.solvedProblems?.length || 0
          ),
        })
      } catch (error) {
        console.error('Error fetching classroom data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load classroom data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClassroomsData()
  }, [user, toast])

  const handleJoinClassroom = async (classroomId: string) => {
    if (!user) return

    try {
      const classroomDoc = await getDoc(
        doc(fireStore, 'classrooms', classroomId)
      )
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
        return
      }

      router.push(`/classroom/${classroomId}`)
    } catch (error) {
      console.error('Error joining classroom:', error)
      toast({
        title: 'Error',
        description: 'Failed to join classroom',
        variant: 'destructive',
      })
    }
  }

  const formatJoinDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // const getEarliestJoinDate = () => {
  //   if (!user?.classrooms || user.classrooms.length === 0) return null
  //   return Math.min(...user.classrooms.map((c) => c.joinedAt))
  // }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (!user) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8 flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold mb-2'>
            Welcome, {user.displayName || 'Student'}!
          </h1>
          <p className='text-gray-600'>Ready to learn Python?</p>
        </div>
        <Button variant='outline' onClick={onSignOut}>
          Sign Out
        </Button>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Classes Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {enrolledClassrooms.length > 0 ? (
                enrolledClassrooms.map((classroom) => {
                  const userClassroom = user.classrooms?.find(
                    (uc) => uc === classroom.id
                  )
                  return (
                    <Card key={classroom.id} className='p-4'>
                      <div className='space-y-2'>
                        <h3 className='font-semibold'>{classroom.name}</h3>
                        <p className='text-sm text-gray-500'>
                          Program: {classroom.curriculum?.name || 'N/A'}
                        </p>
                        {/* {userClassroom && (
                          <p className='text-xs text-gray-400'>
                            Joined: {formatJoinDate(userClassroom.joinedAt)}
                          </p>
                        )} */}
                        <div className='flex justify-between items-center'>
                          <span
                            className={`text-sm ${
                              classroom.activeSession
                                ? 'text-green-500'
                                : 'text-gray-500'
                            }`}
                          >
                            {classroom.activeSession
                              ? 'Active Session'
                              : 'No Active Session'}
                          </span>
                          <Button
                            onClick={() => handleJoinClassroom(classroom.id)}
                            disabled={!classroom.activeSession}
                          >
                            Join Class
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })
              ) : (
                <p className='text-sm text-gray-500'>No enrolled classes yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5' />
              My Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>Problems Solved</p>
                <p className='text-2xl font-bold text-green-600'>
                  {progress.solvedProblems}
                </p>
                <p className='text-sm text-gray-500'>across all classes</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Active Classes</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {enrolledClassrooms.filter((c) => c.activeSession).length}/
                  {enrolledClassrooms.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              School Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>School</p>
                <p className='text-2xl font-bold'>{user.school || 'Not set'}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Email</p>
                <p className='text-lg truncate'>{user.email || 'Not set'}</p>
              </div>
              {/* <div>
                <p className='text-sm font-medium'>Enrolled Since</p>
                <p className='text-lg'>
                  {getEarliestJoinDate()
                    ? "Classes"
                    : 'No classes yet'}
                </p>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
