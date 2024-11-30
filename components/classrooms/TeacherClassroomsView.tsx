'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { User, ClassroomTC } from '@/utils/types/firebase'
import { ClassroomHeader } from '@/components/classrooms/ClassroomHeader'
import { EmptyClassrooms } from '@/components/classrooms/EmptyClassrooms'
import { ClassroomCard } from '@/components/classrooms/ClassroomCard'
import { ClassroomGrid } from '@/components/classrooms/ClassroomGrid'
import { ClassroomSearch } from '@/components/classrooms/ClassroomSearch'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CreateClassroomForm } from '@/components/classrooms/CreateClassroomForm'

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

  if (isLoading) return <LoadingSpinner />

  return (
    <div className='container mx-auto p-6'>
      <ClassroomHeader title='My Classrooms' />

      <ClassroomSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actionButton={
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
        }
      />

      {filteredClassrooms.length === 0 ? (
        <EmptyClassrooms userRole='teacher' />
      ) : (
        <ClassroomGrid
          classrooms={filteredClassrooms}
          renderCard={(classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              showClassCode={true}
              actionButton={
                <Button
                  onClick={() => handleStartLesson(classroom.id)}
                  variant={classroom.activeSession ? 'default' : 'secondary'}
                >
                  <Play className='mr-2 h-4 w-4' />
                  {classroom.activeSession
                    ? 'Continue Session'
                    : 'Start Session'}
                </Button>
              }
            />
          )}
        />
      )}
    </div>
  )
}
