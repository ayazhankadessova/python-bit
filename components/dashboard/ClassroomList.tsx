import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClassroomTC } from '@/types/firebase'

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
              <span
                className={`text-sm ${
                  classroom.activeSession ? 'text-green-500' : 'text-gray-500'
                }`}
              >
                {classroom.activeSession
                  ? 'Active Session'
                  : 'No Active Session'}
              </span>
              <Button
                onClick={() => onJoinClassroom(classroom.id)}
                disabled={userRole === 'student' && !classroom.activeSession}
              >
                Join {userRole === 'teacher' ? 'Class' : 'Session'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
