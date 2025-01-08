import { ClassroomTC } from '@/types/firebase'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

interface ClassroomCardProps {
  classroom: ClassroomTC
  actionButton: React.ReactNode
  showClassCode?: boolean
}

export function ClassroomCard({
  classroom,
  actionButton,
  showClassCode,
}: ClassroomCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{classroom.name}</CardTitle>
        <CardDescription>
          {classroom.curriculumName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {showClassCode && (
            <p className='text-sm text-gray-600'>
              Classroom Code: {classroom.classCode}
            </p>
          )}
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
          {/* {classroom.curriculum?.weeks && (
            <p className='text-sm text-blue-600'>
              Total Weeks: {classroom.curriculum.weeks.length}
            </p>
          )} */}
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>{actionButton}</CardFooter>
    </Card>
  )
}
