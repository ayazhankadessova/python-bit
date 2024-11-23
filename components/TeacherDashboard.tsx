import { useRouter } from 'next/navigation'
import { Teacher } from '@/models/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

interface TeacherDashboardProps {
  user: Teacher
  onSignOut: () => void
}

export function TeacherDashboard({ user, onSignOut }: TeacherDashboardProps) {
  const router = useRouter()

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8 flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold mb-2'>
            Welcome back, {user.username}!
          </h1>
          <p className='text-gray-600'>Here's your teaching overview</p>
        </div>
        <Button variant='outline' onClick={onSignOut}>
          Sign Out
        </Button>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              className='w-full'
              onClick={() => router.push('/classrooms')}
            >
              View My Classrooms
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest teaching activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <p className='text-sm text-gray-500'>No recent activity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Stats</CardTitle>
            <CardDescription>Your teaching metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>School Name</p>
                <p className='text-2xl font-bold'>{user.school}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Active Classrooms</p>
                <p className='text-2xl font-bold'>
                  {user.classrooms?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
