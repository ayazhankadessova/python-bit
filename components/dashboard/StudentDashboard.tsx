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
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ClassroomList } from '@/components/dashboard/ClassroomList'

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

  if (loading) return <LoadingSpinner />

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className='container mx-auto p-6'>
      <DashboardHeader
        title={`Welcome, ${user.displayName || 'Student'}!`}
        subtitle='Ready to learn Python?'
        onSignOut={onSignOut}
      />

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <StatCard icon={BookOpen} title='My Classes'>
          <ClassroomList
            classrooms={enrolledClassrooms}
            onJoinClassroom={(id) => router.push(`/classroom/${id}`)}
            userRole='student'
          />
        </StatCard>

        <StatCard icon={Trophy} title='My Progress'>
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
        </StatCard>

        <StatCard icon={Users} title='School Info'>
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
        </StatCard>
      </div>
    </div>
  )
}
