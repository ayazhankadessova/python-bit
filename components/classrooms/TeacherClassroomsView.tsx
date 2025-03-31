'use client'
import React, { useState} from 'react'
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
import { useClassrooms } from '@/hooks/useClassrooms'
import { useStartLesson } from '@/hooks/useStartLesson'
import { User } from '@/types/firebase'
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
  const { classrooms, isLoading, error } = useClassrooms(user.uid)
  const { startLesson, isStarting } = useStartLesson()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className='text-center py-10'>
        <p className='text-destructive'>Failed to load classrooms</p>
      </div>
    )
  }

  return (
    <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8 pt-8 mb-16'>
      <ClassroomHeader title='My Classrooms' />
      <ClassroomSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actionButton={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='softTeal'>
                <Plus className='mr-2 h-4 w-4' /> Create New Classroom
              </Button>
            </DialogTrigger>
            <DialogContent className='bg-primary-foreground'>
              <DialogHeader>
                <DialogTitle>Create New Classroom</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new classroom.
                </DialogDescription>
              </DialogHeader>
              <CreateClassroomForm
                teacherId={user.uid}
                teacherSchool={user.school}
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
              role='teacher'
              actionButton={
                <Button
                  variant='softBlue'
                  onClick={() => startLesson(classroom.id)}
                  disabled={isStarting}
                >
                  <Play className='mr-2 h-4 w-4' />
                  Enter Classroom
                </Button>
              }
            />
          )}
        />
      )}
    </div>
  )
}
