// components.StudentDashboard.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { BookOpen, Trophy, Users, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ClassroomTC } from '@/utils/types/firebase'

interface StudentDashboardProps {
  onSignOut: () => void
}

export function StudentDashboard({ onSignOut }: StudentDashboardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<ClassroomTC[]>(
    []
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClassroomsData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      // Initialize with empty arrays if classrooms doesn't exist
      if (!user.classrooms || user.classrooms.length === 0) {
        setEnrolledClassrooms([])
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
              } as ClassroomTC
            } catch (error) {
              console.error(`Error fetching classroom ${classroomId}:`, error)
              return null
            }
          })
        )

        // Filter out any null values from non-existent classrooms
        const validClassrooms = classroomsData.filter(
          (c): c is ClassroomTC => c !== null
        )
        setEnrolledClassrooms(validClassrooms)
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

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (!user) {
    router.push('/')
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
                  return (
                    <Card key={classroom.id} className='p-4'>
                      <div className='space-y-2'>
                        <h3 className='font-semibold'>{classroom.name}</h3>
                        <p className='text-sm text-gray-500'>
                          Program: {classroom.curriculumName || 'N/A'}
                        </p>
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
                  {user.solvedProblems?.length || 0}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
