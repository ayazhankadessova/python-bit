// components/StudentDashboard.tsx
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
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  DocumentData,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { BookOpen, Trophy, Users, Loader2 } from 'lucide-react'

interface User {
  uid: string
  email: string | null
  displayName: string | null
  role?: 'student' | 'teacher'
  school?: string
  likedProblems?: string[]
  dislikedProblems?: string[]
  solvedProblems?: string[]
  starredProblems?: string[]
}

interface Classroom {
  id: string
  name?: string
  curriculumId: string
  students: string[]
  // curriculum?: {
  //   name?: string
  //   description?: string
  // }
  [key: string]: any // For other potential fields
}

// interface Week {
//   weekNumber: number
//   topic: string
//   assignmentIds: string[] // Array of problem IDs
// }

// interface CurriculumInputs {
//   id: string
//   name: string
//   description: string
//   weeks: Week[]
// }

interface Progress {
  solvedProblems: number
  completedWeeks: number
}

interface StudentDashboardProps {
  user: User
  onSignOut: () => void
}

export function StudentDashboard({ user, onSignOut }: StudentDashboardProps) {
  const router = useRouter()
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<Progress>({
    solvedProblems: 0,
    completedWeeks: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classroomsQuery = query(
          collection(fireStore, 'classrooms'),
          where('students', 'array-contains', user.uid)
        )
        const classroomsSnap = await getDocs(classroomsQuery)

        const classroomsData: Classroom[] = await Promise.all(
          classroomsSnap.docs.map(async (classDoc) => {
            const data = classDoc.data()
            const curriculumDoc = await getDoc(
              doc(fireStore, 'curricula', data.curriculumId)
            )

            return {
              id: classDoc.id,
              name: data.name,
              curriculumId: data.curriculumId,
              students: data.students || [],
              curriculum: curriculumDoc.data() || undefined,
              ...data,
            }
          })
        )

        setEnrolledClassrooms(classroomsData)

        // Calculate progress
        const totalWeeks = classroomsData.reduce((acc, classroom) => {
          const curriculumWeeks = classroom.curriculum?.weeks?.length || 0
          return acc + curriculumWeeks
        }, 0)

        setProgress({
          solvedProblems: user.solvedProblems?.length || 0,
          completedWeeks: Math.min(
            totalWeeks,
            user.solvedProblems?.length || 0
          ),
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user.uid, user.solvedProblems])

  const handleJoinClassroom = (classroomId: string) => {
    router.push(`/classroom/${classroomId}`)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  // Progress calculation helpers
  const getProgressPercentage = (solved: number, total: number) =>
    total > 0 ? Math.round((solved / total) * 100) : 0

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-blue-600'
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8 flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold mb-2'>
            Welcome, {user.displayName}!
          </h1>
          <p className='text-gray-600'>Ready to learn Python?</p>
        </div>
        <Button variant='outline' onClick={onSignOut}>
          Sign Out
        </Button>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
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
                enrolledClassrooms.map((classroom) => (
                  <Card key={classroom.id} className='p-4'>
                    <div className='space-y-2'>
                      <h3 className='font-semibold'>{classroom.name}</h3>
                      <p className='text-sm text-gray-500'>
                        Program: {classroom.curriculum?.name}
                      </p>
                      <Button
                        className='w-full'
                        onClick={() => handleJoinClassroom(classroom.id)}
                      >
                        Join Class
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className='text-sm text-gray-500'>No enrolled classes yet</p>
              )}
            </div>
          </CardContent>
        </Card>

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
                <p
                  className={`text-2xl font-bold ${getProgressColor(
                    getProgressPercentage(
                      progress.solvedProblems,
                      progress.solvedProblems + 5 // Adjust target as needed
                    )
                  )}`}
                >
                  {progress.solvedProblems}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>Completed Weeks</p>
                <p className='text-2xl font-bold'>{progress.completedWeeks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className='text-sm font-medium'>Grade</p>
                <p className='text-2xl font-bold'>{user.grade || 'Not set'}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Enrolled Classes</p>
                <p className='text-2xl font-bold'>
                  {enrolledClassrooms.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
