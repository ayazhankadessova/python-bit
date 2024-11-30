'use client'
import React, { useState } from 'react'
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
import { User } from '@/utils/types/firebase'
import { ClassroomHeader } from '@/components/classrooms/ClassroomHeader'
import { EmptyClassrooms } from '@/components/classrooms/EmptyClassrooms'
import { ClassroomCard } from '@/components/classrooms/ClassroomCard'
import { ClassroomGrid } from '@/components/classrooms/ClassroomGrid'
import { ClassroomSearch } from '@/components/classrooms/ClassroomSearch'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useTeacherClassrooms } from '@/hooks/useTeacherClassrooms'
import { useJoinClassroom } from '@/hooks/classroom/useJoinClassroom'
import { useStartStudentLesson } from '@/hooks/classroom/useStartStudentLesson'

interface StudentClassroomsViewProps {
  user: User
}

export function StudentClassroomsView({ user }: StudentClassroomsViewProps) {
  const { classrooms, isLoading, error, mutate } = useTeacherClassrooms(
    user.uid
  )
  const { startLesson, isStarting } = useStartStudentLesson()
  const [searchTerm, setSearchTerm] = useState('')
  const [classroomCode, setClassroomCode] = useState('')
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)

  const { joinClassroom, isJoining } = useJoinClassroom(user.uid, () => {
    setIsJoinDialogOpen(false)
    setClassroomCode('')
    mutate()
  })

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
                <Button
                  onClick={() => joinClassroom(classroomCode)}
                  disabled={isJoining}
                >
                  {isJoining ? 'Joining...' : 'Join'}
                </Button>
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
                  onClick={() => startLesson(classroom.id)}
                  disabled={!classroom.activeSession || isStarting}
                >
                  {classroom.activeSession ? (
                    <>
                      <Play className='mr-2 h-4 w-4' />
                      {isStarting ? 'Joining...' : 'Join Session'}
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
