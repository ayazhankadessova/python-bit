import { ClassroomTC } from '@/utils/types/firebase'

interface ClassroomGridProps {
  classrooms: ClassroomTC[]
  renderCard: (classroom: ClassroomTC) => React.ReactNode
}

export function ClassroomGrid({ classrooms, renderCard }: ClassroomGridProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {classrooms.map((classroom) => renderCard(classroom))}
    </div>
  )
}
