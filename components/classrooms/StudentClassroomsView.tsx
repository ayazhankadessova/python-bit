'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
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
import { ClassroomHeader } from '@/components/classrooms/ClassroomHeader'
import { EmptyClassrooms } from '@/components/classrooms/EmptyClassrooms'
import { ClassroomCard } from '@/components/classrooms/ClassroomCard'
import { ClassroomGrid } from '@/components/classrooms/ClassroomGrid'
import { ClassroomSearch } from '@/components/classrooms/ClassroomSearch'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface StudentClassroomsViewProps {
  user: User
}

export function StudentClassroomsView({ user }: StudentClassroomsViewProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [classrooms, setClassrooms] = useState<ClassroomTC[]>([])
  const [classroomCode, setClassroomCode] = useState('')
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)

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

  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <div className='container mx-auto p-6'>
      <ClassroomHeader title='My Enrolled Classrooms' />

      <ClassroomSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actionButton={
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
        }
      />

      {filteredClassrooms.length === 0 ? (
        <EmptyClassrooms userRole='student' />
      ) : (
        <ClassroomGrid
          classrooms={filteredClassrooms}
          renderCard={(classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              actionButton={
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
              }
            />
          )}
        />
      )}
    </div>
  )
}
