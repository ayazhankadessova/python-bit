'use client'
import { useRouter } from 'next/navigation'
import { BookOpen, Trophy, Users} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ClassroomList } from '@/components/dashboard/ClassroomList'
import { useClassrooms } from '@/hooks/useClassrooms'

interface StudentDashboardProps {
  onSignOut: () => void
}

export function StudentDashboard({ onSignOut }: StudentDashboardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { classrooms, isLoading, error } = useClassrooms(
    user!.uid
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
    <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8 pt-8 mb-16'>
      <DashboardHeader
        title={`Welcome, ${user.displayName || 'Student'}!`}
        subtitle='Ready to learn Python?'
        onSignOut={onSignOut}
      />

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <StatCard icon={BookOpen} title='My Classes'>
          <ClassroomList
            classrooms={classrooms}
            onJoinClassroom={(id) => router.push(`/classrooms/${id}`)}
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
              <p className='text-2xl font-bold text-purple-600'>
                {classrooms.length}
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
