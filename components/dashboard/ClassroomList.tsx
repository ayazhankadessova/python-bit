// ClassroomList.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { ClassroomTC } from '@/types/firebase'
import { ClassroomCard } from '@/components/classrooms/ClassroomCard'

interface ClassroomListProps {
  classrooms: ClassroomTC[]
  onJoinClassroom: (id: string) => void
  userRole: 'teacher' | 'student'
}

export function ClassroomList({
  classrooms,
  onJoinClassroom,
  userRole,
}: ClassroomListProps) {
  if (classrooms.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>No classrooms available</p>
    )
  }

  return (
    <div className='space-y-4'>
      {classrooms.map((classroom) => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          actionButton={
            <Button
              variant='softBlue'
              onClick={() => onJoinClassroom(classroom.id)}
            >
              <Play className='mr-2 h-4 w-4' />
              Enter {userRole === 'teacher' ? 'Classroom' : 'Session'}
            </Button>
          }
        />
      ))}
    </div>
  )
}
