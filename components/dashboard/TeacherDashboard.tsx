'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Book, Users, Trophy } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ClassroomList } from '@/components/dashboard/ClassroomList'
import { useClassrooms } from '@/hooks/useClassrooms'

interface TeacherDashboardProps {
  onSignOut: () => void
}

export function TeacherDashboard({ onSignOut }: TeacherDashboardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { classrooms, isLoading, error} = useClassrooms(
    user!.uid
  )
  const activeClassrooms = classrooms.filter((c) => c)
  const totalStudents = classrooms.reduce(
    (acc, classroom) => acc + (classroom.students?.length || 0),
    0
  )

  if (isLoading) return <LoadingSpinner />

  if (!user) {
    router.push('/')
    return null
  }

  if (error) {
    return (
      <div className='text-center py-10'>
        <p className='text-destructive'>Failed to load Dashboard</p>
      </div>
    )
  }

  return (
    <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 pt-8 mb-16'>
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
              onClick={() => router.replace('/classrooms')}
            >
              View My Classrooms ({classrooms.length})
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => router.replace('/classrooms')}
            >
              Create New Classroom
            </Button>
          </div>
        </StatCard>

        <StatCard icon={Trophy} title='Real-time Problem Solving'>
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
                onJoinClassroom={(id) => router.push(`/classrooms/${id}`)}
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
