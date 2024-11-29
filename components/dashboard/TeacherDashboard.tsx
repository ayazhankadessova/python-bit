'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Loader2, Book, Users, Trophy } from 'lucide-react'
import { ClassroomTC } from '@/utils/types/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface TeacherDashboardProps {
  onSignOut: () => void
}

export function TeacherDashboard({ onSignOut }: TeacherDashboardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [classrooms, setClassrooms] = useState<ClassroomTC[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      // Moved the early return check up
      if (
        !user.classrooms ||
        !Array.isArray(user.classrooms) ||
        user.classrooms.length === 0
      ) {
        setClassrooms([])
        setLoading(false)
        return
      }

      try {
        const classroomsData = await Promise.all(
          user.classrooms.map(async (classroomId) => {
            try {
              const classroomDoc = await getDoc(
                doc(fireStore, 'classrooms', classroomId)
              )
              if (!classroomDoc.exists()) return null

              const classroomData = classroomDoc.data()

              // Check for teacher ID match
              if (
                !classroomData?.teacherId ||
                classroomData.teacherId !== user.uid
              ) {
                return null
              }

              let curriculumData = undefined

              if (classroomData.curriculumId) {
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
              }

              return {
                id: classroomDoc.id,
                ...classroomData,
                curriculum: curriculumData,
              } as ClassroomTC
            } catch (error) {
              console.error(`Error fetching classroom ${classroomId}:`, error)
              return null
            }
          })
        )

        const validClassrooms = classroomsData.filter(
          (c): c is ClassroomTC => c !== null
        )
        setClassrooms(validClassrooms)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load classroom data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast]) // Removed user.uid from dependencies

  // Early return if loading
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  // Early return if no user
  if (!user) {
    router.push('/')
    return null
  }

  const activeClassrooms = classrooms.filter((c) => c.activeSession)
  const totalStudents = classrooms.reduce(
    (acc, classroom) => acc + (classroom.students?.length || 0),
    0
  )

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8 flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold mb-2'>
            Welcome back, {user.displayName || 'Teacher'}!
          </h1>
          <p className='text-gray-600'>Here is your teaching overview</p>
        </div>
        <Button variant='outline' onClick={onSignOut}>
          Sign Out
        </Button>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Book className='h-5 w-5' />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              className='w-full'
              onClick={() => router.push('/classrooms')}
            >
              View My Classrooms ({classrooms.length})
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => router.push('/classrooms')}
            >
              Create New Classroom
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5' />
              Session Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>Active Sessions</p>
                <p className='text-2xl font-bold text-green-600'>
                  {activeClassrooms.length}/{classrooms.length}
                </p>
              </div>
              {activeClassrooms.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-sm font-medium'>Current Active:</p>
                  {activeClassrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className='text-sm text-green-600 flex justify-between items-center'
                    >
                      <span>{classroom.name}</span>
                      <Button
                        size='sm'
                        onClick={() =>
                          router.push(`/classroom/${classroom.id}`)
                        }
                      >
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Teaching Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>School</p>
                <p className='text-2xl font-bold'>{user.school || 'Not Set'}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Total Classrooms</p>
                <p className='text-2xl font-bold'>{classrooms.length}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Total Students</p>
                <p className='text-2xl font-bold'>{totalStudents}</p>
                <p className='text-sm text-gray-500'>
                  Average:{' '}
                  {classrooms.length
                    ? Math.round(totalStudents / classrooms.length)
                    : 0}{' '}
                  per class
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
