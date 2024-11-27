'use client'
import React, { useState, useEffect } from 'react'
import { Search, Plus, Play, Loader2 } from 'lucide-react'
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CreateClassroomForm } from './CreateClassroomForm'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { User, ClassroomTC } from '@/utils/types/firebase'

interface TeacherClassroomsViewProps {
  user: User
}

export function TeacherClassroomsView({ user }: TeacherClassroomsViewProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [classrooms, setClassrooms] = useState<ClassroomTC[]>([])

  useEffect(() => {
    const fetchClassroomData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      if (!user.classrooms || user.classrooms.length === 0) {
        setClassrooms([])
        setIsLoading(false)
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
              let curriculumData = undefined

              // Only fetch curriculum data for classrooms where user is the teacher
              if (classroomData.teacherId === user.uid) {
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
              }
              return null
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
        console.error('Error fetching classroom data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load classroom data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClassroomData()
  }, [user, toast])

  const handleStartLesson = async (classroomId: string) => {
    try {
      const classroomRef = doc(fireStore, 'classrooms', classroomId)

      // Update classroom to active session
      await updateDoc(classroomRef, {
        activeSession: true,
      })

      router.push(`/classroom/${classroomId}`)
    } catch (error) {
      console.error('Error starting lesson:', error)
      toast({
        title: 'Error',
        description: 'Failed to start lesson',
        variant: 'destructive',
      })
    }
  }

  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

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
            <CreateClassroomForm
              teacherId={user.uid}
              teacherSchool={user.school!}
            />
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
            <Card key={classroom.id}>
              <CardHeader>
                <CardTitle>{classroom.name}</CardTitle>
                <CardDescription>{classroom.curriculum?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600'>
                    Classroom Code: {classroom.classCode}
                  </p>
                  <p className='text-sm text-gray-600'>
                    Last taught: Week {classroom.lastTaughtWeek || 0}
                  </p>
                  <p className='text-sm text-gray-600'>
                    Students: {classroom.students?.length || 0}
                  </p>
                  <div
                    className={`text-sm ${
                      classroom.activeSession
                        ? 'text-green-600 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {classroom.activeSession
                      ? '● Session Active'
                      : '○ No Active Session'}
                  </div>
                  {classroom.curriculum?.weeks && (
                    <p className='text-sm text-blue-600'>
                      Total Weeks: {classroom.curriculum.weeks.length}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button
                  onClick={() => handleStartLesson(classroom.id)}
                  variant={classroom.activeSession ? 'default' : 'secondary'}
                >
                  <Play className='mr-2 h-4 w-4' />
                  {classroom.activeSession
                    ? 'Continue Session'
                    : 'Start Session'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
