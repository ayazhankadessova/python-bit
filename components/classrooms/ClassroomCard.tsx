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
        <CardDescription>{classroom.curriculumName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {showClassCode && (
            <p className='text-muted-foreground'>
              Classroom Code: {classroom.classCode}
            </p>
          )}
          <p className='text-muted-foreground'>
            Last taught: Week {classroom.lastTaughtWeek || 0}
          </p>
          <p className='text-muted-foreground'>
            Students: {classroom.students?.length || 0}
          </p>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>{actionButton}</CardFooter>
    </Card>
  )
}
