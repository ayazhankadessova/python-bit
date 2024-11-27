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
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { User, ClassroomTC } from '@/utils/types/firebase'

interface StudentClassroomsViewProps {
  user: User
}

export function StudentClassroomsView({ user }: StudentClassroomsViewProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [classroomCode, setClassroomCode] = useState('')
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
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

  const handleJoinClassroom = async () => {
    try {
      const classroomQuery = query(
        collection(fireStore, 'classrooms'),
        where('classCode', '==', classroomCode.toUpperCase())
      )

      const classroomSnap = await getDocs(classroomQuery)

      if (classroomSnap.empty) {
        toast({
          title: 'Error',
          description: 'Invalid classroom code',
          variant: 'destructive',
        })
        return
      }

      const classroom = classroomSnap.docs[0]

      if (user.classrooms?.includes(classroom.id)) {
        toast({
          title: 'Error',
          description: 'You are already enrolled in this classroom',
          variant: 'destructive',
        })
        return
      }

      // Update classroom's students array
      await updateDoc(doc(fireStore, 'classrooms', classroom.id), {
        students: arrayUnion(user.uid),
      })

      // Update user's classrooms array
      const userRef = doc(fireStore, 'users', user.uid)
      await updateDoc(userRef, {
        classrooms: arrayUnion(classroom.id),
      })

      toast({
        title: 'Success',
        description: 'Successfully joined classroom',
      })

      setIsJoinDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Error joining classroom:', error)
      toast({
        title: 'Error',
        description: 'Failed to join classroom',
        variant: 'destructive',
      })
    }
  }

  const handleStartLesson = async (classroomId: string) => {
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
        <h1 className='text-3xl font-bold'>My Enrolled Classrooms</h1>
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

        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Join Classroom
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-white'>
            <DialogHeader>
              <DialogTitle>Join Classroom</DialogTitle>
              <DialogDescription>
                Enter the classroom code provided by your teacher.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder='Enter classroom code'
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleJoinClassroom}>Join</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filteredClassrooms.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-500'>
            No classrooms found. Join a classroom to get started!
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredClassrooms.map((classroom) => (
            <Card key={classroom.id}>
              <CardHeader>
                <CardTitle>{classroom.name}</CardTitle>
                <CardDescription>{classroom.curriculumName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
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
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button
                  onClick={() => handleStartLesson(classroom.id)}
                  disabled={!classroom.activeSession}
                >
                  {classroom.activeSession ? (
                    <>
                      <Play className='mr-2 h-4 w-4' /> Join Session
                    </>
                  ) : (
                    'Waiting for teacher'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
