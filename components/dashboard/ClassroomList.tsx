import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClassroomTC } from '@/types/firebase'
import { Play } from 'lucide-react'

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
    return <p className='text-sm text-gray-500'>No classrooms available</p>
  }

  return (
    <div className='space-y-4'>
      {classrooms.map((classroom) => (
        <Card key={classroom.id} className='p-4'>
          <div className='space-y-2'>
            <h3 className='font-semibold'>{classroom.name}</h3>
            <p className='text-sm text-gray-500'>
              Program: {classroom.curriculumName || 'N/A'}
            </p>
            <div className='flex justify-between items-center'>
              <Button onClick={() => onJoinClassroom(classroom.id)}>
                <Play className='mr-2 h-4 w-4' />
                Enter {userRole === 'teacher' ? 'Classroom' : 'Session'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
