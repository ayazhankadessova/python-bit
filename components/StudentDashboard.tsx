// components/StudentDashboard.tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Student } from '@/models/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookOpen, Trophy, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ClassroomDetails {
  _id: string
  name: string
  classCode: string
  lastTaughtWeek: number
}

interface StudentDashboardProps {
  user: Student
  onSignOut: () => void
}

export function StudentDashboard({ user, onSignOut }: StudentDashboardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<
    ClassroomDetails[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user.classrooms?.length) {
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('token')
        const promises = user.classrooms.map((classroomId) =>
          fetch(`/api/classroom/${classroomId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => res.json())
        )

        const classrooms = await Promise.all(promises)
        setEnrolledClassrooms(classrooms)
      } catch (error) {
        console.error('Error fetching classrooms:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch enrolled classrooms',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClassrooms()
  }, [user.classrooms, toast])

  const handleJoinClassroom = (classroom: ClassroomDetails) => {
    router.push(
      `/classroom/${classroom._id}?username=${encodeURIComponent(
        user.username
      )}&role=student`
    )
  }

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
          <CardContent>
            <div className='space-y-4'>
              {isLoading ? (
                <p className='text-sm text-gray-500'>Loading classes...</p>
              ) : enrolledClassrooms.length > 0 ? (
                enrolledClassrooms.map((classroom) => (
                  <Card key={classroom._id} className='p-4'>
                    <div className='space-y-2'>
                      <h3 className='font-semibold'>{classroom.name}</h3>
                      <p className='text-sm text-gray-500'>
                        Class Code: {classroom.classCode}
                      </p>
                      <Button
                        className='w-full'
                        onClick={() => handleJoinClassroom(classroom)}
                      >
                        {'Join Class'}
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
