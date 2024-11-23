'use client'
import React, { useState, useEffect } from 'react'
import { Search, Plus, Play } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CreateClassroomForm } from './CreateClassroomForm'
import { useToast } from '@/components/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Classroom } from '@/models/types'
import { Teacher } from '@/models/types'

const ClassroomPage = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userData, setUserData] = useState<Teacher | null>(null)

  useEffect(() => {
    // In ClassroomPage.tsx
    const fetchClassrooms = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      try {
        console.log('Token from localStorage:', token) // Debug log

        const userResponse = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!userResponse.ok) {
          const errorText = await userResponse.text()
          console.error('User response error:', errorText)
          throw new Error('Failed to fetch user')
        }

        const userData = await userResponse.json()
        console.log('User data:', userData)
        setUserData(userData)

        const classroomsResponse = await fetch(
          `/api/classroom?teacherId=${userData._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!classroomsResponse.ok) {
          const errorText = await classroomsResponse.text()
          console.error('Classrooms response error:', errorText)
          throw new Error('Failed to fetch classrooms')
        }

        const data = await classroomsResponse.json()
        console.log('Classrooms data:', data)
        setClassrooms(data)
      } catch (error) {
        console.error('Fetch error:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch classrooms. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClassrooms()
  }, [router, toast])

  const handleCreateClassroom = async (data: {
    name: string
    students: string[]
    teacherId: string
    curriculumId: string
    curriculumName: string
  }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/classroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          lastTaughtWeek: 0,
        }),
      })

      if (!response.ok) throw new Error('Failed to create classroom')

      const newClassroom = await response.json()
      setClassrooms([...classrooms, newClassroom])
      setIsDialogOpen(false)
      toast({
        title: 'Success',
        description: 'Classroom created successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create classroom. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleStartLesson = async (classroomId: string) => {
    try {
      if (!userData) {
        throw new Error('No user data available')
      }

      // Create the URL with query parameters
      const url = `/classroom/${classroomId}?username=${encodeURIComponent(
        userData.username
      )}&role=teacher`
      router.push(url)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start the lesson. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        Loading...
      </div>
    )
  }

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.curriculumName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>My Classrooms</h1>
        <Button variant='outline' onClick={() => router.push('/')}>
          Back to Dashboard
        </Button>
      </div>

      <div className='flex justify-between mb-6'>
        <div className='relative w-64'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-500' />
          <Input
            type='text'
            placeholder='Search classrooms'
            className='pl-8'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Create New Classroom
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-white'>
            <DialogHeader>
              <DialogTitle>Create New Classroom</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new classroom.
              </DialogDescription>
            </DialogHeader>
            {userData && ( // Only render form if we have user data
              <CreateClassroomForm
                onSubmit={handleCreateClassroom}
                teacherId={userData._id}
                teacherSchool={userData.school}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {filteredClassrooms.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-500'>
            No classrooms found. Create your first classroom to get started!
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredClassrooms.map((classroom) => (
            <Card key={classroom._id}>
              <CardHeader>
                <CardTitle>{classroom.name}</CardTitle>
                <CardDescription>{classroom.curriculumName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600'>
                  Last taught: Week {classroom.lastTaughtWeek || 0}
                </p>
                <p className='text-sm text-gray-600'>
                  Students: {classroom.students?.length || 0}
                </p>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button onClick={() => handleStartLesson(classroom._id)}>
                  <Play className='mr-2 h-4 w-4' /> Start Lesson
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClassroomPage
