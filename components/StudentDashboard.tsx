import { useRouter } from 'next/navigation'
import { Student } from '@/models/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { BookOpen, Trophy, Users } from 'lucide-react'

interface StudentDashboardProps {
  user: Student
  onSignOut: () => void
}

export function StudentDashboard({ user, onSignOut }: StudentDashboardProps) {
  const router = useRouter()

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8 flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold mb-2'>Welcome, {user.username}!</h1>
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
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              {user.enrolledClassrooms?.length ? (
                user.enrolledClassrooms.map((classroomId) => (
                  <Button
                    key={classroomId}
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => router.push(`/classroom/${classroomId}`)}
                  >
                    View Class
                  </Button>
                ))
              ) : (
                <p className='text-sm text-gray-500'>No enrolled classes yet</p>
              )}
              <Button
                className='w-full'
                onClick={() => router.push('/join-class')}
              >
                Join New Class
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5' />
              My Progress
            </CardTitle>
            <CardDescription>Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>Grade Level</p>
                <p className='text-2xl font-bold'>{user.grade || 'Not set'}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Classes Completed</p>
                <p className='text-2xl font-bold'>0</p>
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
                <p className='text-sm font-medium'>School Name</p>
                <p className='text-2xl font-bold'>{user.school}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Enrolled Classes</p>
                <p className='text-2xl font-bold'>
                  {user.enrolledClassrooms?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
