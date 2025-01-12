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
import { useTeacherClassrooms } from '@/hooks/useTeacherClassrooms'
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
  const { classrooms, isLoading, error } = useTeacherClassrooms(user.uid)
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
    <div className='container mx-auto p-6'>
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
              showClassCode={true}
              actionButton={
                <Button
                  onClick={() => startLesson(classroom.id)}
                  disabled={isStarting}
                >
                  <Play className='mr-2 h-4 w-4' />
                  {'Enter Classroom'}
                </Button>
              }
            />
          )}
        />
      )}
    </div>
  )
}
