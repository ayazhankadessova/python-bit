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
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ClassroomList } from '@/components/dashboard/ClassroomList'

interface TeacherDashboardProps {
  onSignOut: () => void
}

export function TeacherDashboard({ onSignOut }: TeacherDashboardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [classrooms, setClassrooms] = useState<ClassroomTC[]>([])
  const [loading, setLoading] = useState(true)
  const activeClassrooms = classrooms.filter((c) => c.activeSession)
  const totalStudents = classrooms.reduce(
    (acc, classroom) => acc + (classroom.students?.length || 0),
    0
  )

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
  if (loading) return <LoadingSpinner />

  // Early return if no user
  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className='container mx-auto p-6'>
      <DashboardHeader
        title={`Welcome back, ${user.displayName || 'Teacher'}!`}
        subtitle='Here is your teaching overview'
        onSignOut={onSignOut}
      />

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <StatCard icon={Book} title='Quick Actions'>
          <div className='space-y-4'>
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
          </div>
        </StatCard>

        <StatCard icon={Trophy} title='Session Status'>
          <div className='space-y-4'>
            <div>
              <p className='text-sm font-medium'>Active Sessions</p>
              <p className='text-2xl font-bold text-green-600'>
                {activeClassrooms.length}/{classrooms.length}
              </p>
            </div>
            {activeClassrooms.length > 0 && (
              <ClassroomList
                classrooms={activeClassrooms}
                onJoinClassroom={(id) => router.push(`/classroom/${id}`)}
                userRole='teacher'
              />
            )}
          </div>
        </StatCard>

        <StatCard icon={Users} title='Teaching Stats'>
          <div className='space-y-4'>
            <div>
              <p className='text-sm font-medium'>School</p>
              <p className='text-2xl font-bold'>{user.school || 'Not Set'}</p>
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
        </StatCard>
      </div>
    </div>
  )
}
